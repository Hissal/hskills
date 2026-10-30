'use strict';
// Every harness must agree on whether a skill is model-invoked (#77, #99).
// `disable-model-invocation` is the source; the Codex gate (agents/openai.yaml)
// and the OpenCode gate (SKILL.md metadata) are generated from it by the gate
// writer. A gate that is missing, unreadable or disagrees with the source
// fails, so a skill is never user-invoked on one harness and model-invoked on
// another. Gate parsing lives in scripts/gates/gates.js, shared with the writer.

const gates = require('../../gates/gates');

const fix = '; run `' + gates.WRITER + '`';
const says = (b) => (b ? 'model-invoked' : 'user-invoked');

function compare(gate, lines, want, file, lineOf) {
  const f = gates.find(lines, gate);
  const name = gate.harness + ' gate `' + gate.parent + '.' + gate.key + '`';
  if (f.state === 'ok') {
    if (f.value === want) return [];
    return [{ file, line: lineOf(f.line), message: name + ' says ' + says(f.value) + ' but ' + gates.SOURCE + ' says ' + says(want) + fix }];
  }
  if (f.state === 'invalid') return [{ file, line: lineOf(f.line), message: name + ' has unreadable value ' + f.raw + fix }];
  if (f.state === 'flow') return [{ file, line: lineOf(f.line), message: name + ' is in a `' + gate.parent + ':` that is not a block mapping; rewrite it as one' + fix }];
  return [{ file, message: name + ' is missing' + fix }];
}

module.exports = {
  id: 'harness-gates',
  level: 'fail',
  check(c) {
    const out = [];
    for (const s of c.skills) {
      if (!s.frontmatter) continue;
      const src = gates.source(s.frontmatter);
      if (src.error) {
        out.push({ file: s.skillMd, line: s.fmLine + src.line, message: src.error + ', then run `' + gates.WRITER + '`' });
        continue;
      }
      const want = gates.expected(src);
      out.push(...compare(gates.OPENCODE, s.frontmatter, want, s.skillMd, (i) => s.fmLine + i));
      const codex = s.dir + '/' + gates.CODEX_FILE;
      if (!c.exists(codex)) out.push({ file: codex, message: 'Codex gate file is missing' + fix });
      else out.push(...compare(gates.CODEX, gates.splitFile(c.text(codex)).lines, want, codex, (i) => i + 1));
    }
    return out;
  },
};
