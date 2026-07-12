# Media tool adapter contract

SuperMarketer is provider-neutral. The host agent may use an available image, design, video, audio, or rendering tool, but the tool result becomes trustworthy only after it is ingested, traced, reviewed, and verified.

## Handoff flow

1. Define the asset in `DELIVERABLES.yaml` and `ASSET-MANIFEST.yaml` before generation.
2. Give the adapter only approved product facts, copy, references, dimensions, rights constraints, and negative constraints.
3. Save the returned file inside or outside the vault without claiming completion.
4. Record a lineage file containing tool/model, timestamp, inputs, prompt/instructions, edits, substitutions, source rights, and known limitations.
5. Ingest the result:

```bash
node bin/supermarketer.mjs ingest <vault> --asset ASSET-001 --file <rendered-file> --as rendered
node bin/supermarketer.mjs ingest <vault> --asset ASSET-001 --file <lineage-file> --as lineage
```

6. Set rights, AI-generation, accessibility, claim, reviewer, and review-status fields in `ASSET-MANIFEST.yaml`.
7. Run `inspect`, independent review, and the aggregate readiness gate.

## Adapter result

A provider wrapper should return a record compatible with `schemas/adapter-result.schema.json`. Status is one of:

- `rendered`
- `ART_DIRECTION_ONLY`
- `PRODUCTION_PACK_ONLY`
- `failed`

An adapter status does not itself approve the asset.

## Static, image, and video boundaries

- Static design has no fallback. A poster or banner needs a real render.
- Image work may fall back to an accepted art-direction pack when no generator or approved source exists.
- Video work may fall back to an accepted complete production pack when no renderer exists.
- Empty files, renamed text files, opaque IDs without a retrievable file, and invented paths are invalid.

## Security

Never pass secrets, customer lists, private images, or confidential product material to an external provider unless the user has authorized that provider and data use. Record the provider and source scope in lineage. See `docs/SECURITY.md`.
