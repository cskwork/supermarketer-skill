import crypto from 'node:crypto';
import { hasMeaningfulValue, normalizeArray, parseIsoDate } from '../utils.mjs';
import { verifyReadinessAttestation } from '../attestation.mjs';
import { createGate, addCheck, addError } from './result.mjs';
import { loadYamlForGate } from './helpers.mjs';

const ACTIONS = new Set(['publish', 'send', 'schedule', 'spend']);

export function gatePublish(vault, options = {}) {
  const result = createGate('publish');
  const approvals = loadYamlForGate(result, vault, 'APPROVALS.yaml');
  const manifest = loadYamlForGate(result, vault, 'ASSET-MANIFEST.yaml', false);
  if (!approvals) return result;
  const attestation = verifyReadinessAttestation(vault);
  for (const error of attestation.errors) addError(result, error.code, error.message, error.location);
  result.metadata.readinessAttestation = attestation;
  const records = Array.isArray(approvals.approvals) ? approvals.approvals : null;
  if (!records) {
    addError(result, 'APPROVALS_TYPE', 'approvals must be an array.', 'APPROVALS.yaml:approvals');
    return result;
  }
  const approvalId = options.approvalId;
  if (!approvalId) {
    addError(result, 'APPROVAL_ID_REQUIRED', 'A specific approval ID is required.', 'APPROVALS.yaml');
    return result;
  }
  const approval = records.find((item) => item?.id === approvalId);
  if (!approval) {
    addError(result, 'APPROVAL_NOT_FOUND', `Approval not found: ${approvalId}`, 'APPROVALS.yaml');
    return result;
  }
  if (approval.type !== 'publish') addError(result, 'APPROVAL_TYPE', `${approvalId} is not a publish approval.`, `APPROVALS.yaml:${approvalId}.type`);
  if (approval.decision !== 'approved') addError(result, 'APPROVAL_DECISION', `${approvalId} is not approved.`, `APPROVALS.yaml:${approvalId}.decision`);
  if (approval.recorded_from !== 'user_explicit') addError(result, 'APPROVAL_SOURCE', 'Approval must be recorded_from: user_explicit.', `APPROVALS.yaml:${approvalId}.recorded_from`);
  if (!hasMeaningfulValue(approval.user_quote) || String(approval.user_quote).trim().length < 4) addError(result, 'APPROVAL_QUOTE', 'Record the user’s explicit approval quote.', `APPROVALS.yaml:${approvalId}.user_quote`);
  if (!hasMeaningfulValue(approval.approver)) addError(result, 'APPROVAL_APPROVER', 'approver is required.', `APPROVALS.yaml:${approvalId}.approver`);
  if (/^(?:assistant|agent|ai|model|system)$/i.test(String(approval.approver ?? '').trim())) addError(result, 'APPROVAL_NON_HUMAN', 'The producing agent cannot be the approval owner.', `APPROVALS.yaml:${approvalId}.approver`);
  const approvedAt = parseIsoDate(approval.approved_at);
  const expiresAt = parseIsoDate(approval.expires_at);
  if (!approvedAt) addError(result, 'APPROVAL_DATE', 'approved_at must be an ISO date-time.', `APPROVALS.yaml:${approvalId}.approved_at`);
  if (!expiresAt) addError(result, 'APPROVAL_EXPIRY', 'expires_at must be an ISO date-time.', `APPROVALS.yaml:${approvalId}.expires_at`);
  if (expiresAt && expiresAt <= (options.now ?? new Date())) addError(result, 'APPROVAL_EXPIRED', `${approvalId} is expired.`, `APPROVALS.yaml:${approvalId}.expires_at`);
  if (approvedAt && expiresAt && approvedAt >= expiresAt) addError(result, 'APPROVAL_DATE_ORDER', 'approved_at must precede expires_at.', `APPROVALS.yaml:${approvalId}`);
  const actions = normalizeArray(approval.actions).filter(Boolean);
  if (actions.length === 0) addError(result, 'APPROVAL_ACTIONS', 'At least one scoped action is required.', `APPROVALS.yaml:${approvalId}.actions`);
  for (const action of actions) if (!ACTIONS.has(action)) addError(result, 'APPROVAL_ACTION_INVALID', `Invalid action: ${action}`, `APPROVALS.yaml:${approvalId}.actions`);
  const assetIds = normalizeArray(approval.asset_ids).filter(Boolean);
  if (assetIds.length === 0) addError(result, 'APPROVAL_ASSETS', 'Publish approval must name exact asset IDs.', `APPROVALS.yaml:${approvalId}.asset_ids`);
  const assets = Array.isArray(manifest?.assets) ? manifest.assets : [];
  const assetById = new Map(assets.map((asset) => [asset?.id, asset]));
  for (const assetId of assetIds) {
    const asset = assetById.get(assetId);
    if (!asset) addError(result, 'APPROVAL_ASSET_UNKNOWN', `Unknown approved asset: ${assetId}`, `APPROVALS.yaml:${approvalId}.asset_ids`);
    else if (asset.status !== 'approved' || asset.review_status !== 'approved') addError(result, 'APPROVAL_ASSET_NOT_READY', `${assetId} is not approved in the manifest.`, `APPROVALS.yaml:${approvalId}.asset_ids`);
  }
  for (const field of ['destination', 'account', 'timing']) {
    if (!hasMeaningfulValue(approval[field])) addError(result, 'APPROVAL_SCOPE_FIELD', `${field} is required.`, `APPROVALS.yaml:${approvalId}.${field}`);
  }
  if (actions.includes('send') && !hasMeaningfulValue(approval.recipient_scope)) addError(result, 'APPROVAL_RECIPIENTS', 'send approval requires recipient_scope.', `APPROVALS.yaml:${approvalId}.recipient_scope`);
  if (actions.includes('spend')) {
    if (!hasMeaningfulValue(approval.budget_currency)) addError(result, 'APPROVAL_CURRENCY', 'spend approval requires budget_currency.', `APPROVALS.yaml:${approvalId}.budget_currency`);
    if (!Number.isFinite(Number(approval.budget_max)) || Number(approval.budget_max) <= 0) addError(result, 'APPROVAL_BUDGET', 'spend approval requires a positive budget_max.', `APPROVALS.yaml:${approvalId}.budget_max`);
  }
  const permitBasis = JSON.stringify({ approvalId, assetIds, actions, destination: approval.destination, account: approval.account, expires_at: approval.expires_at });
  result.metadata.permit = {
    approval_id: approvalId,
    asset_ids: assetIds,
    actions,
    destination: approval.destination,
    account: approval.account,
    timing: approval.timing,
    expires_at: approval.expires_at,
    fingerprint: crypto.createHash('sha256').update(permitBasis).digest('hex'),
  };
  addCheck(result, 'PUBLISH_APPROVAL_CHECKED', `Scoped approval ${approvalId} checked for ${assetIds.length} asset(s).`);
  return result;
}
