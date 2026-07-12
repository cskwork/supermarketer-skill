#!/usr/bin/env node
import process from 'node:process';
import { gateReferenceIntegrity } from '../lib/gates/reference-integrity.mjs';
import { printGateResult } from './_gate-cli.mjs';
const root = process.argv[2] ?? '.';
printGateResult(gateReferenceIntegrity(root), process.argv.includes('--json'));
