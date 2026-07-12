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
