# SuperMarketer media adapters

The core package intentionally contains no hard-coded commercial provider credentials or autonomous publishing API. It exposes a provider-neutral contract so the host runtime can use its available design, image, or video tool and then submit actual files to deterministic verification.

## Required behavior

An adapter must:

1. accept an asset ID, output specification, approved copy/claims, source references, and rights constraints;
2. return actual local files or an explicit fallback status;
3. write lineage compatible with `schemas/adapter-result.schema.json`;
4. never fabricate a path, success result, license, permission, or metadata;
5. never publish or spend;
6. leave approval to independent review and the core gates.

## Integration

```bash
node bin/supermarketer.mjs ingest <vault> --asset ASSET-001 --file output.png --as rendered
node bin/supermarketer.mjs ingest <vault> --asset ASSET-001 --file lineage.json --as lineage
node bin/supermarketer.mjs inspect <vault>/assets/asset-001/output.png --kind image
node bin/supermarketer.mjs check <vault>
```

See:

- `adapters/static-adapter-contract.md`
- `adapters/image-adapter-contract.md`
- `adapters/video-adapter-contract.md`
- `reference/tool-adapters.md`
