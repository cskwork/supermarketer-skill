# Run vault contract

A run vault is an isolated, auditable workspace for one marketing objective. Persistent brand/product/legal truth lives outside the run under `.supermarketer/`; outputs and decisions for the objective live inside the vault.

## Creation

```bash
node bin/supermarketer.mjs init <project-dir>
node bin/supermarketer.mjs new "<objective>" --project <project-dir> [--mode MODE]
```

Created path:

```text
<project>/.supermarketer/runs/<YYYYMMDD-HHMM>-<slug>/
```

## Required records

| File | Authority |
|---|---|
| `run-state.json` | Current mode, phase, readiness, performance, decisions, blockers |
| `BRIEF.md` | Human-readable scope and falsifiable success criteria |
| `EVIDENCE.yaml` | Structured evidence inventory |
| `EVIDENCE.md` | Research narrative, conflicts, limitations, decisions |
| `CHANNEL-SPECS.yaml` | Dated placement-specific requirements |
| `CLAIMS.yaml` | Claim-to-evidence and claim-to-asset trace |
| `DELIVERABLES.yaml` | Exact required outputs and accepted fallback policy |
| `ASSET-MANIFEST.yaml` | Asset files, metadata, rights, lineage, review state |
| `REVIEWS.yaml` | Independent review records and findings |
| `APPROVALS.yaml` | Explicit external-action approvals only |
| `PRODUCTION-PACK.yaml` | Accepted image/video fallback packs |
| `QA.md` | Human-readable proof mapping and final verdict |

`assets/`, `sources/`, `reviews/`, `reports/`, and `production/` must exist. Manifest paths must be relative and remain inside the vault both lexically and after real-path resolution. Absolute paths, `..` escapes, and symbolic links in governed paths fail validation.

## Optional mode records

- `MESSAGE-HOUSE.md`: positioning, campaign, copy, static, image, video, launch-kit, localization.
- `CREATIVE-BRIEF.md`: campaign, static, image, video, launch-kit, localization.
- `EXPERIMENT.md`: experiment or measurement design.
- `MEASUREMENT.yaml` and `RESULTS.md`: real post-launch analysis.
- `Z-READY.md`: generated only by `ready` after all readiness gates pass.
- `Z-VALIDATED.md`: generated only by `validate-results` after the measurement and performance-attestation gates pass.

## State transitions

```text
DRAFT -> REVIEW_READY -> LAUNCH_READY
                         |
                         +-> publish-check permit (no execution)
                         +-> MEASURING -> PERFORMANCE_VALIDATED
```

`BLOCKED` may be used at any pre-launch phase. Readiness and performance are orthogonal. A run can be `LAUNCH_READY / NOT_MEASURED` or `LAUNCH_READY / PERFORMANCE_VALIDATED`; it must never become performance-validated from pre-launch review alone.

## Versioning and immutability

- Do not overwrite source material by default; copy it into `sources/` or create a versioned derivative.
- `ready` links `Z-READY.md` to the final 12-gate report and certified-file integrity manifest. Use `verify-ready` before delivery; packaging, publish permits, and measurement do so automatically. Changed, missing, symlinked, or newly injected files invalidate readiness.
- Post-launch source, rule, and calculation-evidence files are admitted only through `MEASUREMENT.yaml` and their hashes. Use `verify-results` after validation.
- Avoid editing certified pre-launch content; create a new run or recertify after changes.
- `package` writes outside the vault so the package cannot recursively include itself.
- `publish-check` writes a permit fingerprint but never changes `external_action_authorized` or calls a platform API.

## Authenticity boundary

Local SHA-256 records detect inconsistent file changes but are not digital signatures. Use signed releases or immutable storage when recipients must verify publisher identity.
