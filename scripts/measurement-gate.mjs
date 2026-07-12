#!/usr/bin/env node
import { gateMeasurement } from '../lib/gates/measurement.mjs';
import { runGate } from './_gate-cli.mjs';
await runGate(gateMeasurement);
