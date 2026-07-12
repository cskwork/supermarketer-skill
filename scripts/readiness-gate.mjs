#!/usr/bin/env node
import { runReadinessGates } from '../lib/gates/aggregate.mjs';
import { parseGateArgs, printGateResult } from './_gate-cli.mjs';
const { positional, options } = parseGateArgs();
if (!positional[0]) throw new Error('A run vault path is required.');
const report = runReadinessGates(positional[0], options);
printGateResult({ gate: 'launch-readiness', ok: report.ok, errors: report.errors, warnings: report.warnings, checks: [], metadata: report.summary }, options.json);
