import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gateReferenceIntegrity } from '../lib/gates/reference-integrity.mjs';
import { gateSkillFrontmatter } from '../lib/gates/skill-frontmatter.mjs';
import fs from 'node:fs';
import os from 'node:os';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('distributed skill has valid frontmatter and internal references', () => {
  const frontmatter = gateSkillFrontmatter(path.join(root, 'SKILL.md'));
  const references = gateReferenceIntegrity(root);
  assert.equal(frontmatter.ok, true, JSON.stringify(frontmatter.errors, null, 2));
  assert.equal(references.ok, true, JSON.stringify(references.errors, null, 2));
});

test('first-party link integrity still rejects missing references outside the vendor snapshot', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'supermarketer-reference-gate-'));
  fs.cpSync(root, temp, { recursive: true, filter: (source) => !source.includes(`${path.sep}.git`) });
  fs.writeFileSync(path.join(temp, 'BROKEN.md'), '[missing](reference/does-not-exist.md)\n');
  const references = gateReferenceIntegrity(temp);
  assert.equal(references.ok, false);
  assert.ok(references.errors.some((error) => error.location === 'BROKEN.md'));
});

test('first-party link integrity delegates exact vendor examples to the vendor gate', () => {
  const references = gateReferenceIntegrity(root);
  assert.equal(references.ok, true, JSON.stringify(references.errors, null, 2));
  assert.ok(references.checks.some((check) => check.message.includes('vendor/marketingskills')));
});
