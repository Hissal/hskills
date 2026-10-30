'use strict';

function scalar(raw) {
  const value = raw.trim();
  if (value.startsWith('"')) {
    try { return JSON.parse(value.replace(/\s+#.*$/, '')); } catch (e) { return null; }
  }
  if (value.startsWith("'")) {
    const m = value.match(/^'((?:[^']|'')*)'\s*(?:#.*)?$/);
    return m ? m[1].replace(/''/g, "'") : null;
  }
  const plain = value.replace(/\s+#.*$/, '');
  if (!plain || /^(?:[\[\]{}&*!>|]|null$|~$|true$|false$|[-+]?\d+(?:\.\d+)?$)/i.test(plain)) return null;
  return plain;
}

function block(raw, lines) {
  const width = Math.min(...lines.filter((l) => l.trim()).map((l) => l.search(/\S/)));
  let text = lines.map((l) => l.slice(width)).join(raw[0] === '>' ? ' ' : '\n');
  if (!raw.includes('-')) text += '\n';
  return text;
}

// Metadata rejects malformed/non-string scalars; listing text keeps its legacy
// best-effort fallback so a broken quote does not hide idle cost.
function read(raw, policy = 'reject') {
  const parsed = scalar(raw);
  if (typeof parsed === 'string' || policy === 'reject') return typeof parsed === 'string' ? parsed : null;
  raw = raw.trim();
  if (/^["']/.test(raw)) return raw.slice(1, raw.lastIndexOf(raw[0])).replace(/''/g, "'");
  return raw.replace(/\s+#.*$/, '').trim();
}
module.exports = { read, block };
