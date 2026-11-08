# Routes

Every route here is a trial: label it experimental. Pick by the situation, not by the name that sounds closest.

| Situation | Invocation | Useful difference | Established alternative |
|---|---|---|---|
| Design or specify a recurring workflow, without executing it | `/loop-me` | Grills through a recurring-work lens (what triggers each run, where the human checks in, what they are shown) and keeps notes on the user's world across sessions; its only output is workflow specs, each done when an implementer could build it without asking a question | `/grilling` to settle the design, then `/to-spec` to write it up |
| Take over an existing PR's checks, conflicts and review feedback until it is ready, without merging | `/babysit-pr <PR>` | Owns the PR through every round on its own: waits on checks and reviews through the host's PR monitoring or a bundled watcher, fixes CI and conflicts, handles each finding through `receiving-review`, and stops at a stated done bar with a report; never merges, and on someone else's PR never rewrites their history | `/receiving-review` on each round of feedback, watching checks and conflicts yourself |
