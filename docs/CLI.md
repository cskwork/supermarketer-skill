# SuperMarketer CLI reference

All commands require Node.js 20 or newer. The CLI has no npm runtime dependency.

```bash
node bin/supermarketer.mjs <command>
# or, after npm link
supermarketer <command>
```

## Global behavior

- Successful commands exit `0`; misuse or failed gates exit `1`.
- Most commands accept `--json` for machine-readable output.
- `--json` and `--draft` are boolean flags and may appear before or after positional arguments.
- Paths stored in run records must be relative to the run vault.
- Governed paths reject absolute paths, `..` traversal, symlinks, and real-path escapes.
- The CLI never posts, sends, schedules, deploys, changes bids, or spends money.

## `route`

```bash
supermarketer route "<objective>" [--mode MODE] [--specialty SPECIALTY] [--json]
```

Classifies an English or Korean objective on two independent axes. It returns the selected mode, confidence, matched signals, mode playbook, primary output, specialty, specialty confidence, specialty matched evidence, and vendored specialist playbook. `--mode` and exact `--specialty` are independently validated overrides.

## `init`

```bash
supermarketer init [project-dir] [--json]
```

Creates `.supermarketer/{rules,brand,product,legal,runs}` and standing templates. Existing standing files are preserved.

## `new`

```bash
supermarketer new "<objective>" [--project DIR] [--mode MODE] [--specialty SPECIALTY] [--slug SLUG] [--json]
```

Creates an isolated run vault, routes the objective, persists mode and specialist metadata, writes both playbooks to `RUN.md`, creates mode-specific templates, and preserves the original objective in `BRIEF.md`.

## `check`

```bash
supermarketer check <run-vault> [--draft] [--max-channel-age DAYS] [--json]
```

Runs the 12 aggregate launch-readiness gates:

```text
run-files
run-state
brief
evidence
claims
channel-specs
deliverables
production-pack
asset-manifest
reviews
qa
performance-attestation
```

Default mode treats readiness requirements as blocking. `--draft` downgrades selected incomplete or stale conditions to warnings for iterative work; it never certifies readiness.

Before certification, the command writes `reports/gate-report.json`. When `Z-READY.md` already exists, it preserves the attested report and writes the fresh diagnostic result to `reports/gate-report-latest.json`. Internal verification callers suppress report writing entirely.

## `ready`

```bash
supermarketer ready <run-vault> [--json]
```

Requires a fully review-ready run and uses a transactional sequence:

1. run a non-mutating preflight;
2. snapshot state, manifest, QA, report, and marker;
3. set readiness to `LAUNCH_READY` while preserving performance and keeping external action unauthorized;
4. run the 12 final gates;
5. write `reports/gate-report.json` with a canonical integrity manifest of the certified file set;
6. compute the final report SHA-256;
7. write `Z-READY.md` with that digest;
8. restore the snapshots if any final step fails.

## `status`

```bash
supermarketer status <run-vault> [--json]
```

Shows mode, phase, readiness, performance, external-action state, and the presence and integrity status of `Z-READY.md` and `Z-VALIDATED.md`.

Human output reports `VALID`, `INVALID`, or `NO`. JSON includes:

```text
z_ready
z_ready_valid
z_ready_errors
z_validated
z_validated_valid
z_validated_errors
```

## `verify-ready`

```bash
supermarketer verify-ready <run-vault> [--json]
```

Verifies:

- marker syntax, run ID, state, and completion time;
- exact `reports/gate-report.json` path and SHA-256;
- passing report schema, status, timestamp, and complete 12-gate set;
- every certified file's canonical hash;
- absence of missing, symlinked, changed, or newly injected files;
- permitted post-launch additions only when their hashes are linked to a valid performance record.

Packaging, publish permits, and measurement call the same verifier internally.

The digest is a local integrity mechanism, not a digital signature. Use an external signer or immutable storage when signer identity and non-repudiation matter.

## `ingest`

```bash
supermarketer ingest <run-vault> \
  --asset ASSET-001 \
  --file PATH \
  [--as rendered|source|preview|lineage] \
  [--json]
```

Copies an existing file into `assets/<asset-id>/` and versions name collisions rather than overwriting. Asset IDs must match `ASSET-###`. Destination paths reject symlinks and real-path escapes.

For `--as rendered`, the command validates media before mutating the manifest, then records format, dimensions or duration, byte size, SHA-256, and rendered status. Review and approval remain separate operations.

## `inspect`

```bash
supermarketer inspect <file> [--kind static|image|video|copy] [--json]
```

Inspects:

- PNG, JPEG, GIF, and WebP from bounded file headers;
- SVG from its root element;
- PDF through optional `pdfinfo`;
- video through `ffprobe` JSON;
- other files by extension, byte size, and SHA-256.

## `package`

```bash
supermarketer package <run-vault> [--out FILE.zip] [--json]
```

Requires both a fresh passing readiness run and a valid `Z-READY.md` integrity attestation. It rejects output inside the vault, writes `reports/PACKAGE-MANIFEST.json`, creates a store-only ZIP with the built-in writer, and writes `<zip>.sha256`.

The package manifest excludes its own mutable hash entry, preventing repeated packaging from creating a stale self-reference. Any file injected after readiness certification blocks packaging unless it is an explicitly hash-linked post-launch evidence file.

## `validate-results`

```bash
supermarketer validate-results <run-vault> [--json]
```

Requires:

- a valid launch-readiness attestation;
- `data.real_post_launch: true`;
- an existing source file and matching `data_sha256`;
- source description, date range, timezone, metric definition, and data-quality limitations;
- an existing predeclared-rule file and matching hash;
- `predeclared_at` no later than measurement start;
- a supported numeric operator, threshold, and observed value whose rule passes;
- calculation method, calculation-evidence file, and matching hash;
- uncertainty, passed guardrails, and a valid decision;
- separate analyst and reviewer identities;
- a passing measurement review owned by the declared reviewer and completed after the measurement period;
- randomization, assignment method, and sample size before a causal claim is allowed.

The workflow transactionally updates state, manifest, and QA, writes `Z-VALIDATED.md` with source/rule/calculation hashes, verifies the resulting performance attestation, and rolls back on failure.

## `verify-results`

```bash
supermarketer verify-results <run-vault> [--json]
```

Re-runs the measurement gate and verifies that `Z-VALIDATED.md`, `MEASUREMENT.yaml`, current source data, predeclared rule, calculation evidence, run state, observed value, uncertainty, decision, and causal-claim status still agree.

A manually written marker, modified source, changed rule, changed calculation evidence, self-review, or failed threshold exits non-zero.

## `publish-check`

```bash
supermarketer publish-check <run-vault> --approval AP-001 [--json]
```

Validates the readiness attestation and one exact record in `APPROVALS.yaml`. The record must be explicitly user-authorized, human-owned, approved, unexpired, and scoped to exact asset IDs, actions, destination, account, and timing. Sending requires recipient scope; spending requires currency and a maximum budget.

The command writes `reports/publish-permit-AP-001.json` with a scope fingerprint. It performs no external action.

## `doctor`

```bash
supermarketer doctor [--json]
```

Checks Node compatibility and optional media tools. Missing optional tools never permit a fabricated output.

## `check-skill`

```bash
supermarketer check-skill [skill-dir] [--json]
```

Validates `SKILL.md` frontmatter, router size, required distribution files, package bin resolution, run templates, first-party Markdown references, and the exact vendored specialist manifest/frontmatter/file hashes.

## `install-audit`

```bash
supermarketer install-audit [source-dir] [target-dir ...] [--json]
```

Hashes the source and targets and reports:

- `linked`: target resolves to the source directory;
- `copied-clean`: complete byte-identical copy;
- `missing`: target absent;
- `drifted`: changed, missing, or extra files.

The command is read-only.
