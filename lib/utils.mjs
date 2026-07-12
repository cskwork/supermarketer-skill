import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

export function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

export function writeTextAtomic(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporary = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(temporary, content, 'utf8');
  fs.renameSync(temporary, filePath);
}

export function readJson(filePath) {
  return JSON.parse(readText(filePath));
}

export function writeJsonAtomic(filePath, value) {
  writeTextAtomic(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

export function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

export function dirExists(filePath) {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch {
    return false;
  }
}

export function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function normalizeArray(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === '') return [];
  return [value];
}

export function hasMeaningfulValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return !isPlaceholder(value);
  if (Array.isArray(value)) return value.some(hasMeaningfulValue);
  if (typeof value === 'object') return Object.values(value).some(hasMeaningfulValue);
  return true;
}

export function isPlaceholder(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (/^<[^>]+>$/.test(trimmed)) return true;
  if (/^(todo|tbd|placeholder|unknown|fill me|n\/a\?)$/i.test(trimmed)) return true;
  if (/^\{\{[^}]+\}\}$/.test(trimmed)) return true;
  return false;
}

export function todayIso(now = new Date()) {
  const date = now instanceof Date ? now : new Date(now);
  return date.toISOString().slice(0, 10);
}

export function nowIso(now = new Date()) {
  const date = now instanceof Date ? now : new Date(now);
  return date.toISOString();
}

export function parseIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value)) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function ageInDays(value, now = new Date()) {
  const date = value instanceof Date ? value : parseIsoDate(value);
  if (!date) return null;
  return Math.floor((now.getTime() - date.getTime()) / 86_400_000);
}

export function slugify(input, fallback = 'marketing-run') {
  const normalized = String(input ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 56);
  return normalized || fallback;
}

export function runIdFor(objective, date = new Date()) {
  const stamp = date.toISOString().replace(/[-:]/g, '').slice(0, 13).replace('T', '-');
  return `${stamp}-${slugify(objective)}`;
}

export function isPathWithin(root, candidate) {
  const rootResolved = path.resolve(root);
  const candidateResolved = path.resolve(candidate);
  return candidateResolved === rootResolved || candidateResolved.startsWith(`${rootResolved}${path.sep}`);
}

export function safeResolve(root, relativePath) {
  if (typeof relativePath !== 'string' || !relativePath.trim()) {
    throw new Error('Path is empty.');
  }
  if (path.isAbsolute(relativePath)) {
    throw new Error(`Absolute paths are not allowed in run manifests: ${relativePath}`);
  }
  const rootResolved = path.resolve(root);
  const resolved = path.resolve(rootResolved, relativePath);
  if (!isPathWithin(rootResolved, resolved)) {
    throw new Error(`Path escapes run vault: ${relativePath}`);
  }
  return resolved;
}

export function assertNoSymlinkInPath(root, candidate) {
  const rootResolved = path.resolve(root);
  const candidateResolved = path.resolve(candidate);
  if (!isPathWithin(rootResolved, candidateResolved)) {
    throw new Error(`Path escapes root: ${candidate}`);
  }
  let current = rootResolved;
  const relative = path.relative(rootResolved, candidateResolved);
  const segments = relative ? relative.split(path.sep) : [];
  for (const segment of segments) {
    current = path.join(current, segment);
    if (!fs.existsSync(current)) break;
    if (fs.lstatSync(current).isSymbolicLink()) {
      throw new Error(`Symbolic links are not allowed in governed vault paths: ${path.relative(rootResolved, current) || '.'}`);
    }
  }
  return candidateResolved;
}

export function assertRealPathWithin(root, candidate) {
  const rootResolved = path.resolve(root);
  const candidateResolved = path.resolve(candidate);
  if (!fs.existsSync(rootResolved)) throw new Error(`Root does not exist: ${rootResolved}`);
  if (!fs.existsSync(candidateResolved)) throw new Error(`Path does not exist: ${candidateResolved}`);
  const rootReal = fs.realpathSync(rootResolved);
  const candidateReal = fs.realpathSync(candidateResolved);
  if (!isPathWithin(rootReal, candidateReal)) {
    throw new Error(`Resolved path escapes root through a symbolic link: ${path.relative(rootResolved, candidateResolved) || candidateResolved}`);
  }
  return candidateReal;
}

export function safeExistingPath(root, relativePath, options = {}) {
  const resolved = safeResolve(root, relativePath);
  if (!fs.existsSync(resolved)) throw new Error(`Referenced path does not exist: ${relativePath}`);
  assertNoSymlinkInPath(root, resolved);
  const real = assertRealPathWithin(root, resolved);
  const stat = fs.statSync(real);
  if (options.directory === true && !stat.isDirectory()) throw new Error(`Expected a directory: ${relativePath}`);
  if (options.directory !== true && !stat.isFile()) throw new Error(`Expected a file: ${relativePath}`);
  return real;
}

export function relativePosix(root, filePath) {
  return path.relative(root, filePath).split(path.sep).join('/');
}

export function sha256File(filePath) {
  const hash = crypto.createHash('sha256');
  const file = fs.openSync(filePath, 'r');
  const buffer = Buffer.allocUnsafe(1024 * 1024);
  try {
    let bytesRead = 0;
    do {
      bytesRead = fs.readSync(file, buffer, 0, buffer.length, null);
      if (bytesRead > 0) hash.update(buffer.subarray(0, bytesRead));
    } while (bytesRead > 0);
  } finally {
    fs.closeSync(file);
  }
  return hash.digest('hex');
}

export function commandExists(command) {
  const probe = process.platform === 'win32' ? 'where' : 'which';
  const result = spawnSync(probe, [command], { encoding: 'utf8' });
  return result.status === 0;
}

export function parseDimensions(value) {
  if (typeof value === 'object' && value && Number.isFinite(value.width) && Number.isFinite(value.height)) {
    return { width: Number(value.width), height: Number(value.height) };
  }
  if (typeof value !== 'string') return null;
  const match = value.trim().match(/^(\d+)\s*[x×]\s*(\d+)$/i);
  if (!match) return null;
  return { width: Number(match[1]), height: Number(match[2]) };
}

export function dimensionsString(width, height) {
  return `${Math.round(width)}x${Math.round(height)}`;
}

export function parseAspectRatio(value) {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  if (typeof value !== 'string') return null;
  const ratio = value.trim().match(/^(\d+(?:\.\d+)?)\s*[:/]\s*(\d+(?:\.\d+)?)$/);
  if (ratio) return Number(ratio[1]) / Number(ratio[2]);
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

export function nearlyEqual(a, b, tolerance = 0.01) {
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tolerance;
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return 'unknown';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function walkFiles(root, options = {}) {
  const excluded = new Set(options.exclude ?? ['.git', 'node_modules']);
  const files = [];
  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (excluded.has(entry.name)) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) files.push(full);
    }
  }
  walk(root);
  return files.sort();
}

export function copyFileInto(source, destination) {
  ensureDir(path.dirname(destination));
  fs.copyFileSync(source, destination, fs.constants.COPYFILE_EXCL);
}

export function unique(values) {
  return [...new Set(values)];
}

export function valueAt(object, dottedPath) {
  return dottedPath.split('.').reduce((current, key) => (current && current[key] !== undefined ? current[key] : undefined), object);
}

export function executableMode(filePath) {
  const mode = fs.statSync(filePath).mode;
  return (mode & 0o111) !== 0;
}
