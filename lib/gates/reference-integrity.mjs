import fs from 'node:fs';
import path from 'node:path';
import { REQUIRED_RUN_FILES } from '../constants.mjs';
import { relativePosix, walkFiles } from '../utils.mjs';
import { createGate, addCheck, addError, addWarning } from './result.mjs';

const SCANNED_EXTENSIONS = new Set(['.md']);
const LOCAL_PREFIX = /^(?:agents|reference|templates|scripts|schemas|adapters|docs|tests|bin|lib)\//;

function referencesIn(text) {
  const refs = new Set();
  const markdownLink = /\]\(([^)]+)\)/g;
  let match;
  while ((match = markdownLink.exec(text)) !== null) {
    const target = match[1].split('#')[0].trim();
    if (LOCAL_PREFIX.test(target)) refs.add(target);
  }
  const inline = /`((?:agents|reference|templates|scripts|schemas|adapters|docs|tests|bin|lib)\/[A-Za-z0-9_.\-/]+(?:\.(?:md|mjs|sh|yaml|json|html|py|srt))?)`/g;
  while ((match = inline.exec(text)) !== null) refs.add(match[1]);
  return [...refs].filter((ref) => !/[<*>]/.test(ref));
}

export function gateReferenceIntegrity(root) {
  const result = createGate('reference-integrity');
  const resolved = path.resolve(root);
  const files = walkFiles(resolved).filter((file) => SCANNED_EXTENSIONS.has(path.extname(file)));
  let references = 0;
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    for (const ref of referencesIn(text)) {
      references += 1;
      const target = path.resolve(path.dirname(file), ref);
      const rootTarget = path.resolve(resolved, ref);
      const chosen = fs.existsSync(target) ? target : rootTarget;
      if (!fs.existsSync(chosen)) addError(result, 'REFERENCE_MISSING', `${relativePosix(resolved, file)} references missing local path ${ref}.`, relativePosix(resolved, file));
    }
  }
  for (const required of ['SKILL.md', 'README.md', 'README.ko.md', 'package.json', 'bin/supermarketer.mjs', 'tests/run-all.sh', 'scripts/package-gate.mjs']) {
    if (!fs.existsSync(path.join(resolved, required))) addError(result, 'PACKAGE_FILE_MISSING', `Required package file is missing: ${required}`, required);
  }
  for (const template of REQUIRED_RUN_FILES) {
    if (!fs.existsSync(path.join(resolved, 'templates', template))) addError(result, 'RUN_TEMPLATE_MISSING', `Missing run template: templates/${template}`, `templates/${template}`);
  }
  const packageJson = path.join(resolved, 'package.json');
  if (fs.existsSync(packageJson)) {
    try {
      const packageData = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
      const binPath = packageData.bin?.supermarketer;
      if (!binPath || !fs.existsSync(path.resolve(resolved, binPath))) addError(result, 'PACKAGE_BIN', 'package.json bin.supermarketer does not resolve.', 'package.json');
    } catch (error) {
      addError(result, 'PACKAGE_JSON', `package.json is invalid: ${error.message}`, 'package.json');
    }
  }
  const starterLanguage = files.filter((file) => /(?:starter scaffold|does not implement|planned gate scripts|향후 구현|초안)/i.test(fs.readFileSync(file, 'utf8')));
  for (const file of starterLanguage) addWarning(result, 'STALE_STARTER_LANGUAGE', `Possible stale starter wording in ${relativePosix(resolved, file)}.`, relativePosix(resolved, file));
  addCheck(result, 'REFERENCE_SCAN', `${files.length} Markdown file(s) and ${references} local reference(s) checked.`);
  return result;
}
