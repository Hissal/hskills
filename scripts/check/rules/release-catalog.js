'use strict';
const { FILE, JSON_FILE, generateJson } = require('../dependency-catalog');
module.exports = {
  id: 'release-catalog',
  level: 'fail',
  check(c) {
    // Subset trees with neither catalog do not publish release artifacts.
    if (!c.files.includes(FILE) && !c.files.includes(JSON_FILE)) return [];
    let reason;
    try {
      if (c.exists(JSON_FILE) && c.text(JSON_FILE) === generateJson(c)) return [];
      reason = 'release-local catalog is missing or stale';
    } catch (e) { reason = e.message; }
    return [{ file: JSON_FILE, message: reason + '; regenerate with node scripts/catalog/generate.js' }];
  },
};
