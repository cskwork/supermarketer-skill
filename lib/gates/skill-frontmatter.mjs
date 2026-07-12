import fs from 'node:fs';
import { parseFrontmatter } from '../markdown.mjs';
import { createGate, addCheck, addError } from './result.mjs';

export function gateSkillFrontmatter(skillFile) {
  const result = createGate('skill-frontmatter');
  if (!fs.existsSync(skillFile)) {
    addError(result, 'SKILL_MISSING', `SKILL.md not found: ${skillFile}`, skillFile);
    return result;
  }
  const text = fs.readFileSync(skillFile, 'utf8');
  const parsed = parseFrontmatter(text);
  if (!parsed.data) {
    addError(result, 'SKILL_FRONTMATTER', 'SKILL.md must begin with YAML-style frontmatter.', skillFile);
    return result;
  }
  if (parsed.data.name !== 'supermarketer') addError(result, 'SKILL_NAME', 'Frontmatter name must be supermarketer.', skillFile);
  if (!parsed.data.description || parsed.data.description.length < 40) addError(result, 'SKILL_DESCRIPTION', 'Frontmatter description must be trigger-focused and specific.', skillFile);
  if (!/(?:marketing|poster|video|copy|positioning|campaign)/i.test(parsed.data.description ?? '')) addError(result, 'SKILL_DESCRIPTION_TRIGGERS', 'Description must include representative marketing triggers.', skillFile);
  if (text.length > 24_000) addError(result, 'SKILL_TOO_LARGE', 'Root SKILL.md should remain a thin router under 24 KB.', skillFile);
  addCheck(result, 'SKILL_FRONTMATTER_OK', 'SKILL.md frontmatter and router size checked.');
  return result;
}
