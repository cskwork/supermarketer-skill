# SuperMarketer Skill

SuperMarketer is an implemented product-marketing and creative-production skill for research, positioning, campaigns, copy, posters, images, videos, localization, experiments, audits, launch packaging, and post-launch measurement.

It combines a thin agent router with a dependency-free Node.js CLI, isolated run vaults, structured evidence and asset records, deterministic readiness gates, independent-review enforcement, media inspection, explicit fallback contracts, integrity attestations, packaging, scoped publish-approval checks, and real-results validation.

## Implemented capabilities

- 12 bilingual modes: `RESEARCH`, `POSITION`, `CAMPAIGN`, `COPY`, `STATIC`, `IMAGE`, `VIDEO`, `LAUNCH-KIT`, `EXPERIMENT`, `LOCALIZE`, `AUDIT`, and `MEASURE`.
- Project initialization and one isolated vault per marketing objective.
- Structured YAML/JSON sources of truth for evidence, claims, channel specs, deliverables, assets, reviews, approvals, production packs, run state, and measurement.
- 12 aggregate launch-readiness gates with stable error codes and non-zero failure exits.
- Claim-to-evidence, claim-to-asset, deliverable-to-asset, reviewer, rights, accessibility, and generation-lineage traceability.
- Lexical and real-path containment that rejects absolute paths, `..` traversal, governed-file symlinks, and symlink escapes.
- PNG, JPEG, GIF, WebP, SVG, PDF, and video metadata inspection. Rendered-video validation uses `ffprobe`.
- File existence, SHA-256, size, type, dimensions, aspect ratio, duration, copy limits, captions, alt text, rights, lineage, and producer/reviewer separation checks.
- Honest `ART_DIRECTION_ONLY` and `PRODUCTION_PACK_ONLY` fallback contracts. Static assets cannot use a non-rendered fallback.
- Transactional `Z-READY.md` certification linked to the final passing gate report and an integrity manifest of the certified file set.
- Detection of changed, missing, symlinked, or newly added files after readiness certification.
- Built-in store-only ZIP generation, package manifest, and checksum sidecar with no runtime dependency.
- `publish-check`, which validates exact human authorization but never performs the external action.
- `validate-results`, which requires real post-launch data, a predeclared rule, hashed calculation evidence, and independent measurement review.
- `Z-VALIDATED.md` performance attestation and `verify-results` checks for source, rule, calculation, marker, and state consistency.
- 37 automated contract tests covering normal flows and adversarial failures.

## Requirements

- Node.js 20 or newer.
- No npm runtime dependencies.
- Optional system tools:
  - `ffprobe` for rendered-video verification;
  - `pdfinfo` for PDF page metadata;
  - `ffmpeg` and ImageMagick for optional host adapters, not the core CLI.

Check the environment:

```bash
node bin/supermarketer.mjs doctor
```

## Install

Use one canonical checkout and either invoke the executable directly or create a local npm link.

```bash
cd supermarketer-skill
npm link
supermarketer version
```

Audit linked or copied installations without modifying them:

```bash
supermarketer install-audit . \
  ~/.agents/skills/supermarketer \
  ~/.codex/skills/supermarketer \
  ~/.claude/skills/supermarketer
```

## Quick start

```bash
# 1. Create persistent project truth and run storage.
supermarketer init ./my-project

# 2. Create one run for one marketing objective.
supermarketer new \
  "Create a Korean launch poster and a 15-second vertical product video" \
  --project ./my-project

# 3. Complete the brief and structured records inside the returned vault.
#    Ground every claim, define exact deliverables, produce assets,
#    add independent reviews, and map QA criteria to evidence.

# 4. Ingest actual generated/rendered files.
supermarketer ingest <vault> --asset ASSET-001 --file poster.png --as rendered
supermarketer ingest <vault> --asset ASSET-002 --file video.mp4 --as rendered

# 5. Validate, certify, verify, and package.
supermarketer check <vault>
supermarketer ready <vault>
supermarketer verify-ready <vault>
supermarketer package <vault> --out launch-delivery.zip
```

The normal pre-launch result is:

```text
Readiness: LAUNCH_READY
Performance: NOT_MEASURED
External action: NOT AUTHORIZED
```

## State separation

Readiness and performance are independent state machines:

```text
Readiness: DRAFT | REVIEW_READY | LAUNCH_READY | BLOCKED
Performance: NOT_MEASURED | MEASURING | PERFORMANCE_VALIDATED
```

`LAUNCH_READY` means the scoped package passed its pre-launch evidence, claims, channel, asset, rights, review, and QA requirements. It does not prove CTR, conversion, revenue, or brand lift.

`PERFORMANCE_VALIDATED` additionally requires:

- a real post-launch source file and its SHA-256;
- a dated measurement period and metric definition;
- a predeclared rule file, hash, and timestamp preceding measurement;
- a numeric threshold and observed value;
- a calculation method and hashed calculation-evidence file;
- uncertainty, limitations, and passing guardrails;
- distinct analyst and reviewer identities;
- a passing independent measurement review;
- stricter randomization evidence before causal language is allowed.

After completing `MEASUREMENT.yaml` and the measurement review:

```bash
supermarketer validate-results <vault>
supermarketer verify-results <vault>
supermarketer status <vault>
```

The core validates the declared rule and the integrity/traceability of its inputs. It does not contain a universal parser that independently recomputes every possible KPI from every analytics-provider export; the calculation evidence and independent reviewer remain part of the proof contract.

## Readiness integrity model

`ready` performs a non-mutating preflight, synchronizes final readiness state transactionally, runs the 12 final gates, writes `reports/gate-report.json`, and records its SHA-256 in `Z-READY.md`.

The gate report also records a canonical integrity manifest for the certified run. `verify-ready`, packaging, publish permits, and measurement reject:

- a modified or missing gate report;
- a marker/report/run-ID mismatch;
- modified or missing certified files;
- newly added files outside the explicitly governed post-launch paths;
- symlink substitutions and real-path escapes.

Post-launch measurement may add exactly the source, predeclared-rule, and calculation-evidence files named in `MEASUREMENT.yaml`. They remain acceptable only while their hashes agree with the measurement record and `Z-VALIDATED.md`.

SHA-256 provides local integrity linkage, not signer identity. An attacker who can rewrite the entire vault can also recompute local hashes. Use signed releases, immutable storage, version control, or an external signing service when adversarial authenticity and non-repudiation are required.

## Media tools and adapters

The core is provider-neutral. A host image, design, or video tool creates the actual file; SuperMarketer ingests and verifies the result through the manifest, adapter lineage, rights records, independent review, and metadata gates.

- `STATIC` deliverables require a real render.
- `IMAGE` deliverables may use an explicitly accepted `ART_DIRECTION_ONLY` package.
- `VIDEO` deliverables may use an explicitly accepted, complete `PRODUCTION_PACK_ONLY` package.
- Missing tools never permit an empty file, invented path, or false rendered status.
- No provider API key, publishing credential, or customer list is bundled.

See `adapters/README.md` and `reference/tool-adapters.md`.

## External-action boundary

The CLI intentionally has no command that posts, sends, schedules, deploys, changes bids, or spends budget. `publish-check` only verifies that a specific, unexpired, explicitly recorded human approval covers the exact assets and action scope.

```bash
supermarketer publish-check <vault> --approval AP-001
```

A successful check writes a local permit record under `reports/`. It does not call a platform. Any external publisher must implement its own authentication, authorization, confirmation, rate limits, and audit trail.

## Test the distribution

```bash
npm test
bash tests/run-all.sh
npm run check:skill
npm pack --dry-run --ignore-scripts
```

The suite covers grounded readiness, evidence-link failures, stale channel requirements, traversal and symlink attacks, producer self-review, fake media fallbacks, metadata verification, readiness-report and certified-file tampering, post-certification file injection, repeated packaging, explicit publish approval, CLI behavior, real-results validation, and post-validation source/rule/calculation tampering.

## Repository map

```text
SKILL.md                 thin runtime router and operating contract
bin/                     executable CLI entry point
lib/                     router, scaffold, media inspection, gates, workflows
scripts/                 individual executable gate wrappers
agents/                  separated strategy, producer, and reviewer roles
reference/               mode and operating playbooks
adapters/                provider-neutral media handoff contracts
templates/               run-vault and production-pack templates
schemas/                 JSON Schema interoperability documentation
docs/                    CLI, implementation, security, schemas, installation
examples/                complete and fallback examples
tests/                   executable contract and adversarial tests
SPEC.md                   complete product and operational specification
```

## Design lineage

The architecture is inspired by `cskwork/supergoal-skill` for thin routing, scoped references, role separation, exact verification, and tests, and by `cskwork/superdesign-skill` for independent visual critique, rendered-artifact verification, and honest tool fallback. This implementation is newly written for product marketing and changes the verification ground truth to product truth, evidence-linked claims, current channel requirements, asset metadata, rights and generation lineage, independent review, and real post-launch data.

## License

MIT. See `LICENSE` and `NOTICE.md`.
