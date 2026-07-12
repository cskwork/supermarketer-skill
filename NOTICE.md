# Design lineage and third-party notice

SuperMarketer 1.0.0 is a newly written implementation for product marketing and creative-production workflows.

Its architectural design is inspired by:

- `cskwork/supergoal-skill`: thin routing, route-specific references, isolated roles, explicit deliverables, gated verification, and executable tests.
- `cskwork/superdesign-skill`: intent-driven visual production, independent critique, rendered-artifact verification, and explicit no-fake fallback behavior.

No upstream implementation file is vendored in this package. The SuperMarketer code, templates, tests, and documentation were written for this repository. Its verification ground truth is product truth, evidence-linked claims, current channel requirements, asset metadata, rights and generation lineage, independent review, and real post-launch measurement.

Optional system tools such as FFmpeg/ffprobe, Poppler `pdfinfo`, and ImageMagick remain governed by their own licenses and are not bundled here.
