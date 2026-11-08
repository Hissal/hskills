#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');
const { StringDecoder } = require('node:string_decoder');

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
// and cat, with no options but -Raw and -LiteralPath or -Path before a
// path. The other steps of a compound command may instead be read-only
// commands (readOnlyStep). Prose, filename searches and other commands merely
// mentioning it do not.
function plainRead(command, readName) {
  const path = '[\'"]?[^\'"\\s;&|<>$`()]+[\'"]?';
  let script = command;
  let reader = new RegExp(`^cat(?:\\s+${path})+$`);
  const shell = command.match(/^\S*(?:bash|sh) -[lc]+ '([^']*)'$/);
  const powershell = shell ? null : powershellScript(command);
  if (shell) script = shell[1];
  else if (powershell !== null) { script = powershell.trim(); reader = new RegExp(`^(?:get-content|gc|type|cat)(?:\\s+(?:-raw|(?:-literalpath|-path)\\s+(?!-)${path}|(?!-)${path}))+$`, 'i'); }
  const steps = script.split(/\s*(?:;|&&)\s*/);
  return steps.some(step => reader.test(step) && step.split(/\s+/).slice(1).some(arg => slashed(arg.replace(/['"]/g, '')).endsWith('/skills/' + readName + '/SKILL.md'))) &&
    steps.every(step => reader.test(step) || readOnlyStep(step));
}
// A step of a compound read other than the plain read: a command early stop
// treats as a read, with nothing that could hide a write from that check (a
// pipe, redirect, background job, expansion, substitution, quoting, escape,
// group, shell keyword or command runner).
const HIDES = /^(?:if|then|else|elif|fi|for|while|until|do|done|case|esac|function|select|!|\[\[|eval|exec|source|\.|xargs|bash|sh|zsh|pwsh|powershell|cmd|invoke-expression|iex)$/i;
function readOnlyStep(step) {
  return !/[|&<>$`()'"\\{}]/.test(step) && !HIDES.test(step.trim().split(/\s+/)[0]) && !mutating(step);
}
// Early stop. A session ends as soon as its firing is known:
// - fired: at the observed skill's load (Claude: its Skill call's successful
//   result; Codex: the completed read; OpenCode: the completed skill call);
// - not fired: at the first write or edit, web call, or mutating or
//   long-running shell command, or at the tool call at index BUDGET (the
//   25th), when no load came first.
// Across 453 real sessions the latest first load was the call at index 17,
// and only Read, Bash, Glob and Grep calls ever came before a late load: reads,
// searches, lists and other commands go on and count toward the budget. A
// stop waits until the calls issued with the trigger have been seen, and on
// Codex until no read of the skill's folder is still running, so a load sent
// alongside a write still counts. A query with `says` needs the final answer
// and runs to the end. An error seen before the stop is inconclusive.
const BUDGET = 24;
const SETTLE_MS = 2000;
const TIMEOUT_MS = 120000;
const CAP = 16 * 1024 * 1024;
// How long a wrapper may take to stop itself before it is killed; tests
// shorten it.
const STOP_GRACE_MS = Number(process.env.TRIGGER_EVAL_STOP_GRACE_MS) || 30000;
const KILL_GRACE_MS = 5000;
const NULL_TARGET = /^(?:\/dev\/null|\$null|nul)$/i;
// Programs that change files, build, test, install, run a project or reach
// the web.
const MUTATING = new Set(['rm', 'rmdir', 'del', 'erase', 'rd', 'mv', 'move', 'cp', 'copy', 'xcopy', 'robocopy', 'mkdir', 'md', 'touch', 'tee', 'ln', 'chmod', 'chown', 'truncate', 'dd', 'install', 'patch', 'curl', 'wget', 'make', 'cmake', 'msbuild', 'gradle', 'gradlew', 'mvn', 'docker', 'pytest', 'unity', 'npx', 'bunx', 'pnpx',
  'set-content', 'add-content', 'out-file', 'new-item', 'ni', 'remove-item', 'ri', 'move-item', 'mi', 'copy-item', 'cpi', 'rename-item', 'rni', 'clear-content', 'set-itemproperty', 'start-process', 'saps', 'invoke-webrequest', 'iwr', 'invoke-restmethod', 'irm', 'expand-archive', 'compress-archive']);
// Programs whose listed subcommands do so; their other subcommands only read.
const PACKAGES = /^(?:add|build|ci|create|dlx|exec|i|init|install|link|publish|rebuild|remove|rm|run|run-script|start|t|test|uninstall|un|up|update|upgrade|x)$/;
const SUBCOMMANDS = {
  git: /^(?:add|am|apply|checkout|cherry-pick|clean|clone|commit|fetch|init|merge|mv|pull|push|rebase|reset|restore|revert|rm|stash|switch)$/,
  npm: PACKAGES, pnpm: PACKAGES, yarn: PACKAGES, bun: PACKAGES,
  dotnet: /^(?:add|build|clean|format|new|pack|publish|remove|restore|run|test|tool|watch|workload)$/,
  cargo: /^(?:add|b|bench|build|check|clean|fix|init|install|new|publish|r|remove|run|t|test|update)$/,
  go: /^(?:build|generate|get|install|mod|run|test|work)$/,
  pip: /^(?:install|uninstall)$/, pip3: /^(?:install|uninstall)$/,
  uv: /^(?:add|lock|pip|remove|run|sync)$/, poetry: /^(?:add|install|lock|remove|run|update)$/,
};
// The script a shell command runs: Codex wraps it in bash -lc or pwsh -Command.
function script(command) {
  const words = shellWords(command);
  if (words?.length === 3 && /^(?:bash|sh|zsh)$/.test(words[0].split(/[\\/]/).pop()) && /^-l?c$|^-cl$/.test(words[1])) return words[2];
  return powershellScript(command) ?? command;
}
// Whether a shell script changes files, builds, tests, installs, runs a
// project or reaches the web; reads, searches and lists do not.
function mutating(text) {
  // Quoted text is one word whose metacharacters do nothing.
  let plain = '';
  let quote = '';
  for (const c of text) {
    if (quote) { if (c === quote) quote = ''; else plain += /[\s;&|<>]/.test(c) ? '_' : c; }
    else if (c === '"' || c === "'") quote = c;
    else plain += c;
  }
  for (const segment of plain.split(/[;&|\n]+/)) {
    for (const target of segment.matchAll(/>+\s*([^\s&>]*)/g)) if (target[1] && !NULL_TARGET.test(target[1])) return true;
    const words = segment.trim().split(/\s+/).filter(word => !/^\w+=/.test(word));
    while (['sudo', 'env', 'time', 'nohup', 'command'].includes(words[0])) words.shift();
    if (!words.length) continue;
    const program = words[0].split(/[\\/]/).pop().toLowerCase().replace(/\.(?:exe|cmd|bat|ps1)$/, '');
    if (MUTATING.has(program) || SUBCOMMANDS[program]?.test(words[1] || '')) return true;
    if (['sed', 'perl'].includes(program) && words.some(word => /^-[a-z]*i/.test(word))) return true;
    if (/^(?:python3?|py)$/.test(program) && words[1] === '-m' && /^(?:pip|pytest|venv|build|unittest)$/.test(words[2] || '')) return true;
  }
  return false;
}
const CLAUDE_WRITES = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit']);
const OPENCODE_WRITES = new Set(['write', 'edit', 'patch', 'multiedit', 'apply_patch']);
// Whether a tool call stops a session that has not loaded the skill: a write
// or edit, a web call, or a mutating or long-running command.
function stops(harness, call) {
  if (harness === 'claude') {
    if (CLAUDE_WRITES.has(call.name)) return true;
    if (call.name === 'WebFetch' || call.name === 'WebSearch') return true;
    if ((call.name === 'Bash' || call.name === 'PowerShell') && mutating(String(call.input?.command ?? ''))) return true;
  } else if (harness === 'codex') {
    if (call.type === 'file_change') return true;
    if (call.type === 'web_search') return true;
    if (call.type === 'command_execution' && mutating(script(call.command || ''))) return true;
  } else {
    if (OPENCODE_WRITES.has(call.tool)) return true;
    if (call.tool === 'webfetch' || call.tool === 'websearch') return true;
    if (call.tool === 'bash' && mutating(String(call.state?.input?.command ?? ''))) return true;
  }
  return false;
}
// Reads one session's JSONL events as they arrive. `outcome` is set once the
// firing is known; `pending` holds a stop waiting for the calls issued with it.
function observer(harness, skill, says) {
  const readName = skill.readName || skill.name;
  const folder = '/skills/' + readName + '/';
  const state = {outcome: '', pending: null, fired: false, complete: false, answer: ''};
  const seen = new Set();
  const skillCalls = new Set();
  const loads = new Set();
  const reading = new Set();
  let calls = 0;
  let events = 0;
  const finish = outcome => { state.outcome ||= outcome; };
  // A tool call's index, or -1 when it was already counted (Codex reports a
  // call when it starts and again when it completes, under one id).
  const count = id => {
    if (id !== undefined) { if (seen.has(id)) return -1; seen.add(id); }
    return calls++;
  };
  // A tool call that is not the load stops the session when it is a trigger
  // or past the budget.
  const other = (index, trigger, batch) => {
    if (index < 0 || says || state.fired || state.pending) return;
    if (trigger || index >= BUDGET) state.pending = {batch};
  };
  // The batch an event belongs to: the calls a model issues together.
  function batchOf(e) {
    events++;
    // Claude: parallel calls arrive as one assistant message, possibly split across events.
    if (harness === 'claude') return e.type === 'assistant' && e.message?.id !== undefined ? 'message ' + e.message.id : '#' + events;
    // OpenCode: a step's calls are all reported before its step_finish.
    if (harness === 'opencode') return e.type === 'step_finish' ? '#' + events : 'step';
    // Codex: parallel calls start one after another.
    return e.type === 'item.started' ? 'started' : '#' + events;
  }
  function push(e) {
    const batch = batchOf(e);
    // The first event after the trigger's batch decides the stop.
    if (state.pending && !state.pending.waitFor && state.pending.batch !== batch && settle()) return;
    if (e.type === 'error' || e.type === 'turn.failed' || e.is_error || e.permission_denials?.length || e.type === 'permission_denied') return finish('inconclusive');
    if (harness === 'claude') {
      if (e.type === 'result' && e.subtype === 'success') { state.complete = true; state.answer = e.result || ''; }
      // An errored Skill call leaves firing unobservable; other tools' errors
      // (a failed ls of a missing folder) are not evidence either way.
      for (const block of e.message?.content || []) {
        if (block.type === 'tool_use') {
          const index = count(block.id);
          if (block.name === 'Skill') skillCalls.add(block.id);
          if (block.name === 'Skill' && block.input?.skill === skill.name) { state.fired = true; if (block.id !== undefined) loads.add(block.id); }
          else other(index, stops(harness, block), batch);
        }
        if (block.type === 'tool_result' && block.is_error && (!block.tool_use_id || skillCalls.has(block.tool_use_id))) return finish('inconclusive');
        if (block.type === 'tool_result' && loads.has(block.tool_use_id) && !says) return finish('fired');
      }
    } else if (harness === 'opencode') {
      if (e.type === 'step_finish') state.complete = true;
      if (e.type === 'tool_use') {
        const part = e.part || {};
        const index = count(part.id ?? part.callID);
        if (part.tool === 'skill' && part.state?.status === 'error') return finish('inconclusive');
        if (part.tool === 'skill' && part.state?.status === 'completed' && part.state.metadata?.metadata?.name === skill.name) {
          state.fired = true;
          if (!says) return finish('fired');
        } else other(index, stops(harness, part), batch);
      }
    } else {
      if (e.type === 'turn.completed') state.complete = true;
      const item = e.item;
      if (e.type === 'item.completed' && item?.type === 'agent_message') state.answer = item.text || '';
      if ((e.type === 'item.started' || e.type === 'item.completed') && ['command_execution', 'file_change', 'web_search', 'mcp_tool_call'].includes(item?.type)) {
        const index = count(item.id);
        const mentions = item.type === 'command_execution' ? slashed(item.command || '') : '';
        const names = mentions.includes(folder);
        if (names) reading.add(item.id);
        else other(index, stops(harness, item), batch);
        if (e.type === 'item.completed' && item.type === 'command_execution') {
          reading.delete(item.id);
          // A failed command is evidence only when it names the entry point's folder.
          if (item.status !== 'completed' || item.exit_code !== 0) { if (names) return finish('inconclusive'); }
          else if (plainRead(item.command || '', readName) && outputNames(item.aggregated_output, readName)) {
            state.fired = true;
            if (!says) return finish('fired');
          } else if (mentions.includes(folder + 'SKILL.md')) return finish('inconclusive');
        }
      }
    }
    if (state.fired) state.pending = null;
    if (state.pending?.waitFor) settle();
  }
  // Decides a pending stop: it takes effect once the reads of the skill's
  // folder already running when it was decided (Codex) have ended without
  // a load. Returns whether the session stopped.
  function settle() {
    if (!state.pending || state.outcome) return false;
    state.pending.waitFor ??= new Set(reading);
    for (const id of state.pending.waitFor) if (!reading.has(id)) state.pending.waitFor.delete(id);
    if (state.pending.waitFor.size) return false;
    finish('not fired');
    return true;
  }
  function line(text) {
    if (state.outcome || !text.trim()) return;
    let e;
    try { e = JSON.parse(text); } catch { return finish('inconclusive'); }
    push(e);
  }
  // The verdict once the session has ended.
  function result(run) {
    if (state.outcome) return state.outcome;
    if (run.error || run.status !== 0 || !state.complete) return 'inconclusive';
    const outcome = state.fired ? 'fired' : 'not fired';
    if (!says) return outcome;
    const missing = says.filter(text => !state.answer.includes(text));
    return outcome + (missing.length ? '; says missing ' + missing.map(text => JSON.stringify(text)).join(' ') : '; says all');
  }
  return {state, line, settle, result};
}
function outputNames(output, readName) {
  const lines = (output || '').split(/\r?\n/);
  return lines.includes('---') && lines.includes('name: ' + readName);
}
// Kills a session's whole process tree: its process group on POSIX (the
// session is spawned detached, so it leads one), taskkill /T /F on Windows.
function killTree(child, signal = 'SIGTERM') {
  if (child.pid === undefined) return;
  if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], {stdio: 'ignore', windowsHide: true});
  else try { process.kill(-child.pid, signal); } catch { /* already gone */ }
}
// Runs one session, feeding its stdout to the observer as it arrives. Once the
// outcome is known (and the query has no `says`), the session is stopped. A
// wrapper that sets up its own stop (the evidence capture) gets a stop file
// so it can record and reset before exiting; any other command has its
// process tree killed. Resolves when the session has exited.
function runSession(argv, cwd, watch, stoppable) {
  return new Promise(resolve => {
    const control = fs.mkdtempSync(path.join(os.tmpdir(), 'trigger-eval-'));
    const stopFile = path.join(control, 'stop');
    const run = {status: null, error: null};
    const timers = new Set();
    const later = (ms, action) => { const timer = setTimeout(() => { timers.delete(timer); action(); }, ms); timers.add(timer); return timer; };
    let settleTimer = null;
    let ending = false;
    let closed = false;
    const child = spawn(argv[0], argv.slice(1), {cwd, stdio: ['pipe', 'pipe', 'pipe'], detached: process.platform !== 'win32', windowsHide: true, env: {...process.env, TRIGGER_EVAL_STOP: stopFile}});
    current = () => end();
    // A wrapper names the process groups it started its command in after its
    // own pid in `<stop>.wrapper`; on POSIX they are outside the wrapper's
    // group, so killing the wrapper alone would orphan the harness. Windows'
    // taskkill /T already follows the tree.
    const groups = () => {
      if (process.platform === 'win32') return [];
      try { return fs.readFileSync(stopFile + '.wrapper', 'utf8').trim().split(/\s+/).slice(1).map(Number).filter(pid => Number.isInteger(pid) && pid > 1); }
      catch { return []; }
    };
    const killAll = signal => {
      killTree(child, signal);
      for (const pid of groups()) try { process.kill(-pid, signal); } catch { /* already gone */ }
    };
    const force = () => {
      killAll('SIGTERM');
      if (process.platform !== 'win32') later(KILL_GRACE_MS, () => killAll('SIGKILL'));
    };
    function end() {
      if (ending || closed) return;
      ending = true;
      if (fs.existsSync(stopFile + '.wrapper')) {
        fs.writeFileSync(stopFile, 'stop');
        later(STOP_GRACE_MS, force);
      } else force();
    }
    function check() {
      if (watch.state.outcome) {
        if (settleTimer) { clearTimeout(settleTimer); timers.delete(settleTimer); settleTimer = null; }
        if (stoppable) end();
      } else if (watch.state.pending && !settleTimer) {
        settleTimer = later(SETTLE_MS, () => { settleTimer = null; watch.settle(); check(); });
      }
    }
    const decoder = new StringDecoder('utf8');
    let buffer = '';
    let sizes = {stdout: 0, stderr: 0};
    const over = (stream, chunk) => {
      sizes[stream] += chunk.length;
      if (sizes[stream] <= CAP) return false;
      run.error ??= new Error(`${stream} exceeded ${CAP} bytes`);
      end();
      return true;
    };
    child.stdout.on('data', chunk => {
      if (over('stdout', chunk) || watch.state.outcome) return;
      buffer += decoder.write(chunk);
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const text of lines) watch.line(text);
      check();
    });
    child.stderr.on('data', chunk => over('stderr', chunk));
    child.stdin.on('error', () => {});
    child.stdin.end();
    later(TIMEOUT_MS, () => { run.error ??= new Error(`timed out after ${TIMEOUT_MS} ms`); end(); });
    // Once the leader has exited, kill what is left of its group.
    child.on('exit', () => { if (ending && process.platform !== 'win32') killTree(child, 'SIGKILL'); });
    const done = status => {
      if (closed) return;
      closed = true;
      current = null;
      for (const timer of timers) clearTimeout(timer);
      if (!run.error && !watch.state.outcome) watch.line(buffer + decoder.end());
      run.status = status;
      fs.rmSync(control, {recursive: true, force: true});
      resolve(run);
    };
    child.on('error', error => { run.error ??= error; if (child.pid === undefined) done(null); });
    child.on('close', status => done(status));
  });
}
// The running session's stop, for an interrupt of the evaluator itself.
let current = null;
let interrupted = false;
async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('USAGE: node scripts/eval/trigger.js <queries.json> [--full] [--repeat N]\nRESULT: skill model query fired | not fired | inconclusive [; says all | says missing "<text>"]\nEXIT: 0 frontier pass; 1 frontier fail; 2 inconclusive or invalid input\nSTOP: a query without says ends its session once the firing is known: fired at the skill load; not fired at the first write, edit, web call or mutating or long-running command, or at the 25th tool call, with no load before it\nDOCS: docs/trigger-evals.md');
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
          const says = forHarness(query.says,model.harness);
          const watch = observer(model.harness,skill,says);
          const run = await runSession([...command, ...flags(model,forHarness(query.prompt,model.harness))], path.resolve(path.dirname(file), config.cwd || '.'), watch, !says);
          if (interrupted) throw new Error('interrupted');
          observations.push(watch.result(run));
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
// An interrupted evaluator stops the running session before it exits.
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { interrupted = true; current?.(); setTimeout(() => process.exit(2), STOP_GRACE_MS + KILL_GRACE_MS + 1000).unref(); });
main().catch(error => { console.error(`ERROR: ${error.message}`); process.exitCode = 2; });
