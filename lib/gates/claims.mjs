import { CLAIM_APPROVALS, CLAIM_RISKS, CLAIM_TYPES } from '../constants.mjs';
import { ageInDays, hasMeaningfulValue, normalizeArray, parseIsoDate } from '../utils.mjs';
import { createGate, addCheck, addError, addWarning } from './result.mjs';
import { loadYamlForGate } from './helpers.mjs';

const NO_EVIDENCE_REQUIRED = new Set(['subjective', 'aspirational']);
const PREFIX_RULES = Object.freeze({
  testimonial: ['C'],
  performance: ['P', 'A'],
  comparative: ['P', 'M'],
  certification: ['P', 'L'],
  quantitative: ['P', 'A', 'M'],
  pricing: ['P'],
  availability: ['P'],
  promotional: ['P', 'L'],
});

function hasAllowedPrefix(ids, allowed) {
  return ids.some((id) => allowed.includes(String(id).charAt(0)));
}

export function gateClaims(vault, options = {}) {
  const result = createGate('claims');
  const data = loadYamlForGate(result, vault, 'CLAIMS.yaml');
  const evidence = loadYamlForGate(result, vault, 'EVIDENCE.yaml', false);
  const manifest = loadYamlForGate(result, vault, 'ASSET-MANIFEST.yaml', false);
  if (!data) return result;
  const claims = Array.isArray(data.claims) ? data.claims : null;
  if (!claims) {
    addError(result, 'CLAIMS_TYPE', 'claims must be an array.', 'CLAIMS.yaml:claims');
    return result;
  }
  const evidenceIds = new Set((Array.isArray(evidence?.evidence) ? evidence.evidence : []).map((item) => item?.id).filter(Boolean));
  const evidenceById = new Map((Array.isArray(evidence?.evidence) ? evidence.evidence : []).map((item) => [item?.id, item]));
  const assetIds = new Set((Array.isArray(manifest?.assets) ? manifest.assets : []).map((item) => item?.id).filter(Boolean));
  const seen = new Set();
  let highRiskClaims = false;
  const now = options.now ?? new Date();

  claims.forEach((claim, index) => {
    const location = `CLAIMS.yaml:claims[${index}]`;
    if (!claim || typeof claim !== 'object' || Array.isArray(claim)) {
      addError(result, 'CLAIM_ITEM_TYPE', 'Claim entry must be a mapping.', location);
      return;
    }
    const id = String(claim.id ?? '').trim();
    if (!/^CL-\d{3,}$/.test(id)) addError(result, 'CLAIM_ID', 'Claim ID must match CL-001.', `${location}.id`);
    if (seen.has(id)) addError(result, 'CLAIM_DUPLICATE', `Duplicate claim ID: ${id}`, `${location}.id`);
    if (id) seen.add(id);
    if (!hasMeaningfulValue(claim.text)) addError(result, 'CLAIM_TEXT', 'Claim text is required.', `${location}.text`);
    if (!CLAIM_TYPES.includes(claim.type)) addError(result, 'CLAIM_TYPE', `Invalid claim type: ${claim.type}`, `${location}.type`);
    if (!CLAIM_RISKS.includes(claim.risk ?? 'low')) addError(result, 'CLAIM_RISK', `Invalid claim risk: ${claim.risk}`, `${location}.risk`);
    if (['high', 'regulated'].includes(claim.risk)) highRiskClaims = true;
    if (!CLAIM_APPROVALS.includes(claim.approval ?? 'pending')) addError(result, 'CLAIM_APPROVAL', `Invalid approval status: ${claim.approval}`, `${location}.approval`);

    const evidenceRefs = normalizeArray(claim.evidence_ids).filter(Boolean);
    if (!NO_EVIDENCE_REQUIRED.has(claim.type) && evidenceRefs.length === 0) addError(result, 'CLAIM_EVIDENCE_EMPTY', `${id} requires evidence.`, `${location}.evidence_ids`);
    for (const evidenceId of evidenceRefs) {
      if (!evidenceIds.has(evidenceId)) addError(result, 'CLAIM_EVIDENCE_UNKNOWN', `${id} references unknown evidence ${evidenceId}.`, `${location}.evidence_ids`);
    }
    const prefixes = PREFIX_RULES[claim.type];
    if (prefixes && evidenceRefs.length > 0 && !hasAllowedPrefix(evidenceRefs, prefixes)) {
      addError(result, 'CLAIM_EVIDENCE_CLASS', `${claim.type} claim ${id} needs at least one ${prefixes.join('/')} evidence ID.`, `${location}.evidence_ids`);
    }
    if (claim.type === 'testimonial') {
      for (const evidenceId of evidenceRefs.filter((entry) => String(entry).startsWith('C-'))) {
        const item = evidenceById.get(evidenceId);
        if (item && item.permission_status !== 'cleared') addError(result, 'TESTIMONIAL_PERMISSION', `${id} uses ${evidenceId} without cleared permission.`, `${location}.evidence_ids`);
      }
    }

    const mappedAssets = normalizeArray(claim.asset_ids).filter(Boolean);
    if (options.forReady && mappedAssets.length === 0) addError(result, 'CLAIM_ASSET_EMPTY', `${id} is not mapped to any asset.`, `${location}.asset_ids`);
    for (const assetId of mappedAssets) {
      if (!assetIds.has(assetId)) addError(result, 'CLAIM_ASSET_UNKNOWN', `${id} references unknown asset ${assetId}.`, `${location}.asset_ids`);
    }

    if (options.forReady && !['approved', 'conditional'].includes(claim.approval)) addError(result, 'CLAIM_NOT_APPROVED', `${id} is ${claim.approval ?? 'pending'}.`, `${location}.approval`);
    if (['approved', 'conditional'].includes(claim.approval)) {
      if (!hasMeaningfulValue(claim.approver)) addError(result, 'CLAIM_APPROVER', `${id} needs an approver.`, `${location}.approver`);
      if (!parseIsoDate(claim.approved_at)) addError(result, 'CLAIM_APPROVED_AT', `${id} needs approved_at as an ISO date.`, `${location}.approved_at`);
    }
    if (claim.approval === 'conditional' && !hasMeaningfulValue(claim.qualification)) addError(result, 'CLAIM_QUALIFICATION', `${id} is conditional but has no qualification.`, `${location}.qualification`);
    if (claim.risk === 'regulated' && !evidenceRefs.some((entry) => String(entry).startsWith('L-'))) addError(result, 'REGULATED_LEGAL_EVIDENCE', `${id} is regulated and needs L- evidence.`, `${location}.evidence_ids`);
    if (claim.risk === 'regulated' && !hasMeaningfulValue(claim.jurisdiction)) addError(result, 'REGULATED_JURISDICTION', `${id} is regulated and needs jurisdiction.`, `${location}.jurisdiction`);

    if (claim.expires_at) {
      const expiry = parseIsoDate(claim.expires_at);
      if (!expiry) addError(result, 'CLAIM_EXPIRY_DATE', `${id} has invalid expires_at.`, `${location}.expires_at`);
      else if (ageInDays(expiry, now) > 0) addError(result, 'CLAIM_EXPIRED', `${id} approval expired on ${claim.expires_at}.`, `${location}.expires_at`);
    }

    const text = String(claim.text ?? '');
    if (/\b(?:best|#1|number one|guaranteed|always|never fails|only)\b|최고|1위|유일|보장|절대/i.test(text) && !['high', 'regulated'].includes(claim.risk)) {
      addWarning(result, 'CLAIM_SUPERLATIVE_RISK', `${id} contains an absolute/superlative expression but is not marked high or regulated risk.`, `${location}.text`);
    }
    if (/\bfree\b|무료/i.test(text) && !hasMeaningfulValue(claim.qualification)) {
      addWarning(result, 'CLAIM_FREE_QUALIFIER', `${id} says “free” without a qualification field.`, `${location}.qualification`);
    }
  });

  result.metadata.ids = [...seen];
  result.metadata.highRiskClaims = highRiskClaims;
  addCheck(result, 'CLAIM_COUNT', `${claims.length} claim(s) parsed.`);
  return result;
}
