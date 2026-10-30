#!/usr/bin/env python3
"""Read host plugin hook origin, effective cached path and trust; never approve."""
import os,json,subprocess,pathlib,threading,sys
r=pathlib.Path(sys.argv[1]);env={**os.environ,'HOME':str(r/'home'),'CODEX_HOME':str(r/'home/.codex')}
a=['/home/agent/.npm-global/bin/codex','app-server','--stdio']
p=subprocess.Popen(a,env=env,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=open(r/'hooks-list.stderr','w'),text=True)
t=threading.Timer(30,p.kill);t.start()
def send(m):p.stdin.write(json.dumps(m)+'\n');p.stdin.flush()
send({'id':1,'method':'initialize','params':{'clientInfo':{'name':'acceptance','version':'1'},'capabilities':{'experimentalApi':True}}})
with (r/'hooks-list.jsonl').open('w') as out:
 for line in p.stdout:
  e=json.loads(line)
  if e.get('id')==1:
   send({'method':'initialized'});send({'id':2,'method':'hooks/list','params':{'cwds':[str(r/'project')]}})
  if e.get('id')==2:
   out.write(line);print(line);p.terminate();break
p.wait();t.cancel()
