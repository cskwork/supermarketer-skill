# Supermarketer forward test: 90-day B2B SaaS plan

## Exact prompt

> Create a 90-day marketing plan for a B2B SaaS. Cover acquisition, activation, retention, referral, and revenue; include SEO, onboarding, lifecycle email, and pricing priorities. Do not publish, send, schedule, or spend.

## Deterministic route JSON

Command run before loading the selected playbooks:

```bash
node bin/supermarketer.mjs route "Create a 90-day marketing plan for a B2B SaaS. Cover acquisition, activation, retention, referral, and revenue; include SEO, onboarding, lifecycle email, and pricing priorities. Do not publish, send, schedule, or spend." --json
```

```json
{
  "mode": "CAMPAIGN",
  "confidence": 0.35,
  "matched": [],
  "reference": "reference/campaign.md",
  "primary_output": "integrated campaign strategy",
  "overridden": false,
  "scores": {
    "MEASURE": 0,
    "AUDIT": 0,
    "LOCALIZE": 0,
    "EXPERIMENT": 0,
    "LAUNCH-KIT": 0,
    "VIDEO": 0,
    "STATIC": 0,
    "IMAGE": 0,
    "COPY": 0,
    "CAMPAIGN": 0,
    "POSITION": 0,
    "RESEARCH": 0
  },
  "specialty": "onboarding",
  "specialty_confidence": 0.98,
  "specialty_matched": [
    "activation"
  ],
  "specialty_reference": "vendor/marketingskills/skills/onboarding/SKILL.md",
  "specialty_overridden": false,
  "specialty_scores": {
    "ab-testing": 0,
    "ad-creative": 0,
    "ads": 0,
    "ai-seo": 0,
    "analytics": 0,
    "aso": 0,
    "churn-prevention": 0,
    "co-marketing": 0,
    "cold-email": 0,
    "community-marketing": 0,
    "competitor-profiling": 0,
    "competitors": 0,
    "content-strategy": 0,
    "copy-editing": 0,
    "copywriting": 0,
    "cro": 0,
    "customer-research": 0,
    "directory-submissions": 0,
    "emails": 3,
    "free-tools": 0,
    "image": 0,
    "launch": 0,
    "lead-magnets": 0,
    "marketing-council": 0,
    "marketing-ideas": 0,
    "marketing-loops": 0,
    "marketing-plan": 3,
    "marketing-psychology": 0,
    "offers": 0,
    "onboarding": 0,
    "paywalls": 0,
    "popups": 0,
    "pricing": 0,
    "product-marketing": 0,
    "programmatic-seo": 0,
    "prospecting": 0,
    "public-relations": 0,
    "referrals": 0,
    "revops": 0,
    "sales-enablement": 0,
    "schema": 0,
    "seo-audit": 0,
    "signup": 0,
    "site-architecture": 0,
    "sms": 0,
    "social": 0,
    "video": 0
  }
}
```

## Playbooks loaded

- `SKILL.md` — root router and operating contract.
- `reference/product-marketing.md` — standing-truth/context adapter; no project-specific product facts were available.
- `reference/campaign.md` — selected `CAMPAIGN` mode playbook.
- `vendor/marketingskills/skills/onboarding/SKILL.md` — selected `onboarding` specialist playbook.
- `vendor/marketingskills/skills/onboarding/references/experiments.md` — directly needed onboarding experiment reference.
- `reference/specialists.md` lines 1–40 only — directly needed specialty boundaries and handoffs.

No `.supermarketer/rules/RULES.md`, `.supermarketer/brand/BRAND.md`, `.supermarketer/product/PRODUCT-TRUTH.md`, `.supermarketer/legal/CLAIM-RULES.md`, `.agents/product-marketing.md`, `.claude/product-marketing.md`, or legacy `product-marketing-context.md` was present. This plan therefore uses no product-specific claims, prices, benchmarks, or invented targets.

## 90-day plan

**Decision:** improve the full qualified-account-to-retained-revenue loop, but establish activation and measurement before scaling acquisition. Acquiring more users before they reach first value would amplify funnel leakage.

**Status:** Readiness: `DRAFT` | Performance: `NOT_MEASURED`

### Scoreboard and target-setting rule

Days 1–14 establish baselines; by Day 14, the product, sales, and finance owners approve one numeric 90-day target per stage. Until then, targets remain unknown rather than fabricated.

| Stage | Primary measure | Diagnostic and guardrail measures |
|---|---|---|
| Acquisition | Qualified organic demo/trial starts | Non-brand impressions, high-intent page conversion, source-to-activation rate, sales-qualified pipeline |
| Activation | Signups/accounts reaching the validated activation event within 7 days | Median time-to-value, step completion, support requests, activation by source and role |
| Retention | Day-30 retained accounts in the activated cohort | Weekly active accounts, feature adoption, churn reasons, lifecycle unsubscribe/spam rate |
| Referral | Eligible activated accounts producing a qualified referral | Referral acceptance and referred-account activation; incentive cost if a later pilot is approved |
| Revenue | Qualified account-to-paid conversion | Average revenue per account, discount rate, expansion, gross and net revenue retention |

The activation event must be the earliest behavior that correlates with later retention, not a cosmetic completion event. Examples such as “created a project and invited a teammate” are hypotheses until cohort data confirms the product-specific event.

### Days 1–30: ground the funnel and remove first-value friction

1. **Measurement foundation:** define the funnel event taxonomy from source and signup through activation, paid conversion, retention risk, expansion, and referral. Build one cohort view segmented by source, company size, role, and use case. Record current baselines and data gaps.
2. **ICP and buying situation:** approve the priority segment, buyer/user roles, urgent job, alternatives, proof, objections, desired action, and claims that can be supported. Review sales, support, win/loss, and churn evidence; interview 6–10 representative customers/prospects only after separate outreach approval.
3. **SEO acquisition:** audit technical/indexing health, existing high-intent pages, rankings, conversions, internal links, and competitor/topic gaps. Build a demand map around problems, alternatives, comparisons, integrations, and use cases. Prioritize the top three bottom-funnel clusters by qualified demand, business fit, evidence availability, and ranking feasibility; prepare briefs and update recommendations without publishing.
4. **Onboarding activation:** map signup → setup → first value → team adoption, identify the largest drop-off, and validate the activation event against retention. Prototype one shortest-path experience with a single first-session goal, useful defaults/templates, a 3–7 item dismissible checklist, visible progress, and recovery from empty/error states.
5. **Lifecycle and retention:** define behavioral triggers and suppression rules. Draft coordinated in-app/email journeys for welcome, incomplete setup at 24/72 hours, activation achieved, feature adoption on days 3/7/14, stalled users, renewal risk, and expansion readiness. Every message has one action and reinforces rather than duplicates the product.
6. **Referral:** identify the earned-value moment when an activated, satisfied account may reasonably advocate. Define eligible users, a double-sided benefit hypothesis, fraud/privacy constraints, and referred-user onboarding. Do not ask before value is demonstrated.
7. **Pricing:** audit tiers, packaging, value metric, entitlements, discounting, upgrade path, and objections using current product and sales evidence. Separate pricing/packaging from promotional offers. Form two or three testable packaging hypotheses; do not change a live price.

**Day-30 exit:** agreed ICP and activation event; trustworthy baseline dashboard; prioritized SEO briefs; test-ready onboarding prototype; lifecycle trigger/copy map; referral pilot brief; pricing hypothesis memo. Each item has an owner, evidence source, KPI, guardrail, and approval gate.

### Days 31–60: run the first controlled learning cycle

1. **Acquisition:** prepare one high-intent pillar and two supporting pages for each prioritized SEO cluster, plus fixes to the best existing conversion pages and their internal-link paths. Stage measurement and claim review. Publication remains a separate approval.
2. **Activation:** test the shortest path against the current experience. Primary metric: validated 7-day activation; guardrails: time-to-value, downstream Day-30 retention proxy, errors, and support load. Candidate variants are quick-start vs. full setup, templates/demo data, step order, and role/use-case personalization.
3. **Lifecycle/retention:** QA behavior-based onboarding and stalled-user flows against event, audience, suppression, frequency, accessibility, and unsubscribe requirements. Compare behavior-triggered recovery with the existing experience only after separate send approval. Add a high-value-account human handoff instead of indiscriminate automation.
4. **Referral:** prototype the invitation moment, landing flow, attribution, and referred-user onboarding. Usability-test the concept; do not expose it broadly until activation and abuse controls pass.
5. **Revenue/pricing:** test tier comprehension, value-metric fit, and upgrade messaging through interviews, sales call review, and a non-live pricing prototype. Track segment-level willingness, objections, discount pressure, and conversion risk. No production price or paywall change occurs in this phase without explicit approval.

**Day-60 exit:** one completed activation learning cycle; SEO and lifecycle packages ready for their separate launch gates; tested referral prototype; evidence-backed pricing recommendation with finance and product review.

### Days 61–90: compound validated winners and decide the next quarter

1. **Acquisition:** expand only clusters that show qualified impressions, engagement, conversion, or pipeline signal; refresh weak pages, strengthen internal links, and stop low-fit topics. Measure SEO by qualified downstream outcomes, not traffic alone.
2. **Activation:** retain the winning first-value path only if its predeclared rule passes without harming guardrails. Run one follow-up test on the largest remaining drop-off, such as role-based onboarding, checklist length, contextual help, or return-state recovery.
3. **Retention:** use activation and product-usage cohorts to trigger feature adoption, risk recovery, and success outreach. Review Day-30 retention by acquisition source so low-quality volume is not mistaken for growth.
4. **Referral:** if activation and satisfaction eligibility are reliable, prepare a limited cohort pilot with attribution, fraud limits, privacy review, support ownership, and a stop rule. Otherwise, keep referral in research.
5. **Revenue:** choose keep/repackage/reprice based on segment economics, conversion evidence, retention, sales friction, and expansion potential. Prepare the approved migration and communication plan, but treat any live price, paywall, offer, or billing change as a separate launch.
6. **Portfolio decision:** document keep/iterate/stop for every experiment, evidence and limitations, the next bottleneck, and the next quarter's single primary funnel objective.

### Priority experiment backlog

| Priority | Hypothesis | Primary measure | Guardrail |
|---|---|---|---|
| P0 | A validated event taxonomy and cohort baseline will reveal the true bottleneck | Funnel coverage and baseline completeness | Data quality and privacy |
| P1 | A shorter, value-first onboarding path will raise 7-day activation | Validated activation rate | Day-30 retention proxy, errors, support load |
| P2 | Behavior-triggered incomplete-setup recovery will return more stalled users | Stalled-to-activated rate | Unsubscribe/spam and complaint rate |
| P3 | Bottom-funnel SEO clusters will create more qualified starts than broad topics | Qualified demo/trial starts from organic | Source-to-activation and pipeline quality |
| P4 | An earned-value referral prompt will produce activated referred accounts | Referred-account activation | Fraud, privacy, incentive economics |
| P5 | Clearer packaging around the validated value metric will improve paid conversion | Qualified account-to-paid conversion | Retention, discount rate, support burden |

Before any test begins, record the audience, single primary metric, minimum detectable effect or decision threshold, duration/sample rule, guardrails, and keep/iterate/stop rule. Do not claim performance from a prototype or pre-launch review.

### Proposed operating cadence

- Weekly: funnel scoreboard, evidence gaps, experiment status, and customer feedback themes.
- Every two weeks: one activation or lifecycle decision and one acquisition/revenue decision; avoid overlapping tests on the same metric.
- Days 30, 60, and 90: product, marketing, sales, customer success, finance, and analytics gate review.

## Handoff specialties

These are recorded handoffs, not additionally loaded playbooks:

- `marketing-plan` — own the cross-funnel roadmap and dependency sequencing; this is the strongest alternative primary specialty for the prompt.
- `seo-audit` → `site-architecture` and `content-strategy` — diagnose search health, then design clusters, hierarchy, internal links, and briefs.
- `emails` — specify lifecycle-email triggers, copy, suppression, frequency, consent, and QA.
- `churn-prevention` — define retention-risk signals, save motions, and cancellation learning.
- `referrals` — design eligibility, incentive economics, attribution, fraud controls, and advocacy flow.
- `pricing` — research tiers, packaging, value metric, price level, and migration risk; hand to `paywalls` only if an in-product upgrade surface becomes an explicit deliverable.
- `analytics` and `ab-testing` — validate instrumentation and predeclare experiment rules; real outcome analysis routes to `MEASURE`, not a planning claim.

## External actions performed

- Published: none.
- Sent or contacted: none.
- Scheduled: none.
- Deployed: none.
- Spend committed or incurred: none.
- External services contacted: none.

## Routing and usability problem

The deterministic router chose `CAMPAIGN` with low confidence (`0.35`) and no matched mode signal, then chose `onboarding` with high confidence (`0.98`) solely from “activation.” This underrepresents an explicitly cross-funnel “90-day marketing plan”: `marketing-plan` and `emails` each scored `3`, while the selected `onboarding` specialty's numeric score remained `0`; “SEO,” “retention,” “referral,” “revenue,” and “pricing” produced no specialty score. The plan is still usable through recorded handoffs, but the router should recognize “90-day marketing plan” as `marketing-plan` and surface the multi-specialty needs rather than allowing one funnel-stage token to dominate.
