---
name: supermarketer
description: Use for product marketing, market/customer research, positioning and messaging, GTM or campaign planning, marketing copy, posters/social creatives, product images, video ads or production packs, localization, marketing audit, creative experiments, or campaign measurement.
---

# /supermarketer — evidence-grounded product marketing and creative production

One marketing objective in -> product truth and audience evidence grounded -> channel-ready marketing package out -> launch readiness verified without pretending performance is proven.

`SKILL.md` is the thin router. Load only the required playbook from `reference/` and only the role files required from `agents/`.

## Standing rules

Before routing, read these when present:

- `.supermarketer/rules/RULES.md`
- `.supermarketer/brand/BRAND.md`
- `.supermarketer/product/PRODUCT-TRUTH.md`
- `.supermarketer/legal/CLAIM-RULES.md`

Honor them as high-priority preferences, but never weaken evidence, rights, privacy, compliance, accessibility, or publish gates.

## Core principles

- Product truth before persuasion.
- Audience, objective, funnel stage, offer, and desired action before channel or format.
- Every factual or quantitative external claim maps to evidence in `CLAIMS.yaml`.
- Channel-native variants; never mechanically resize one generic creative and call it adapted.
- Creative polish, hierarchy, legibility, and brand fit are part of correctness.
- Maker never self-approves.
- Machine-check format and traceability; use independent structured review for judgment.
- Fetch current channel specifications, policies, and regulations at run time and record source/date.
- Never invent product facts, customer quotes, testimonials, prices, results, certifications, or rights.
- External publish, send, scheduling, deployment, or media spend requires explicit approval.
- Missing media tools degrade to a documented production pack, never a fake completed asset.
- Pre-launch status is `LAUNCH_READY`, not `PERFORMANCE_VALIDATED`.

## Mode — classify and state it in one line

| Signal | Mode | Route |
|---|---|---|
| market, customer, audience, competitor, demand, category, trend | RESEARCH | `reference/research.md` |
| positioning, ICP, JTBD, value proposition, differentiation, message house | POSITION | `reference/positioning.md` |
| campaign, GTM, launch plan, channel/content plan | CAMPAIGN | `reference/campaign.md` |
| headline, ad copy, landing/email/social copy, script copy | COPY | `reference/copy.md` |
| poster, banner, carousel, flyer, social/ad creative | STATIC | `reference/static.md` |
| product image, key visual, illustration, icon, photo edit | IMAGE | `reference/image.md` |
| video, reel, short, ad film, demo, storyboard | VIDEO | `reference/video.md` |
| full launch kit, multi-channel bundle, all materials | LAUNCH-KIT | default loop + relevant asset playbooks |
| A/B test, variants, creative test, optimize | EXPERIMENT | `reference/experiments.md` |
| translate, localize, transcreate, adapt market/language | LOCALIZE | `reference/localization.md` |
| audit, critique, review, compliance/brand check | AUDIT | `reference/qa.md`; no edits by default |
| analyze CTR/CVR/results/lift/performance | MEASURE | `reference/measurement.md` |

Tie-breaks:

- Multi-asset coordinated requests -> LAUNCH-KIT.
- “Audit and fix” -> final deliverable mode with audit-first; pure AUDIT never edits.
- An image inside a poster remains STATIC with an IMAGE subtask.
- Performance optimization without real results -> EXPERIMENT, not MEASURE.
- Translation of a designed asset -> LOCALIZE because layout, timing, and cultural meaning must be adapted.

## Run vault

Create:

```text
.supermarketer/runs/<YYYYMMDD-HHMM>-<slug>/
```

Minimum files:

```text
BRIEF.md
EVIDENCE.md
CHANNEL-SPECS.yaml
CLAIMS.yaml
ASSET-MANIFEST.yaml
QA.md
run-state.json
```

Add `MESSAGE-HOUSE.md` and `CREATIVE-BRIEF.md` when load-bearing. Write `Z-READY.md` only after all launch-readiness gates pass.

## Default loop — CAMPAIGN / COPY / STATIC / IMAGE / VIDEO / LAUNCH-KIT

1. **Frame.** Create `BRIEF.md` first: original request, objective, audience, funnel stage, desired action, offer, proof, deliverables, constraints, rights, KPI, non-goals, assumptions, approval boundary, and falsifiable readiness criteria.
2. **Ground.** Create `EVIDENCE.md`, dated `CHANNEL-SPECS.yaml`, and `CLAIMS.yaml`. Use current official/high-trust sources. Never write persuasive factual claims before product truth is established.
3. **Strategize.** Produce the minimum required positioning, message hierarchy, offer/CTA, concept, and channel role. For visual/video runs create `CREATIVE-BRIEF.md`.
4. **Produce.** Dispatch fresh-context specialists. Enter every deliverable in `ASSET-MANIFEST.yaml`, including source method, claim IDs, rights status, dimensions/duration, source/editable file, rendered file, and fallback.
5. **Improve.** A separate role checks full brief coverage and edge cases: qualifiers, safe zones, crop, small-screen legibility, silent viewing, captions, alt text, localization expansion, dates/prices/terms, QR/URL validity, and all requested variants.
6. **Adversarial review.** Fresh reviewers make no production edits and try to disprove readiness across product truth, claims, brand, audience, differentiation, channel fit, visual/video quality, accessibility, rights, compliance, and culture.
7. **Exact QA/package.** Run deterministic artifact checks plus independent review. Map every success criterion to evidence in `QA.md`. Write `Z-READY.md` only when green.
8. **Publish gate.** Post/send/deploy/schedule/spend only after explicit approval naming destination, assets, timing, account, recipients, and budget scope.
9. **Measure.** Only real post-launch data may change performance status to `PERFORMANCE_VALIDATED`.

Final status must show:

```text
Readiness: LAUNCH_READY | REVIEW_READY | BLOCKED
Performance: NOT_MEASURED | MEASURING | PERFORMANCE_VALIDATED
```

## Role separation

- Strategy: `agents/product-marketer.md`
- Research: `agents/researcher.md`
- Copy: `agents/copywriter.md`
- Direction: `agents/creative-director.md`
- Static: `agents/visual-producer.md`
- Image: `agents/image-producer.md`
- Video: `agents/video-producer.md`
- Channel adaptation: `agents/channel-specialist.md`
- Localization: `agents/localization-specialist.md`
- Claims/brand/rights review: `agents/brand-claims-reviewer.md`
- Creative review: `agents/creative-reviewer.md`
- Artifact/package QA: `agents/qa-auditor.md`
- Experiment/results: `agents/experiment-analyst.md`

The creator of an asset cannot be its only reviewer.

## Verification tiers

1. **Deterministic:** files, dimensions, format, size, duration, streams, captions, names, URLs/QR targets, copy limits, manifest, claim IDs, requested variants.
2. **Evidence trace:** claims, sources, dates, permissions, channel specs, generated/licensed asset lineage.
3. **Independent review:** clarity, audience fit, differentiation, credibility, hierarchy, legibility, brand, hook/pacing, accessibility, cultural and compliance risk.
4. **Human approval:** positioning changes, high-risk claims, customer likeness/stories, publishing, sending, or spend.
5. **Outcome validation:** real campaign data only.

## Media fallback

- STATIC is complete only when an actual rendered asset exists.
- IMAGE may fall back to an art-direction/prompt pack only if clearly marked.
- VIDEO may fall back to script + time-coded storyboard + shot list + prompts + VO + on-screen text + captions + edit plan. Set `Render status: PRODUCTION_PACK_ONLY`; never claim a rendered video exists.

## Hard stops

Stop or return `BLOCKED` when:

- product facts or permissions required for a claim are missing,
- a regulated claim lacks current jurisdiction-specific review,
- a requested asset uses an unauthorized person, logo, trademark, customer data, music, footage, or testimonial,
- a platform requirement cannot be established with acceptable confidence,
- the only available output is a fallback but the request requires a rendered file,
- or external action lacks explicit approval.

## Reference map

| Read | When |
|---|---|
| `reference/workflow.md` | default run contract |
| `reference/research.md` | market/customer/competitor/channel evidence |
| `reference/product-marketing.md` | audience, JTBD, offer, funnel, launch |
| `reference/positioning.md` | positioning and message house |
| `reference/campaign.md` | integrated campaign and asset matrix |
| `reference/copy.md` | marketing copy and scripts |
| `reference/static.md` | posters, banners, carousels, social creatives |
| `reference/image.md` | image generation/editing and rights |
| `reference/video.md` | video render or production-pack contract |
| `reference/channel-specs.md` | current official channel constraints |
| `reference/brand-claims-rights.md` | brand, product claims, privacy, rights |
| `reference/accessibility.md` | contrast, captions, alt text, motion |
| `reference/localization.md` | transcreation and reflow |
| `reference/experiments.md` | variants and test design |
| `reference/measurement.md` | post-launch analysis |
| `reference/qa.md` | review and readiness gates |
| `reference/publishing.md` | external-action approval gate |

## Done

`LAUNCH_READY` requires grounded claims, current dated channel specs, complete requested assets or accepted disclosed fallbacks, manifest completeness, independent review, deterministic checks, residual risk, and no unauthorized external action.

`PERFORMANCE_VALIDATED` additionally requires real data meeting a predeclared validation rule with uncertainty and limitations reported.
