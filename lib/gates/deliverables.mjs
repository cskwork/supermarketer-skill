import { ASSET_KINDS } from '../constants.mjs';
import { hasMeaningfulValue, normalizeArray, parseDimensions } from '../utils.mjs';
import { createGate, addCheck, addError, addWarning } from './result.mjs';
import { loadYamlForGate } from './helpers.mjs';

export function gateDeliverables(vault, options = {}) {
  const result = createGate('deliverables');
  const data = loadYamlForGate(result, vault, 'DELIVERABLES.yaml');
  const manifest = loadYamlForGate(result, vault, 'ASSET-MANIFEST.yaml', false);
  if (!data) return result;
  const deliverables = Array.isArray(data.deliverables) ? data.deliverables : null;
  if (!deliverables) {
    addError(result, 'DELIVERABLES_TYPE', 'deliverables must be an array.', 'DELIVERABLES.yaml:deliverables');
    return result;
  }
  if (options.forReady && deliverables.length === 0) addError(result, 'DELIVERABLES_EMPTY', 'At least one structured deliverable is required.', 'DELIVERABLES.yaml:deliverables');
  const assets = Array.isArray(manifest?.assets) ? manifest.assets : [];
  const assetById = new Map(assets.map((asset) => [asset?.id, asset]));
  const seen = new Set();
  const ids = [];

  deliverables.forEach((deliverable, index) => {
    const location = `DELIVERABLES.yaml:deliverables[${index}]`;
    if (!deliverable || typeof deliverable !== 'object' || Array.isArray(deliverable)) {
      addError(result, 'DELIVERABLE_ITEM_TYPE', 'Deliverable must be a mapping.', location);
      return;
    }
    const id = String(deliverable.id ?? '').trim();
    if (!/^D-\d{3,}$/.test(id)) addError(result, 'DELIVERABLE_ID', 'Deliverable ID must match D-001.', `${location}.id`);
    if (seen.has(id)) addError(result, 'DELIVERABLE_DUPLICATE', `Duplicate deliverable ID: ${id}`, `${location}.id`);
    seen.add(id);
    ids.push(id);
    if (!hasMeaningfulValue(deliverable.description)) addError(result, 'DELIVERABLE_DESCRIPTION', 'description is required.', `${location}.description`);
    if (!ASSET_KINDS.includes(deliverable.kind)) addError(result, 'DELIVERABLE_KIND', `Invalid kind: ${deliverable.kind}`, `${location}.kind`);
    if (!hasMeaningfulValue(deliverable.channel)) addError(result, 'DELIVERABLE_CHANNEL', 'channel is required; use internal when appropriate.', `${location}.channel`);
    if (!hasMeaningfulValue(deliverable.placement)) addError(result, 'DELIVERABLE_PLACEMENT', 'placement is required; use report/deck when appropriate.', `${location}.placement`);
    if (!hasMeaningfulValue(deliverable.language_market)) addError(result, 'DELIVERABLE_MARKET', 'language_market is required.', `${location}.language_market`);
    if (deliverable.required !== true && deliverable.required !== false) addError(result, 'DELIVERABLE_REQUIRED_TYPE', 'required must be true or false.', `${location}.required`);
    if (deliverable.expected_dimensions && !parseDimensions(deliverable.expected_dimensions)) addError(result, 'DELIVERABLE_DIMENSIONS', 'expected_dimensions must use WIDTHxHEIGHT.', `${location}.expected_dimensions`);
    if (deliverable.expected_duration_seconds !== null && deliverable.expected_duration_seconds !== undefined && (!Number.isFinite(Number(deliverable.expected_duration_seconds)) || Number(deliverable.expected_duration_seconds) <= 0)) {
      addError(result, 'DELIVERABLE_DURATION', 'expected_duration_seconds must be a positive number or null.', `${location}.expected_duration_seconds`);
    }
    const fulfillment = normalizeArray(deliverable.fulfillment_asset_ids).filter(Boolean);
    if (options.forReady && deliverable.required && fulfillment.length === 0) addError(result, 'DELIVERABLE_UNFULFILLED', `${id} has no fulfillment asset.`, `${location}.fulfillment_asset_ids`);
    for (const assetId of fulfillment) {
      const asset = assetById.get(assetId);
      if (!asset) {
        addError(result, 'DELIVERABLE_ASSET_UNKNOWN', `${id} references unknown asset ${assetId}.`, `${location}.fulfillment_asset_ids`);
        continue;
      }
      if (asset.kind && deliverable.kind && asset.kind !== deliverable.kind) addError(result, 'DELIVERABLE_KIND_MISMATCH', `${assetId} kind ${asset.kind} does not satisfy ${id} kind ${deliverable.kind}.`, `${location}.fulfillment_asset_ids`);
      if (asset.channel && String(asset.channel).toLowerCase() !== String(deliverable.channel).toLowerCase()) addError(result, 'DELIVERABLE_CHANNEL_MISMATCH', `${assetId} channel does not match ${id}.`, `${location}.fulfillment_asset_ids`);
      if (asset.placement && String(asset.placement).toLowerCase() !== String(deliverable.placement).toLowerCase()) addError(result, 'DELIVERABLE_PLACEMENT_MISMATCH', `${assetId} placement does not match ${id}.`, `${location}.fulfillment_asset_ids`);
      if (asset.language_market && String(asset.language_market).toLowerCase() !== String(deliverable.language_market).toLowerCase()) addWarning(result, 'DELIVERABLE_MARKET_MISMATCH', `${assetId} language_market differs from ${id}.`, `${location}.fulfillment_asset_ids`);
      const fallback = asset.fallback_status ?? 'none';
      if (fallback !== 'none' && deliverable.fallback_allowed !== true) addError(result, 'DELIVERABLE_FALLBACK_NOT_ALLOWED', `${id} does not allow fallback but ${assetId} uses ${fallback}.`, `${location}.fallback_allowed`);
      if (fallback !== 'none' && options.forReady && !hasMeaningfulValue(deliverable.fallback_accepted_by)) addError(result, 'DELIVERABLE_FALLBACK_UNACCEPTED', `${id} fallback is not accepted by an approval owner.`, `${location}.fallback_accepted_by`);
    }
  });
  const fulfilledIds = new Set(deliverables.flatMap((item) => normalizeArray(item?.fulfillment_asset_ids)));
  for (const asset of assets) {
    if (asset?.id && !fulfilledIds.has(asset.id)) addWarning(result, 'ORPHAN_ASSET', `${asset.id} does not fulfill any structured deliverable.`, 'ASSET-MANIFEST.yaml');
  }
  result.metadata.ids = ids;
  result.metadata.deliverables = deliverables;
  addCheck(result, 'DELIVERABLE_COUNT', `${deliverables.length} deliverable(s) parsed.`);
  return result;
}
