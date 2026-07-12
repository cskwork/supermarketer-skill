import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { certifyReady, getRunStatus } from '../lib/workflow.mjs';
import { packageRun } from '../lib/package-run.mjs';
import { sha256File } from '../lib/utils.mjs';
import { createValidCopyVault } from './helpers/fixture.mjs';

test('certifyReady creates a durable marker whose report hash is current', () => {
  const { vault } = createValidCopyVault();
  const result = certifyReady(vault);
  assert.equal(result.report.ok, true);
  assert.ok(fs.existsSync(result.marker));
  const marker = fs.readFileSync(result.marker, 'utf8');
  const currentHash = sha256File(path.join(vault, 'reports/gate-report.json'));
  assert.match(marker, new RegExp(currentHash));
  const status = getRunStatus(vault);
  assert.equal(status.readiness, 'LAUNCH_READY');
  assert.equal(status.performance, 'NOT_MEASURED');
  assert.equal(status.external_action_authorized, false);
});

test('packages only a certified run and emits ZIP plus SHA-256 sidecar', () => {
  const { root, vault } = createValidCopyVault();
  certifyReady(vault);
  const output = path.join(root, 'delivery.zip');
  const result = packageRun(vault, output);
  assert.ok(fs.existsSync(output));
  assert.ok(fs.existsSync(`${output}.sha256`));
  assert.equal(fs.readFileSync(output).subarray(0, 4).toString('hex'), '504b0304');
  assert.equal(result.sha256, sha256File(output));
});

test('package manifest excludes its own mutable hash on repeated packaging', () => {
  const { root, vault } = createValidCopyVault();
  certifyReady(vault);
  packageRun(vault, path.join(root, 'delivery-1.zip'));
  packageRun(vault, path.join(root, 'delivery-2.zip'));
  const packageManifest = JSON.parse(fs.readFileSync(path.join(vault, 'reports/PACKAGE-MANIFEST.json'), 'utf8'));
  assert.equal(packageManifest.manifest_excludes_itself, true);
  assert.equal(packageManifest.files.some((entry) => entry.path === 'reports/PACKAGE-MANIFEST.json'), false);
});
