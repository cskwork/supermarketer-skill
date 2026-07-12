import fs from 'node:fs';
import path from 'node:path';
import { REQUIRED_RUN_FILES } from '../constants.mjs';
import { createGate, addCheck, addError } from './result.mjs';

export function gateRunFiles(vault) {
  const result = createGate('run-files');
  let present = 0;
  for (const name of REQUIRED_RUN_FILES) {
    const filePath = path.join(vault, name);
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) addError(result, 'RUN_FILE_MISSING', `Required run file is missing: ${name}`, name);
    else if (fs.lstatSync(filePath).isSymbolicLink()) addError(result, 'RUN_FILE_SYMLINK', `Required run files cannot be symbolic links: ${name}`, name);
    else present += 1;
  }
  for (const directory of ['assets', 'sources', 'reviews', 'reports', 'production']) {
    const dirPath = path.join(vault, directory);
    if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) addError(result, 'RUN_DIRECTORY_MISSING', `Required run directory is missing: ${directory}/`, directory);
    else if (fs.lstatSync(dirPath).isSymbolicLink()) addError(result, 'RUN_DIRECTORY_SYMLINK', `Required run directories cannot be symbolic links: ${directory}/`, directory);
  }
  addCheck(result, 'RUN_FILES', `${present}/${REQUIRED_RUN_FILES.length} required run files present.`);
  return result;
}
