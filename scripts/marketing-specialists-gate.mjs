#!/usr/bin/env node
import path from 'node:path';
import process from 'node:process';
import { gateMarketingSpecialists } from '../lib/gates/marketing-specialists.mjs';
import { printGateResult } from './_gate-cli.mjs';

printGateResult(gateMarketingSpecialists(path.resolve(process.argv[2] ?? '.')), process.argv.includes('--json'));
