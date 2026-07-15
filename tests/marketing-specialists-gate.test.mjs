import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gateMarketingSpecialists } from '../lib/gates/marketing-specialists.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function copyVendor() {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'supermarketer-vendor-gate-'));
  fs.cpSync(path.join(ROOT, 'vendor', 'marketingskills'), path.join(temp, 'vendor', 'marketingskills'), { recursive: true });
  return temp;
}

function updateManifest(root, update) {
  const file = path.join(root, 'vendor', 'marketingskills', 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
  update(manifest);
  fs.writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

test('vendored MarketingSkills snapshot matches source, catalog, frontmatter, and hashes', () => {
  const result = gateMarketingSpecialists(ROOT);
  assert.equal(result.ok, true, JSON.stringify(result.errors, null, 2));
  assert.ok(result.checks.some((check) => /47 specialist/.test(check.message)));
});

test('vendored MarketingSkills gate rejects direct and coordinated manifest tampering', () => {
  const direct = copyVendor();
  const directTarget = path.join(direct, 'vendor', 'marketingskills', 'skills', 'pricing', 'SKILL.md');
  fs.appendFileSync(directTarget, '\ntampered\n');

  const provenance = copyVendor();
  updateManifest(provenance, (manifest) => {
    manifest.source_url = 'https://example.invalid/marketingskills/tree/tampered';
    manifest.canonical_origin = 'https://example.invalid/marketingskills.git';
  });

  const omittedReference = copyVendor();
  const omitted = 'skills/ab-testing/references/sample-size-guide.md';
  fs.unlinkSync(path.join(omittedReference, 'vendor', 'marketingskills', omitted));
  updateManifest(omittedReference, (manifest) => {
    manifest.files = manifest.files.filter((entry) => entry.path !== omitted);
    manifest.counts.references -= 1;
    manifest.counts.files -= 1;
  });

  const rewrittenContent = copyVendor();
  const rewritten = 'skills/pricing/SKILL.md';
  const target = path.join(rewrittenContent, 'vendor', 'marketingskills', rewritten);
  fs.appendFileSync(target, '\ncoordinated rewrite\n');
  updateManifest(rewrittenContent, (manifest) => {
    manifest.files.find((entry) => entry.path === rewritten).sha256 = sha256(target);
  });

  const results = {
    direct: gateMarketingSpecialists(direct),
    provenance: gateMarketingSpecialists(provenance),
    omittedReference: gateMarketingSpecialists(omittedReference),
    rewrittenContent: gateMarketingSpecialists(rewrittenContent),
  };
  assert.equal(results.direct.ok, false);
  assert.ok(results.direct.errors.some((error) => error.code === 'VENDOR_HASH_MISMATCH'));
  for (const result of [results.provenance, results.omittedReference, results.rewrittenContent]) {
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((error) => error.code === 'VENDOR_MANIFEST_DIGEST'));
  }
});
