import { hasMeaningfulValue, parseIsoDate, sha256File } from '../utils.mjs';
import { verifyReadinessAttestation } from '../attestation.mjs';
import { createGate, addCheck, addError } from './result.mjs';
import { loadYamlForGate, safeFile } from './helpers.mjs';

const OPERATORS = new Set(['gte', 'gt', 'lte', 'lt', 'eq']);
const DECISIONS = new Set(['SCALE', 'ITERATE', 'STOP', 'MORE_DATA']);

function evaluate(operator, observed, threshold) {
  if (operator === 'gte') return observed >= threshold;
  if (operator === 'gt') return observed > threshold;
  if (operator === 'lte') return observed <= threshold;
  if (operator === 'lt') return observed < threshold;
  if (operator === 'eq') return observed === threshold;
  return false;
}

export function gateMeasurement(vault, options = {}) {
  const result = createGate('measurement');
  const data = loadYamlForGate(result, vault, 'MEASUREMENT.yaml');
  const reviews = loadYamlForGate(result, vault, 'REVIEWS.yaml', false);
  if (!data) return result;
  const source = data.data ?? {};
  const validation = data.validation ?? {};
  const attestation = verifyReadinessAttestation(vault, {
    allowedAdditionalPaths: [
      source.source_path,
      validation.predeclared_rule_source,
      validation.calculation_evidence_path,
    ],
  });
  for (const error of attestation.errors) addError(result, error.code, error.message, error.location);
  result.metadata.readinessAttestation = attestation;
  if (source.real_post_launch !== true) addError(result, 'MEASUREMENT_NOT_REAL', 'data.real_post_launch must be true; modeled or invented data cannot validate performance.', 'MEASUREMENT.yaml:data.real_post_launch');
  const sourceFile = safeFile(result, vault, source.source_path, 'MEASUREMENT.yaml:data.source_path');
  if (!hasMeaningfulValue(source.source_description)) addError(result, 'MEASUREMENT_SOURCE_DESCRIPTION', 'source_description is required.', 'MEASUREMENT.yaml:data.source_description');
  if (!hasMeaningfulValue(source.timezone)) addError(result, 'MEASUREMENT_TIMEZONE', 'timezone is required.', 'MEASUREMENT.yaml:data.timezone');
  if (!hasMeaningfulValue(source.metric_definition)) addError(result, 'MEASUREMENT_METRIC_DEFINITION', 'metric_definition is required.', 'MEASUREMENT.yaml:data.metric_definition');
  if (!hasMeaningfulValue(source.data_quality_limitations)) addError(result, 'MEASUREMENT_DATA_LIMITATIONS', 'data_quality_limitations is required.', 'MEASUREMENT.yaml:data.data_quality_limitations');
  const start = parseIsoDate(source.date_start);
  const end = parseIsoDate(source.date_end);
  if (!start) addError(result, 'MEASUREMENT_START', 'date_start must be an ISO date.', 'MEASUREMENT.yaml:data.date_start');
  if (!end) addError(result, 'MEASUREMENT_END', 'date_end must be an ISO date.', 'MEASUREMENT.yaml:data.date_end');
  if (start && end && start > end) addError(result, 'MEASUREMENT_DATE_ORDER', 'date_start cannot be after date_end.', 'MEASUREMENT.yaml:data');
  if (end && end > new Date((options.now ?? new Date()).getTime() + 86_400_000)) addError(result, 'MEASUREMENT_FUTURE', 'date_end cannot be in the future.', 'MEASUREMENT.yaml:data.date_end');
  if (!/^[a-f0-9]{64}$/.test(String(source.data_sha256 ?? ''))) addError(result, 'MEASUREMENT_HASH_REQUIRED', 'data_sha256 must be a 64-character lowercase SHA-256.', 'MEASUREMENT.yaml:data.data_sha256');
  else if (sourceFile && sha256File(sourceFile) !== source.data_sha256) addError(result, 'MEASUREMENT_HASH', 'data_sha256 does not match the source file.', 'MEASUREMENT.yaml:data.data_sha256');

  const ruleFile = safeFile(result, vault, validation.predeclared_rule_source, 'MEASUREMENT.yaml:validation.predeclared_rule_source');
  if (!/^[a-f0-9]{64}$/.test(String(validation.predeclared_rule_sha256 ?? ''))) addError(result, 'MEASUREMENT_RULE_HASH_REQUIRED', 'predeclared_rule_sha256 must be a 64-character lowercase SHA-256.', 'MEASUREMENT.yaml:validation.predeclared_rule_sha256');
  else if (ruleFile && sha256File(ruleFile) !== validation.predeclared_rule_sha256) addError(result, 'MEASUREMENT_RULE_HASH', 'predeclared_rule_sha256 does not match the rule source.', 'MEASUREMENT.yaml:validation.predeclared_rule_sha256');
  const calculationFile = safeFile(result, vault, validation.calculation_evidence_path, 'MEASUREMENT.yaml:validation.calculation_evidence_path');
  if (!hasMeaningfulValue(validation.calculation_method)) addError(result, 'MEASUREMENT_CALCULATION_METHOD', 'calculation_method is required.', 'MEASUREMENT.yaml:validation.calculation_method');
  if (!/^[a-f0-9]{64}$/.test(String(validation.calculation_evidence_sha256 ?? ''))) addError(result, 'MEASUREMENT_CALCULATION_HASH_REQUIRED', 'calculation_evidence_sha256 must be a 64-character lowercase SHA-256.', 'MEASUREMENT.yaml:validation.calculation_evidence_sha256');
  else if (calculationFile && sha256File(calculationFile) !== validation.calculation_evidence_sha256) addError(result, 'MEASUREMENT_CALCULATION_HASH', 'calculation_evidence_sha256 does not match the calculation evidence file.', 'MEASUREMENT.yaml:validation.calculation_evidence_sha256');
  const predeclaredAt = parseIsoDate(validation.predeclared_at);
  if (!predeclaredAt) addError(result, 'MEASUREMENT_PREDECLARED_AT', 'predeclared_at must be an ISO date-time.', 'MEASUREMENT.yaml:validation.predeclared_at');
  if (predeclaredAt && start && predeclaredAt > start) addError(result, 'MEASUREMENT_POSTDECLARED', 'The validation rule was recorded after measurement began.', 'MEASUREMENT.yaml:validation.predeclared_at');
  if (!hasMeaningfulValue(validation.primary_metric)) addError(result, 'MEASUREMENT_PRIMARY_METRIC', 'primary_metric is required.', 'MEASUREMENT.yaml:validation.primary_metric');
  if (!OPERATORS.has(validation.operator)) addError(result, 'MEASUREMENT_OPERATOR', `operator must be one of: ${[...OPERATORS].join(', ')}`, 'MEASUREMENT.yaml:validation.operator');
  const threshold = Number(validation.threshold);
  const observed = Number(validation.observed);
  if (!Number.isFinite(threshold)) addError(result, 'MEASUREMENT_THRESHOLD', 'threshold must be numeric.', 'MEASUREMENT.yaml:validation.threshold');
  if (!Number.isFinite(observed)) addError(result, 'MEASUREMENT_OBSERVED', 'observed must be numeric.', 'MEASUREMENT.yaml:validation.observed');
  if (Number.isFinite(threshold) && Number.isFinite(observed) && OPERATORS.has(validation.operator) && !evaluate(validation.operator, observed, threshold)) {
    addError(result, 'MEASUREMENT_RULE_NOT_MET', `Observed value ${observed} does not satisfy ${validation.operator} ${threshold}.`, 'MEASUREMENT.yaml:validation');
  }
  if (!hasMeaningfulValue(validation.uncertainty)) addError(result, 'MEASUREMENT_UNCERTAINTY', 'uncertainty and limitations must be reported.', 'MEASUREMENT.yaml:validation.uncertainty');
  if (validation.guardrails_passed !== true) addError(result, 'MEASUREMENT_GUARDRAILS', 'guardrails_passed must be true for validation.', 'MEASUREMENT.yaml:validation.guardrails_passed');
  if (!hasMeaningfulValue(validation.analyst)) addError(result, 'MEASUREMENT_ANALYST', 'analyst is required.', 'MEASUREMENT.yaml:validation.analyst');
  if (!hasMeaningfulValue(validation.reviewed_by)) addError(result, 'MEASUREMENT_REVIEWER', 'reviewed_by is required.', 'MEASUREMENT.yaml:validation.reviewed_by');
  if (validation.analyst && validation.reviewed_by && validation.analyst === validation.reviewed_by) addError(result, 'MEASUREMENT_SELF_REVIEW', 'Analyst and reviewer must be different.', 'MEASUREMENT.yaml:validation.reviewed_by');
  if (!DECISIONS.has(validation.decision)) addError(result, 'MEASUREMENT_DECISION', `decision must be one of: ${[...DECISIONS].join(', ')}`, 'MEASUREMENT.yaml:validation.decision');
  if (validation.performance_status !== 'PERFORMANCE_VALIDATED') addError(result, 'MEASUREMENT_STATUS', 'performance_status must be PERFORMANCE_VALIDATED to create Z-VALIDATED.md.', 'MEASUREMENT.yaml:validation.performance_status');
  if (validation.causal_claim_allowed === true) {
    if (validation.randomized !== true) addError(result, 'MEASUREMENT_CAUSAL_RANDOMIZATION', 'Causal claims require randomized: true.', 'MEASUREMENT.yaml:validation.randomized');
    if (!hasMeaningfulValue(validation.assignment_method)) addError(result, 'MEASUREMENT_ASSIGNMENT', 'Causal claims require assignment_method.', 'MEASUREMENT.yaml:validation.assignment_method');
    if (!Number.isFinite(Number(validation.sample_size)) || Number(validation.sample_size) <= 0) addError(result, 'MEASUREMENT_SAMPLE', 'Causal claims require a positive sample_size.', 'MEASUREMENT.yaml:validation.sample_size');
  }
  const measurementReview = (Array.isArray(reviews?.reviews) ? reviews.reviews : []).find((review) => review?.type === 'measurement' && ['pass', 'pass_with_risk'].includes(review?.verdict));
  if (!measurementReview) addError(result, 'MEASUREMENT_REVIEW_MISSING', 'A passing independent measurement review is required.', 'REVIEWS.yaml');
  else {
    if (measurementReview.reviewer === validation.analyst) addError(result, 'MEASUREMENT_REVIEW_CONFLICT', 'The measurement reviewer cannot be the analyst.', 'REVIEWS.yaml');
    if (measurementReview.reviewer !== validation.reviewed_by) addError(result, 'MEASUREMENT_REVIEWER_MISMATCH', 'The passing measurement review must be owned by validation.reviewed_by.', 'REVIEWS.yaml');
    const reviewedAt = parseIsoDate(measurementReview.completed_at);
    if (!reviewedAt) addError(result, 'MEASUREMENT_REVIEW_DATE', 'The measurement review needs a valid completed_at timestamp.', 'REVIEWS.yaml');
    if (reviewedAt && end && reviewedAt < end) addError(result, 'MEASUREMENT_REVIEW_TOO_EARLY', 'The measurement review cannot precede the measurement end date.', 'REVIEWS.yaml');
    if (reviewedAt && reviewedAt > new Date((options.now ?? new Date()).getTime() + 86_400_000)) addError(result, 'MEASUREMENT_REVIEW_FUTURE', 'The measurement review cannot be in the future.', 'REVIEWS.yaml');
  }

  result.metadata.ruleMet = Number.isFinite(threshold) && Number.isFinite(observed) && OPERATORS.has(validation.operator)
    ? evaluate(validation.operator, observed, threshold)
    : false;
  result.metadata.sourceSha256 = sourceFile ? sha256File(sourceFile) : null;
  result.metadata.ruleSha256 = ruleFile ? sha256File(ruleFile) : null;
  result.metadata.calculationSha256 = calculationFile ? sha256File(calculationFile) : null;
  result.metadata.validation = validation;
  addCheck(result, 'MEASUREMENT_EVALUATED', `Measurement rule evaluated: ${validation.primary_metric || '(missing metric)'} ${validation.operator || '?'} ${validation.threshold ?? '?'}.`);
  return result;
}
