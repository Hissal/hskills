'use strict';
const { trimDashes } = require('./text');

function slugify(title, maxLength) {
  let slug = trimDashes(title.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
  if (maxLength !== undefined) {
    slug = trimDashes(slug.slice(0, maxLength));
  }
  return slug;
}

module.exports = { slugify };
