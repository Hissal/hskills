'use strict';
const sites = require('./sites');
const { parseTitle } = require('./input');
const { slugify } = require('./slug');

function slugFor(site, rawTitle) {
  return slugify(parseTitle(rawTitle), sites[site].maxSlugLength);
}

module.exports = { slugFor };
