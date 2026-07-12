import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { commandExists, dimensionsString, sha256File } from '../utils.mjs';

function inspectPng(buffer) {
  const signature = '89504e470d0a1a0a';
  if (buffer.length < 24 || buffer.subarray(0, 8).toString('hex') !== signature) return null;
  return { format: 'png', width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function inspectGif(buffer) {
  const signature = buffer.subarray(0, 6).toString('ascii');
  if (!['GIF87a', 'GIF89a'].includes(signature) || buffer.length < 10) return null;
  return { format: 'gif', width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
}

function inspectJpeg(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  const sofMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  while (offset + 4 <= buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    let marker = buffer[offset + 1];
    while (marker === 0xff) {
      offset += 1;
      marker = buffer[offset + 1];
    }
    offset += 2;
    if (marker === 0xd9 || marker === 0xda) break;
    if (offset + 2 > buffer.length) break;
    const length = buffer.readUInt16BE(offset);
    if (length < 2 || offset + length > buffer.length) break;
    if (sofMarkers.has(marker) && length >= 7) {
      return {
        format: 'jpeg',
        height: buffer.readUInt16BE(offset + 3),
        width: buffer.readUInt16BE(offset + 5),
      };
    }
    offset += length;
  }
  return null;
}

function inspectWebp(buffer) {
  if (buffer.length < 30 || buffer.subarray(0, 4).toString('ascii') !== 'RIFF' || buffer.subarray(8, 12).toString('ascii') !== 'WEBP') return null;
  const type = buffer.subarray(12, 16).toString('ascii');
  if (type === 'VP8X') {
    const width = 1 + buffer.readUIntLE(24, 3);
    const height = 1 + buffer.readUIntLE(27, 3);
    return { format: 'webp', width, height };
  }
  if (type === 'VP8 ') {
    for (let offset = 20; offset + 10 < buffer.length; offset += 1) {
      if (buffer[offset] === 0x9d && buffer[offset + 1] === 0x01 && buffer[offset + 2] === 0x2a) {
        return {
          format: 'webp',
          width: buffer.readUInt16LE(offset + 3) & 0x3fff,
          height: buffer.readUInt16LE(offset + 5) & 0x3fff,
        };
      }
    }
  }
  if (type === 'VP8L' && buffer[20] === 0x2f) {
    const bits = buffer.readUInt32LE(21);
    const width = (bits & 0x3fff) + 1;
    const height = ((bits >> 14) & 0x3fff) + 1;
    return { format: 'webp', width, height };
  }
  return null;
}

function inspectSvg(filePath) {
  const text = fs.readFileSync(filePath, 'utf8').slice(0, 256 * 1024);
  if (!/<svg\b/i.test(text)) return null;
  const open = text.match(/<svg\b[^>]*>/i)?.[0] ?? '';
  const width = open.match(/\bwidth\s*=\s*["']?([\d.]+)(?:px)?["']?/i)?.[1];
  const height = open.match(/\bheight\s*=\s*["']?([\d.]+)(?:px)?["']?/i)?.[1];
  const viewBox = open.match(/\bviewBox\s*=\s*["']\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)\s*["']/i);
  const resolvedWidth = width ? Number(width) : viewBox ? Number(viewBox[1]) : null;
  const resolvedHeight = height ? Number(height) : viewBox ? Number(viewBox[2]) : null;
  return { format: 'svg', width: resolvedWidth, height: resolvedHeight, vector: true };
}

function inspectPdf(filePath) {
  if (!commandExists('pdfinfo')) return { format: 'pdf', width: null, height: null, pages: null, tool_missing: 'pdfinfo' };
  const result = spawnSync('pdfinfo', [filePath], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`pdfinfo failed: ${(result.stderr || result.stdout).trim()}`);
  const pageSize = result.stdout.match(/^Page size:\s+([\d.]+) x ([\d.]+) pts/m);
  const pages = result.stdout.match(/^Pages:\s+(\d+)/m);
  return {
    format: 'pdf',
    width: pageSize ? Number(pageSize[1]) : null,
    height: pageSize ? Number(pageSize[2]) : null,
    unit: 'pt',
    pages: pages ? Number(pages[1]) : null,
  };
}

export function inspectImage(filePath) {
  const stat = fs.statSync(filePath);
  const extension = path.extname(filePath).toLowerCase();
  let metadata;
  if (extension === '.svg') metadata = inspectSvg(filePath);
  else if (extension === '.pdf') metadata = inspectPdf(filePath);
  else {
    const handle = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(Math.min(stat.size, 2 * 1024 * 1024));
    try {
      fs.readSync(handle, buffer, 0, buffer.length, 0);
    } finally {
      fs.closeSync(handle);
    }
    metadata = inspectPng(buffer) || inspectGif(buffer) || inspectJpeg(buffer) || inspectWebp(buffer);
  }
  if (!metadata) throw new Error(`Unsupported or invalid image format: ${filePath}`);
  return {
    ...metadata,
    path: filePath,
    dimensions: metadata.width && metadata.height ? dimensionsString(metadata.width, metadata.height) : null,
    aspect_ratio: metadata.width && metadata.height ? metadata.width / metadata.height : null,
    size_bytes: stat.size,
    sha256: sha256File(filePath),
  };
}
