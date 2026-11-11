'use strict';
// The rule registry: every rule the check runs, in report order. To add a
// rule, write rules/<id>.js (see docs/skill-format.md, "Adding a rule") and
// list it here.

module.exports = [
  require('./collection-manifest'),
  require('./utf8-bom'),
  require('./crlf-line-ending'),
  require('./description-colon'),
  require('./missing-file'),
  require('./skill-body-length'),
  require('./reference-contents'),
  require('./reference-unlinked'),
  require('./schema-examples'),
  require('./skill-metadata'),
  require('./skill-requirements'),
  require('./requirement-reference'),

  require('./guide-needs-target'),
  require('./guide-routes-paths'),
  require('./guard-cases'),
  require('./install-cases'),
  require('./requirement-body-id'),
  // copied skills (#102)
  require('./vendor-lock'),
  require('./vendor-baseline'),
  require('./vendor-licence'),
  require('./vendor-notice'),
  require('./dependency-catalog'),
  require('./release-catalog'),
  require('./catalog-totals'),
  require('./release-config'),
  require('./release-version'),
  require('./steering-paths'),
  require('./plugin-output'),
  // pack membership and plugin closure (#110)
  require('./pack-membership'),
  require('./plugin-paths'),
  require('./plugin-requirements'),

  require('./harness-gates'),
  require('./expensive-workflow'),
  require('./core-names-pack'),

  require('./id-stability'),
  require('./agnix'),
  require('./copied-file-safety'),

  require('./automatic-guide-sync'),
  require('./delivery-procedure-sync'),
];
