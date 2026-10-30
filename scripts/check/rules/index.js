'use strict';
// The rule registry: every rule the check runs, in report order. To add a
// rule, write rules/<id>.js (see docs/skill-format.md, "Adding a rule") and
// list it here.

module.exports = [
  require('./utf8-bom'),
  require('./crlf-line-ending'),
  require('./description-colon'),
  require('./missing-file'),
  require('./skill-body-length'),
  require('./reference-contents'),
  require('./reference-unlinked'),
  require('./skill-metadata'),
  require('./skill-requirements'),
  require('./requirement-reference'),
  require('./guard-cases'),
];
