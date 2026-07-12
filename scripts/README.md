# Planned gate scripts

This starter defines the CLI contracts but does not implement them yet.

Recommended implementation order:

1. `brief-gate.mjs`
2. `claims-gate.mjs`
3. `manifest-gate.mjs`
4. `channel-spec-gate.mjs`
5. `image-metadata-gate.py`
6. `video-metadata-gate.py`
7. `package-gate.sh`

A gate must report exact failures and exit non-zero. It must never substitute a generated reviewer score for real artifact/evidence checks.
