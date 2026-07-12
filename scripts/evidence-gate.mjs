#!/usr/bin/env node
import { gateEvidence } from '../lib/gates/evidence.mjs';
import { runGate } from './_gate-cli.mjs';
await runGate(gateEvidence);
