import fs from 'node:fs';
import path from 'node:path';
import { runReadinessGates } from './gates/aggregate.mjs';
import { verifyReadinessAttestation } from './attestation.mjs';
import { verifyPerformanceAttestation } from './performance-attestation.mjs';
import { gateMeasurement } from './gates/measurement.mjs';
import { gatePublish } from './gates/publish.mjs';
import { inspectAssetFile } from './media/inspect.mjs';
import { readYaml, writeYamlAtomic } from './yaml-lite.mjs';
import {
  assertNoSymlinkInPath,
  assertRealPathWithin,
  ensureDir,
  isPathWithin,
  nowIso,
  readJson,
  readText,
  relativePosix,
  safeExistingPath,
  safeResolve,
  sha256File,
  writeJsonAtomic,
  writeTextAtomic,
} from './utils.mjs';

function updateQaToReady(qaPath) {
  let text = readText(qaPath);
  text = text.replace(/^(- Readiness:\s*)`?(?:DRAFT|REVIEW_READY|LAUNCH_READY|BLOCKED)`?\s*$/gm, '$1`LAUNCH_READY`');
  return text;
}

function snapshotFiles(paths) {
  return paths.map((filePath) => ({
    filePath,
    existed: fs.existsSync(filePath),
    content: fs.existsSync(filePath) ? fs.readFileSync(filePath) : null,
  }));
}

function restoreFiles(snapshots) {
  for (const snapshot of snapshots) {
    if (snapshot.existed) {
      ensureDir(path.dirname(snapshot.filePath));
      fs.writeFileSync(snapshot.filePath, snapshot.content);
    } else if (fs.existsSync(snapshot.filePath)) {
      fs.rmSync(snapshot.filePath, { force: true });
    }
  }
}

export function certifyReady(vault, options = {}) {
  const resolved = path.resolve(vault);
  const statePath = safeExistingPath(resolved, 'run-state.json');
  const manifestPath = safeExistingPath(resolved, 'ASSET-MANIFEST.yaml');
  const reviewsPath = safeExistingPath(resolved, 'REVIEWS.yaml');
  const qaPath = safeExistingPath(resolved, 'QA.md');
  const reportPath = path.join(resolved, 'reports', 'gate-report.json');
  const markerPath = path.join(resolved, 'Z-READY.md');
  const state = readJson(statePath);
  if (state.mode === 'MEASURE') throw new Error('MEASURE mode uses validate-results, not ready.');

  // Evaluate the review-ready package before changing certification state.
  const preflight = runReadinessGates(resolved, { ...options, forReady: true, writeReport: false });
  if (!preflight.ok) {
    const error = new Error(`Launch-readiness gate failed with ${preflight.errors.length} error(s).`);
    error.report = preflight;
    throw error;
  }

  const snapshots = snapshotFiles([statePath, manifestPath, qaPath, reportPath, markerPath]);
  const manifest = readYaml(manifestPath);
  const reviews = readYaml(reviewsPath);
  const completedAt = nowIso(options.now ?? new Date());

  try {
    state.readiness = 'LAUNCH_READY';
    state.phase = 'ready';
    state.external_action_authorized = false;
    state.updated_at = completedAt;
    state.artifacts = (manifest.assets ?? []).map((asset) => asset.id).filter(Boolean);
    writeJsonAtomic(statePath, state);

    manifest.run ??= {};
    manifest.run.readiness = 'LAUNCH_READY';
    manifest.run.performance = state.performance;
    writeYamlAtomic(manifestPath, manifest);
    writeTextAtomic(qaPath, updateQaToReady(qaPath));

    // This is the report the marker attests to. It must not be rewritten after hashing.
    const finalReport = runReadinessGates(resolved, { ...options, forReady: true, writeReport: true, reportPath });
    if (!finalReport.ok) {
      const error = new Error(`Final launch-readiness gate failed with ${finalReport.errors.length} error(s) after certification state update.`);
      error.report = finalReport;
      throw error;
    }

    const reportHash = sha256File(reportPath);
    const assetIds = (manifest.assets ?? []).map((asset) => asset.id).filter(Boolean);
    const reviewIds = (reviews.reviews ?? []).map((review) => review.id).filter(Boolean);
    const marker = `# Launch Readiness Record

- Run ID: \`${state.run_id}\`
- Completed at: ${completedAt}
- Mode: \`${state.mode}\`
- Readiness: \`LAUNCH_READY\`
- Performance: \`${state.performance}\`
- Approved asset IDs: ${assetIds.length ? assetIds.map((id) => `\`${id}\``).join(', ') : 'None'}
- Independent review IDs: ${reviewIds.length ? reviewIds.map((id) => `\`${id}\``).join(', ') : 'None'}
- Gate report: \`reports/gate-report.json\`
- Gate report SHA-256: \`${reportHash}\`
- Residual risks: See \`QA.md\` and accepted findings in \`REVIEWS.yaml\`.
- Publish authorized: \`NO\` — external action still requires a separate scoped approval and publish gate.

This record certifies pre-launch package readiness only. It does not certify reach, conversion, revenue, brand lift, or any other marketing performance.
`;
    writeTextAtomic(markerPath, marker);
    return { marker: markerPath, report: finalReport, state, report_sha256: reportHash };
  } catch (error) {
    restoreFiles(snapshots);
    throw error;
  }
}

function inlineMarkerValue(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

export function validateResults(vault, options = {}) {
  const resolved = path.resolve(vault);
  const result = gateMeasurement(resolved, options);
  if (!result.ok) {
    const error = new Error(`Measurement gate failed with ${result.errors.length} error(s).`);
    error.report = result;
    throw error;
  }
  const statePath = safeExistingPath(resolved, 'run-state.json');
  const manifestPath = safeExistingPath(resolved, 'ASSET-MANIFEST.yaml');
  const qaPath = safeExistingPath(resolved, 'QA.md');
  const markerPath = path.join(resolved, 'Z-VALIDATED.md');
  const snapshots = snapshotFiles([statePath, manifestPath, qaPath, markerPath]);
  const state = readJson(statePath);
  const validatedAt = nowIso(options.now ?? new Date());

  try {
    state.performance = 'PERFORMANCE_VALIDATED';
    state.phase = 'validated';
    state.updated_at = validatedAt;
    writeJsonAtomic(statePath, state);

    const manifest = readYaml(manifestPath);
    manifest.run ??= {};
    manifest.run.readiness = state.readiness;
    manifest.run.performance = state.performance;
    writeYamlAtomic(manifestPath, manifest);

    let qa = readText(qaPath);
    qa = qa.replace(/^(- Performance:\s*)`?(?:NOT_MEASURED|MEASURING|PERFORMANCE_VALIDATED)`?\s*$/gm, '$1`PERFORMANCE_VALIDATED`');
    writeTextAtomic(qaPath, qa);

    const validation = result.metadata.validation;
    const marker = `# Performance Validation Record

- Run ID: \`${state.run_id}\`
- Validated at: ${validatedAt}
- Data source: \`MEASUREMENT.yaml\` and its referenced source file
- Source SHA-256: \`${result.metadata.sourceSha256}\`
- Rule source SHA-256: \`${result.metadata.ruleSha256}\`
- Calculation evidence SHA-256: \`${result.metadata.calculationSha256}\`
- Predeclared rule: ${inlineMarkerValue(`${validation.primary_metric} ${validation.operator} ${validation.threshold}`)}
- Observed: ${validation.observed}
- Uncertainty: ${inlineMarkerValue(validation.uncertainty)}
- Performance: \`PERFORMANCE_VALIDATED\`
- Decision: \`${validation.decision}\`
- Causal claim allowed: \`${validation.causal_claim_allowed === true ? 'YES' : 'NO'}\`

This marker records that the declared machine-checkable rule passed on a referenced real post-launch dataset with hashed rule and calculation evidence. It does not remove the limitations recorded in \`MEASUREMENT.yaml\`.
`;
    writeTextAtomic(markerPath, marker);
    const attestation = verifyPerformanceAttestation(resolved, options);
    if (!attestation.ok) {
      const error = new Error(`Performance attestation failed with ${attestation.errors.length} error(s) after state update.`);
      error.report = { gate: 'performance-attestation', ...attestation, warnings: [], checks: [] };
      throw error;
    }
    return { marker: markerPath, result, state, attestation };
  } catch (error) {
    restoreFiles(snapshots);
    throw error;
  }
}

export function issuePublishPermit(vault, approvalId, options = {}) {
  const resolved = path.resolve(vault);
  const result = gatePublish(resolved, { ...options, approvalId });
  if (!result.ok) {
    const error = new Error(`Publish gate failed with ${result.errors.length} error(s).`);
    error.report = result;
    throw error;
  }
  const permitPath = path.join(resolved, 'reports', `publish-permit-${approvalId}.json`);
  writeJsonAtomic(permitPath, { schema_version: '1.0', issued_at: nowIso(options.now ?? new Date()), ...result.metadata.permit, note: 'This permit proves approval scope only; it does not execute the external action.' });
  return { permit: permitPath, result };
}

export function ingestAsset(vault, options) {
  const resolved = path.resolve(vault);
  const assetId = String(options.assetId ?? '');
  const source = path.resolve(options.file);
  const targetField = options.as ?? 'rendered';
  if (!/^ASSET-\d{3,}$/.test(assetId)) throw new Error('Asset ID must match ASSET-001.');
  if (!['rendered', 'source', 'preview', 'lineage'].includes(targetField)) throw new Error('--as must be rendered, source, preview, or lineage.');
  if (!fs.existsSync(source) || !fs.statSync(source).isFile()) throw new Error(`Input file not found: ${source}`);
  if (isPathWithin(resolved, source)) {
    assertNoSymlinkInPath(resolved, source);
    assertRealPathWithin(resolved, source);
  }

  const manifestPath = safeExistingPath(resolved, 'ASSET-MANIFEST.yaml');
  const manifest = readYaml(manifestPath);
  const asset = (manifest.assets ?? []).find((item) => item?.id === assetId);
  if (!asset) throw new Error(`Asset ID not found in manifest: ${assetId}`);

  // Validate rendered media before changing the manifest or copying a bad artifact.
  const inspected = targetField === 'rendered' ? inspectAssetFile(source, asset.kind) : null;
  const assetsRoot = safeResolve(resolved, 'assets');
  ensureDir(assetsRoot);
  assertNoSymlinkInPath(resolved, assetsRoot);
  assertRealPathWithin(resolved, assetsRoot);
  const assetDir = safeResolve(resolved, `assets/${assetId.toLowerCase()}`);
  ensureDir(assetDir);
  assertNoSymlinkInPath(resolved, assetDir);
  assertRealPathWithin(resolved, assetDir);

  let destination = path.join(assetDir, path.basename(source));
  if (path.resolve(source) !== path.resolve(destination)) {
    if (fs.existsSync(destination)) {
      const extension = path.extname(destination);
      const base = path.basename(destination, extension);
      let counter = 2;
      while (fs.existsSync(path.join(assetDir, `${base}-v${counter}${extension}`))) counter += 1;
      destination = path.join(assetDir, `${base}-v${counter}${extension}`);
    }
    fs.copyFileSync(source, destination, fs.constants.COPYFILE_EXCL);
  }
  assertNoSymlinkInPath(resolved, destination);
  assertRealPathWithin(resolved, destination);

  const relative = relativePosix(resolved, destination);
  if (targetField === 'rendered') {
    asset.rendered_path = relative;
    asset.status = 'rendered';
    const metadata = path.resolve(source) === path.resolve(destination) ? inspected : inspectAssetFile(destination, asset.kind);
    asset.actual = {
      format: metadata.format,
      dimensions: metadata.dimensions ?? null,
      duration_seconds: metadata.duration_seconds ?? null,
      size_bytes: metadata.size_bytes,
      sha256: metadata.sha256,
    };
  } else if (targetField === 'source') {
    asset.source_paths = [...new Set([...(Array.isArray(asset.source_paths) ? asset.source_paths : []), relative])];
  } else if (targetField === 'preview') asset.preview_path = relative;
  else asset.lineage_path = relative;
  writeYamlAtomic(manifestPath, manifest);
  return { asset_id: assetId, field: targetField, path: relative, sha256: sha256File(destination) };
}

export function getRunStatus(vault) {
  const resolved = path.resolve(vault);
  const state = readJson(safeExistingPath(resolved, 'run-state.json'));
  const zReady = fs.existsSync(path.join(resolved, 'Z-READY.md'));
  const zValidated = fs.existsSync(path.join(resolved, 'Z-VALIDATED.md'));
  const readinessAttestation = zReady ? verifyReadinessAttestation(resolved) : null;
  const performanceAttestation = zValidated ? verifyPerformanceAttestation(resolved) : null;
  return {
    vault: resolved,
    ...state,
    z_ready: zReady,
    z_ready_valid: readinessAttestation?.ok ?? false,
    z_ready_errors: readinessAttestation?.errors ?? [],
    z_validated: zValidated,
    z_validated_valid: performanceAttestation?.ok ?? false,
    z_validated_errors: performanceAttestation?.errors ?? [],
    last_gate_report: fs.existsSync(path.join(resolved, 'reports', 'gate-report.json')) ? path.join(resolved, 'reports', 'gate-report.json') : null,
  };
}
