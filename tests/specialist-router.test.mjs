import test from 'node:test';
import assert from 'node:assert/strict';
import { SPECIALISTS } from '../lib/specialists/catalog.mjs';
import { routeSpecialty } from '../lib/specialists/router.mjs';

test('catalog contains 47 independently reachable specialist playbooks', () => {
  assert.equal(SPECIALISTS.length, 47);
  assert.equal(new Set(SPECIALISTS.map((entry) => entry.name)).size, 47);
  for (const entry of SPECIALISTS) {
    const result = routeSpecialty(entry.sample);
    assert.equal(result.specialty, entry.name, `${entry.name} was not reachable from its sample`);
    assert.equal(result.specialty_reference, `vendor/marketingskills/skills/${entry.name}/SKILL.md`);
    assert.ok(result.specialty_matched.length > 0, `${entry.name} did not report matched evidence`);
  }
});

for (const [objective, expected] of [
  ['Rewrite this landing page copy from scratch', 'copywriting'],
  ['Edit and polish this existing landing page copy without changing the message', 'copy-editing'],
  ['Build a cold outbound sequence for a list of prospects', 'cold-email'],
  ['Design a lifecycle email welcome and nurture automation', 'emails'],
  ['Plan paid search ads and bidding', 'ads'],
  ['Create the image concepts and variants for a paid social ad', 'ad-creative'],
  ['Interview customers to understand why they buy', 'customer-research'],
  ['Build a qualified prospect list of target accounts', 'prospecting'],
  ['Create a competitor comparison page and battlecard', 'competitors'],
  ['Research one rival company deeply before a sales call', 'competitor-profiling'],
  ['Reduce registration dropoff in our account creation form', 'signup'],
  ['Improve activation after signup and shorten time to value', 'onboarding'],
  ['Choose SaaS pricing tiers and a value metric', 'pricing'],
  ['Build an irresistible offer with bonuses and a guarantee', 'offers'],
  ['Audit crawl, indexing, and Core Web Vitals problems', 'seo-audit'],
  ['Generate location landing pages at scale from a dataset', 'programmatic-seo'],
  ['Add JSON-LD structured data for rich snippets', 'schema'],
  ['Improve visibility in AI answers and LLM citations', 'ai-seo'],
  ['Plan our launch announcement and Product Hunt release', 'launch'],
  ['Create a comprehensive 90-day AARRR marketing plan', 'marketing-plan'],
  ['Set up lead scoring and the marketing-to-sales handoff', 'revops'],
  ['Pitch journalists for earned media coverage', 'public-relations'],
  ['Design a co-marketing webinar with an integration partner', 'co-marketing'],
  ['Analyze real conversion data and attribution results', 'analytics'],
  ['Design an A/B test and experiment backlog', 'ab-testing'],
]) {
  test(`distinguishes neighboring specialist intent: ${expected}`, () => {
    assert.equal(routeSpecialty(objective).specialty, expected);
  });
}

test('specialty override is exact, authoritative, and validated', () => {
  const result = routeSpecialty('generic request', 'pricing');
  assert.equal(result.specialty, 'pricing');
  assert.equal(result.specialty_confidence, 1);
  assert.deepEqual(result.specialty_matched, ['explicit override']);
  assert.throws(() => routeSpecialty('generic request', 'Pricing'), /Unknown specialty/);
  assert.throws(() => routeSpecialty('generic request', 'nope'), /Unknown specialty/);
});

test('unmatched intent falls back conservatively to product-marketing', () => {
  const result = routeSpecialty('Help me make a sensible marketing decision.');
  assert.equal(result.specialty, 'product-marketing');
  assert.equal(result.specialty_confidence, 0.35);
  assert.deepEqual(result.specialty_matched, []);
});

test('cross-funnel 90-day plans outrank narrower funnel-stage mentions', () => {
  const objective = 'Create a 90-day marketing plan for a B2B SaaS. Cover acquisition, activation, retention, referral, and revenue; include SEO, onboarding, lifecycle email, and pricing priorities. Do not publish, send, schedule, or spend.';
  assert.equal(routeSpecialty(objective).specialty, 'marketing-plan');
});
