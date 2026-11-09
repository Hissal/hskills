#!/usr/bin/env python3
"""Read auth type and hook provenance together; never log account identifiers."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import threading
import tomllib

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('artifact', type=Path)
parser.add_argument('--cached-home', action='store_true', help='inspect isolated registration instead')
args = parser.parse_args()
cache_home = args.artifact.resolve() / 'home/.codex'
config = tomllib.loads((cache_home / 'config.toml').read_text())
source = config['marketplaces']['hskills']['source']
argv = ['/home/agent/.npm-global/bin/codex']
env = os.environ.copy()
if args.cached_home:
    env['CODEX_HOME'] = str(cache_home)
else:
    # Keep the caller’s normal home and authentication store.
    argv += ['-c', 'marketplaces.hskills.source_type="local"',
             '-c', 'marketplaces.hskills.source=' + json.dumps(source),
             '-c', 'plugins."command-guard@hskills".enabled=true']
normal_home = Path(os.environ.get('CODEX_HOME', str(Path.home() / '.codex')))
def settings_digest():
    return {str(p): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in sorted(normal_home.glob('*.toml'))
            if p.is_file()} | {
                str(p): hashlib.sha256(p.read_bytes()).hexdigest()
                for p in [normal_home / 'hooks.json'] if p.is_file()}
before = settings_digest()
result = {'argv': argv + ['app-server', '--stdio'], 'cachedHome': args.cached_home}
process = subprocess.Popen(result['argv'], env=env, stdin=subprocess.PIPE,
                           stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True)
timer = threading.Timer(30, process.kill)
timer.start()
def send(i, method, params):
    process.stdin.write(json.dumps({'id': i, 'method': method, 'params': params}) + '\n')
    process.stdin.flush()
try:
    send(1, 'initialize', {'clientInfo': {'name': 'human-review-auth', 'version': '1'},
                           'capabilities': {'experimentalApi': True}})
    seen = set()
    for line in process.stdout:
        message = json.loads(line)
        identity = message.get('id')
        if identity == 1:
            if 'error' in message:
                raise RuntimeError('initialize failed')
            send(2, 'account/read', {'refreshToken': False})
            send(3, 'hooks/list', {'cwds': [str(args.artifact.resolve() / 'project')]})
        elif identity in (2, 3):
            if 'error' in message:
                raise RuntimeError('read failed: ' + str(identity))
            seen.add(identity)
            if identity == 2:
                account = message['result'].get('account')
                result['accountType'] = account.get('type') if account else None
            else:
                result['hooks'] = message['result']
            if seen == {2, 3}:
                break
    if seen != {2, 3}:
        raise RuntimeError('incomplete host responses')
finally:
    process.terminate()
    process.wait()
    timer.cancel()
result['normalSettingsUnchanged'] = before == settings_digest()
print(json.dumps(result, indent=2))
