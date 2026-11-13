'use strict';

// Checks a title from the post form or the CMS.
function parseTitle(raw) {
  if (typeof raw !== 'string' || raw.trim() === '') {
    throw new Error('A post needs a title.');
  }
  return raw.trim();
}

module.exports = { parseTitle };
