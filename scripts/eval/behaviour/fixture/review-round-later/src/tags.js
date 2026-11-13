'use strict';
const { trimDashes } = require('./text');

// Cleans a tag typed into the post form: "News-" becomes "news".
function parseTag(raw) {
  return trimDashes(raw.trim().toLowerCase());
}

module.exports = { parseTag };
