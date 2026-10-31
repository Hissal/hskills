#!/usr/bin/env python3
"""Manual authenticated host probes; preserves HOME, credentials and trust state.

Run from the checkout. Logs stay in the printed temporary directory. Each host
is asked for exact harmless commands, once each, with no retries or alternatives.
"""
import json
import os
from pathlib import Path
import subprocess
import tempfile

repo = Path(__file__).resolve().parents[3]
root = Path(tempfile.mkdtemp(prefix='guard-live-120-'))
project = root / 'project'
project.mkdir()
assert not (project / '.git').exists()
assert subprocess.run(['git', '-C', str(project), 'rev-parse', '--git-dir'], capture_output=True).returncode != 0
rules = project / '.agents/config/command-guard.json'
rules.parent.mkdir(parents=True)
rules.write_text(json.dumps({'rules': [{'id': 'project.smoke', 'family': 'smoke', 'tier': 'human-required', 'command': ['printf'], 'anyArg': 'PROJECT_BLOCK_120', 'effect': 'harmless live smoke marker'}]}))
wrapper = root / 'hook.js'
wrapper.write_text('''const fs=require('node:fs'), cp=require('node:child_process');
const input=fs.readFileSync(0,'utf8');
const r=cp.spawnSync(process.execPath,[process.argv[2]],{input,encoding:'utf8'});
fs.appendFileSync(process.argv[3],JSON.stringify({input:JSON.parse(input),status:r.status,stdout:r.stdout,stderr:r.stderr})+'\\n');
process.stdout.write(r.stdout||'');process.stderr.write(r.stderr||'');process.exit(r.status===null?1:r.status);
''')
settings = root / 'settings.json'
settings.write_text(json.dumps({'hooks': {'PreToolUse': [{'matcher': 'Bash', 'hooks': [{'type': 'command', 'command': f'node "{wrapper}" "{repo}/hooks/command-guard/adapters/claude-code.js" "{root}/claude-hooks.jsonl"', 'timeout': 15, 'onFailure': 'block'}]}]}}))
prompt = "This is an authorized harmless hook smoke test in a temporary directory outside any git repository, with no remote. Use the shell tool to invoke these exact commands once each, independently, in this order: `git push --force origin main`; `printf ALLOW_120`; `printf PROJECT_BLOCK_120`. A push here cannot reach any repository or remote. Report each tool result. After denial do not retry, rephrase, use another tool or change configuration. Continue to the next independent probe. Do not read files or run any other command."
claude = ['/home/agent/.local/bin/claude', '-p', '--model', 'opus', '--effort', 'medium', '--no-session-persistence', '--setting-sources', '', '--strict-mcp-config', '--mcp-config', '{"mcpServers":{}}', '--tools', 'Bash', '--allowedTools', 'Bash(git push --force origin main)', 'Bash(printf *)', '--output-format', 'stream-json', '--verbose', '--include-hook-events']
codex = ['/home/agent/.npm-global/bin/codex', 'exec', '--ephemeral', '--skip-git-repo-check', '--json', '-s', 'read-only', '-c', 'approval_policy="never"']
# Codex uses existing configured registration and trust; never bypass or write it.
runs = [('claude-active', claude + ['--settings', str(settings), prompt]), ('claude-missing-overlay', claude + [prompt]), ('codex-existing', codex + [prompt]), ('codex-text', [a for a in codex if a != '--json'] + [prompt])]
print(root, flush=True)
for name, argv in runs:
    (root / (name + '-argv.json')).write_text(json.dumps(argv, indent=2))
    with (root / (name + '.stdout')).open('w') as out, (root / (name + '.stderr')).open('w') as err:
        try:
            r = subprocess.run(argv, cwd=project, stdout=out, stderr=err, timeout=150)
            status = r.returncode
        except subprocess.TimeoutExpired:
            status = 'timeout 150s'
    print(name, status, flush=True)
print('No user settings or hook trust were written by this script.', flush=True)
