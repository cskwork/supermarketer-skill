#!/usr/bin/env node
import { gateBrief } from '../lib/gates/brief.mjs';
import { runGate } from './_gate-cli.mjs';
await runGate(gateBrief);
