#!/usr/bin/env node
import { gatePerformanceAttestation } from '../lib/gates/performance-attestation.mjs';
import { runGate } from './_gate-cli.mjs';
await runGate(gatePerformanceAttestation);
