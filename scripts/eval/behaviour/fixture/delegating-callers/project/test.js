const assert = require('node:assert');
const { sum } = require('./src/sum');

assert.strictEqual(sum([]), 0);
assert.strictEqual(sum([4]), 4);
assert.strictEqual(sum([1, 2, 3]), 6);
console.log('ok');
