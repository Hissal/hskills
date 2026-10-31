'use strict';
// Public registration lifecycle with a disposable Codex config and real journal.
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert/strict');
const { registration } = require(process.argv[2] || '../plugin');
const home = fs.mkdtempSync(path.join(os.tmpdir(), 'guard-trust-'));
const encode = text => Buffer.from(text).toString('base64');
try {
  fs.mkdirSync(path.join(home, '.codex'));
  fs.mkdirSync(path.join(home, '.skill-collection'));
  const config = path.join(home, '.codex/config.toml');
  const before = 'hide_agent_reasoning = true\n';
  const after = before + '\n[plugins."command-guard@skill-collection-guard"]\nenabled = true\n';
  const trust = '\n[hooks.state."command-guard@skill-collection-guard:hooks/codex.json:pre_tool_use:0:0"]\nenabled = true\ntrusted_hash = "sha256:' + 'a'.repeat(64) + '"\ntrusted_content_hash = "sha256:' + 'b'.repeat(64) + '"\n';
  const file = path.join(home, '.skill-collection/plugins.json');
  const journal = JSON.stringify({ hosts: [], writes: [{ path: config, before: encode(before), after: encode(after) }] });
  for (const extra of ['\n# personal change\n', '\n[personal]\nvalue = true\n', '\nunknown = true\n']) {
    fs.writeFileSync(file, journal);
    fs.writeFileSync(config, after + trust + extra);
    let rejected = false;
    try { rejected = registration(home, '', 'uninstall') === false; } catch (e) { assert.match(e.message, /CONFLICT/); rejected = true; }
    assert.equal(rejected, true);
    assert.equal(fs.readFileSync(config, 'utf8'), after + trust + extra);
    assert.equal(fs.readFileSync(file, 'utf8'), journal);
  }
  if (process.platform !== 'win32') {
    const target = path.join(home, 'personal-config');
    fs.writeFileSync(target, after + trust);
    fs.unlinkSync(config);
    fs.symlinkSync(target, config);
    assert.throws(() => registration(home, '', 'uninstall'), /CONFLICT/);
    assert.equal(fs.readFileSync(target, 'utf8'), after + trust);
    fs.unlinkSync(config);
  }
  fs.writeFileSync(file, journal);
  fs.writeFileSync(config, after + trust);
  assert.equal(registration(home, '', 'uninstall'), true);
  const restored = fs.readFileSync(config, 'utf8');
  assert.match(restored, /hide_agent_reasoning = true/);
  assert.ok(restored.includes(trust.trimStart()));
  assert.doesNotMatch(restored, /\[plugins\./);
  console.log('trust delta uninstall preserves human trust and personal settings');
} finally { fs.rmSync(home, { recursive: true, force: true }); }
