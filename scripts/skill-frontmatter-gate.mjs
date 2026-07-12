#!/usr/bin/env node
import process from 'node:process';
import { gateSkillFrontmatter } from '../lib/gates/skill-frontmatter.mjs';
import { printGateResult } from './_gate-cli.mjs';
const file = process.argv[2] ?? 'SKILL.md';
printGateResult(gateSkillFrontmatter(file), process.argv.includes('--json'));
