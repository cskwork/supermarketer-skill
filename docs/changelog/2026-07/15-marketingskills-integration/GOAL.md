# GOAL - MarketingSkills integration and v0.0.1 release

Single source of "done". Only the verifier ticks a box; unticking needs regression evidence.
Never delete or reword an unmet criterion - append. Mid-run discovered musts are APPENDED as new
unchecked criteria tagged `(surfaced: ...)`. Ambiguous/product-changing candidates go to
`## Decision Gates` as `ask-user`, not into criteria.

## Original Request

> integrate https://github.com/cskwork/marketingskills to supermarketer skill to make this ultimate marketer use skill. do appropriate routing

> once fully integrated do test run and merge and update landing page and readme and make v0.0.1 release

## Spec

Integrate the exact `cskwork/marketingskills` snapshot at commit
`130847d0945555c43b0b1774e2a4f99d35a32ebe` as 47 progressively disclosed specialist playbooks.
Preserve SuperMarketer's existing 12-mode execution, evidence, review, readiness, performance, and
external-action contracts. Route on two independent axes: `mode` selects how the work is performed and
verified; `specialty` selects the marketing-domain playbook. Keep `.supermarketer` product and brand
truth canonical. Vendor upstream skills, their references, evaluations, license, and provenance, but do
not bundle upstream executable marketing CLIs. Add deterministic routing, explicit overrides, persisted
run metadata, integrity checks, tests, bilingual public documentation, a browser-verified landing page,
and first-release metadata for `v0.0.1`. Merge only verified work into `main`, push it, verify CI and
GitHub Pages, then publish the annotated tag and GitHub Release.

## Success Criteria

Each item is falsifiable and names its verification method.

- [x] All 47 upstream specialist playbooks, references, evaluations, license, and exact source provenance are bundled without upstream executable CLIs - verify: `node scripts/marketing-specialists-gate.mjs .`
- [x] Routing returns a backward-compatible 12-mode result plus an independently selected specialist, reference, confidence, and matched evidence; explicit mode and specialist overrides work - verify: `node --test tests/router.test.mjs tests/cli.test.mjs`
- [x] Curated overlap rules distinguish the high-risk neighboring specialties and every catalog entry is reachable - verify: `node --test tests/specialist-router.test.mjs`
- [x] New run vaults persist specialist metadata and direct the operator to both the execution-mode and specialist playbooks without creating a competing product-truth source - verify: `node --test tests/scaffold.test.mjs`
- [x] Vendored knowledge is excluded only from first-party link assumptions and is instead protected by an exact vendor-specific manifest/frontmatter/hash gate - verify: `node --test tests/reference-integrity.test.mjs tests/marketing-specialists-gate.test.mjs`
- [x] Existing readiness, performance, packaging, and no-external-action behavior has no unnamed drift - verify: `bash tests/run-all.sh`
- [x] Root skill routing stays progressively disclosed and valid, and the distributable package contains the specialist snapshot - verify: `npm run check:skill && npm pack --dry-run --ignore-scripts`
- [x] README, Korean README, specification/implementation notes, notice, changelog, release notes, and landing page accurately describe the two-axis 12-mode/47-specialist model and `v0.0.1` - verify: `rg -n 'v1\.0\.0|37 automated|37 tests' README.md README.ko.md SPEC.md NOTICE.md CHANGELOG.md RELEASE-NOTES.md docs package.json package-lock.json lib`
- [x] The landing page renders on desktop and mobile with working navigation, theme control, accurate counts, and visible specialist-routing content - verify: browser QA against a local `docs/` server
- [x] A fresh-context agent completes a realistic cross-specialty SuperMarketer task using the integrated skill and reports which playbooks it loaded - verify: forward-test artifact under this run vault
- [ ] The landing passes the release browser-quality baseline: no heading-level skips, no failed resource or console errors, and every recorded dark/light text pair meets the configured contrast threshold - verify: `qa/landing-regression.md` plus `bash /Users/danny/Documents/PARA/Resource/supergoal-skill/templates/qa-gate.sh docs/changelog/2026-07/15-marketingskills-integration browser` `(surfaced: the approved browser QA requires accessibility and side-effect proof, and the captured evidence exposed failures not represented by the original landing criterion; regressed: the current QA gate changed its driver-provenance contract during final verification and now rejects the existing playwright-cli record without a concrete agent-browser fallback reason)`

## QA Cases (web apps only)

Browser scenarios the QA agent drives via playwright-cli; evidence under `qa/`.

- [x] Desktop landing: load, verify hero/version/two-axis routing/47-specialist copy, exercise all navigation anchors and theme toggle - evidence: `qa/landing-desktop.png`
- [x] Mobile landing: load at a phone viewport, verify no horizontal overflow and readable routing/count content - evidence: `qa/landing-mobile.png`

## Post-commit Delivery Contract

User-approved on 2026-07-15T22:39:04Z as mandatory external delivery gates under PLAN step 11. They
are intentionally outside the pre-commit checkbox gate because the exact commit and its remote effects
cannot exist before commit. GitHub state and the final delivery report are the canonical evidence.

The user narrowed the current delivery step at 2026-07-15T22:49:05Z to commit and push only. CI/Pages,
live-site, tag, and GitHub Release proof therefore remain deferred and must not be reported as complete.

- `main` contains the verified change, remote CI and GitHub Pages pass, and the live landing reflects the release - verify: GitHub checks plus live Pages inspection
- Annotated tag and GitHub Release `v0.0.1` exist at the merged `main` commit with release notes - verify: `gh release view v0.0.1`

## Decision Gates

| ID | Action | Status | Finding | Decision | Recheck |
|---|---|---|---|---|---|
| d1 | auto-fix | resolved | Requested `v0.0.1` conflicts with unpublished `1.0.0` claims and no tags/releases exist. | Canonicalize all version surfaces to the requested first actual release `0.0.1`. | version scan + CLI version |
| d2 | no-op | resolved | Upstream tool CLIs include send/mutate/delete operations that conflict with the host external-action boundary. | Integrate all 47 knowledge playbooks; exclude executable CLIs and document optional host-tool fallback. | vendor manifest + package listing |
| d3 | no-op | resolved | A rigid 47-to-12 map misroutes tasks because specialty and execution intent vary independently. | Use two-axis routing; do not add top-level modes. | overlap tests + real task |
| d4 | ask-user | resolved | Plan step 11 requires a commit before remote CI, Pages, live-site, tag, and release proof, but the current pre-commit completion gate requires criteria 11-12 and `Z-*` proof before that commit can exist. | User approved moving those statements verbatim to the mandatory post-commit delivery contract. All locally provable product/browser/forward criteria remain pre-commit gates. | user replied "yes" at 2026-07-15T22:39:04Z; PLAN amendment recorded |
| d5 | ask-user | resolved | The external browser QA backstop changed during final verification from accepting the completed Playwright run to requiring `agent-browser` provenance or a concrete failed attempt. Product behavior evidence remained unchanged and green. | User explicitly accepted the existing Playwright evidence and instructed commit/push. Preserve the failed literal-gate result as an acknowledged process exception; do not claim PASS. | user replied "no its ok just commit push" at 2026-07-15T22:49:05Z |
