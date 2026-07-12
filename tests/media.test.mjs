import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { inspectAssetFile } from '../lib/media/inspect.mjs';
import { makeTempDir, hasFfprobe } from './helpers/fixture.mjs';

test('inspects raster image dimensions and hash without external libraries', () => {
  const root = makeTempDir();
  const file = path.join(root, 'one.png');
  fs.writeFileSync(file, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64'));
  const result = inspectAssetFile(file, 'image');
  assert.equal(result.format, 'png');
  assert.equal(result.dimensions, '1x1');
  assert.match(result.sha256, /^[a-f0-9]{64}$/);
});

test('inspects a rendered video through ffprobe when available', { skip: !hasFfprobe() }, () => {
  const root = makeTempDir();
  const file = path.join(root, 'one.mp4');
  const render = spawnSync('ffmpeg', ['-y', '-f', 'lavfi', '-i', 'color=c=black:s=16x16:d=1', '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', file], { encoding: 'utf8' });
  assert.equal(render.status, 0, render.stderr);
  const result = inspectAssetFile(file, 'video');
  assert.equal(result.dimensions, '16x16');
  assert.ok(result.duration_seconds > 0.8 && result.duration_seconds < 1.2);
});
