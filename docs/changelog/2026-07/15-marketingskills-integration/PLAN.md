# PLAN - MarketingSkills integration and v0.0.1 release

Frozen plan. A fresh-context implementer reads ONLY this file (plus the latest `R-LOOP.md` section on
re-entry) and builds it - the plan must be self-sufficient. Frozen after approval; changes append a
dated `## Amendment`.

## Approval

- Status: approved-by-user
- Record: 2026-07-15T20:41:53Z; user replied "yes"

## Amendment - 2026-07-15T22:39:04Z

- Status: approved-by-user
- Record: 2026-07-15T22:39:04Z; user replied "yes" to the release-sequencing correction.
- Decision: the pre-commit Supergoal gate covers every locally provable product, routing, integrity,
  documentation, forward-test, and browser criterion. Remote `main`, CI, Pages, live-site, tag, and
  GitHub Release checks remain mandatory post-commit delivery gates under step 11, with GitHub and the
  final delivery report as their evidence.
- Reason: the exact commit, its deployment, and its release cannot be proven before that commit exists.
  Requiring those facts inside the pre-commit completion marker creates a self-referential gate rather
  than stronger verification. No product scope, test threshold, or release requirement is weakened.

## Amendment - 2026-07-15T22:49:05Z

- Status: approved-by-user
- Record: 2026-07-15T22:49:05Z; user replied "no its ok just commit push" after a live external
  `qa-gate.sh` change made `agent-browser` provenance mandatory and rejected the already completed
  Playwright evidence.
- Decision: accept the existing 38/38 rendered behavior, 35/35 contrast, keyboard, reduced-motion,
  responsive, and side-effect evidence for this commit. Record the changed driver-provenance gate as
  an explicit process exception; do not claim that the literal current commit gate passed.
- Delivery scope for this step: scoped commit, fast-forward merge to `main`, push `origin/main`, and
  remote commit confirmation. Do not create a tag or GitHub Release in this step.

## Intent

- Goal / constraints / tradeoffs / rejected approaches: Make one `/supermarketer` skill cover the complete 47-specialist upstream marketing knowledge set without weakening its evidence, readiness, product-truth, or external-action contracts. Preserve the 12 existing execution modes and add a separate specialist axis. Vendor an exact, attributed snapshot for deterministic offline use. Reject concatenating 14,263 upstream lines into root `SKILL.md`, registering 47 competing root skills, adding 47 lifecycle modes, fetching knowledge at runtime, using a git submodule, or bundling upstream executable CLIs.
- Completion promise: Deliver the exact knowledge snapshot, deterministic two-axis routing, persisted specialist metadata, integrity and regression tests, public English/Korean docs, browser-verified landing, one realistic fresh-context test run, a verified merge to `main`, passing remote CI/Pages, and published `v0.0.1`. Stop only when every criterion is proven or a real blocker is reported. `max_iterations: 3`.

## Steps

1. Add failing tests first in `tests/specialist-router.test.mjs`, `tests/router.test.mjs`, `tests/cli.test.mjs`, `tests/scaffold.test.mjs`, `tests/reference-integrity.test.mjs`, and `tests/marketing-specialists-gate.test.mjs`. Cover all 47 catalog entries, curated neighboring-intent tie-breakers, mode/specialist independence, overrides, fallback behavior, persisted metadata, vendor tampering, and the preserved first-party reference gate.
2. Vendor the exact upstream `skills/**`, `LICENSE`, and a machine-readable source/hash manifest under `vendor/marketingskills/`. Preserve all 47 `SKILL.md` files, 145 references, 45 evaluation files, and their bundled assets. Record source URL, canonical origin, commit, included/excluded paths, counts, and hashes. Exclude upstream `tools/clis/**`, plugin manifests, repository instructions, and duplicate root/version contracts.
3. Add a cohesive specialist catalog and router under `lib/specialists/`. Keep catalog data separate from scoring. Route `specialty` independently from the current `mode`; return `specialty`, `specialty_confidence`, `specialty_matched`, and `specialty_reference`. Support an exact `--specialty` override. Encode curated boundaries for copy, outbound/lifecycle, paid/organic, research/prospecting/comparison, conversion stages, pricing/offers, SEO families, orchestration, earned/partner growth, analytics, and experimentation.
4. Extend `lib/router.mjs`, `lib/cli.mjs`, `lib/scaffold.mjs`, `templates/BRIEF.md`, `templates/run-state.json`, and `schemas/run-state.schema.json` with backward-compatible specialist metadata. Keep existing mode selection and readiness semantics unchanged. Write both mode and specialist playbooks into `RUN.md`; make `.supermarketer/product/PRODUCT-TRUTH.md` and `.supermarketer/brand/BRAND.md` canonical instead of creating `.agents/product-marketing.md` implicitly.
5. Add a vendor-specific integrity implementation and executable gate. Validate the exact source commit/manifest hashes, 47 names, directory/frontmatter agreement, catalog agreement, and required playbook files. Exclude only `vendor/marketingskills/**` from the first-party Markdown-link checker because exact upstream examples contain root-relative illustrative links; do not modify upstream content to satisfy host-only assumptions. Wire the gate into `check:skill`, `tests/run-all.sh`, and packaging verification.
6. Update `SKILL.md` and a concise first-party specialist-routing reference so an agent loads standing truth, the selected existing mode playbook, then only the chosen vendored specialist and its needed references. Document related-specialist handoffs, context adaptation, recency verification, optional-tool behavior, and the no-send/no-publish boundary.
7. Canonicalize all version surfaces from the unpublished `1.0.0` claim to the requested first release `0.0.1`: `package.json`, `package-lock.json`, `lib/constants.mjs`, `SPEC.md`, `docs/IMPLEMENTATION.md`, `NOTICE.md`, `CHANGELOG.md`, `RELEASE-NOTES.md`, and `docs/index.html`. Update `README.md`, `README.ko.md`, the landing page, distribution map/counts, lineage, and release content for 12 modes plus 47 specialists. Preserve the upstream MIT notice and commit attribution. Record this decision and rejected alternatives in `docs/changelog/changelog-2026-07-15.md`.
8. Run local trusted proof: `npm install --ignore-scripts`, `bash tests/run-all.sh`, `npm run check:skill`, `npm pack --dry-run --ignore-scripts`, `node bin/supermarketer.mjs version`, `git diff --check`, and the stale-copy/version scan. Re-index/detect graph impact if useful. Fix only grounded failures.
9. Serve `docs/` locally and dispatch evidence-only browser QA for desktop/mobile layout, navigation, theme toggle, accurate counts, and specialist copy; then dispatch a fresh adversarial auditor to rerun the real suite and reconcile every modified file with this goal.
10. Forward-test the integrated skill in a fresh-context agent on one realistic task that requires both a specialty and an execution mode. Require the agent to use the skill path, report selected playbooks, and produce an artifact without external side effects.
11. After green verification, pass the commit gate, commit the scoped branch, fast-forward `main`, push `origin/main`, verify the `test` and `pages-build-deployment` runs, and inspect the cache-busted live Pages URL. Create and push annotated tag `v0.0.1`, publish `RELEASE-NOTES.md` with `gh release create`, and verify the release URL and tag commit.

## Acceptance checklist

- [ ] All 47 upstream specialist playbooks, references, evaluations, license, and exact source provenance are bundled without upstream executable CLIs.
- [ ] Routing returns a backward-compatible 12-mode result plus an independently selected specialist, reference, confidence, and matched evidence; explicit mode and specialist overrides work.
- [ ] Curated overlap rules distinguish the high-risk neighboring specialties and every catalog entry is reachable.
- [ ] New run vaults persist specialist metadata and direct the operator to both the execution-mode and specialist playbooks without creating a competing product-truth source.
- [ ] Vendored knowledge is excluded only from first-party link assumptions and is instead protected by an exact vendor-specific manifest/frontmatter/hash gate.
- [ ] Existing readiness, performance, packaging, and no-external-action behavior has no unnamed drift.
- [ ] Root skill routing stays progressively disclosed and valid, and the distributable package contains the specialist snapshot.
- [ ] README, Korean README, specification/implementation notes, notice, changelog, release notes, and landing page accurately describe the two-axis 12-mode/47-specialist model and `v0.0.1`.
- [ ] The landing page renders on desktop and mobile with working navigation, theme control, accurate counts, and visible specialist-routing content.
- [ ] A fresh-context agent completes a realistic cross-specialty SuperMarketer task using the integrated skill and reports which playbooks it loaded.
- [ ] `main` contains the verified change, remote CI and GitHub Pages pass, and the live landing reflects the release.
- [ ] Annotated tag and GitHub Release `v0.0.1` exist at the merged `main` commit with release notes.

## Tools & Skills

- Skills: `skill-creator` for progressive disclosure and validation; `supergoal` LEGACY loop; `update-gh-pages` for public-doc synchronization; `gh-release` for tag/publish/verify; browser QA skill for rendered landing proof.
- Upstream source: `/tmp/supermarketer-upstream-LQpbSr/marketingskills` at commit `130847d0945555c43b0b1774e2a4f99d35a32ebe`.
- Trusted commands: `bash tests/run-all.sh`, `npm run check:skill`, `npm pack --dry-run --ignore-scripts`, `node bin/supermarketer.mjs version`, `git diff --check`.
- Release tools: `git`, `gh`, GitHub Actions/Pages, local static server, browser evidence.

## Verification strategy

- Before proof: clean `main`/`origin/main` at `58a5309228957561ec155d68a49a3f3139f52da8`; 42/42 tests and skill checks pass, but specialist requests for pricing, churn, analytics, and prospecting route only to generic `CAMPAIGN`, the SEO audit selects generic `reference/qa.md`, the docs claim 37 tests, and no Git tag or GitHub Release exists.
- Step -> GOAL.md criterion: 1-6 -> criteria 1-7; 7 -> criterion 8; 8-10 -> criteria 6-10; 11 -> criteria 11-12.
- Trusted commands: `bash tests/run-all.sh` (frozen_repo), `npm run check:skill` (frozen_repo), `npm pack --dry-run --ignore-scripts` (frozen_repo), `git diff --check` (evaluator_owned), browser scenarios (evaluator_owned), `gh release view v0.0.1` (evaluator_owned).

## Grounding ledger

- Where does routing live? -> `SKILL.md:34-64`, `lib/router.mjs:3-121`, `lib/cli.mjs:137-156`, `lib/scaffold.mjs:41-125` -> extend results without changing lifecycle modes.
- Why two axes? -> The same specialty can be produced, audited, experimented on, or measured; e.g. `emails + COPY`, `emails + AUDIT`, `ads + MEASURE` -> separate execution intent from domain knowledge.
- Why vendor? -> The skill must work deterministically and offline at the requested exact source commit -> exact snapshot plus hashes and provenance.
- Why not all upstream files? -> 64 tool CLIs can send/mutate/delete remotely and conflict with `SKILL.md:204-212`; duplicate plugin/root contracts would also compete with the host -> vendor knowledge only.
- Why a separate integrity gate? -> `lib/gates/reference-integrity.mjs:23-56` treats fenced/root-relative upstream examples as local package links -> preserve upstream verbatim and verify it through manifest/frontmatter/hash checks.
- Why reset version? -> package/docs claim `1.0.0`, but local/remote tags and GitHub Releases are empty and the user explicitly requested first release `v0.0.1` -> canonicalize the unpublished claim.
- What deploys Pages? -> GitHub Pages reads `main:/docs` and the public URL is `https://cskwork.github.io/supermarketer-skill/` -> push merged docs, verify deployment, then inspect live.
