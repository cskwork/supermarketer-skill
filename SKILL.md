---
name: supermarketer
description: Use for product marketing strategy and execution across 47 specialist domains, including research, positioning, pricing, offers, SEO, lifecycle, outbound, campaigns and launch plans, copy, ads, social, posters and static creative, product images, video and reels, localization, conversion, analytics, experiments, audits, and results measurement.
---

# `/supermarketer` — evidence-grounded product marketing and creative production

Turn one marketing objective into a grounded, channel-ready package. Combine one of 12 execution modes with one of 47 marketing specialties, and verify launch readiness without pretending that pre-launch review proves performance.

This root file is a router and operating contract. Load only the relevant file from `reference/` and only the required roles from `agents/`.

## Non-negotiable state model

Always report readiness and performance separately:

```text
Readiness: DRAFT | REVIEW_READY | LAUNCH_READY | BLOCKED
Performance: NOT_MEASURED | MEASURING | PERFORMANCE_VALIDATED
```

`LAUNCH_READY` means the scoped package passed evidence, claims, channel, asset, rights, review, and QA gates. It does not mean the campaign will perform. `PERFORMANCE_VALIDATED` requires real post-launch data, a predeclared machine-checkable rule, limitations, and independent measurement review.

## Standing truth

Before beginning, read these when present:

- `.supermarketer/rules/RULES.md`
- `.supermarketer/brand/BRAND.md`
- `.supermarketer/product/PRODUCT-TRUTH.md`
- `.supermarketer/legal/CLAIM-RULES.md`

Treat them as persistent project rules. They cannot waive evidence, rights, privacy, accessibility, compliance, or publish gates.

## Route the objective

Use the deterministic router when available. Run every `node bin/supermarketer.mjs` command from this skill directory, or use the linked `supermarketer` command instead (`docs/INSTALL.md`):

```bash
node bin/supermarketer.mjs route "<objective>"
```

The router selects two independent axes:

- `mode` — what kind of work to perform and which readiness workflow applies;
- `specialty` — which domain playbook supplies the marketing knowledge.

Use `--mode MODE` or exact `--specialty specialist-name` overrides only when the user or surrounding workflow has already made that choice. See `reference/specialists.md` for the 47-entry catalog and overlap rules.

| Signal | Mode | Playbook |
|---|---|---|
| market, customer, audience, competitor, category, demand, trend | `RESEARCH` | `reference/research.md` |
| positioning, ICP, JTBD, value proposition, differentiation | `POSITION` | `reference/positioning.md` |
| campaign, GTM, launch plan, channel or content plan | `CAMPAIGN` | `reference/campaign.md` |
| headline, ad, landing, email, social, or script copy | `COPY` | `reference/copy.md` |
| poster, banner, carousel, flyer, social or display creative | `STATIC` | `reference/static.md` |
| product image, key visual, illustration, icon, photo edit | `IMAGE` | `reference/image.md` |
| video, reel, short, ad film, demo, storyboard | `VIDEO` | `reference/video.md` |
| coordinated strategy plus multiple asset classes | `LAUNCH-KIT` | `reference/workflow.md` plus asset playbooks |
| A/B test, creative variants, experiment design | `EXPERIMENT` | `reference/experiments.md` |
| translate, localize, transcreate, market adaptation | `LOCALIZE` | `reference/localization.md` |
| audit, critique, brand, claims, accessibility, compliance check | `AUDIT` | `reference/qa.md` |
| real CTR, CVR, revenue, lift, or results analysis | `MEASURE` | `reference/measurement.md` |

Tie-breakers:

- Two or more coordinated asset classes route to `LAUNCH-KIT`.
- “Audit and fix” routes to the final deliverable mode with audit first. Pure `AUDIT` makes no production edits.
- An image used only inside a poster remains a `STATIC` run with an image subtask.
- Optimization without real results routes to `EXPERIMENT`, not `MEASURE`.
- A designed asset translated for another market routes to `LOCALIZE` because meaning, proof, layout, timing, and culture must be adapted.

After routing, load in this order: standing truth, the selected mode playbook, the chosen `vendor/marketingskills/skills/<specialty>/SKILL.md`, then only the specialist references needed for the objective. Do not load the whole vendor tree.

## Create the run vault

Initialize once per project and create one isolated run per objective:

```bash
node bin/supermarketer.mjs init <project-dir>
node bin/supermarketer.mjs new "<objective>" --project <project-dir> [--mode MODE] [--specialty SPECIALTY]
```

The vault is created under:

```text
.supermarketer/runs/<YYYYMMDD-HHMM>-<slug>/
```

The machine-readable sources of truth are:

- `run-state.json` — mode, specialty, and state.
- `EVIDENCE.yaml` — product, customer, market, channel, legal, and analytics evidence.
- `CHANNEL-SPECS.yaml` — dated placement requirements.
- `CLAIMS.yaml` — claim-to-evidence and claim-to-asset links.
- `DELIVERABLES.yaml` — exact required outputs.
- `ASSET-MANIFEST.yaml` — files, metadata, rights, lineage, reviewers, and fallback state.
- `REVIEWS.yaml` — independent review verdicts and findings.
- `APPROVALS.yaml` — explicit, scoped external-action approvals only.
- `PRODUCTION-PACK.yaml` — accepted image/video fallback packs.
- `MEASUREMENT.yaml` — real post-launch data and validation rule.

The Markdown files explain the decision and evidence to humans; they do not replace structured records.

## Default execution loop

### 1. Frame

Complete `BRIEF.md` before persuasive production. Establish the original request, objective, product-truth source, audience and buying situation, funnel stage, desired action, offer, proof, exact deliverables, channels, constraints, non-goals, assumptions, decision gates, success criteria, and publish boundary.

Do not infer product capability, price, permission, customer consent, or legal approval. When a missing fact blocks a safe claim or irreversible action, remove the claim or set the run to `BLOCKED`.

### 2. Ground

Build `EVIDENCE.yaml` and the human-readable `EVIDENCE.md`. Use IDs:

```text
P-### product truth
C-### customer evidence
M-### market or competitor evidence
S-### channel requirement
L-### legal, policy, rights, or jurisdiction evidence
A-### analytics evidence
```

Every source must carry date, source type, confidence, scope, and permission status where relevant. Current channel or regulated facts require current official or high-authority sources.

### 3. Define claims and channel requirements

Record every externally verifiable statement in `CLAIMS.yaml` using `CL-###`. Map it to evidence IDs and asset IDs. Quantitative, comparative, testimonial, pricing, promotional, availability, certification, performance, high-risk, and regulated claims need their applicable evidence class, qualifications, approval owner, and expiry.

Record each channel/placement/market requirement in `CHANNEL-SPECS.yaml`. Do not rely on remembered platform specifications. Capture source, authority, checked date, freshness window, dimensions, ratio, duration, file types, size, copy limits, safe zones, and captions. Read `reference/channel-specs.md` before recording the first spec; it holds the source policy and the fallback when official documentation is inaccessible.

### 4. Strategize

Complete the mode records the routed mode requires: `MESSAGE-HOUSE.md`, `CREATIVE-BRIEF.md`, `EXPERIMENT.md`. `new` scaffolds exactly the required set into the vault, and `reference/run-vault.md` holds the mode-to-record mapping.

Use `agents/product-marketer.md`, `agents/researcher.md`, `agents/creative-director.md`, and `agents/channel-specialist.md` as fresh-context specialists. Strategy authors do not approve their own strategy.

### 5. Produce

Create `DELIVERABLES.yaml` before assets. Give every output a `D-###` record and every produced unit an `ASSET-###` manifest record.

Use the relevant producer role:

- `agents/copywriter.md`
- `agents/visual-producer.md`
- `agents/image-producer.md`
- `agents/video-producer.md`
- `agents/localization-specialist.md`

Record source paths, rendered paths, actual metadata, claim IDs, producer, generation method, tool/adapter lineage, rights status, reviewers, accessibility files, and fallback state.

When a host image or video tool returns a file, ingest it rather than inventing a path:

```bash
node bin/supermarketer.mjs ingest <vault> --asset ASSET-001 --file <path> --as rendered
node bin/supermarketer.mjs inspect <file> --kind image|video
```

Follow `reference/tool-adapters.md` and `adapters/README.md` for provider-neutral handoff rules.

### 6. Handle unavailable media tools honestly

- `STATIC` requires an actual rendered file. A textual description is not a poster.
- `IMAGE` may use `ART_DIRECTION_ONLY` only when the fallback is explicitly accepted and the required pack exists.
- `VIDEO` may use `PRODUCTION_PACK_ONLY` only when the complete script, time-coded storyboard, shot list, voiceover, on-screen text, captions, prompt pack, source list, edit plan, and output spec exist and the fallback is explicitly accepted.

Never create an empty, invalid, or nonexistent media path to simulate completion.

### 7. Independent review

The producer cannot be the reviewer. Record reviews in `REVIEWS.yaml` using `RV-###` and findings using `F-###`.

Use fresh review roles:

- `agents/brand-claims-reviewer.md`
- `agents/creative-reviewer.md`
- `agents/qa-auditor.md`
- `agents/experiment-analyst.md` for measurement

Required review types are mode-dependent and are machine-checked. High, critical, or blocker findings cannot remain open. Critical and blocker findings cannot be accepted as residual risk.

### 8. Exact QA and readiness certification

Map every success criterion to evidence in `QA.md`. Run:

```bash
node bin/supermarketer.mjs check <vault>
```

The aggregate readiness command runs 12 independent gates for required files, state, brief, evidence, claims, channel specs, deliverables, production packs, manifest/media metadata, reviews, QA, and any claimed performance attestation. The performance gate is a no-op while performance remains unmeasured.

Only after all gates pass:

```bash
node bin/supermarketer.mjs ready <vault>
```

This writes `Z-READY.md`, links it by SHA-256 to the final passing `reports/gate-report.json`, embeds a canonical integrity manifest for the certified file set, sets readiness to `LAUNCH_READY`, preserves performance status, and keeps external action unauthorized. Verification rejects changed, missing, symlinked, or newly injected files. Verify the integrity record before delivery:

```bash
node bin/supermarketer.mjs verify-ready <vault>
```

Package only a certified run:

```bash
node bin/supermarketer.mjs package <vault> --out <delivery.zip>
```

The package command emits a ZIP, package manifest, and SHA-256 sidecar.

### 9. External action remains separate

The skill never publishes, sends, schedules, deploys, or spends. To prove that a human approval record is exact and unexpired, record it in `APPROVALS.yaml` and run:

```bash
node bin/supermarketer.mjs publish-check <vault> --approval AP-001
```

The command only emits a scoped permit record. It performs no external action. Approval must name the exact assets, action, destination, account, timing, expiry, recipients when sending, and budget when spending. It must be recorded from explicit user authorization; assistant-inferred approval is invalid.

### 10. Validate real results

After launch, attach the real source data, predeclared rule file, and calculation-evidence file in `MEASUREMENT.yaml`; record each SHA-256; add an independent measurement review; then run:

```bash
node bin/supermarketer.mjs validate-results <vault>
```

The gate rejects modeled or invented data, post-hoc rules, mismatched source/rule/calculation hashes, failed thresholds, missing guardrails, self-review, and unsupported causal claims. Only a passing transactional run creates `Z-VALIDATED.md` and sets performance to `PERFORMANCE_VALIDATED`. Re-verify later with:

```bash
node bin/supermarketer.mjs verify-results <vault>
```

The core verifies the declared numeric rule and traceability contract; it does not universally recompute every KPI from every analytics-provider format.

## Hard stops

Return `BLOCKED` rather than improvising when:

- product truth or permission required for a claim is unavailable;
- a regulated or high-risk claim lacks current scoped review;
- a requested person, logo, trademark, customer story, music, footage, voice, private data, or testimonial lacks rights;
- a required channel rule cannot be established with acceptable confidence;
- the required rendered medium is unavailable and the user has not accepted the disclosed fallback;
- an independent reviewer is unavailable for a required review type;
- or an external action lacks exact explicit approval.

## Local implementation references

- Run lifecycle: `reference/run-vault.md`
- Gate semantics and what to do when `check` fails: `reference/gates.md`
- Tool adapters: `reference/tool-adapters.md`
- Full workflow: `reference/workflow.md`
- Claims, rights, and privacy: `reference/brand-claims-rights.md`
- Accessibility: `reference/accessibility.md`
- Publishing boundary: `reference/publishing.md`
- CLI: `docs/CLI.md`
- Security model: `docs/SECURITY.md`
- Structured schemas: `docs/SCHEMAS.md`
- Specialist catalog, load order, and handoffs: `reference/specialists.md`

## Completion contract

A run is complete only when the requested assets exist or an explicitly accepted fallback exists, every fact is traceable, current channel requirements are recorded, rights and accessibility are resolved, independent reviews are complete, deterministic checks pass, certified file integrity is valid, and the final response states both readiness and performance. Local hashes provide integrity linkage, not signer identity; use external signing or immutable storage when authenticity is required.
