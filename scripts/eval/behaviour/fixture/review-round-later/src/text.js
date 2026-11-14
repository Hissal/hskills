'use strict';

// Removes dashes from both ends.
function trimDashes(text) {
  return text.replace(/^-+|-+$/g, '');
}

module.exports = { trimDashes };
