# Design lineage and third-party notice

SuperMarketer 0.0.1 combines a newly written execution and verification core with an exact vendored marketing-knowledge snapshot.

The execution architecture is inspired by:

- `cskwork/supergoal-skill`: thin routing, route-specific references, isolated roles, explicit deliverables, gated verification, and executable tests.
- `cskwork/superdesign-skill`: intent-driven visual production, independent critique, rendered-artifact verification, and explicit no-fake fallback behavior.

## Vendored MarketingSkills knowledge

This distribution includes `skills/**` and `LICENSE` from:

- Project: `cskwork/marketingskills`
- Canonical origin: `https://github.com/cskwork/marketingskills.git`
- Commit: `130847d0945555c43b0b1774e2a4f99d35a32ebe`
- Copyright: `Copyright (c) 2025 Corey Haines`
- License: MIT; the complete upstream notice is preserved at `vendor/marketingskills/LICENSE`.

The snapshot contains 47 specialist playbooks, 145 reference files, 45 evaluation files, and one bundled asset. `vendor/marketingskills/manifest.json` records every included file and SHA-256.

Upstream executable CLIs, plugin manifests, repository instructions, and duplicate root/version contracts are excluded. SuperMarketer's product truth, readiness, evidence, and no-publish/no-send/no-spend contracts remain authoritative over the vendored playbooks.

Optional system tools such as FFmpeg/ffprobe, Poppler `pdfinfo`, and ImageMagick remain governed by their own licenses and are not bundled here.
