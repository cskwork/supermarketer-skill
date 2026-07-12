import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { certifyReady, validateResults } from '../lib/workflow.mjs';
import { verifyPerformanceAttestation } from '../lib/performance-attestation.mjs';
import { runReadinessGates } from '../lib/gates/aggregate.mjs';
import { packageRun } from '../lib/package-run.mjs';
import { createValidCopyVault, addValidMeasurement } from './helpers/fixture.mjs';
import { readJson } from '../lib/utils.mjs';
import { readYaml, writeYamlAtomic } from '../lib/yaml-lite.mjs';

test('validates real post-launch data while preserving launch readiness', () => {
  const { vault } = createValidCopyVault();
  certifyReady(vault);
  addValidMeasurement(vault);
  const result = validateResults(vault);
  assert.equal(result.result.ok, true);
  assert.ok(fs.existsSync(path.join(vault, 'Z-VALIDATED.md')));
  const state = readJson(path.join(vault, 'run-state.json'));
  const manifest = readYaml(path.join(vault, 'ASSET-MANIFEST.yaml'));
  assert.equal(state.readiness, 'LAUNCH_READY');
  assert.equal(state.performance, 'PERFORMANCE_VALIDATED');
  assert.equal(manifest.run.performance, 'PERFORMANCE_VALIDATED');
  const attestation = verifyPerformanceAttestation(vault);
  assert.equal(attestation.ok, true, JSON.stringify(attestation.errors, null, 2));
  const packaged = packageRun(vault, path.join(path.dirname(vault), 'validated-delivery.zip'));
  assert.ok(fs.existsSync(packaged.outputFile));
});

test('modeled or invented data cannot validate performance', () => {
  const { vault } = createValidCopyVault();
  certifyReady(vault);
  addValidMeasurement(vault);
  const measurement = readYaml(path.join(vault, 'MEASUREMENT.yaml'));
  measurement.data.real_post_launch = false;
  writeYamlAtomic(path.join(vault, 'MEASUREMENT.yaml'), measurement);
  assert.throws(() => validateResults(vault), /Measurement gate failed/);
});


for (const [label, relativePath, expectedCodes] of [
  ['source data', 'sources/results.csv', ['PERFORMANCE_MEASUREMENT_HASH', 'PERFORMANCE_SOURCE_HASH_MISMATCH']],
  ['predeclared rule', 'sources/predeclared-rule.md', ['PERFORMANCE_MEASUREMENT_RULE_HASH', 'PERFORMANCE_RULE_HASH_MISMATCH']],
  ['calculation evidence', 'reports/measurement-calculation.md', ['PERFORMANCE_MEASUREMENT_CALCULATION_HASH', 'PERFORMANCE_CALCULATION_HASH_MISMATCH']],
]) {
  test(`post-validation changes to ${label} invalidate performance status`, () => {
    const { vault } = createValidCopyVault();
    certifyReady(vault);
    addValidMeasurement(vault);
    validateResults(vault);
    fs.appendFileSync(path.join(vault, relativePath), '\ntampered after validation\n');

    const attestation = verifyPerformanceAttestation(vault);
    assert.equal(attestation.ok, false);
    assert.ok(attestation.errors.some((entry) => expectedCodes.includes(entry.code)), JSON.stringify(attestation.errors, null, 2));
    const readiness = runReadinessGates(vault, { forReady: true, writeReport: false });
    assert.equal(readiness.ok, false);
    assert.ok(readiness.errors.some((entry) => entry.gate === 'performance-attestation'));
  });
}

test('a hand-written validation marker cannot substitute for the measurement gate', () => {
  const { vault } = createValidCopyVault();
  certifyReady(vault);
  const state = readJson(path.join(vault, 'run-state.json'));
  state.performance = 'PERFORMANCE_VALIDATED';
  fs.writeFileSync(path.join(vault, 'run-state.json'), `${JSON.stringify(state, null, 2)}\n`);
  fs.writeFileSync(path.join(vault, 'Z-VALIDATED.md'), '# Performance Validation Record\n\n- Run ID: `fake`\n- Performance: `PERFORMANCE_VALIDATED`\n');

  const report = runReadinessGates(vault, { forReady: true, writeReport: false });
  assert.equal(report.ok, false);
  assert.ok(report.errors.some((entry) => entry.gate === 'performance-attestation'));
});
