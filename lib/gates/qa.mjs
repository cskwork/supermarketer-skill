import fs from 'node:fs';
import path from 'node:path';
import { PERFORMANCE_STATES, READINESS_STATES } from '../constants.mjs';
import { checkboxes, containsPlaceholders, fieldValue, section, tableRows } from '../markdown.mjs';
import { hasMeaningfulValue, safeExistingPath } from '../utils.mjs';
import { createGate, addCheck, addError, addWarning } from './result.mjs';
import { loadJsonForGate, loadTextForGate } from './helpers.mjs';

const REQUIRED_SECTIONS = [
  'Run Status',
  'Success Criteria Evidence',
  'Deterministic Checks',
  'Product Truth and Claims Review',
  'Brand, Rights, Privacy, Compliance Review',
  'Creative Review',
  'Accessibility and Localization',
  'Package Completeness',
  'Residual Risk',
  'Final Verdict',
];

function cleanStatus(value) {
  return String(value ?? '').replace(/`/g, '').trim();
}

export function gateQa(vault, options = {}) {
  const result = createGate('qa');
  const text = loadTextForGate(result, vault, 'QA.md');
  const state = loadJsonForGate(result, vault, 'run-state.json', false);
  if (!text) return result;
  for (const heading of REQUIRED_SECTIONS) if (section(text, heading) === null) addError(result, 'QA_SECTION_MISSING', `Missing QA section: ${heading}`, `QA.md#${heading}`);

  const criteria = checkboxes(section(text, 'Success Criteria Evidence') ?? '');
  if (criteria.length === 0) addError(result, 'QA_CRITERIA_EMPTY', 'QA must map at least one success criterion to evidence.', 'QA.md#Success Criteria Evidence');
  if (options.forReady) {
    for (const item of criteria.filter((entry) => !entry.checked)) addError(result, 'QA_CRITERION_UNCHECKED', `QA criterion is unchecked: ${item.text}`, 'QA.md#Success Criteria Evidence');
  }
  for (const item of criteria) {
    if (!/Evidence:/i.test(item.text)) addError(result, 'QA_CRITERION_EVIDENCE', 'Each QA criterion must include “Evidence:”.', 'QA.md#Success Criteria Evidence');
  }

  const completeness = checkboxes(section(text, 'Package Completeness') ?? '');
  if (completeness.length < 5) addError(result, 'QA_COMPLETENESS_SHORT', 'Package Completeness checklist is incomplete.', 'QA.md#Package Completeness');
  if (options.forReady) {
    for (const item of completeness.filter((entry) => !entry.checked)) addError(result, 'QA_COMPLETENESS_UNCHECKED', `Package check is unchecked: ${item.text}`, 'QA.md#Package Completeness');
  }

  const deterministicRows = tableRows(section(text, 'Deterministic Checks') ?? '');
  const dataRows = deterministicRows.slice(1);
  if (dataRows.length === 0) addError(result, 'QA_DETERMINISTIC_EMPTY', 'Record at least one deterministic check and its report path.', 'QA.md#Deterministic Checks');
  for (const [index, row] of dataRows.entries()) {
    const status = String(row[3] ?? '').toUpperCase();
    if (options.forReady && status !== 'PASS') addError(result, 'QA_DETERMINISTIC_FAIL', `Deterministic check row ${index + 1} is not PASS.`, 'QA.md#Deterministic Checks');
    const evidencePath = row[4];
    if (status === 'PASS' && evidencePath && !/^https?:\/\//i.test(evidencePath) && !/^(?:N\/A|None)$/i.test(evidencePath)) {
      try {
        safeExistingPath(vault, evidencePath.replace(/`/g, ''));
      } catch (error) {
        const code = /Symbolic links/i.test(error.message)
          ? 'QA_EVIDENCE_PATH_SYMLINK'
          : /does not exist/i.test(error.message)
            ? 'QA_EVIDENCE_PATH_MISSING'
            : 'QA_EVIDENCE_PATH_UNSAFE';
        addError(result, code, `Invalid QA evidence path ${evidencePath}: ${error.message}`, 'QA.md#Deterministic Checks');
      }
    }
  }

  const runStatus = section(text, 'Run Status') ?? '';
  const runReadiness = cleanStatus(fieldValue(runStatus, 'Readiness'));
  const runPerformance = cleanStatus(fieldValue(runStatus, 'Performance'));
  const publish = cleanStatus(fieldValue(runStatus, 'External publish authorized'));
  if (!READINESS_STATES.includes(runReadiness)) addError(result, 'QA_READINESS_INVALID', `Invalid QA readiness: ${runReadiness}`, 'QA.md#Run Status');
  if (!PERFORMANCE_STATES.includes(runPerformance)) addError(result, 'QA_PERFORMANCE_INVALID', `Invalid QA performance: ${runPerformance}`, 'QA.md#Run Status');
  if (options.forReady && publish !== 'NO') addError(result, 'QA_PUBLISH_BOUNDARY', 'Launch readiness QA must say External publish authorized: NO.', 'QA.md#Run Status');
  if (state?.performance && runPerformance && state.performance !== runPerformance) addError(result, 'QA_STATE_PERFORMANCE', 'QA performance status does not match run-state.json.', 'QA.md#Run Status');

  const verdict = section(text, 'Final Verdict') ?? '';
  const verdictReadiness = cleanStatus(fieldValue(verdict, 'Readiness'));
  const verdictPerformance = cleanStatus(fieldValue(verdict, 'Performance'));
  const reason = fieldValue(verdict, 'Reason');
  if (!READINESS_STATES.includes(verdictReadiness)) addError(result, 'QA_VERDICT_READINESS', `Invalid final readiness: ${verdictReadiness}`, 'QA.md#Final Verdict');
  if (!PERFORMANCE_STATES.includes(verdictPerformance)) addError(result, 'QA_VERDICT_PERFORMANCE', `Invalid final performance: ${verdictPerformance}`, 'QA.md#Final Verdict');
  if (!hasMeaningfulValue(reason)) addError(result, 'QA_VERDICT_REASON', 'Final Verdict requires a plain-language reason.', 'QA.md#Final Verdict');
  if (runPerformance && verdictPerformance && runPerformance !== verdictPerformance) addError(result, 'QA_PERFORMANCE_MISMATCH', 'Run Status and Final Verdict performance differ.', 'QA.md');
  if (options.forReady && !['REVIEW_READY', 'LAUNCH_READY'].includes(verdictReadiness)) addError(result, 'QA_NOT_REVIEW_READY', 'Final Verdict must be REVIEW_READY before the readiness command can certify it.', 'QA.md#Final Verdict');
  if (verdictPerformance === 'PERFORMANCE_VALIDATED' && !fs.existsSync(path.join(vault, 'Z-VALIDATED.md'))) addError(result, 'QA_VALIDATED_MARKER', 'QA cannot claim PERFORMANCE_VALIDATED without Z-VALIDATED.md.', 'QA.md#Final Verdict');

  const placeholders = containsPlaceholders(text);
  if (placeholders.length > 0) {
    const method = options.forReady ? addError : addWarning;
    method(result, 'QA_PLACEHOLDERS', `${placeholders.length} placeholder line(s) remain in QA.md.`, `QA.md:${placeholders.slice(0, 5).map((item) => item.line).join(',')}`);
  }
  result.metadata.criteria = criteria;
  result.metadata.completeness = completeness;
  result.metadata.readiness = verdictReadiness;
  result.metadata.performance = verdictPerformance;
  addCheck(result, 'QA_PARSED', `${criteria.length} criterion mapping(s) and ${dataRows.length} deterministic check(s) parsed.`);
  return result;
}
