export function createGate(name) {
  return {
    gate: name,
    ok: true,
    errors: [],
    warnings: [],
    checks: [],
    metadata: {},
  };
}

export function addError(result, code, message, location = '') {
  result.ok = false;
  result.errors.push({ code, message, location });
}

export function addWarning(result, code, message, location = '') {
  result.warnings.push({ code, message, location });
}

export function addCheck(result, code, message, status = 'pass', location = '') {
  result.checks.push({ code, message, status, location });
}

export function mergeGateResults(name, results) {
  const merged = createGate(name);
  merged.results = results;
  for (const result of results) {
    if (!result.ok) merged.ok = false;
    merged.errors.push(...result.errors.map((entry) => ({ ...entry, gate: result.gate })));
    merged.warnings.push(...result.warnings.map((entry) => ({ ...entry, gate: result.gate })));
    merged.checks.push(...result.checks.map((entry) => ({ ...entry, gate: result.gate })));
  }
  return merged;
}
