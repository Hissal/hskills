#!/usr/bin/env python3
# CLI boundary double, a port of host.cjs; production registration and all filesystem work stay real.
# POSIX runs use this one: the installer starts the double about ten times per run, and a
# Python start costs a fraction of a node start. Windows cannot start it directly and keeps host.cjs.
# Keep the two doubles' behaviour identical.
import json
import os
import sys

dump = lambda value: json.dumps(value, separators=(',', ':'))
host = 'codex' if 'codex' in os.path.basename(sys.argv[0]) else 'claude'
root = os.environ['CODEX_HOME' if host == 'codex' else 'CLAUDE_CONFIG_DIR']
plugins = os.path.join(root, 'plugins')
os.makedirs(plugins, exist_ok=True)
market = os.path.join(plugins, 'market.json')
installed = os.path.join(plugins, 'installed.json')
args = sys.argv[1:]
exists = lambda name: os.path.exists(os.path.join(root, name))


def read(file):
    with open(file, encoding='utf-8') as f:
        return f.read()


def write(file, text, mode='w'):
    with open(file, mode, encoding='utf-8', newline='') as f:
        f.write(text)


if args[:1] == ['app-server']:
    if exists('status-unavailable'):
        sys.exit(1)
    while True:
        line = sys.stdin.readline()
        if not line:
            break
        request = json.loads(line)
        if request.get('id') == 1:
            print(dump({'id': 1, 'result': {}}), flush=True)
        if request.get('id') == 2:
            user = []
            if exists('hooks.json'):
                groups = json.loads(read(os.path.join(root, 'hooks.json')))['hooks'].get('PreToolUse') or []
                user = [{'source': 'user', 'command': h['command'], 'enabled': True,
                         'trustStatus': 'trusted' if exists('legacy-trusted') else 'untrusted'}
                        for g in groups for h in (g.get('hooks') or [])]
            hooks = [{'source': 'plugin', 'pluginId': 'command-guard@skill-collection-guard', 'enabled': True,
                      'trustStatus': 'trusted' if exists('human-trusted') else 'untrusted'}, *user]
            print(dump({'id': 2, 'result': {'data': [{'hooks': hooks, 'errors': []}]}}), flush=True)
else:
    output = {}
    command = args[1] if len(args) > 1 else None
    if command == 'marketplace':
        if args[2] == 'add':
            write(market, dump({'source': args[3]}))
        elif args[2] == 'remove':
            os.unlink(market)
    elif command in ('add', 'install'):
        source = json.loads(read(market))['source']
        write(installed, dump({'id': 'command-guard@skill-collection-guard', 'pluginId': 'command-guard@skill-collection-guard',
                               'enabled': True, 'readFromFolder': source, 'source': {'path': source}}))
        config = os.path.join(root, 'config.toml' if host == 'codex' else 'settings.json')
        if not os.path.exists(config):
            write(config, '# installed\n' if host == 'codex' else '{}')
        if host == 'codex' and '[plugins."command-guard@skill-collection-guard"]' not in read(config):
            write(config, '\n[plugins."command-guard@skill-collection-guard"]\nenabled = true\n', 'a')
    elif command == 'list':
        listed = [json.loads(read(installed))] if os.path.exists(installed) else []
        output = {'installed': listed} if host == 'codex' else listed
    print(dump(output))
