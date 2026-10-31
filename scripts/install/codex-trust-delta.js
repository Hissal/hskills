'use strict';
// Deliberately accept only the hook-state tables emitted by Codex's config writer.
// Unknown syntax/fields fail closed; this is not a general TOML parser.
// Schema: openai/codex 6ff1e1ca3b30fc8b914720681fcf5fe62e95f856 (rust-v0.166.0)
// codex-rs/core/config.schema.json, HookStateToml. Observed writer forms: a bare
// [hooks.state] parent, then "basic" keys, or 'literal' keys when a key has
// backslashes (Windows paths). See docs/evidence/windows-guard-followup.md.

// Track only enough string syntax to know whether a line starts inside a
// multiline string, so text inside strings is never read as a table header.
// Returns the open delimiter after the line, or undefined for unreadable input.
function scan(line, open) {
  let i = 0;
  while (i < line.length) {
    if (open) {
      if (open === '"""' && line[i] === '\\') { i += 2; continue; }
      if (line.startsWith(open, i)) {
        let run = 0;
        while (line[i + run] === open[0]) run++;
        if (run > 5) return undefined;
        open = null; i += run; continue;
      }
      i++; continue;
    }
    const c = line[i];
    if (c === '#' || c === '\n' || c === '\r') break;
    if (line.startsWith('"""', i) || line.startsWith("'''", i)) { open = line.slice(i, i + 3); i += 3; continue; }
    if (c === '"' || c === "'") {
      i++;
      while (i < line.length && line[i] !== c && line[i] !== '\n') i += c === '"' && line[i] === '\\' ? 2 : 1;
      if (line[i] !== c) return undefined;
    }
    i++;
  }
  return open;
}
const PARENT = '[hooks.state]';
const HEADER = /^\[hooks\.state\.(?:("(?:[^"\\\x00-\x1f]|\\.)*")|'([^'\x00-\x1f]*)')\]$/;
function split(bytes) {
  const text = bytes === null ? '' : Buffer.from(bytes, 'base64').toString('utf8');
  const lines = text.match(/[^\n]*\n|[^\n]+$/g) || [];
  let ordinary = '', trust = '', active = false, fields = new Set(), open = null, parent = false;
  const keys = new Set();
  for (const line of lines) {
    const header = !open && /^\s*\[/.test(line);
    if (header) {
      active = false;
      const trimmed = line.trim();
      const match = trimmed.match(HEADER);
      if (trimmed === PARENT) {
        if (parent) return null;
        parent = true; fields = null; active = true;
      } else if (match) {
        let key;
        try { key = match[1] ? JSON.parse(match[1]) : match[2]; } catch { return null; }
        if (!key || keys.has(key)) return null;
        keys.add(key); fields = new Set(); active = true;
      }
    }
    if (active) {
      if (!header && line.trim()) {
        const field = line.trim().match(/^(trusted_hash|trusted_content_hash)\s*=\s*"sha256:[a-f0-9]{64}"$/)
          || line.trim().match(/^(enabled)\s*=\s*(?:true|false)$/);
        if (!fields || !field || fields.has(field[1])) return null;
        fields.add(field[1]);
      }
      trust += line;
    } else {
      open = scan(line, open);
      if (open === undefined) return null;
      ordinary += line;
    }
  }
  if (open) return null;
  return { ordinary: ordinary.replace(/\n+$/, ''), trust };
}
module.exports = function reconcile(w, current) {
  if (current === undefined || current === null) return null;
  const old = split(w.after), next = split(current), before = split(w.before);
  if (!old || !next || !before || old.ordinary !== next.ordinary || old.trust === next.trust) return null;
  // Both sides receive only verified trust tables. Never absorb personal edits.
  const restored = before.ordinary + (before.ordinary ? '\n\n' : '') + next.trust.replace(/^\n+/, '').replace(/\n+$/, '\n');
  return { ...w, before: restored ? Buffer.from(restored).toString('base64') : null, after: current };
};
