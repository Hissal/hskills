'use strict';
const { FILE, update } = require('../dependency-catalog');
module.exports = {
  id: 'dependency-catalog',
  level: 'fail',
  check(c) {
    // Fixture/subset trees without a catalog have no generated artifact to compare.
    if (!c.files.includes(FILE)) return [];
    let reason;
    try {
      const text = c.text(FILE);
      if (text === update(text, c)) return [];
      reason = 'dependency catalog is stale';
    } catch (e) { reason = e.message; }
    return [{ file: FILE, message: reason + '; regenerate with node scripts/catalog/generate.js' }];
  },
};
