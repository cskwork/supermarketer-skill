import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { certifyReady, validateResults } from '../lib/workflow.mjs';
import { addValidMeasurement, createValidCopyVault } from './helpers/fixture.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BIN = path.join(ROOT, 'bin', 'supermarketer.mjs');

function run(args) {
  return spawnSync(process.execPath, [BIN, ...args], { cwd: ROOT, encoding: 'utf8' });
}

test('CLI route emits machine-readable bilingual routing output', () => {
  const result = run(['route', '제품 출시 포스터와 15초 영상을 만든다', '--json']);
  assert.equal(result.status, 0, result.stderr);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.mode, 'LAUNCH-KIT');
  assert.equal(parsed.specialty, 'launch');
  assert.match(parsed.specialty_reference, /vendor\/marketingskills\/skills\/launch\/SKILL\.md$/);
});

test('CLI accepts an exact specialty override independently from mode', () => {
  const result = run(['route', 'Audit pricing.', '--mode', 'AUDIT', '--specialty', 'pricing', '--json']);
  assert.equal(result.status, 0, result.stderr);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.mode, 'AUDIT');
  assert.equal(parsed.specialty, 'pricing');

  const invalid = run(['route', 'Audit pricing.', '--specialty', 'Pricing', '--json']);
  assert.equal(invalid.status, 1);
  assert.match(JSON.parse(invalid.stdout).error, /Unknown specialty/);
});

test('CLI verify-ready and status distinguish valid from tampered certification', () => {
  const { vault } = createValidCopyVault();
  certifyReady(vault);

  const valid = run(['verify-ready', vault, '--json']);
  assert.equal(valid.status, 0, valid.stderr);
  assert.equal(JSON.parse(valid.stdout).ok, true);
  const status = run(['status', vault, '--json']);
  assert.equal(JSON.parse(status.stdout).z_ready_valid, true);

  const postCertificationCheck = run(['check', '--json', vault]);
  assert.equal(postCertificationCheck.status, 0, postCertificationCheck.stderr);
  assert.match(JSON.parse(postCertificationCheck.stdout).report_path, /gate-report-latest\.json$/);
  const stillValid = run(['verify-ready', '--json', vault]);
  assert.equal(stillValid.status, 0, stillValid.stderr);
  assert.equal(JSON.parse(stillValid.stdout).ok, true);

  fs.appendFileSync(path.join(vault, 'reports/gate-report.json'), ' ');
  const invalid = run(['verify-ready', vault, '--json']);
  assert.equal(invalid.status, 1);
  assert.equal(JSON.parse(invalid.stdout).ok, false);
  const invalidStatus = run(['status', vault, '--json']);
  assert.equal(JSON.parse(invalidStatus.stdout).z_ready_valid, false);
});


test('CLI boolean flags work before positional arguments and verify-results checks performance attestation', () => {
  const routed = run(['route', '--json', '제품 출시 포스터와 영상을 만든다']);
  assert.equal(routed.status, 0, routed.stderr);
  assert.equal(JSON.parse(routed.stdout).mode, 'LAUNCH-KIT');

  const { vault } = createValidCopyVault();
  certifyReady(vault);
  addValidMeasurement(vault);
  validateResults(vault);

  const verified = run(['verify-results', '--json', vault]);
  assert.equal(verified.status, 0, verified.stderr);
  assert.equal(JSON.parse(verified.stdout).ok, true);
});
