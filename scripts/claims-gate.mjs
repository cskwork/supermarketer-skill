#!/usr/bin/env node
import { gateClaims } from '../lib/gates/claims.mjs';
import { runGate } from './_gate-cli.mjs';
await runGate(gateClaims);
