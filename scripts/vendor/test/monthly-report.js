'use strict';
const assert = require('assert/strict');
const { publishReport } = require('../monthly-report');

function client(issues = []) {
  return {
    issues, writes: [],
    listIssues() { return this.issues; },
    createIssue(fields) { this.writes.push({ action: 'create', ...fields }); return { number: 41 }; },
    updateIssue(number, fields) { this.writes.push({ action: 'update', number, ...fields }); }
  };
}
const github = client();
publishReport({ github, report: 'skills/core/example: local-drift\n', status: 0 });
assert.equal(github.writes.length, 1);
assert.equal(github.writes[0].action, 'create');
assert.match(github.writes[0].body, /skills\/core\/example: local-drift/);
console.log('ok: monthly report creates the first drift issue');
const existing = client([
  { number: 3, title: 'unrelated', body: 'ordinary issue' },
  { number: 9, body: github.writes[0].body, state: 'closed' }
]);
publishReport({ github: existing, report: 'skills/core/example: current\nskills/pack/other: current\n', status: 0 });
assert.equal(existing.writes[0].action, 'update');
assert.equal(existing.writes[0].number, 9);
assert.equal(existing.writes[0].state, 'open');
assert.match(existing.writes[0].body, /All vendored entries are current/);
assert.match(existing.writes[0].body, /skills\/pack\/other: current/);
const empty = client();
publishReport({ github: empty, report: '', status: 0 });
assert.match(empty.writes[0].body, /No vendored entries/);
const failed = client(existing.issues);
publishReport({ github: failed, report: 'skills/core/example: error\n', status: 2, errors: 'ERROR: source unavailable' });
assert.match(failed.writes[0].body, /incomplete/);
assert.match(failed.writes[0].body, /source unavailable/);
assert.throws(() => publishReport({ github: client(), report: '', status: null }), /did not complete/);
const denied = client();
denied.createIssue = () => { throw new Error('permission denied'); };
assert.throws(() => publishReport({ github: denied, report: '', status: 0 }), /permission denied/);
console.log('ok: monthly report reuses closed issues, lists all entries, and surfaces failures');
const classes = client();
publishReport({ github: classes, status: 0, report: [
  'skills/a: current', 'skills/b: local-drift', 'skills/c: update-available',
  'skills/d: both', 'skills/e: baseline-corrupt'
].join('\n') });
for (const line of ['skills/a: current', 'skills/b: local-drift', 'skills/c: update-available', 'skills/d: both', 'skills/e: baseline-corrupt']) {
  assert.ok(classes.writes[0].body.includes(line));
}
assert.doesNotMatch(classes.writes[0].body, /All vendored entries are current/);
const matchingPullRequest = client([{ number: 2, body: github.writes[0].body, pull_request: {} }]);
publishReport({ github: matchingPullRequest, report: '', status: 0 });
assert.equal(matchingPullRequest.writes[0].action, 'create');
console.log('ok: monthly report preserves every drift class and ignores pull requests');
