import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRun, initProject } from '../lib/scaffold.mjs';
import { makeTempDir } from './helpers/fixture.mjs';

test('initProject is additive and preserves standing files', () => {
  const root = makeTempDir();
  const first = initProject(root);
  assert.ok(first.created.length >= 5);
  const brand = path.join(root, '.supermarketer/brand/BRAND.md');
  fs.writeFileSync(brand, 'custom brand truth\n');
  const second = initProject(root);
  assert.equal(fs.readFileSync(brand, 'utf8'), 'custom brand truth\n');
  assert.equal(second.created.length, 0);
});

test('createRun writes a mode-specific vault and preserves the original objective', () => {
  const root = makeTempDir();
  const result = createRun('Create a launch poster and short video.', { project: root, mode: 'LAUNCH-KIT', now: new Date('2026-07-12T09:00:00Z') });
  assert.ok(fs.existsSync(path.join(result.vault, 'BRIEF.md')));
  assert.ok(fs.existsSync(path.join(result.vault, 'CREATIVE-BRIEF.md')));
  assert.match(fs.readFileSync(path.join(result.vault, 'BRIEF.md'), 'utf8'), /Create a launch poster and short video\./);
});

test('createRun persists specialist metadata and both playbooks without competing product truth', () => {
  const root = makeTempDir();
  const result = createRun('Audit our SaaS pricing tiers.', {
    project: root,
    mode: 'AUDIT',
    specialty: 'pricing',
    now: new Date('2026-07-15T09:00:00Z'),
  });
  const state = JSON.parse(fs.readFileSync(path.join(result.vault, 'run-state.json'), 'utf8'));
  const run = fs.readFileSync(path.join(result.vault, 'RUN.md'), 'utf8');
  const brief = fs.readFileSync(path.join(result.vault, 'BRIEF.md'), 'utf8');
  assert.equal(state.mode, 'AUDIT');
  assert.equal(state.specialty, 'pricing');
  assert.equal(state.specialty_reference, 'vendor/marketingskills/skills/pricing/SKILL.md');
  assert.match(run, /Mode playbook: `reference\/qa\.md`/);
  assert.match(run, /Specialist playbook: `vendor\/marketingskills\/skills\/pricing\/SKILL\.md`/);
  assert.match(brief, /## Specialty\s+pricing/);
  assert.ok(fs.existsSync(path.join(root, '.supermarketer/product/PRODUCT-TRUTH.md')));
  assert.ok(fs.existsSync(path.join(root, '.supermarketer/brand/BRAND.md')));
  assert.equal(fs.existsSync(path.join(root, '.agents/product-marketing.md')), false);
});
