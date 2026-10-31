#!/usr/bin/env python3
"""Manual Linux authenticated evidence. Requires unprivileged mount namespaces.

Uses existing auth in place. Only skill directories are overlaid in a private
mount namespace; no credentials or user settings are copied or changed.
"""
import json
import os
from pathlib import Path
import subprocess
import sys
import shutil

if len(sys.argv) == 2 and sys.argv[1] == '--list':
    p=subprocess.Popen([shutil.which('codex') or str(Path.home() / '.npm-global/bin/codex'),'app-server'],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL,text=True)
    for m in [{'id':1,'method':'initialize','params':{'clientInfo':{'name':'scope-evidence','version':'1'}}},{'method':'initialized'},{'id':2,'method':'skills/list','params':{'cwds':[os.getcwd()],'forceReload':True}}]:
     p.stdin.write(json.dumps(m)+'\n');p.stdin.flush()
    while True:
     line=p.stdout.readline()
     if not line: break
     if not line.strip(): continue
     print(line,flush=True)
     if json.loads(line).get('id')==2: break
    p.terminate();p.wait(timeout=10)
    sys.exit(0)

if len(sys.argv) == 3 and sys.argv[1] == '--child':
    spec = json.loads(Path(sys.argv[2]).read_text())
    subprocess.run(['mount', '--make-rprivate', '/'], check=True)
    for source, target in spec['mounts']:
        subprocess.run(['mount', '--bind', source, target], check=True)
        subprocess.run(['mount', '-o', 'remount,bind,ro', target], check=True)
    os.chdir(spec['cwd'])
    os.execv(spec['argv'][0], spec['argv'])

repo = Path(__file__).resolve().parents[3]
built = ('ROOT: ' + sys.argv[1]) if len(sys.argv) == 2 else subprocess.check_output(['node', str(repo / 'scripts/install/evidence/cross-scope.js')], text=True)
print(built, flush=True)
root = Path(built.split('ROOT: ')[1].strip())
for scenario in ['duplicate', 'project-to-user', 'user-to-project']:
    base = root / scenario
    settings = base / 'live-settings.json'
    settings.write_text(json.dumps({'disableAllHooks': True, 'permissions': {'allow': ['Read']}}))
    prompt = 'Invoke {invoke}. Load the selected caller body and required skill body and reference using installed skill visibility. Report their exact paths, body markers and reference token. Also report every scope-caller entry visible in your installed skill listing with its path. Do not edit anything or invoke other skills.'
    for host in ['claude', 'codex']:
        if (base / (host + '-status.json')).exists() and json.loads((base / (host + '-status.json')).read_text()) == 0:
            continue
        if host == 'claude':
            argv = [shutil.which('claude') or str(Path.home() / '.local/bin/claude'), '-p', '--model', 'opus', '--effort', 'medium', '--setting-sources', 'user,project', '--settings', str(settings), '--strict-mcp-config', '--mcp-config', '{"mcpServers":{}}', '--no-session-persistence', '--tools', 'Read,Skill', '--output-format', 'stream-json', '--verbose', prompt.format(invoke='/scope-caller')]
        else:
            argv = [shutil.which('codex') or str(Path.home() / '.npm-global/bin/codex'), 'exec', '--ephemeral', '--skip-git-repo-check', '--model', 'gpt-6.1-sol', '-s', 'read-only', '-c', 'approval_policy="never"', '-c', 'model_reasoning_effort="medium"', '--json', prompt.format(invoke='$scope-caller')]
        spec = {'cwd': str(base / 'project'), 'argv': argv, 'mounts': [[str(base / 'home' / folder / 'skills'), str(Path.home() / folder / 'skills')] for folder in ['.claude', '.agents']]}
        specfile = base / (host + '-invocation.json')
        specfile.write_text(json.dumps(spec, indent=2))
        if host == 'codex':
            listing = dict(spec, argv=[sys.executable, str(Path(__file__).resolve()), '--list'])
            listfile = base / 'codex-list-invocation.json'
            listfile.write_text(json.dumps(listing, indent=2))
            with (base / 'codex-list.jsonl').open('w') as out:
                subprocess.run(['unshare', '-Urm', sys.executable, str(Path(__file__).resolve()), '--child', str(listfile)], stdin=subprocess.DEVNULL, stdout=out, timeout=30, check=True)
        with (base / (host + '.jsonl')).open('w') as out, (base / (host + '.stderr')).open('w') as err:
            try:
                status = subprocess.run(['unshare', '-Urm', sys.executable, str(Path(__file__).resolve()), '--child', str(specfile)], stdin=subprocess.DEVNULL, stdout=out, stderr=err, timeout=180).returncode
            except subprocess.TimeoutExpired:
                status = 'timeout'
        (base / (host + '-status.json')).write_text(json.dumps(status))
        print(scenario, host, status, flush=True)
