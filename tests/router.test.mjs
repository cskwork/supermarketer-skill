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
