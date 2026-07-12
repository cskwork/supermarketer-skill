import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { writeJsonAtomic, writeTextAtomic, nowIso, sha256File, commandExists } from '../../lib/utils.mjs';
import { writeYamlAtomic, readYaml } from '../../lib/yaml-lite.mjs';

export function makeTempDir(prefix = 'supermarketer-test-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

export function today(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function addReview(vault, review) {
  const file = path.join(vault, 'REVIEWS.yaml');
  const data = readYaml(file);
  data.reviews.push(review);
  writeYamlAtomic(file, data);
}

export function createValidCopyVault(options = {}) {
  const root = options.root ?? makeTempDir();
  const vault = path.join(root, 'run');
  const at = options.now ?? new Date();
  const iso = at.toISOString();
  const day = today(at);
  const runId = options.runId ?? '20260712-0900-copy-test';
  for (const directory of ['assets/as-001', 'sources', 'reviews', 'reports', 'production']) {
    fs.mkdirSync(path.join(vault, directory), { recursive: true });
  }

  writeTextAtomic(path.join(vault, 'sources/product.md'), '# Approved product truth\n\nProduct A helps teams centralize approved campaign copy.\n');
  writeTextAtomic(path.join(vault, 'sources/channel.md'), '# Approved email specification\n\nInternal lifecycle-email body specification, reviewed by channel operations.\n');
  writeTextAtomic(path.join(vault, 'assets/as-001/copy.md'), '# Subject\n\nApproved campaign copy in one place\n\n# Body\n\nKeep product facts, channel limits, and review evidence linked before launch.\n\n# CTA\n\nReview the package\n');
  writeTextAtomic(path.join(vault, 'reports/deterministic.txt'), 'PASS: file, linkage, claims, channel, rights, and reviewer checks executed.\n');

  writeJsonAtomic(path.join(vault, 'run-state.json'), {
    schema_version: '1.0',
    run_id: runId,
    objective: 'Create a grounded lifecycle email for Product A.',
    mode: 'COPY',
    phase: 'improve',
    readiness: 'DRAFT',
    performance: 'NOT_MEASURED',
    external_action_authorized: false,
    open_decisions: [],
    blocking_findings: [],
    artifacts: [],
    created_at: iso,
    updated_at: iso,
  });

  writeTextAtomic(path.join(vault, 'BRIEF.md'), `# Marketing Brief

## Original Request

Create a grounded lifecycle email for Product A.

## Mode

COPY

## Objective

Produce one review-ready email body that communicates Product A's approved workflow benefit without claiming measured performance.

## Product Truth Source

\`sources/product.md\`, owned by Product Marketing Operations.

## Audience

- Priority segment: B2B lifecycle marketing managers
- Role in purchase: Daily user and internal recommender
- Buying situation/JTBD: Prepare campaign copy while keeping claims and approvals traceable
- Awareness level: Problem-aware
- Geography/language: South Korea / Korean-language campaign with this English fixture for validation

## Funnel and Action

- Funnel stage: Consideration
- Desired action: Review the product workflow page
- Primary KPI: Click-through rate after launch; not yet measured
- Guardrails: No unsupported efficiency, revenue, or comparative claims
- Performance status at start: \`NOT_MEASURED\`

## Offer and Proof

- Offer: Review the approved campaign-copy workflow
- Reasons to believe: Product truth states that campaign copy can be centralized
- Approved proof: P-001
- Material limitations/terms: No quantified outcome is asserted

## Deliverables

- [x] D-001 — one email-body copy asset for the lifecycle email body placement

The structured source of truth is \`DELIVERABLES.yaml\`.

## Brand and Creative Constraints

- Brand source: Product Marketing Operations writing guide
- Voice/tone: Clear, restrained, operational
- Visual references: N/A because the scoped deliverable is text-only
- Prohibited treatments: No superlatives, invented testimonials, or unapproved urgency
- Accessibility: Plain language and descriptive link text
- Rights/privacy: No personal data or third-party creative
- Regulation/jurisdiction: South Korea general advertising context; no regulated category

## Non-goals

- No publication, sending, scheduling, paid spend, or performance claim.

## Success Criteria

- [x] Every factual claim resolves to approved product evidence. — Verify with: \`CLAIMS.yaml\`, \`EVIDENCE.yaml\`, and RV-001
- [x] The rendered copy file exists and satisfies the channel text limits. — Verify with: \`assets/as-001/copy.md\` and \`reports/deterministic.txt\`
- [x] Final status reports readiness separately from performance. — Verify with: \`QA.md\` and \`run-state.json\`

## Assumptions

- Email remains an internal review artifact until a separate human publish approval is recorded.

## Decision Gates

- None

## Publish Boundary

No publish, send, schedule, deployment, customer-list use, or media spend is authorized unless an explicit, scoped, unexpired user approval is recorded in \`APPROVALS.yaml\` and passes the publish gate.
`);

  writeTextAtomic(path.join(vault, 'EVIDENCE.md'), `# Evidence Record

## Research Question

What approved product fact can support the scoped email without implying measured performance?

## Sources Consulted

- P-001 — \`sources/product.md\`
- S-001 — \`sources/channel.md\`

## Findings

Product A centralizes approved campaign copy. No quantified outcome is supported.

## Gaps and Limits

No customer outcome, comparative result, or post-launch performance data is available.

## Decisions

Use one low-risk factual claim and preserve NOT_MEASURED performance status.
`);

  writeYamlAtomic(path.join(vault, 'EVIDENCE.yaml'), {
    schema_version: '1.0',
    evidence: [{
      id: 'P-001',
      kind: 'product',
      statement: 'Product A helps teams centralize approved campaign copy.',
      source: 'sources/product.md',
      source_type: 'approved_internal',
      checked_at: day,
      time_sensitive: false,
      max_age_days: 365,
      confidence: 'high',
      permission_status: 'not_applicable',
      owner: 'Product Marketing Operations',
    }],
  });

  writeYamlAtomic(path.join(vault, 'CHANNEL-SPECS.yaml'), {
    schema_version: '1.0',
    channels: [{
      id: 'S-001',
      channel: 'email',
      placement: 'body',
      language_market: 'ko-KR',
      source: 'sources/channel.md',
      source_authority: 'internal',
      checked_at: day,
      max_age_days: 90,
      confidence: 'high',
      dimensions: [],
      aspect_ratios: [],
      duration_seconds: { min: null, max: null },
      file_types: ['md'],
      file_size_limit_bytes: 100000,
      text_constraints: { headline_max_chars: 80, body_max_chars: 240, cta_max_chars: 30 },
      safe_zone_notes: 'N/A for text-only email copy',
      caption_requirements: 'N/A',
    }],
  });

  writeYamlAtomic(path.join(vault, 'CLAIMS.yaml'), {
    schema_version: '1.0',
    claims: [{
      id: 'CL-001',
      text: 'Keep approved campaign copy in one place.',
      type: 'factual',
      risk: 'low',
      evidence_ids: ['P-001'],
      asset_ids: ['ASSET-001'],
      approval: 'approved',
      approver: 'Claims Reviewer',
      approved_at: iso,
      qualification: 'Describes product workflow only; no outcome claim.',
    }],
  });

  writeYamlAtomic(path.join(vault, 'DELIVERABLES.yaml'), {
    schema_version: '1.0',
    deliverables: [{
      id: 'D-001',
      description: 'Lifecycle email body copy',
      kind: 'copy',
      channel: 'email',
      placement: 'body',
      language_market: 'ko-KR',
      required: true,
      expected_dimensions: null,
      expected_duration_seconds: null,
      fallback_allowed: false,
      fulfillment_asset_ids: ['ASSET-001'],
    }],
  });

  writeYamlAtomic(path.join(vault, 'ASSET-MANIFEST.yaml'), {
    schema_version: '1.0',
    run: {
      id: runId,
      mode: 'COPY',
      created_at: iso,
      readiness: 'DRAFT',
      performance: 'NOT_MEASURED',
    },
    assets: [{
      id: 'ASSET-001',
      deliverable_ids: ['D-001'],
      kind: 'copy',
      status: 'approved',
      name: 'Product A lifecycle email copy',
      purpose: 'Explain the approved product workflow and invite review',
      audience: 'B2B lifecycle marketing managers',
      channel: 'email',
      placement: 'body',
      language_market: 'ko-KR',
      channel_spec_required: true,
      source_paths: ['sources/product.md'],
      rendered_path: 'assets/as-001/copy.md',
      copy: {
        headline: 'Approved campaign copy in one place',
        body: 'Keep product facts, channel limits, and review evidence linked before launch.',
        cta: 'Review the package',
      },
      claim_ids: ['CL-001'],
      producer: 'Copy Producer',
      generation_method: 'Human-directed drafting with deterministic validation',
      fallback_status: 'none',
      ai_generated: false,
      rights_status: 'not_applicable',
      rights_sources: [],
      reviewers: ['Claims Reviewer', 'Creative Reviewer', 'QA Auditor'],
      review_status: 'approved',
      accessibility: { decorative: true, captions_required: false },
    }],
  });

  writeYamlAtomic(path.join(vault, 'REVIEWS.yaml'), {
    schema_version: '1.0',
    reviews: [
      { id: 'RV-001', type: 'claims_brand_rights', reviewer: 'Claims Reviewer', completed_at: iso, verdict: 'pass', asset_ids: ['ASSET-001'], findings: [] },
      { id: 'RV-002', type: 'creative', reviewer: 'Creative Reviewer', completed_at: iso, verdict: 'pass', asset_ids: ['ASSET-001'], findings: [] },
      { id: 'RV-003', type: 'artifact_qa', reviewer: 'QA Auditor', completed_at: iso, verdict: 'pass', asset_ids: ['ASSET-001'], findings: [] },
    ],
  });
  writeYamlAtomic(path.join(vault, 'APPROVALS.yaml'), { schema_version: '1.0', approvals: [] });
  writeYamlAtomic(path.join(vault, 'PRODUCTION-PACK.yaml'), { schema_version: '1.0', packs: [] });

  writeTextAtomic(path.join(vault, 'QA.md'), `# Marketing QA

## Run Status

- Readiness: \`REVIEW_READY\`
- Performance: \`NOT_MEASURED\`
- External publish authorized: \`NO\`

## Success Criteria Evidence

- [x] Product claim is grounded. — Evidence: P-001, CL-001, and RV-001
- [x] Copy artifact exists and is within channel limits. — Evidence: \`assets/as-001/copy.md\` and \`reports/deterministic.txt\`
- [x] Readiness and performance remain separate. — Evidence: \`run-state.json\`

## Deterministic Checks

| Check | Asset(s) | Method/command | Result | Evidence |
|---|---|---|---|---|
| File, linkage, channel, claims, rights, reviewer validation | ASSET-001 | supermarketer check | PASS | reports/deterministic.txt |

## Product Truth and Claims Review

| Finding | Severity | Asset/location | Evidence/rule | Fix/status |
|---|---|---|---|---|
| None | info | ASSET-001 | P-001 and CL-001 | resolved |

## Brand, Rights, Privacy, Compliance Review

| Finding | Severity | Asset/location | Evidence/rule | Fix/status |
|---|---|---|---|---|
| None | info | ASSET-001 | RV-001 | resolved |

## Creative Review

| Finding | Severity | Asset/location/timecode | Audience/business impact | Fix/status |
|---|---|---|---|---|
| None | info | ASSET-001 | Clear action and restrained claim | resolved |

## Accessibility and Localization

| Check | Result | Evidence | Residual risk |
|---|---|---|---|
| Plain language and descriptive CTA | PASS | RV-002 | None |

## Package Completeness

- [x] Every required deliverable in \`DELIVERABLES.yaml\` resolves to approved asset IDs.
- [x] Every path in \`ASSET-MANIFEST.yaml\` resolves inside the run vault.
- [x] Every externally verifiable claim resolves to current, scoped evidence.
- [x] Required channel specifications are dated, sourced, and still fresh.
- [x] Media fallbacks are explicit and approved; no nonexistent render is claimed.
- [x] Required independent reviews in \`REVIEWS.yaml\` are complete.
- [x] No unresolved blocking finding or decision remains.
- [x] Rights, privacy, and generated-asset lineage are recorded.
- [x] The publish boundary is respected.
- [x] Readiness and performance statuses are separate.

## Residual Risk

- None. Actual campaign performance remains unmeasured until post-launch data exists.

## Final Verdict

- Readiness: \`REVIEW_READY\`
- Performance: \`NOT_MEASURED\`
- Reason: The scoped copy package is grounded, independently reviewed, and machine-checkable; performance is not yet measured and publishing is not authorized.
`);

  return { root, vault, at, iso, day, runId };
}

export function addValidMeasurement(vault, options = {}) {
  const now = options.now ?? new Date();
  const start = new Date(now.getTime() - 2 * 86400000);
  const end = new Date(now.getTime() - 86400000);
  const predeclared = new Date(start.getTime() - 86400000);
  writeTextAtomic(path.join(vault, 'sources/results.csv'), 'variant,visitors,conversions,conversion_rate\nA,1000,120,0.12\nB,1000,145,0.145\n');
  writeTextAtomic(path.join(vault, 'sources/predeclared-rule.md'), '# Predeclared rule\n\nPrimary conversion rate must be at least 0.14 and complaint guardrails must pass.\n');
  writeTextAtomic(path.join(vault, 'reports/measurement-calculation.md'), '# Measurement calculation\n\nVariant B conversion rate = 145 conversions / 1000 assigned visitors = 0.145.\n');
  const sourcePath = path.join(vault, 'sources/results.csv');
  const rulePath = path.join(vault, 'sources/predeclared-rule.md');
  const calculationPath = path.join(vault, 'reports/measurement-calculation.md');
  writeYamlAtomic(path.join(vault, 'MEASUREMENT.yaml'), {
    schema_version: '1.0',
    data: {
      real_post_launch: true,
      source_path: 'sources/results.csv',
      source_description: 'First-party campaign export with visitors and conversions.',
      data_sha256: sha256File(sourcePath),
      date_start: start.toISOString(),
      date_end: end.toISOString(),
      timezone: 'Asia/Seoul',
      metric_definition: 'Conversions divided by unique assigned visitors.',
      data_quality_limitations: 'Fixture data has no long-term retention observation.',
    },
    validation: {
      predeclared_rule_source: 'sources/predeclared-rule.md',
      predeclared_rule_sha256: sha256File(rulePath),
      predeclared_at: predeclared.toISOString(),
      primary_metric: 'conversion_rate',
      operator: 'gte',
      threshold: 0.14,
      observed: 0.145,
      calculation_method: 'conversion rate = conversions / assigned visitors for variant B',
      calculation_evidence_path: 'reports/measurement-calculation.md',
      calculation_evidence_sha256: sha256File(calculationPath),
      uncertainty: 'Sampling uncertainty remains; confidence interval is not encoded in this fixture.',
      guardrails_passed: true,
      causal_claim_allowed: false,
      randomized: false,
      assignment_method: 'N/A because no causal claim is allowed',
      sample_size: 2000,
      analyst: 'Experiment Analyst',
      reviewed_by: 'Measurement Reviewer',
      decision: 'SCALE',
      performance_status: 'PERFORMANCE_VALIDATED',
    },
  });
  addReview(vault, {
    id: 'RV-004',
    type: 'measurement',
    reviewer: 'Measurement Reviewer',
    completed_at: now.toISOString(),
    verdict: 'pass',
    asset_ids: [],
    findings: [],
  });
}

export function hasFfprobe() {
  return commandExists('ffprobe') && commandExists('ffmpeg');
}
