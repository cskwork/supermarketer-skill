#!/usr/bin/env node
import process from 'node:process';
import { inspectVideo } from '../lib/media/video.mjs';
import { parseDimensions } from '../lib/utils.mjs';
const args = process.argv.slice(2);
const file = args[0];
if (!file) throw new Error('Usage: video-metadata-gate.mjs <file> [--expected WIDTHxHEIGHT] [--max-duration SECONDS]');
const metadata = inspectVideo(file);
let ok = true;
const errors = [];
const expectedIndex = args.indexOf('--expected');
if (expectedIndex >= 0) {
  const expected = parseDimensions(args[expectedIndex + 1]);
  if (!expected) throw new Error('--expected must use WIDTHxHEIGHT.');
  if (metadata.width !== expected.width || metadata.height !== expected.height) {
    ok = false;
    errors.push(`Expected ${expected.width}x${expected.height}, got ${metadata.dimensions}.`);
  }
}
const durationIndex = args.indexOf('--max-duration');
if (durationIndex >= 0 && metadata.duration_seconds > Number(args[durationIndex + 1])) {
  ok = false;
  errors.push(`Duration ${metadata.duration_seconds}s exceeds ${args[durationIndex + 1]}s.`);
}
console.log(JSON.stringify({ ok, metadata, errors }, null, 2));
process.exitCode = ok ? 0 : 1;
