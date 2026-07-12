import path from 'node:path';
import { EVIDENCE_PREFIX_KIND } from '../constants.mjs';
import { ageInDays, hasMeaningfulValue, parseIsoDate, safeResolve } from '../utils.mjs';
import { createGate, addCheck, addError, addWarning } from './result.mjs';
import { isHttpUrl, loadYamlForGate, safeFile, validateUrl } from './helpers.mjs';

const SOURCE_TYPES = new Set(['approved_internal', 'official', 'regulator', 'first_party', 'independent', 'customer_interview', 'customer_provided', 'analytics_export']);
const CONFIDENCE = new Set(['low', 'medium', 'high']);
const PERMISSIONS = new Set(['not_applicable', 'cleared', 'pending', 'restricted']);
const DEFAULT_MAX_AGE = Object.freeze({ product: 365, customer: 730, market: 180, channel: 90, legal: 90, analytics: 45 });

export function gateEvidence(vault, options = {}) {
  const result = createGate('evidence');
  const data = loadYamlForGate(result, vault, 'EVIDENCE.yaml');
  if (!data) return result;
  const items = Array.isArray(data.evidence) ? data.evidence : null;
  if (!items) {
    addError(result, 'EVIDENCE_TYPE', 'evidence must be an array.', 'EVIDENCE.yaml:evidence');
    return result;
  }
  if (options.forReady && items.length === 0) addError(result, 'EVIDENCE_EMPTY', 'At least one grounded evidence item is required for readiness.', 'EVIDENCE.yaml:evidence');
  const seen = new Set();
  const now = options.now ?? new Date();
  const byId = new Map();
  let legalEvidence = false;

  items.forEach((item, index) => {
    const location = `EVIDENCE.yaml:evidence[${index}]`;
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      addError(result, 'EVIDENCE_ITEM_TYPE', 'Evidence entry must be a mapping.', location);
      return;
    }
    const id = String(item.id ?? '').trim();
    const match = id.match(/^([PCMSLA])-\d{3,}$/);
    if (!match) addError(result, 'EVIDENCE_ID', 'Evidence ID must match P-001, C-001, M-001, S-001, L-001, or A-001.', `${location}.id`);
    if (seen.has(id)) addError(result, 'EVIDENCE_DUPLICATE', `Duplicate evidence ID: ${id}`, `${location}.id`);
    if (id) seen.add(id);
    const expectedKind = match ? EVIDENCE_PREFIX_KIND[match[1]] : null;
    const kind = String(item.kind ?? '').trim().toLowerCase();
    if (!Object.values(EVIDENCE_PREFIX_KIND).includes(kind)) addError(result, 'EVIDENCE_KIND', `Invalid evidence kind: ${kind}`, `${location}.kind`);
    if (expectedKind && kind !== expectedKind) addError(result, 'EVIDENCE_KIND_MISMATCH', `${id} must use kind ${expectedKind}.`, `${location}.kind`);
    if (kind === 'legal') legalEvidence = true;
    if (!hasMeaningfulValue(item.statement)) addError(result, 'EVIDENCE_STATEMENT', 'Evidence statement is required.', `${location}.statement`);
    if (!SOURCE_TYPES.has(item.source_type)) addError(result, 'EVIDENCE_SOURCE_TYPE', `Invalid source_type: ${item.source_type}`, `${location}.source_type`);
    if (!CONFIDENCE.has(item.confidence)) addError(result, 'EVIDENCE_CONFIDENCE', `confidence must be low, medium, or high.`, `${location}.confidence`);
    if (options.forReady && item.confidence === 'low') addError(result, 'EVIDENCE_LOW_CONFIDENCE', `${id} has low confidence and cannot support readiness.`, `${location}.confidence`);
    if (!PERMISSIONS.has(item.permission_status ?? 'not_applicable')) addError(result, 'EVIDENCE_PERMISSION', `Invalid permission_status: ${item.permission_status}`, `${location}.permission_status`);
    if (options.forReady && ['pending', 'restricted'].includes(item.permission_status)) addError(result, 'EVIDENCE_PERMISSION_BLOCKED', `${id} does not have usable permission.`, `${location}.permission_status`);
    if (kind === 'customer' && !['cleared', 'not_applicable'].includes(item.permission_status)) addError(result, 'CUSTOMER_PERMISSION', 'Customer evidence needs cleared permission or an explicit not_applicable rationale.', `${location}.permission_status`);
    if (kind === 'legal' && !hasMeaningfulValue(item.jurisdiction)) addError(result, 'LEGAL_JURISDICTION', 'Legal evidence requires jurisdiction/platform scope.', `${location}.jurisdiction`);

    const source = String(item.source ?? '').trim();
    if (!source) addError(result, 'EVIDENCE_SOURCE', 'Evidence source is required.', `${location}.source`);
    else if (isHttpUrl(source)) validateUrl(result, source, `${location}.source`, { requireHttps: options.requireHttpsSources === true });
    else if (/^internal:\/\//.test(source)) {
      if (!hasMeaningfulValue(item.owner)) addError(result, 'INTERNAL_OWNER', 'internal:// sources require an accountable owner.', `${location}.owner`);
    } else {
      safeFile(result, vault, source, `${location}.source`);
    }

    const checked = parseIsoDate(item.checked_at);
    if (!checked) addError(result, 'EVIDENCE_DATE', 'checked_at must be an ISO date.', `${location}.checked_at`);
    else {
      const age = ageInDays(checked, now);
      if (age < -1) addError(result, 'EVIDENCE_FUTURE', 'checked_at cannot be in the future.', `${location}.checked_at`);
      const timeSensitive = item.time_sensitive ?? ['market', 'channel', 'legal', 'analytics'].includes(kind);
      const maxAge = Number(item.max_age_days ?? DEFAULT_MAX_AGE[kind]);
      if (timeSensitive && age !== null && Number.isFinite(maxAge) && age > maxAge) {
        const method = options.forReady ? addError : addWarning;
        method(result, 'EVIDENCE_STALE', `${id} is ${age} days old; maximum is ${maxAge}.`, `${location}.checked_at`);
      }
    }
    if (id) byId.set(id, item);
  });

  result.metadata.ids = [...seen];
  result.metadata.byId = Object.fromEntries(byId);
  result.metadata.legalEvidence = legalEvidence;
  addCheck(result, 'EVIDENCE_COUNT', `${items.length} evidence item(s) parsed.`);
  return result;
}
