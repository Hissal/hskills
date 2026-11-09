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
const read = file => JSON.parse(fs.readFileSync(file));
const listing = checkout => read(path.join(checkout, '.claude-plugin/marketplace.json'));
if (args[0] === 'app-server') {
  if (fs.existsSync(path.join(root, 'status-unavailable'))) process.exit(1);
  require('readline').createInterface({ input: process.stdin }).on('line', line => {
    const request = JSON.parse(line);
    if (request.id === 1) console.log(JSON.stringify({ id: 1, result: {} }));
    if (request.id === 2) console.log(JSON.stringify({ id: 2, result: { data: [{ hooks: [{
      source: 'plugin', pluginId: 'command-guard@hskills', enabled: true,
      trustStatus: fs.existsSync(path.join(root, 'human-trusted')) ? 'trusted' : 'untrusted'
    }, ...(fs.existsSync(path.join(root, 'hooks.json')) ? (JSON.parse(fs.readFileSync(path.join(root, 'hooks.json'))).hooks.PreToolUse || []).flatMap(g => (g.hooks || []).map(h => ({
      source: 'user', command: h.command, enabled: true,
      trustStatus: fs.existsSync(path.join(root, 'legacy-trusted')) ? 'trusted' : 'untrusted'
    }))) : [])], errors: [] }] } }));
  });
} else {
let output = {};
if (args[1] === 'marketplace') {
  const current = fs.existsSync(market) ? read(market) : null;
  if (args[2] === 'add') {
    const name = listing(args[3]).name;
    // Like the real hosts: Claude re-points a known name, Codex refuses to.
    if (host === 'codex' && current && current.name === name && current.source !== args[3]) {
      console.error("Error: marketplace '" + name + "' is already added from a different source");
      process.exit(1);
    }
    fs.writeFileSync(market, JSON.stringify({ name, source: args[3] }));
  } else if (args[2] === 'list') {
    const known = current ? [current] : [];
    output = host === 'codex' ? { marketplaces: known.map(m => ({ name: m.name, root: m.source })) } : known.map(m => ({ name: m.name, source: 'directory', path: m.source }));
  }
} else if (['add', 'install'].includes(args[1])) {
  const { name, source } = read(market);
  const entry = listing(source).plugins.find(p => p.name + '@' + name === args[2]);
  if (!entry) { console.error('Error: plugin not found: ' + args[2]); process.exit(1); }
  const folder = path.resolve(source, entry.source);
  fs.writeFileSync(installed, JSON.stringify(host === 'codex'
    ? { pluginId: args[2], enabled: true, source: { source: 'local', path: folder } }
    : { id: args[2], enabled: true, readFromFolder: folder }));
  const config = path.join(root, host === 'codex' ? 'config.toml' : 'settings.json');
  if (!fs.existsSync(config)) fs.writeFileSync(config, host === 'codex' ? '# installed\n' : '{}');
  if (host === 'codex' && !fs.readFileSync(config, 'utf8').includes('[plugins."' + args[2] + '"]')) {
    fs.appendFileSync(config, '\n[plugins."' + args[2] + '"]\nenabled = true\n');
  }

} else if (args[1] === 'list') {
  const list = fs.existsSync(installed) ? [read(installed)] : [];
  output = host === 'codex' ? { installed: list } : list;
}
console.log(JSON.stringify(output));

}
