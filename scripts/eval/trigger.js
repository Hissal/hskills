#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function flags(model, prompt) {
  if (model.harness === 'claude') return ['-p', '--model', model.model, '--output-format', 'stream-json', '--verbose', '--', prompt];
  if (model.harness === 'codex') return ['exec', '--json', '--model', model.model, '--', prompt];
  return ['run', '--format', 'json', '--model', model.model, '--', prompt];
}
// A query's prompt and required answer text are one value, or one per harness
// (a user-invoked skill is typed /name on Claude and $name on Codex).
function forHarness(value, harness) {
  return value === undefined || typeof value === 'string' || Array.isArray(value) ? value : value[harness];
}
// Codex reports a command as its argv joined with POSIX shell quoting
// (shlex::try_join in codex-rs). Splits it back into words; null when the
// quoting is unbalanced.
function shellWords(text) {
  const words = [];
  let word = null;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (/\s/.test(c)) { if (word !== null) words.push(word); word = null; continue; }
    word ??= '';
    if (c === "'") {
      const end = text.indexOf("'", i + 1);
      if (end < 0) return null;
      word += text.slice(i + 1, end); i = end;
    } else if (c === '"') {
      for (i++; i < text.length && text[i] !== '"'; i++) {
        if (text[i] === '\\' && '$`"\\\n'.includes(text[i + 1] ?? 'x')) i++;
        word += text[i];
      }
      if (i >= text.length) return null;
    } else if (c === '\\') { if (++i >= text.length) return null; word += text[i]; }
    else word += c;
  }
  if (word !== null) words.push(word);
  return words;
}
// The script a PowerShell invocation runs: pwsh or powershell (any path,
// optional .exe), then only -NoLogo or -NoProfile, then -Command or -c and
// the script as the last word. Mirrors codex-rs extract_powershell_command.
function powershellScript(command) {
  const words = shellWords(command);
  if (!words || words.length < 3) return null;
  if (!/^(?:pwsh|powershell)(?:\.exe)?$/i.test(words[0].split(/[\\/]/).pop())) return null;
  let i = 1;
  while (i < words.length - 2 && /^-(?:nologo|noprofile)$/i.test(words[i])) i++;
  return i === words.length - 2 && /^-(?:command|c)$/i.test(words[i]) ? words[i + 1] : null;
}
function slashed(text) { return text.replace(/\\+/g, '/'); }
// Only successful plain reads of plain paths (one, or several joined by ; or
// &&), one path the installed entry point, count: cat, optionally wrapped in
// bash -lc '...', or under PowerShell Get-Content or its aliases gc, type
// and cat, with no options. Prose, filename searches and other commands
// merely mentioning it do not.
function plainRead(command, readName) {
  const path = '[\'"]?[^\'"\\s;&|<>$`()]+[\'"]?';
  let script = command;
  let reader = new RegExp(`^cat(?:\\s+${path})+$`);
  const shell = command.match(/^\S*(?:bash|sh) -[lc]+ '([^']*)'$/);
  const powershell = shell ? null : powershellScript(command);
  if (shell) script = shell[1];
  else if (powershell !== null) { script = powershell.trim(); reader = new RegExp(`^(?:get-content|gc|type|cat)(?:\\s+(?!-)${path})+$`, 'i'); }
  const reads = script.split(/\s*(?:;|&&)\s*/);
  return reads.every(read => reader.test(read)) &&
    reads.some(read => read.split(/\s+/).slice(1).some(arg => slashed(arg.replace(/['"]/g, '')).endsWith('/skills/' + readName + '/SKILL.md')));
}
function observe(run, harness, skill, says) {
  if (run.error || run.status !== 0) return 'inconclusive';
  let events;
  try { events = run.stdout.trim().split(/\r?\n/).map(line => JSON.parse(line)); }
  catch { return 'inconclusive'; }
  let fired = false;
  let complete = false;
  let answer = '';
  const skillCalls = new Set();
  for (const e of events) {
    if (e.type === 'error' || e.type === 'turn.failed' || e.is_error || e.permission_denials?.length || e.type === 'permission_denied') return 'inconclusive';
    if (harness === 'claude') {
      if (e.type === 'result' && e.subtype === 'success') { complete = true; answer = e.result || ''; }
      // An errored Skill call leaves firing unobservable; other tools' errors
      // (a failed ls of a missing folder) are not evidence either way.
      for (const block of e.message?.content || []) {
        if (block.type === 'tool_use' && block.name === 'Skill') skillCalls.add(block.id);
        if (block.type === 'tool_result' && block.is_error && (!block.tool_use_id || skillCalls.has(block.tool_use_id))) return 'inconclusive';
        if (block.type === 'tool_use' && block.name === 'Skill' && block.input?.skill === skill.name) fired = true;
      }
    } else if (harness === 'opencode') {
      if (e.type === 'step_finish') complete = true;
      if (e.type === 'tool_use' && e.part?.tool === 'skill') {
        if (e.part.state?.status === 'error') return 'inconclusive';
        if (e.part.state?.status === 'completed' && e.part.state.metadata?.metadata?.name === skill.name) fired = true;
      }
    } else {
      if (e.type === 'turn.completed') complete = true;
      const item = e.item;
      if (e.type === 'item.completed' && item?.type === 'agent_message') answer = item.text || '';
      const readName = skill.readName || skill.name;
      if (e.type === 'item.completed' && item?.type === 'command_execution') {
        const mentions = slashed(item.command || '');
        const names = mentions.includes('/skills/' + readName + '/');
        // A failed command is evidence only when it names the entry point's folder.
        if (item.status !== 'completed' || item.exit_code !== 0) { if (names) return 'inconclusive'; continue; }
        const lines = (item.aggregated_output || '').split(/\r?\n/);
        if (plainRead(item.command || '', readName) && lines.includes('---') && lines.includes('name: ' + readName)) fired = true;
        else if (mentions.includes('/skills/' + readName + '/SKILL.md')) return 'inconclusive';
      }
    }
  }
  if (!complete) return 'inconclusive';
  const outcome = fired ? 'fired' : 'not fired';
  if (!says) return outcome;
  const missing = says.filter(text => !answer.includes(text));
  return outcome + (missing.length ? '; says missing ' + missing.map(text => JSON.stringify(text)).join(' ') : '; says all');
}
function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('USAGE: node scripts/eval/trigger.js <queries.json> [--full] [--repeat N]\nRESULT: skill model query fired | not fired | inconclusive [; says all | says missing "<text>"]\nEXIT: 0 frontier pass; 1 frontier fail; 2 inconclusive or invalid input\nDOCS: docs/trigger-evals.md');
    return;
  }
  const file = args.shift();
  let full = false;
  let repeat = 1;
  while (args.length) {
    const arg = args.shift();
    if (arg === '--full') full = true;
    else if (arg === '--repeat') repeat = Number(args.shift());
    else throw new Error(`unknown option ${arg}`);
  }
  if (!file || !Number.isInteger(repeat) || repeat < 1 || repeat > 10) throw new Error('provide queries.json and --repeat 1..10');
  const config = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(config.models) || !Array.isArray(config.skills) || !config.skills.length) throw new Error('models and non-empty skills arrays required');
  const labels = new Set();
  for (const m of config.models) {
    if (!['claude','codex','opencode'].includes(m.harness) || !['frontier','lower'].includes(m.tier) || typeof m.model !== 'string' || !m.model || typeof m.label !== 'string' || !m.label || labels.has(m.label)) throw new Error('invalid or duplicate model');
    labels.add(m.label);
    if (m.command && (!Array.isArray(m.command) || !m.command.length || m.command.some(x=>typeof x !== 'string' || !x))) throw new Error('command must be a non-empty argv array');
  }
  for (const label of ['Opus','Sol']) if (!config.models.some(m=>m.label === label && m.tier === 'frontier')) throw new Error(`frontier ${label} required`);
  for (const s of config.skills) {
    if (s.readName !== undefined && (typeof s.readName !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s.readName))) throw new Error('readName must be a bare skill name');
    if (typeof s.name !== 'string' || !s.name || !Array.isArray(s.queries) || !s.queries.length || s.queries.length > 6 || s.queries.some(q=>typeof q.fire !== 'boolean') || [true,false].some(f=>s.queries.filter(q=>q.fire === f).length > 3)) throw new Error('each skill needs 1..6 queries, at most three per expected outcome');
    for (const q of s.queries) for (const m of config.models.filter(m=>full || m.tier === 'frontier')) {
      const prompt = forHarness(q.prompt, m.harness);
      if (typeof prompt !== 'string' || !prompt.trim()) throw new Error(`no prompt for ${m.harness}: give a prompt string or one per harness`);
      if (q.says === undefined) continue;
      const says = forHarness(q.says, m.harness);
      if (!Array.isArray(says) || !says.length || says.some(t=>typeof t !== 'string' || !t)) throw new Error(`no says for ${m.harness}: give an array of answer texts or one per harness`);
      if (m.harness === 'opencode') throw new Error('says is not supported for opencode: its answer event is unverified');
    }
  }
  let failed = false;
  let uncertain = false;
  for (const skill of config.skills) {
    const frontier = [];
    for (const model of config.models.filter(m=>full || m.tier === 'frontier')) {
      const results = [];
      for (const [index, query] of skill.queries.entries()) {
        const observations = [];
        for (let n=0; n<repeat; n++) {
          const command = model.command || [model.harness];
          const run = spawnSync(command[0], [...command.slice(1), ...flags(model,forHarness(query.prompt,model.harness))], {
            cwd: path.resolve(path.dirname(file), config.cwd || '.'), encoding:'utf8', timeout:120000, maxBuffer:16*1024*1024,
          });
          observations.push(observe(run,model.harness,skill,forHarness(query.says,model.harness)));
        }
        const outcome = new Set(observations).size === 1 ? observations[0] : 'inconclusive';
        console.log(`RESULT: ${skill.name} ${model.label} q${index+1} ${outcome}`);
        results.push(outcome === 'inconclusive' ? 'inconclusive' : outcome.startsWith('fired') === query.fire && !outcome.includes('says missing') ? 'pass' : 'fail');
      }
      const verdict = results.includes('inconclusive') ? 'inconclusive' : results.includes('fail') ? 'fail' : 'pass';
      console.log(`MODEL: ${skill.name} ${model.label} ${verdict}${model.tier === 'lower' ? ' (advisory)' : ''}`);
      if (model.tier === 'frontier') frontier.push(verdict);
    }
    const verdict = frontier.includes('inconclusive') ? 'inconclusive' : frontier.includes('fail') ? 'fail' : 'pass';
    console.log(`SKILL: ${skill.name} ${verdict}`);
    failed ||= verdict === 'fail';
    uncertain ||= verdict === 'inconclusive';
  }
  process.exitCode = uncertain ? 2 : failed ? 1 : 0;
}
try { main(); } catch (error) { console.error(`ERROR: ${error.message}`); process.exitCode = 2; }
