'use strict';
// A UTF-8 BOM breaks frontmatter and shebang detection on some Linux tools.

module.exports = {
  id: 'utf8-bom',
  level: 'fail',
  check(c) {
    return c.files
      .filter((file) => c.isText(file) && c.bytes(file).subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf])))
      .map((file) => ({ file, line: 1, message: 'starts with a UTF-8 BOM; save as UTF-8 without BOM' }));
  },
};
