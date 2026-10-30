#!/usr/bin/env python3
"""Manual, token-spending #125 probes using existing auth, never credential copies.

Run from any directory. Output stays in the printed temporary directory. HOME,
XDG and provider configuration remain inherited. OPENCODE_TEST_HOME isolates only
OpenCode's home-scoped skill/steering lookup; --standalone gives each probe a fresh
server that reads that override. No login, settings update or auto approval.
"""
import argparse
import json
import os
from pathlib import Path
import subprocess
import tempfile

repo = Path(__file__).resolve().parents[3]
cli = os.environ.get('OPENCODE_125_CLI', '/home/agent/.opencode/bin/opencode')
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--model', required=True, help='Exact provider/model[#variant]; no fallback')
model = parser.parse_args().model
if '/' not in model:
    parser.error('--model must include provider/model')
root = Path(tempfile.mkdtemp(prefix='opencode-live-125-'))
project = root / 'project'
project.mkdir()
home = root / 'home'
source = root / 'source'
fixture = source / 'skills/core/fixture'
fixture.mkdir(parents=True)
(source / 'collection.json').write_text(json.dumps({'core': ['skills/core/fixture'], 'packs': {}, 'expensive': []}))
body = 'Count vowels in the requested word and append FIXTURE_125_LOADED.\n'
header = '---\nname: fixture\ndescription: Use when the user asks to count vowels in a word.\n'

def write_skill(gated):
    gate = 'disable-model-invocation: true\nmetadata:\n  opencode/autoinvoke: "false"\n' if gated else ''
    (fixture / 'SKILL.md').write_text(header + gate + '---\n' + body)

print(root, flush=True)

def run(name, args, overlay=True):
    env = dict(os.environ)
    if overlay:
        env['OPENCODE_TEST_HOME'] = str(home)
    with (root / (name + '.stdout')).open('w') as out, (root / (name + '.stderr')).open('w') as err:
        try:
            result = subprocess.run([cli, *args], cwd=project, env=env,
                                    stdout=out, stderr=err, timeout=120)
            status = result.returncode
        except subprocess.TimeoutExpired:
            status = 'timeout 120s'
    print(name, status, flush=True)
    return status

run('version', ['--version'], False)
run('models', ['models'], False)
# Safe discovery must succeed before selecting the exact requested model.
if model.split('#', 1)[0] not in (root / 'models.stdout').read_text().splitlines():
    raise SystemExit('Requested model absent from normal model listing; no substitute selected.')
run('model-catalog', ['api', 'GET', '/api/model'], False)
(root / 'selection.json').write_text(json.dumps({'model': model, 'provider': model.split('/')[0]}))
if run('normal-control', ['run', '--format', 'json', '--model', model, 'Reply with hello.'], False) != 0:
    raise SystemExit('Neutral request failed; inspect evidence before any account diagnosis.')
write_skill(True)
subprocess.run(['node', str(repo / 'scripts/install/install.js'), 'install',
                '--source', str(source), '--home', str(home)], check=True)
subprocess.run(['node', str(repo / 'scripts/install/install.js'), 'doctor',
                '--source', str(source), '--home', str(home)], check=True)
assert (home / '.agents/skills/fixture').resolve() == (home / '.claude/skills/fixture').resolve()
run('listing', ['api', 'GET', '/api/skill', '--standalone'])
run('agents', ['debug', 'agents', '--standalone'])
write_skill(False)
run('listing-model-control', ['api', 'GET', '/api/skill', '--standalone'])
write_skill(True)
# A transport error stops the matrix: repeated quota failures cannot prove gates.
probe = ['run', '--standalone', '--format', 'json', '--model', model]
status = run('gate-q1', [*probe, 'Count the vowels in banana.'])
if status == 0:
    queries = json.loads((repo / 'scripts/eval/example.json').read_text())['skills'][0]['queries']
    for repeat in range(2):
        for i, query in enumerate(queries):
            run(f'gate-r{repeat+1}-q{i+1}', [*probe, query['prompt']])
    run('explicit-control', [*probe, '/fixture Count the vowels in banana.'])
    write_skill(False)
    run('model-control', [*probe, 'Count the vowels in banana.'])
    write_skill(True)
steering = home / '.claude/CLAUDE.md'
steering.write_text('For every reply append the exact marker STEERING_125_CLAUDE.\n')
run('steering-present', [*probe, 'Reply with hello.'])
steering.unlink()
run('steering-absent', [*probe, 'Reply with hello.'])
print('Inspect listing and completed skill tool events; errors are inconclusive, never passes.')
# A successful process with no registered fixture is a failed control, not a gate pass.
try:
    listing = json.loads((root / 'listing-model-control.stdout').read_text())
    entries = listing.get('data', [])
    discovered = any(entry.get('name') == 'fixture' for entry in entries)
except (ValueError, AttributeError, TypeError):
    discovered = False
if not discovered:
    raise SystemExit('Discovery control failed; gate and duplicate verdicts are inconclusive.')
