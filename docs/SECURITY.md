# Security, privacy, integrity, and external-action model

## Threat model

Marketing workflows may contain confidential product plans, proprietary assets, customer evidence, third-party intellectual property, public publishing accounts, recipient lists, and paid-media budgets. SuperMarketer assumes generated content and tool output may be wrong and that a run vault may contain unsafe paths, misleading status records, or files changed after review.

The core addresses local consistency and authorization boundaries. It is not a sandbox, malware scanner, identity provider, digital-signature system, or universal analytics engine.

## Implemented controls

### Path containment and symlink rejection

Governed paths are checked lexically and after `realpath` resolution. The following fail:

- absolute paths;
- `..` traversal outside the vault;
- required-file or required-directory symlinks;
- manifest, QA, production-pack, and measurement paths containing symlinks;
- ingested destination symlinks;
- paths whose resolved target escapes the vault.

Package output must be outside the vault to prevent recursive inclusion.

### Readiness integrity linkage

`ready` writes a final passing gate report with a canonical file-integrity manifest, computes its SHA-256, and records that digest in `Z-READY.md`.

`verify-ready`, packaging, publish permits, and measurement verify:

- marker syntax and run ID;
- readiness state;
- report path, schema, status, timestamp, and complete 12-gate set;
- exact report SHA-256;
- every certified file's canonical hash;
- missing, changed, symlinked, and newly added files.

Post-launch evidence additions are accepted only for the exact source, predeclared-rule, and calculation-evidence paths governed by the measurement contract.

### Performance integrity linkage

`validate-results` requires real source data, a predeclared rule, calculation evidence, matching hashes, a passing numeric rule, guardrails, limitations, and independent review. `Z-VALIDATED.md` records source, rule, and calculation digests. `verify-results` re-runs the measurement gate and rejects later changes.

### No autonomous external action

The CLI implements no publishing, sending, scheduling, deploying, bidding, or spending. `publish-check` validates one exact human approval and writes a local permit fingerprint only. A separate external system must still authenticate the user, authorize the account, reconfirm risky actions, apply rate limits, and preserve an audit trail.

### Explicit approval integrity

A publish approval must:

- use `recorded_from: user_explicit`;
- preserve the user's approval quote;
- name a human approver;
- be approved and unexpired;
- list exact asset IDs and actions;
- name destination, account, and timing;
- specify recipient scope for sends;
- specify currency and maximum budget for spend.

Assistant-inferred, generic, expired, or self-owned approvals fail.

### Rights, privacy, and data minimization

Assets record source, ownership/license, allowed use, territory/expiry where relevant, likeness or release status, and generated-asset lineage. Pending or restricted rights block readiness.

Do not put API keys, OAuth tokens, customer lists, private conversations, unreleased screenshots, confidential roadmaps, or regulated personal data in ordinary run records. Give external media tools only the minimum source material authorized for the exact purpose.

### Untrusted media

Image parsing reads bounded header data. Video inspection invokes `ffprobe` with fixed arguments and no shell interpolation. The core does not execute macros or embedded scripts. Deployment environments should still scan untrusted media and PDFs using their own security controls.

## Important limitations

### Hashes are not signatures

The local SHA-256 relationships detect accidental edits and unsynchronized tampering. They do not prove who created or approved a file. A party with write access to the entire vault can modify content and recompute local markers and reports.

For adversarial authenticity, signer identity, and non-repudiation, use one or more of:

- a signed release artifact;
- immutable or write-once storage;
- protected version-control history;
- a trusted timestamp service;
- an external key-management and signing workflow.

### Reviews are records, not identity proof

Producer/reviewer separation is enforced from recorded identities. The core cannot independently authenticate that two strings correspond to two real people. Integrations requiring strong segregation of duties should bind reviewer identities to an external identity and approval system.

### Measurement inputs are traced, not universally recomputed

The core validates the declared numeric rule, source/rule/calculation hashes, dates, reviewer separation, and causal prerequisites. It does not understand every provider export well enough to independently recompute arbitrary KPIs. The calculation-evidence file and independent reviewer remain required controls.

### No malware or content-safety scanner

The package verifies structure, metadata, claims, rights records, and workflow state. It does not replace antivirus, DLP, legal review, platform moderation, or specialist review for regulated marketing.

## Operational recommendations

- Keep the canonical skill checkout read-only for production agents.
- Run `install-audit` to detect drifted copies.
- Store run vaults in access-controlled project directories.
- Use version control or immutable storage for certified vaults and delivery packages.
- Sign release archives when recipients need authenticity assurance.
- Revoke or expire publish approvals quickly.
- Create a new run or recertify after any pre-launch asset, copy, claim, channel rule, rights, or review change.
- Keep sensitive measurement exports out of public delivery packages and apply the organization's data-retention policy.
