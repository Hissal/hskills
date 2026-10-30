'use strict';
const { read, block } = require('./scalar');

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
    return block(raw, continuation);
  }
  raw = [raw, ...continuation.map((s) => s.trim())].join(' ').trim();
  return read(raw, 'fallback');
}

module.exports = { value };
