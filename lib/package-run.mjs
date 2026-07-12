import fs from 'node:fs';
import path from 'node:path';
import { createZipFromDirectory } from './zip.mjs';
import { verifyReadinessAttestation } from './attestation.mjs';
import { runReadinessGates } from './gates/aggregate.mjs';
import { nowIso, relativePosix, sha256File, walkFiles, writeJsonAtomic, writeTextAtomic } from './utils.mjs';

export function gatePackage(vault, options = {}) {
  const resolved = path.resolve(vault);
  const readiness = runReadinessGates(resolved, { ...options, forReady: true, writeReport: false });
  const errors = [...readiness.errors];
  const attestation = verifyReadinessAttestation(resolved);
  errors.push(...attestation.errors.map((entry) => ({ ...entry, gate: 'readiness-attestation' })));
  return {
    schema_version: '1.0',
    generated_at: nowIso(options.now ?? new Date()),
    ok: errors.length === 0,
    errors,
    warnings: readiness.warnings,
    readiness,
    attestation,
  };
}

export function packageRun(vault, outputFile, options = {}) {
  const resolved = path.resolve(vault);
  const output = path.resolve(outputFile);
  const prefix = `${resolved}${path.sep}`;
  if (output === resolved || output.startsWith(prefix)) throw new Error('Package output must be outside the run vault.');
  const gate = gatePackage(resolved, options);
  if (!gate.ok) {
    const error = new Error(`Package gate failed with ${gate.errors.length} error(s).`);
    error.report = gate;
    throw error;
  }
  const manifestPath = path.join(resolved, 'reports', 'PACKAGE-MANIFEST.json');
  const files = walkFiles(resolved, { exclude: ['.git', 'node_modules'] }).filter((file) => path.resolve(file) !== path.resolve(manifestPath));
  const manifest = {
    schema_version: '1.0',
    generated_at: nowIso(options.now ?? new Date()),
    run_vault: path.basename(resolved),
    manifest_excludes_itself: true,
    files: files.map((file) => ({ path: relativePosix(resolved, file), size_bytes: fs.statSync(file).size, sha256: sha256File(file) })),
  };
  writeJsonAtomic(manifestPath, manifest);
  const zip = createZipFromDirectory(resolved, output);
  const digest = sha256File(output);
  writeTextAtomic(`${output}.sha256`, `${digest}  ${path.basename(output)}\n`);
  return { ...zip, sha256: digest, checksum_file: `${output}.sha256`, package_manifest: manifestPath };
}
