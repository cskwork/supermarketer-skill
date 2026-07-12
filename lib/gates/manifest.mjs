import fs from 'node:fs';
import path from 'node:path';
import {
  ASSET_KINDS,
  ASSET_STATUSES,
  FALLBACK_STATUSES,
  MODES,
  RIGHTS_STATUSES,
} from '../constants.mjs';
import {
  dimensionsString,
  hasMeaningfulValue,
  nearlyEqual,
  normalizeArray,
  parseAspectRatio,
  parseDimensions,
  parseIsoDate,
} from '../utils.mjs';
import { inspectAssetFile } from '../media/inspect.mjs';
import { createGate, addCheck, addError, addWarning } from './result.mjs';
import { loadJsonForGate, loadTextForGate, loadYamlForGate, safeFile, validateUrl } from './helpers.mjs';

function normalizedExtension(filePath) {
  const extension = path.extname(filePath).toLowerCase().replace(/^\./, '');
  return extension === 'jpeg' ? 'jpg' : extension;
}

function normalizedAllowedType(value) {
  const type = String(value).toLowerCase().replace(/^\./, '');
  return type === 'jpeg' ? 'jpg' : type;
}

function findChannelSpec(specs, asset) {
  const channel = String(asset.channel ?? '').toLowerCase();
  const placement = String(asset.placement ?? '').toLowerCase();
  const market = String(asset.language_market ?? '').toLowerCase();
  return specs.find((spec) => String(spec.channel ?? spec.name ?? '').toLowerCase() === channel
    && String(spec.placement ?? '').toLowerCase() === placement
    && String(spec.language_market ?? '*').toLowerCase() === market)
    ?? specs.find((spec) => String(spec.channel ?? spec.name ?? '').toLowerCase() === channel
      && String(spec.placement ?? '').toLowerCase() === placement
      && ['*', 'all', 'global'].includes(String(spec.language_market ?? '*').toLowerCase()));
}

function countCharacters(value) {
  return [...String(value ?? '')].length;
}

function checkCopyConstraints(result, asset, spec, location) {
  const constraints = spec?.text_constraints;
  if (!constraints || typeof constraints !== 'object') return;
  const copy = asset.copy && typeof asset.copy === 'object' ? asset.copy : {};
  for (const [key, maximum] of Object.entries(constraints)) {
    const numeric = Number(maximum);
    if (!Number.isFinite(numeric)) continue;
    if (key === 'total_max_chars') {
      const total = Object.values(copy).filter((value) => typeof value === 'string').reduce((sum, value) => sum + countCharacters(value), 0);
      if (total > numeric) addError(result, 'COPY_TOTAL_LIMIT', `${asset.id} copy total is ${total} characters; limit is ${numeric}.`, `${location}.copy`);
      continue;
    }
    const field = key.replace(/_max_chars$/, '');
    if (!key.endsWith('_max_chars')) continue;
    if (copy[field] !== undefined && countCharacters(copy[field]) > numeric) {
      addError(result, 'COPY_FIELD_LIMIT', `${asset.id} ${field} is ${countCharacters(copy[field])} characters; limit is ${numeric}.`, `${location}.copy.${field}`);
    }
  }
}

function checkDimensions(result, asset, metadata, spec, location) {
  const expected = parseDimensions(asset.expected?.dimensions ?? asset.dimensions);
  if (expected && metadata.width && metadata.height && (Number(metadata.width) !== expected.width || Number(metadata.height) !== expected.height)) {
    addError(result, 'ASSET_EXPECTED_DIMENSIONS', `${asset.id} is ${metadata.dimensions}; expected ${dimensionsString(expected.width, expected.height)}.`, `${location}.expected.dimensions`);
  }
  const expectedRatio = parseAspectRatio(asset.expected?.aspect_ratio ?? asset.aspect_ratio);
  if (expectedRatio && metadata.aspect_ratio && !nearlyEqual(metadata.aspect_ratio, expectedRatio, 0.015)) {
    addError(result, 'ASSET_EXPECTED_RATIO', `${asset.id} aspect ratio ${metadata.aspect_ratio.toFixed(4)} does not match expected ${expectedRatio.toFixed(4)}.`, `${location}.expected.aspect_ratio`);
  }
  const allowedDimensions = normalizeArray(spec?.dimensions).map(parseDimensions).filter(Boolean);
  if (allowedDimensions.length > 0 && metadata.width && metadata.height) {
    const allowed = allowedDimensions.some((item) => item.width === Number(metadata.width) && item.height === Number(metadata.height));
    if (!allowed) addError(result, 'ASSET_CHANNEL_DIMENSIONS', `${asset.id} is ${metadata.dimensions}; channel permits ${allowedDimensions.map((item) => dimensionsString(item.width, item.height)).join(', ')}.`, `${location}.rendered_path`);
  }
  const allowedRatios = normalizeArray(spec?.aspect_ratios).map(parseAspectRatio).filter(Boolean);
  if (allowedRatios.length > 0 && metadata.aspect_ratio) {
    const allowed = allowedRatios.some((ratio) => nearlyEqual(metadata.aspect_ratio, ratio, 0.015));
    if (!allowed) addError(result, 'ASSET_CHANNEL_RATIO', `${asset.id} aspect ratio ${metadata.aspect_ratio.toFixed(4)} is not allowed.`, `${location}.rendered_path`);
  }
}

function checkDuration(result, asset, metadata, spec, location) {
  const duration = Number(metadata.duration_seconds);
  if (!Number.isFinite(duration)) return;
  const expected = Number(asset.expected?.duration_seconds ?? asset.duration_seconds);
  if (Number.isFinite(expected) && Math.abs(duration - expected) > Math.max(0.15, expected * 0.01)) {
    addError(result, 'ASSET_EXPECTED_DURATION', `${asset.id} duration is ${duration.toFixed(3)}s; expected ${expected}s.`, `${location}.expected.duration_seconds`);
  }
  const minimum = Number(spec?.duration_seconds?.min);
  const maximum = Number(spec?.duration_seconds?.max);
  if (Number.isFinite(minimum) && duration < minimum - 0.05) addError(result, 'ASSET_CHANNEL_DURATION_MIN', `${asset.id} duration ${duration.toFixed(3)}s is below ${minimum}s.`, `${location}.rendered_path`);
  if (Number.isFinite(maximum) && duration > maximum + 0.05) addError(result, 'ASSET_CHANNEL_DURATION_MAX', `${asset.id} duration ${duration.toFixed(3)}s exceeds ${maximum}s.`, `${location}.rendered_path`);
}

function checkCaptionFile(result, filePath, location) {
  const text = loadTextForGate(result, path.dirname(filePath), path.basename(filePath), false);
  if (!text) return;
  if (!/\d{2}:\d{2}:\d{2}[,.]\d{3}\s+-->\s+\d{2}:\d{2}:\d{2}[,.]\d{3}/.test(text)) {
    addError(result, 'CAPTION_TIMECODE', 'Caption file has no valid SRT/VTT-style timecode.', location);
  }
}

export function gateManifest(vault, options = {}) {
  const result = createGate('asset-manifest');
  const data = loadYamlForGate(result, vault, 'ASSET-MANIFEST.yaml');
  const state = loadJsonForGate(result, vault, 'run-state.json', false);
  const claims = loadYamlForGate(result, vault, 'CLAIMS.yaml', false);
  const deliverables = loadYamlForGate(result, vault, 'DELIVERABLES.yaml', false);
  const channelData = loadYamlForGate(result, vault, 'CHANNEL-SPECS.yaml', false);
  const packsData = loadYamlForGate(result, vault, 'PRODUCTION-PACK.yaml', false);
  if (!data) return result;
  if (!data.run || typeof data.run !== 'object') addError(result, 'MANIFEST_RUN', 'run metadata is required.', 'ASSET-MANIFEST.yaml:run');
  else {
    if (!hasMeaningfulValue(data.run.id)) addError(result, 'MANIFEST_RUN_ID', 'run.id is required.', 'ASSET-MANIFEST.yaml:run.id');
    if (!MODES.includes(data.run.mode)) addError(result, 'MANIFEST_MODE', `Invalid run.mode: ${data.run.mode}`, 'ASSET-MANIFEST.yaml:run.mode');
    if (!parseIsoDate(data.run.created_at)) addError(result, 'MANIFEST_CREATED_AT', 'run.created_at must be an ISO date.', 'ASSET-MANIFEST.yaml:run.created_at');
    if (state?.run_id && data.run.id !== state.run_id) addError(result, 'MANIFEST_STATE_ID', 'Manifest run.id does not match run-state.json.', 'ASSET-MANIFEST.yaml:run.id');
    if (state?.mode && data.run.mode !== state.mode) addError(result, 'MANIFEST_STATE_MODE', 'Manifest run.mode does not match run-state.json.', 'ASSET-MANIFEST.yaml:run.mode');
  }
  const assets = Array.isArray(data.assets) ? data.assets : null;
  if (!assets) {
    addError(result, 'ASSETS_TYPE', 'assets must be an array.', 'ASSET-MANIFEST.yaml:assets');
    return result;
  }
  if (options.forReady && assets.length === 0) addError(result, 'ASSETS_EMPTY', 'At least one deliverable asset is required.', 'ASSET-MANIFEST.yaml:assets');

  const claimIds = new Set((Array.isArray(claims?.claims) ? claims.claims : []).map((item) => item?.id).filter(Boolean));
  const deliverableIds = new Set((Array.isArray(deliverables?.deliverables) ? deliverables.deliverables : []).map((item) => item?.id).filter(Boolean));
  const specs = Array.isArray(channelData?.channels) ? channelData.channels : [];
  const packById = new Map((Array.isArray(packsData?.packs) ? packsData.packs : []).map((pack) => [pack?.id, pack]));
  const seen = new Set();
  const inspected = {};
  const producers = {};
  const markets = new Set();

  assets.forEach((asset, index) => {
    const location = `ASSET-MANIFEST.yaml:assets[${index}]`;
    if (!asset || typeof asset !== 'object' || Array.isArray(asset)) {
      addError(result, 'ASSET_ITEM_TYPE', 'Asset must be a mapping.', location);
      return;
    }
    const id = String(asset.id ?? '').trim();
    if (!/^ASSET-\d{3,}$/.test(id)) addError(result, 'ASSET_ID', 'Asset ID must match ASSET-001.', `${location}.id`);
    if (seen.has(id)) addError(result, 'ASSET_DUPLICATE', `Duplicate asset ID: ${id}`, `${location}.id`);
    seen.add(id);
    if (!ASSET_KINDS.includes(asset.kind)) addError(result, 'ASSET_KIND', `Invalid kind: ${asset.kind}`, `${location}.kind`);
    if (!ASSET_STATUSES.includes(asset.status)) addError(result, 'ASSET_STATUS', `Invalid status: ${asset.status}`, `${location}.status`);
    for (const field of ['name', 'purpose', 'audience', 'channel', 'placement', 'language_market', 'producer', 'generation_method']) {
      if (!hasMeaningfulValue(asset[field])) addError(result, 'ASSET_FIELD', `${field} is required.`, `${location}.${field}`);
    }
    if (asset.language_market) markets.add(String(asset.language_market));
    producers[id] = asset.producer;
    if (!FALLBACK_STATUSES.includes(asset.fallback_status ?? 'none')) addError(result, 'ASSET_FALLBACK', `Invalid fallback_status: ${asset.fallback_status}`, `${location}.fallback_status`);
    if (!RIGHTS_STATUSES.includes(asset.rights_status)) addError(result, 'ASSET_RIGHTS', `Invalid rights_status: ${asset.rights_status}`, `${location}.rights_status`);
    if (options.forReady && ['pending', 'restricted'].includes(asset.rights_status)) addError(result, 'ASSET_RIGHTS_BLOCKED', `${id} rights are ${asset.rights_status}.`, `${location}.rights_status`);
    if (asset.rights_status === 'licensed' && normalizeArray(asset.rights_sources).length === 0) addError(result, 'ASSET_LICENSE_SOURCE', `${id} is licensed but has no rights_sources.`, `${location}.rights_sources`);
    if (asset.ai_generated === true) {
      if (!hasMeaningfulValue(asset.model_or_tool ?? asset.adapter)) addError(result, 'ASSET_AI_TOOL', `${id} is AI-generated but model_or_tool/adapter is empty.`, `${location}.model_or_tool`);
      safeFile(result, vault, asset.lineage_path, `${location}.lineage_path`);
    }

    for (const [sourceIndex, sourcePath] of normalizeArray(asset.source_paths ?? asset.source_path).filter(Boolean).entries()) {
      safeFile(result, vault, sourcePath, `${location}.source_paths[${sourceIndex}]`);
    }
    if (asset.preview_path) safeFile(result, vault, asset.preview_path, `${location}.preview_path`);
    if (asset.lineage_path && asset.ai_generated !== true) safeFile(result, vault, asset.lineage_path, `${location}.lineage_path`);
    for (const [rightsIndex, rightsPath] of normalizeArray(asset.rights_sources).filter(Boolean).entries()) {
      if (/^https?:\/\//i.test(rightsPath)) validateUrl(result, rightsPath, `${location}.rights_sources[${rightsIndex}]`);
      else safeFile(result, vault, rightsPath, `${location}.rights_sources[${rightsIndex}]`);
    }
    for (const [urlIndex, url] of normalizeArray(asset.urls).filter(Boolean).entries()) validateUrl(result, url, `${location}.urls[${urlIndex}]`);
    if (asset.qr_target) validateUrl(result, asset.qr_target, `${location}.qr_target`);

    for (const [claimIndex, claimId] of normalizeArray(asset.claim_ids).filter(Boolean).entries()) {
      if (!claimIds.has(claimId)) addError(result, 'ASSET_CLAIM_UNKNOWN', `${id} references unknown claim ${claimId}.`, `${location}.claim_ids[${claimIndex}]`);
    }
    const mappedDeliverables = normalizeArray(asset.deliverable_ids).filter(Boolean);
    if (options.forReady && mappedDeliverables.length === 0) addError(result, 'ASSET_DELIVERABLE_EMPTY', `${id} is not mapped to a deliverable.`, `${location}.deliverable_ids`);
    for (const [deliverableIndex, deliverableId] of mappedDeliverables.entries()) {
      if (!deliverableIds.has(deliverableId)) addError(result, 'ASSET_DELIVERABLE_UNKNOWN', `${id} references unknown deliverable ${deliverableId}.`, `${location}.deliverable_ids[${deliverableIndex}]`);
    }

    const fallback = asset.fallback_status ?? 'none';
    if (asset.kind === 'static' && fallback !== 'none') addError(result, 'STATIC_FALLBACK_FORBIDDEN', `${id}: STATIC assets require an actual rendered file.`, `${location}.fallback_status`);
    if (asset.kind === 'image' && !['none', 'ART_DIRECTION_ONLY'].includes(fallback)) addError(result, 'IMAGE_FALLBACK_INVALID', `${id}: IMAGE fallback must be ART_DIRECTION_ONLY.`, `${location}.fallback_status`);
    if (asset.kind === 'video' && !['none', 'PRODUCTION_PACK_ONLY'].includes(fallback)) addError(result, 'VIDEO_FALLBACK_INVALID', `${id}: VIDEO fallback must be PRODUCTION_PACK_ONLY.`, `${location}.fallback_status`);
    if (fallback !== 'none') {
      if (!hasMeaningfulValue(asset.production_pack_id)) addError(result, 'ASSET_PACK_ID', `${id} fallback requires production_pack_id.`, `${location}.production_pack_id`);
      const pack = packById.get(asset.production_pack_id);
      if (!pack) addError(result, 'ASSET_PACK_UNKNOWN', `${id} references unknown production pack ${asset.production_pack_id}.`, `${location}.production_pack_id`);
      else if (pack.asset_id !== id) addError(result, 'ASSET_PACK_MISMATCH', `${asset.production_pack_id} belongs to ${pack.asset_id}, not ${id}.`, `${location}.production_pack_id`);
      if (options.forReady && !hasMeaningfulValue(asset.fallback_accepted_by)) addError(result, 'ASSET_FALLBACK_ACCEPTANCE', `${id} fallback requires fallback_accepted_by.`, `${location}.fallback_accepted_by`);
      if (options.forReady && !parseIsoDate(asset.fallback_accepted_at)) addError(result, 'ASSET_FALLBACK_ACCEPTED_AT', `${id} fallback requires fallback_accepted_at.`, `${location}.fallback_accepted_at`);
      if (asset.kind === 'video' && asset.rendered_path) addError(result, 'VIDEO_FAKE_RENDER', `${id} is PRODUCTION_PACK_ONLY but rendered_path is populated.`, `${location}.rendered_path`);
    }

    const needsRendered = fallback === 'none' && ['rendered', 'approved'].includes(asset.status);
    let renderedFile = null;
    if (asset.rendered_path) renderedFile = safeFile(result, vault, asset.rendered_path, `${location}.rendered_path`);
    else if (needsRendered || (options.forReady && !['production_pack_only'].includes(asset.status))) addError(result, 'ASSET_RENDER_MISSING', `${id} has no rendered deliverable path.`, `${location}.rendered_path`);
    if (fallback !== 'none' && asset.status !== 'production_pack_only') addError(result, 'ASSET_FALLBACK_STATUS', `${id} uses a fallback but status is not production_pack_only.`, `${location}.status`);
    if (fallback === 'none' && options.forReady && asset.status !== 'approved') addError(result, 'ASSET_NOT_APPROVED', `${id} status must be approved for readiness.`, `${location}.status`);

    const channelSpecRequired = asset.channel_spec_required !== false;
    if (!channelSpecRequired && !['research', 'strategy', 'document', 'data'].includes(asset.kind)) addError(result, 'CHANNEL_SPEC_BYPASS', `${id} kind ${asset.kind} cannot bypass channel specifications.`, `${location}.channel_spec_required`);
    const spec = channelSpecRequired ? findChannelSpec(specs, asset) : null;
    if (channelSpecRequired && !spec) addError(result, 'CHANNEL_SPEC_MISSING', `No channel spec matches ${asset.channel}/${asset.placement}/${asset.language_market}.`, `${location}.channel`);

    if (renderedFile) {
      try {
        const metadata = inspectAssetFile(renderedFile, asset.kind);
        inspected[id] = metadata;
        if (asset.actual?.sha256 && asset.actual.sha256 !== metadata.sha256) addError(result, 'ASSET_HASH_MISMATCH', `${id} actual.sha256 does not match the file.`, `${location}.actual.sha256`);
        if (asset.actual?.size_bytes && Number(asset.actual.size_bytes) !== Number(metadata.size_bytes)) addError(result, 'ASSET_SIZE_MISMATCH', `${id} actual.size_bytes does not match the file.`, `${location}.actual.size_bytes`);
        if (['static', 'image', 'video'].includes(asset.kind)) checkDimensions(result, asset, metadata, spec, location);
        if (asset.kind === 'video') checkDuration(result, asset, metadata, spec, location);
        const allowedTypes = normalizeArray(spec?.file_types).map(normalizedAllowedType);
        const extension = normalizedExtension(renderedFile);
        if (allowedTypes.length > 0 && !allowedTypes.includes(extension)) addError(result, 'ASSET_FILE_TYPE', `${id} uses .${extension}; channel permits ${allowedTypes.join(', ')}.`, `${location}.rendered_path`);
        const sizeLimit = Number(spec?.file_size_limit_bytes ?? asset.expected?.max_file_size_bytes);
        if (Number.isFinite(sizeLimit) && metadata.size_bytes > sizeLimit) addError(result, 'ASSET_FILE_SIZE', `${id} is ${metadata.size_bytes} bytes; maximum is ${sizeLimit}.`, `${location}.rendered_path`);
      } catch (error) {
        addError(result, 'ASSET_METADATA', `${id} metadata verification failed: ${error.message}`, `${location}.rendered_path`);
      }
    }
    checkCopyConstraints(result, asset, spec, location);

    const accessibility = asset.accessibility && typeof asset.accessibility === 'object' ? asset.accessibility : {};
    if (['static', 'image'].includes(asset.kind) && accessibility.decorative !== true && options.forReady) {
      const altFile = safeFile(result, vault, accessibility.alt_text_path, `${location}.accessibility.alt_text_path`);
      if (altFile) {
        const alt = fs.readFileSync(altFile, 'utf8').trim();
        if (!alt) addError(result, 'ALT_TEXT_EMPTY', `${id} alt text is empty.`, `${location}.accessibility.alt_text_path`);
        if ([...alt].length > 300) addWarning(result, 'ALT_TEXT_LONG', `${id} alt text is over 300 characters.`, `${location}.accessibility.alt_text_path`);
      }
    }
    const captionsRequired = accessibility.captions_required === true || (asset.kind === 'video' && hasMeaningfulValue(spec?.caption_requirements) && !/^(?:none|n\/a|not required)$/i.test(String(spec.caption_requirements).trim()));
    if (asset.kind === 'video' && captionsRequired && options.forReady) {
      const captionFile = safeFile(result, vault, accessibility.captions_path, `${location}.accessibility.captions_path`);
      if (captionFile) checkCaptionFile(result, captionFile, `${location}.accessibility.captions_path`);
      safeFile(result, vault, accessibility.transcript_path, `${location}.accessibility.transcript_path`);
    }

    const reviewers = normalizeArray(asset.reviewers).filter(Boolean);
    if (options.forReady && reviewers.length === 0) addError(result, 'ASSET_REVIEWERS_EMPTY', `${id} has no independent reviewer.`, `${location}.reviewers`);
    if (reviewers.includes(asset.producer)) addError(result, 'ASSET_SELF_APPROVAL', `${id} producer is also listed as a reviewer.`, `${location}.reviewers`);
    if (options.forReady && asset.review_status !== 'approved') addError(result, 'ASSET_REVIEW_STATUS', `${id} review_status must be approved.`, `${location}.review_status`);
  });

  result.metadata.ids = [...seen];
  result.metadata.assets = assets;
  result.metadata.inspected = inspected;
  result.metadata.producers = producers;
  result.metadata.multipleMarkets = markets.size > 1;
  addCheck(result, 'ASSET_COUNT', `${assets.length} asset(s) parsed; ${Object.keys(inspected).length} rendered file(s) inspected.`);
  return result;
}
