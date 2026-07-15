# Forward test iteration 2 — integrated SuperMarketer routing

## Test scope

**Task used verbatim:**

> Create a 90-day marketing plan for a B2B SaaS. Cover acquisition, activation, retention, referral, and revenue; include SEO, onboarding, lifecycle email, and pricing priorities. Do not publish, send, schedule, or spend.

This was a planning-only forward test. No vault was initialized, no run was created, and no external marketing action was taken. The repository resolved to `/private/tmp/supermarketer-integrate-v0.0.1` from the requested `/tmp/supermarketer-integrate-v0.0.1` path.

## Commands and output excerpts

Root contract read:

```console
$ pwd && sed -n '1,260p' SKILL.md
/private/tmp/supermarketer-integrate-v0.0.1
---
name: supermarketer
...
This root file is a router and operating contract. Load only the relevant file from `reference/` and only the required roles from `agents/`.

$ wc -l SKILL.md && sed -n '261,520p' SKILL.md
267 SKILL.md
...
## Completion contract
```

Standing-truth check:

```console
$ ls -l .supermarketer/rules/RULES.md .supermarketer/brand/BRAND.md .supermarketer/product/PRODUCT-TRUTH.md .supermarketer/legal/CLAIM-RULES.md
ls: .supermarketer/brand/BRAND.md: No such file or directory
ls: .supermarketer/legal/CLAIM-RULES.md: No such file or directory
ls: .supermarketer/product/PRODUCT-TRUTH.md: No such file or directory
ls: .supermarketer/rules/RULES.md: No such file or directory
```

Deterministic routing:

```console
$ node bin/supermarketer.mjs route "Create a 90-day marketing plan for a B2B SaaS. Cover acquisition, activation, retention, referral, and revenue; include SEO, onboarding, lifecycle email, and pricing priorities. Do not publish, send, schedule, or spend."
Mode: CAMPAIGN
Mode confidence: 0.35
Mode playbook: reference/campaign.md
Specialty: marketing-plan
Specialty confidence: 0.98
Specialist playbook: vendor/marketingskills/skills/marketing-plan/SKILL.md
Primary output: integrated campaign strategy
Mode matched: default campaign route
Specialty matched: 90-day marketing plan
```

Progressive-disclosure reads:

```console
$ sed -n '1,200p' reference/campaign.md
# Campaign playbook
...

$ sed -n '1,300p' vendor/marketingskills/skills/marketing-plan/SKILL.md
---
name: marketing-plan
...

$ sed -n '1,240p' vendor/marketingskills/skills/marketing-plan/references/aarrr-framework.md
# AARRR Framework — Primer for Plan Sequencing
...

$ sed -n '1,430p' vendor/marketingskills/skills/marketing-plan/references/client-types.md
# Client Types — Variations by Business Model
...

$ sed -n '1,540p' vendor/marketingskills/skills/marketing-plan/references/plan-template.md
# Plan Template — The 13-Section Structure
...

$ sed -n '1,260p' vendor/marketingskills/skills/marketing-plan/references/measurement-framework.md
# Measurement Framework — KPIs, North Stars, Cadence
...
```

The mutating `init` and `new` commands were intentionally not run because the test forbids run-state changes.

## Route and loaded playbooks

- Selected mode: `CAMPAIGN` (`0.35`, default campaign route)
- Selected specialty: `marketing-plan` (`0.98`, exact 90-day-plan match)
- Primary output: integrated campaign strategy
- Root operating contract: `SKILL.md`
- Mode playbook: `reference/campaign.md`
- Specialty playbook: `vendor/marketingskills/skills/marketing-plan/SKILL.md`
- Task-specific specialty references:
  - `vendor/marketingskills/skills/marketing-plan/references/aarrr-framework.md`
  - `vendor/marketingskills/skills/marketing-plan/references/client-types.md`
  - `vendor/marketingskills/skills/marketing-plan/references/plan-template.md`
  - `vendor/marketingskills/skills/marketing-plan/references/measurement-framework.md`

No other vendor specialty or reference was loaded. In particular, the 12-month, funding, budget, team, audit, example, and 139-idea-bank references were not needed for this concise 90-day task.

## Task artifact — 90-day B2B SaaS marketing plan

**Readiness: DRAFT**
**Performance: NOT_MEASURED**
**External-action boundary:** internal analysis, drafts, specifications, and review only. Nothing in this plan authorizes publishing, sending, scheduling, price changes, paid media, or spend.

### Working assumptions and decisions needed

The company, product truth, ideal customer profile, sales motion, average contract value, team, budget, funnel baselines, and current pricing were not supplied. The plan is therefore a role-based operating plan, not channel-ready copy. Weeks 1–2 must confirm:

1. Economic buyer, internal champion, end user, and buying trigger.
2. Self-serve trial, demo-led, or sales-assisted motion and the desired conversion action.
3. The first key product action that represents activation and the second value moment that predicts retention.
4. Traffic, conversion, churn, net revenue retention, plan mix, discounting, and expansion baselines.
5. Current claims, proof, consent, legal constraints, owners, capacity, and analytics sources.

### Strategy

**Objective:** create one measurable AARRR system that captures qualified demand, gets new accounts to value faster, deepens adoption, creates an approval-ready advocacy motion, and validates packaging before any scale decision.

**Priority rule:** diagnose the binding constraint first. If users reach the product but fail to activate or retain, fix that leak before increasing acquisition. SEO work can begin as an internal compounding asset, but publishing waits for proof and approval.

**Internal organizing idea:** “prove value before scale.” This is a planning principle, not public copy or a product claim.

**Message sequence to validate:** problem and buying trigger → credible workflow proof → first value action → repeated/expanded value → customer advocacy → appropriate plan or expansion. Product claims and the final call to action remain TBD until product truth and sales motion are confirmed.

**Non-goals:** paid acquisition, broad awareness campaigns, a full rebrand, publishing SEO pages, deploying onboarding changes, sending lifecycle email, contacting referral candidates, changing prices, or forecasting revenue without baseline data.

### AARRR priorities and deliverables

| Stage | 90-day priority | Internal deliverable by Day 90 | Primary indicator | Provisional owner |
|---|---|---|---|---|
| Acquisition | Capture existing high-intent demand through SEO before adding paid reach. Audit current pages and search demand; map one pain/use-case/comparison cluster. | Prioritized keyword and page map, two commercial-intent page drafts, four supporting content briefs, internal-link plan, claim/proof checklist; all unpublished. | Qualified organic sessions and organic visit → signup/demo intent, with baseline fixed by Day 14. | Growth/content lead |
| Activation | Reduce the distance from signup completion to the first key value action. Map friction, empty states, permissions, and handoffs for both buyer and user. | Instrumentation specification, current-state journey, revised onboarding prototype/copy, and one predeclared test plan; not deployed. | Signup completion, activation-event completion, median time-to-value, trial → paid. | Product lead |
| Retention | Make the second value moment repeatable with product cues and lifecycle email. Segment by activation state and account role. | Lifecycle map plus drafts for welcome/activation, stalled-user rescue, adoption/depth, and churn-risk or win-back flows; consent, unsubscribe, frequency, and QA rules included; unsent and unscheduled. | 30/90-day retained accounts, feature adoption, gross churn, email engagement after an approved future send. | Lifecycle/CS lead |
| Referral | Design advocacy around a real post-value moment, not a generic referral popup. Start with customers who meet success and consent criteria. | Eligibility rule, candidate-list schema, case-study/review/referral options, incentive economics, outreach drafts, and pilot measurement plan; no candidates contacted. | Eligible advocates, approved participants, qualified introductions, and attributed pipeline after an approved future pilot. | Customer success lead |
| Revenue | Establish pricing truth before testing packaging. Reconcile listed price, billed price, discounts, seats/usage, expansion paths, and buyer willingness-to-pay evidence. | Pricing audit, segment/unit-economics table, two packaging hypotheses, customer-research guide, and experiment/rollback specification; no price or billing change. | Net revenue retention, average revenue per account, plan mix, expansion ARR, discount leakage, trial → paid. | Founder/finance/product marketing |

### 90-day roadmap

#### Weeks 1–2 — Unblock

- Define the AARRR metric dictionary, source, current baseline, data owner, and weekly review sheet. Keep signup-page intent in Acquisition and signup completion in Activation.
- Confirm ICP roles, buying situation, sales motion, offer, desired action, product truth, allowed claims, and the activation event.
- Audit the existing SEO surface, onboarding path, lifecycle coverage, customer-advocacy signals, and actual billed-versus-listed pricing.
- Rank the single binding constraint using observed funnel data. If data is missing, make instrumentation the first product work item.
- Freeze exact Day-90 performance targets only after baselines are known; do not invent them now.

#### Weeks 3–4 — Foundation

- Build the SEO topic/page map around validated high-intent problems, use cases, alternatives, and comparisons. Assign a proof requirement and intended conversion action to every planned page.
- Map onboarding from signup completion to first value; identify the top three friction points and select one testable change.
- Define lifecycle segments, triggers, suppression rules, consent source, frequency cap, and the order of the four email flows.
- Complete the pricing truth table and identify whether the primary revenue opportunity is conversion, seat/usage expansion, tier packaging, or discount control.
- Define referral eligibility and the natural share-after-value moment; draft the pilot boundary and economics.

#### Weeks 5–8 — Velocity

- Draft the two highest-intent SEO pages and four supporting briefs; review every factual claim against available proof.
- Produce the onboarding prototype, event specification, test hypothesis, guardrail, sample requirement, and rollback rule. Run internal team walkthroughs only.
- Draft and QA lifecycle messages across roles and states. Check accessibility, consent, unsubscribe, frequency, data handling, and handoff to customer success.
- Write two pricing/packaging hypotheses with affected segments, expected mechanism, unit-economics guardrails, grandfathering needs, and disconfirming evidence.
- Prepare the referral pilot pack: eligibility query, consent path, incentive rule, attribution model, customer-facing drafts, and stop conditions.

#### Weeks 9–12 — Compound and decide

- Review all five workstreams as one journey: SEO promise → onboarding experience → lifecycle reinforcement → advocacy moment → plan/expansion path.
- Resolve message, proof, privacy, accessibility, legal, analytics, and ownership findings. Keep unsupported claims out.
- Produce an asset/action queue that names the exact future asset, destination, account, timing, owner, budget if any, and required approval. This queue is not authorization.
- Hold a Day-90 internal review: compare completed deliverables to the roadmap, inspect baselines and internal test evidence, choose the next binding constraint, and draft the next 90-day plan.
- Any future publish, send, schedule, pricing change, paid test, or spend requires a separate explicit approval and execution step outside this test.

### Measurement and decision rules

Net revenue retention is the proposed strategic north star for a subscription B2B SaaS because it exposes churn and expansion that ARR alone can hide. Confirm that choice after the revenue model and baseline are known.

| Stage | Weekly leading indicators | Day-90 decision rule |
|---|---|---|
| Acquisition | Search impressions, qualified organic sessions, signup/demo intent by page and cluster | Continue only clusters tied to an evidenced buying problem, qualified demand, and a measurable conversion path. Draft count is not performance. |
| Activation | Signup completion, activation-event rate, median time-to-value, trial → paid | Advance one onboarding test only with a single hypothesis, baseline, sample rule, guardrail, and rollback plan. A suggested future threshold is at least 15% relative activation lift without worse retention or support burden. |
| Retention | 30/90-day retained accounts, adoption of the second value action, gross churn | Prioritize the segment with the largest evidenced churn or adoption gap. Email opens alone cannot prove retention. |
| Referral | Eligible advocate count and pilot readiness | Do not activate a pilot until success criteria, consent, incentive economics, attribution, and owner are approved. No outreach is permitted in this run. |
| Revenue | NRR, revenue/account, plan mix, expansion, discount leakage | Do not test a price change until billing truth, affected cohorts, grandfathering, guardrails, and rollback are documented and approved. |

Cadence after implementation approval: a weekly 30-minute AARRR operational review, monthly metric and qualitative review, and a Day-90 recalibration. Performance remains `NOT_MEASURED` until real post-launch data exists; draft completion and internal review do not validate growth.

## Verification

The exact route was rerun after writing and returned the same mode, specialty, paths, confidences, and match reasons. Artifact checks:

```console
$ wc -l docs/changelog/2026-07/15-marketingskills-integration/qa/forward-test-iteration-2.md
211 docs/changelog/2026-07/15-marketingskills-integration/qa/forward-test-iteration-2.md

$ git status --short --untracked-files=all -- docs/changelog/2026-07/15-marketingskills-integration/qa/forward-test-iteration-2.md
?? docs/changelog/2026-07/15-marketingskills-integration/qa/forward-test-iteration-2.md
```

The status check is scoped to the requested path because the integration worktree already contained unrelated changes. This forward test created only the file above.

## Judgment

**PASS — the integrated routing was useful and correct.**

- Correct mode: the request is a coordinated strategy/plan, not copy production, media production, measurement of real results, or a multi-asset launch kit. `CAMPAIGN` is the appropriate readiness workflow.
- Correct specialty: `marketing-plan` is an exact match for “90-day marketing plan” and supplied the required AARRR structure, B2B SaaS emphasis, leak-before-scale sequencing, role ownership, 90-day sprint shape, and measurement discipline.
- Useful integration: the mode playbook prevented a channel checklist by requiring objective, journey, channel roles, timing, KPIs, guardrails, and non-goals; the specialty playbook made SEO, onboarding, lifecycle, referral, and pricing parts of one sequenced funnel.
- Progressive disclosure worked: four task-relevant specialty references were sufficient. Loading funding, 12-month, full audit, or idea-bank material would not have improved this 90-day artifact.
- Caveat: mode confidence was low (`0.35`) and the match reason was the default campaign route rather than an explicit “marketing plan” mode signal. The selected mode was still semantically correct, while the specialty router supplied the precise match at `0.98`.

No external marketing action was performed. Final state remains `DRAFT / NOT_MEASURED`.
