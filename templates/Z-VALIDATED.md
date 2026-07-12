# Performance Validation Record

> Generated only by `supermarketer validate-results`; do not author this record manually.

- Run ID: `<run-id>`
- Validated at: `<ISO-8601>`
- Data source: `MEASUREMENT.yaml` and its referenced source file
- Source SHA-256: `<64-hex-digest>`
- Rule source SHA-256: `<64-hex-digest>`
- Calculation evidence SHA-256: `<64-hex-digest>`
- Predeclared rule: `<metric> <operator> <threshold>`
- Observed: `<number>`
- Uncertainty: `<limitations>`
- Performance: `PERFORMANCE_VALIDATED`
- Decision: `<SCALE|ITERATE|STOP|MORE_DATA>`
- Causal claim allowed: `<YES|NO>`

This record means the declared machine-checkable rule passed on a referenced real post-launch dataset and that the current source, predeclared-rule, and calculation-evidence hashes match. It does not remove the limitations in `MEASUREMENT.yaml`, prove reviewer identity, or establish causality unless the required design evidence is present.
