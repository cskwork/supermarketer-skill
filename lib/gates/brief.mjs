import { MODES } from '../constants.mjs';
import { checkboxes, containsPlaceholders, fieldValue, meaningfulSection, section } from '../markdown.mjs';
import { hasMeaningfulValue } from '../utils.mjs';
import { createGate, addCheck, addError, addWarning } from './result.mjs';
import { loadJsonForGate, loadTextForGate } from './helpers.mjs';

const REQUIRED_SECTIONS = [
  'Original Request',
  'Mode',
  'Objective',
  'Product Truth Source',
  'Audience',
  'Funnel and Action',
  'Offer and Proof',
  'Deliverables',
  'Brand and Creative Constraints',
  'Non-goals',
  'Success Criteria',
  'Assumptions',
  'Decision Gates',
  'Publish Boundary',
];

const REQUIRED_FIELDS = Object.freeze({
  Audience: ['Priority segment', 'Role in purchase', 'Buying situation/JTBD', 'Awareness level', 'Geography/language'],
  'Funnel and Action': ['Funnel stage', 'Desired action', 'Primary KPI', 'Guardrails', 'Performance status at start'],
  'Offer and Proof': ['Offer', 'Reasons to believe', 'Approved proof', 'Material limitations/terms'],
  'Brand and Creative Constraints': ['Brand source', 'Voice/tone', 'Visual references', 'Prohibited treatments', 'Accessibility', 'Rights/privacy', 'Regulation/jurisdiction'],
});

function cleanMode(value) {
  return String(value ?? '').replace(/[`<>]/g, '').trim().toUpperCase();
}

export function gateBrief(vault, options = {}) {
  const result = createGate('brief');
  const text = loadTextForGate(result, vault, 'BRIEF.md');
  if (!text) return result;

  for (const heading of REQUIRED_SECTIONS) {
    if (section(text, heading) === null) addError(result, 'SECTION_MISSING', `Missing required section: ${heading}`, `BRIEF.md#${heading}`);
  }
  for (const heading of ['Original Request', 'Objective', 'Product Truth Source', 'Non-goals', 'Assumptions', 'Publish Boundary']) {
    if (!meaningfulSection(text, heading)) addError(result, 'SECTION_EMPTY', `${heading} must contain a concrete value.`, `BRIEF.md#${heading}`);
  }

  const mode = cleanMode(meaningfulSection(text, 'Mode'));
  if (!MODES.includes(mode)) addError(result, 'MODE_INVALID', `BRIEF.md mode must be one of: ${MODES.join(', ')}`, 'BRIEF.md#Mode');
  const state = loadJsonForGate(result, vault, 'run-state.json', false);
  if (state?.mode && mode && state.mode !== mode) addError(result, 'MODE_MISMATCH', `BRIEF.md mode ${mode} does not match run-state mode ${state.mode}.`, 'BRIEF.md#Mode');

  for (const [heading, fields] of Object.entries(REQUIRED_FIELDS)) {
    const content = section(text, heading) ?? '';
    for (const field of fields) {
      const value = fieldValue(content, field);
      if (!hasMeaningfulValue(value)) addError(result, 'FIELD_EMPTY', `${field} is required. Use an explicit N/A with a reason when it truly does not apply.`, `BRIEF.md#${heading}:${field}`);
    }
  }

  const deliverables = checkboxes(section(text, 'Deliverables') ?? '');
  if (deliverables.length === 0) addError(result, 'DELIVERABLES_EMPTY', 'At least one scoped deliverable is required.', 'BRIEF.md#Deliverables');
  if (deliverables.some((item) => /<[^>]+>/.test(item.text))) addError(result, 'DELIVERABLE_PLACEHOLDER', 'Deliverable checklist still contains placeholders.', 'BRIEF.md#Deliverables');

  const criteria = checkboxes(section(text, 'Success Criteria') ?? '');
  if (criteria.length === 0) addError(result, 'CRITERIA_EMPTY', 'At least one falsifiable success criterion is required.', 'BRIEF.md#Success Criteria');
  criteria.forEach((criterion, index) => {
    if (!/Verify with:/i.test(criterion.text)) addError(result, 'CRITERION_PROOF_MISSING', 'Every success criterion must name its proof after “Verify with:”.', `BRIEF.md#Success Criteria[${index}]`);
    if (/<[^>]+>/.test(criterion.text)) addError(result, 'CRITERION_PLACEHOLDER', 'Success criterion still contains placeholders.', `BRIEF.md#Success Criteria[${index}]`);
    if (options.forReady && !criterion.checked) addError(result, 'CRITERION_UNCHECKED', `Success criterion is not proven: ${criterion.text}`, `BRIEF.md#Success Criteria[${index}]`);
  });

  const decisions = meaningfulSection(text, 'Decision Gates') ?? '';
  if (options.forReady && /\b(?:NEEDS_INPUT|PENDING|UNRESOLVED|ASK USER)\b|결정\s*필요|입력\s*필요/i.test(decisions) && !/^[-*]\s*(?:None|없음)\.?$/im.test(decisions)) {
    addError(result, 'DECISION_GATE_OPEN', 'Decision Gates contains unresolved input or approval.', 'BRIEF.md#Decision Gates');
  }

  const publish = section(text, 'Publish Boundary') ?? '';
  if (!/APPROVALS\.yaml/i.test(publish) || !/(?:publish|send|schedule|spend|게시|발송|집행)/i.test(publish)) {
    addError(result, 'PUBLISH_BOUNDARY_WEAK', 'Publish Boundary must explicitly deny external action without scoped approval in APPROVALS.yaml.', 'BRIEF.md#Publish Boundary');
  }

  const placeholders = containsPlaceholders(text);
  if (placeholders.length > 0) {
    const method = options.forReady ? addError : addWarning;
    method(result, 'PLACEHOLDERS_REMAIN', `${placeholders.length} placeholder line(s) remain in BRIEF.md.`, `BRIEF.md:${placeholders.slice(0, 5).map((item) => item.line).join(',')}`);
  }

  result.metadata.mode = mode;
  result.metadata.successCriteria = criteria;
  result.metadata.deliverables = deliverables;
  addCheck(result, 'BRIEF_PARSED', `Brief routed to ${mode || '(invalid mode)'} with ${criteria.length} success criterion/criteria.`);
  return result;
}
