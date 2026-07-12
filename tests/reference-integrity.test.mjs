import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gateReferenceIntegrity } from '../lib/gates/reference-integrity.mjs';
import { gateSkillFrontmatter } from '../lib/gates/skill-frontmatter.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('distributed skill has valid frontmatter and internal references', () => {
  const frontmatter = gateSkillFrontmatter(path.join(root, 'SKILL.md'));
  const references = gateReferenceIntegrity(root);
  assert.equal(frontmatter.ok, true, JSON.stringify(frontmatter.errors, null, 2));
  assert.equal(references.ok, true, JSON.stringify(references.errors, null, 2));
});
