import fs from 'node:fs';
import path from 'node:path';
import { inspectImage } from './image.mjs';
import { inspectVideo } from './video.mjs';
import { sha256File } from '../utils.mjs';

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.pdf']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.m4v', '.webm', '.avi', '.mkv']);

export function inspectAssetFile(filePath, kind = null) {
  const extension = path.extname(filePath).toLowerCase();
  if (kind === 'video' || VIDEO_EXTENSIONS.has(extension)) return inspectVideo(filePath);
  if (['static', 'image'].includes(kind) || IMAGE_EXTENSIONS.has(extension)) return inspectImage(filePath);
  const stat = fs.statSync(filePath);
  return {
    path: filePath,
    format: extension.slice(1) || 'unknown',
    size_bytes: stat.size,
    sha256: sha256File(filePath),
  };
}
