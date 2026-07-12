import fs from 'node:fs';
import path from 'node:path';
import { gateMeasurement } from './gates/measurement.mjs';
import { parseIsoDate, readJson, readText, safeExistingPath } from './utils.mjs';
import { readYaml } from './yaml-lite.mjs';

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function markerField(text, label) {
  const match = text.match(new RegExp(`^-\\s*${escapeRegex(label)}:\\s*(?:\\x60([^\\x60]*)\\x60|(.+?))\\s*$`, 'mi'));
  return (match?.[1] ?? match?.[2] ?? '').trim();
}

function issue(code, message, location = 'Z-VALIDATED.md') {
  return { code, message, location };
}

function inline(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

export function verifyPerformanceAttestation(vault, options = {}) {
  const resolved = path.resolve(vault);
  const errors = [];
  let markerPath = null;
  let text = '';
  try {
    markerPath = safeExistingPath(resolved, 'Z-VALIDATED.md');
    text = readText(markerPath);
  } catch (error) {
    errors.push(issue(/does not exist/i.test(error.message) ? 'PERFORMANCE_MARKER_MISSING' : 'PERFORMANCE_MARKER_UNSAFE', error.message));
    return { ok: false, errors, marker_path: null, state: null, measurement: null };
  }

  const fields = {
    run_id: markerField(text, 'Run ID'),
    validated_at: markerField(text, 'Validated at'),
    source_sha256: markerField(text, 'Source SHA-256').toLowerCase(),
    rule_sha256: markerField(text, 'Rule source SHA-256').toLowerCase(),
    calculation_sha256: markerField(text, 'Calculation evidence SHA-256').toLowerCase(),
    rule: markerField(text, 'Predeclared rule'),
    observed: markerField(text, 'Observed'),
    uncertainty: markerField(text, 'Uncertainty'),
    performance: markerField(text, 'Performance'),
    decision: markerField(text, 'Decision'),
    causal: markerField(text, 'Causal claim allowed'),
  };

  if (!fields.run_id) errors.push(issue('PERFORMANCE_MARKER_RUN_ID', 'Performance marker is missing Run ID.'));
  const validatedAt = parseIsoDate(fields.validated_at);
  if (!validatedAt) errors.push(issue('PERFORMANCE_MARKER_TIME', 'Performance marker has an invalid Validated at timestamp.'));
  for (const [name, value] of [['source', fields.source_sha256], ['rule', fields.rule_sha256], ['calculation', fields.calculation_sha256]]) {
    if (!/^[a-f0-9]{64}$/.test(value)) errors.push(issue('PERFORMANCE_MARKER_HASH', `Performance marker has an invalid ${name} SHA-256.`));
  }
  if (fields.performance !== 'PERFORMANCE_VALIDATED') errors.push(issue('PERFORMANCE_MARKER_STATUS', 'Performance marker must state PERFORMANCE_VALIDATED.'));
  if (!['SCALE', 'ITERATE', 'STOP', 'MORE_DATA'].includes(fields.decision)) errors.push(issue('PERFORMANCE_MARKER_DECISION', 'Performance marker has an invalid decision.'));
  if (!['YES', 'NO'].includes(fields.causal)) errors.push(issue('PERFORMANCE_MARKER_CAUSAL', 'Performance marker must state whether a causal claim is allowed.'));

  let state = null;
  try {
    state = readJson(safeExistingPath(resolved, 'run-state.json'));
    if (state.performance !== 'PERFORMANCE_VALIDATED') errors.push(issue('PERFORMANCE_STATE_STATUS', 'run-state.json is not PERFORMANCE_VALIDATED.', 'run-state.json:performance'));
    if (fields.run_id && state.run_id !== fields.run_id) errors.push(issue('PERFORMANCE_RUN_ID_MISMATCH', 'Z-VALIDATED.md and run-state.json use different run IDs.', 'run-state.json:run_id'));
    if (validatedAt && parseIsoDate(state.updated_at)?.getTime() !== validatedAt.getTime()) errors.push(issue('PERFORMANCE_STATE_TIME', 'run-state.json updated_at does not match the validation marker timestamp.', 'run-state.json:updated_at'));
  } catch (error) {
    errors.push(issue('PERFORMANCE_STATE_INVALID', `Could not verify run-state.json: ${error.message}`, 'run-state.json'));
  }

  let measurementData = null;
  try {
    measurementData = readYaml(safeExistingPath(resolved, 'MEASUREMENT.yaml'));
  } catch (error) {
    errors.push(issue('PERFORMANCE_MEASUREMENT_FILE', `Could not read MEASUREMENT.yaml: ${error.message}`, 'MEASUREMENT.yaml'));
  }

  const measurement = gateMeasurement(resolved, options);
  for (const error of measurement.errors) errors.push(issue(`PERFORMANCE_${error.code}`, error.message, error.location));
  const validation = measurementData?.validation ?? {};
  const expectedRule = inline(`${validation.primary_metric} ${validation.operator} ${validation.threshold}`);
  if (fields.rule !== expectedRule) errors.push(issue('PERFORMANCE_RULE_MISMATCH', 'Performance marker rule does not match MEASUREMENT.yaml.', 'MEASUREMENT.yaml:validation'));
  if (Number(fields.observed) !== Number(validation.observed)) errors.push(issue('PERFORMANCE_OBSERVED_MISMATCH', 'Performance marker observed value does not match MEASUREMENT.yaml.', 'MEASUREMENT.yaml:validation.observed'));
  if (fields.uncertainty !== inline(validation.uncertainty)) errors.push(issue('PERFORMANCE_UNCERTAINTY_MISMATCH', 'Performance marker uncertainty does not match MEASUREMENT.yaml.', 'MEASUREMENT.yaml:validation.uncertainty'));
  if (fields.decision !== validation.decision) errors.push(issue('PERFORMANCE_DECISION_MISMATCH', 'Performance marker decision does not match MEASUREMENT.yaml.', 'MEASUREMENT.yaml:validation.decision'));
  const expectedCausal = validation.causal_claim_allowed === true ? 'YES' : 'NO';
  if (fields.causal !== expectedCausal) errors.push(issue('PERFORMANCE_CAUSAL_MISMATCH', 'Performance marker causal-claim status does not match MEASUREMENT.yaml.', 'MEASUREMENT.yaml:validation.causal_claim_allowed'));
  if (fields.source_sha256 && measurement.metadata.sourceSha256 && fields.source_sha256 !== measurement.metadata.sourceSha256) errors.push(issue('PERFORMANCE_SOURCE_HASH_MISMATCH', 'Performance marker source hash does not match the current source file.', 'MEASUREMENT.yaml:data.source_path'));
  if (fields.rule_sha256 && measurement.metadata.ruleSha256 && fields.rule_sha256 !== measurement.metadata.ruleSha256) errors.push(issue('PERFORMANCE_RULE_HASH_MISMATCH', 'Performance marker rule hash does not match the current predeclared rule file.', 'MEASUREMENT.yaml:validation.predeclared_rule_source'));
  if (fields.calculation_sha256 && measurement.metadata.calculationSha256 && fields.calculation_sha256 !== measurement.metadata.calculationSha256) errors.push(issue('PERFORMANCE_CALCULATION_HASH_MISMATCH', 'Performance marker calculation hash does not match the current calculation evidence.', 'MEASUREMENT.yaml:validation.calculation_evidence_path'));

  return {
    ok: errors.length === 0,
    errors,
    marker_path: markerPath,
    validated_at: validatedAt?.toISOString() ?? null,
    fields,
    state,
    measurement,
  };
}
