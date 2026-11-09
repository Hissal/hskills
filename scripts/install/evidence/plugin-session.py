#!/usr/bin/env python3
"""Two turns in one Claude plugin session; called by live-plugins.py."""
import json,subprocess,pathlib,threading,sys
r=pathlib.Path(sys.argv[1])
s=json.loads((r/'home/.hskills/plugins.json').read_text())['hosts'][0]['snapshot']
prompt='Run these exact harmless commands once each independently: `git push --force origin main`; `printf ALLOW_120`; `printf PROJECT_BLOCK_120`. This directory has no git repository or remote. After denial do not retry, rephrase or use another tool. Continue with the next independent probe. Run no other commands.'
a=['/home/agent/.local/bin/claude','-p','--model','opus','--effort','medium','--no-session-persistence','--setting-sources','','--strict-mcp-config','--mcp-config','{"mcpServers":{}}','--tools','Bash','--allowedTools','Bash(git push --force origin main)','Bash(printf *)','--output-format','stream-json','--input-format','stream-json','--verbose','--include-hook-events','--plugin-dir',s]
(r/'same-session-argv.json').write_text(json.dumps(a,indent=2))
# Restore the disposable source before testing the running session.
f=r/'source'
subprocess.run(['git','switch','--detach','HEAD~1'],cwd=f,check=True)
with (r/'same-session.stderr').open('w') as err,(r/'same-session.stdout').open('w') as out:
 p=subprocess.Popen(a,cwd=r/'project',stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=err,text=True)
 timer=threading.Timer(240,p.kill);timer.start()
 def send(content):
  p.stdin.write(json.dumps({'type':'user','message':{'role':'user','content':content}})+'\n');p.stdin.flush()
 send('Invoke only `printf ALLOW_120` once. Run no other commands.');turn=0
 for line in p.stdout:
  out.write(line);out.flush()
  try:e=json.loads(line)
  except ValueError:continue
  if e.get('type')=='result':
   turn+=1
   if turn==1:
    subprocess.run(['git','switch','-c','test/session-switch'],cwd=f,check=True)
    subprocess.run(['git','rm','-qr','hooks/command-guard'],cwd=f,check=True)
    subprocess.run(['git','-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-qm','test: remove fixture guard'],cwd=f,check=True)
    send(prompt)
   else:p.stdin.close()
 p.wait();timer.cancel();print('same-session',p.returncode,'turns',turn)
