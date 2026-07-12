#!/usr/bin/env node
import process from 'node:process';
import { main } from '../lib/cli.mjs';

const code = await main();
process.exitCode = code;
