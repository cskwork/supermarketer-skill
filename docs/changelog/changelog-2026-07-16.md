# Changelog - 2026-07-16

## MarketingSkills integration R-LOOP iteration 2

- Routing: recognize explicit 90-day, comprehensive, cross-funnel, and AARRR marketing-plan intent before narrow funnel-stage boundaries. Rejected weakening `onboarding` globally because onboarding-only requests already route correctly.
- Mobile: let status cards shrink, wrap their headings, and break long inline code. Rejected hiding overflow or changing the specialist panel because the overflow originated in the status cards.
- Semantics: change Workflow and Status subheadings from H4 to H3 while keeping the existing selectors' visual values.
- Request hygiene: use an inline SVG favicon so static hosting makes no default `/favicon.ico` request. Rejected adding a separate binary asset because it would add a request and packaging surface.
- Contrast: introduce theme-specific metadata, axis, pill, accent, and button colors that satisfy the existing thresholds. Rejected lowering thresholds or rewriting iteration-1 browser evidence; fresh capture remains a separate QA step.

## Release-gate sequencing amendment

- Keep every locally provable product, routing, vendor-integrity, documentation, forward-test, and browser check in the pre-commit Supergoal gate.
- Verify remote `main`, CI, GitHub Pages, the live landing, the annotated tag, and the GitHub Release after the release-candidate commit exists.
- Rejected marking remote checks complete before evidence exists or weakening any local threshold. The user explicitly approved this sequencing correction; GitHub state and the final delivery report remain mandatory proof.

## Accepted browser-provenance exception

- During final verification, the external Supergoal browser gate changed from accepting the completed Playwright run to requiring `agent-browser` provenance or a concrete failed attempt.
- Preserve the exact failed-gate result; do not relabel it PASS. The underlying rendered evidence remains 38/38, contrast remains 35/35, and the repository floor remains 83/83.
- The user explicitly instructed commit and push with this process exception recorded. Tag and GitHub Release creation are deferred from this narrowed step.
