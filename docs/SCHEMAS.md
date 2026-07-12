# Structured records and schemas

Run records use a deliberately limited YAML subset so the core remains dependency-free and deterministic. The JSON Schema files document the interoperable record shapes; runtime gates additionally enforce cross-file, temporal, file-system, and semantic constraints that JSON Schema cannot express.

## Supported YAML subset

Supported:

- indentation-based mappings and sequences;
- strings, numbers, booleans, and null;
- inline arrays and simple inline maps;
- quoted scalars;
- literal and folded block strings;
- comments outside quoted values.

Rejected or intentionally unsupported:

- anchors and aliases;
- custom tags;
- merge keys;
- implicit timestamp typing;
- tabs for indentation;
- duplicate keys;
- arbitrary executable/object types.

`lib/yaml-lite.mjs` writes a canonical subset and round-trips all bundled templates and run records.

## Schema files

| Schema | Record |
|---|---|
| `schemas/run-state.schema.json` | `run-state.json` |
| `schemas/evidence.schema.json` | `EVIDENCE.yaml` |
| `schemas/claims.schema.json` | `CLAIMS.yaml` |
| `schemas/channel-specs.schema.json` | `CHANNEL-SPECS.yaml` |
| `schemas/deliverables.schema.json` | `DELIVERABLES.yaml` |
| `schemas/asset-manifest.schema.json` | `ASSET-MANIFEST.yaml` |
| `schemas/reviews.schema.json` | `REVIEWS.yaml` |
| `schemas/approvals.schema.json` | `APPROVALS.yaml` |
| `schemas/production-pack.schema.json` | `PRODUCTION-PACK.yaml` |
| `schemas/measurement.schema.json` | `MEASUREMENT.yaml` |
| `schemas/adapter-result.schema.json` | Host media-adapter handoff |
| `schemas/common.schema.json` | Shared ID, path, and date definitions |

## Cross-file invariants

Runtime gates enforce, among other rules:

- evidence ID prefix matches its evidence class;
- material claims resolve to existing, appropriately scoped evidence;
- claim asset IDs and deliverable fulfillment IDs resolve to manifest assets;
- every governed path remains inside the vault and is a real non-symlink file;
- channel-bound assets have a matching channel, placement, and market specification;
- actual media metadata satisfies manifest and channel constraints;
- rights, permission, and AI/tool lineage are complete;
- producers and final reviewers are different;
- mode-specific review types exist and pass;
- open high-severity findings block readiness;
- fallback records match the asset, deliverable, and accountable acceptance;
- publish approvals are explicit, human, exact, scoped, and unexpired;
- the readiness marker matches the final report and certified file set;
- performance validation uses real data and matching source/rule/calculation hashes;
- the measurement rule predates the measurement period;
- the measurement reviewer is independent and reviews after the measurement end;
- causal language requires randomization, assignment method, and sample size.

## `MEASUREMENT.yaml` integrity fields

The performance workflow requires these file relationships:

```yaml
data:
  real_post_launch: true
  source_path: "sources/results.csv"
  data_sha256: "<64 lowercase hex>"
  date_start: "<ISO date/time>"
  date_end: "<ISO date/time>"
  timezone: "Asia/Seoul"
  metric_definition: "Conversions / assigned visitors"
  data_quality_limitations: "..."
validation:
  predeclared_rule_source: "sources/predeclared-rule.md"
  predeclared_rule_sha256: "<64 lowercase hex>"
  predeclared_at: "<ISO date-time before date_start>"
  primary_metric: "conversion_rate"
  operator: gte
  threshold: 0.14
  observed: 0.145
  calculation_method: "conversions / assigned visitors"
  calculation_evidence_path: "reports/measurement-calculation.md"
  calculation_evidence_sha256: "<64 lowercase hex>"
  uncertainty: "..."
  guardrails_passed: true
  analyst: "Analyst identity"
  reviewed_by: "Different reviewer identity"
  decision: SCALE
  performance_status: PERFORMANCE_VALIDATED
```

JSON Schema verifies local shape. `measurement-gate` verifies the files, hashes, dates, numeric rule, review, and cross-record consistency.

## ID namespaces

```text
P-###       product evidence
C-###       customer evidence
M-###       market evidence
S-###       channel evidence or specification
L-###       legal, policy, or rights evidence
A-###       analytics evidence
CL-###      claim
D-###       deliverable
ASSET-###   asset
RV-###      review
F-###       finding
AP-###      approval
PK-###      production pack
```

IDs are stable within a run. Do not reuse an ID for a different meaning after review.
