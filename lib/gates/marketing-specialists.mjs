import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { SPECIALIST_NAMES } from '../specialists/catalog.mjs';
import { MARKETING_SKILLS_LOCK } from './marketing-specialists-lock.mjs';
import { addCheck, addError, createGate } from './result.mjs';
import { relativePosix, walkFiles } from '../utils.mjs';

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function readManifest(result, vendor) {
  const file = path.join(vendor, 'manifest.json');
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    addError(result, 'VENDOR_MANIFEST_INVALID', error.message, 'vendor/marketingskills/manifest.json');
    return null;
  }
}

function checkManifestTrustAnchor(result, vendor, manifest) {
  const location = 'vendor/marketingskills/manifest.json';
  if (sha256(path.join(vendor, 'manifest.json')) !== MARKETING_SKILLS_LOCK.manifestSha256) {
    addError(result, 'VENDOR_MANIFEST_DIGEST', 'Vendor manifest does not match the approved first-party digest.', location);
  }
  if (manifest.source_url !== MARKETING_SKILLS_LOCK.sourceUrl) {
    addError(result, 'VENDOR_SOURCE_URL', `Expected source URL ${MARKETING_SKILLS_LOCK.sourceUrl}.`, location);
  }
  if (manifest.canonical_origin !== MARKETING_SKILLS_LOCK.canonicalOrigin) {
    addError(result, 'VENDOR_CANONICAL_ORIGIN', `Expected canonical origin ${MARKETING_SKILLS_LOCK.canonicalOrigin}.`, location);
  }
  if (manifest.source_commit !== MARKETING_SKILLS_LOCK.sourceCommit) {
    addError(result, 'VENDOR_SOURCE_COMMIT', `Expected source commit ${MARKETING_SKILLS_LOCK.sourceCommit}.`, location);
  }
  for (const [name, expected] of Object.entries(MARKETING_SKILLS_LOCK.counts)) {
    if (manifest.counts?.[name] !== expected) {
      addError(result, 'VENDOR_MANIFEST_COUNT', `Expected ${expected} ${name}; found ${manifest.counts?.[name] ?? 'missing'}.`, location);
    }
  }
}

function checkCatalog(result, vendor, manifest) {
  const skills = path.join(vendor, 'skills');
  const names = fs.readdirSync(skills, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  if (JSON.stringify(names) !== JSON.stringify([...SPECIALIST_NAMES].sort())) addError(result, 'VENDOR_CATALOG_MISMATCH', 'Vendored skill directories do not match the 47-entry catalog.', 'vendor/marketingskills/skills');
  if (manifest.counts?.specialists !== 47 || names.length !== 47) addError(result, 'VENDOR_SPECIALIST_COUNT', `Expected 47 specialists; found ${names.length}.`, 'vendor/marketingskills/manifest.json');
  for (const name of names) {
    const playbook = path.join(skills, name, 'SKILL.md');
    if (!fs.existsSync(playbook)) {
      addError(result, 'VENDOR_PLAYBOOK_MISSING', `Missing ${name}/SKILL.md.`, relativePosix(vendor, playbook));
      continue;
    }
    const declared = fs.readFileSync(playbook, 'utf8').match(/^name:\s*["']?([^\n"']+)/m)?.[1]?.trim();
    if (declared !== name) addError(result, 'VENDOR_FRONTMATTER_NAME', `${name}/SKILL.md declares name ${declared ?? 'missing'}.`, relativePosix(vendor, playbook));
  }
}

function checkHashes(result, vendor, manifest) {
  const expected = new Map((manifest.files ?? []).map((entry) => [entry.path, entry.sha256]));
  const actual = walkFiles(vendor).map((file) => relativePosix(vendor, file)).filter((file) => file !== 'manifest.json').sort();
  if (actual.length !== expected.size) addError(result, 'VENDOR_FILE_COUNT', `Manifest lists ${expected.size} files; snapshot has ${actual.length}.`, 'vendor/marketingskills');
  for (const file of actual) {
    const expectedHash = expected.get(file);
    if (!expectedHash || sha256(path.join(vendor, file)) !== expectedHash) addError(result, 'VENDOR_HASH_MISMATCH', `Hash mismatch for ${file}.`, `vendor/marketingskills/${file}`);
  }
  for (const file of expected.keys()) if (!actual.includes(file)) addError(result, 'VENDOR_FILE_MISSING', `Manifest file is missing: ${file}.`, `vendor/marketingskills/${file}`);
}

export function gateMarketingSpecialists(root) {
  const result = createGate('marketing-specialists');
  const vendor = path.join(path.resolve(root), 'vendor', 'marketingskills');
  const manifest = readManifest(result, vendor);
  if (!manifest) return result;
  checkManifestTrustAnchor(result, vendor, manifest);
  checkCatalog(result, vendor, manifest);
  checkHashes(result, vendor, manifest);
  addCheck(result, 'VENDOR_SPECIALISTS', '47 specialist playbooks, catalog names, frontmatter, provenance, and file hashes checked.');
  return result;
}
