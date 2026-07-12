import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MODES } from './constants.mjs';
import { replaceSection } from './markdown.mjs';
import { routeObjective } from './router.mjs';
import { ensureDir, nowIso, readText, runIdFor, slugify, writeJsonAtomic, writeTextAtomic } from './utils.mjs';
import { readYaml, writeYamlAtomic } from './yaml-lite.mjs';

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
export const SKILL_ROOT = path.resolve(MODULE_DIR, '..');
const TEMPLATE_DIR = path.join(SKILL_ROOT, 'templates');

function copyTemplate(name, destination, overwrite = false) {
  if (!overwrite && fs.existsSync(destination)) return false;
  ensureDir(path.dirname(destination));
  fs.copyFileSync(path.join(TEMPLATE_DIR, name), destination);
  return true;
}

export function initProject(projectDir = process.cwd()) {
  const root = path.resolve(projectDir);
  const base = path.join(root, '.supermarketer');
  const created = [];
  for (const dir of ['rules', 'brand', 'product', 'legal', 'runs']) ensureDir(path.join(base, dir));
  const standing = [
    ['RULES.md', path.join(base, 'rules', 'RULES.md')],
    ['BRAND.md', path.join(base, 'brand', 'BRAND.md')],
    ['PRODUCT-TRUTH.md', path.join(base, 'product', 'PRODUCT-TRUTH.md')],
    ['CLAIM-RULES.md', path.join(base, 'legal', 'CLAIM-RULES.md')],
  ];
  for (const [template, destination] of standing) if (copyTemplate(template, destination, false)) created.push(destination);
  const readme = path.join(base, 'README.md');
  if (!fs.existsSync(readme)) {
    writeTextAtomic(readme, '# .supermarketer workspace\n\nPersistent brand/product/legal rules live in this directory. Per-objective run vaults live in `runs/`.\n');
    created.push(readme);
  }
  return { project: root, workspace: base, created };
}

function modeNeedsMessageHouse(mode) {
  return ['POSITION', 'CAMPAIGN', 'COPY', 'STATIC', 'IMAGE', 'VIDEO', 'LAUNCH-KIT', 'LOCALIZE'].includes(mode);
}

function modeNeedsCreativeBrief(mode) {
  return ['CAMPAIGN', 'STATIC', 'IMAGE', 'VIDEO', 'LAUNCH-KIT', 'LOCALIZE'].includes(mode);
}

export function createRun(objective, options = {}) {
  const project = path.resolve(options.project ?? process.cwd());
  initProject(project);
  const routing = routeObjective(objective, options.mode);
  const now = options.now ?? new Date();
  let runId = runIdFor(options.slug ? `${options.slug}` : objective, now);
  if (options.slug) {
    const stamp = runId.split('-').slice(0, 2).join('-');
    runId = `${stamp}-${slugify(options.slug)}`;
  }
  const vault = path.join(project, '.supermarketer', 'runs', runId);
  if (fs.existsSync(vault)) throw new Error(`Run vault already exists: ${vault}`);
  for (const dir of ['assets', 'sources', 'reviews', 'reports', 'production']) ensureDir(path.join(vault, dir));
  const baseTemplates = [
    'BRIEF.md',
    'EVIDENCE.md',
    'EVIDENCE.yaml',
    'CHANNEL-SPECS.yaml',
    'CLAIMS.yaml',
    'DELIVERABLES.yaml',
    'ASSET-MANIFEST.yaml',
    'REVIEWS.yaml',
    'APPROVALS.yaml',
    'PRODUCTION-PACK.yaml',
    'QA.md',
    'run-state.json',
  ];
  for (const name of baseTemplates) copyTemplate(name, path.join(vault, name), true);
  if (modeNeedsMessageHouse(routing.mode)) copyTemplate('MESSAGE-HOUSE.md', path.join(vault, 'MESSAGE-HOUSE.md'), true);
  if (modeNeedsCreativeBrief(routing.mode)) copyTemplate('CREATIVE-BRIEF.md', path.join(vault, 'CREATIVE-BRIEF.md'), true);
  if (routing.mode === 'EXPERIMENT' || routing.mode === 'MEASURE') copyTemplate('EXPERIMENT.md', path.join(vault, 'EXPERIMENT.md'), true);
  if (routing.mode === 'MEASURE') {
    copyTemplate('RESULTS.md', path.join(vault, 'RESULTS.md'), true);
    copyTemplate('MEASUREMENT.yaml', path.join(vault, 'MEASUREMENT.yaml'), true);
  }

  const createdAt = now.toISOString();
  const statePath = path.join(vault, 'run-state.json');
  const state = JSON.parse(readText(statePath));
  Object.assign(state, {
    run_id: runId,
    objective,
    mode: routing.mode,
    phase: 'frame',
    readiness: 'DRAFT',
    performance: 'NOT_MEASURED',
    created_at: createdAt,
    updated_at: createdAt,
  });
  writeJsonAtomic(statePath, state);

  const manifestPath = path.join(vault, 'ASSET-MANIFEST.yaml');
  const manifest = readYaml(manifestPath);
  manifest.run = {
    id: runId,
    mode: routing.mode,
    created_at: createdAt,
    readiness: 'DRAFT',
    performance: 'NOT_MEASURED',
  };
  writeYamlAtomic(manifestPath, manifest);

  const briefPath = path.join(vault, 'BRIEF.md');
  let brief = readText(briefPath);
  brief = replaceSection(brief, 'Original Request', objective);
  brief = replaceSection(brief, 'Mode', routing.mode);
  brief = replaceSection(brief, 'Objective', objective);
  writeTextAtomic(briefPath, brief);

  const evidencePath = path.join(vault, 'EVIDENCE.md');
  let evidence = readText(evidencePath);
  evidence = replaceSection(evidence, 'Research Question', `What evidence is required to make the following marketing decision safely and effectively?\n\n${objective}`);
  writeTextAtomic(evidencePath, evidence);

  writeTextAtomic(path.join(vault, 'RUN.md'), `# SuperMarketer Run\n\n- Run ID: \`${runId}\`\n- Mode: \`${routing.mode}\`\n- Objective: ${objective}\n- Created: ${createdAt}\n- Playbook: \`${routing.reference}\`\n\n## Next gate\n\nComplete the brief and structured evidence files, produce assets, record independent reviews, then run:\n\n\`\`\`bash\nnode ${path.relative(vault, path.join(SKILL_ROOT, 'bin', 'supermarketer.mjs'))} check .\n\`\`\`\n`);

  return { project, vault, run_id: runId, routing };
}
