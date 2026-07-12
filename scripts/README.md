# Implemented gate scripts

Each script is a thin executable wrapper around a module in `lib/gates/` or a focused distribution/media verifier. It prints stable error codes and exits non-zero on failure.

## Aggregate readiness

```bash
node scripts/readiness-gate.mjs <run-vault>
```

Equivalent user-facing command:

```bash
node bin/supermarketer.mjs check <run-vault>
```

## Run and marketing gates

```text
brief-gate.mjs
channel-spec-gate.mjs
claims-gate.mjs
deliverables-gate.mjs
evidence-gate.mjs
manifest-gate.mjs
production-pack-gate.mjs
qa-gate.mjs
reviews-gate.mjs
```

## Integrity, measurement, approval, and package gates

```text
readiness-attestation-gate.mjs
performance-attestation-gate.mjs
measurement-gate.mjs
publish-gate.mjs
package-gate.mjs
```

## Distribution and media checks

```text
image-metadata-gate.mjs
video-metadata-gate.mjs
reference-integrity-gate.mjs
skill-frontmatter-gate.mjs
skill-install-audit.mjs
```

Pass `--json` where supported for automation. A passing deterministic gate proves only its declared property; it does not replace independent creative judgment, authenticated human authorization, specialist legal review, or real campaign measurement.
