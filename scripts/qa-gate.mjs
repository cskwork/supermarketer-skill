#!/usr/bin/env node
import { gateQa } from '../lib/gates/qa.mjs';
import { runGate } from './_gate-cli.mjs';
await runGate(gateQa);
