'use strict';
const { read, block } = require('./scalar');

// A top-level frontmatter line's key and the text after its colon, or null.
// A key may be plain or quoted, like any YAML scalar (`'paths':` is `paths:`).
function entry(line) {
  const m = line.match(/^("(?:[^"\\]|\\.)*"|'(?:[^']|'')*'|[^\s#"'][^:]*?)\s*:(?:\s+|$)(.*)$/);
  return m && { key: read(m[1]), rest: m[2] };
}

// The index of the frontmatter line opening `key`, or -1.
function keyIndex(lines, key) {
  return (lines || []).findIndex((line) => { const e = entry(line); return e !== null && e.key === key; });
}

// Reads scalar fields used by tripwires from the collection's frontmatter lines.
// YAML syntax (quotes, comments, block markers) is not listing text.
function value(lines, key) {
  lines = lines || [];
  const i = keyIndex(lines, key);
  if (i < 0) return '';
  let raw = entry(lines[i]).rest.trim();
  const continuation = [];
  for (let j = i + 1; j < lines.length && (/^\s/.test(lines[j]) || !lines[j]); j++) continuation.push(lines[j]);
  if (/^[>|][+-]?(?:\s+#.*)?$/.test(raw)) {
    return block(raw, continuation);
  }
  raw = [raw, ...continuation.map((s) => s.trim())].join(' ').trim();
  return read(raw, 'fallback');
}

module.exports = { value, keyIndex };
