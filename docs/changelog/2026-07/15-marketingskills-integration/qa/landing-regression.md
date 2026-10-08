# Landing regression evidence - iteration 2

Tool: playwright-cli 0.1.15
Mode: REGRESSION
Local URL: `http://127.0.0.1:8765/?qa=20260716-iteration2`
Viewports: `1440x1000`, `390x844`
Result: 38 passed, 0 failed

## Observed passes

- Release copy: hero shows `v0.0.1`, 12 execution modes, and 47 specialist playbooks. Status, detail, and footer show 83 tests; stale 78-test, 37-test, and `v1.0.0` copy is absent.
- Specialist catalog: 47 rendered, 47 unique, zero missing, zero extra, zero duplicates against the expected routed catalog.
- Internal navigation: `#top`, `#modes`, `#specialists`, `#loop`, `#structure`, and `#status` each changed `location.hash` to the expected value.
- Theme: dark `rgb(10, 11, 13)` changed to light `rgb(250, 250, 247)`; `sm-theme=light` and the light theme remained after reload.
- External navigation: all nine anchors have `target="_blank" rel="noopener"`; the six unique GitHub destinations each returned HTTP 200, opened the expected tab, closed cleanly, and left one main tab.
- Document structure: one H1, 27 headings, no skipped heading level, zero unnamed links, and zero unnamed buttons.
- Keyboard: all 17 visible controls were reached once in DOM order; every focused control exposed a non-zero browser focus outline; no focus trap occurred.
- Reduced motion: the media query matched, transition duration was `0s`, animation was `none`, scroll behavior was `auto`, and all 39 reveal elements remained visible.
- Mobile containment: HTML/body `scrollWidth=390` and `clientWidth=390`. Both status cards measured `342px` inside `24..366px`; the specialist panel measured `342px` inside the same bounds; all 47 labels remained rendered.
- Mobile reading: the two-axis example measured `286px` inside `52..338px`, with `16px` text and `26.4px` line height.
- Side effects: zero console errors, uncaught JavaScript errors, failed requests, HTTP 4xx/5xx responses, dialogs, or unexpected tabs/popups. The inline SVG favicon caused no `/favicon.ico` request or console/resource error.
- Contrast: 35 settled computed dark/light foreground-background pairs passed the unchanged configured thresholds: body `7:1`, normal `4.5:1`, large `3:1`. The lowest body ratio was `7.06:1`; the lowest normal ratio was `5.03:1`.
- Artifact-only QA gate: exit `0`; contrast, Playwright driver declaration, and as-is/to-be evidence checks passed.

## Observed failures

- None in the local rendered regression.

## Evidence files

- `landing-desktop.png` and `to-be-desktop.png` - identical SHA-256 `f063d464dd42c2ed5d843ae4273bced956d11f58ddc1b2281e59d5da291dc537`
- `landing-mobile.png` and `to-be-mobile.png` - identical SHA-256 `331b79fd3fd0482a80f3d026a8af3ae32dc193a797f6f879888b27ba5278e2cc`
- `a11y-desktop.md`
- `contrast-pairs.json`
- `landing-regression.spec.js` - iteration-1 reusable scenario source; not modified. Iteration-2 execution changed only the stale 78-test assertion in a temporary copy outside the repository and added keyboard/reduced-motion coverage.

## Residual risk

- Not tested: remote CI, deployed GitHub Pages, cache behavior after deployment, release/tag state, screen-reader announcement quality, and browsers other than Playwright Chromium.
- SuperQA deterministic replay/report: unavailable. Doctor passed runtime/browser checks but could not write `/Users/<user>/.superqa/.doctor-touch` under the sandbox. Per the task constraint, this optional path did not replace or block the required Playwright proof.
