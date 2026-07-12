import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { REQUIRED_RUN_FILES } from './constants.mjs';
import {
  parseIsoDate,
  readJson,
  readText,
  relativePosix,
  safeExistingPath,
  sha256File,
  walkFiles,
} from './utils.mjs';
import { readYaml } from './yaml-lite.mjs';

const EXPECTED_READINESS_GATES = Object.freeze([
  'run-files',
  'run-state',
  'brief',
  'evidence',
  'claims',
  'channel-specs',
  'deliverables',
  'production-pack',
  'asset-manifest',
  'reviews',
  'qa',
  'performance-attestation',
]);

const MUTABLE_AFTER_READY = new Set([
  'APPROVALS.yaml',
  'MEASUREMENT.yaml',
  'RESULTS.md',
  'Z-READY.md',
  'Z-VALIDATED.md',
]);

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function markerField(text, label) {
  const match = text.match(new RegExp(`^-\\s*${escapeRegex(label)}:\\s*(?:\\x60([^\\x60]*)\\x60|(.+?))\\s*$`, 'mi'));
  return (match?.[1] ?? match?.[2] ?? '').trim();
}

function issue(code, message, location = 'Z-READY.md') {
  return { code, message, location };
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

function hashBuffer(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function shouldAttest(relativePath) {
  if (MUTABLE_AFTER_READY.has(relativePath)) return false;
  if (relativePath === 'reports/gate-report.json' || relativePath === 'reports/gate-report-latest.json') return false;
  if (relativePath === 'reports/PACKAGE-MANIFEST.json') return false;
  if (/^reports\/publish-permit-[^/]+\.json$/i.test(relativePath)) return false;
  return true;
}

function canonicalContent(vault, relativePath) {
  const filePath = safeExistingPath(vault, relativePath);
  if (relativePath === 'run-state.json') {
    const state = readJson(filePath);
    delete state.phase;
    delete state.performance;
    delete state.updated_at;
    return { buffer: Buffer.from(`${JSON.stringify(stable(state))}\n`), normalization: 'run-state-without-post-launch-fields' };
  }
  if (relativePath === 'ASSET-MANIFEST.yaml') {
    const manifest = readYaml(filePath);
    if (manifest?.run && typeof manifest.run === 'object') delete manifest.run.performance;
    return { buffer: Buffer.from(`${JSON.stringify(stable(manifest))}\n`), normalization: 'manifest-without-performance' };
  }
  if (relativePath === 'REVIEWS.yaml') {
    const reviews = readYaml(filePath);
    if (Array.isArray(reviews?.reviews)) reviews.reviews = reviews.reviews.filter((review) => review?.type !== 'measurement');
    return { buffer: Buffer.from(`${JSON.stringify(stable(reviews))}\n`), normalization: 'reviews-without-measurement-reviews' };
  }
  if (relativePath === 'QA.md') {
    const normalized = readText(filePath).replace(/(^-\s*Performance:\s*)`?(?:NOT_MEASURED|MEASURING|PERFORMANCE_VALIDATED)`?\s*$/gmi, '$1`<POST_LAUNCH_PERFORMANCE>`');
    return { buffer: Buffer.from(normalized), normalization: 'qa-with-normalized-performance-lines' };
  }
  return { buffer: fs.readFileSync(filePath), normalization: 'raw-file' };
}

export function buildReadinessIntegrityManifest(vault) {
  const resolved = path.resolve(vault);
  return walkFiles(resolved)
    .map((filePath) => relativePosix(resolved, filePath))
    .filter(shouldAttest)
    .map((relativePath) => {
      const canonical = canonicalContent(resolved, relativePath);
      return {
        path: relativePath,
        normalization: canonical.normalization,
        canonical_size_bytes: canonical.buffer.length,
        sha256: hashBuffer(canonical.buffer),
      };
    });
}

// The integrity manifest and the current-file set are keyed by paths relative to
// path.resolve(vault) (lexical). safeExistingPath returns a realpath-resolved absolute
// path, which on hosts whose vault root contains a symlink component (e.g. macOS
// /var -> /private/var via os.tmpdir()) would produce a "../" traversal key that never
// matches. Keep the security validation but derive the key lexically so it is
// consistent with the manifest regardless of symlink components in the vault root.
function lexicalRelativeKey(vault, value) {
  const base = path.resolve(vault);
  const rel = path.relative(base, path.resolve(base, value)).split(path.sep).join('/');
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return null;
  return rel;
}

function normalizedAllowedPaths(vault, values = []) {
  const allowed = new Set();
  for (const value of values) {
    if (typeof value !== 'string' || !value.trim()) continue;
    try {
      safeExistingPath(vault, value);
      const rel = lexicalRelativeKey(vault, value);
      if (rel) allowed.add(rel);
    } catch {
      // The gate responsible for the additional file reports invalid/missing paths.
    }
  }
  return allowed;
}

function attestedPerformanceEvidencePaths(vault) {
  const allowed = new Set();
  try {
    const state = readJson(safeExistingPath(vault, 'run-state.json'));
    if (state.performance !== 'PERFORMANCE_VALIDATED') return allowed;
    const marker = readText(safeExistingPath(vault, 'Z-VALIDATED.md'));
    const measurement = readYaml(safeExistingPath(vault, 'MEASUREMENT.yaml'));
    const triples = [
      [measurement?.data?.source_path, measurement?.data?.data_sha256, markerField(marker, 'Source SHA-256')],
      [measurement?.validation?.predeclared_rule_source, measurement?.validation?.predeclared_rule_sha256, markerField(marker, 'Rule source SHA-256')],
      [measurement?.validation?.calculation_evidence_path, measurement?.validation?.calculation_evidence_sha256, markerField(marker, 'Calculation evidence SHA-256')],
    ];
    for (const [relativePath, declaredHash, markerHash] of triples) {
      if (typeof relativePath !== 'string' || !/^[a-f0-9]{64}$/.test(String(declaredHash ?? '')) || declaredHash !== String(markerHash ?? '').toLowerCase()) continue;
      const filePath = safeExistingPath(vault, relativePath);
      if (sha256File(filePath) === declaredHash) {
        const rel = lexicalRelativeKey(vault, relativePath);
        if (rel) allowed.add(rel);
      }
    }
  } catch {
    // Performance-attestation verification reports malformed post-launch records.
  }
  return allowed;
}

function verifyIntegrityManifest(vault, entries, options = {}) {
  const errors = [];
  if (!Array.isArray(entries) || entries.length === 0) {
    return [issue('READY_INTEGRITY_MANIFEST_MISSING', 'The gate report has no readiness integrity manifest.', 'reports/gate-report.json:integrity_manifest')];
  }
  const seen = new Set();
  const paths = new Set();
  for (const [index, entry] of entries.entries()) {
    const location = `reports/gate-report.json:integrity_manifest[${index}]`;
    if (!entry || typeof entry !== 'object' || typeof entry.path !== 'string') {
      errors.push(issue('READY_INTEGRITY_ENTRY', 'Invalid readiness integrity entry.', location));
      continue;
    }
    if (seen.has(entry.path)) {
      errors.push(issue('READY_INTEGRITY_DUPLICATE', `Duplicate readiness integrity path: ${entry.path}`, location));
      continue;
    }
    seen.add(entry.path);
    paths.add(entry.path);
    if (!/^[a-f0-9]{64}$/.test(String(entry.sha256 ?? ''))) {
      errors.push(issue('READY_INTEGRITY_HASH_FORMAT', `Invalid readiness integrity SHA-256 for ${entry.path}.`, location));
      continue;
    }
    try {
      const canonical = canonicalContent(vault, entry.path);
      const actual = hashBuffer(canonical.buffer);
      if (canonical.normalization !== entry.normalization) errors.push(issue('READY_INTEGRITY_NORMALIZATION', `Unexpected normalization contract for ${entry.path}.`, location));
      if (actual !== entry.sha256) errors.push(issue('READY_INTEGRITY_HASH_MISMATCH', `Certified run content changed after readiness: ${entry.path}.`, entry.path));
    } catch (error) {
      errors.push(issue(/Symbolic links/i.test(error.message) ? 'READY_INTEGRITY_SYMLINK' : /does not exist/i.test(error.message) ? 'READY_INTEGRITY_FILE_MISSING' : 'READY_INTEGRITY_FILE_INVALID', `Could not verify certified file ${entry.path}: ${error.message}`, entry.path));
    }
  }
  for (const required of REQUIRED_RUN_FILES.filter((name) => name !== 'APPROVALS.yaml')) {
    if (!paths.has(required)) errors.push(issue('READY_INTEGRITY_REQUIRED_FILE', `Readiness integrity manifest does not cover required file ${required}.`, 'reports/gate-report.json:integrity_manifest'));
  }

  const allowedAdditional = normalizedAllowedPaths(vault, options.allowedAdditionalPaths);
  for (const relativePath of attestedPerformanceEvidencePaths(vault)) allowedAdditional.add(relativePath);
  let currentPaths = [];
  try {
    currentPaths = walkFiles(path.resolve(vault))
      .map((filePath) => relativePosix(path.resolve(vault), filePath))
      .filter(shouldAttest);
  } catch (error) {
    errors.push(issue('READY_INTEGRITY_FILESET', `Could not enumerate the current certified file set: ${error.message}`, path.resolve(vault)));
  }
  for (const relativePath of currentPaths) {
    if (!paths.has(relativePath) && !allowedAdditional.has(relativePath)) {
      errors.push(issue('READY_INTEGRITY_UNEXPECTED_FILE', `A file was added after launch-readiness certification and is not covered by the attestation: ${relativePath}.`, relativePath));
    }
  }
  return errors;
}

export function verifyReadinessAttestation(vault, options = {}) {
  const resolved = path.resolve(vault);
  const errors = [];
  let markerPath;
  let markerText = '';
  try {
    markerPath = safeExistingPath(resolved, 'Z-READY.md');
    markerText = readText(markerPath);
  } catch (error) {
    errors.push(issue(/does not exist/i.test(error.message) ? 'READY_MARKER_MISSING' : 'READY_MARKER_UNSAFE', error.message));
    return { ok: false, errors, marker_path: null, report_path: null, report_sha256: null };
  }

  const markerRunId = markerField(markerText, 'Run ID');
  const markerReadiness = markerField(markerText, 'Readiness');
  const completedAtText = markerField(markerText, 'Completed at');
  const reportRelative = markerField(markerText, 'Gate report');
  const expectedHash = markerField(markerText, 'Gate report SHA-256').toLowerCase();

  if (!markerRunId) errors.push(issue('READY_MARKER_RUN_ID', 'Launch-readiness marker is missing Run ID.'));
  if (markerReadiness !== 'LAUNCH_READY') errors.push(issue('READY_MARKER_STATUS', 'Launch-readiness marker must state LAUNCH_READY.'));
  const completedAt = parseIsoDate(completedAtText);
  if (!completedAt) errors.push(issue('READY_MARKER_TIME', 'Launch-readiness marker has an invalid Completed at timestamp.'));
  if (reportRelative !== 'reports/gate-report.json') errors.push(issue('READY_REPORT_PATH', 'Gate report path must be reports/gate-report.json.'));
  if (!/^[a-f0-9]{64}$/.test(expectedHash)) errors.push(issue('READY_REPORT_HASH_FORMAT', 'Launch-readiness marker has an invalid gate report SHA-256.'));

  let state = null;
  try {
    state = readJson(safeExistingPath(resolved, 'run-state.json'));
    if (state.readiness !== 'LAUNCH_READY') errors.push(issue('READY_STATE_STATUS', 'run-state.json is not LAUNCH_READY.', 'run-state.json:readiness'));
    if (markerRunId && state.run_id !== markerRunId) errors.push(issue('READY_RUN_ID_MISMATCH', 'Z-READY.md and run-state.json use different run IDs.', 'run-state.json:run_id'));
  } catch (error) {
    errors.push(issue('READY_STATE_INVALID', `Could not verify run-state.json: ${error.message}`, 'run-state.json'));
  }

  let reportPath = null;
  let reportHash = null;
  let report = null;
  if (reportRelative === 'reports/gate-report.json') {
    try {
      reportPath = safeExistingPath(resolved, reportRelative);
      reportHash = sha256File(reportPath);
      if (expectedHash && reportHash !== expectedHash) errors.push(issue('READY_REPORT_HASH_MISMATCH', 'The current gate report does not match the hash recorded in Z-READY.md.', reportRelative));
      report = readJson(reportPath);
      if (report.schema_version !== '1.0') errors.push(issue('READY_REPORT_SCHEMA', 'The attested gate report has an unsupported schema version.', reportRelative));
      if (report.ok !== true || report.for_ready !== true) errors.push(issue('READY_REPORT_NOT_PASSING', 'The attested gate report is not a passing launch-readiness report.', reportRelative));
      if ((report.summary?.errors ?? 1) !== 0) errors.push(issue('READY_REPORT_ERRORS', 'The attested gate report records one or more errors.', reportRelative));
      const resultNames = Array.isArray(report.results) ? report.results.map((entry) => entry?.gate) : [];
      if (resultNames.length !== EXPECTED_READINESS_GATES.length || EXPECTED_READINESS_GATES.some((name) => !resultNames.includes(name))) {
        errors.push(issue('READY_REPORT_GATE_SET', `The gate report does not contain the expected ${EXPECTED_READINESS_GATES.length} readiness gates.`, reportRelative));
      }
      if (Array.isArray(report.results) && report.results.some((entry) => entry?.ok !== true)) errors.push(issue('READY_REPORT_GATE_FAILURE', 'At least one gate result in the attested report is not passing.', reportRelative));
      const reportRunId = report.results?.find((entry) => entry?.gate === 'run-state')?.metadata?.state?.run_id;
      if (markerRunId && reportRunId !== markerRunId) errors.push(issue('READY_REPORT_RUN_ID', 'The gate report run ID does not match the readiness marker.', reportRelative));
      const generatedAt = parseIsoDate(report.generated_at);
      if (!generatedAt) errors.push(issue('READY_REPORT_TIME', 'The attested gate report has an invalid generated_at timestamp.', reportRelative));
      if (generatedAt && completedAt && generatedAt > new Date(completedAt.getTime() + 60_000)) errors.push(issue('READY_REPORT_AFTER_MARKER', 'The gate report was generated after the readiness marker timestamp.', reportRelative));
      errors.push(...verifyIntegrityManifest(resolved, report.integrity_manifest, options));
    } catch (error) {
      errors.push(issue(/Symbolic links/i.test(error.message) ? 'READY_REPORT_SYMLINK' : /does not exist/i.test(error.message) ? 'READY_REPORT_MISSING' : 'READY_REPORT_INVALID', `Could not verify the attested gate report: ${error.message}`, reportRelative));
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    marker_path: markerPath,
    report_path: reportPath,
    report_sha256: reportHash,
    marker_run_id: markerRunId || null,
    completed_at: completedAt?.toISOString() ?? null,
    state,
    report,
  };
}
