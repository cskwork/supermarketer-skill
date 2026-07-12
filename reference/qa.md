# Marketing QA and readiness gate

## Review order

1. Scope and requested deliverables.
2. Product truth and claims.
3. Brand, rights, privacy, and disclosures.
4. Current channel specifications.
5. Copy/visual/video creative quality.
6. Accessibility and localization.
7. Artifact metadata and package completeness.
8. Publish approval.
9. Status language.

## Deterministic checks

- files and variants exist,
- paths/IDs resolve,
- dimensions/aspect ratios,
- file type/size,
- video duration/frame rate/audio/container,
- captions,
- URLs/QR,
- copy limits,
- claim IDs,
- source/rights fields,
- required reviews,
- fallback disclosure.

## Independent review

Use concrete findings, not only scores. Every blocking finding must be fixed, accepted as a decision, or recorded as residual risk with readiness reduced.

## Final status

`LAUNCH_READY` requires all pre-launch gates.  
`PERFORMANCE_VALIDATED` requires real post-launch data.

Never mark a production pack as a rendered video or a prompt as an image file.
