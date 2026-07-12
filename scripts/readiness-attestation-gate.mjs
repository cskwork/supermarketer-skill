#!/usr/bin/env node
import { gateReadinessAttestation } from '../lib/gates/readiness-attestation.mjs';
import { runGate } from './_gate-cli.mjs';
await runGate(gateReadinessAttestation);
