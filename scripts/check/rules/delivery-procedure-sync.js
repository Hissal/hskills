'use strict';
// full-stop and full-send run one delivery procedure and each bundles its own
// copy of it (#88 answer 4, as revised on #347). The two copies must be
// byte-identical: when they differ, both fail. One delivery skill without its
// copy fails while the other has one. Silent while neither has a copy.

const SKILLS = ['full-stop', 'full-send'];
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
    if (c.bytes(copies[0]).equals(c.bytes(copies[1]))) return missing;
    const fix = 'make every delivery skill\'s ' + REFERENCE + ' identical: edit one copy, then copy it over the other';
    return copies.map((f) => ({
      file: f,
      message: 'the copies (' + copies.join(', ') + ') disagree; ' + fix,
    }));
  },
};
