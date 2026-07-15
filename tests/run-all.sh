#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
node --version
node --test tests/*.test.mjs
node bin/supermarketer.mjs check-skill .
node scripts/marketing-specialists-gate.mjs .
for file in $(find bin lib scripts tests -type f -name '*.mjs' -print); do node --check "$file" >/dev/null; done
for file in package.json templates/run-state.json schemas/*.json; do node -e 'JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8"))' "$file"; done
node bin/supermarketer.mjs verify-ready examples/complete-copy-run --json >/dev/null
printf 'All SuperMarketer tests, specialist integrity, schema parses, example attestation, and syntax checks passed.\n'
