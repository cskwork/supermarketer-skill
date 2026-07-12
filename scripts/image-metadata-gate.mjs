#!/usr/bin/env node
import process from 'node:process';
import { inspectImage } from '../lib/media/image.mjs';
import { parseDimensions } from '../lib/utils.mjs';
const args = process.argv.slice(2);
const file = args[0];
if (!file) throw new Error('Usage: image-metadata-gate.mjs <file> [--expected WIDTHxHEIGHT]');
const expectedIndex = args.indexOf('--expected');
const metadata = inspectImage(file);
let ok = true;
const errors = [];
if (expectedIndex >= 0) {
  const expected = parseDimensions(args[expectedIndex + 1]);
  if (!expected) throw new Error('--expected must use WIDTHxHEIGHT.');
  if (metadata.width !== expected.width || metadata.height !== expected.height) {
    ok = false;
    errors.push(`Expected ${expected.width}x${expected.height}, got ${metadata.dimensions}.`);
  }
}
console.log(JSON.stringify({ ok, metadata, errors }, null, 2));
process.exitCode = ok ? 0 : 1;
