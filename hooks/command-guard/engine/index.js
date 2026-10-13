'use strict';
// Command guard engine. classify() turns one shell command into a verdict:
// allow, reflection (a reflection pause) or human-required.
// Rules are data (rules/core.json); the checks they name live here.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { lex } = require('./lex');
const paths = require('./paths');

const MAX_DEPTH = 6;
const SHELLS = new Set(['bash', 'sh', 'zsh', 'dash', 'ksh', 'ash', 'fish']);
const PWSH = new Set(['powershell', 'pwsh']);
const INTERPRETERS = new Set(['python', 'python3', 'py', 'node', 'perl', 'ruby', 'php', 'lua', 'deno', 'bun', 'osascript']);
const CD = new Set(['cd', 'chdir', 'pushd', 'set-location', 'sl', 'push-location']);
const SKIP_FLAGS_WRAPPERS = new Set(['nohup', 'time', 'winpty', 'setsid', 'stdbuf', 'ionice', 'chronic', 'unbuffer', 'builtin']);
const SUDO_VALUE = new Set(['-u', '-g', '-h', '-p', '-C', '-D', '-R', '-T', '-U', '-r', '-t']);
const XARGS_VALUE = new Set(['-I', '-n', '-P', '-d', '-L', '-s', '-E', '-a']);
const PWSH_VALUE = ['executionpolicy', 'ep', 'ex', 'windowstyle', 'workingdirectory', 'wd', 'configurationname', 'inputformat', 'outputformat', 'psconsolefile', 'version', 'custompipename', 'settingsfile'];
const PS_VALUE_PARAMS = ['path', 'literalpath', 'lp', 'pspath', 'filter', 'include', 'exclude', 'stream', 'credential', 'erroraction', 'ea', 'warningaction', 'wa', 'informationaction', 'errorvariable', 'ev', 'warningvariable', 'outvariable', 'ov', 'outbuffer', 'pipelinevariable', 'pv', 'depth'];
const PS_PATH_PARAMS = ['path', 'literalpath', 'lp', 'pspath'];

function loadRules(file) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(data.rules)) throw new Error('rule file has no rules array: ' + file);
  return data;
}

const CORE = loadRules(path.join(__dirname, '..', 'rules', 'core.json'));

function compileRule(rule, origin) {
  if (!rule || typeof rule.id !== 'string') throw new Error('rule without id in ' + origin);
  if (rule.tier !== 'human-required' && rule.tier !== 'reflection') throw new Error('rule ' + rule.id + ' has an unknown tier');
  if (rule.check && !CHECKS[rule.check]) throw new Error('rule ' + rule.id + ' names an unknown check');
  const r = Object.assign({}, rule);
  for (const k of ['anyArg', 'noArg', 'text', 'source', 'commandPattern']) if (r[k]) r[k] = new RegExp(r[k], 'i');
  if (r.command) r.command = new Set(r.command.map((c) => c.toLowerCase()));
  if (!r.command && !r.commandPattern && !r.source && !r.check) throw new Error('rule ' + rule.id + ' matches every command');
  return r;
}

// ---- words and flags ------------------------------------------------------

function cmdName(word) {
  if (!word || word.dynamic) return '';
  const base = word.text.replace(/\\/g, '/').split('/').pop().toLowerCase();
  return base.replace(/\.(exe|cmd|bat|com)$/, '');
}

function isFlag(w) {
  return w.text.length > 1 && w.text[0] === '-';
}

function hasFlag(args, flag, style) {
  const lf = flag.toLowerCase();
  for (const a of args) {
    const t = a.text;
    if (style === 'ps') {
      // "-R[ecurse]": the bracketed tail may be abbreviated
      if (t[0] !== '-') continue;
      const name = t.slice(1).split(':')[0].toLowerCase();
      const m = /^-([^\[]+)(?:\[(.*)\])?$/.exec(lf);
      if (m && name.startsWith(m[1]) && (m[1] + (m[2] || '')).startsWith(name)) return true;
    } else if (style === 'slash') {
      const lt = t.toLowerCase();
      if (lt === lf || lt.startsWith(lf + ':')) return true;
    } else if (flag.startsWith('--')) {
      if (t === flag || t.startsWith(flag + '=')) return true;
    } else if (/^-[A-Za-z0-9]+$/.test(t) && t.includes(flag[1])) return true;
  }
  return false;
}

function anyFlag(args, flags, style) {
  return flags.some((f) => hasFlag(args, f, style));
}

function positionals(args, valueFlags) {
  const out = [];
  for (let i = 0; i < args.length; i++) {
    const t = args[i].text;
    if (t === '--') { out.push(...args.slice(i + 1)); break; }
    if (isFlag(args[i])) {
      if (valueFlags && valueFlags.includes(t)) i++;
      continue;
    }
    out.push(args[i]);
  }
  return out;
}

function matchSub(pos, alts, anywhere) {
  const texts = pos.map((w) => w.text.toLowerCase());
  for (const alt of alts) {
    const last = anywhere ? texts.length - alt.length : 0;
    for (let s = 0; s <= last; s++) {
      if (alt.every((tok, k) => texts[s + k] !== undefined && tok.split('|').includes(texts[s + k]))) return true;
    }
  }
  return false;
}

function quoteJoin(words, q) {
  if (words.length === 1) return words[0].text;
  return words.map((w) => (/\s/.test(w.text) && !/["']/.test(w.text) ? q + w.text + q : w.text)).join(' ');
}

// Strip wrappers such as sudo and env. Returns { name, args, xargs } or null.
function unwrap(cmd) {
  if (cmd.eff !== undefined) return cmd.eff;
  let ws = cmd.words.slice();
  let xargs = false;
  for (let guard = 0; guard < 8 && ws.length; guard++) {
    const name = cmdName(ws[0]);
    let i = 1;
    if (name === 'sudo' || name === 'doas') {
      while (i < ws.length && isFlag(ws[i])) {
        if (ws[i].text === '--') { i++; break; }
        i += SUDO_VALUE.has(ws[i].text) ? 2 : 1;
      }
    } else if (name === 'env') {
      while (i < ws.length && (isFlag(ws[i]) || ws[i].text === '-' || /^[A-Za-z_][A-Za-z0-9_]*=/.test(ws[i].text))) {
        i += ws[i].text === '-u' || ws[i].text === '-C' ? 2 : 1;
      }
    } else if (name === 'command') {
      if (ws[1] && /^-[vV]/.test(ws[1].text)) { ws = []; break; }
      while (i < ws.length && isFlag(ws[i])) i++;
    } else if (name === 'exec') {
      while (i < ws.length && isFlag(ws[i])) i += ws[i].text === '-a' ? 2 : 1;
    } else if (SKIP_FLAGS_WRAPPERS.has(name)) {
      while (i < ws.length && isFlag(ws[i])) i++;
    } else if (name === 'nice') {
      while (i < ws.length && isFlag(ws[i])) i += ws[i].text === '-n' ? 2 : 1;
    } else if (name === 'timeout') {
      while (i < ws.length && isFlag(ws[i])) i += /^-[sk]$/.test(ws[i].text) ? 2 : 1;
      i++;
    } else if (name === 'xargs') {
      while (i < ws.length && isFlag(ws[i])) i += XARGS_VALUE.has(ws[i].text) ? 2 : 1;
      xargs = true;
    } else if (name === 'busybox') {
      // next word is the applet
    } else break;
    ws = ws.slice(i);
  }
  cmd.eff = ws.length ? { name: cmdName(ws[0]), args: ws.slice(1), xargs } : null;
  return cmd.eff;
}

// ---- checks ---------------------------------------------------------------
// A check returns null, or { reason, targets?, unknown? }. `unknown` marks a
// recognized destructive operation whose target cannot be established.

function judge(words, c, verb) {
  const pctx = Object.assign({}, c.ctx, { shell: c.cmd.shell });
  const results = [];
  for (const w of words) results.push(...paths.evalTarget(w, pctx, c.cwd));
  const hits = results.filter((r) => r.reason);
  if (hits.length) {
    return {
      reason: verb + ' ' + hits.map((h) => h.text + ' (' + h.reason + ')').join(', '),
      targets: hits.map((h) => h.resolved),
    };
  }
  const unknown = results.filter((r) => r.unknown);
  if (unknown.length) {
    const why = c.cwd == null ? ' (the working directory is not known at that point)' : '';
    return { unknown: true, reason: verb + ' a target that cannot be established: ' + unknown.map((u) => u.text).join(', ') + why, targets: [] };
  }
  return null;
}

function psParam(name, list) {
  return list.find((p) => p === name || (name.length >= 1 && p.length > 2 && p.startsWith(name)));
}

function psTargets(args) {
  const targets = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.splat) { targets.push(a); continue; }
    if (!a.quoted && isFlag(a)) {
      const [rawName, inline] = a.text.slice(1).split(/:(.*)/s);
      const name = rawName.toLowerCase();
      const isPath = psParam(name, PS_PATH_PARAMS);
      if (inline !== undefined) {
        if (isPath && inline) targets.push(Object.assign({}, a, { text: inline }));
        continue;
      }
      if (psParam(name, PS_VALUE_PARAMS)) {
        i++;
        if (isPath && args[i]) targets.push(args[i]);
      }
      continue;
    }
    targets.push(a);
  }
  return targets;
}

function synthetic(base, suffix) {
  return { text: base.text.replace(/[\\/]+$/, '') + suffix, dynamic: base.dynamic, glob: true, quoted: false, subs: [] };
}

const CHECKS = {
  recursiveDelete(c, params) {
    const { eff, cmd } = c;
    const args = eff.args;
    let targets;
    let verb = 'recursively deletes';
    if (params.kind === 'rm') {
      if (!anyFlag(args, ['-r', '-R', '--recursive'])) return null;
      targets = positionals(args);
    } else if (params.kind === 'remove-item') {
      if (hasFlag(args, '-WhatIf', 'ps') || !hasFlag(args, '-R[ecurse]', 'ps')) return null;
      targets = psTargets(args);
      if (!targets.length && cmd.index > 0) {
        const src = cmd.pipeline[0];
        const se = unwrap(src);
        const sname = se ? se.name : '';
        if (['get-childitem', 'gci', 'ls', 'dir', 'get-item', 'gi'].includes(sname)) {
          let roots = psTargets(se.args);
          if (!roots.length) roots = [{ text: '.', dynamic: false, quoted: false, subs: [] }];
          const item = sname === 'get-item' || sname === 'gi';
          const selective = cmd.index > 1 || se.args.some((a) => isFlag(a) && psParam(a.text.slice(1).toLowerCase(), ['filter', 'include', 'exclude', 'file', 'directory']));
          targets = roots.map((r) => (item ? r : synthetic(r, selective ? '\\*.selected' : '\\*')));
        } else {
          return { unknown: true, reason: 'recursively deletes whatever the pipeline passes in, which cannot be established', targets: [] };
        }
      }
    } else if (params.kind === 'rd') {
      if (!hasFlag(args, '/s', 'slash')) return null;
      targets = args.filter((a) => a.quoted || !/^\/[A-Za-z?]/.test(a.text));
    } else if (params.kind === 'find') {
      const first = args.findIndex((a) => !a.quoted && /^(-|\(|!)/.test(a.text));
      const exprs = first < 0 ? [] : args.slice(first);
      const texts = exprs.map((a) => a.text);
      let deletes = texts.includes('-delete');
      for (let i = 0; i < texts.length && !deletes; i++) {
        if (/^-(exec|execdir|ok|okdir)$/.test(texts[i]) && texts[i + 1] && /(^|[\\/])(rm|rmdir|shred|unlink)$/.test(texts[i + 1])) deletes = true;
      }
      if (!deletes) return null;
      let roots = first < 0 ? args : args.slice(0, first);
      roots = roots.filter((a) => !/^-[HLP]$/.test(a.text));
      if (!roots.length) roots = [{ text: '.', dynamic: false, quoted: false, subs: [] }];
      const selective = texts.some((t) => /^-(i?name|i?path|i?regex|type|[amc]time|[amc]min|newer|size|empty|user|group|perm|maxdepth|i?wholename)$/.test(t));
      targets = roots.map((r) => synthetic(r, selective ? '/*.selected' : '/*'));
      verb = 'deletes what find matches under';
    } else if (params.kind === 'robocopy') {
      if (!args.some((a) => /^\/(mir|purge)$/i.test(a.text))) return null;
      const pos = args.filter((a) => a.quoted || !/^\/[A-Za-z]/.test(a.text));
      if (pos.length < 2) return null;
      targets = [pos[1]];
      verb = 'purges';
    } else if (params.kind === 'rsync') {
      if (!args.some((a) => /^--del/.test(a.text))) return null;
      const pos = positionals(args, ['-e', '--rsh', '--exclude', '--include', '--exclude-from', '--include-from', '--files-from', '-f', '--filter']);
      if (pos.length < 2) return null;
      const dest = pos[pos.length - 1];
      if (/^[^\\/:]{2,}:/.test(dest.text)) return null; // remote destination
      targets = [dest];
      verb = 'deletes from';
    } else return null;
    if (eff.xargs) targets = targets.concat([{ text: '(arguments supplied by xargs)', dynamic: true, quoted: false, subs: [] }]);
    if (!targets.length) return null;
    return judge(targets, c, verb);
  },

  recursivePerms(c, params) {
    const args = c.eff.args;
    let targets;
    if (params.kind === 'chmod') {
      if (!anyFlag(args, ['-R', '--recursive'])) return null;
      const pos = positionals(args);
      targets = args.some((a) => a.text.startsWith('--reference')) ? pos : pos.slice(1);
    } else if (params.kind === 'icacls') {
      if (!hasFlag(args, '/t', 'slash')) return null;
      if (!args.some((a) => /^\/(grant|deny|remove|reset|setowner|inheritance|setintegritylevel|restore)/i.test(a.text))) return null;
      targets = args.slice(0, 1);
    } else if (params.kind === 'takeown') {
      if (!hasFlag(args, '/r', 'slash')) return null;
      const i = args.findIndex((a) => /^\/f$/i.test(a.text));
      targets = i < 0 || !args[i + 1] ? [] : [args[i + 1]];
    } else return null;
    if (c.eff.xargs) targets = targets.concat([{ text: '(arguments supplied by xargs)', dynamic: true, quoted: false, subs: [] }]);
    if (!targets.length) return null;
    return judge(targets, c, 'recursively changes permissions or ownership of');
  },

  ddDevice(c) {
    for (const a of c.eff.args) {
      const m = /^of=(.*)$/.exec(a.text);
      if (m && c.ctx.devices.test(m[1])) return { reason: 'writes to the raw device ' + m[1], targets: [m[1]] };
    }
    return null;
  },

  redirectDevice(c) {
    for (const r of c.cmd.redirects) {
      if (r.op[0] === '>' && c.ctx.devices.test(r.word.text)) return { reason: 'redirects output onto the raw device ' + r.word.text, targets: [r.word.text] };
    }
    return null;
  },

  gitForcePush(c) {
    const g = parseGit(c);
    if (!g || g.sub !== 'push') return null;
    const args = g.rest;
    if (anyFlag(args, ['-n', '--dry-run'])) return null;
    const force = args.some((a) => a.text === '--force' || (/^-[A-Za-z]+$/.test(a.text) && a.text.includes('f')));
    const lease = args.some((a) => a.text.startsWith('--force-with-lease'));
    const pos = positionals(args, ['--repo', '-o', '--push-option', '--receive-pack', '--exec']);
    const remote = pos[0];
    const specs = pos.slice(1);
    const forced = force ? specs : lease ? [] : specs.filter((s) => s.text[0] === '+');
    if (!force && !forced.length) return null;
    if (force && anyFlag(args, ['--all', '--mirror', '--branches'])) {
      return { reason: 'force-pushes every branch, the default branch included, without a lease', targets: ['all branches'] };
    }
    if (g.cwd == null) return { unknown: true, reason: 'force-pushes without a lease from a working directory that cannot be established', targets: [] };
    const git = (a) => c.ctx.git(a, g.cwd);
    const remoteName = remote && !remote.dynamic && /^[\w.-]+$/.test(remote.text) ? remote.text : 'origin';
    let defaults = ['main', 'master'];
    const head = git(['symbolic-ref', '--short', 'refs/remotes/' + remoteName + '/HEAD']);
    if (head) defaults = [head.replace(remoteName + '/', '')];
    let current;
    const dests = [];
    const want = forced.length ? forced : [{ text: 'HEAD' }];
    for (const s of want) {
      if (s.dynamic) return { unknown: true, reason: 'force-pushes without a lease to a branch that cannot be established: ' + s.text, targets: [] };
      const t = s.text.replace(/^\+/, '');
      let dst = t.includes(':') ? t.slice(t.indexOf(':') + 1) : t;
      if (!dst || /^refs\/tags\//.test(dst)) continue;
      dst = dst.replace(/^refs\/heads\//, '');
      if (dst === 'HEAD' || dst === '@') {
        if (current === undefined) current = git(['symbolic-ref', '--short', 'HEAD']);
        if (!current) return { unknown: true, reason: 'force-pushes without a lease to a branch that cannot be established (no current branch found)', targets: [] };
        dst = current;
      }
      dests.push(dst);
    }
    const hit = dests.filter((d) => defaults.includes(d));
    if (!hit.length) return null;
    return { reason: 'force-pushes without a lease to the default branch ' + remoteName + '/' + hit[0], targets: hit.map((h) => remoteName + '/' + h) };
  },

  gitDiscard(c) {
    const g = parseGit(c);
    if (!g) return null;
    const args = g.rest;
    const cluster = (ch) => args.some((a) => /^-[A-Za-z]+$/.test(a.text) && a.text.includes(ch));
    const bulk = (w) => {
      const t = w.text;
      if (w.dynamic || /^(\.|\.\/|:\/|:\/\*|\*)$/.test(t) || /[*?\[]/.test(t) || t.startsWith(':(') || /[\\/]$/.test(t)) return true;
      if (!c.ctx.fsReal || g.cwd == null) return false;
      try { return fs.statSync(path.resolve(g.cwd, t)).isDirectory(); } catch (e) { return false; }
    };
    if (g.sub === 'reset') {
      return args.some((a) => a.text === '--hard') ? { reason: 'git reset --hard discards uncommitted changes to tracked files' } : null;
    }
    if (g.sub === 'clean') {
      if (cluster('n') || args.some((a) => a.text === '--dry-run')) return null;
      if (!cluster('f') && !args.some((a) => a.text === '--force')) return null;
      return { reason: 'git clean deletes untracked files, which git cannot bring back' };
    }
    if (g.sub === 'restore') {
      if (cluster('p') || args.some((a) => a.text === '--patch')) return null;
      const staged = cluster('S') || args.some((a) => a.text === '--staged');
      const worktree = cluster('W') || args.some((a) => a.text === '--worktree');
      if (staged && !worktree) return null;
      if (args.some((a) => a.text.startsWith('--pathspec-from-file'))) return { reason: 'git restore from a pathspec file overwrites tracked files in bulk' };
      const specs = positionals(args, ['-s', '--source']);
      return specs.some(bulk) ? { reason: 'git restore over ' + specs.map((s) => s.text).join(' ') + ' discards uncommitted changes in bulk' } : null;
    }
    if (g.sub === 'checkout' || g.sub === 'switch') {
      if (cluster('f') || args.some((a) => a.text === '--force' || a.text === '--discard-changes')) {
        return { reason: 'a forced ' + g.sub + ' discards uncommitted changes to tracked files' };
      }
      if (g.sub === 'switch' || cluster('p')) return null;
      const dd = args.findIndex((a) => a.text === '--');
      const specs = dd >= 0 ? args.slice(dd + 1) : positionals(args).filter((w) => /^(\.|\.\/|:\/|\*)$/.test(w.text));
      return specs.some(bulk) ? { reason: 'git checkout over ' + specs.map((s) => s.text).join(' ') + ' discards uncommitted changes in bulk' } : null;
    }
    return null;
  },

  sqlText(c, params) {
    const re = new RegExp(params.pattern, 'i');
    const { cmd, eff } = c;
    const texts = [eff.args.map((a) => a.text).join(' '), cmd.stdinText || ''];
    for (const prev of cmd.pipeline.slice(0, cmd.index)) {
      texts.push(prev.words.map((w) => w.text).join(' '), prev.stdinText || '');
    }
    const files = cmd.redirects.filter((r) => r.op === '<').map((r) => r.word);
    for (let i = 0; i < eff.args.length - 1; i++) {
      if (/^(-f|--file|-i|-inputfile|--init)$/i.test(eff.args[i].text)) files.push(eff.args[i + 1]);
    }
    for (const a of eff.args) {
      const m = /^--file=(.+)$/.exec(a.text);
      if (m) files.push({ text: m[1] });
    }
    if (c.ctx.fsReal) {
      for (const f of files) {
        if (f.dynamic) continue;
        const r = paths.resolve(f.text, Object.assign({}, c.ctx, { shell: cmd.shell }), c.cwd);
        if (!r || !r.native) continue;
        try {
          if (fs.statSync(r.native).size <= 1048576) texts.push(fs.readFileSync(r.native, 'utf8'));
        } catch (e) { /* unreadable file: nothing to inspect */ }
      }
    }
    for (const t of texts) {
      const m = re.exec(t);
      if (m) return { reason: 'the SQL contains "' + m[0].trim() + '"' };
    }
    return null;
  },

  downloadExec(c) {
    const { cmd, eff } = c;
    const ctx = c.ctx;
    const name = eff.name;
    const args = eff.args;
    const wordDownloads = (w, depth) => {
      if ((depth || 0) > 6 || !w) return false;
      if (cmd.shell === 'powershell' && /DownloadString|DownloadData|Net\.WebClient|Invoke-WebRequest|Invoke-RestMethod|\b(irm|iwr)\s/i.test(w.text)) return true;
      return (w.subs || []).some((pipes) => pipes.some((pl) => pl.some((sc) => stageDownloads(sc, (depth || 0) + 1))));
    };
    const stageDownloads = (sc, depth) => {
      const e = unwrap(sc);
      if (e && ctx.downloaders.has(e.name)) return true;
      if (/\.Download(String|Data)\(/i.test(sc.raw)) return true;
      return sc.words.some((w) => wordDownloads(w, depth));
    };
    let stdin = false;
    let code = [];
    const pos = args.filter((a) => a.quoted || !isFlag(a));
    if (SHELLS.has(name)) {
      const ci = args.findIndex((a) => /^-[A-Za-z]*c[A-Za-z]*$/.test(a.text));
      if (ci >= 0) code = args.slice(ci + 1, ci + 2);
      else if (pos[0] && pos[0].procsub) code = [pos[0]];
      else if (!pos.length || pos[0].text === '-' || args.some((a) => /^-[A-Za-z]*s[A-Za-z]*$/.test(a.text))) stdin = true;
    } else if (name === 'eval') code = args;
    else if (name === 'source' || name === '.') {
      code = args.slice(0, 1).filter((a) => a.procsub);
      stdin = !!args[0] && args[0].text === '/dev/stdin';
    } else if (name === 'iex' || name === 'invoke-expression') {
      code = args;
      stdin = true;
    } else if (INTERPRETERS.has(name)) {
      const ci = args.findIndex((a) => /^(-c|-e|--eval|-r|-p|--print)$/.test(a.text));
      if (ci >= 0) code = args.slice(ci + 1, ci + 2);
      else if (pos[0] && pos[0].procsub) code = [pos[0]];
      else if (!pos.length || pos[0].text === '-') stdin = !args.some((a) => a.text === '-m');
    } else if (PWSH.has(name)) {
      const ci = args.findIndex((a) => /^-c(o(m(m(a(nd?)?)?)?)?)?$/i.test(a.text));
      if (ci >= 0) code = args.slice(ci + 1);
      if (!args.length || args.some((a) => a.text === '-')) stdin = true;
    } else if (/\[scriptblock\]::create/i.test(cmd.raw)) {
      code = cmd.words;
    } else return null;
    if (stdin && cmd.pipeline.slice(0, cmd.index).some((sc) => stageDownloads(sc, 0))) {
      return { reason: 'pipes downloaded content straight into ' + name };
    }
    if (code.some((w) => wordDownloads(w, 0))) return { reason: 'has ' + (name || 'a script block') + ' execute downloaded content' };
    return null;
  },
};

function parseGit(c) {
  const args = c.eff.args;
  let cwd = c.cwd;
  let i = 0;
  while (i < args.length) {
    const t = args[i].text;
    if (t === '-C') {
      const w = args[i + 1];
      const r = w && !w.dynamic ? paths.resolve(w.text, Object.assign({}, c.ctx, { shell: c.cmd.shell }), cwd) : null;
      cwd = r && r.native ? r.native : null;
      i += 2;
    } else if (['-c', '--git-dir', '--work-tree', '--namespace', '--exec-path', '--config-env'].includes(t)) i += 2;
    else if (isFlag(args[i])) i++;
    else break;
  }
  if (i >= args.length) return null;
  return { sub: args[i].text, rest: args.slice(i + 1), cwd };
}

// ---- classification -------------------------------------------------------

function matchRule(rule, c) {
  const { eff, cmd } = c;
  if (rule.source) return null;
  if (rule.shells && !rule.shells.includes(cmd.shell)) return null;
  if (rule.command && !rule.command.has(eff.name)) return null;
  if (rule.commandPattern && !rule.commandPattern.test(eff.name)) return null;
  const args = eff.args;
  if (rule.sub && !matchSub(positionals(args, rule.valueFlags), rule.sub, rule.subAnywhere)) return null;
  if (rule.firstPositionalNot) {
    const first = positionals(args)[0];
    if (!first || rule.firstPositionalNot.includes(first.text.toLowerCase())) return null;
  }
  if (rule.anyFlag && !anyFlag(args, rule.anyFlag, rule.flagStyle)) return null;
  if (rule.allFlag && !rule.allFlag.every((f) => hasFlag(args, f, rule.flagStyle))) return null;
  if (rule.noFlag && anyFlag(args, rule.noFlag, rule.flagStyle)) return null;
  if (rule.anyArg && !args.some((a) => rule.anyArg.test(a.text))) return null;
  if (rule.noArg && args.some((a) => rule.noArg.test(a.text))) return null;
  if (rule.text && !rule.text.test([eff.name].concat(args.map((a) => a.text)).join(' '))) return null;
  if (!rule.check) return { reason: rule.effect || rule.id };
  return CHECKS[rule.check](c, rule.params || {});
}

function decodePs(b64) {
  if (!/^[A-Za-z0-9+/=]+$/.test(b64) || b64.length % 4 === 1) return null;
  const buf = Buffer.from(b64, 'base64');
  return buf.length ? buf.toString('utf16le') : null;
}

// Commands that carry another command line: classify that one too.
function nested(c, run) {
  const { eff, cmd } = c;
  const { name, args } = eff;
  const isStatic = (ws) => ws.length > 0 && ws.every((w) => !w.dynamic);
  if (SHELLS.has(name) || name === 'su') {
    const ci = args.findIndex((a) => /^-[A-Za-z]*c[A-Za-z]*$/.test(a.text));
    if (ci >= 0 && args[ci + 1] && !args[ci + 1].dynamic) run(args[ci + 1].text, 'bash');
    else if (ci < 0 && cmd.stdinText && SHELLS.has(name) && !args.some((a) => a.quoted || !isFlag(a))) run(cmd.stdinText, 'bash');
  } else if (name === 'cmd') {
    const ci = args.findIndex((a) => /^\/{1,2}[ckr]$/i.test(a.text));
    if (ci >= 0 && isStatic(args.slice(ci + 1))) run(quoteJoin(args.slice(ci + 1), '"'), 'cmd');
  } else if (PWSH.has(name)) {
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      const flag = !a.quoted && isFlag(a) ? a.text.slice(1).toLowerCase() : null;
      if (flag === null) {
        if (isStatic(args.slice(i))) run(quoteJoin(args.slice(i), "'"), 'powershell');
        break;
      }
      if (/^e(c|n(c(o(d(e(d(c(o(m(m(a(nd?)?)?)?)?)?)?)?)?)?)?)?)?$/.test(flag)) {
        const decoded = args[i + 1] && !args[i + 1].dynamic ? decodePs(args[i + 1].text) : null;
        if (decoded) run(decoded, 'powershell');
        break;
      }
      if (/^c(o(m(m(a(nd?)?)?)?)?)?$/.test(flag)) {
        const rest = args.slice(i + 1);
        if (rest.length === 1 && rest[0].text === '-') { if (cmd.stdinText) run(cmd.stdinText, 'powershell'); } else if (isStatic(rest)) run(quoteJoin(rest, "'"), 'powershell');
        break;
      }
      if (/^f(i(le?)?)?$/.test(flag)) break;
      if (PWSH_VALUE.includes(flag)) i++;
    }
  } else if (name === 'wsl') {
    let i = 0;
    while (i < args.length && isFlag(args[i])) {
      const t = args[i].text;
      if (t === '--' || t === '-e' || t === '--exec') { i++; break; }
      if (['-d', '--distribution', '-u', '--user', '--cd', '--shell-type'].includes(t)) i += 2;
      else if (t.startsWith('--')) return;
      else i++;
    }
    if (isStatic(args.slice(i))) run(quoteJoin(args.slice(i), '"'), 'bash');
  } else if (name === 'eval') {
    if (isStatic(args)) run(args.map((a) => a.text).join(' '), 'bash');
  } else if (name === 'iex' || name === 'invoke-expression') {
    const ws = args.filter((a) => a.quoted || !isFlag(a));
    if (isStatic(ws)) run(ws.map((a) => a.text).join(' '), 'powershell');
  } else if (cmd.shell === 'powershell' && (name === 'start-process' || name === 'saps' || name === 'start')) {
    const ws = args.filter((a) => a.quoted || !isFlag(a));
    if (isStatic(ws)) run(quoteJoin(ws, "'"), 'powershell');
  }
}

function classifyIn(command, shell, cwd, depth, ctx, findings) {
  if (depth > MAX_DEPTH) {
    findings.push({ rule: 'guard.depth', tier: 'human-required', family: 'unknown-target', reason: 'commands are nested too deeply to inspect', targets: [] });
    return;
  }
  const fwd = (p) => (p == null ? null : ctx.platform === 'win32' && shell === 'bash' ? p.replace(/\\/g, '/') : p);
  const { pipelines, unquoted } = lex(command, shell, { env: ctx.env, homeText: fwd(ctx.home), cwdText: fwd(cwd), tmpText: fwd(ctx.tmp), gitBash: ctx.platform === 'win32' && shell === 'bash' });
  for (const rule of ctx.rules) {
    if (rule.source && (!rule.shells || rule.shells.includes(shell)) && rule.source.test(unquoted)) {
      findings.push({ rule: rule.id, tier: rule.tier, family: rule.family, reason: rule.effect || rule.id, targets: [] });
    }
  }
  let cur = cwd;
  for (const pipeline of pipelines) {
    for (const cmd of pipeline) {
      const eff = unwrap(cmd);
      if (!eff) continue;
      if (CD.has(eff.name) && !(shell === 'bash' && (eff.name === 'sl' || eff.name === 'chdir'))) {
        const pos = shell === 'powershell' ? psTargets(eff.args) : eff.args.filter((a) => a.quoted || !(isFlag(a) || (shell === 'cmd' && /^\/[a-z]$/i.test(a.text))));
        const w = pos[0];
        if (!w) cur = eff.name === 'pushd' || shell === 'cmd' ? cur : ctx.home;
        else if (w.dynamic || w.text === '-') cur = null;
        else {
          const r = paths.resolve(w.text, Object.assign({}, ctx, { shell }), cur);
          cur = r && r.native ? (r.flavor === 'win' ? r.native : path.posix.normalize(r.native)) : null;
        }
        continue;
      }
      if (eff.name === 'popd' || eff.name === 'pop-location') { cur = null; continue; }
      const c = { cmd, eff, ctx, cwd: cur };
      nested(c, (text, sh) => classifyIn(text, sh, cur, depth + 1, ctx, findings));
      for (const rule of ctx.rules) {
        const hit = matchRule(rule, c);
        if (!hit) continue;
        findings.push({
          rule: rule.id,
          tier: hit.unknown ? 'human-required' : rule.tier,
          family: hit.unknown ? 'unknown-target' : rule.family,
          reason: hit.reason,
          targets: hit.targets || [],
          command: cmd.raw.trim(),
        });
      }
    }
  }
}

function defaultGit(args, cwd) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', timeout: 4000, stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true }).trim() || null;
  } catch (e) {
    return null;
  }
}

function expandProtected(list, env, win, lower) {
  const out = [];
  for (const entry of list) {
    let missing = false;
    const s = entry.replace(/%([^%]+)%/g, (m, n) => {
      const v = env(n);
      if (v == null) missing = true;
      return v == null ? '' : v;
    });
    if (missing) continue;
    out.push(win ? paths.canonWin(s) : paths.canonPosix(s, lower));
  }
  return out;
}

// opts: { shell: 'bash'|'powershell'|'cmd'|'auto', cwd, platform, env, home, tmp, fsReal, repoRoot, git, extraRules }
function classify(command, opts) {
  opts = opts || {};
  const platform = opts.platform || process.platform;
  const win = platform === 'win32';
  const envObj = opts.env || process.env;
  const envKeys = win ? new Map(Object.keys(envObj).map((k) => [k.toLowerCase(), k])) : null;
  const env = (name) => {
    if (Object.prototype.hasOwnProperty.call(envObj, name)) return envObj[name];
    const k = envKeys && envKeys.get(String(name).toLowerCase());
    return k === undefined || k === null ? null : envObj[k];
  };
  const fsReal = opts.fsReal !== undefined ? opts.fsReal : platform === process.platform;
  const home = opts.home || os.homedir();
  const lower = platform === 'darwin';
  const ctx = {
    platform,
    env,
    home,
    tmp: opts.tmp || os.tmpdir(),
    fsReal,
    git: opts.git || (fsReal ? defaultGit : () => null),
    devices: new RegExp(CORE.devices, 'i'),
    downloaders: new Set(CORE.downloaders),
    protected: {
      posix: { exact: expandProtected(CORE.protected.posix.exact, env, false, lower), tree: expandProtected(CORE.protected.posix.tree, env, false, lower) },
      windows: { exact: expandProtected(CORE.protected.windows.exact, env, true), tree: expandProtected(CORE.protected.windows.tree, env, true) },
    },
    rules: CORE.rules.map((r) => compileRule(r, 'core')).concat((opts.extraRules || []).map((r) => compileRule(r, 'project'))),
  };
  if (opts.repoRoot !== undefined) ctx.repoRoot = opts.repoRoot;
  ctx.tempRoots = win
    ? { win: [paths.canonWin(ctx.tmp)], posix: [] }
    : { win: [], posix: [paths.canonPosix(ctx.tmp, lower), '/tmp', '/var/tmp', '/private/tmp'] };
  ctx.homeCanon = win ? { win: paths.canonWin(home), posix: null } : { win: null, posix: paths.canonPosix(home, lower) };

  const shells = opts.shell && opts.shell !== 'auto' ? [opts.shell] : win ? ['powershell', 'bash'] : ['bash'];
  const findings = [];
  for (const shell of shells) classifyIn(String(command), shell, opts.cwd || null, 0, ctx, findings);

  const seen = new Set();
  const unique = findings.filter((f) => {
    const k = f.rule + '\0' + f.reason;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const verdict = unique.some((f) => f.tier === 'human-required') ? 'human-required' : unique.length ? 'reflection' : 'allow';
  return { verdict, findings: unique };
}

module.exports = { classify, loadRules };
