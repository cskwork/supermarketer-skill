import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { runReadinessGates } from '../lib/gates/aggregate.mjs';
import { gateManifest } from '../lib/gates/manifest.mjs';
import { gateClaims } from '../lib/gates/claims.mjs';
import { gateReviews } from '../lib/gates/reviews.mjs';
import { gateChannelSpecs } from '../lib/gates/channel.mjs';
import { createValidCopyVault } from './helpers/fixture.mjs';
import { readYaml, writeYamlAtomic } from '../lib/yaml-lite.mjs';

test('a grounded, independently reviewed COPY vault passes every readiness gate', () => {
  const { vault, at } = createValidCopyVault();
  const report = runReadinessGates(vault, { forReady: true, now: at, writeReport: false });
  assert.equal(report.ok, true, JSON.stringify(report.errors, null, 2));
  assert.equal(report.summary.passed, report.summary.gates);
});

test('unknown evidence references fail the claims gate', () => {
  const { vault, at } = createValidCopyVault();
  const claims = readYaml(path.join(vault, 'CLAIMS.yaml'));
  claims.claims[0].evidence_ids = ['P-999'];
  writeYamlAtomic(path.join(vault, 'CLAIMS.yaml'), claims);
  const result = gateClaims(vault, { forReady: true, now: at });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((entry) => entry.code === 'CLAIM_EVIDENCE_UNKNOWN'));
});

test('missing files and path traversal fail the manifest gate', () => {
  const { vault, at } = createValidCopyVault();
  const manifest = readYaml(path.join(vault, 'ASSET-MANIFEST.yaml'));
  manifest.assets[0].rendered_path = '../outside.md';
  writeYamlAtomic(path.join(vault, 'ASSET-MANIFEST.yaml'), manifest);
  const result = gateManifest(vault, { forReady: true, now: at });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((entry) => entry.code === 'PATH_UNSAFE'));
});

test('a producer cannot review or approve their own asset', () => {
  const { vault, at } = createValidCopyVault();
  const reviews = readYaml(path.join(vault, 'REVIEWS.yaml'));
  reviews.reviews[1].reviewer = 'Copy Producer';
  writeYamlAtomic(path.join(vault, 'REVIEWS.yaml'), reviews);
  const result = gateReviews(vault, { forReady: true, now: at });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((entry) => entry.code === 'REVIEW_SELF_APPROVAL'));
});

test('stale channel requirements fail readiness', () => {
  const { vault, at } = createValidCopyVault();
  const specs = readYaml(path.join(vault, 'CHANNEL-SPECS.yaml'));
  specs.channels[0].checked_at = '2020-01-01';
  specs.channels[0].max_age_days = 30;
  writeYamlAtomic(path.join(vault, 'CHANNEL-SPECS.yaml'), specs);
  const result = gateChannelSpecs(vault, { forReady: true, now: at });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((entry) => entry.code === 'CHANNEL_STALE'));
});

test('video production-pack fallback cannot claim a rendered video', () => {
  const { vault, at } = createValidCopyVault();
  const manifest = readYaml(path.join(vault, 'ASSET-MANIFEST.yaml'));
  const asset = manifest.assets[0];
  asset.kind = 'video';
  asset.status = 'production_pack_only';
  asset.fallback_status = 'PRODUCTION_PACK_ONLY';
  asset.production_pack_id = 'PK-001';
  asset.fallback_accepted_by = 'Campaign Owner';
  asset.fallback_accepted_at = at.toISOString();
  asset.rendered_path = 'assets/as-001/copy.md';
  asset.channel_spec_required = false;
  writeYamlAtomic(path.join(vault, 'ASSET-MANIFEST.yaml'), manifest);
  writeYamlAtomic(path.join(vault, 'PRODUCTION-PACK.yaml'), {
    schema_version: '1.0',
    packs: [{ id: 'PK-001', asset_id: 'ASSET-001', type: 'video', accepted_by: 'Campaign Owner', accepted_at: at.toISOString(),
      script_path: 'assets/as-001/copy.md', storyboard_path: 'assets/as-001/copy.md', shot_list_path: 'assets/as-001/copy.md', voiceover_path: 'assets/as-001/copy.md', on_screen_text_path: 'assets/as-001/copy.md', captions_path: 'assets/as-001/fake.srt', prompt_pack_path: 'assets/as-001/copy.md', source_asset_list_path: 'assets/as-001/copy.md', edit_plan_path: 'assets/as-001/copy.md', output_spec_path: 'assets/as-001/copy.md' }],
  });
  fs.writeFileSync(path.join(vault, 'assets/as-001/fake.srt'), '1\n00:00:00,000 --> 00:00:01,000\nText\n');
  const result = gateManifest(vault, { forReady: true, now: at });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((entry) => entry.code === 'VIDEO_FAKE_RENDER'));
});

test('symbolic-link paths cannot bypass the vault boundary', { skip: process.platform === 'win32' }, () => {
  const { root, vault, at } = createValidCopyVault();
  const outside = path.join(root, 'outside-product.md');
  fs.writeFileSync(outside, '# outside\n');
  const governed = path.join(vault, 'sources/product.md');
  fs.rmSync(governed);
  fs.symlinkSync(outside, governed);

  const report = runReadinessGates(vault, { forReady: true, now: at, writeReport: false });
  assert.equal(report.ok, false);
  assert.ok(report.errors.some((entry) => entry.code === 'PATH_SYMLINK'));
});

test('top-level governed files cannot be symbolic links', { skip: process.platform === 'win32' }, () => {
  const { root, vault, at } = createValidCopyVault();
  const manifestPath = path.join(vault, 'ASSET-MANIFEST.yaml');
  const outside = path.join(root, 'outside-manifest.yaml');
  fs.copyFileSync(manifestPath, outside);
  fs.rmSync(manifestPath);
  fs.symlinkSync(outside, manifestPath);

  const report = runReadinessGates(vault, { forReady: true, now: at, writeReport: false });
  assert.equal(report.ok, false);
  assert.ok(report.errors.some((entry) => ['RUN_FILE_SYMLINK', 'FILE_SYMLINK'].includes(entry.code)));
});
