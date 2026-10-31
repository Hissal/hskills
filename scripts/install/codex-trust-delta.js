'use strict';
// Deliberately accept only the hook-state tables emitted by Codex's config writer,
// and the few runtime preference tables listed in PREFERENCES.
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
// Codex runtime preferences, preserved as their current bytes, never written or
// granted by the installer. Codex 0.166.0 writes them through toml_edit outside
// any install: codex-rs/tui/src/screen_reader.rs sets [tui] screen_reader_detection_done
// (and animations = false when it detects a reader); ConfigEditsBuilder::set_windows_sandbox_mode
// in codex-rs/core/src/config/edit.rs sets [windows] sandbox. Types: config.schema.json
// Tui and WindowsToml. A table holding any other field stays ordinary bytes.
const PREFERENCES = {
  '[tui]': /^(screen_reader_detection_done|animations)\s*=\s*(?:true|false)$/,
  '[windows]': /^(sandbox)\s*=\s*"(?:elevated|unelevated|mxc)"$/,
};
function hookField(line, fields) {
  const field = line.match(/^(trusted_hash|trusted_content_hash)\s*=\s*"sha256:[a-f0-9]{64}"$/)
    || line.match(/^(enabled)\s*=\s*(?:true|false)$/);
  if (!fields || !field || fields.has(field[1])) return false;
  fields.add(field[1]);
  return true;
}
// Splits a config into ordinary bytes and metadata: hook-state tables plus the
// known preference tables. Returns null for anything it cannot read exactly.
function split(bytes) {
  const text = bytes === null ? '' : Buffer.from(bytes, 'base64').toString('utf8');
  const lines = text.match(/[^\n]*\n|[^\n]+$/g) || [];
  const blocks = [{ header: null, lines: [] }];
  let open = null;
  for (const line of lines) {
    if (!open && /^\s*\[/.test(line)) blocks.push({ header: line.trim(), lines: [] });
    blocks[blocks.length - 1].lines.push(line);
    open = scan(line, open);
    if (open === undefined) return null;
  }
  if (open) return null;
  let ordinary = '', metadata = '', parent = false;
  const parts = [], keys = new Set(), seen = new Set();
  for (const block of blocks) {
    let kept = false;
    const body = block.lines.slice(1).map(l => l.trim()).filter(Boolean);
    const match = block.header && block.header.match(HEADER);
    if (block.header === PARENT) {
      if (parent || body.length) return null;
      parent = kept = true;
    } else if (match) {
      let key;
      try { key = match[1] ? JSON.parse(match[1]) : match[2]; } catch { return null; }
      if (!key || keys.has(key)) return null;
      keys.add(key);
      const fields = new Set();
      if (!body.every(line => hookField(line, fields))) return null;
      kept = true;
    } else if (PREFERENCES[block.header]) {
      if (seen.has(block.header)) return null;
      seen.add(block.header);
      const fields = body.map(line => (line.match(PREFERENCES[block.header]) || [])[1]);
      kept = fields.every(Boolean) && new Set(fields).size === fields.length;
    }
    const chunk = block.lines.join('');
    if (kept) metadata += chunk; else ordinary += chunk;
    const last = parts[parts.length - 1];
    if (last && last.metadata === kept) last.text += chunk;
    else if (chunk) parts.push({ metadata: kept, text: chunk });
  }
  return { ordinary: ordinary.replace(/\n+$/, ''), metadata, parts };
}
module.exports = function reconcile(w, current) {
  if (current === undefined || current === null) return null;
  const old = split(w.after), next = split(current), before = split(w.before);
  if (!old || !next || !before || old.ordinary !== next.ordinary || old.metadata === next.metadata) return null;
  // Both sides receive only verified metadata tables. Never absorb personal edits.
  let inserted = false;
  let restored = before.parts.map(part => {
    if (!part.metadata) return part.text;
    if (inserted) return '';
    inserted = true;
    return next.metadata;
  }).join('');
  if (!inserted && next.metadata) {
    restored += (restored && !restored.endsWith('\n') ? '\n' : '') + next.metadata;
  }
  const restoredBefore = restored !== '' || w.before !== null ? Buffer.from(restored).toString('base64') : null;
  return { ...w, before: restoredBefore, after: current };
};
