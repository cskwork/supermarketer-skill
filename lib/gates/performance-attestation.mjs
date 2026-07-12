import fs from 'node:fs';
import path from 'node:path';
import { verifyPerformanceAttestation } from '../performance-attestation.mjs';
import { readJson, safeExistingPath } from '../utils.mjs';
import { addCheck, addError, createGate } from './result.mjs';

export function gatePerformanceAttestation(vault, options = {}) {
  const result = createGate('performance-attestation');
  let state = null;
  try {
    state = readJson(safeExistingPath(vault, 'run-state.json'));
  } catch (error) {
    addError(result, 'PERFORMANCE_STATE_INVALID', `Could not inspect performance state: ${error.message}`, 'run-state.json');
    return result;
  }
  const markerExists = fs.existsSync(path.join(vault, 'Z-VALIDATED.md'));
  if (state.performance !== 'PERFORMANCE_VALIDATED' && !markerExists) {
    addCheck(result, 'PERFORMANCE_NOT_CLAIMED', `Performance state is ${state.performance}; no validation attestation is required.`);
    return result;
  }
  const verification = verifyPerformanceAttestation(vault, options);
  for (const error of verification.errors) addError(result, error.code, error.message, error.location);
  result.metadata.verification = verification;
  if (verification.ok) addCheck(result, 'PERFORMANCE_ATTESTATION_VERIFIED', `Verified performance validation for run ${verification.fields.run_id}.`);
  return result;
}
