import {
  FINDING_SEVERITIES,
  FINDING_STATUSES,
  REVIEW_TYPES,
  REVIEW_VERDICTS,
  requiredReviewTypes,
} from '../constants.mjs';
import { hasMeaningfulValue, normalizeArray, parseIsoDate } from '../utils.mjs';
import { createGate, addCheck, addError, addWarning } from './result.mjs';
import { loadJsonForGate, loadYamlForGate } from './helpers.mjs';

const BLOCKING_SEVERITIES = new Set(['high', 'critical', 'blocker']);

export function gateReviews(vault, options = {}) {
  const result = createGate('reviews');
  const data = loadYamlForGate(result, vault, 'REVIEWS.yaml');
  const manifest = loadYamlForGate(result, vault, 'ASSET-MANIFEST.yaml', false);
  const claims = loadYamlForGate(result, vault, 'CLAIMS.yaml', false);
  const evidence = loadYamlForGate(result, vault, 'EVIDENCE.yaml', false);
  const state = loadJsonForGate(result, vault, 'run-state.json', false);
  if (!data) return result;
  const reviews = Array.isArray(data.reviews) ? data.reviews : null;
  if (!reviews) {
    addError(result, 'REVIEWS_TYPE', 'reviews must be an array.', 'REVIEWS.yaml:reviews');
    return result;
  }
  const assets = Array.isArray(manifest?.assets) ? manifest.assets : [];
  const assetById = new Map(assets.map((asset) => [asset?.id, asset]));
  const producers = new Map(assets.map((asset) => [asset?.id, asset?.producer]));
  const highRiskClaims = (Array.isArray(claims?.claims) ? claims.claims : []).some((claim) => ['high', 'regulated'].includes(claim?.risk));
  const legalEvidence = (Array.isArray(evidence?.evidence) ? evidence.evidence : []).some((item) => item?.kind === 'legal');
  const multipleMarkets = new Set(assets.map((asset) => asset?.language_market).filter(Boolean)).size > 1;
  const required = requiredReviewTypes(state?.mode, { highRiskClaims, legalEvidence, multipleMarkets });
  const seen = new Set();
  const passedTypes = new Set();
  const reviewIds = new Set();

  reviews.forEach((review, index) => {
    const location = `REVIEWS.yaml:reviews[${index}]`;
    if (!review || typeof review !== 'object' || Array.isArray(review)) {
      addError(result, 'REVIEW_ITEM_TYPE', 'Review must be a mapping.', location);
      return;
    }
    const id = String(review.id ?? '').trim();
    if (!/^RV-\d{3,}$/.test(id)) addError(result, 'REVIEW_ID', 'Review ID must match RV-001.', `${location}.id`);
    if (seen.has(id)) addError(result, 'REVIEW_DUPLICATE', `Duplicate review ID: ${id}`, `${location}.id`);
    seen.add(id);
    reviewIds.add(id);
    if (!REVIEW_TYPES.includes(review.type)) addError(result, 'REVIEW_TYPE', `Invalid review type: ${review.type}`, `${location}.type`);
    if (!hasMeaningfulValue(review.reviewer)) addError(result, 'REVIEW_REVIEWER', 'reviewer is required.', `${location}.reviewer`);
    if (!parseIsoDate(review.completed_at)) addError(result, 'REVIEW_DATE', 'completed_at must be an ISO date.', `${location}.completed_at`);
    if (!REVIEW_VERDICTS.includes(review.verdict)) addError(result, 'REVIEW_VERDICT', `Invalid verdict: ${review.verdict}`, `${location}.verdict`);
    if (options.forReady && review.verdict === 'fail') addError(result, 'REVIEW_FAILED', `${id} has verdict fail.`, `${location}.verdict`);
    if (['pass', 'pass_with_risk'].includes(review.verdict)) passedTypes.add(review.type);

    const scopedAssets = normalizeArray(review.asset_ids).filter(Boolean);
    const scope = scopedAssets.length > 0 ? scopedAssets : assets.map((asset) => asset?.id).filter(Boolean);
    for (const assetId of scopedAssets) {
      if (!assetById.has(assetId)) addError(result, 'REVIEW_ASSET_UNKNOWN', `${id} references unknown asset ${assetId}.`, `${location}.asset_ids`);
    }
    for (const assetId of scope) {
      if (review.reviewer && producers.get(assetId) === review.reviewer) addError(result, 'REVIEW_SELF_APPROVAL', `${id} reviewer produced ${assetId}.`, `${location}.reviewer`);
    }

    const findings = Array.isArray(review.findings) ? review.findings : [];
    findings.forEach((finding, findingIndex) => {
      const findingLocation = `${location}.findings[${findingIndex}]`;
      if (!finding || typeof finding !== 'object') {
        addError(result, 'FINDING_TYPE', 'Finding must be a mapping.', findingLocation);
        return;
      }
      if (!/^F-\d{3,}$/.test(String(finding.id ?? ''))) addError(result, 'FINDING_ID', 'Finding ID must match F-001.', `${findingLocation}.id`);
      if (!FINDING_SEVERITIES.includes(finding.severity)) addError(result, 'FINDING_SEVERITY', `Invalid severity: ${finding.severity}`, `${findingLocation}.severity`);
      if (!FINDING_STATUSES.includes(finding.status)) addError(result, 'FINDING_STATUS', `Invalid status: ${finding.status}`, `${findingLocation}.status`);
      if (!hasMeaningfulValue(finding.summary)) addError(result, 'FINDING_SUMMARY', 'Finding summary is required.', `${findingLocation}.summary`);
      if (options.forReady && BLOCKING_SEVERITIES.has(finding.severity) && finding.status === 'open') addError(result, 'FINDING_BLOCKING_OPEN', `${finding.id} is ${finding.severity} and still open.`, findingLocation);
      if (['critical', 'blocker'].includes(finding.severity) && finding.status === 'accepted') addError(result, 'FINDING_CANNOT_ACCEPT', `${finding.id} is ${finding.severity} and cannot be accepted as residual risk.`, findingLocation);
      if (finding.status === 'accepted') {
        if (!hasMeaningfulValue(finding.owner)) addError(result, 'FINDING_OWNER', `${finding.id} accepted risk needs an owner.`, `${findingLocation}.owner`);
        if (!hasMeaningfulValue(finding.accepted_by)) addError(result, 'FINDING_ACCEPTED_BY', `${finding.id} accepted risk needs accepted_by.`, `${findingLocation}.accepted_by`);
        if (!parseIsoDate(finding.accepted_at)) addError(result, 'FINDING_ACCEPTED_AT', `${finding.id} accepted risk needs accepted_at.`, `${findingLocation}.accepted_at`);
      }
      if (finding.severity === 'medium' && finding.status === 'open') addWarning(result, 'FINDING_MEDIUM_OPEN', `${finding.id} remains open.`, findingLocation);
    });
  });

  if (options.forReady) {
    for (const type of required) {
      if (!passedTypes.has(type)) addError(result, 'REVIEW_REQUIRED_MISSING', `Required review type has no passing record: ${type}`, 'REVIEWS.yaml');
    }
    for (const asset of assets) {
      const listed = normalizeArray(asset.reviewers).filter(Boolean);
      for (const reviewer of listed) {
        const exists = reviews.some((review) => review?.reviewer === reviewer && (normalizeArray(review.asset_ids).length === 0 || normalizeArray(review.asset_ids).includes(asset.id)));
        if (!exists) addError(result, 'ASSET_REVIEWER_UNRECORDED', `${asset.id} lists reviewer ${reviewer}, but no scoped review record exists.`, 'ASSET-MANIFEST.yaml');
      }
    }
  }

  result.metadata.requiredTypes = required;
  result.metadata.passedTypes = [...passedTypes];
  result.metadata.reviewIds = [...reviewIds];
  addCheck(result, 'REVIEW_COUNT', `${reviews.length} review record(s) parsed; required types: ${required.join(', ')}.`);
  return result;
}
