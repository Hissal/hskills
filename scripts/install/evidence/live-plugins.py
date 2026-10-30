#!/usr/bin/env python3
"""Manual Linux acceptance: real CLI lifecycle, existing auth, temporary plugins.

No credentials are read/copied and no user settings or trust state are written.
Logs and the disposable source checkout remain in the printed artifact directory.
"""
import json
import hashlib
import os
from pathlib import Path
import subprocess
import tempfile

protected = [Path.home() / p for p in ['.claude/settings.json', '.codex/config.toml', '.codex/hooks.json']]
def fingerprints():
    return {str(p): hashlib.sha256(p.read_bytes()).hexdigest() if p.exists() else None for p in protected}
baseline = fingerprints()
repo = Path(__file__).resolve().parents[3]
root = Path(tempfile.mkdtemp(prefix='plugin-live-121-'))
print(root, flush=True)
home = root / 'home'
(home / '.codex').mkdir(parents=True)
source = root / 'source'
subprocess.run(['git', 'clone', '--quiet', '--no-hardlinks', str(repo), str(source)], check=True)
env = {**os.environ, 'COMMAND_GUARD_CLAUDE': '/home/agent/.local/bin/claude', 'COMMAND_GUARD_CODEX': '/home/agent/.npm-global/bin/codex'}
def run(name, argv, cwd=root, env=None):
    (root / (name + '-argv.json')).write_text(json.dumps(argv, indent=2))
    with (root / (name + '.stdout')).open('w') as out, (root / (name + '.stderr')).open('w') as err:
        try:
            result = subprocess.run(argv, cwd=cwd, env=env, stdout=out, stderr=err, timeout=180)
            status = result.returncode
        except subprocess.TimeoutExpired:
            status = 'timeout 180s'
    print(name, status, flush=True)
    return status
cli = ['node', str(repo / 'scripts/install/install.js')]
for step in ['install', 'doctor']:
    run(step, cli + [step, '--home', str(home), '--source', str(source)], env=env)
subprocess.run(['python3', str(Path(__file__).with_name('plugin-hooks-list.py')), str(root)], check=True)
record = json.loads((home / '.skill-collection/plugins.json').read_text())
snapshot = record['hosts'][0]['snapshot']
project = root / 'project'
(project / '.agents/config').mkdir(parents=True)
(project / '.agents/config/command-guard.json').write_text(json.dumps({'rules': [{'id': 'project.smoke', 'family': 'smoke', 'tier': 'human-required', 'command': ['printf'], 'anyArg': 'PROJECT_BLOCK_120', 'effect': 'harmless marker'}]}))
assert subprocess.run(['git', 'rev-parse', '--git-dir'], cwd=project, capture_output=True).returncode != 0
prompt = 'Authorized harmless test outside any git repository, with no remote. Invoke each exact command once independently in order: `git push --force origin main`; `printf ALLOW_120`; `printf PROJECT_BLOCK_120`. Report results. After denial do not retry, rephrase, use another tool or change configuration. Continue with the next independent command. Run no other commands.'
claude = ['/home/agent/.local/bin/claude', '-p', '--model', 'opus', '--effort', 'medium', '--no-session-persistence', '--setting-sources', '', '--strict-mcp-config', '--mcp-config', '{"mcpServers":{}}', '--tools', 'Bash', '--allowedTools', 'Bash(git push --force origin main)', 'Bash(printf *)', '--output-format', 'stream-json', '--verbose', '--include-hook-events', '--plugin-dir', snapshot]
assert run('claude-plugin-before', claude + [prompt], project) == 0
# A distinct branch and commit affect only the disposable clone. Remove its guard
# to make any accidental checkout dependency observable after switching branches.
subprocess.run(['git', 'switch', '-c', 'test/without-guard'], cwd=source, check=True)
subprocess.run(['git', 'rm', '-qr', 'hooks/command-guard'], cwd=source, check=True)
subprocess.run(['git', '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', 'test: remove fixture guard'], cwd=source, check=True)
assert run('claude-plugin-after', claude + [prompt], project) == 0
# Ignore user configuration (including its adjacent legacy hooks), retaining
# normal CODEX_HOME authentication. All plugin configuration is invocation-only.
codex = ['/home/agent/.npm-global/bin/codex', 'exec', '--ignore-user-config', '--ephemeral', '--skip-git-repo-check', '-s', 'read-only', '-c', 'approval_policy="never"', '-c', 'marketplaces.skill-collection-guard.source_type="local"', '-c', 'marketplaces.skill-collection-guard.source=' + json.dumps(snapshot), '-c', 'plugins."command-guard@skill-collection-guard".enabled=true']
subprocess.run(['python3', str(Path(__file__).with_name('plugin-session.py')), str(root)], check=True)
run('codex-plugin', codex + [prompt], project)
assert run('uninstall', cli + ['uninstall', '--home', str(home)], env=env) == 0
remaining = [w['path'] for w in record['writes'] if w['before'] is None and Path(w['path']).exists()]
(root / 'remaining-owned.json').write_text(json.dumps(remaining, indent=2))
assert not remaining, remaining
assert baseline == fingerprints(), 'user guard configuration changed'
(root / 'user-config-unchanged.json').write_text(json.dumps(baseline, indent=2))
print('Remaining newly owned files:', len(remaining), flush=True)

for name in ["claude-plugin-before", "claude-plugin-after", "same-session"]:
    events = [json.loads(line) for line in (root / (name + ".stdout")).read_text().splitlines()]
    hooks = [e for e in events if e.get("subtype") == "hook_response"]
    assert any("git.force-push-default" in e.get("output", "") for e in hooks), name
    assert any("project.smoke" in e.get("output", "") for e in hooks), name
    assert any(e.get("output") == "" for e in hooks), name
    if name == "same-session":
        assert len({e["session_id"] for e in hooks}) == 1
        assert len(hooks) == 4, "allow before switch; block, allow, project block after"
