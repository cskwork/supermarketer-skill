# Decision log — 2026-07-15

## MarketingSkills integration

- Decision: keep SuperMarketer's 12 execution modes and add an independent 47-entry `specialty` axis. Why: execution intent and marketing domain are separate choices; combining them would multiply lifecycle states and change established readiness semantics.
- Decision: vendor the exact upstream `skills/**` tree and MIT license at commit `130847d0945555c43b0b1774e2a4f99d35a32ebe`, protected by per-file SHA-256 hashes. Why: offline runs must use deterministic knowledge with reviewable provenance.
- Decision: exclude upstream remote-action CLIs, plugin manifests, repository instructions, and duplicate root/version contracts. Why: they can mutate external systems or compete with SuperMarketer's routing, product-truth, and no-publish boundary.
- Decision: keep `.supermarketer/product/PRODUCT-TRUTH.md` and `.supermarketer/brand/BRAND.md` canonical. Why: creating upstream's `.agents/product-marketing.md` would introduce a competing standing-truth source.
- Decision: route unmatched specialist intent to `product-marketing` at low confidence while preserving the existing `CAMPAIGN` mode fallback. Why: this is conservative, backward-compatible, and exposes uncertainty.
- Decision: treat `v0.0.1` as the first release and replace the unpublished `1.0.0` claim. Why: the repository has no published tag or GitHub Release, and `0.0.1` is the requested first public version.

Rejected alternatives: concatenate all upstream content into root `SKILL.md`; register 47 root skills; add 47 execution modes; fetch knowledge at runtime; use a git submodule; bundle upstream executable CLIs; rewrite upstream examples to satisfy host-only link assumptions.
