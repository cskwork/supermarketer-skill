#!/usr/bin/env node
import { gatePackage } from '../lib/package-run.mjs';
import { parseGateArgs, printGateResult } from './_gate-cli.mjs';
const { positional, options } = parseGateArgs();
if (!positional[0]) throw new Error('A run vault path is required.');
const report = gatePackage(positional[0], options);
printGateResult({ gate: 'package', ok: report.ok, errors: report.errors, warnings: report.warnings, checks: [], metadata: {} }, options.json);
