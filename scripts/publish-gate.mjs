#!/usr/bin/env node
import { gatePublish } from '../lib/gates/publish.mjs';
import { parseGateArgs, printGateResult } from './_gate-cli.mjs';
const { positional, options } = parseGateArgs();
if (!positional[0]) throw new Error('A run vault path is required.');
const result = gatePublish(positional[0], options);
printGateResult(result, options.json);
