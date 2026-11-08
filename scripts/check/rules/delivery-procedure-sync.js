'use strict';
// The delivery skills (full-stop, full-send, babysit-pr) run one procedure
// and each bundles its own copy of it (#88 answer 4, #166). Every copy must
// be byte-identical. When copies disagree, the copies outside the largest
// group of identical ones fail; with no single largest group, every copy
// fails. A delivery skill without its copy fails while another delivery skill
// has one. Silent while fewer than two copies exist otherwise.

const SKILLS = ['full-stop', 'full-send', 'babysit-pr'];
const REFERENCE = 'references/DELIVERY.md';

module.exports = {
  id: 'delivery-procedure-sync',
  level: 'fail',
  check(c) {
    const expected = c.skills
      .filter((s) => SKILLS.includes(s.name))
      .map((s) => s.dir + '/' + REFERENCE);
    const copies = expected.filter((f) => c.exists(f));
    if (copies.length === 0) return [];
    const missing = expected.filter((f) => !c.exists(f)).map((f) => ({
      file: f,
      message: 'missing; every delivery skill bundles the delivery procedure: copy ' + copies[0] + ' here',
    }));
    if (copies.length < 2) return missing;
    const groups = new Map();
    for (const f of copies) {
      const key = c.bytes(f).toString('base64');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(f);
    }
    if (groups.size === 1) return missing;
    const sizes = [...groups.values()].map((g) => g.length).sort((a, b) => b - a);
    const majority = sizes[0] > sizes[1] ? [...groups.values()].find((g) => g.length === sizes[0]) : [];
    const fix = 'make every delivery skill\'s ' + REFERENCE + ' identical: edit one copy, then copy it over the others';
    return missing.concat(copies.filter((f) => !majority.includes(f)).map((f) => ({
      file: f,
      message: majority.length ? 'differs from ' + majority.join(', ') + '; ' + fix : 'the copies (' + copies.join(', ') + ') disagree; ' + fix,
    })));
  },
};
