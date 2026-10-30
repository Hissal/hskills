'use strict';
// Read-only app-server exchange; stdout contains only the hooks/list response.
const { spawn } = require('child_process');
const readline = require('readline');
const binary = process.env.COMMAND_GUARD_CODEX || 'codex';
const child = spawn(binary.endsWith('.cjs') ? process.execPath : binary,
  [...(binary.endsWith('.cjs') ? [binary] : []), 'app-server', '--stdio'],
  { stdio: ['pipe', 'pipe', 'ignore'] });
const timer = setTimeout(() => { child.kill(); process.exitCode = 1; }, 10000);
const send = message => child.stdin.write(JSON.stringify(message) + '\n');
child.on('error', () => { clearTimeout(timer); process.exitCode = 1; });
child.stdin.on('error', () => {});
child.on('exit', () => clearTimeout(timer));
send({ id: 1, method: 'initialize', params: { clientInfo: { name: 'guard-installer', version: '1' }, capabilities: { experimentalApi: true } } });
readline.createInterface({ input: child.stdout }).on('line', line => {
  let message;
  try { message = JSON.parse(line); } catch { return; }
  if (message.id === 1) {
    send({ method: 'initialized' });
    send({ id: 2, method: 'hooks/list', params: { cwds: [process.cwd()] } });
  }
  if (message.id === 2) {
    console.log(JSON.stringify(message));
    child.kill();
  }
});
