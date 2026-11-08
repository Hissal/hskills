---
name: loop-me
description: Grill me about specs for the workflows I want to build, within this workspace.
disable-model-invocation: true
argument-hint: "A workflow to design, or nothing to go find one"
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/loop-me"
  opencode/autoinvoke: "false"
---

Run a stateful `/grilling` session whose only output is **workflow** specs. Use the grilling discipline (relentless, a round of questions at a time, a recommended answer attached to each) aimed at the vocabulary and goal below. Create, edit, and delete specs as the grilling resolves things. You design workflows; you never build or run one.

The calls to `grilling` and `delegating` are process calls, not requirements: when one is not installed, say so once and carry on (grill the user yourself; dispatch with the host's own subagent tool, honouring anything the user stated about model, harness or effort).

## The loop lens

A **loop** is a recurring pattern in the user's life: their career, their week, their morning, a single repeated activity. Picturing a life as loops within loops reveals how predictable its activities really are, which is what makes them worth **delegating**. Use the lens to find loops worth specifying, and propose ones the user hasn't noticed.

A **workflow** is the spec of one loop, made real. You run a workflow on a loop: the loop is its running instantiation. Workflows live in `workflows/*.md` and are the source of truth.

## Vocabulary

A shared language, reached for only when a workflow calls for it: never a checklist. **Mandate nothing structural**: a workflow needs no AI, no checkpoint, and no schedule unless the grilling shows it does.

- **Trigger**: what fires each run, an **event** (a new email, a new issue) or a **schedule** (every morning). Event-triggering is usually the more efficient.
- **Checkpoint**: a human-in-the-loop point where the user is asked to verify or decide. Some workflows have none and run autonomously; some use no AI at all.
- **Push right**: defer the checkpoint as far as it will go. Do maximal work before involving the human, so they are asked once, late, with everything prepared.
- **Brief**: what a checkpoint presents, a tight, decision-ready summary (what was produced, why, and a link down to the asset itself), never the raw output. The user reads a brief, not a draft. Speed of review is imperative.

When a workflow hands work to an agent, its spec says which role and difficulty that agent has. The model, effort and transport for it are `delegating`'s to choose: leave them out of the spec unless the user stated them.

## Definition of done

A workflow spec is done when an implementer agent could build it without asking a single question. Grill until then; nothing is done while a question remains.

Those questions are the ones only the user can answer: their world, their goal, their decisions. Implementation choices and exploring the code stay with the implementer; leave them out of the spec.

## The workspace

- `workflows/*.md`: one spec per workflow.
- `NOTES.md`: raw notes on the user's world, the tools they use, the channels they process, and their own terminology for both. When it is empty or thin, interview them about their world before specifying anything. Sharpen fuzzy terms into canonical ones as they surface, and record them here.
