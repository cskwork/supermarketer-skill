import test from 'node:test';
import assert from 'node:assert/strict';
import { parseYaml, stringifyYaml } from '../lib/yaml-lite.mjs';

test('yaml-lite round-trips supported nested maps, arrays, booleans, nulls, and multiline strings', () => {
  const source = {
    schema_version: '1.0',
    run: { id: 'RUN-001', ok: true, limit: 12, empty: null },
    items: [{ id: 'A-1', tags: ['one', 'two'], note: 'line one\nline two' }],
  };
  const output = stringifyYaml(source);
  assert.deepEqual(parseYaml(output), source);
});

test('yaml-lite rejects duplicate keys and unsafe indentation', () => {
  assert.throws(() => parseYaml('a: 1\na: 2\n'), /Duplicate YAML key/);
  assert.throws(() => parseYaml('a:\n    b: 1\n  c: 2\n'), /Unexpected indentation|Could not parse/);
});
