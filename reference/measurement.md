# Post-launch measurement playbook

`MEASURE` requires real post-launch data. Pre-launch prediction belongs in `EXPERIMENT`, not `MEASURE`.

## 1. Preserve the predeclared rule

Before the measurement period begins, store the rule in a vault file and record:

- rule source path and SHA-256;
- declaration timestamp;
- primary metric;
- operator and threshold;
- guardrails;
- intended decision rule;
- whether causal language is planned and, if so, the assignment design.

A rule declared after measurement starts cannot validate performance.

## 2. Validate the source data

Record in `MEASUREMENT.yaml`:

- real post-launch assertion;
- source file path, description, and SHA-256;
- date range and timezone;
- metric definition and denominator;
- attribution or assignment basis;
- exclusions and tracking changes;
- missing, duplicated, or delayed events;
- material data-quality limitations.

Do not use modeled, invented, preview, or synthetic campaign outcomes as real validation evidence.

## 3. Produce reproducible calculation evidence

Create a human-auditable calculation file that explains how the observed value was obtained from the source. Record its path, SHA-256, and calculation method.

The core checks the declared numeric rule and file relationships. It does not contain provider-specific logic for every analytics export, so an independent reviewer must verify the calculation evidence against the source.

## 4. Analyze and interpret

- calculate the primary KPI;
- compare against the predeclared threshold and baseline/control where applicable;
- report absolute and relative differences where useful;
- include uncertainty or explain why a formal interval is unavailable;
- inspect guardrails;
- segment only with sufficient data;
- identify confounders, implementation defects, and tracking changes;
- distinguish description, association, randomized causal effect, and directional learning.

Causal language is permitted only when `randomized: true`, assignment method is documented, and sample size is positive. Even then, domain-specific statistical review may still be necessary.

## 5. Independent measurement review

The analyst and reviewer must be different. The passing `measurement` review must:

- be owned by `validation.reviewed_by`;
- be completed no earlier than the measurement end;
- verify the source, rule, calculation, guardrails, uncertainty, and interpretation;
- record unresolved limitations.

## 6. Validate and re-verify

```bash
supermarketer validate-results <vault>
supermarketer verify-results <vault>
```

`validate-results` writes `Z-VALIDATED.md` only when the declared rule passes. The marker binds the source, predeclared-rule, and calculation-evidence hashes. `verify-results` rejects later changes.

A successful performance validation does not erase limitations and does not retroactively authorize publishing, sending, or spending.
