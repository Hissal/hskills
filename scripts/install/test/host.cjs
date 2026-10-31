#!/usr/bin/env node
'use strict';
// CLI boundary double; production registration and all filesystem work stay real.
const fs = require('fs');
const path = require('path');
const host = path.basename(process.argv[1]).includes('codex') ? 'codex' : 'claude';
const root = process.env[host === 'codex' ? 'CODEX_HOME' : 'CLAUDE_CONFIG_DIR'];
const dir = path.join(root, 'plugins');
fs.mkdirSync(dir, { recursive: true });
const market = path.join(dir, 'market.json');
const installed = path.join(dir, 'installed.json');
const args = process.argv.slice(2);
if (args[0] === 'app-server') {
  require('readline').createInterface({ input: process.stdin }).on('line', line => {
    const request = JSON.parse(line);
    if (request.id === 1) console.log(JSON.stringify({ id: 1, result: {} }));
    if (request.id === 2) console.log(JSON.stringify({ id: 2, result: { data: [{ hooks: [{
      source: 'plugin', pluginId: 'command-guard@skill-collection-guard', enabled: true,
      trustStatus: fs.existsSync(path.join(root, 'human-trusted')) ? 'trusted' : 'untrusted'
    }, ...(fs.existsSync(path.join(root, 'hooks.json')) ? (JSON.parse(fs.readFileSync(path.join(root, 'hooks.json'))).hooks.PreToolUse || []).flatMap(g => (g.hooks || []).map(h => ({
      source: 'user', command: h.command, enabled: true,
      trustStatus: fs.existsSync(path.join(root, 'legacy-trusted')) ? 'trusted' : 'untrusted'
    }))) : [])], errors: [] }] } }));
  });
} else {
let output = {};
if (args[1] === 'marketplace') {
  if (args[2] === 'add') fs.writeFileSync(market, JSON.stringify({ source: args[3] }));
  else if (args[2] === 'remove') fs.unlinkSync(market);
} else if (['add', 'install'].includes(args[1])) {
  const source = JSON.parse(fs.readFileSync(market)).source;
  fs.writeFileSync(installed, JSON.stringify({ id: 'command-guard@skill-collection-guard', pluginId: 'command-guard@skill-collection-guard', enabled: true, readFromFolder: source, source: { path: source } }));
  const config = path.join(root, host === 'codex' ? 'config.toml' : 'settings.json');
  if (!fs.existsSync(config)) fs.writeFileSync(config, host === 'codex' ? '# installed\n' : '{}');
  if (host === 'codex' && !fs.readFileSync(config, 'utf8').includes('[plugins."command-guard@skill-collection-guard"]')) {
    fs.appendFileSync(config, '\n[plugins."command-guard@skill-collection-guard"]\nenabled = true\n');
  }

} else if (args[1] === 'list') {
  const list = fs.existsSync(installed) ? [JSON.parse(fs.readFileSync(installed))] : [];
  output = host === 'codex' ? { installed: list } : list;
}
console.log(JSON.stringify(output));

}
