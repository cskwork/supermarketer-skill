import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { sha256File, walkFiles, relativePosix } from './utils.mjs';

const IGNORE = new Set(['.git', 'node_modules']);

function hashMap(root) {
  const map = new Map();
  if (!fs.existsSync(root)) return map;
  for (const file of walkFiles(root, { exclude: [...IGNORE] })) map.set(relativePosix(root, file), sha256File(file));
  return map;
}

export function auditInstall(source, targets = null) {
  const sourcePath = path.resolve(source);
  if (!fs.existsSync(path.join(sourcePath, 'SKILL.md'))) throw new Error(`Source does not look like a skill repository: ${sourcePath}`);
  const defaults = [
    path.join(os.homedir(), '.agents', 'skills', 'supermarketer'),
    path.join(os.homedir(), '.codex', 'skills', 'supermarketer'),
    path.join(os.homedir(), '.claude', 'skills', 'supermarketer'),
  ];
  const targetPaths = (targets && targets.length > 0 ? targets : defaults).map((item) => path.resolve(item));
  const sourceReal = fs.realpathSync(sourcePath);
  const sourceHashes = hashMap(sourcePath);
  const results = [];
  for (const target of targetPaths) {
    if (!fs.existsSync(target)) {
      results.push({ target, status: 'missing', ok: false, missing: [...sourceHashes.keys()], extra: [], changed: [] });
      continue;
    }
    const targetReal = fs.realpathSync(target);
    if (targetReal === sourceReal) {
      results.push({ target, status: 'linked', ok: true, missing: [], extra: [], changed: [] });
      continue;
    }
    const targetHashes = hashMap(target);
    const missing = [...sourceHashes.keys()].filter((key) => !targetHashes.has(key));
    const extra = [...targetHashes.keys()].filter((key) => !sourceHashes.has(key));
    const changed = [...sourceHashes.keys()].filter((key) => targetHashes.has(key) && targetHashes.get(key) !== sourceHashes.get(key));
    results.push({ target, status: missing.length || extra.length || changed.length ? 'drifted' : 'copied-clean', ok: missing.length === 0 && extra.length === 0 && changed.length === 0, missing, extra, changed });
  }
  return { source: sourcePath, ok: results.every((entry) => entry.ok || entry.status === 'missing'), results };
}
