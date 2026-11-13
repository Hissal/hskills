'use strict';

// Cuts a slug to max characters and drops a dash left at the end.
function cut(slug, max) {
  return slug.slice(0, max).replace(/-+$/, '');
}

module.exports = { cut };
