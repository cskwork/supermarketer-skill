#!/usr/bin/env node
import { gateProductionPacks } from '../lib/gates/production-pack.mjs';
import { runGate } from './_gate-cli.mjs';
await runGate(gateProductionPacks);
