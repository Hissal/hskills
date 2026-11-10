---
name: count-caller
description: Use when asked to count the TODO comments in src/ with an agent.
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.hskills/eval-count-caller"
---
Find out how many TODO comments are in `src/`. Load the `delegating` skill
and start one agent for it through that skill. Then tell the user the number.
