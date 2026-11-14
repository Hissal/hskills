'use strict';

// Reads maxSlugLength from the site config.
function parseMaxLength(raw) {
  if (raw === undefined) return undefined;
  const limit = Number(raw);
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error('Bad maxSlugLength.');
  }
  return limit;
}

module.exports = { parseMaxLength };
