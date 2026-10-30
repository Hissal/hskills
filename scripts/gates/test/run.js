'use strict';
// Gate writer tests: node scripts/gates/test/run.js
// Each case writes a fixture tree into a scratch git repository, runs
// write-gates.js on it as a child process, and compares its exit code, its
// KEY: value output and the files it leaves with the case's expectation.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const WRITER = path.join(__dirname, '..', 'write-gates.js');
const CHECK = path.join(__dirname, '..', '..', 'check', 'check.js');
const KEY_VALUE = /^[A-Z][A-Z_]*: \S/;

const md = (fm, body) => '---\n' + fm + '\n---\n\n' + (body || '# x\n\nDo the work.\n');

const cases = [
  {
    name: '--help prints usage and writes nothing',
    args: ['--help'],
    files: { 'skills/core/alpha/SKILL.md': md('name: alpha\ndescription: Use when testing.') },
    exit: 0,
    help: true,
    after: { 'skills/core/alpha/SKILL.md': md('name: alpha\ndescription: Use when testing.') },
  },
  {
    name: 'writes both gates for a model-invoked and a user-invoked skill',
    files: {
      'skills/core/alpha/SKILL.md': md('name: alpha\ndescription: Use when testing.'),
      'skills/packs/web/beta/SKILL.md': md('name: beta\ndescription: Run it.\ndisable-model-invocation: true'),
    },
    exit: 0,
    output: ['WROTE: skills/core/alpha/SKILL.md', 'WROTE: skills/core/alpha/agents/openai.yaml', 'WROTE: skills/packs/web/beta/SKILL.md', 'WROTE: skills/packs/web/beta/agents/openai.yaml', 'SKILLS: 2', 'WRITTEN: 4'],
    after: {
      'skills/core/alpha/SKILL.md': md('name: alpha\ndescription: Use when testing.\nmetadata:\n  opencode/autoinvoke: "true"'),
      'skills/core/alpha/agents/openai.yaml': 'policy:\n  allow_implicit_invocation: true\n',
      'skills/packs/web/beta/SKILL.md': md('name: beta\ndescription: Run it.\ndisable-model-invocation: true\nmetadata:\n  opencode/autoinvoke: "false"'),
      'skills/packs/web/beta/agents/openai.yaml': 'policy:\n  allow_implicit_invocation: false\n',
    },
    checkPasses: true,
  },
  {
    name: 'a second run changes nothing',
    files: {
      'skills/core/alpha/SKILL.md': md('name: alpha\ndescription: Use when testing.\ndisable-model-invocation: true\nmetadata:\n  opencode/autoinvoke: "false"'),
      'skills/core/alpha/agents/openai.yaml': 'policy:\n  allow_implicit_invocation: false\n',
    },
    exit: 0,
    output: ['SKILLS: 1', 'WRITTEN: 0'],
    after: {
      'skills/core/alpha/SKILL.md': md('name: alpha\ndescription: Use when testing.\ndisable-model-invocation: true\nmetadata:\n  opencode/autoinvoke: "false"'),
      'skills/core/alpha/agents/openai.yaml': 'policy:\n  allow_implicit_invocation: false\n',
    },
  },
  {
    name: 'fixes mismatched gates, touching only the gate values',
    files: {
      'skills/core/alpha/SKILL.md': md('name: alpha\ndescription: "Use when: testing."\ndisable-model-invocation: true # user-invoked\nmetadata:\n    audience: maintainers\n    opencode/autoinvoke: true\n    opencode/slash: "true"\nwhen_to_use: later', 'Body with metadata:\n  opencode/autoinvoke: "true"\n'),
      'skills/core/alpha/agents/openai.yaml': 'interface:\n  display_name: "Alpha"\n\npolicy:\n  allow_implicit_invocation: true # generated\n\ndependencies:\n  tools: []\n',
    },
    exit: 0,
    output: ['WROTE: skills/core/alpha/SKILL.md', 'WROTE: skills/core/alpha/agents/openai.yaml', 'SKILLS: 1', 'WRITTEN: 2'],
    after: {
      'skills/core/alpha/SKILL.md': md('name: alpha\ndescription: "Use when: testing."\ndisable-model-invocation: true # user-invoked\nmetadata:\n    audience: maintainers\n    opencode/autoinvoke: "false"\n    opencode/slash: "true"\nwhen_to_use: later', 'Body with metadata:\n  opencode/autoinvoke: "true"\n'),
      'skills/core/alpha/agents/openai.yaml': 'interface:\n  display_name: "Alpha"\n\npolicy:\n  allow_implicit_invocation: false # generated\n\ndependencies:\n  tools: []\n',
    },
    checkPasses: true,
  },
  {
    name: 'adds a missing gate inside existing blocks',
    files: {
      'skills/core/alpha/SKILL.md': md('name: alpha\nmetadata:\n  audience: maintainers\ndescription: Use when testing.'),
      'skills/core/alpha/agents/openai.yaml': 'policy:\n  # set below\n\ninterface:\n  display_name: "Alpha"\n',
    },
    exit: 0,
    output: ['WROTE: skills/core/alpha/SKILL.md', 'WROTE: skills/core/alpha/agents/openai.yaml', 'SKILLS: 1', 'WRITTEN: 2'],
    after: {
      'skills/core/alpha/SKILL.md': md('name: alpha\nmetadata:\n  audience: maintainers\n  opencode/autoinvoke: "true"\ndescription: Use when testing.'),
      'skills/core/alpha/agents/openai.yaml': 'policy:\n  # set below\n  allow_implicit_invocation: true\n\ninterface:\n  display_name: "Alpha"\n',
    },
    checkPasses: true,
  },
  {
    name: 'an unreadable source fails and writes nothing for that skill',
    files: {
      'skills/core/alpha/SKILL.md': md('name: alpha\ndescription: Use when testing.\ndisable-model-invocation: yes'),
      'skills/core/beta/SKILL.md': md('name: beta\ndescription: Use when testing.'),
    },
    exit: 1,
    output: ['ERROR: skills/core/alpha: disable-model-invocation is "yes"; set it to true or false', 'WROTE: skills/core/beta/SKILL.md', 'WROTE: skills/core/beta/agents/openai.yaml', 'SKILLS: 2', 'WRITTEN: 2', 'ERRORS: 1'],
    after: {
      'skills/core/alpha/SKILL.md': md('name: alpha\ndescription: Use when testing.\ndisable-model-invocation: yes'),
      'skills/core/alpha/agents/openai.yaml': null,
    },
  },
  {
    name: 'a flow-mapping parent is reported, not rewritten',
    files: {
      'skills/core/alpha/SKILL.md': md('name: alpha\ndescription: Use when testing.\nmetadata: { audience: maintainers }'),
    },
    exit: 1,
    output: ['ERROR: skills/core/alpha SKILL.md: `metadata:` is not a block mapping; rewrite it as one, then rerun', 'SKILLS: 1', 'WRITTEN: 0', 'ERRORS: 1'],
    after: {
      'skills/core/alpha/SKILL.md': md('name: alpha\ndescription: Use when testing.\nmetadata: { audience: maintainers }'),
      'skills/core/alpha/agents/openai.yaml': null,
    },
  },
];

function git(dir, args) {
  const res = spawnSync('git', ['-c', 'core.autocrlf=false', ...args], { cwd: dir, encoding: 'utf8' });
  if (res.status !== 0) throw new Error('git ' + args.join(' ') + ' failed: ' + res.stderr);
}

let failed = 0;
let passed = 0;
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'gate-writer-test-'));
try {
  cases.forEach((c, i) => {
    const dir = path.join(scratch, String(i));
    fs.mkdirSync(dir);
    git(dir, ['init', '-q']);
    for (const [file, content] of Object.entries(c.files)) {
      fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
      fs.writeFileSync(path.join(dir, file), content);
    }
    const res = spawnSync(process.execPath, [WRITER, ...(c.args || []), dir], { encoding: 'utf8' });
    const out = res.stdout.split('\n').filter(Boolean);
    const problems = [];
    if (res.status !== c.exit) problems.push('exit ' + res.status + ', expected ' + c.exit);
    if (c.help) {
      if (!/usage/i.test(res.stdout)) problems.push('no usage text');
    } else {
      const bad = out.filter((l) => !KEY_VALUE.test(l));
      if (bad.length) problems.push('lines not KEY: value: ' + JSON.stringify(bad));
      if (JSON.stringify(out) !== JSON.stringify(c.output)) problems.push('output ' + JSON.stringify(out) + ', expected ' + JSON.stringify(c.output));
    }
    for (const [file, want] of Object.entries(c.after)) {
      const full = path.join(dir, file);
      const got = fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : null;
      if (got !== want) problems.push(file + ' is ' + JSON.stringify(got) + ', expected ' + JSON.stringify(want));
    }
    if (c.checkPasses) {
      const chk = spawnSync(process.execPath, [CHECK, dir], { encoding: 'utf8' });
      if (chk.status !== 0) problems.push('check fails after writing:\n' + chk.stdout);
    }
    if (!problems.length) { passed++; return; }
    failed++;
    console.log('FAIL ' + c.name);
    for (const p of problems) console.log('     ' + p);
    if (res.stderr) console.log('     stderr: ' + res.stderr.trim().split('\n').slice(0, 6).join('\n     '));
  });
} finally {
  fs.rmSync(scratch, { recursive: true, force: true });
}

console.log((failed ? 'FAILED' : 'ok') + ': ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
