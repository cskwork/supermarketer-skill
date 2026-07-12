# SuperMarketer Skill — Product & Marketing Specification

**Version:** 0.1.0-draft  
**Status:** Specification and starter scaffold  
**Command:** `/supermarketer <one marketing objective>`  
**Primary language for persistent files:** Match the project/brand language; if mixed or unknown, use the user's language. Keep filenames, status tokens, evidence IDs, and machine-checked anchors in English.

## 1. Executive definition

`supermarketer` is a routed, evidence-grounded marketing skill for product marketing strategy and production of campaign materials, including messaging, copy, posters, social creatives, product images, and video packages.

**Core promise**

> One marketing objective in → product truth and audience evidence grounded → channel-ready marketing package out → readiness verified without pretending performance is proven.

The skill adopts four architectural ideas from a gated engineering workflow:

1. A thin root router loads only the playbook required for the current objective.
2. Strategy, production, and review are performed by separated roles.
3. Every run has explicit deliverables, acceptance criteria, and evidence.
4. The skill stops at an honestly verified state rather than declaring success from its own opinion.

For marketing, “verified” has two meanings that must never be conflated:

- **Pre-launch readiness:** facts, claims, brand fit, formats, channel specifications, accessibility, and package completeness are checked.
- **Post-launch effectiveness:** actual KPI movement is measured from real campaign data.

A pre-launch asset may be `LAUNCH_READY`; it is never `PERFORMANCE_VALIDATED` until real data supports that status.

---

## 2. Product goals

### 2.1 Primary goals

The skill shall:

- Turn an underspecified commercial objective into a clear marketing brief.
- Ground persuasion in product truth, customer evidence, market context, and current channel requirements.
- Produce usable product marketing strategy, copy, static visuals, image assets, and video deliverables or a production-ready video pack.
- Create channel-native variants rather than mechanically resizing one generic creative.
- Trace every factual or quantitative claim to evidence.
- Separate makers from reviewers.
- Run deterministic checks where possible and structured independent review where judgment is unavoidable.
- Package deliverables with a manifest, source lineage, assumptions, residual risks, and approval state.
- Require explicit consent before publishing, posting, sending, spending, or modifying external systems.

### 2.2 Non-goals

The skill shall not:

- Guarantee reach, conversion, revenue, virality, or brand lift before launch.
- Invent customer quotes, testimonials, product capabilities, awards, certifications, prices, availability, or performance data.
- Replace legal review for regulated claims, promotions, privacy, endorsements, or rights clearance.
- Autonomously publish content, launch ads, send email, or spend budget without explicit approval.
- Treat a generic LLM preference score as proof that a creative will perform.
- Force a visual or video tool that is unavailable. It must degrade to a clearly labeled production pack.
- Perform broad brand repositioning when the request only asks for a small asset update.

---

## 3. Operating principles

1. **Product truth before persuasion.** Copy may be compelling only after the underlying product facts are established.
2. **Objective and audience before channel.** The business objective, funnel stage, target segment, desired action, and offer determine the channel and creative.
3. **Evidence-linked claims.** Every externally verifiable claim maps to a source in `CLAIMS.yaml`.
4. **Channel-native, not copy-paste.** Each asset respects the current conventions, dimensions, safe zones, length constraints, and user behavior of its destination.
5. **One primary job per asset.** A poster, ad, email, or video has one primary audience, one primary promise, and one primary CTA unless the brief explicitly requires otherwise.
6. **Creative quality is required, not decorative.** Visual hierarchy, legibility, brand fit, narrative, and production polish are part of correctness.
7. **Maker never self-approves.** The producing role cannot issue the final verdict on its own work.
8. **Machine-check what is machine-checkable.** Dimensions, duration, file formats, captions, links, naming, evidence IDs, and requested variants should be deterministic.
9. **Human judgment is logged, not disguised as a test.** Distinctiveness, emotional fit, persuasion, and cultural nuance use structured independent review with reasons.
10. **Current facts are fetched at run time.** Platform specifications, policies, prices, competitors, trends, and regulations are dated and sourced from high-trust or official sources.
11. **Graceful fallback is explicit.** Missing image/video/rendering tools produce a documented substitute, never a fabricated “completed” file.
12. **External action is a hard gate.** Publishing, posting, sending, deploying, buying media, or using customer data requires explicit consent.

---

## 4. Standing rules and run workspace

Before routing, read the following when present:

- `.supermarketer/rules/RULES.md` — persistent operating preferences.
- `.supermarketer/brand/BRAND.md` — brand positioning, voice, visual tokens, prohibited language, logo rules.
- `.supermarketer/product/PRODUCT-TRUTH.md` — approved facts, capabilities, pricing, proof, limitations.
- `.supermarketer/legal/CLAIM-RULES.md` — approved/restricted claims and required disclosures.

Standing rules are high-priority preferences but may not weaken safety, rights, evidence, or publish gates.

Each run uses an isolated vault:

```text
.supermarketer/runs/<YYYYMMDD-HHMM>-<slug>/
```

Minimum run files:

```text
BRIEF.md
EVIDENCE.md
CHANNEL-SPECS.yaml
CLAIMS.yaml
MESSAGE-HOUSE.md             # when messaging is load-bearing
CREATIVE-BRIEF.md            # when assets are produced
ASSET-MANIFEST.yaml
QA.md
run-state.json
Z-READY.md                   # only after all launch-readiness gates pass
```

Post-launch runs may add:

```text
EXPERIMENT.md
RESULTS.md
Z-VALIDATED.md               # only after real outcome data meets the declared rule
```

Existing source assets must not be overwritten by default. Copy them into the vault or write new versioned files.

---

## 5. Input contract

The router shall infer what it can and ask no more than five high-leverage questions only when a missing answer blocks product truth, rights, or irreversible action.

### 5.1 Minimum brief fields

- `objective`: what business or communication outcome is sought.
- `product`: product/service and source of truth.
- `audience`: target segment, role, situation, awareness level.
- `desired_action`: buy, book, sign up, install, visit, reply, learn, share, etc.
- `funnel_stage`: awareness, consideration, conversion, activation, retention, expansion, advocacy.
- `offer`: what the audience receives and under what conditions.
- `channels`: requested or recommended destinations.
- `deliverables`: exact assets and variants.
- `brand`: existing brand system, tone, visual references, prohibited treatments.
- `proof`: evidence, demonstrations, testimonials with permission, data, certifications.
- `constraints`: language, geography, deadline, dimensions, duration, budget, rights, accessibility, regulation.
- `success_metric`: primary KPI and guardrails.
- `approval_owner`: who may approve strategy, claims, creative, and publishing.

### 5.2 Assumption policy

When non-interactive or when the user does not answer:

- Proceed only with conservative, reversible assumptions.
- Record each assumption in `BRIEF.md`.
- Never infer product capabilities, legal permission, customer consent, or price.
- Mark blocked items `NEEDS_INPUT`.
- If a missing fact would make an external claim unsafe, remove the claim or use a clearly non-factual framing.

---

## 6. Mode router

State the selected mode in one line before work begins.

| Signal in objective | Mode | Primary output |
|---|---|---|
| market, audience, customer, competitor, category, trend, demand | `RESEARCH` | cited market/customer insight report |
| positioning, ICP, JTBD, value proposition, differentiation, message house | `POSITION` | positioning and messaging system |
| campaign, GTM, launch plan, channel plan, content plan | `CAMPAIGN` | integrated campaign strategy |
| headline, ad copy, landing copy, email, social copy, script copy | `COPY` | channel-ready copy deck |
| poster, banner, carousel, social creative, ad creative, flyer | `STATIC` | rendered static assets plus editable/source form when supported |
| product image, key visual, illustration, icon, background, photo edit | `IMAGE` | image asset(s) plus prompt/source manifest |
| video, reel, short, ad film, demo, storyboard, motion creative | `VIDEO` | rendered video or production-ready video pack |
| full launch kit, campaign pack, all materials, multi-channel bundle | `LAUNCH-KIT` | coordinated strategy, copy, static, and video package |
| A/B test, variants, creative test, experiment, optimize | `EXPERIMENT` | controlled variants and measurement plan |
| translate, localize, transcreate, adapt market/language | `LOCALIZE` | culturally adapted copy/assets with reflow |
| audit, critique, review, compliance check, brand check | `AUDIT` | findings-only report by default |
| analyze results, CTR/CVR, campaign performance, lift, learnings | `MEASURE` | evidence-based results analysis |

### 6.1 Tie-breakers

- A request for multiple coordinated asset classes routes to `LAUNCH-KIT`.
- “Audit and fix” routes to the final deliverable mode with an audit-first phase; pure `AUDIT` never edits.
- An image used only inside a poster remains a `STATIC` run with an `IMAGE` subtask.
- “Explore three concepts” is a divergent direction phase inside `CAMPAIGN`, `STATIC`, or `VIDEO`; production begins only after one direction is selected, unless the run is explicitly autonomous.
- “Translate this poster/video” routes to `LOCALIZE` because copy expansion, cultural fit, timing, and layout must be reworked.
- Performance optimization with no real results routes to `EXPERIMENT`, not `MEASURE`.

---

## 7. Default delivery loop

The default loop applies to `CAMPAIGN`, `COPY`, `STATIC`, `IMAGE`, `VIDEO`, and `LAUNCH-KIT`. Narrow, low-risk asks may run inline, but the same evidence and review contracts still apply.

### Step 1 — Frame

Create `BRIEF.md` first.

It must contain:

- Original request verbatim.
- Refined objective and non-goals.
- Audience and awareness state.
- Desired action and funnel stage.
- Offer and proof.
- Deliverables and formats.
- Constraints and rights.
- Falsifiable launch-readiness criteria.
- Primary KPI and statement that performance is unproven pre-launch.
- Approval and publish boundaries.
- Assumptions and open decision gates.

### Step 2 — Ground

Build the factual foundation before writing persuasive claims.

Create:

- `EVIDENCE.md` with dated sources.
- `CHANNEL-SPECS.yaml` with official/current platform constraints.
- `CLAIMS.yaml` with one entry for every factual or quantitative external claim.
- A product truth section or link to the approved product source.
- Competitor/customer research only to the depth needed for the objective.

Evidence classes:

- `P-###` product facts.
- `C-###` customer evidence.
- `M-###` market/competitor evidence.
- `S-###` channel/platform specifications.
- `L-###` legal/policy/rights requirements.
- `A-###` analytics/performance evidence.

### Step 3 — Strategize

The Product Marketer or Strategist produces the minimum strategy needed for the deliverable:

- ICP or priority segment.
- JTBD or buying situation.
- Problem and existing alternative.
- Positioning and differentiated value.
- Proof and objection handling.
- Message hierarchy.
- Offer and CTA.
- Concept territories.
- Channel role and journey.
- Metric hypothesis.

For asset-producing runs, create `CREATIVE-BRIEF.md`. Avoid large strategy documents when a small copy or resizing task does not need them.

### Step 4 — Produce

Dispatch fresh-context specialist roles:

- copy to the Copywriter,
- static layout to the Visual Producer,
- image generation/editing to the Image Producer,
- video to the Video Producer,
- channel adaptation to the Channel Specialist,
- localization to the Localization Specialist.

Each producer receives only the approved brief, evidence, message hierarchy, channel specs, and brand rules required for the task.

Every asset must be entered in `ASSET-MANIFEST.yaml` with:

- asset ID,
- purpose,
- audience,
- channel,
- dimensions/aspect ratio/duration,
- source/editable path,
- rendered path,
- copy version,
- claim IDs,
- generation/source method,
- rights status,
- review status,
- fallback or substitution used.

### Step 5 — Improve full brief and edge cases

A separate improver checks:

- all requested deliverables and variants,
- audience and funnel fit,
- message consistency,
- objection coverage,
- product limitations and qualifiers,
- mobile/small-screen readability,
- safe zones and crop resilience,
- captions, silent viewing, alt text,
- localization expansion,
- accessibility and color contrast,
- error-prone dates, prices, promo terms, QR codes, and URLs,
- derivative sizes and file-weight constraints.

Do not add unrequested scope merely to make the campaign larger.

### Step 6 — Mandatory adversarial review

A fresh reviewer makes no production edits. The reviewer attempts to disprove readiness across:

- product truth,
- unsupported or misleading claims,
- audience mismatch,
- generic or undifferentiated messaging,
- brand drift,
- channel mismatch,
- visual hierarchy and legibility,
- hook, pacing, and first-frame quality,
- accessibility,
- legal/policy/rights concerns,
- cultural or localization risk,
- missing variants or package items.

Findings become:

- required fixes,
- decision gates,
- or residual risks.

Reviewer approval alone never means done.

### Step 7 — Exact QA and package

Run the applicable deterministic checks and independent review rubric.

Then:

- map each success criterion to evidence in `QA.md`,
- verify every requested asset exists,
- verify manifests and claims,
- record tool limitations and fallbacks,
- record preview/render evidence,
- mark unresolved risk honestly,
- write `Z-READY.md` only when every launch-readiness criterion is met.

Final status must include both:

```text
Readiness: LAUNCH_READY | REVIEW_READY | BLOCKED
Performance: NOT_MEASURED | MEASURING | PERFORMANCE_VALIDATED
```

### Step 8 — Publish gate

Publishing, posting, sending, deploying, scheduling, buying media, or using a customer list is a separate action.

It requires:

- exact destination,
- final asset IDs,
- account/workspace,
- timing,
- spend or recipient scope,
- explicit user approval,
- and a recorded approval line.

No approval means package only.

### Step 9 — Post-launch measurement

`MEASURE` uses real analytics or experiment data.

It shall:

- verify data definitions and date range,
- calculate the declared KPI,
- compare against baseline/control where available,
- distinguish correlation from causal evidence,
- report sample size and uncertainty,
- identify confounders,
- recommend the next test,
- write `Z-VALIDATED.md` only when the predeclared validation rule is met.

---

## 8. Mode contracts

### 8.1 `RESEARCH`

**Deliverables**

- Research question and decision to be informed.
- Target segment and buying situation.
- Customer/problem evidence.
- Competitor/substitute map.
- Category language and message patterns.
- Dated sources and confidence.
- Unknowns and next research actions.

**Done when**

- Every material fact is cited.
- Research is recent enough for the decision.
- Primary/official sources are preferred.
- Insights are separated from facts.
- No invented market size or customer behavior.

### 8.2 `POSITION`

**Deliverables**

- ICP/priority segment.
- JTBD or buying situation.
- Category frame.
- Competitive alternatives.
- Unique attributes and differentiated value.
- Reasons to believe.
- Positioning statement.
- Message house: promise, pillars, proof, objections, CTA.
- Prohibited or unsupported messages.

**Done when**

- Positioning reflects product truth.
- Differentiation is comparative but not unsubstantiated.
- Claims have evidence.
- The message can be adapted to at least two awareness levels.

### 8.3 `CAMPAIGN`

**Deliverables**

- Objective, funnel stage, KPI, guardrails.
- Audience and insight.
- Offer and CTA.
- Big idea or selected concept.
- Channel roles.
- Asset matrix.
- Content/campaign sequence.
- Measurement and decision plan.

**Done when**

- Each channel has a job in the journey.
- Every asset maps to audience, message, CTA, and KPI.
- The campaign is bounded by explicit non-goals.

### 8.4 `COPY`

**Deliverables**

- Copy deck grouped by channel and asset.
- Primary version and bounded variants.
- Character/line constraints.
- Claim IDs and disclosures.
- Rationale for major message decisions.
- Optional alt text, metadata, subject/preheader, CTA labels.

**Done when**

- Copy is specific, audience-relevant, and product-true.
- Unsupported superlatives and generic filler are removed.
- The CTA is concrete.
- Required limits and disclosures pass.

### 8.5 `STATIC`

**Deliverables**

- Rendered files in requested sizes.
- Editable/source representation when the tool supports it.
- Copy and layout source.
- Thumbnail/contact sheet or preview.
- Manifest and QA notes.

**Visual requirements**

- One dominant message and one primary CTA.
- Legible at intended viewing size.
- Brand system and logo clearspace respected.
- Safe zones and crop behavior checked.
- No fake UI, fake data, fake review, or meaningless decoration.
- Text contrast is computed when colors are known.
- Generated imagery is disclosed in the manifest.
- Variants are channel-native, not merely stretched.

### 8.6 `IMAGE`

**Deliverables**

- Image file(s).
- Prompt/source lineage.
- Aspect ratio and intended use.
- Edit history or input asset references.
- Rights and likeness status.
- Exclusions and known artifacts.

**Done when**

- The image supports the brief rather than decorating it.
- Product attributes are not visually falsified.
- Logos, packaging, people, hands, text, and critical product details are inspected.
- No unauthorized person likeness or trademark usage.
- Output resolution and crop meet the intended asset.

### 8.7 `VIDEO`

**Deliverables when rendering tools are available**

- Master video.
- Channel variants.
- Script and voiceover.
- Storyboard.
- Shot list and asset list.
- Captions/subtitles.
- Thumbnail or first-frame asset.
- Edit decision notes.
- Music/voice/footage rights manifest.

**Fallback when rendering tools are unavailable**

Set:

```text
Render status: PRODUCTION_PACK_ONLY
```

Deliver:

- final script,
- time-coded storyboard,
- shot list,
- generation prompts,
- voiceover copy,
- on-screen text,
- caption file,
- audio direction,
- transition/edit plan,
- output specifications.

Never represent this fallback as a rendered video.

**Video review**

- The first seconds establish relevance or tension.
- Visuals communicate without sound where the channel requires it.
- On-screen text remains readable for its actual display time.
- Claims and demonstrations are truthful.
- Pacing, continuity, audio levels, captions, end card, and CTA are checked.
- Duration, dimensions, codec/container, frame rate, and file size are checked when applicable.

### 8.8 `LAUNCH-KIT`

**Deliverables**

- Positioning/message house.
- Campaign/launch strategy.
- Copy deck.
- Static assets.
- Image assets.
- Video or production pack.
- Channel matrix.
- Asset manifest.
- Launch checklist.
- Measurement plan.

**Done when**

- All assets share one strategy and message hierarchy.
- Each item has a channel role.
- The bundle has no orphan files, inconsistent claims, or mismatched CTAs.

### 8.9 `EXPERIMENT`

**Deliverables**

- Hypothesis.
- Audience and placement.
- Control and variants.
- Exactly one primary variable per comparison unless a multivariate design is explicit.
- Primary metric, guardrails, minimum detectable effect or practical decision threshold when data permits.
- Sample/exposure assumptions.
- Stop and decision rules.
- Analysis template.

**Done when**

- Variants are meaningfully different but comparable.
- No post-hoc success metric is allowed.
- The plan distinguishes exploratory from confirmatory tests.

### 8.10 `LOCALIZE`

**Deliverables**

- Transcreated copy, not literal translation.
- Cultural and market assumptions.
- Adapted proof, examples, CTA, date/number/currency formats.
- Revised layout or timing for text expansion.
- Back-translation or meaning check for high-risk claims.
- Local legal/policy requirements.

**Done when**

- Meaning, tone, and intent survive.
- Unfamiliar idioms and culturally risky imagery are replaced.
- Localized assets are re-rendered and reviewed.

### 8.11 `AUDIT`

**Deliverables**

- Findings sorted by severity.
- Exact asset/file/location.
- Why it matters.
- Evidence or rule.
- Concrete fix.
- Verdict and residual risk.

**Default behavior**

- No edits.
- Do not approve based on taste alone.
- Separate factual, compliance, brand, channel, and creative findings.

### 8.12 `MEASURE`

**Deliverables**

- Data scope and definitions.
- KPI results.
- Baseline/control comparison.
- Confidence/uncertainty.
- Segment and channel breakdowns.
- Creative/message learnings.
- Recommendation: scale, iterate, stop, or gather more data.

**Done when**

- Calculations are reproducible.
- Missing attribution or tracking issues are disclosed.
- Causal claims are limited to valid experimental designs.

---

## 9. Role architecture

| Role | Responsibility | May edit production? | May issue final verdict? |
|---|---|---:|---:|
| Conductor | route, scope, dispatch, merge evidence, enforce gates | limited | yes, only from recorded evidence |
| Product Marketer | audience, positioning, message, offer, launch strategy | strategy docs | no |
| Researcher | market/customer/competitor/channel research | evidence docs | no |
| Copywriter | channel copy and scripts | copy | no |
| Creative Director | concept, art direction, cross-asset coherence | brief/direction | no |
| Visual Producer | posters, banners, social, layout | static assets | no |
| Image Producer | generation/editing/source images | image assets | no |
| Video Producer | script, storyboard, rendering/edit pack | video assets | no |
| Channel Specialist | channel conventions and adaptations | variants/specs | no |
| Localization Specialist | transcreation and market adaptation | localized assets | no |
| Brand & Claims Reviewer | brand, product truth, claims, rights, disclosure | findings only | no |
| Creative Reviewer | clarity, hierarchy, distinctiveness, audience fit | findings only | no |
| QA Auditor | deterministic artifact and package verification | findings/QA only | no |
| Experiment Analyst | test design and results analysis | experiment/results docs | no |

The creator of an asset cannot be its only reviewer. Complex runs should use fresh-context roles and parallelize independent review dimensions.

---

## 10. Verification model

### 10.1 Gate levels

#### Level A — Deterministic artifact checks

Examples:

- requested files exist,
- dimensions and aspect ratios,
- file type and file size,
- video duration, frame rate, audio stream, and container metadata,
- captions/subtitle file presence,
- naming and versioning,
- valid URLs and QR targets,
- copy character/line limits from `CHANNEL-SPECS.yaml`,
- asset IDs and manifest completeness,
- claim IDs resolve,
- no unresolved `TODO`, placeholder, or `NEEDS_INPUT` in final assets,
- output variants match the request.

#### Level B — Evidence trace checks

- every factual/quantitative claim maps to evidence,
- source is dated and has credibility metadata,
- channel specs have source/date,
- customer quotes have permission status,
- brand rules and disclosures are referenced,
- generated or licensed assets have source/rights status.

#### Level C — Independent expert review

Structured rubric, not a fake machine score:

- clarity,
- audience relevance,
- differentiation,
- credibility,
- emotional and contextual fit,
- visual hierarchy,
- legibility,
- brand consistency,
- channel fit,
- hook/pacing for video,
- accessibility,
- cultural risk,
- compliance/rights risk.

Each finding includes a reason and concrete fix. A numeric score may summarize but cannot replace findings.

#### Level D — Approval gate

Human approval is required for:

- final positioning changes,
- high-risk claims,
- use of customer stories or likeness,
- final brand direction when no brand rules exist,
- external publishing,
- paid media spend,
- email or message sends,
- irreversible edits.

#### Level E — Outcome validation

Only real post-launch data may satisfy this gate.

### 10.2 Readiness status

- `DRAFT` — incomplete or unreviewed.
- `REVIEW_READY` — complete enough for stakeholder review; unresolved decisions remain.
- `LAUNCH_READY` — all pre-launch gates green; explicit residual risks recorded.
- `PUBLISHED` — external action completed with consent and evidence.
- `PERFORMANCE_VALIDATED` — predeclared result condition met using real data.

---

## 11. Claims, rights, privacy, and compliance

### 11.1 Claims rules

- No claim without product evidence or a clearly labeled hypothesis/opinion.
- Quantitative claims require scope, population, method, and date where relevant.
- Comparative claims require a fair and current comparison basis.
- “Best,” “guaranteed,” “risk-free,” “instant,” and similar absolute language is prohibited unless formally approved and evidenced.
- Testimonials must be real, permissioned, and accurately represented.
- Demonstrations must not imply functionality the product does not have.
- Promotions must state material terms.

`CLAIMS.yaml` schema:

```yaml
claims:
  - id: CL-001
    text: "Example claim"
    type: factual|quantitative|comparative|testimonial|promotional
    evidence_ids: [P-001]
    qualification: "Scope or condition"
    approval: pending|approved|rejected
    asset_ids: [ASSET-001]
```

### 11.2 Rights and likeness

The manifest records:

- owner/source,
- license or permission,
- allowed use,
- expiration/territory if applicable,
- model/property release status,
- AI-generated status,
- trademark/brand permission,
- music/voice/footage rights.

Do not use a real person's likeness, customer logo, celebrity, trademark, copyrighted character, or private customer data without an authorized basis.

### 11.3 Privacy

- Redact personal and confidential data before sending to external generation tools.
- Do not upload customer lists, recordings, or unreleased product information without authorization.
- Record tool/provider exposure when relevant.
- Use synthetic placeholders only when clearly labeled and never as real proof.

### 11.4 Regulated categories

Health, finance, legal, children, employment, housing, political, gambling, alcohol, nicotine, and other regulated contexts require jurisdiction-specific current research and explicit approval. The skill must not rely on static policy memory.

---

## 12. Channel specification policy

Channel requirements change. Do not hardcode them as timeless facts.

For every requested channel, `CHANNEL-SPECS.yaml` must record:

```yaml
channels:
  - name: "<channel>"
    placement: "<placement>"
    checked_at: "<ISO-8601>"
    source: "<official source or documented fallback>"
    dimensions: []
    aspect_ratios: []
    duration_seconds: {}
    file_types: []
    file_size_limit: null
    text_constraints: {}
    safe_zone_notes: ""
    caption_requirements: ""
    accessibility_notes: ""
    policy_notes: ""
    confidence: high|medium|low
```

Use official platform sources when available. If official documentation cannot be accessed, disclose the fallback and reduce confidence.

---

## 13. Tool adapter contract

The skill is tool-agnostic. It detects available tools and records the selected adapter in the manifest.

### 13.1 Research adapter

Preferred:

1. official product documentation and first-party data,
2. official platform/policy sources,
3. high-quality primary research,
4. reputable secondary sources,
5. clearly labeled user-provided evidence.

### 13.2 Static design adapter

Preferred chain:

1. editable design tool available in the environment,
2. HTML/SVG/vector generation with rendered preview,
3. image composition tool,
4. layout specification only, clearly marked.

A static asset is complete only when an actual rendered file exists. A text description alone is not a poster.

### 13.3 Image adapter

Preferred chain:

1. native image generation/editing,
2. approved external image provider,
3. licensed or user-provided source image,
4. vector/SVG creation,
5. prompt and art-direction pack only.

Record the tier and substitutions.

### 13.4 Video adapter

Preferred chain:

1. native video generation/editing,
2. configured video provider,
3. editor/design-tool assembly,
4. local assembly from supplied/generated assets,
5. production pack only.

If no renderer exists, do not fabricate a media file or claim completion.

### 13.5 Publishing adapter

Publishing tools are never invoked from ordinary production. They require a separate, explicit publish action and approval record.

---

## 14. Repository layout

```text
supermarketer/
├── SKILL.md
├── README.md
├── SPEC.md
├── agents/
│   ├── product-marketer.md
│   ├── researcher.md
│   ├── copywriter.md
│   ├── creative-director.md
│   ├── visual-producer.md
│   ├── image-producer.md
│   ├── video-producer.md
│   ├── channel-specialist.md
│   ├── localization-specialist.md
│   ├── brand-claims-reviewer.md
│   ├── creative-reviewer.md
│   ├── qa-auditor.md
│   └── experiment-analyst.md
├── reference/
│   ├── workflow.md
│   ├── research.md
│   ├── product-marketing.md
│   ├── positioning.md
│   ├── campaign.md
│   ├── copy.md
│   ├── static.md
│   ├── image.md
│   ├── video.md
│   ├── channel-specs.md
│   ├── brand-claims-rights.md
│   ├── accessibility.md
│   ├── localization.md
│   ├── experiments.md
│   ├── measurement.md
│   ├── qa.md
│   └── publishing.md
├── templates/
│   ├── BRIEF.md
│   ├── EVIDENCE.md
│   ├── MESSAGE-HOUSE.md
│   ├── CREATIVE-BRIEF.md
│   ├── CHANNEL-SPECS.yaml
│   ├── CLAIMS.yaml
│   ├── ASSET-MANIFEST.yaml
│   ├── QA.md
│   ├── EXPERIMENT.md
│   ├── RESULTS.md
│   └── run-state.json
├── scripts/
│   ├── brief-gate.*
│   ├── claims-gate.*
│   ├── manifest-gate.*
│   ├── image-metadata-gate.*
│   ├── video-metadata-gate.*
│   ├── channel-spec-gate.*
│   └── package-gate.*
├── tests/
│   ├── frontmatter-contract.*
│   ├── mode-routing-contract.*
│   ├── reference-links-contract.*
│   ├── no-performance-claim-contract.*
│   ├── publish-gate-contract.*
│   └── scenario-contracts/
└── examples/
    ├── b2b-saas-launch/
    ├── consumer-poster/
    └── short-video-fallback/
```

The root `SKILL.md` should remain a thin router. Detailed procedure belongs in `reference/` and persona files.

---

## 15. Gate CLI design

The exact implementation language is optional, but the interfaces should be stable.

```bash
# Validate brief completeness and status language
node scripts/brief-gate.mjs <vault>

# Ensure all external claims resolve to evidence and approvals
node scripts/claims-gate.mjs <vault>

# Verify requested assets, IDs, variants, and paths
node scripts/manifest-gate.mjs <vault>

# Inspect static file dimensions, formats, and expected variants
python scripts/image-metadata-gate.py <vault>

# Inspect duration, streams, captions, dimensions, frame rate, and container
python scripts/video-metadata-gate.py <vault>

# Require dated/source-backed channel specs
node scripts/channel-spec-gate.mjs <vault>

# Final launch-readiness gate
bash scripts/package-gate.sh <vault>
```

The final gate shall fail when:

- any required asset is missing,
- an unsupported claim is used,
- a channel spec is missing or undated,
- a required review is absent,
- fallback status is concealed,
- a publish action lacks approval,
- final status says performance is proven without real result evidence.

---

## 16. Contract tests and scenarios

### 16.1 Structural tests

- Valid skill frontmatter and concise trigger description.
- Every routed mode has a reference and a deliverable contract.
- No broken local links.
- Every producer has a separate reviewer.
- All templates contain required machine anchors.
- The root router does not embed all playbooks.

### 16.2 Behavioral tests

1. **Unsupported claim**
   - Input: “Create a poster saying the product doubles revenue” with no evidence.
   - Expected: claim blocked or rewritten; no launch-ready verdict.

2. **Static asset**
   - Input: 1080×1350 social poster with brand assets.
   - Expected: actual rendered file, manifest entry, legibility/contrast review, correct dimensions.

3. **Video tool unavailable**
   - Input: 15-second vertical ad.
   - Expected: full production pack, `PRODUCTION_PACK_ONLY`, no fake video file.

4. **Multi-channel launch**
   - Input: positioning, landing copy, poster, social copy, and video.
   - Expected: `LAUNCH-KIT`, one message hierarchy, coordinated assets, no orphan deliverables.

5. **Localization**
   - Input: adapt an English poster to Korean.
   - Expected: transcreation, layout reflow, local formatting, re-rendered output.

6. **Audit only**
   - Input: review existing materials.
   - Expected: findings with no edits.

7. **Regulated claim**
   - Input: health or financial performance claim.
   - Expected: current jurisdiction research, legal decision gate, no autonomous approval.

8. **Publish request**
   - Input: “Post this everywhere.”
   - Expected: exact destinations and scope enumerated; explicit approval required before any action.

9. **Performance request before launch**
   - Input: “Verify this will convert.”
   - Expected: explain pre-launch readiness versus outcome validation; propose an experiment.

10. **Post-launch measure**
    - Input: campaign data and predeclared metric.
    - Expected: reproducible calculation, uncertainty, limitations, no causal overclaim.

---

## 17. Recommended MVP

The full vision is broad. A reliable first release should not attempt every medium at equal depth.

### v0.1 — Grounded PMM + copy + static

Implement:

- `RESEARCH`, `POSITION`, `COPY`, `STATIC`, `IMAGE`, `AUDIT`, `LAUNCH-KIT`.
- Run vault and templates.
- Claims/evidence/manifest/channel-spec gates.
- Static metadata and preview checks.
- Publish hard gate.
- Independent brand/claims and creative review.

Do not implement autonomous external publishing or paid media.

### v0.2 — Video production system

Add:

- `VIDEO` with provider adapters.
- Script/storyboard/shot list/captions.
- Video metadata gate.
- Thumbnail and first-frame checks.
- Guaranteed `PRODUCTION_PACK_ONLY` fallback.

### v0.3 — Experiment and measurement

Add:

- `EXPERIMENT` and `MEASURE`.
- Analytics connectors.
- Predeclared decision rules.
- Reproducible metric calculations.
- `Z-VALIDATED.md`.

### v0.4 — Brand memory and team operations

Add:

- brand/product truth onboarding,
- approval roles,
- reusable campaign library,
- live run board,
- asset lineage and reuse tracking.

---

## 18. Example invocations

```text
/supermarketer position our developer analytics product for Korean B2B SaaS founders and produce a message house

/supermarketer create a 1080x1350 launch poster for Product X using the attached brand guide and approved product facts

/supermarketer make a launch kit: landing hero copy, three LinkedIn posts, one poster, and a 15-second vertical video for our new feature

/supermarketer create a key visual and three social crops; do not use people or stock-photo aesthetics

/supermarketer make a 20-second product video. If video rendering is unavailable, deliver a complete production pack and captions

/supermarketer audit these ads for unsupported claims, brand drift, channel mismatch, and accessibility; no edits

/supermarketer localize this US campaign for Korea; transcreate rather than translate literally

/supermarketer design an A/B test for the value proposition, changing only the primary promise

/supermarketer analyze the attached campaign results against the predeclared conversion KPI
```

---

## 19. Definition of done

A run is `LAUNCH_READY` only when:

- mode and scope are explicit,
- product truth and material claims are grounded,
- current channel specifications are dated and sourced,
- every requested deliverable exists or a disclosed fallback is accepted,
- every asset appears in the manifest,
- brand, claims, rights, accessibility, and channel reviews are complete,
- deterministic checks pass,
- unresolved decisions and residual risks are recorded,
- the producer did not self-approve,
- no external action occurred without explicit approval,
- and performance status remains `NOT_MEASURED` unless real post-launch evidence exists.

A run is `PERFORMANCE_VALIDATED` only when a predeclared outcome rule is met using real data and the analysis documents uncertainty and limitations.

---

## 20. Design lineage and implementation note

This specification is inspired by the routing, role separation, thin-root/reference architecture, and gated verification approach of `cskwork/supergoal-skill`, with visual-production ideas informed by `cskwork/superdesign-skill`. The marketing design changes the ground truth from code/tests to product truth, evidence-linked claims, current channel requirements, asset metadata, independent creative review, and post-launch results.

This starter is a specification, not a claim that all listed gate scripts or external media adapters are already implemented.
