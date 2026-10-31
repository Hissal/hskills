'use strict';
// Deliberately accept only the table form emitted by Codex's config writer.
// Unknown syntax/fields fail closed; this is not a general TOML parser.
// Schema: openai/codex rust-v0.166.0 core/config.schema.json, HookStateToml.
function split(bytes) {
  const text = bytes === null ? '' : Buffer.from(bytes, 'base64').toString('utf8');
  // Avoid mistaking table-looking text inside multiline strings for settings.
  if (text.includes('"""') || text.includes("'''")) return null;
  const lines = text.match(/[^\n]*\n|[^\n]+$/g) || [];
  let ordinary = '', trust = '', active = false, fields = new Set();
  const keys = new Set();
  for (const line of lines) {
    if (/^\s*\[/.test(line)) {
      active = false;
      const match = line.trim().match(/^\[hooks\.state\.("(?:[^"\\]|\\.)*")\]$/);
      if (match) {
        let key;
        try { key = JSON.parse(match[1]); } catch { return null; }
        if (!key || keys.has(key)) return null;
        keys.add(key); fields = new Set(); active = true;
      }
    }
    if (active) {
      if (!/^\s*\[/.test(line) && line.trim()) {
        const field = line.trim().match(/^(trusted_hash|trusted_content_hash)\s*=\s*"sha256:[a-f0-9]{64}"$/)
          || line.trim().match(/^(enabled)\s*=\s*(?:true|false)$/);
        if (!field || fields.has(field[1])) return null;
        fields.add(field[1]);
      }
      trust += line;
    } else ordinary += line;
  }
  return { ordinary: ordinary.replace(/\n+$/, ''), trust };
}
module.exports = function reconcile(w, current) {
  if (current === undefined || current === null) return null;
  const old = split(w.after), next = split(current), before = split(w.before);
  if (!old || !next || !before || old.ordinary !== next.ordinary || old.trust === next.trust) return null;
  // Both sides receive only verified trust tables. Never absorb personal edits.
  const restored = before.ordinary + (before.ordinary ? '\n\n' : '') + next.trust;
  return { ...w, before: restored ? Buffer.from(restored).toString('base64') : null, after: current };
};
