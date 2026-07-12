#!/usr/bin/env node
import { gateChannelSpecs } from '../lib/gates/channel.mjs';
import { runGate } from './_gate-cli.mjs';
await runGate(gateChannelSpecs);
