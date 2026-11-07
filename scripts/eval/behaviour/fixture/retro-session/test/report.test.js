import { test } from 'node:test';
import assert from 'node:assert/strict';
import { report } from '../src/report.js';

test('formats text', () => {
  assert.equal(report([{ name: 'a', total: 1 }]), 'a: 1');
});
