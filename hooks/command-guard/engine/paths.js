'use strict';
// Path resolution and protected-directory classification for the command guard.

const fs = require('fs');
const path = require('path');

const BARE_WILDCARD = /^(\*|\.\*|\*\.\*|\*\*|\.\[\^\.\]\*|\.\?\?\*)$/;

function canonWin(p) {
  let s = p.replace(/\//g, '\\');
  s = s.replace(/^\\\\\?\\(UNC\\)?/i, (m, unc) => (unc ? '\\\\' : ''));
  s = path.win32.normalize(s);
  const parts = s.split('\\').map((c, i) => (i === 0 ? c : c.replace(/[. ]+$/, '')));
  s = parts.join('/').toLowerCase();
  if (/^[a-z]:$/.test(s)) s += '/';
  if (s.length > 3 && !/^\/\/[^/]+\/[^/]+\/?$/.test(s)) s = s.replace(/\/+$/, '');
  return s;
}

function canonPosix(p, lower) {
  let s = path.posix.normalize(p);
  if (s.length > 1) s = s.replace(/\/+$/, '');
  return lower ? s.toLowerCase() : s;
}

// ctx: { platform, shell, home, tmp, fsReal, protected }
// Returns { p, flavor, native } | { skip: true } | null when it cannot be established.
function resolve(text, ctx, cwd) {
  const win = ctx.platform === 'win32';
  const shell = ctx.shell;
  let t = text;
  if (!t) return null;
  if (win) {
    if (/^\\\\\?\\/.test(t)) t = t.replace(/^\\\\\?\\(UNC\\)?/i, (m, unc) => (unc ? '\\\\' : ''));
    if (/^[A-Za-z]:([\\/]|$)/.test(t)) return winResult(t);
    if (/^[A-Za-z]:/.test(t)) return null; // drive-relative
    if (/^(\\\\|\/\/)[^\\/]+[\\/]+[^\\/]+/.test(t)) return winResult(t);
    if (shell === 'bash') {
      if (t[0] === '/') {
        let m = /^\/(?:mnt\/|cygdrive\/)?([A-Za-z])(\/.*)?$/.exec(t);
        if (m) return winResult(m[1] + ':' + (m[2] || '/'));
        m = /^\/tmp(\/.*)?$/.exec(t);
        if (m && ctx.tmp) return winResult(ctx.tmp + (m[1] || ''));
        return { p: canonPosix(t, false), flavor: 'posix', native: null };
      }
    } else {
      if (/^[A-Za-z][A-Za-z0-9]+:/.test(t)) return { skip: true }; // PowerShell provider path
      if (t[0] === '\\' || t[0] === '/') {
        if (!cwd) return null;
        return winResult(cwd.slice(0, 2) + t);
      }
    }
    if (!cwd) return null;
    return winResult(cwd.replace(/[\\/]+$/, '') + '\\' + t);
  }
  const lower = ctx.platform === 'darwin';
  if (t[0] === '/') return posixResult(t, lower);
  if (!cwd) return null;
  return posixResult(cwd.replace(/\/+$/, '') + '/' + t, lower);

  function winResult(raw) {
    return { p: canonWin(raw), flavor: 'win', native: path.win32.normalize(raw.replace(/\//g, '\\')) };
  }
  function posixResult(raw, lc) {
    return { p: canonPosix(raw, lc), flavor: 'posix', native: raw };
  }
}

// The physical location: resolve links on the deepest existing ancestor.
function physical(r, ctx) {
  if (!ctx.fsReal || !r.native) return null;
  let cur = r.native;
  const tail = [];
  for (let i = 0; i < 64; i++) {
    try {
      const real = fs.realpathSync.native(cur);
      const joined = tail.length ? path.join(real, ...tail.reverse()) : real;
      return r.flavor === 'win' ? canonWin(joined) : canonPosix(joined, ctx.platform === 'darwin');
    } catch (e) {
      const parent = path.dirname(cur);
      if (parent === cur) return null;
      tail.push(path.basename(cur));
      cur = parent;
    }
  }
  return null;
}

function under(p, dir) {
  return p === dir || p.startsWith(dir.endsWith('/') ? dir : dir + '/');
}

function hasGitEntry(native, ctx) {
  if (!ctx.fsReal || !native) return false;
  try {
    return fs.statSync(native).isDirectory() && fs.existsSync(path.join(native, '.git'));
  } catch (e) {
    return false;
  }
}

function findRepoRoot(cwd, ctx) {
  if (ctx.repoRoot !== undefined) return ctx.repoRoot;
  if (!ctx.fsReal || !cwd) return null;
  ctx.repoCache = ctx.repoCache || new Map();
  if (ctx.repoCache.has(cwd)) return ctx.repoCache.get(cwd);
  let cur = cwd;
  let found = null;
  for (let i = 0; i < 64; i++) {
    if (fs.existsSync(path.join(cur, '.git'))) { found = cur; break; }
    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  ctx.repoCache.set(cwd, found);
  return found;
}

// Why deleting or re-permissioning `r` recursively is protected, or null.
function protectedReason(r, ctx, cwd) {
  const cands = [r.p];
  const phys = physical(r, ctx);
  if (phys && phys !== r.p) cands.push(phys);
  const prot = ctx.protected[r.flavor === 'win' ? 'windows' : 'posix'];
  for (const p of cands) {
    if (r.flavor === 'win') {
      if (/^[a-z]:\/$/.test(p)) return 'a drive root';
      if (/^\/\/[^/]+\/[^/]+\/?$/.test(p)) return 'a network share root';
    } else {
      if (p === '/') return 'the filesystem root';
      if (/^\/mnt\/[a-z]$/.test(p) || /^\/volumes\/[^/]+$/i.test(p)) return 'a drive root';
    }
    for (const t of prot.tree) if (under(p, t)) return 'inside the system directory ' + t;
    for (const t of prot.exact) if (p === t) return 'a system directory';
    const home = ctx.homeCanon[r.flavor];
    if (home) {
      if (p === home) return 'the home directory';
      if (under(home, p)) return 'a directory that contains the home directory';
    }
    const base = p.slice(p.lastIndexOf('/') + 1);
    if (base === '.git') return 'a .git directory';
    if (/\/\.git\/(objects|refs)(\/|$)/.test(p)) return 'the object store of a .git directory';
  }
  // A repository root inside the OS temp directory is a throwaway clone:
  // deleting it destroys nothing in a main checkout or worktree. Every
  // candidate must be inside temp, so a link out of temp stays protected.
  const temps = (ctx.tempRoots && ctx.tempRoots[r.flavor]) || [];
  if (cands.every((p) => temps.some((t) => p !== t && under(p, t)))) return null;
  const repo = findRepoRoot(cwd, ctx);
  if (repo) {
    const rr = resolve(repo, Object.assign({}, ctx, { shell: 'native' }), null);
    if (rr && rr.flavor === r.flavor) {
      for (const p of cands) {
        if (p === rr.p) return 'the repository root';
        if (under(rr.p, p)) return 'a directory that contains the repository root';
      }
    }
  }
  if (hasGitEntry(r.native, ctx)) return 'a repository root';
  return null;
}

function isRootOrTree(r, ctx) {
  const prot = ctx.protected[r.flavor === 'win' ? 'windows' : 'posix'];
  if (r.flavor === 'win' ? /^[a-z]:\/$/.test(r.p) : r.p === '/') return true;
  return prot.tree.some((t) => under(r.p, t));
}

function expandBraces(text) {
  const m = /^(.*?)\{([^{}]*,[^{}]*)\}(.*)$/.exec(text);
  if (!m) return [text];
  const out = [];
  for (const alt of m[2].split(',')) out.push(...expandBraces(m[1] + alt + m[3]));
  return out.slice(0, 64);
}

// Evaluate one target word of a recursive operation.
// Returns [{ text, resolved, reason, unknown }]
function evalTarget(word, ctx, cwd) {
  if (word.dynamic) return [{ text: word.text, unknown: true }];
  const wild = ctx.shell !== 'bash' || word.glob;
  const texts = ctx.shell === 'bash' && !word.quoted ? expandBraces(word.text) : [word.text];
  const out = [];
  for (const text of texts) {
    const parts = text.split(/[\\/]/);
    const wi = wild ? parts.findIndex((c) => /[*?]|\[.+\]/.test(c)) : -1;
    if (wi < 0) {
      const r = resolve(text, ctx, cwd);
      if (!r) { out.push({ text, unknown: true }); continue; }
      if (r.skip) continue;
      out.push({ text, resolved: r.p, reason: protectedReason(r, ctx, cwd) });
      continue;
    }
    const sep = /\\/.test(text) && ctx.shell !== 'bash' ? '\\' : '/';
    let baseText = parts.slice(0, wi).join(sep);
    if (wi > 0 && baseText === '') baseText = sep;
    if (/^[A-Za-z]:$/.test(baseText)) baseText += sep;
    const r = resolve(baseText || '.', ctx, cwd);
    if (!r) { out.push({ text, unknown: true }); continue; }
    if (r.skip) continue;
    const rest = parts.slice(wi).filter((c) => c !== '');
    let reason = null;
    if (rest.length === 1 && BARE_WILDCARD.test(rest[0])) {
      const why = protectedReason(r, ctx, cwd);
      if (why) reason = 'everything in ' + why.replace(/^inside /, '');
    } else if (isRootOrTree(r, ctx)) {
      reason = 'a pattern directly under a root or system directory';
    }
    out.push({ text, resolved: r.p + (r.p.endsWith('/') ? '' : '/') + rest.join('/'), reason });
  }
  return out;
}

module.exports = { resolve, protectedReason, evalTarget, canonWin, canonPosix, findRepoRoot };
