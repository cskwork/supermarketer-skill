# Workflow contract

Use this playbook for `CAMPAIGN`, `COPY`, `STATIC`, `IMAGE`, `VIDEO`, and `LAUNCH-KIT`.

## Vault

Create `.supermarketer/runs/<YYYYMMDD-HHMM>-<slug>/` and initialize from `templates/`.

## Required sequence

1. **Frame:** `BRIEF.md` first.
2. **Ground:** product truth, `EVIDENCE.md`, `CHANNEL-SPECS.yaml`, `CLAIMS.yaml`.
3. **Strategize:** minimum positioning/message/creative brief.
4. **Produce:** specialist roles; every asset in manifest.
5. **Improve:** full brief plus edge cases.
6. **Adversarial review:** separate brand/claims and creative reviewers.
7. **QA:** deterministic metadata/trace/package checks.
8. **Ready:** write `Z-READY.md` only when all criteria are proven.
9. **Publish:** separate explicit approval.
10. **Measure:** real data only.

## Iteration

Unmet criteria go into a new dated section in `QA.md` or an optional `R-LOOP.md`. Re-dispatch only the smallest role needed. Preserve fixed strengths and do not broaden scope.

## Final status

Always report:

```text
Readiness: LAUNCH_READY | REVIEW_READY | BLOCKED
Performance: NOT_MEASURED | MEASURING | PERFORMANCE_VALIDATED
```
