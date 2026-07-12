import process from 'node:process';

export function parseGateArgs(argv = process.argv.slice(2)) {
  const positional = [];
  const options = { forReady: true };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--draft') options.forReady = false;
    else if (value === '--json') options.json = true;
    else if (value === '--approval') options.approvalId = argv[++index];
    else if (value === '--max-age') options.maxChannelAgeDays = Number(argv[++index]);
    else positional.push(value);
  }
  return { positional, options };
}

export function printGateResult(result, json = false) {
  if (json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  else {
    console.log(`${result.ok ? 'PASS' : 'FAIL'} ${result.gate} — ${result.errors.length} error(s), ${result.warnings.length} warning(s)`);
    for (const error of result.errors) console.log(`ERROR ${error.code}: ${error.message}${error.location ? ` (${error.location})` : ''}`);
    for (const warning of result.warnings) console.log(`WARN ${warning.code}: ${warning.message}${warning.location ? ` (${warning.location})` : ''}`);
  }
  process.exitCode = result.ok ? 0 : 1;
}

export async function runGate(gate, argv = process.argv.slice(2)) {
  const { positional, options } = parseGateArgs(argv);
  if (!positional[0]) throw new Error('A run vault path is required.');
  const result = gate(positional[0], options);
  printGateResult(result, options.json);
}
