// Throwaway filesystem observations. No harness hooks are installed.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');

if (process.argv[2] === 'read-state') {
  process.stdout.write(fs.readFileSync(process.argv[3], 'utf8'));
  process.exit(0);
}

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'PROTOTYPE-freeze-wipe-me-'));
const project = path.join(scratch, 'project-a');
const other = path.join(scratch, 'project-b');
const src = path.join(project, 'src');
const tests = path.join(project, 'tests');
const observations = [];
for (const dir of [src, tests, path.join(project, 'src-extra'), other]) fs.mkdirSync(dir, {recursive:true});
for (const file of ['src/a.txt','tests/a.txt','src-extra/a.txt','outside.txt']) fs.writeFileSync(path.join(project, file), 'original\n');
fs.writeFileSync(path.join(other, 'a.txt'), 'original\n');

// This probe uses Node's native path interpretation. It cannot translate WSL/Git Bash paths.
function physical(target) {
  // Keep traversal in the input until the OS resolves links. Lexical path.resolve first
  // would erase link/.. behavior on Linux and could approve a different physical target.
  const absolute = path.isAbsolute(target) ? target : project + path.sep + target;
  try { return fs.realpathSync.native(absolute); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    // New leaf under an existing directory only. Missing intermediate directories are unsupported.
    return path.join(fs.realpathSync.native(path.dirname(absolute)), path.basename(absolute));
  }
}
const chosen = [fs.realpathSync.native(src)];
function check(targets, roots=chosen) {
  try {
    const resolved = targets.map(physical);
    for (const target of resolved) {
      if (fs.existsSync(target) && fs.statSync(target).nlink > 1) return {verdict:'unsupported', resolved, reason:'multiple hard links'};
    }
    const allowed = resolved.every(target => roots.some(root => {
      const relative = path.relative(root, target);
      return relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative));
    }));
    return {verdict:allowed ? 'allow' : 'block', resolved};
  } catch(error) { return {verdict:'unsupported', reason:error.code || error.message}; }
}
function observe(name, targets, expected, roots) {
  const result = check(targets, roots);
  observations.push({name, expected, ...result});
  // A blocked/unsupported simulated edit never executes.
  if (result.verdict === 'allow') for (const target of result.resolved) fs.writeFileSync(target, 'edited by the prototype\n');
}
observe('relative edit inside chosen directory', ['src/a.txt'], 'allow');
observe('outside all chosen directories', ['outside.txt'], 'block');
observe('directory prefix is not containment', ['src-extra/a.txt'], 'block');
observe('parent traversal leaves chosen directory', ['src/../outside.txt'], 'block');
observe('new file under existing chosen directory', ['src/new.txt'], 'allow');
observe('missing intermediate directory', ['src/missing/new.txt'], 'unsupported');
observe('one patch touches source and tests with source alone', ['src/a.txt','tests/a.txt'], 'block');
observe('one patch touches source and tests with both chosen', ['src/a.txt','tests/a.txt'], 'allow', [physical('src'),physical('tests')]);
observe('move requires both source and destination', ['src/a.txt','outside.txt'], 'block');
if (process.platform === 'win32') observe('alternate case on this ordinary Windows directory', ['SRC/A.TXT'], 'allow');
else observe('alternate case on this case-sensitive Linux directory', ['SRC/A.TXT'], 'unsupported');
try {
  const link = path.join(src, 'escape');
  fs.symlinkSync(other, link, process.platform === 'win32' ? 'junction' : 'dir');
  observe('link inside chosen directory reaches another project', ['src/escape/a.txt'], 'block');
  fs.writeFileSync(path.join(scratch,'a.txt'), 'outside scratch marker\n');
  observe('link followed by parent traversal, native OS semantics', ['src/escape/../a.txt'], process.platform === 'win32' ? 'allow' : 'block');
  fs.symlinkSync(src, path.join(project, 'source-alias'), process.platform === 'win32' ? 'junction' : 'dir');
  observe('alias outside chosen spelling reaches chosen physical directory', ['source-alias/a.txt'], 'allow');
} catch(error) { observations.push({name:'directory link probes',verdict:'unsupported',reason:error.code}); }
try {
  fs.linkSync(path.join(project,'outside.txt'), path.join(src,'hard-link.txt'));
  observe('hard link has an outside alias', ['src/hard-link.txt'], 'unsupported');
} catch(error) { observations.push({name:'hard-link probe',verdict:'unsupported',reason:error.code}); }

// Synthetic project/session identities. The second Node process proves storage survives a
// process restart, not that any harness supplies the required lifecycle or invocation authority.
const statePath = path.join(scratch, 'PROTOTYPE-state.json');
const key = JSON.stringify(['node-probe',fs.realpathSync.native(project),'session-a']);
fs.writeFileSync(statePath, JSON.stringify({[key]: chosen}));
const resumed = JSON.parse(spawnSync(process.execPath, [__filename,'read-state',statePath], {encoding:'utf8'}).stdout);
observations.push({name:'second process reloads same synthetic session boundary',verdict:resumed[key] ? 'retained' : 'missing'});
observations.push({name:'concurrent synthetic session has no boundary',verdict:resumed[JSON.stringify(['node-probe',project,'session-b'])] ? 'leaked' : 'unaffected'});
observations.push({name:'other synthetic project has no boundary',verdict:resumed[JSON.stringify(['node-probe',other,'session-a'])] ? 'leaked' : 'unaffected'});
delete resumed[key];
fs.writeFileSync(statePath,JSON.stringify(resumed));
observations.push({name:'explicit synthetic finish clears stored boundary',verdict:Object.keys(JSON.parse(fs.readFileSync(statePath))).length ? 'retained' : 'cleared'});

// Deliberately bypass the edit checker using a harmless literal shell write in the scratch tree.
const shellTarget = path.join(project,'outside-shell.txt');
const shell = process.platform === 'win32'
  ? spawnSync('powershell.exe',['-NoProfile','-Command',"Set-Content -LiteralPath '" + shellTarget.replaceAll("'","''") + "' -Value 'shell wrote outside the freeze'"],{encoding:'utf8'})
  : spawnSync('/bin/sh',['-c','printf "%s\\n" "shell wrote outside the freeze" > "$1"','prototype',shellTarget],{encoding:'utf8'});
observations.push({name:'shell write outside chosen directory',verdict:fs.existsSync(shellTarget) ? 'wrote outside boundary' : 'did not write',exitCode:shell.status,content:fs.existsSync(shellTarget) ? fs.readFileSync(shellTarget,'utf8').trim() : shell.stderr});
console.log(JSON.stringify({date:new Date().toISOString(),platform:process.platform,node:process.version,scratch,kind:'native filesystem probes plus synthetic lifecycle; no harness adapter verification',observations},null,2));
// Scratch files are retained for inspection; no recursive cleanup is performed.
