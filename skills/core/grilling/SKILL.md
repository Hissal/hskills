---
name: grilling
description: Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases.
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/grilling"
  opencode/autoinvoke: "true"
---

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled: the questions you can ask _now_ without guessing at answers you haven't heard yet. Ask the whole frontier in one round: number each question and give your recommended answer. Then wait for the user's answers before the next round.

Format a round like so:

```
❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>

---

❓ **Q2** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
```

Word each question so "yes" accepts your recommended answer.

Put **one decision per question**: choices the user could accept separately are separate questions. A behaviour stays one question together with its tests and docs.

Keep recommendations to the user's **scope**: a recommendation adds scope, a safeguard or a process the user did not name only when their goal fails without it.

Each round the user answers reshapes the tree: settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question still open in this round belongs to a _later_ round, not this one.

Finding _facts_ is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, etc.), look it up yourself, handing it to a read-only helper with a fresh context window where that is useful; don't ask the user for anything you could look up yourself. Don't block on it: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait for the helper to report; ask the rest of the frontier now. The _decisions_ are the user's: put each to them and wait.

Dispatch a plain read-only helper on the host's own subagent tool directly. Consult `delegating` only when the user asked for a specific model, harness or effort, or the helper would run outside the host's own subagent tool. When `delegating` is not installed, dispatch with the host's own subagent tool, honouring anything the user stated about model, harness or effort.

When the user answers "you decide" on unfamiliar ground, **map first**: lay out that area's decisions, each with the default you would pick, and record every defaulted item as an assumption the user can still overturn.

Before stopping, run an **exit check**: look for effects the answers have in combination, and confirm the done signal, any ordering constraints and how to undo the change. Whatever it turns up joins the frontier.

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed. Do not act on it until the user confirms you have reached a shared understanding, assumptions included.

## Suggestions

Offer a follow-up only when its condition was observed, giving the concrete reason and the invocation, and again only when circumstances change materially. Each one offers; none runs:

- `/to-questionnaire` at an input blocker, once you have fetched what you can, when a decision waits on a coherent set of facts or choices held by an identifiable person outside this conversation. Name the missing input and who should answer. When the present user can answer, ask them directly instead.
- `/wayfinder` when several connected decisions have an unresolved shape that exceeds one session. Name the destination and the blocking decisions, and finish the independent work that is useful now. One difficult question or a large but clear implementation is not that condition.

When you run for a parent agent, make no offer: return the observed follow-up needs, and the parent decides what to offer the user.
