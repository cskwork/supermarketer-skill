# Deterministic gate contract

Run the aggregate gate with:

```bash
node bin/supermarketer.mjs check <run-vault>
```

It runs 12 gates and exits non-zero when any error exists. Warnings do not independently block, but reviewers must resolve or explicitly accept them where the applicable policy permits.

## Gate inventory

| Gate | Main checks |
|---|---|
| `run-files` | Required files and directories exist and are not symbolic links |
| `run-state` | Valid mode, phase, readiness/performance state, timestamps, blockers, and no implicit publish authorization |
| `brief` | Required sections and fields, falsifiable criteria, no placeholders, explicit publish boundary |
| `evidence` | ID class, source, date, freshness, confidence, permission, scope, and jurisdiction |
| `claims` | Evidence links, asset links, claim class, approval, expiry, qualifiers, and regulated scope |
| `channel-specs` | Authority, source, checked date, freshness, media constraints, safe zones, captions, and copy limits |
| `deliverables` | Required output coverage, kind/channel/placement matching, and fallback policy |
| `production-pack` | Complete image/video fallback files and accountable acceptance |
| `asset-manifest` | Safe paths, file existence, hashes, metadata, dimensions, duration, type, size, copy limits, rights, lineage, accessibility, and reviewer separation |
| `reviews` | Mode-specific independent review types, finding state, severity rules, and producer/reviewer conflicts |
| `qa` | Success-criterion evidence, deterministic proof paths, complete checklist, residual risks, and final state language |
| `performance-attestation` | No-op when performance is not claimed; otherwise verifies `Z-VALIDATED.md`, measurement inputs, hashes, rule, state, and review |

Individual scripts under `scripts/` expose the same modules for debugging and automation. A post-certification diagnostic check writes `reports/gate-report-latest.json` rather than overwriting the report bound to `Z-READY.md`.

## Readiness certification

```bash
node bin/supermarketer.mjs ready <run-vault>
```

The command:

1. runs a non-mutating preflight;
2. snapshots files required for rollback;
3. synchronizes state, manifest, and QA to `LAUNCH_READY` without changing performance;
4. runs the final 12 gates;
5. embeds a canonical certified-file integrity manifest in `reports/gate-report.json`;
6. records the final report SHA-256 in `Z-READY.md`.

`verify-ready` checks the marker/report relationship, the complete gate set, certified-file hashes, and file membership. Changes, deletions, symlink replacement, and unauthorized new files fail. Package, publish, and measurement workflows call the same verifier.

## Performance validation

```bash
node bin/supermarketer.mjs validate-results <run-vault>
node bin/supermarketer.mjs verify-results <run-vault>
```

Performance validation is separate from readiness. It requires real source data, a predeclared rule, calculation evidence, matching hashes, a passing numeric threshold and guardrails, uncertainty, and independent review. A changed source, rule, calculation record, marker, or state invalidates the performance attestation.

## What gates do not prove

Machine checks prove exact properties such as dimensions, paths, evidence IDs, hashes, durations, and state transitions. They do not prove persuasion, distinctiveness, cultural resonance, legal sufficiency, identity of a reviewer, commercial outcome, or causality. Those require qualified review, authenticated approval systems, and appropriate experiment or analytics designs.

## Exit semantics

- `0`: all required checks passed.
- `1`: one or more gate errors or CLI misuse.
- `--json`: machine-readable output.

## Failure handling

Do not weaken or delete a failed rule merely to obtain `LAUNCH_READY`. Resolve the issue, remove the unsupported claim, document an allowed residual risk, obtain the required evidence or review, create a new version, or set the run to `BLOCKED`.
