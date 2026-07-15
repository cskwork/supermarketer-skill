import test from 'node:test';
import assert from 'node:assert/strict';
import { routeObjective } from '../lib/router.mjs';

test('routes bilingual multi-asset requests to LAUNCH-KIT', () => {
  const result = routeObjective('신제품 출시 전략과 포스터 이미지, 짧은 영상, 광고 카피를 만들어줘');
  assert.equal(result.mode, 'LAUNCH-KIT');
  assert.ok(result.confidence >= 0.7);
});

test('explicit mode override is authoritative and validated', () => {
  assert.equal(routeObjective('anything', 'COPY').mode, 'COPY');
  assert.throws(() => routeObjective('anything', 'NOPE'), /Unknown mode/);
});

test('mode and specialty route independently without changing legacy mode fields', () => {
  const result = routeObjective('Audit our pricing tiers and value metric.', 'AUDIT');
  assert.equal(result.mode, 'AUDIT');
  assert.equal(result.reference, 'reference/qa.md');
  assert.equal(result.specialty, 'pricing');
  assert.equal(result.specialty_reference, 'vendor/marketingskills/skills/pricing/SKILL.md');
  assert.ok(result.specialty_confidence >= 0.7);
  assert.ok(result.specialty_matched.length > 0);
});

test('mode and specialty overrides are independently authoritative', () => {
  const result = routeObjective('Write a launch email.', 'MEASURE', 'seo-audit');
  assert.equal(result.mode, 'MEASURE');
  assert.equal(result.specialty, 'seo-audit');
  assert.equal(result.confidence, 1);
  assert.equal(result.specialty_confidence, 1);
});

for (const [label, objective] of [
  ['launch announcement copy', 'Write the public-launch announcement copy for supermarketer-skill v1.0.0: a GitHub release note and an X post targeting AI-coding developers'],
  ['bare copy as a noun', 'Write the copy for our new landing page'],
  ['release note', 'Draft a GitHub release note for the v2.0 launch'],
  ['social post', 'Write a social post announcing the feature'],
  ['blog post', 'Draft a blog post about the release'],
]) {
  test(`routes ${label} to COPY`, () => {
    const result = routeObjective(objective);
    assert.equal(result.mode, 'COPY', `expected COPY, got ${result.mode} (matched: ${JSON.stringify(result.matched)})`);
    assert.ok(result.matched.length > 0, 'COPY should have matched at least one signal');
    assert.ok(result.confidence >= 0.7, `confidence ${result.confidence} too low`);
  });
}
