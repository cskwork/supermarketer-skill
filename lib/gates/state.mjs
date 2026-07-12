import { MODES, PERFORMANCE_STATES, READINESS_STATES } from '../constants.mjs';
import { ageInDays, hasMeaningfulValue, parseIsoDate } from '../utils.mjs';
import { createGate, addCheck, addError, addWarning } from './result.mjs';
import { loadJsonForGate, loadYamlForGate } from './helpers.mjs';

export function gateState(vault, options = {}) {
  const result = createGate('run-state');
  const state = loadJsonForGate(result, vault, 'run-state.json');
  if (!state) return result;
  if (state.schema_version !== '1.0') addWarning(result, 'SCHEMA_VERSION', `Unexpected run-state schema version: ${state.schema_version}`, 'run-state.json');
  if (!hasMeaningfulValue(state.run_id)) addError(result, 'RUN_ID_EMPTY', 'run_id is required.', 'run-state.json:run_id');
  if (!MODES.includes(state.mode)) addError(result, 'MODE_INVALID', `mode must be one of: ${MODES.join(', ')}`, 'run-state.json:mode');
  if (!READINESS_STATES.includes(state.readiness)) addError(result, 'READINESS_INVALID', `Invalid readiness state: ${state.readiness}`, 'run-state.json:readiness');
  if (!PERFORMANCE_STATES.includes(state.performance)) addError(result, 'PERFORMANCE_INVALID', `Invalid performance state: ${state.performance}`, 'run-state.json:performance');
  if (!hasMeaningfulValue(state.objective)) addError(result, 'OBJECTIVE_EMPTY', 'The original objective is required in run-state.json.', 'run-state.json:objective');
  const created = parseIsoDate(state.created_at);
  const updated = parseIsoDate(state.updated_at);
  if (!created) addError(result, 'CREATED_AT_INVALID', 'created_at must be an ISO date-time.', 'run-state.json:created_at');
  if (!updated) addError(result, 'UPDATED_AT_INVALID', 'updated_at must be an ISO date-time.', 'run-state.json:updated_at');
  if (created && updated && updated < created) addError(result, 'STATE_TIME_ORDER', 'updated_at cannot precede created_at.', 'run-state.json');
  if (created && ageInDays(created, options.now ?? new Date()) < -1) addError(result, 'STATE_FUTURE', 'created_at cannot be in the future.', 'run-state.json:created_at');
  if (!Array.isArray(state.open_decisions)) addError(result, 'OPEN_DECISIONS_TYPE', 'open_decisions must be an array.', 'run-state.json:open_decisions');
  if (!Array.isArray(state.blocking_findings)) addError(result, 'BLOCKERS_TYPE', 'blocking_findings must be an array.', 'run-state.json:blocking_findings');
  if (options.forReady && Array.isArray(state.open_decisions) && state.open_decisions.length > 0) {
    addError(result, 'OPEN_DECISIONS', `Run has ${state.open_decisions.length} unresolved decision(s).`, 'run-state.json:open_decisions');
  }
  if (options.forReady && Array.isArray(state.blocking_findings) && state.blocking_findings.length > 0) {
    addError(result, 'BLOCKING_FINDINGS', `Run has ${state.blocking_findings.length} blocking finding(s).`, 'run-state.json:blocking_findings');
  }
  if (options.forReady && state.external_action_authorized === true) {
    addError(result, 'EXTERNAL_ACTION_STATE', 'Launch readiness must not implicitly authorize external action. Use a separate scoped approval and publish gate.', 'run-state.json:external_action_authorized');
  }
  if (state.performance === 'PERFORMANCE_VALIDATED') {
    const marker = options.validatedMarkerExists ?? false;
    if (!marker) addError(result, 'PERFORMANCE_MARKER_MISSING', 'PERFORMANCE_VALIDATED requires Z-VALIDATED.md.', 'run-state.json:performance');
  }

  const manifest = loadYamlForGate(result, vault, 'ASSET-MANIFEST.yaml', false);
  if (manifest?.run) {
    if (manifest.run.id && state.run_id && manifest.run.id !== state.run_id) addError(result, 'RUN_ID_MISMATCH', 'run-state.json and ASSET-MANIFEST.yaml use different run IDs.', 'ASSET-MANIFEST.yaml:run.id');
    if (manifest.run.mode && state.mode && manifest.run.mode !== state.mode) addError(result, 'MODE_MISMATCH', 'run-state.json and ASSET-MANIFEST.yaml use different modes.', 'ASSET-MANIFEST.yaml:run.mode');
  }
  result.metadata.state = state;
  addCheck(result, 'STATE_PARSED', `Run ${state.run_id || '(missing ID)'} is in ${state.phase || '(missing phase)'}.`);
  return result;
}
