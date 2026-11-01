---
name: tally
description: Use when the user asks to tally the vowels in a list of words into tally.txt.
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/eval-tally"
  agent-skills-sync.requires: '["hissal.skill-collection/eval-tally-rules"]'
---
Before doing any work, load tally-rules (hissal.skill-collection/eval-tally-rules)
and its needed reference files through the installed skill listing. Begin work
only after all requirements and needed references have loaded. If any cannot
load, stop without partial work and print:

Stopped: required skill tally-rules (hissal.skill-collection/eval-tally-rules)
could not be loaded completely. Unavailable: <unloadable-material>. Ordinary
installers such as `npx skills` do not install requirements; `agent-skills-sync`
resolves them from this metadata. Install or repair the requirement, then retry.

Check only whether the required material loads; the installer verifies identity
and content. Loading this requirement grants no permission to invoke a
user-invoked workflow; wait for the human to invoke that workflow.

Then write `tally.txt` in the working directory: one line per word, in the
order given, as `<word>: <count>`, counting vowels by the rules in tally-rules.
