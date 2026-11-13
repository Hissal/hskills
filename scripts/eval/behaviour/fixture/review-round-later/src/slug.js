'use strict';
const { cut } = require('./cut');
const { trimDashes } = require('./text');

function slugify(title, maxLength) {
  const slug = trimDashes(title.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
  return maxLength === undefined ? slug : cut(slug, maxLength);
}

module.exports = { slugify };
