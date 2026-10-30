'use strict';
// A long reference opens with a contents list so the agent can find its part
// without reading all of it. A contents list is a list of in-page links, or
// any list under a "Contents" or "Table of contents" heading, placed before
// the reference's first section heading.

const LIMIT = 100;
const HEADING = /^#{1,6}\s/;
const CONTENTS = /^#{1,6}\s+(table of\s+)?contents\s*#*\s*$/i;
const ITEM = /^\s*([-*+]|\d+[.)])\s/;

function hasContents(lines) {
  let title = false;
  let underContents = false;
  for (const l of lines) {
    if (CONTENTS.test(l)) { underContents = true; continue; }
    if (HEADING.test(l)) {
      if (!title && !underContents && /^#\s/.test(l)) { title = true; continue; }
      return false; // reached the first section
    }
    if (ITEM.test(l) && (underContents || l.includes('](#'))) return true;
  }
  return false;
}

module.exports = {
  id: 'reference-contents',
  level: 'warn',
  check(c) {
    const out = [];
    for (const s of c.skills) {
      for (const file of c.references(s)) {
        const lines = c.text(file).split(/\r?\n/);
        if (lines[lines.length - 1] === '') lines.pop();
        if (lines.length > LIMIT && !hasContents(lines)) {
          out.push({ file, message: lines.length + ' lines (over ' + LIMIT + ') with no contents list at the top' });
        }
      }
    }
    return out;
  },
};
