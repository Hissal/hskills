# Routes

Every route here is a trial: label it experimental. Pick by the situation, not by the name that sounds closest.

| Situation | Invocation | Useful difference | Established alternative |
|---|---|---|---|
| Design or specify a recurring workflow, without executing it | `/loop-me` | Grills through a recurring-work lens (what triggers each run, where the human checks in, what they are shown) and keeps notes on the user's world across sessions; its only output is workflow specs, each done when an implementer could build it without asking a question | `/grilling` to settle the design, then `/to-spec` to write it up |
| Compare two independently built implementations of one goal and keep the stronger | `/arena` | Two implementers build the same goal under the same constraints and criteria, each in isolation and on another model family when one is available; a separate evaluator runs each criterion's check on both artifacts, picks a base, may carry over the other's ideas, and the result is verified. Costs about two builds plus an evaluation | `/implement` for one build; `/prototype` to compare design variants without building the real thing |
