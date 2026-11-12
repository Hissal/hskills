'use strict';

function slugify(title, maxLength) {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (maxLength !== undefined) {
    slug = slug.slice(0, maxLength);
  }
  return slug;
}

module.exports = { slugify };
