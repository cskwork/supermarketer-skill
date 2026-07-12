import fs from 'node:fs';
import path from 'node:path';
import { nowIso, writeJsonAtomic } from '../utils.mjs';
import { buildReadinessIntegrityManifest } from '../attestation.mjs';
import { mergeGateResults } from './result.mjs';
import { gateRunFiles } from './run-files.mjs';
import { gateState } from './state.mjs';
import { gateBrief } from './brief.mjs';
import { gateEvidence } from './evidence.mjs';
import { gateClaims } from './claims.mjs';
import { gateChannelSpecs } from './channel.mjs';
import { gateDeliverables } from './deliverables.mjs';
import { gateProductionPacks } from './production-pack.mjs';
import { gateManifest } from './manifest.mjs';
import { gateReviews } from './reviews.mjs';
import { gateQa } from './qa.mjs';
import { gatePerformanceAttestation } from './performance-attestation.mjs';

export function runReadinessGates(vault, options = {}) {
  const resolved = path.resolve(vault);
  const forReady = options.forReady !== false;
  const shared = { ...options, forReady };
  const results = [
    gateRunFiles(resolved),
    gateState(resolved, { ...shared, validatedMarkerExists: fs.existsSync(path.join(resolved, 'Z-VALIDATED.md')) }),
    gateBrief(resolved, shared),
    gateEvidence(resolved, shared),
    gateClaims(resolved, shared),
    gateChannelSpecs(resolved, shared),
    gateDeliverables(resolved, shared),
    gateProductionPacks(resolved, shared),
    gateManifest(resolved, shared),
    gateReviews(resolved, shared),
    gateQa(resolved, shared),
    gatePerformanceAttestation(resolved, shared),
  ];
  const merged = mergeGateResults('launch-readiness', results);
  let integrityManifest = [];
  try {
    integrityManifest = buildReadinessIntegrityManifest(resolved);
  } catch (error) {
    merged.ok = false;
    merged.errors.push({ gate: 'readiness-attestation', code: 'INTEGRITY_MANIFEST_BUILD', message: `Could not build readiness integrity manifest: ${error.message}`, location: resolved });
  }
  const report = {
    schema_version: '1.0',
    generated_at: nowIso(options.now ?? new Date()),
    vault: resolved,
    for_ready: forReady,
    ok: merged.ok,
    summary: {
      gates: results.length,
      passed: results.filter((entry) => entry.ok).length,
      errors: merged.errors.length,
      warnings: merged.warnings.length,
    },
    errors: merged.errors,
    warnings: merged.warnings,
    results,
    integrity_manifest: integrityManifest,
  };
  if (options.writeReport !== false) {
    const canonicalPath = path.join(resolved, 'reports', 'gate-report.json');
    const reportPath = options.reportPath
      ?? (fs.existsSync(path.join(resolved, 'Z-READY.md'))
        ? path.join(resolved, 'reports', 'gate-report-latest.json')
        : canonicalPath);
    writeJsonAtomic(reportPath, report);
    report.report_path = reportPath;
  }
  return report;
}
