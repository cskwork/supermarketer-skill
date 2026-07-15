import { SPECIALIST_BY_NAME, SPECIALIST_NAMES, SPECIALISTS } from './catalog.mjs';

const FALLBACK_SPECIALTY = 'product-marketing';

const BOUNDARIES = Object.freeze([
  ['copy-editing', /\b(?:edit|polish|proofread|tighten|revise)\b.*\b(?:existing|this|draft)\b|\bexisting\b.*\bcopy\b/i],
  ['cold-email', /\b(?:cold|outbound)\b.*\b(?:email|sequence|prospect)/i],
  ['ad-creative', /\b(?:ad|paid social)\b.*\b(?:creative|image concepts?|variants?)/i],
  ['competitor-profiling', /\b(?:one|specific|rival)\b.*\b(?:competitor|company|account)\b.*\b(?:deep|dossier|research)/i],
  ['competitors', /\b(?:comparison|versus|alternative|battlecard)\b/i],
  ['marketing-plan', /\b(?:90[- ]day marketing plan|comprehensive marketing plan|cross-funnel marketing (?:plan|roadmap)|aarrr marketing plan)\b/i],
  ['signup', /\b(?:signup|registration|account creation)\b.*\b(?:dropoff|friction|form|abandon)/i],
  ['onboarding', /\b(?:after signup|activation|first-run|time to value|onboarding)\b/i],
  ['offers', /\b(?:offer|bonus|guarantee|risk reversal)\b/i],
  ['pricing', /\b(?:pricing tiers?|value metric|willingness to pay|how much.*charge)\b/i],
  ['programmatic-seo', /\b(?:programmatic seo|pages at scale|location pages?|template pages?)\b/i],
  ['schema', /\b(?:json-ld|structured data|schema markup|rich snippets?)\b/i],
  ['ai-seo', /\b(?:ai search|llm citations?|answer engine|generative engine|geo strategy)\b/i],
  ['seo-audit', /\b(?:seo audit|technical seo|crawl|indexing|core web vitals|ranking dropped)\b/i],
]);

function normalize(value) {
  return String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function scoreCatalog(text) {
  return SPECIALISTS.map((entry) => {
    const matched = entry.signals.filter((signal) => text.includes(signal));
    const score = matched.reduce((total, signal) => total + (signal.includes(' ') ? 3 : 1), 0);
    return { entry, matched, score };
  });
}

function resultFor(entry, confidence, matched, scores, overridden = false) {
  return {
    specialty: entry.name,
    specialty_confidence: confidence,
    specialty_matched: matched,
    specialty_reference: entry.reference,
    specialty_overridden: overridden,
    specialty_scores: scores,
  };
}

export function routeSpecialty(objective, override = null) {
  if (override !== null && override !== undefined) {
    const name = String(override);
    if (!SPECIALIST_NAMES.includes(name)) throw new Error(`Unknown specialty: ${override}`);
    return resultFor(SPECIALIST_BY_NAME[name], 1, ['explicit override'], undefined, true);
  }
  const text = normalize(objective);
  if (!text) throw new Error('Objective is required.');
  const scored = scoreCatalog(text);
  for (const [name, pattern] of BOUNDARIES) {
    const hit = text.match(pattern);
    if (hit) return resultFor(SPECIALIST_BY_NAME[name], 0.98, [hit[0]], Object.fromEntries(scored.map(({ entry, score }) => [entry.name, score])));
  }
  scored.sort((left, right) => right.score - left.score);
  const best = scored[0];
  if (best.score === 0) return resultFor(SPECIALIST_BY_NAME[FALLBACK_SPECIALTY], 0.35, [], Object.fromEntries(scored.map(({ entry, score }) => [entry.name, score])));
  return resultFor(best.entry, Math.min(0.98, 0.55 + best.score * 0.08), best.matched, Object.fromEntries(scored.map(({ entry, score }) => [entry.name, score])));
}
