'use strict';
// Public registration lifecycle with a disposable Codex config and real journal.
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert/strict');
const { registration } = require('../plugin');
const home = fs.mkdtempSync(path.join(os.tmpdir(), 'guard-trust-'));
const encode = text => Buffer.from(text).toString('base64');
const hash = c => '"sha256:' + c.repeat(64) + '"';
const plugin = '\n[plugins."command-guard@skill-collection-guard"]\nenabled = true\n';
// Shape observed in the native Windows writer output (docs/evidence/windows-guard-followup.md).
const nativeTrust = '\n[hooks.state]\n\n[hooks.state."command-guard@skill-collection-guard:hooks/codex.json:pre_tool_use:0:0"]\n'
  + 'trusted_hash = ' + hash('a') + '\ntrusted_content_hash = ' + hash('b') + '\nenabled = true\n'
  + "\n[hooks.state.'C:\\Users\\human\\AppData\\Local\\Temp\\fixture\\home\\.codex\\hooks.json:pre_tool_use:0:0']\n"
  + 'trusted_hash = ' + hash('c') + '\nenabled = true\n';
// Unchanged personal multiline values whose text looks like hook tables.
const multiline = 'developer_instructions = """\nKeep it short. \\"""\n'
  + '[hooks.state."command-guard@skill-collection-guard:hooks/codex.json:pre_tool_use:0:0"]\ntrusted_hash = "x"\n'
  + 'Ends with quotes.""""\nnotes = \'\'\'\n[plugins."fake"]\n"""\n\'\'\' # comment with \'\'\'\n';
const config = path.join(home, '.codex/config.toml');
const file = path.join(home, '.skill-collection/plugins.json');
function uninstall(before, after, current) {
  const journal = JSON.stringify({ hosts: [], writes: [{ path: config, before: before === null ? null : encode(before), after: encode(after) }] });
  fs.writeFileSync(file, journal);
  fs.writeFileSync(config, current);
  let ok;
  try { ok = registration(home, '', 'uninstall'); } catch (e) { assert.match(e.message, /CONFLICT/); ok = false; }
  if (!ok) {
    assert.equal(fs.readFileSync(config, 'utf8'), current);
    assert.equal(fs.readFileSync(file, 'utf8'), journal);
  }
  return ok;
}
try {
  fs.mkdirSync(path.join(home, '.codex'));
  fs.mkdirSync(path.join(home, '.skill-collection'));
  const before = 'hide_agent_reasoning = true\n' + multiline;
  const after = before + plugin;

  // Personal edits and unknown trust syntax remain conflicts.
  const extras = ['\n# personal change\n', '\n[personal]\nvalue = true\n', '\nunknown = true\n',
    nativeTrust + '# note\n', nativeTrust + 'other = 1\n', '\n[hooks.state]\n"k" = { enabled = true }\n',
    '\n[hooks.state."k"]\nenabled = true # note\n', '\n[hooks.state.\'k\']\nenabled = true\n[hooks.state."k"]\nenabled = false\n'];
  for (const extra of extras) assert.equal(uninstall(before, after, after + extra), false, extra);
  // Changed personal multiline bytes conflict even beside valid trust tables.
  assert.equal(uninstall(before, after, after.replace('Keep it short.', 'Keep it shorter.') + nativeTrust), false);
  // An unterminated multiline string makes every later header unreadable.
  assert.equal(uninstall(before, after + 'tail = """\n', after + 'tail = """\n' + nativeTrust), false);

  if (process.platform !== 'win32') {
    const target = path.join(home, 'personal-config');
    fs.writeFileSync(target, after + nativeTrust);
    fs.writeFileSync(file, JSON.stringify({ hosts: [], writes: [{ path: config, before: encode(before), after: encode(after) }] }));
    fs.unlinkSync(config);
    fs.symlinkSync(target, config);
    assert.throws(() => registration(home, '', 'uninstall'), /CONFLICT/);
    assert.equal(fs.readFileSync(target, 'utf8'), after + nativeTrust);
    fs.unlinkSync(config);
  }

  // Native shape: both key forms and the bare parent survive; personal bytes are exact.
  assert.equal(uninstall(before, after, after + nativeTrust), true);
  const restored = fs.readFileSync(config, 'utf8');
  assert.ok(restored.startsWith(before.trimEnd() + '\n'), restored);
  assert.ok(restored.includes(nativeTrust.trimStart()), restored);
  assert.doesNotMatch(restored.slice(before.length), /\[plugins\./);

  // Human state that predates installation survives, wherever the writer moved it.
  const human = "\n[hooks.state.'C:\\Users\\human\\.codex\\hooks.json:pre_tool_use:0:0']\nenabled = false\n";
  const preexisting = 'hide_agent_reasoning = true\n' + human + '\n[personal]\nvalue = true\n';
  const writer = 'hide_agent_reasoning = true\n\n[hooks.state]\n' + human
    + '\n[hooks.state."command-guard@skill-collection-guard:hooks/codex.json:pre_tool_use:0:0"]\ntrusted_hash = ' + hash('a') + '\ntrusted_content_hash = ' + hash('b') + '\n'
    + '\n[personal]\nvalue = true\n' + plugin;
  assert.equal(uninstall(preexisting, preexisting + plugin, writer), true);
  const kept = fs.readFileSync(config, 'utf8');
  assert.ok(kept.includes(human.trim()), kept);
  assert.match(kept, /trusted_content_hash/);
  assert.match(kept, /\[personal\]\nvalue = true/);
  assert.doesNotMatch(kept, /\[plugins\./);

  // Removing all hook-state tables retains the original ordinary bytes, even EOF whitespace.
  for (const ordinary of ['', 'hide_agent_reasoning = true', 'hide_agent_reasoning = true\n\n\n']) {
    assert.equal(uninstall(ordinary, ordinary + nativeTrust + plugin, ordinary + plugin), true);
    assert.equal(fs.readFileSync(config, 'utf8'), ordinary);
  }
  // Trust preceding a personal table stays there; unrelated bytes keep their exact position.
  const existing = 'hide_agent_reasoning = true\n' + human + '\n[personal]\nvalue = true\n\n\n';
  const changedTrust = human.replace('enabled = false', 'enabled = true');
  assert.equal(uninstall(existing, existing + plugin, existing.replace(human, changedTrust) + plugin), true);
  assert.equal(fs.readFileSync(config, 'utf8'), existing.replace(human, changedTrust));
  console.log('trust delta uninstall preserves human trust and personal settings');
} finally { fs.rmSync(home, { recursive: true, force: true }); }
