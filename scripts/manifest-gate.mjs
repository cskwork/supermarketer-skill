#!/usr/bin/env node
import { gateManifest } from '../lib/gates/manifest.mjs';
import { runGate } from './_gate-cli.mjs';
await runGate(gateManifest);
