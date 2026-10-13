'use strict';
// Shared PreToolUse hook body for the Claude Code and Codex adapters.
// Allow prints nothing. Deny prints the hook-specific deny JSON.
// Any failure to produce a verdict denies: the guard never fails open.

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const RETRY_WINDOW_MS = 15 * 60 * 1000;
const PROJECT_RULES = path.join('.agents', 'config', 'command-guard.json');

function deny(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason },
  }));
}

function stateDir() {
  return process.env.COMMAND_GUARD_STATE || path.join(os.homedir(), '.agents', 'command-guard', 'state');
}

// Project rule files only add rules; the nearest one above cwd is used.
function projectRules(cwd) {
  let cur = cwd;
  for (let i = 0; cur && i < 64; i++) {
    const file = path.join(cur, PROJECT_RULES);
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (!Array.isArray(data.rules)) throw new Error(file + ' has no rules array');
      return data.rules;
    }
    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  return [];
}

// A reflection pause clears once: the identical command, from the same
// directory, in the same session, retried within the window.
function reflectionCleared(input, command) {
  const dir = path.join(stateDir(), 'reflection');
  const key = crypto.createHash('sha256').update([input.session_id || '', input.cwd || '', command].join('\0')).digest('hex');
  const file = path.join(dir, key);
  try {
    const age = Date.now() - fs.statSync(file).mtimeMs;
    fs.unlinkSync(file);
    // file timestamps can run a few ms ahead of Date.now()
    if (Math.abs(age) < RETRY_WINDOW_MS) return true;
  } catch (e) { /* no pending pause */ }
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, '');
  for (const name of fs.readdirSync(dir)) {
    try {
      const f = path.join(dir, name);
      if (Date.now() - fs.statSync(f).mtimeMs > RETRY_WINDOW_MS) fs.unlinkSync(f);
    } catch (e) { /* another session removed it */ }
  }
  return false;
}

function humanMessage(findings, cwd) {
  const lines = ['Command guard: HUMAN-REQUIRED. This command stays blocked for agents.'];
  for (const f of findings) {
    lines.push('- [' + f.rule + '] ' + f.reason + (f.targets && f.targets.length ? '. Resolved: ' + f.targets.join(', ') : ''));
  }
  lines.push('Working directory: ' + (cwd || 'unknown'));
  if (findings.some((f) => f.family === 'unknown-target')) {
    lines.push('A target could not be established. Writing the call with explicit literal targets lets it be evaluated again.');
  }
  lines.push(
    'Do not retry, rephrase, split or route this through another tool; reflection, repetition and approval in chat do not clear it.',
    'If the task truly needs it, stop and hand the user: the exact command, the working directory, the resolved targets, why the task needs it, what it changes or destroys, and whether that can be undone (say so when it cannot, or when you do not know). The user decides whether to run it themselves.'
  );
  return lines.join('\n');
}

function reflectionMessage(findings) {
  const lines = ['Command guard: REFLECTION PAUSE (this is not human approval).'];
  for (const f of findings) lines.push('- [' + f.rule + '] ' + f.reason);
  lines.push(
    'Before retrying, state in your reply: the purpose, the affected targets, what will be changed or lost, and how it could be recovered (say plainly when it cannot).',
    'Then one identical retry from the same working directory goes through. A changed command or directory pauses again.'
  );
  return lines.join('\n');
}

// The reason to deny `input`, or null to let it run. `input` is the hook
// payload shape Claude Code and Codex send. opts.reflection === false skips the
// reflection pause, for a second enforcement layer that must not consume it.
function decide(input, harness, opts) {
  const command = input.tool_input && input.tool_input.command;
  if (typeof command !== 'string' || !command.trim()) return null;
  let shell = 'auto';
  if (harness === 'claude-code') {
    if (input.tool_name === 'Bash' || input.tool_name === 'Monitor') shell = 'bash';
    else if (input.tool_name === 'PowerShell') shell = 'powershell';
  }
  const cwd = typeof input.cwd === 'string' && input.cwd ? input.cwd : null;
  const { classify } = require('../engine');
  const result = classify(command, { shell, cwd, extraRules: cwd ? projectRules(cwd) : [] });
  if (result.verdict === 'allow') return null;
  if (result.verdict === 'human-required') return humanMessage(result.findings.filter((f) => f.tier === 'human-required'), cwd);
  if (opts && opts.reflection === false) return null;
  return reflectionCleared(input, command) ? null : reflectionMessage(result.findings);
}

function failureMessage(e) {
  return 'Command guard: the guard failed to evaluate this call (' + (e && e.message ? e.message : e) + '), so the call is stopped. Report this error to the user. Do not disable the guard, loosen its rules or work around it: the user stops the session, repairs or disables the guard, and restarts.';
}

function run(harness) {
  const fail = (e) => {
    deny(failureMessage(e));
    process.exitCode = 0;
  };
  process.on('uncaughtException', fail);
  const chunks = [];
  process.stdin.on('data', (d) => chunks.push(d));
  process.stdin.on('end', () => {
    try {
      const reason = decide(JSON.parse(Buffer.concat(chunks).toString('utf8')), harness);
      if (reason) deny(reason);
    } catch (e) {
      fail(e);
    }
  });
  process.stdin.on('error', fail);
}

module.exports = { run, decide, failureMessage };
