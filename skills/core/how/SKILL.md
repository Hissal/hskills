---
name: how
description: "Use for \"how does X work\" in the local codebase or an installed package, code walkthroughs before changing something, and placement / ownership / layering questions (\"where should this live\", \"which package owns this\", \"is this the right layer\"). Explains subsystem architecture, runtime flow, onboarding mental models. Use why for motivation."
disable-model-invocation: true
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/how"
  opencode/autoinvoke: "false"
---

# How

Explore the codebase to answer "how does X work?" questions. Produce architectural explanations at the level of a senior engineer onboarding onto a subsystem, enough to build a working mental model, not so much that it reads like annotated source code.

The scope is the local codebase and the packages installed for it, read from disk. External sources (web docs, specs, upstream repositories) stay out: when part of the answer would need one, name that gap.

Done when the explanation is in chat under the sections below, every claim about the code names the file and function it rests on, and every gap the reading could not close is named.

Use read-only subagents where the harness has them, otherwise read it yourself. Before dispatching any subagent, consult `delegating`; when `delegating` is not installed, dispatch with the host's own subagent tool, honouring anything the user stated about model, harness or effort. Every subagent here reads and changes no file. Explorers are helpers: independent, normal difficulty. The explainer is a role agent, because it judges the findings: one, difficult.

## 1. Assess complexity

If the scope is ambiguous, state your interpretation and explore. The user can redirect.

- **Simple** (a single module, a small utility, a narrow question such as "how does function X work"): no explorers. Read the code and answer directly, writing the explanation yourself as [explainer-prompt.md](references/explainer-prompt.md) describes, without the explorer-findings section. Go to step 4.
- **Complex** (a subsystem spanning multiple files or services, a cross-cutting feature, a full architectural overview): go to step 2.

When in doubt, take the simple path.

## 2. Explore (complex only)

Decompose the question into 2 to 4 angles, each a distinct slice of the subsystem, with no two covering the same ground. Start all explorers in parallel, each with [explorer-prompt.md](references/explorer-prompt.md) and its angle filled in. Without read-only subagents, trace each angle yourself in turn and note the same findings.

## 3. Synthesize (complex only)

Once all explorers have returned, spawn one explainer with [explainer-prompt.md](references/explainer-prompt.md) and every explorer's findings filled in. Without read-only subagents, write the explanation yourself from that template.

## 4. Present

Present the explanation in chat. Light edits to the explainer's output for clarity or context from the conversation are fine. Do not substantially rewrite it. Write it to a file only when the user asks for one.

## Output format

The explanation uses the sections defined in [explainer-prompt.md](references/explainer-prompt.md), dropping any that do not apply: Overview, Key Concepts, How It Works, Where Things Live, Gotchas.
