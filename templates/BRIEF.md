# Marketing Brief

## Original Request

<verbatim user request>

## Mode

<RESEARCH | POSITION | CAMPAIGN | COPY | STATIC | IMAGE | VIDEO | LAUNCH-KIT | EXPERIMENT | LOCALIZE | AUDIT | MEASURE>

## Objective

<business or communication objective>

## Product Truth Source

<approved product document, URL, file, or accountable owner>

## Audience

- Priority segment: <segment>
- Role in purchase: <role>
- Buying situation/JTBD: <situation>
- Awareness level: <level>
- Geography/language: <market and language>

## Funnel and Action

- Funnel stage: <stage>
- Desired action: <action>
- Primary KPI: <metric or N/A for a non-performance deliverable>
- Guardrails: <brand, trust, unsubscribe, complaint, accessibility, or other guardrail>
- Performance status at start: `NOT_MEASURED`

## Offer and Proof

- Offer: <offer or N/A>
- Reasons to believe: <approved reasons>
- Approved proof: <evidence IDs or source>
- Material limitations/terms: <qualifiers or N/A>

## Deliverables

- [ ] <D-001 — asset, channel, placement, size/duration, variants>

The structured source of truth is `DELIVERABLES.yaml`.

## Brand and Creative Constraints

- Brand source: <path, URL, or owner>
- Voice/tone: <tone>
- Visual references: <references or N/A>
- Prohibited treatments: <restrictions or N/A>
- Accessibility: <requirements>
- Rights/privacy: <requirements>
- Regulation/jurisdiction: <jurisdiction or N/A>

## Non-goals

- <explicit boundary>

## Success Criteria

Each criterion must name its proof. Check it only after that proof exists.

- [ ] <criterion> — Verify with: <file, review, command, or evidence>
- [ ] Final status reports readiness separately from performance. — Verify with: `QA.md` and `run-state.json`

## Assumptions

- <assumption, why it is reversible, and validation needed>

## Decision Gates

- <approval or missing input, or `None`>

## Publish Boundary

No external publish, send, schedule, deployment, customer-list use, or media spend is authorized unless an explicit, scoped, unexpired user approval is recorded in `APPROVALS.yaml` and passes `publish-gate.mjs`.
