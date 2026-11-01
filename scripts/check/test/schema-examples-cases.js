'use strict';
// #246: examples shipped beside a JSON schema are validated against it, and a
// schema may use only the keyword subset the check implements.
const fs = require('fs');
const path = require('path');

const REAL = 'skills/core/delegating/references/policy.schema.json';
const realSchema = () => fs.readFileSync(path.join(__dirname, '..', '..', '..', REAL), 'utf8');

module.exports = ({ skill }) => {
  const dir = 'skills/core/alpha';
  const schema = JSON.stringify({
    type: 'object',
    required: ['name'],
    additionalProperties: false,
    properties: { name: { type: 'string', pattern: '^[a-z]+$' }, tags: { type: 'array', minItems: 1, items: { enum: ['a', 'b'] } } },
  });
  const withFiles = (files) => skill(dir, { files });
  const ex = (name) => dir + '/references/thing-examples/' + name + '.json';
  const cases = [
    { name: 'examples valid against their schema pass',
      files: withFiles({ 'references/thing.schema.json': schema, 'references/thing-examples/one.json': '{ "name": "abc", "tags": ["a"] }\n' }),
      expect: [] },
    { name: 'an example that breaks its schema fails',
      files: withFiles({ 'references/thing.schema.json': schema, 'references/thing-examples/one.json': '{ "name": "abc" }\n', 'references/thing-examples/bad.json': '{ "name": "ABC", "extra": 1 }\n' }),
      expect: ['fail schema-examples ' + ex('bad')] },
    { name: 'an example that is not JSON fails',
      files: withFiles({ 'references/thing.schema.json': schema, 'references/thing-examples/bad.json': '{ "name": \n' }),
      expect: ['fail schema-examples ' + ex('bad')] },
    { name: 'a schema using a keyword outside the supported subset fails',
      files: withFiles({ 'references/thing.schema.json': JSON.stringify({ type: 'object', properties: { name: { type: 'string', minLength: 1 } } }), 'references/thing-examples/one.json': '{ "name": "abc" }\n' }),
      expect: ['fail schema-examples ' + dir + '/references/thing.schema.json'] },
    { name: 'a schema whose $ref names no definition fails',
      files: withFiles({ 'references/thing.schema.json': JSON.stringify({ $ref: '#/$defs/missing', $defs: {} }) }),
      expect: ['fail schema-examples ' + dir + '/references/thing.schema.json'] },
    { name: 'an examples folder with no schema beside it fails',
      files: withFiles({ 'references/thing-examples/one.json': '{ "name": "abc" }\n' }),
      expect: ['fail schema-examples ' + ex('one')] },
  ];

  // The delegating policy schema itself: a valid policy passes, and each
  // broken shape the policy guide forbids fails.
  const policy = (p) => skill('skills/core/delegating', { files: { 'references/policy.schema.json': realSchema(), 'references/policy-examples/case.json': JSON.stringify(p) } });
  const caseFile = 'skills/core/delegating/references/policy-examples/case.json';
  const choice = { harness: 'claude-code', family: 'opus' };
  const valid = { version: 1, autoFallback: false, effortDefaults: { simple: 'low' }, rules: [{ role: ['reviewer'], difficulty: ['difficult'], order: [choice, { provider: 'openai', model: 'gpt-x' }], effort: 'high' }], workflows: { 'code-review': [{ pool: [choice] }] } };
  const broken = {
    'a rule with both order and pool': { version: 1, rules: [{ order: [choice], pool: [choice] }] },
    'a rule with neither order nor pool': { version: 1, rules: [{ role: ['reviewer'] }] },
    'a choice naming both model and family': { version: 1, rules: [{ order: [{ harness: 'codex', model: 'm', family: 'sol' }] }] },
    'a choice naming neither harness nor provider': { version: 1, rules: [{ order: [{ family: 'opus' }] }] },
    'an unknown field': { version: 1, rule: [] },
    'an effort outside the scale': { version: 1, rules: [{ order: [choice], effort: 'extreme' }] },
    'a missing version': { rules: [] },
  };
  cases.push({ name: 'a valid delegation policy passes the real schema', files: policy(valid), expect: [] });
  for (const [what, p] of Object.entries(broken)) {
    cases.push({ name: 'a delegation policy example with ' + what + ' fails', files: policy(p), expect: ['fail schema-examples ' + caseFile] });
  }
  return cases;
};
