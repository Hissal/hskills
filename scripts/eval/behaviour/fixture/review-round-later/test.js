'use strict';
const assert = require('node:assert');
const { slugify } = require('./src/slug');
const { parseTitle } = require('./src/input');
const { parseTag } = require('./src/tags');
const { parseMaxLength } = require('./src/limits');

assert.strictEqual(slugify('Hello World'), 'hello-world');
assert.strictEqual(slugify('  Ten Tips, for You!  '), 'ten-tips-for-you');
assert.strictEqual(slugify('Hello World', 5), 'hello');
assert.strictEqual(slugify('Hello World', 6), 'hello');
assert.strictEqual(slugify(parseTitle(' Release notes ')), 'release-notes');
assert.strictEqual(parseTag(' News- '), 'news');
assert.strictEqual(parseMaxLength('40'), 40);
assert.strictEqual(parseMaxLength(undefined), undefined);
assert.throws(() => parseMaxLength('long'));
assert.throws(() => parseTitle('   '));
console.log('ok');
