# supermarketer-skill starter

A starter specification for an evidence-grounded product-marketing and creative-production agent skill.

## What this package contains

- `SPEC.md` — complete functional and operational specification.
- `SKILL.md` — a usable thin router draft.
- `agents/` — role contracts.
- `reference/` — on-demand playbooks.
- `templates/` — run-vault templates.
- `tests/` — acceptance and scenario contracts.

## Core distinction

This skill can verify **launch readiness** before publication. It cannot verify actual marketing effectiveness without real post-launch data.

Every final report should state:

```text
Readiness: LAUNCH_READY | REVIEW_READY | BLOCKED
Performance: NOT_MEASURED | MEASURING | PERFORMANCE_VALIDATED
```

## Recommended implementation order

1. Claims/evidence/manifest/channel-spec gates.
2. Copy and static creative workflows.
3. Image generation/editing adapters.
4. Video production-pack workflow, then optional render adapters.
5. Experiment and analytics connectors.
6. External publishing adapters behind explicit approval.

## Installation concept

Place the repository where the target agent runtime discovers skills and invoke:

```text
/supermarketer <one marketing objective>
```

The exact install path depends on the runtime. Keep one canonical checkout and link/copy it into each agent's skills directory.

## Important

This package is a specification and starter scaffold. It does not claim that every listed deterministic gate or external media adapter is already implemented.
