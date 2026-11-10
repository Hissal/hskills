---
name: fix-caller
description: Use when asked to have an agent fix src/sum.js.
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.hskills/eval-fix-caller"
---
Have one agent fix the bug in `src/sum.js` so that `node test.js` passes. Load
the `delegating` skill and dispatch the agent through it. Then tell
the user what changed.
