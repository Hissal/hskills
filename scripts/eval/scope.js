#!/usr/bin/env node
'use strict';
// Builds the scope a trigger eval runs in: a scratch Git project with the
// collection's core skills and one pack installed at project scope, and a
// queries file whose models run there through the evidence capture, with
// the scope's hidden skills off. Writes only inside the run directory.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

const HELP = `USAGE: node scripts/eval/scope.js <scope.json> <queries.json> <run dir> [--colliding] [--codex-config <path>] [--root <collection>]
       node scripts/eval/scope.js --check <scope.json> <captured file>...
SCOPE: {"pack":"<pack>","markers":{"<path>":"<content>"} or ["<path>"],"hidden":["<skill>"],"colliding":["<skill>"],"domain":"<pack line domain>"}
WRITES: <run dir>/project (Git baseline, markers, AGENTS.md, skills), <run dir>/evidence, <run dir>/queries.json
CHECK: <file> clean | lists <skill>...
EXIT: 0 built or clean; 1 a hidden skill listed; 2 invalid input
DOCS: docs/trigger-evals.md`;

function usage(message) {
  const error = new Error(message);
  error.usage = true;
  return error;
}

function parse(args) {
  const options = {colliding: false, codexConfig: path.join(os.homedir(), '.codex', 'config.toml'), root: path.resolve(__dirname, '../..'), positional: []};
  while (args.length) {
    const arg = args.shift();
    if (arg === '--colliding') options.colliding = true;
    else if (arg === '--check') options.check = true;
    else if (arg === '--codex-config' || arg === '--root') {
      const value = args.shift();
      if (!value) throw usage(`${arg} needs a path`);
      options[arg === '--root' ? 'root' : 'codexConfig'] = path.resolve(value);
    } else if (arg.startsWith('--')) throw usage(`unknown option ${arg}`);
    else options.positional.push(arg);
  }
  return options;
}

const names = (value, field) => {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some(name => typeof name !== 'string' || !name)) throw usage(`${field} must be an array of skill names`);
  return value;
};

// Reads and validates the scope file; the pack must be one collection.json lists.
function readScope(file, root) {
  const scope = JSON.parse(fs.readFileSync(file, 'utf8'));
  const hidden = names(scope.hidden, 'hidden');
  const colliding = names(scope.colliding, 'colliding');
  const both = hidden.find(name => colliding.includes(name));
  if (both) throw usage(`${both} is both hidden and colliding`);
  const collection = JSON.parse(fs.readFileSync(path.join(root, 'collection.json'), 'utf8'));
  const pack = collection.packs?.[scope.pack];
  if (typeof scope.pack !== 'string' || !Array.isArray(pack)) throw usage(`pack ${JSON.stringify(scope.pack)} is not in ${path.join(root, 'collection.json')}`);
  let markers = scope.markers ?? {};
  if (Array.isArray(markers)) markers = Object.fromEntries(markers.map(marker => [marker, '']));
  if (typeof markers !== 'object' || Object.entries(markers).some(([file, text]) => !file || path.isAbsolute(file) || file.split(/[\\/]/).includes('..') || typeof text !== 'string'))
    throw usage('markers must be relative paths, as an array or a {path: content} object');
  if (scope.domain !== undefined && (typeof scope.domain !== 'string' || !scope.domain)) throw usage('domain must be a non-empty string');
  return {pack: scope.pack, packSkills: pack, core: collection.core || [], markers, hidden, colliding, domain: scope.domain};
}

// The owner's Codex skill toggles: each [[skills.config]] table's name and
// enabled keys, in either order. A missing config file has no toggles.
function readToggles(file) {
  if (!fs.existsSync(file)) return [];
  const toggles = [];
  for (const table of fs.readFileSync(file, 'utf8').split(/^\s*(?=\[)/m)) {
    if (!/^\[\[\s*skills\.config\s*\]\]/.test(table)) continue;
    const name = table.match(/^\s*name\s*=\s*"([^"]+)"/m);
    const enabled = table.match(/^\s*enabled\s*=\s*(true|false)\b/m);
    if (name && enabled) toggles.push({name: name[1], enabled: enabled[1] === 'true'});
  }
  return toggles;
}

// The owner's toggles with every hidden skill off and, on request, every
// colliding skill on, as one -c value for Codex.
function codexToggles(toggles, scope, colliding) {
  const forced = new Map([...scope.hidden.map(name => [name, false]), ...(colliding ? scope.colliding.map(name => [name, true]) : [])]);
  const entries = toggles.map(toggle => ({name: toggle.name, enabled: forced.has(toggle.name) ? forced.get(toggle.name) : toggle.enabled}));
  for (const [name, enabled] of forced) if (!entries.some(entry => entry.name === name)) entries.push({name, enabled});
  return 'skills.config=[' + entries.map(entry => `{name=${JSON.stringify(entry.name)},enabled=${entry.enabled}}`).join(',') + ']';
}

const CLAUDE_TOOLS = ['Read', 'Bash', 'PowerShell', 'Glob', 'Grep', 'Write', 'Edit', 'WebFetch', 'WebSearch', 'ToolSearch', 'Skill'];
// A model's own command, or its harness name, wrapped in the capture with a
// reset to the baseline after each session, plus the scope's grants.
function decorate(model, evidence, toggles) {
  const base = model.command || [model.harness];
  const grants = model.harness === 'claude' ? ['--setting-sources', 'project', '--permission-mode', 'acceptEdits', '--allowedTools', ...CLAUDE_TOOLS]
    : model.harness === 'codex' ? ['-c', toggles, '-c', 'sandbox_mode="workspace-write"'] : [];
  return {...model, command: [process.execPath, path.join(__dirname, 'test/plugin-fixture/capture.js'), '--reset', evidence, model.harness, ...base, ...grants]};
}

function git(cwd, ...args) {
  const run = spawnSync('git', args, {cwd, encoding: 'utf8'});
  if (run.status !== 0) throw new Error(`git ${args[0]} failed: ${run.stderr}`);
}

function frontmatter(file, key) {
  const match = fs.readFileSync(file, 'utf8').match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return match && match[1].trim();
}

// The project's ## Agent skills block lists the pack's guide as setup-project
// writes it, with the fact file when the pack has a SETUP.md.
function packLine(scope, root) {
  const guide = scope.packSkills.find(rel => frontmatter(path.join(root, rel, 'SKILL.md'), 'name')?.endsWith('-guide'));
  if (!guide) throw usage(`pack ${scope.pack} has no -guide skill to list`);
  const name = frontmatter(path.join(root, guide, 'SKILL.md'), 'name');
  const setup = path.join(root, guide, 'SETUP.md');
  const hasSetup = fs.existsSync(setup);
  const domain = scope.domain || (hasSetup && fs.readFileSync(setup, 'utf8').match(/^\*\*Domain, for the pack line:\*\*\s*(.+?)\.?\s*$/m)?.[1]) || frontmatter(path.join(root, guide, 'SKILL.md'), 'description').replace(/\.$/, '');
  return {line: `- \`${name}\`: ${domain}.` + (hasSetup ? ` See \`docs/agents/${scope.pack}.md\`.` : ''), factFile: hasSetup};
}

function build(options) {
  const [scopeFile, queriesFile, runArg] = options.positional;
  const run = path.resolve(runArg);
  const scope = readScope(scopeFile, options.root);
  const queries = JSON.parse(fs.readFileSync(queriesFile, 'utf8'));
  if (!Array.isArray(queries.models) || !queries.models.length) throw usage('queries.json needs a models array');
  if (fs.existsSync(run) && fs.readdirSync(run).length) throw usage(`run directory ${run} is not empty`);
  const pack = packLine(scope, options.root);
  const toggles = codexToggles(readToggles(options.codexConfig), scope, options.colliding);

  const project = path.join(run, 'project');
  const evidence = path.join(run, 'evidence');
  const write = (file, text) => { fs.mkdirSync(path.dirname(file), {recursive: true}); fs.writeFileSync(file, text); };
  for (const [file, text] of Object.entries(scope.markers)) write(path.join(project, file), text);
  write(path.join(project, 'AGENTS.md'), `## Agent skills\n\n### Packs\n\n${pack.line}\n`);
  if (pack.factFile) write(path.join(project, 'docs/agents', scope.pack + '.md'), "> A missing field means the owning skill's default.\n");
  for (const folder of ['.claude/skills', '.agents/skills'])
    for (const rel of [...scope.core, ...scope.packSkills]) fs.cpSync(path.join(options.root, rel), path.join(project, folder, path.basename(rel)), {recursive: true});
  git(project, 'init', '-q');
  git(project, 'config', 'user.name', 'eval scope');
  git(project, 'config', 'user.email', 'eval-scope@example.invalid');
  // --force: a global excludes file must not keep the skills out of the
  // baseline, or capture --reset's git clean -fdx would delete them.
  git(project, 'add', '-A', '--force');
  git(project, 'commit', '-q', '--no-verify', '--no-gpg-sign', '-m', 'baseline');
  fs.mkdirSync(evidence, {mode: 0o700});

  const out = path.join(run, 'queries.json');
  fs.writeFileSync(out, JSON.stringify({...queries, cwd: project, models: queries.models.map(model => decorate(model, evidence, toggles))}, null, 2) + '\n');
  const claude = queries.models.find(model => model.harness === 'claude');
  const codex = queries.models.find(model => model.harness === 'codex');
  console.log(`WROTE: ${project}\nWROTE: ${out}`);
  console.log('NEXT: before the first query, confirm no hidden skill is listed. In the project, save one session of each harness and check them:');
  const quote = text => `'${text.replace(/'/g, `'\\''`)}'`;
  const inProject = `cd ${quote(project)} && `;
  if (claude) console.log(`  ${inProject}${(claude.command || ['claude']).join(' ')} --setting-sources project -p --model ${claude.model} --output-format stream-json --verbose -- "Reply ok." > ${path.join(run, 'claude-init.jsonl')}`);
  if (codex) console.log(`  ${inProject}${(codex.command || ['codex']).join(' ')} -c '${toggles}' exec --model ${codex.model} -- "List the name of every skill you can use, one per line." > ${path.join(run, 'codex-listing.txt')}`);
  console.log(`  node scripts/eval/scope.js --check ${scopeFile} ${claude ? path.join(run, 'claude-init.jsonl') : ''} ${codex ? path.join(run, 'codex-listing.txt') : ''}`.trimEnd());
  console.log(`RUN: node scripts/eval/trigger.js ${out}`);
}

// The hidden skills a saved session lists: a Claude stream's init event
// `skills`, or else any whole-name mention in the text (a Codex listing).
function listed(file, hidden) {
  const text = fs.readFileSync(file, 'utf8');
  const init = text.split(/\r?\n/).map(line => { try { return JSON.parse(line); } catch { return null; } })
    .find(event => event?.type === 'system' && event.subtype === 'init');
  if (init) {
    if (!Array.isArray(init.skills)) throw usage(`${file}: the init event has no skills list`);
    return hidden.filter(name => init.skills.includes(name));
  }
  const edge = '[^A-Za-z0-9:_.-]';
  return hidden.filter(name => new RegExp(`(?:^|${edge})${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|${edge})`, 'm').test(text));
}

function check(options) {
  const [scopeFile, ...files] = options.positional;
  if (!scopeFile || !files.length) throw usage('give --check <scope.json> <captured file>...; see --help');
  const scope = JSON.parse(fs.readFileSync(scopeFile, 'utf8'));
  const hidden = names(scope.hidden, 'hidden');
  const results = files.map(file => [file, listed(file, hidden)]);
  for (const [file, found] of results) console.log(`CHECK: ${file} ${found.length ? 'lists ' + found.join(' ') : 'clean'}`);
  if (results.some(([, found]) => found.length)) process.exitCode = 1;
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) { console.log(HELP); return; }
  const options = parse(args);
  if (options.check) return check(options);
  if (options.positional.length !== 3) throw usage('give <scope.json> <queries.json> <run dir>; see --help');
  build(options);
}

try { main(); } catch (error) { console.error(`ERROR: ${error.message}`); process.exitCode = 2; }
