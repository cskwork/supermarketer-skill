# Implementation architecture

## Runtime

SuperMarketer 1.0.0 is an ECMAScript-module Node.js application requiring Node 20 or newer. It has no npm runtime dependency and uses only standard-library modules plus optional system media tools.

```text
bin/supermarketer.mjs -> lib/cli.mjs
```

## Core modules

| Module | Responsibility |
|---|---|
| `lib/router.mjs` | Deterministic bilingual objective classification and validated mode override |
| `lib/scaffold.mjs` | Persistent project workspace and isolated run-vault creation |
| `lib/yaml-lite.mjs` | Strict supported YAML subset parser and canonical writer |
| `lib/markdown.mjs` | Required-section, field, checkbox, table, placeholder, and frontmatter parsing |
| `lib/utils.mjs` | Atomic writes, hashes, dates, file walking, lexical/real-path containment, symlink rejection |
| `lib/media/` | Image, PDF, and video metadata inspection |
| `lib/gates/` | Independent deterministic validation modules |
| `lib/attestation.mjs` | Readiness marker, report digest, certified-file integrity manifest, and file-set verification |
| `lib/performance-attestation.mjs` | Performance marker plus source/rule/calculation/state consistency verification |
| `lib/workflow.mjs` | Transactional readiness certification, result validation, publish permit, and asset ingestion |
| `lib/package-run.mjs` | Package gate, package manifest, ZIP, and checksum |
| `lib/zip.mjs` | Dependency-free store-only ZIP writer with CRC32 |
| `lib/install-audit.mjs` | Hash-based read-only installation drift audit |

## Gate composition

`lib/gates/aggregate.mjs` invokes 12 independent gates and merges exact errors and warnings:

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

A gate returns a stable shape:

```json
{
  "gate": "claims",
  "ok": false,
  "errors": [
    {
      "code": "CLAIM_EVIDENCE_UNKNOWN",
      "message": "...",
      "location": "CLAIMS.yaml:claims[0]"
    }
  ],
  "warnings": [],
  "checks": [],
  "metadata": {}
}
```

All ordinary gate modules are read-only. Before certification, the aggregate writer emits `reports/gate-report.json`. After `Z-READY.md` exists, an ordinary `check` writes `reports/gate-report-latest.json` so the attested report is preserved. Attestation verification disables report writing entirely.

## Transactional readiness certification

`certifyReady` uses the following sequence:

1. Run a non-mutating review-ready preflight.
2. Snapshot `run-state.json`, `ASSET-MANIFEST.yaml`, `QA.md`, the prior gate report, and `Z-READY.md`.
3. Synchronize readiness to `LAUNCH_READY`, preserve performance, and keep external action false.
4. Execute the 12 final readiness gates.
5. Build a canonical integrity manifest for the certified file set and embed it in the final gate report.
6. Hash that exact final report.
7. Write `Z-READY.md` with the report SHA-256.
8. Restore every snapshot if a final step fails.

The marker is written only after the report is final; no subsequent certification step rewrites the report.

## Readiness integrity manifest

The integrity manifest stores, for each governed file:

```json
{
  "path": "ASSET-MANIFEST.yaml",
  "normalization": "manifest-without-performance",
  "canonical_size_bytes": 1234,
  "sha256": "..."
}
```

Most files use their raw bytes. A small set uses semantic normalization so legitimate post-launch state changes do not destroy pre-launch certification:

- `run-state.json`: post-launch phase, performance, and update timestamp are excluded;
- `ASSET-MANIFEST.yaml`: run-level performance is excluded;
- `REVIEWS.yaml`: measurement reviews are excluded;
- `QA.md`: the performance status line is normalized.

Explicitly mutable post-readiness records such as `APPROVALS.yaml`, `MEASUREMENT.yaml`, `RESULTS.md`, markers, package manifests, and publish permits are not part of the pre-launch hash set.

Verification compares both content and file membership. A certified file changed, deleted, or replaced by a symlink fails. A regular file added after certification also fails. The only dynamic additions accepted during measurement are the exact source, predeclared-rule, and calculation-evidence files named in `MEASUREMENT.yaml`; before validation the measurement gate supplies those exact paths, and after validation their current hashes must match both the measurement record and `Z-VALIDATED.md`.

## Transactional performance validation

`validateResults` first runs the measurement gate without mutating the vault. It then snapshots state, manifest, QA, and the performance marker; updates performance to `PERFORMANCE_VALIDATED`; writes `Z-VALIDATED.md`; and performs a final performance-attestation verification. Any failure restores the snapshots.

The performance marker binds:

- run ID and validation timestamp;
- source-data SHA-256;
- predeclared-rule SHA-256;
- calculation-evidence SHA-256;
- metric, operator, threshold, observed value;
- uncertainty and decision;
- whether causal language is permitted.

`verify-results` re-runs the measurement gate and compares those fields to the current files and state.

## Media verification

Raster dimensions are parsed directly to avoid unnecessary dependencies:

- PNG: IHDR width and height;
- GIF: logical-screen descriptor;
- JPEG: SOF marker;
- WebP: VP8, VP8L, or VP8X headers;
- SVG: width/height or viewBox;
- PDF: optional `pdfinfo`;
- video: `ffprobe` JSON for stream, codec, dimensions, frame rate, audio, duration, format, and size.

The manifest gate compares actual metadata with the asset's expected values and the matching channel/placement specification.

## Trust layers

The implementation separates five forms of evidence:

1. deterministic artifact properties;
2. claim, source, rights, and lineage traceability;
3. independent expert judgment;
4. exact human approval for external action;
5. real post-launch outcome validation.

No layer substitutes for another. A file hash does not prove brand fit; a creative review does not prove dimensions; a publish approval does not prove performance; and a passing threshold does not establish causality without an appropriate design.

## Atomicity and file safety

- Structured writes use a temporary file and rename.
- Manifest and evidence paths must remain inside the vault lexically and after `realpath` resolution.
- Required files/directories, QA evidence, manifest paths, measurement files, and ingested destinations reject symlinks.
- Package output must be outside the vault to prevent recursive inclusion.
- Ingestion validates the asset ID and rendered media before changing the manifest.
- Name collisions create versioned filenames instead of overwriting.
- Readiness and performance markers are generated by workflow commands, not producer roles.

## Extensibility

New media providers should implement `schemas/adapter-result.schema.json` and follow `reference/tool-adapters.md`. New universal gates must return the common result shape and include at least one passing test and adversarial failure tests.

Provider-specific generation and external publishing remain deliberate integration boundaries. The core verifies files and permits; it does not bundle credentials or claim that an unavailable generator produced an artifact.
