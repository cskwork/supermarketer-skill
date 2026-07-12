import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { auditInstall } from '../lib/install-audit.mjs';
import { makeTempDir } from './helpers/fixture.mjs';

test('install audit distinguishes identical copies from drifted copies', () => {
  const source = makeTempDir('sm-source-');
  fs.writeFileSync(path.join(source, 'SKILL.md'), '---\nname: test-skill\ndescription: test\n---\n');
  fs.writeFileSync(path.join(source, 'a.txt'), 'one\n');
  const target = makeTempDir('sm-target-');
  fs.rmSync(target, { recursive: true, force: true });
  fs.cpSync(source, target, { recursive: true });
  let result = auditInstall(source, [target]);
  assert.equal(result.results[0].status, 'copied-clean');
  fs.writeFileSync(path.join(target, 'a.txt'), 'two\n');
  result = auditInstall(source, [target]);
  assert.equal(result.results[0].status, 'drifted');
});
