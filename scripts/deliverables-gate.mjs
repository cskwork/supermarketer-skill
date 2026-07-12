#!/usr/bin/env node
import { gateDeliverables } from '../lib/gates/deliverables.mjs';
import { runGate } from './_gate-cli.mjs';
await runGate(gateDeliverables);
