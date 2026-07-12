import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { verifyReadinessAttestation } from '../lib/attestation.mjs';
import { packageRun } from '../lib/package-run.mjs';
import { certifyReady, issuePublishPermit } from '../lib/workflow.mjs';
import { writeYamlAtomic } from '../lib/yaml-lite.mjs';
import { createValidCopyVault } from './helpers/fixture.mjs';

function addPublishApproval(vault, now = new Date()) {
  writeYamlAtomic(path.join(vault, 'APPROVALS.yaml'), {
    schema_version: '1.0',
    approvals: [{
      id: 'AP-001',
      type: 'publish',
      decision: 'approved',
      recorded_from: 'user_explicit',
      user_quote: 'Publish ASSET-001 to the approved workspace.',
      approver: 'Campaign Owner',
      approved_at: now.toISOString(),
      expires_at: new Date(now.getTime() + 86_400_000).toISOString(),
      actions: ['publish'],
      asset_ids: ['ASSET-001'],
      destination: 'Lifecycle email workspace / draft slot',
      account: 'workspace-123',
      timing: 'approved window',
    }],
  });
}

test('readiness attestation verifies the marker and exact gate-report hash', () => {
  const { vault } = createValidCopyVault();
  certifyReady(vault);
  const valid = verifyReadinessAttestation(vault);
  assert.equal(valid.ok, true, JSON.stringify(valid.errors, null, 2));

  fs.appendFileSync(path.join(vault, 'reports/gate-report.json'), '\n');
  const tampered = verifyReadinessAttestation(vault);
  assert.equal(tampered.ok, false);
  assert.ok(tampered.errors.some((entry) => entry.code === 'READY_REPORT_HASH_MISMATCH'));
});

test('tampered readiness reports block packaging and publish permits', () => {
  const { root, vault } = createValidCopyVault();
  certifyReady(vault);
  addPublishApproval(vault);
  fs.appendFileSync(path.join(vault, 'reports/gate-report.json'), ' ');

  assert.throws(() => packageRun(vault, path.join(root, 'tampered.zip')), /Package gate failed/);
  assert.throws(() => issuePublishPermit(vault, 'AP-001'), /Publish gate failed/);
});


test('certified asset changes are detected even when the gate report itself is unchanged', () => {
  const { root, vault } = createValidCopyVault();
  certifyReady(vault);
  addPublishApproval(vault);
  fs.appendFileSync(path.join(vault, 'assets/as-001/copy.md'), '\nChanged after review.\n');

  const verification = verifyReadinessAttestation(vault);
  assert.equal(verification.ok, false);
  assert.ok(verification.errors.some((entry) => entry.code === 'READY_INTEGRITY_HASH_MISMATCH'));
  assert.throws(() => packageRun(vault, path.join(root, 'changed.zip')), /Package gate failed/);
  assert.throws(() => issuePublishPermit(vault, 'AP-001'), /Publish gate failed/);
});

test('files added after readiness are rejected unless explicitly covered by a post-launch attestation', () => {
  const { root, vault } = createValidCopyVault();
  certifyReady(vault);
  fs.writeFileSync(path.join(vault, 'assets', 'unreviewed-extra.txt'), 'not part of the certified file set\n');

  const verification = verifyReadinessAttestation(vault);
  assert.equal(verification.ok, false);
  assert.ok(verification.errors.some((entry) => entry.code === 'READY_INTEGRITY_UNEXPECTED_FILE'));
  assert.throws(() => packageRun(vault, path.join(root, 'unexpected-file.zip')), /Package gate failed/);
});
