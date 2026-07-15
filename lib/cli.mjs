import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { VERSION } from './constants.mjs';
import { routeObjective } from './router.mjs';
import { createRun, initProject, SKILL_ROOT } from './scaffold.mjs';
import { runReadinessGates } from './gates/aggregate.mjs';
import { gateReferenceIntegrity } from './gates/reference-integrity.mjs';
import { gateSkillFrontmatter } from './gates/skill-frontmatter.mjs';
import { gateMarketingSpecialists } from './gates/marketing-specialists.mjs';
import { gateReadinessAttestation } from './gates/readiness-attestation.mjs';
import { gatePerformanceAttestation } from './gates/performance-attestation.mjs';
import { inspectAssetFile } from './media/inspect.mjs';
import { auditInstall } from './install-audit.mjs';
import { gatePackage, packageRun } from './package-run.mjs';
import { certifyReady, getRunStatus, ingestAsset, issuePublishPermit, validateResults } from './workflow.mjs';
import { commandExists, formatBytes } from './utils.mjs';

const HELP = `supermarketer ${VERSION}

Evidence-grounded product marketing and creative-production skill CLI.

Usage:
  supermarketer route <objective> [--mode MODE] [--specialty SPECIALTY] [--json]
  supermarketer init [project-dir] [--json]
  supermarketer new <objective> [--project DIR] [--mode MODE] [--specialty SPECIALTY] [--slug SLUG] [--json]
  supermarketer check <run-vault> [--draft] [--max-channel-age DAYS] [--json]
  supermarketer ready <run-vault> [--json]
  supermarketer status <run-vault> [--json]
  supermarketer verify-ready <run-vault> [--json]
  supermarketer verify-results <run-vault> [--json]
  supermarketer ingest <run-vault> --asset ASSET-001 --file PATH [--as rendered|source|preview|lineage] [--json]
  supermarketer inspect <file> [--kind static|image|video|copy] [--json]
  supermarketer package <run-vault> [--out FILE.zip] [--json]
  supermarketer validate-results <run-vault> [--json]
  supermarketer publish-check <run-vault> --approval AP-001 [--json]
  supermarketer doctor [--json]
  supermarketer check-skill [skill-dir] [--json]
  supermarketer install-audit [source-dir] [target-dir ...] [--json]

핵심 상태:
  Readiness: DRAFT | REVIEW_READY | LAUNCH_READY | BLOCKED
  Performance: NOT_MEASURED | MEASURING | PERFORMANCE_VALIDATED

The CLI never publishes, sends, schedules, or spends. publish-check only issues a scoped approval permit file.
`;

const BOOLEAN_OPTIONS = new Set(['json', 'draft']);

function parseArgv(argv) {
  const positional = [];
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--') {
      positional.push(...argv.slice(index + 1));
      break;
    }
    if (!value.startsWith('--')) {
      positional.push(value);
      continue;
    }
    const equals = value.indexOf('=');
    let key;
    let optionValue;
    if (equals >= 0) {
      key = value.slice(2, equals);
      optionValue = value.slice(equals + 1);
    } else {
      key = value.slice(2);
      if (BOOLEAN_OPTIONS.has(key)) optionValue = true;
      else if (index + 1 < argv.length && !argv[index + 1].startsWith('--')) {
        optionValue = argv[index + 1];
        index += 1;
      } else optionValue = true;
    }
    options[key] = optionValue;
  }
  return { positional, options };
}

function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function printGate(report) {
  const mark = report.ok ? 'PASS' : 'FAIL';
  console.log(`${mark} ${report.gate ?? 'gate'} — ${report.errors?.length ?? 0} error(s), ${report.warnings?.length ?? 0} warning(s)`);
  for (const error of report.errors ?? []) console.log(`  ERROR ${error.gate ? `[${error.gate}] ` : ''}${error.code}: ${error.message}${error.location ? ` (${error.location})` : ''}`);
  for (const warning of report.warnings ?? []) console.log(`  WARN  ${warning.gate ? `[${warning.gate}] ` : ''}${warning.code}: ${warning.message}${warning.location ? ` (${warning.location})` : ''}`);
}

function printReadiness(report) {
  console.log(`${report.ok ? 'PASS' : 'FAIL'} launch-readiness — ${report.summary.passed}/${report.summary.gates} gates passed, ${report.summary.errors} error(s), ${report.summary.warnings} warning(s)`);
  for (const error of report.errors) console.log(`  ERROR [${error.gate}] ${error.code}: ${error.message}${error.location ? ` (${error.location})` : ''}`);
  for (const warning of report.warnings) console.log(`  WARN  [${warning.gate}] ${warning.code}: ${warning.message}${warning.location ? ` (${warning.location})` : ''}`);
  if (report.report_path) console.log(`  Report: ${report.report_path}`);
}

function doctor() {
  const nodeMajor = Number(process.versions.node.split('.')[0]);
  return {
    version: VERSION,
    node: { version: process.versions.node, ok: nodeMajor >= 20 },
    tools: {
      ffprobe: { available: commandExists('ffprobe'), required_for: 'rendered video verification' },
      pdfinfo: { available: commandExists('pdfinfo'), required_for: 'PDF page metadata verification' },
      ffmpeg: { available: commandExists('ffmpeg'), required_for: 'optional video assembly adapters' },
      imagemagick: { available: commandExists('magick') || commandExists('identify'), required_for: 'optional raster conversion only' },
    },
    note: 'Missing optional tools do not permit fake outputs. Rendered video verification specifically requires ffprobe; otherwise use an approved PRODUCTION_PACK_ONLY fallback.',
  };
}

function failure(error, json) {
  if (json) printJson({ ok: false, error: error.message, report: error.report ?? null });
  else {
    console.error(`ERROR: ${error.message}`);
    if (error.report?.summary) printReadiness(error.report);
    else if (error.report) printGate(error.report);
  }
  return 1;
}

export async function main(argv = process.argv.slice(2)) {
  const { positional, options } = parseArgv(argv);
  const command = positional.shift();
  const json = options.json === true || options.json === 'true';
  try {
    if (!command || ['help', '-h', '--help'].includes(command)) {
      console.log(HELP);
      return 0;
    }
    if (['version', '-v', '--version'].includes(command)) {
      console.log(VERSION);
      return 0;
    }
    if (command === 'route') {
      const objective = positional.join(' ').trim();
      const result = routeObjective(objective, options.mode, options.specialty);
      if (json) printJson(result);
      else console.log(`Mode: ${result.mode}\nMode confidence: ${result.confidence.toFixed(2)}\nMode playbook: ${result.reference}\nSpecialty: ${result.specialty}\nSpecialty confidence: ${result.specialty_confidence.toFixed(2)}\nSpecialist playbook: ${result.specialty_reference}\nPrimary output: ${result.primary_output}\nMode matched: ${result.matched.join(', ') || 'default campaign route'}\nSpecialty matched: ${result.specialty_matched.join(', ') || 'default product-marketing route'}`);
      return 0;
    }
    if (command === 'init') {
      const result = initProject(positional[0] ?? process.cwd());
      if (json) printJson(result);
      else console.log(`Initialized ${result.workspace}\nCreated ${result.created.length} file(s). Existing standing files were preserved.`);
      return 0;
    }
    if (command === 'new') {
      const objective = positional.join(' ').trim();
      if (!objective) throw new Error('new requires a marketing objective.');
      const result = createRun(objective, { project: options.project, mode: options.mode, specialty: options.specialty, slug: options.slug });
      if (json) printJson(result);
      else console.log(`Created run: ${result.vault}\nMode: ${result.routing.mode}\nSpecialty: ${result.routing.specialty}\nMode playbook: ${result.routing.reference}\nSpecialist playbook: ${result.routing.specialty_reference}\nStatus: DRAFT / NOT_MEASURED`);
      return 0;
    }
    if (command === 'check') {
      const vault = positional[0];
      if (!vault) throw new Error('check requires a run vault path.');
      const report = runReadinessGates(vault, {
        forReady: options.draft !== true,
        maxChannelAgeDays: options['max-channel-age'] ? Number(options['max-channel-age']) : undefined,
      });
      if (json) printJson(report);
      else printReadiness(report);
      return report.ok ? 0 : 1;
    }
    if (command === 'ready') {
      const vault = positional[0];
      if (!vault) throw new Error('ready requires a run vault path.');
      const result = certifyReady(vault);
      if (json) printJson({ ok: true, ...result });
      else console.log(`LAUNCH_READY\nMarker: ${result.marker}\nPerformance: ${result.state.performance}\nExternal action: NOT AUTHORIZED`);
      return 0;
    }
    if (command === 'status') {
      const vault = positional[0];
      if (!vault) throw new Error('status requires a run vault path.');
      const result = getRunStatus(vault);
      if (json) printJson(result);
      else console.log(`Run: ${result.run_id}\nMode: ${result.mode}\nSpecialty: ${result.specialty ?? 'legacy/unset'}\nPhase: ${result.phase}\nReadiness: ${result.readiness}\nPerformance: ${result.performance}\nZ-READY: ${result.z_ready ? (result.z_ready_valid ? 'VALID' : 'INVALID') : 'NO'}\nZ-VALIDATED: ${result.z_validated ? (result.z_validated_valid ? 'VALID' : 'INVALID') : 'NO'}\nExternal action authorized: ${result.external_action_authorized ? 'YES' : 'NO'}`);
      return 0;
    }
    if (command === 'verify-ready') {
      const vault = positional[0];
      if (!vault) throw new Error('verify-ready requires a run vault path.');
      const result = gateReadinessAttestation(vault);
      if (json) printJson(result);
      else printGate(result);
      return result.ok ? 0 : 1;
    }
    if (command === 'verify-results') {
      const vault = positional[0];
      if (!vault) throw new Error('verify-results requires a run vault path.');
      const result = gatePerformanceAttestation(vault);
      if (json) printJson(result);
      else printGate(result);
      return result.ok ? 0 : 1;
    }
    if (command === 'ingest') {
      const vault = positional[0];
      if (!vault || !options.asset || !options.file) throw new Error('ingest requires <vault> --asset ASSET-001 --file PATH.');
      const result = ingestAsset(vault, { assetId: options.asset, file: options.file, as: options.as });
      if (json) printJson(result);
      else console.log(`Ingested ${result.path} into ${result.asset_id} as ${result.field}.\nSHA-256: ${result.sha256}`);
      return 0;
    }
    if (command === 'inspect') {
      const file = positional[0];
      if (!file) throw new Error('inspect requires a file path.');
      const result = inspectAssetFile(path.resolve(file), options.kind);
      if (json) printJson(result);
      else console.log(`${result.format} ${result.dimensions ?? ''}${result.duration_seconds ? ` ${result.duration_seconds.toFixed(3)}s` : ''} ${formatBytes(result.size_bytes)}\nSHA-256: ${result.sha256}`.trim());
      return 0;
    }
    if (command === 'package') {
      const vault = positional[0];
      if (!vault) throw new Error('package requires a run vault path.');
      const resolved = path.resolve(vault);
      const state = getRunStatus(resolved);
      const output = options.out ? path.resolve(options.out) : path.join(path.dirname(resolved), `${state.run_id}-delivery.zip`);
      const result = packageRun(resolved, output);
      if (json) printJson(result);
      else console.log(`Packaged ${result.files} files: ${result.outputFile}\nSize: ${formatBytes(result.size_bytes)}\nSHA-256: ${result.sha256}\nChecksum: ${result.checksum_file}`);
      return 0;
    }
    if (command === 'validate-results') {
      const vault = positional[0];
      if (!vault) throw new Error('validate-results requires a run vault path.');
      const result = validateResults(vault);
      if (json) printJson({ ok: true, ...result });
      else console.log(`PERFORMANCE_VALIDATED\nMarker: ${result.marker}\nDecision: ${result.result.metadata.validation.decision}`);
      return 0;
    }
    if (command === 'publish-check') {
      const vault = positional[0];
      if (!vault || !options.approval) throw new Error('publish-check requires <vault> --approval AP-001.');
      const result = issuePublishPermit(vault, options.approval);
      if (json) printJson({ ok: true, ...result });
      else console.log(`Publish scope approved; no external action was executed.\nPermit: ${result.permit}\nFingerprint: ${result.result.metadata.permit.fingerprint}`);
      return 0;
    }
    if (command === 'doctor') {
      const result = doctor();
      if (json) printJson(result);
      else {
        console.log(`supermarketer ${result.version}\nNode ${result.node.version}: ${result.node.ok ? 'OK' : 'UNSUPPORTED'}`);
        for (const [tool, status] of Object.entries(result.tools)) console.log(`${tool}: ${status.available ? 'available' : 'missing'} — ${status.required_for}`);
        console.log(result.note);
      }
      return result.node.ok ? 0 : 1;
    }
    if (command === 'check-skill') {
      const root = path.resolve(positional[0] ?? SKILL_ROOT);
      const reference = gateReferenceIntegrity(root);
      const frontmatter = gateSkillFrontmatter(path.join(root, 'SKILL.md'));
      const specialists = gateMarketingSpecialists(root);
      const report = { ok: reference.ok && frontmatter.ok && specialists.ok, errors: [...reference.errors, ...frontmatter.errors, ...specialists.errors], warnings: [...reference.warnings, ...frontmatter.warnings, ...specialists.warnings], results: [reference, frontmatter, specialists] };
      if (json) printJson(report);
      else printGate({ gate: 'skill', ...report });
      return report.ok ? 0 : 1;
    }
    if (command === 'install-audit') {
      const source = positional.shift() ?? SKILL_ROOT;
      const result = auditInstall(source, positional);
      if (json) printJson(result);
      else {
        console.log(`Source: ${result.source}`);
        for (const entry of result.results) console.log(`${entry.status.toUpperCase()} ${entry.target}${entry.changed.length ? ` — changed: ${entry.changed.length}` : ''}${entry.missing.length ? `, missing: ${entry.missing.length}` : ''}${entry.extra.length ? `, extra: ${entry.extra.length}` : ''}`);
      }
      return result.results.some((entry) => entry.status === 'drifted') ? 1 : 0;
    }
    throw new Error(`Unknown command: ${command}\n\n${HELP}`);
  } catch (error) {
    return failure(error, json);
  }
}
