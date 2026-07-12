# Examples

- `complete-copy-run/`: a certified, grounded, text-only COPY run with a valid 12-gate readiness record. It is intentionally `NOT_MEASURED` and contains no publish approval.
- `short-video-fallback.md`: the required behavior when video rendering is unavailable and a complete `PRODUCTION_PACK_ONLY` substitute is used.

The complete run contains dated channel evidence. Its stored readiness attestation remains verifiable, but a fresh `check` performed much later may correctly require refreshed channel evidence before recertification.
