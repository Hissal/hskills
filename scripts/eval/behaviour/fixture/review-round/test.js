'use strict';
const assert = require('node:assert');
const { slugify } = require('./src/slug');
const { parseTitle } = require('./src/input');
const { slugFor } = require('./src/publish');

assert.strictEqual(slugify('Hello World'), 'hello-world');
assert.strictEqual(slugify('  Ten Tips, for You!  '), 'ten-tips-for-you');
assert.strictEqual(slugify('Hello World', 5), 'hello');
assert.strictEqual(slugify(parseTitle(' Release notes ')), 'release-notes');
assert.strictEqual(slugFor('blog', ' Release notes '), 'release-notes');
assert.throws(() => parseTitle('   '));
console.log('ok');
