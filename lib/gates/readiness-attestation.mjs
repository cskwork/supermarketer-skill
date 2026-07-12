import { verifyReadinessAttestation } from '../attestation.mjs';
import { addCheck, addError, createGate } from './result.mjs';

export function gateReadinessAttestation(vault) {
  const result = createGate('readiness-attestation');
  const verification = verifyReadinessAttestation(vault);
  for (const error of verification.errors) addError(result, error.code, error.message, error.location);
  result.metadata.verification = verification;
  if (verification.ok) addCheck(result, 'READY_ATTESTATION_VERIFIED', `Verified launch-readiness marker and gate report SHA-256 for run ${verification.marker_run_id}.`);
  return result;
}
