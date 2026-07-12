import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { certifyReady, issuePublishPermit } from '../lib/workflow.mjs';
import { createValidCopyVault } from './helpers/fixture.mjs';
import { writeYamlAtomic } from '../lib/yaml-lite.mjs';

test('publish-check refuses absent or implicit approval', () => {
  const { vault } = createValidCopyVault();
  certifyReady(vault);
  assert.throws(() => issuePublishPermit(vault, 'AP-404'), /Publish gate failed/);
});

test('publish-check issues a scoped permit but executes no external action', () => {
  const { vault } = createValidCopyVault();
  certifyReady(vault);
  const now = new Date();
  writeYamlAtomic(path.join(vault, 'APPROVALS.yaml'), {
    schema_version: '1.0',
    approvals: [{
      id: 'AP-001', type: 'publish', decision: 'approved', recorded_from: 'user_explicit',
      user_quote: 'Publish ASSET-001 to the lifecycle workspace in the approved window.', approver: 'Campaign Owner',
      approved_at: now.toISOString(), expires_at: new Date(now.getTime() + 86400000).toISOString(), actions: ['publish'],
      asset_ids: ['ASSET-001'], destination: 'Lifecycle email workspace / draft slot', account: 'workspace-123', timing: '2026-07-13 09:00 Asia/Seoul',
    }],
  });
  const result = issuePublishPermit(vault, 'AP-001');
  assert.ok(fs.existsSync(result.permit));
  const permit = JSON.parse(fs.readFileSync(result.permit, 'utf8'));
  assert.deepEqual(permit.actions, ['publish']);
  assert.match(permit.note, /does not execute/);
});

test('assistant-authored approval and expired approval are rejected', () => {
  const { vault } = createValidCopyVault();
  certifyReady(vault);
  const now = new Date();
  writeYamlAtomic(path.join(vault, 'APPROVALS.yaml'), {
    schema_version: '1.0', approvals: [{ id: 'AP-002', type: 'publish', decision: 'approved', recorded_from: 'assistant_inferred', user_quote: 'okay', approver: 'assistant', approved_at: new Date(now.getTime() - 172800000).toISOString(), expires_at: new Date(now.getTime() - 86400000).toISOString(), actions: ['publish'], asset_ids: ['ASSET-001'], destination: 'x', account: 'y', timing: 'z' }],
  });
  assert.throws(() => issuePublishPermit(vault, 'AP-002'), /Publish gate failed/);
});
