#!/usr/bin/env node
import process from 'node:process';
import { auditInstall } from '../lib/install-audit.mjs';
const args = process.argv.slice(2).filter((arg) => arg !== '--json');
const result = auditInstall(args[0] ?? '.', args.slice(1));
console.log(JSON.stringify(result, null, 2));
process.exitCode = result.results.some((entry) => entry.status === 'drifted') ? 1 : 0;
