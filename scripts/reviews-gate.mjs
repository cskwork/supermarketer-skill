#!/usr/bin/env node
import { gateReviews } from '../lib/gates/reviews.mjs';
import { runGate } from './_gate-cli.mjs';
await runGate(gateReviews);
