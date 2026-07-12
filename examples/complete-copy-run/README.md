# Complete certified COPY run

This snapshot demonstrates a grounded text-only COPY run with product and channel evidence, one claim, one deliverable, an actual copy artifact, independent claims/creative/QA reviews, deterministic QA evidence, a passing 12-gate report, and a valid `Z-READY.md` integrity record.

Verify from the repository root:

```bash
node bin/supermarketer.mjs check examples/complete-copy-run
node bin/supermarketer.mjs verify-ready examples/complete-copy-run
node bin/supermarketer.mjs status examples/complete-copy-run
```

The example is launch-ready but intentionally remains `NOT_MEASURED`; it contains no publish authorization. Channel freshness is time-bound, so a future reader may need to refresh the dated channel evidence and recertify.
