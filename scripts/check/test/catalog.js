'use strict';
// Exercise the writer and check CLIs against a real fixture tree.
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'catalog-test-'));
const writer = path.resolve(__dirname, '../../catalog/generate.js');
const check = path.resolve(__dirname, '../check.js');
function run(script) { return spawnSync(process.execPath, [script, root], { encoding: 'utf8' }); }
function write(file, text) {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), text);
}
function skill(name, id, requires) {
  return '---\nname: ' + name + '\ndescription: Test fixture.\nmetadata:\n  opencode/autoinvoke: "true"\n  agent-skills-sync.schema: "1"\n  agent-skills-sync.id: "hissal.skill-collection/' + id + '"\n  agent-skills-sync.requires: \'' + JSON.stringify(requires) + '\'\n---\n# Work\n' + requires.map((id) => 'Load ' + id + '.\n').join('');
}
try {
  assert.strictEqual(spawnSync('git', ['init', '-q', root]).status, 0);
  write('docs/catalog.md', '# Blueprint\n\nOptional routes stay here.\n\n<!-- BEGIN GENERATED DEPENDENCIES -->\nstale\n<!-- END GENERATED DEPENDENCIES -->\n\nTail stays here.\n');
  write('skills/core/z-renamed/SKILL.md', skill('z-renamed', 'alpha', ['hissal.skill-collection/zeta']));
  write('skills/packs/web/a-renamed/SKILL.md', skill('a-renamed', 'zeta', []));
  for (const dir of ['skills/core/z-renamed', 'skills/packs/web/a-renamed']) write(dir + '/agents/openai.yaml', 'policy:\n  allow_implicit_invocation: true\n');
  const stale = run(check);
  assert.strictEqual(stale.status, 1);
  assert.match(stale.stdout, /FAIL docs\/catalog.md \[dependency-catalog\].*node scripts\/catalog\/generate.js/);
  assert.strictEqual(run(writer).status, 0);
  const result = fs.readFileSync(path.join(root, 'docs/catalog.md'), 'utf8');
  assert.strictEqual(result, '# Blueprint\n\nOptional routes stay here.\n\n<!-- BEGIN GENERATED DEPENDENCIES -->\n| Skill ID | Callable / source | Hard requirements |\n|---|---|---|\n| `hissal.skill-collection/alpha` | [`z-renamed`](../skills/core/z-renamed/SKILL.md) | `hissal.skill-collection/zeta` [`a-renamed`](../skills/packs/web/a-renamed/SKILL.md) |\n| `hissal.skill-collection/zeta` | [`a-renamed`](../skills/packs/web/a-renamed/SKILL.md) | — |\n<!-- END GENERATED DEPENDENCIES -->\n\nTail stays here.\n');
  assert.strictEqual(run(writer).status, 0);
  assert.strictEqual(fs.readFileSync(path.join(root, 'docs/catalog.md'), 'utf8'), result);
  assert.strictEqual(run(check).status, 0);
  write('skills/packs/web/a-renamed/SKILL.md', skill('a-renamed', 'alpha', []));
  assert.strictEqual(run(writer).status, 1);
  assert.strictEqual(fs.readFileSync(path.join(root, 'docs/catalog.md'), 'utf8'), result);
  console.log('ok: catalog writer/check fixture');
} finally { fs.rmSync(root, { recursive: true, force: true }); }
