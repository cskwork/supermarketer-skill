# QA - MarketingSkills integration and v0.0.1 release

All testing results as succinct plain-language checklist sentences. Evidence lives in `qa/`.

- Verdict: USER_ACCEPTED_EXCEPTION

## Before

- [x] `main` and `origin/main` are clean and identical at `58a5309228957561ec155d68a49a3f3139f52da8` - evidence: `git rev-parse main` and `git rev-parse origin/main`
- [x] Existing behavior passes 42/42 Node tests - evidence: `npm test`
- [x] Existing root skill/reference checks pass with zero errors and warnings - evidence: `npm run check:skill`
- [x] Pricing, churn, analytics, and prospecting specialist prompts currently resolve only to generic `CAMPAIGN`; SEO audit resolves only to generic `reference/qa.md` - evidence: pre-change `node bin/supermarketer.mjs route ... --json` outputs
- [x] Public docs claim `v1.0.0` and 37 tests while no tag or GitHub Release exists and the current suite has 42 tests - evidence: repository scan plus GitHub tag/release inspection

## Results

### Iteration 1 auditor

- [x] The auditor reran the full repository floor: 78/78 tests, syntax checks, schema parses, the certified example, and both skill gates pass - evidence: `bash tests/run-all.sh` exit 0.
- [x] The vendor gate passes, the upstream checkout is at `130847d0945555c43b0b1774e2a4f99d35a32ebe`, and recursive skill/license comparisons have no differences - evidence: vendor gate plus `diff -qr`/`diff -q` exits 0.
- [x] Mode and specialty overrides remain independent, and new vaults persist both playbooks without creating `.agents/product-marketing.md` - evidence: 49/49 focused router, CLI, scaffold, reference, and vendor tests pass.
- [x] Root skill validation and dry-run packaging pass at version `0.0.1`; the current package has 457 entries and includes the exact specialist snapshot without upstream executable CLIs - evidence: `npm run check:skill` and isolated-cache `npm pack --dry-run --ignore-scripts --json` exits 0.
- [x] Public English/Korean and release surfaces state `v0.0.1`, 12 modes, 47 specialists, 78 tests, and exact upstream attribution; the scoped public-surface stale scan has no matches - evidence: targeted `rg` exit 1 with no output and captured landing proof.
- [x] The builder-reported `docs/CLI.md` scope extension matches the real CLI: route/new document exact `--specialty`, dual-axis output, persisted metadata, and the vendor-aware skill check - evidence: focused CLI/scaffold tests plus direct route/version commands.
- [x] Desktop browser evidence proves the requested content, six internal anchors, theme persistence, 47 unique specialist labels, and safe external navigation - evidence: `qa/landing-regression.md` and `qa/landing-desktop.png`.
- [x] The iteration-1 cross-funnel misroute was reproduced and then resolved: the exact 90-day plan now selects `marketing-plan` at 0.98 - evidence: `qa/forward-test.md`, `qa/forward-test-iteration-2.md`, and the final direct CLI rerun.
- [x] The iteration-1 mobile overflow was reproduced and then resolved: the 390 px evidence now keeps HTML/body and status content within the viewport - evidence: `qa/landing-regression.md` and `qa/landing-mobile.png`.
- [x] The iteration-1 browser-quality failures were reproduced and then resolved: heading levels no longer skip, the inline favicon causes no failed request, and all 35 contrast pairs pass unchanged thresholds - evidence: `qa/a11y-desktop.md`, `qa/landing-regression.md`, and `qa/contrast-pairs.json`.
- [x] Merge, remote CI/Pages, live release inspection, annotated tag, and GitHub Release remain correctly unattempted before commit and remain mandatory post-commit delivery gates under approved PLAN step 11.

### Iteration 2 builder

- [x] Iteration 2 builder proof passes 83/83 tests, both skill checks, quick validation, and diff hygiene after adding one routing and four landing regression tests.
- [x] The exact 90-day B2B SaaS prompt now selects `marketing-plan`; static landing contracts cover 390 px shrink/wrap, non-skipping headings, an inline favicon, and the 10 recorded contrast failures without changing thresholds.
- [x] Fresh browser evidence passes 38/38 Playwright assertions at `1440x1000` and `390x844`; the regenerated contrast capture passes 35/35 unchanged thresholds - evidence: `qa/landing-regression.md`, screenshots, `qa/a11y-desktop.md`, and `qa/contrast-pairs.json`.

### Iteration 2 auditor

- [x] The auditor reran the real full floor: 83/83 tests, both skill gates, syntax checks, schema parses, and the certified example pass - evidence: `bash tests/run-all.sh` exit 0.
- [x] The impacted route, CLI, landing, scaffold, first-party reference, and vendor test floor passes 54/54; quick validation and `git diff --check` also pass.
- [x] The exact 90-day CLI task returns `CAMPAIGN + marketing-plan` with specialist confidence `0.98`; the fresh-context artifact loads the matching mode and specialist playbooks and performs no external action - evidence: `qa/forward-test-iteration-2.md` plus direct CLI output.
- [x] The checked-in vendor tree is byte-exact against upstream commit `130847d0945555c43b0b1774e2a4f99d35a32ebe`: recursive `skills/**` and `LICENSE` comparisons have no differences, with 47 playbooks, 145 references, 45 evaluations, one asset, and 239 manifest-listed files.
- [x] The isolated-cache package dry run passes at version `0.0.1` with 460 entries, and the artifact-only browser gate passes 35/35 contrast pairs plus the required Playwright/as-is/to-be checks.
- [x] The iteration-2 coordinated manifest bypasses were reproduced and then resolved: provenance edits, omission-plus-manifest edits, and content-plus-updated-hash edits are rejected by the first-party lock - evidence: final focused vendor tests and independent upstream/digest comparison.
- [x] The iteration-2 stale Korean test count was corrected: `README.ko.md` and the other public surfaces report 83 tests, and the scoped stale scan has no match.
- [x] Decision gate d4 is resolved: the user replied "yes" at `2026-07-15T22:39:04Z`, and the PLAN amendment keeps every local check pre-commit while retaining remote CI/Pages/live/tag/release as mandatory post-commit step-11 gates.

### Iteration 3 builder

- [x] RED reproduced all three coordinated manifest bypasses: provenance edits, a removed reference plus matching manifest/count edits, and rewritten content plus its updated manifest hash were each incorrectly accepted before the fix - evidence: focused `node --test tests/marketing-specialists-gate.test.mjs` exited 1 with all three new assertions failing on `true !== false`.
- [x] GREEN pins the approved snapshot outside `vendor/` with one first-party lock containing the exact source URL, canonical origin, commit, five counts, and manifest SHA-256 `2c21b02999bbf48fe2249cb29565ac5b1350b1700b6e20e2252e2c2e548a522d`; direct tampering and all three coordinated attacks now fail while the checked-in snapshot passes - evidence: focused vendor gate tests pass 2/2.
- [x] The full local floor remains 83/83 after consolidating all three adversarial probes into the existing tampering contract; both skill gates, syntax, schema, and the certified example pass - evidence: `bash tests/run-all.sh` exit 0.
- [x] The final isolated-cache package dry run passes at `0.0.1` with 461 entries; `npm run check:skill`, `quick_validate.py`, and `git diff --check` also exit 0.
- [x] The vendored bytes remain exact: upstream HEAD is `130847d0945555c43b0b1774e2a4f99d35a32ebe`, both recursive skill and license diffs exit 0, and counts remain 47 playbooks, 145 references, 45 evaluations, one asset, and 239 manifest files.
- [x] `README.ko.md` now reports 83 automated contract tests, matching the preserved public 83-test count; the scoped stale scan finds no `78`, `37`, or `v1.0.0` release claim.

### Iteration 3 auditor

- [x] The independent full repository floor passes 83/83 tests, both skill gates, syntax checks, schema parses, and the certified example - evidence: `bash tests/run-all.sh` exit 0.
- [x] Criterion 5 is independently proven: the exact first-party/vendor focused floor passes 5/5, and separate temporary-copy probes reject provenance edits, an omitted reference plus rewritten manifest/counts, and rewritten content plus its updated manifest hash. The three coordinated cases return `ok: false` with `VENDOR_MANIFEST_DIGEST`; provenance also returns `VENDOR_SOURCE_URL`/`VENDOR_CANONICAL_ORIGIN`, and omission also returns `VENDOR_MANIFEST_COUNT`.
- [x] The first-party lock matches the checked-in snapshot: manifest SHA-256 `2c21b02999bbf48fe2249cb29565ac5b1350b1700b6e20e2252e2c2e548a522d`, source URL/origin/commit, five declared counts, and 239 manifest entries all match.
- [x] Exact upstream proof is green: upstream HEAD is `130847d0945555c43b0b1774e2a4f99d35a32ebe`, origin is `https://github.com/cskwork/marketingskills.git`, status is clean, recursive `skills/**` and `LICENSE` diffs are empty, and both trees contain 47 playbooks, 145 references, 45 evaluations, one asset, and 239 included files.
- [x] Criterion 8 is independently proven: the scoped public/release scan, including `README.ko.md`, finds no `v1.0.0`, 37-test, or 78-test claim; the Korean README reports 83 tests and the canonical package/CLI/docs version is `0.0.1`.
- [x] `npm run check:skill` passes all three gates; isolated-cache `npm pack --dry-run --ignore-scripts --json` exits 0 at `0.0.1` with 461 entries and reruns 83/83; `quick_validate.py` reports `Skill is valid!`; `git diff --check` exits 0.
- [x] The exact 90-day CLI route returns `CAMPAIGN + marketing-plan`, specialty confidence `0.98`, matched evidence `90-day marketing plan`, and the expected two playbook paths. The artifact-only browser QA gate exits 0 with 35/35 contrast pairs and required Playwright/as-is/to-be evidence.
- [x] Packaging and verification left no `.tgz`, `.zip`, or SHA-256 sidecar in the worktree. All 293 changed/untracked files map to approved scope: 240 vendor snapshot, 14 runtime/schema/template/package, 3 gate/root specialist references, 8 tests, 9 public/release docs, 17 run-vault/evidence files, and 2 required decision logs; unmatched files: zero.
- [x] The release-sequencing decision is resolved by the approved PLAN amendment; all local criteria remain green, and the commit-dependent remote delivery contract remains mandatory and explicitly not yet proven.

### Final commit-gate auditor after approval

- [x] `bash tests/run-all.sh` passes 83/83 tests plus specialist integrity, syntax, schema, and certified-example checks.
- [x] `npm run check:skill` passes reference integrity, root frontmatter, and the MarketingSkills snapshot gate; the focused reference/vendor floor passes 5/5.
- [x] The exact 90-day CLI route returns `CAMPAIGN + marketing-plan` at 0.98 with matched evidence `90-day marketing plan`; the artifact-only browser gate passes 35/35 contrast pairs and required Playwright evidence.
- [x] The isolated-cache package dry run passes at `0.0.1` with 461 entries; `quick_validate.py` reports `Skill is valid!`; `git diff --check` is clean.
- [x] Upstream HEAD/origin/status, recursive skill/license comparison, 47/145/45/1/239 counts, and manifest digest are exact; no generated package/ZIP/SHA sidecar remains.
- [x] Final exact porcelain scope reconciliation maps all 293 changed/untracked files to approved scope: 240 vendor snapshot, 14 runtime/schema/template/package, 3 gate/root specialist references, 8 tests, 9 public/release docs, 17 run-vault/evidence files, and 2 decision logs; unmatched files: zero.
- [ ] The literal commit gate is blocked by the current browser-driver provenance rule: `QA-GATE FAIL: playwright-cli is fallback-only - add 'Fallback:' with why agent-browser could not complete reliable QA`. The existing evidence records no agent-browser attempt or failure, so a fallback reason cannot be asserted from current artifacts.

### User-accepted commit exception

- [x] At 2026-07-15T22:49:05Z the user explicitly instructed "no its ok just commit push" after the changed browser-driver backstop was reported.
- [x] The accepted gap is provenance of the browser driver under the newly changed external gate, not rendered behavior: the existing run remains 38/38 green, contrast remains 35/35, and the full repository floor remains 83/83.
- [x] The literal current commit gate did not pass and is not reported as passed. Tag and GitHub Release creation are outside the narrowed commit/push step.

Backward-trace: clean

- Trace detail: `routeSpecialty`/catalog -> `routeObjective` -> CLI and scaffold consumers; vendor manifest -> first-party lock -> specialist gate -> `check:skill` and full suite; version/schema/templates -> CLI/scaffold/package tests; public docs and the `docs/CLI.md` scope extension -> direct CLI, stale-copy, package, and browser evidence. No final diff hunk is orphaned.

## Commands

| Command | Source | Proves |
|---|---|---|
| `npm test` | frozen_repo | Existing 42-test behavior before integration |
| `npm run check:skill` | frozen_repo | Existing root skill/reference integrity |
| `bash tests/run-all.sh` | frozen_repo | Full post-change contract, syntax, JSON, and example verification |
| `npm pack --dry-run --ignore-scripts` | frozen_repo | Distribution includes only intended files |
| `git diff --check` | evaluator_owned | Patch hygiene |
| browser desktop/mobile scenarios | evaluator_owned | Rendered landing behavior |
| `gh release view v0.0.1` | evaluator_owned | Published release exists at the merged commit |
| `node --test tests/specialist-router.test.mjs tests/router.test.mjs` | agent_detected | All 47 specialties, curated boundaries, fallback, and two-axis independence |
| `node --test tests/marketing-specialists-gate.test.mjs tests/reference-integrity.test.mjs` | agent_detected | Vendor tampering fails while first-party link assumptions remain strict |
| `node --test tests/cli.test.mjs tests/scaffold.test.mjs` | agent_detected | Exact CLI overrides and persisted dual-playbook run metadata |
| `node scripts/marketing-specialists-gate.mjs .` | agent_detected | Source commit, 47 names, frontmatter, required playbooks, and 239 hashes |
| `bash tests/run-all.sh` | agent_detected | Full 78-test suite, skill gates, syntax, JSON, and certified example |
| `npm run check:skill` | agent_detected | Root progressive disclosure, first-party references, and vendor integrity |
| `npm_config_cache=/tmp/supermarketer-npm-cache npm pack --dry-run --ignore-scripts --json` | agent_detected | Distributable version, files, vendor snapshot, and packaging preflight |
| `node bin/supermarketer.mjs version` | agent_detected | Canonical CLI version is `0.0.1` |
| `rg -n 'v0\.0\.1|47 marketing specialists|78 tests' docs/index.html README.md README.ko.md NOTICE.md RELEASE-NOTES.md` | agent_detected | Public release/count/specialist claims are present on intended surfaces |
| `git diff --check` | agent_detected | Patch whitespace and conflict-marker hygiene |
| `/opt/anaconda3/bin/python ~/.agents/skills/.system/skill-creator/scripts/quick_validate.py .` | agent_detected | Skill frontmatter and structure validate under the skill-creator contract |
| `node --test tests/router.test.mjs tests/cli.test.mjs tests/specialist-router.test.mjs tests/scaffold.test.mjs tests/reference-integrity.test.mjs tests/marketing-specialists-gate.test.mjs` | evaluator_owned | Impacted code floor: 49/49 pass |
| exact 90-day forward-test `node bin/supermarketer.mjs route ... --json` | evaluator_owned | Reproduces the `onboarding` misroute with contradictory specialty scores |
| `bash ~/Documents/PARA/Resource/supergoal-skill/templates/qa-gate.sh docs/changelog/2026-07/15-marketingskills-integration browser` | evaluator_owned | Artifact-only browser gate exits 1 because 10/35 contrast pairs fail |
| `git -C /tmp/supermarketer-upstream-LQpbSr/marketingskills rev-parse HEAD` plus recursive `diff` | evaluator_owned | Exact vendored skill and license content matches the approved upstream commit |
| public-surface stale scan excluding `docs/changelog/**` | evaluator_owned | No stale `v1.0.0` or 37-test claim on release surfaces; the approved broad scan only finds historical run-vault evidence |
| `node --test --test-name-pattern="cross-funnel 90-day plans" tests/specialist-router.test.mjs` | agent_detected | Exact cross-funnel prompt selects `marketing-plan` while the full focused suite preserves onboarding-only routing |
| `node --test --test-name-pattern="status cards remain shrinkable" tests/landing.test.mjs` | agent_detected | Honesty cards can shrink and long content wraps at the 390 px contract boundary |
| `node --test --test-name-pattern="landing headings do not skip levels" tests/landing.test.mjs` | agent_detected | Workflow and Status use a non-skipping document outline |
| `node --test --test-name-pattern="valid inline favicon" tests/landing.test.mjs` | agent_detected | The landing declares a valid inline SVG favicon and needs no `/favicon.ico` request |
| `node --test --test-name-pattern="ten recorded dark and light palette failures" tests/landing.test.mjs` | agent_detected | The adjusted dark/light element colors pass the existing WCAG thresholds for all 10 recorded failures |
| `node --test tests/specialist-router.test.mjs tests/landing.test.mjs` | agent_detected | Combined iteration-2 focused floor passes 33/33 |
| exact 90-day `node bin/supermarketer.mjs route ... --json` rerun | agent_detected | CLI returns `marketing-plan` at 0.98 with matched evidence `90-day marketing plan` |
| `bash tests/run-all.sh` | agent_detected | Full iteration-2 floor passes 83/83 plus skill, vendor, syntax, schema, and certified-example checks |
| `npm run check:skill` | agent_detected | First-party references, root frontmatter, and vendor integrity remain green after iteration 2 |
| `/opt/anaconda3/bin/python ~/.agents/skills/.system/skill-creator/scripts/quick_validate.py .` | agent_detected | Skill structure and frontmatter remain valid after iteration 2 |
| `git diff --check` | agent_detected | Iteration-2 patch has no whitespace errors |
| `bash ~/Documents/PARA/Resource/supergoal-skill/templates/qa-gate.sh docs/changelog/2026-07/15-marketingskills-integration browser` | evaluator_owned | Iteration-2 artifact-only browser gate exits 0; 35/35 contrast pairs, Playwright driver declaration, and as-is/to-be evidence pass |
| `npm_config_cache=/tmp/supermarketer-auditor2-npm-cache-oPUdLh npm pack --dry-run --ignore-scripts --json` | evaluator_owned | Isolated-cache package preflight exits 0 at `0.0.1` with 460 entries and reruns 83/83 tests |
| temporary-copy coordinated manifest/provenance/omission/content tamper probe | evaluator_owned | Disproves the claimed exact vendor protection: all three tampered snapshots incorrectly return `ok: true` |
| `rg -n -i "v?1\\.0\\.0|37 (automated |contract |)tests|37개|78 (automated |contract |)tests|78개|78 tests" README.md README.ko.md SPEC.md NOTICE.md CHANGELOG.md RELEASE-NOTES.md docs/index.html docs/CLI.md docs/IMPLEMENTATION.md package.json package-lock.json lib` | evaluator_owned | Finds one stale public count at `README.ko.md:26` |
| `node --test tests/marketing-specialists-gate.test.mjs` | agent_detected | The exact approved snapshot passes while direct tampering and coordinated provenance, omission, and content-plus-hash rewrites fail |
| `bash tests/run-all.sh` | agent_detected | Final iteration-3 floor passes 83/83 plus both skill gates, syntax, schema, and certified-example checks |
| `npm run check:skill` | agent_detected | First-party references, root frontmatter, and the independently pinned vendor snapshot remain green |
| `npm_config_cache=/tmp/supermarketer-builder3-final-npm-cache npm pack --dry-run --ignore-scripts --json` | agent_detected | Isolated-cache package preflight passes at `0.0.1` with 461 entries |
| `/opt/anaconda3/bin/python ~/.agents/skills/.system/skill-creator/scripts/quick_validate.py .` | agent_detected | Skill structure and frontmatter remain valid after the integrity fix |
| `git -C /tmp/supermarketer-upstream-LQpbSr/marketingskills rev-parse HEAD` plus recursive `diff` and snapshot count/digest probe | agent_detected | Vendor bytes match exact commit `130847d0945555c43b0b1774e2a4f99d35a32ebe`, with 47/145/45/1/239 counts and the pinned manifest digest |
| `git diff --check` | agent_detected | Final iteration-3 patch has no whitespace errors |
| `rg -n -i "v?1\\.0\\.0|37 (automated |contract |)tests|37개|78 (automated |contract |)tests|78개|78 tests|테스트 78개" README.md README.ko.md SPEC.md NOTICE.md CHANGELOG.md RELEASE-NOTES.md docs/index.html docs/CLI.md docs/IMPLEMENTATION.md package.json package-lock.json lib` | agent_detected | Scoped public surfaces contain no stale version or test-count claim |
| `bash tests/run-all.sh` | evaluator_owned | Final iteration-3 local floor passes 83/83 plus both skill gates, syntax, schema, and certified-example checks |
| `node --test tests/reference-integrity.test.mjs tests/marketing-specialists-gate.test.mjs` | evaluator_owned | First-party reference delegation remains strict and exact vendor/tamper protection passes 5/5 |
| independent temporary-copy provenance, omission-plus-manifest, and content-plus-updated-hash probes | evaluator_owned | All coordinated manifest attacks are rejected by the first-party lock; none returns `ok: true` |
| `npm run check:skill`; isolated-cache `npm pack --dry-run --ignore-scripts --json`; `quick_validate.py` | evaluator_owned | All gates pass, package preflight is `0.0.1` with 461 entries, and the skill is structurally valid |
| exact upstream HEAD/origin/status, recursive `skills/**` and `LICENSE` diff, count, and manifest-digest probe | evaluator_owned | Clean exact source commit; no byte drift; 47/145/45/1/239 counts; pinned manifest digest matches |
| scoped stale version/count scan including `README.ko.md` | evaluator_owned | No public `v1.0.0`, 37-test, or 78-test claim remains; current surfaces report `0.0.1` and 83 tests |
| exact 90-day CLI route; artifact-only browser `qa-gate.sh`; `git diff --check` | evaluator_owned | `CAMPAIGN + marketing-plan` at 0.98, browser gate 35/35, and clean patch hygiene |
| worktree artifact scan and exact porcelain-status scope classification | evaluator_owned | No generated package/sidecar artifact; 293/293 changed or untracked files map to approved scope |

## QA

Tool: playwright-cli
UI-tier: Expressive
DB: not used
- Served URL: `http://127.0.0.1:8765/?qa=20260716-iteration2`; static server is torn down after capture.
- Evidence: `qa/to-be-desktop.png`, `qa/to-be-mobile.png`, `qa/landing-desktop.png`, `qa/landing-mobile.png`, `qa/a11y-desktop.md`, `qa/contrast-pairs.json`, and `qa/landing-regression.md`.
- [x] Browser scenario result: 38 passed, 0 failed at `1440x1000` and `390x844`.
- [x] Rendered counts/copy: `v0.0.1`; 12 modes plus one labeled non-mode through-line; exact 47-label catalog; 83-test text in status, detail, and footer; no stale 78/37/v1.0.0 text.
- [x] Navigation/theme: six internal hashes matched; dark-to-light background changed and `sm-theme=light` survived reload.
- [x] External links: nine anchors were safe; six unique destinations returned HTTP 200, opened/closed expected tabs, and left one main tab.
- [x] Structure/input: one H1, 27 headings, zero level skips, 17/17 visible controls traversed in DOM order, non-zero focus outlines, and no focus trap.
- [x] Responsive/motion: HTML/body measured `390/390px`; both status cards and specialist panel measured `342px` inside `24..366px`; reduced motion produced `0s` transitions, no animation, and zero hidden reveal elements.
- [x] Side effects: zero console errors, uncaught JavaScript errors, failed requests, HTTP 4xx/5xx, dialogs, unexpected tabs/popups, or favicon requests/errors.
- [x] Contrast: 35/35 settled computed pairs pass unchanged thresholds; lowest body ratio `7.06:1`, lowest normal ratio `5.03:1`.
- SuperQA replay report: not produced because doctor could not write `/Users/<user>/.superqa/.doctor-touch` in the sandbox; the required Playwright evidence completed.

## Reproduction Fidelity

- Fidelity level: exact
- Exact scope: local Playwright Chromium page at the recorded fixed desktop and mobile viewports.
- Screenshots: desktop landing/to-be SHA-256 `f063d464dd42c2ed5d843ae4273bced956d11f58ddc1b2281e59d5da291dc537`; mobile landing/to-be SHA-256 `331b79fd3fd0482a80f3d026a8af3ae32dc193a797f6f879888b27ba5278e2cc`.

## Residual Risk

- Mandatory post-commit proof remains not proven: merge to and push of `main`, remote CI, deployed GitHub Pages/cache behavior, live landing inspection, annotated tag, and GitHub Release. PLAN step 11 requires all of it after the release-candidate commit exists.
- Residual local browser scope: screen-reader announcement quality and non-Chromium browsers were not exercised.
- No local rendered, routing, forward-test, first-party integrity, public-copy, packaging, checked-in vendor-byte, artifact-hygiene, or scope-reconciliation mismatch remains after the fresh final audit.
- Blocking proof gap: the current `qa-gate.sh` changed during final verification from requiring playwright-cli to preferring agent-browser and requiring a concrete fallback reason. A fresh evidence-only browser QA pass must use agent-browser, or genuinely record why it could not complete reliable QA, before the auditor may restore PASS.
- Accepted delivery decision: the user chose commit/push with that provenance gap recorded. This does not weaken or erase the completed Playwright behavior evidence.
