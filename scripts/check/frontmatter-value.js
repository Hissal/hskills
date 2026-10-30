'use strict';

// Reads scalar fields used by tripwires from the collection's frontmatter lines.
// YAML syntax (quotes, comments, block markers) is not listing text.
function value(lines, key) {
  lines = lines || [];
  const i = lines.findIndex((line) => line.startsWith(key + ':'));
  if (i < 0) return '';
  let raw = lines[i].slice(key.length + 1).trim();
  const continuation = [];
  for (let j = i + 1; j < lines.length && (/^\s/.test(lines[j]) || !lines[j]); j++) continuation.push(lines[j]);
  if (/^[>|][+-]?(?:\s+#.*)?$/.test(raw)) {
    const indent = Math.min(...continuation.filter((s) => s.trim()).map((s) => s.match(/^ */)[0].length));
    const parts = continuation.map((s) => s.slice(indent));
    let text = parts.join(raw[0] === '>' ? ' ' : '\n');
    if (!raw.startsWith('>-') && !raw.startsWith('|-')) text += '\n';
    return text;
  }
  raw = [raw, ...continuation.map((s) => s.trim())].join(' ').trim();
  if (raw.startsWith('"')) {
    try { return JSON.parse(raw.replace(/\s+#.*$/, '')); } catch (e) { return raw.slice(1, raw.lastIndexOf('"')); }
  }
  if (raw.startsWith("'")) return raw.slice(1, raw.lastIndexOf("'")).replace(/''/g, "'");
  return raw.replace(/\s+#.*$/, '').trim();
}

module.exports = { value };
