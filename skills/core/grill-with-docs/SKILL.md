---
name: grill-with-docs
description: A relentless interview to sharpen a plan or design, which also creates docs (ADR's and glossary) as we go.
disable-model-invocation: true
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.hskills/grill-with-docs"
  agent-skills-sync.requires: '["hissal.hskills/grilling","hissal.hskills/domain-modeling"]'
  opencode/autoinvoke: "false"
---

Before doing any work, load grilling (hissal.hskills/grilling) and its needed
reference files through the installed skill listing. Begin work only after all
requirements and needed references have loaded. If any cannot load, stop
without partial work and print:

Stopped: required skill grilling (hissal.hskills/grilling) could not be loaded
completely. Unavailable: <unloadable-material>. Ordinary installers such as
`npx skills` do not install requirements; `agent-skills-sync` resolves them
from this metadata. Install or repair the requirement, then retry.

Before doing any work, load domain-modeling (hissal.hskills/domain-modeling) and its needed
reference files through the installed skill listing. Begin work only after all
requirements and needed references have loaded. If any cannot load, stop
without partial work and print:

Stopped: required skill domain-modeling (hissal.hskills/domain-modeling) could not be loaded
completely. Unavailable: <unloadable-material>. Ordinary installers such as
`npx skills` do not install requirements; `agent-skills-sync` resolves them
from this metadata. Install or repair the requirement, then retry.

Check only whether the required material loads; the installer verifies identity
and content. Loading these requirements grants no permission to invoke a
user-invoked workflow; wait for the human to invoke that workflow.

Call the Skill tool twice, for "grilling" and "domain-modeling".

## Suggestion

When the session is done, offer a follow-up only when its condition was observed, giving the concrete reason and the invocation, and again only when circumstances change materially. It offers; it never runs:

- `/to-spec` when the decisions are settled and the work needs a durable specification, such as one that someone other than this session will build from. Name what the spec would capture. A small, clear change that can be built straight from the conversation is not that condition.

With no condition observed, end the session. When you run for a parent agent, make no offer: return the observed follow-up need, and the parent decides what to offer the user.
