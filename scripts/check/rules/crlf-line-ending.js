'use strict';
// The collection is LF everywhere (.gitattributes): a CRLF breaks frontmatter
// and shebang detection on some Linux tools.

module.exports = {
  id: 'crlf-line-ending',
  level: 'fail',
  check(c) {
    const out = [];
    for (const file of c.files) {
      if (!c.isText(file)) continue;
      const at = c.text(file).indexOf('\r\n');
      if (at < 0) continue;
      const line = c.text(file).slice(0, at).split('\n').length;
      out.push({ file, line, message: 'CRLF line ending; the collection is LF only' });
    }
    return out;
  },
};
