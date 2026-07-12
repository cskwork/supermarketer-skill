import { hasMeaningfulValue, parseIsoDate } from '../utils.mjs';
import { createGate, addCheck, addError } from './result.mjs';
import { loadYamlForGate, safeFile } from './helpers.mjs';

const VIDEO_PATH_FIELDS = [
  'script_path',
  'storyboard_path',
  'shot_list_path',
  'voiceover_path',
  'on_screen_text_path',
  'captions_path',
  'prompt_pack_path',
  'source_asset_list_path',
  'edit_plan_path',
  'output_spec_path',
];
const IMAGE_PATH_FIELDS = ['prompt_pack_path', 'source_asset_list_path', 'output_spec_path'];

function validatePackPath(result, vault, pack, location, field) {
  const file = safeFile(result, vault, pack[field], `${location}.${field}`);
  if (file && field === 'captions_path') {
    const extension = file.toLowerCase();
    if (!extension.endsWith('.srt') && !extension.endsWith('.vtt')) {
      addError(result, 'PACK_CAPTION_FORMAT', 'captions_path must be .srt or .vtt.', `${location}.${field}`);
    }
  }
}

export function gateProductionPacks(vault, options = {}) {
  const result = createGate('production-pack');
  const data = loadYamlForGate(result, vault, 'PRODUCTION-PACK.yaml', false);
  if (!data) {
    result.metadata.packs = [];
    return result;
  }
  const packs = Array.isArray(data.packs) ? data.packs : null;
  if (!packs) {
    addError(result, 'PACKS_TYPE', 'packs must be an array.', 'PRODUCTION-PACK.yaml:packs');
    return result;
  }
  const seen = new Set();
  const byId = {};
  packs.forEach((pack, index) => {
    const location = `PRODUCTION-PACK.yaml:packs[${index}]`;
    if (!pack || typeof pack !== 'object' || Array.isArray(pack)) {
      addError(result, 'PACK_ITEM_TYPE', 'Production pack must be a mapping.', location);
      return;
    }
    const id = String(pack.id ?? '').trim();
    if (!/^PK-\d{3,}$/.test(id)) addError(result, 'PACK_ID', 'Production pack ID must match PK-001.', `${location}.id`);
    if (seen.has(id)) addError(result, 'PACK_DUPLICATE', `Duplicate production pack ID: ${id}`, `${location}.id`);
    seen.add(id);
    if (!/^ASSET-\d{3,}$/.test(String(pack.asset_id ?? ''))) addError(result, 'PACK_ASSET_ID', 'asset_id must match ASSET-001.', `${location}.asset_id`);
    if (!['video', 'image_art_direction'].includes(pack.type)) addError(result, 'PACK_TYPE', 'type must be video or image_art_direction.', `${location}.type`);
    const requiredFields = pack.type === 'video' ? VIDEO_PATH_FIELDS : IMAGE_PATH_FIELDS;
    for (const field of requiredFields) validatePackPath(result, vault, pack, location, field);
    if (options.forReady) {
      if (!hasMeaningfulValue(pack.accepted_by)) addError(result, 'PACK_ACCEPTED_BY', `${id} requires fallback acceptance by an accountable owner.`, `${location}.accepted_by`);
      if (!parseIsoDate(pack.accepted_at)) addError(result, 'PACK_ACCEPTED_AT', `${id} requires accepted_at as an ISO date.`, `${location}.accepted_at`);
    }
    if (id) byId[id] = pack;
  });
  result.metadata.packs = packs;
  result.metadata.byId = byId;
  addCheck(result, 'PACK_COUNT', `${packs.length} production pack(s) parsed.`);
  return result;
}
