import { ageInDays, hasMeaningfulValue, normalizeArray, parseAspectRatio, parseDimensions, parseIsoDate } from '../utils.mjs';
import { createGate, addCheck, addError, addWarning } from './result.mjs';
import { isHttpUrl, loadYamlForGate, safeFile, validateUrl } from './helpers.mjs';

const AUTHORITIES = new Set(['official', 'regulator', 'first_party', 'internal']);
const CONFIDENCE = new Set(['low', 'medium', 'high']);
const PUBLIC_CHANNELS = /instagram|facebook|meta|linkedin|tiktok|youtube|google|x|twitter|pinterest|snapchat|reddit|app store|play store/i;

export function gateChannelSpecs(vault, options = {}) {
  const result = createGate('channel-specs');
  const data = loadYamlForGate(result, vault, 'CHANNEL-SPECS.yaml');
  if (!data) return result;
  const channels = Array.isArray(data.channels) ? data.channels : null;
  if (!channels) {
    addError(result, 'CHANNELS_TYPE', 'channels must be an array.', 'CHANNEL-SPECS.yaml:channels');
    return result;
  }
  const seen = new Set();
  const now = options.now ?? new Date();
  const records = [];
  channels.forEach((spec, index) => {
    const location = `CHANNEL-SPECS.yaml:channels[${index}]`;
    if (!spec || typeof spec !== 'object' || Array.isArray(spec)) {
      addError(result, 'CHANNEL_ITEM_TYPE', 'Channel spec must be a mapping.', location);
      return;
    }
    const id = String(spec.id ?? '').trim();
    if (!/^S-\d{3,}$/.test(id)) addError(result, 'CHANNEL_ID', 'Channel spec ID must match S-001.', `${location}.id`);
    const channel = String(spec.channel ?? spec.name ?? '').trim();
    const placement = String(spec.placement ?? '').trim();
    const market = String(spec.language_market ?? '*').trim();
    if (!channel) addError(result, 'CHANNEL_NAME', 'channel is required.', `${location}.channel`);
    if (!placement) addError(result, 'CHANNEL_PLACEMENT', 'placement is required.', `${location}.placement`);
    const key = `${channel.toLowerCase()}::${placement.toLowerCase()}::${market.toLowerCase()}`;
    if (seen.has(key)) addError(result, 'CHANNEL_DUPLICATE', `Duplicate channel/placement/market spec: ${key}`, location);
    seen.add(key);
    if (!AUTHORITIES.has(spec.source_authority)) addError(result, 'CHANNEL_AUTHORITY', `source_authority must be official, regulator, first_party, or internal.`, `${location}.source_authority`);
    if (!CONFIDENCE.has(spec.confidence)) addError(result, 'CHANNEL_CONFIDENCE', `confidence must be low, medium, or high.`, `${location}.confidence`);
    if (options.forReady && spec.confidence === 'low') addError(result, 'CHANNEL_LOW_CONFIDENCE', `${channel}/${placement} has low-confidence requirements.`, `${location}.confidence`);
    if (PUBLIC_CHANNELS.test(channel) && !['official', 'regulator'].includes(spec.source_authority)) {
      const method = options.forReady ? addError : addWarning;
      method(result, 'CHANNEL_PUBLIC_AUTHORITY', `Public platform ${channel} should use an official or regulator source.`, `${location}.source_authority`);
    }
    const source = String(spec.source ?? '').trim();
    if (!source) addError(result, 'CHANNEL_SOURCE', 'source is required.', `${location}.source`);
    else if (isHttpUrl(source)) validateUrl(result, source, `${location}.source`, { requireHttps: options.requireHttpsSources === true });
    else if (/^internal:\/\//.test(source)) {
      if (spec.source_authority !== 'internal') addError(result, 'CHANNEL_INTERNAL_AUTHORITY', 'internal:// source requires source_authority: internal.', `${location}.source_authority`);
    } else safeFile(result, vault, source, `${location}.source`);

    const checked = parseIsoDate(spec.checked_at);
    if (!checked) addError(result, 'CHANNEL_DATE', 'checked_at must be an ISO date.', `${location}.checked_at`);
    else {
      const age = ageInDays(checked, now);
      const maxAge = Number(spec.max_age_days ?? options.maxChannelAgeDays ?? 90);
      if (age < -1) addError(result, 'CHANNEL_FUTURE', 'checked_at cannot be in the future.', `${location}.checked_at`);
      if (age !== null && Number.isFinite(maxAge) && age > maxAge) {
        const method = options.forReady ? addError : addWarning;
        method(result, 'CHANNEL_STALE', `${channel}/${placement} was checked ${age} days ago; maximum is ${maxAge}.`, `${location}.checked_at`);
      }
    }

    for (const [dimensionIndex, value] of normalizeArray(spec.dimensions).entries()) {
      if (!parseDimensions(value)) addError(result, 'CHANNEL_DIMENSION', `Invalid dimension ${value}; use WIDTHxHEIGHT.`, `${location}.dimensions[${dimensionIndex}]`);
    }
    for (const [ratioIndex, value] of normalizeArray(spec.aspect_ratios).entries()) {
      if (!parseAspectRatio(value)) addError(result, 'CHANNEL_RATIO', `Invalid aspect ratio ${value}; use W:H.`, `${location}.aspect_ratios[${ratioIndex}]`);
    }
    const duration = spec.duration_seconds ?? {};
    if (duration.min !== null && duration.min !== undefined && (!Number.isFinite(Number(duration.min)) || Number(duration.min) < 0)) addError(result, 'CHANNEL_DURATION_MIN', 'duration_seconds.min must be a non-negative number or null.', `${location}.duration_seconds.min`);
    if (duration.max !== null && duration.max !== undefined && (!Number.isFinite(Number(duration.max)) || Number(duration.max) <= 0)) addError(result, 'CHANNEL_DURATION_MAX', 'duration_seconds.max must be a positive number or null.', `${location}.duration_seconds.max`);
    if (Number.isFinite(Number(duration.min)) && Number.isFinite(Number(duration.max)) && Number(duration.min) > Number(duration.max)) addError(result, 'CHANNEL_DURATION_ORDER', 'duration min cannot exceed max.', `${location}.duration_seconds`);
    for (const [typeIndex, fileType] of normalizeArray(spec.file_types).entries()) {
      if (!/^[a-z0-9]+$/i.test(String(fileType).replace(/^\./, ''))) addError(result, 'CHANNEL_FILE_TYPE', `Invalid file type: ${fileType}`, `${location}.file_types[${typeIndex}]`);
    }
    if (spec.file_size_limit_bytes !== null && spec.file_size_limit_bytes !== undefined && (!Number.isFinite(Number(spec.file_size_limit_bytes)) || Number(spec.file_size_limit_bytes) <= 0)) {
      addError(result, 'CHANNEL_FILE_SIZE', 'file_size_limit_bytes must be a positive number or null.', `${location}.file_size_limit_bytes`);
    }
    if (spec.text_constraints && typeof spec.text_constraints === 'object') {
      for (const [keyName, value] of Object.entries(spec.text_constraints)) {
        if (!Number.isInteger(Number(value)) || Number(value) < 0) addError(result, 'CHANNEL_TEXT_CONSTRAINT', `${keyName} must be a non-negative integer.`, `${location}.text_constraints.${keyName}`);
      }
    } else if (spec.text_constraints !== undefined && spec.text_constraints !== null) {
      addError(result, 'CHANNEL_TEXT_TYPE', 'text_constraints must be a mapping.', `${location}.text_constraints`);
    }
    if (options.forReady && !hasMeaningfulValue(spec.safe_zone_notes) && normalizeArray(spec.dimensions).length > 0) addWarning(result, 'CHANNEL_SAFE_ZONE', `${channel}/${placement} has no safe-zone note.`, `${location}.safe_zone_notes`);
    records.push({ ...spec, channel, placement, language_market: market });
  });
  result.metadata.records = records;
  addCheck(result, 'CHANNEL_COUNT', `${channels.length} channel specification(s) parsed.`);
  return result;
}
