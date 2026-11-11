# How a `$name` mention loads a skill on T3 (#389)

Run on 2026-11-11 on Linux for [#389](https://github.com/Hissal/hskills/issues/389), which asks the collection to document how a skill mention in delegated text loads a skill. Status: answered for Claude and Codex children on T3; other harnesses rest on the owner's report only. The rule adopted from it is in `delegating` step 5 and `writing-for-agents`' [skill mechanics](../skills/core/writing-for-agents/SKILL-MECHANICS.md#invocation).

Versions: T3 Code server **0.1.9**, Claude Code **2.1.322**, Codex CLI **0.167.1**.

## Contents

- [Answers](#answers)
- [Runs](#runs)
- [Authority](#authority)
- [Not tested](#not-tested)

## Answers

| Text T3 delivers | Claude child | Codex child |
| --- | --- | --- |
| One `$name` with whitespace on each side | Loaded: becomes the slash command, full `SKILL.md` body injected, the text after it as arguments | Plain text |
| Several spaced `$name` mentions | The last loads as above. Each earlier one is rewritten to `/name [The user invoked this skill. Follow the instructions at: <path>]`: permission and a path, no body | Plain text |
| `$name` glued to text or punctuation (`x$why`, `($wait-what)`, `$why,`) | Plain text | Plain text |
| A skill name inside backticks | Plain text | Plain text |

T3 expands a mention wherever it delivers text, not only in a brief: a completion notice whose task title held a bare `$retro` loaded the whole `retro` skill into the parent's turn. A child's Return reaches the parent the same way, so the inference is that a bare mention there loads too; that was not observed.

The owner reports the same expansion by hand on Cursor, Antigravity and OpenCode, and that native Codex expands `$name` only when the skill is picked from its autocomplete.

## Runs

**Fleet build, 2026-11-11** (`Hissal/fleet`, thread "Schedule Fleet Retro Reports"). `delegate_task` briefs holding a bare `$retro` loaded the skill for Claude children on three machines and stayed plain text for Codex children on two. Two completion notices titled with a bare `$retro` loaded the skill into the parent. A backticked `` `$implement` `` in a later message stayed plain text. The adopted use is `Hissal/fleet` commit `7a31ffc`, which loads `retro` into fleet retro agents with `$retro`.

**Re-run for this note.** Three `delegate_task` children, briefs told to follow no skill and report the message as received:

- **A**, Claude Haiku 5.5: `First mention: $why and second mention: $wait-what end of test line.` The session log shows a `<command-name>/wait-what</command-name>` block with the `wait-what` body and `ARGUMENTS: end of test line. …`, then the full message with the first mention rewritten to `/why [The user invoked this skill. Follow the instructions at: /home/agent/.claude/skills/why/SKILL.md]`.
- **B**, Claude Haiku 5.5: `glued x$why here, in parens ($wait-what) here, trailing comma $why, here.` Delivered unchanged; nothing injected.
- **C**, Codex GPT-6 Luna: the same line as A. Delivered unchanged; nothing injected.

## Authority

`why` and `wait-what` are user-invoked (`disable-model-invocation: true`), and both loaded. A host's mention expansion therefore reaches user-invoked skills, which `SKILL-MECHANICS.md` said no other skill could, and which [ADR 0004](../docs/adr/0004-skill-dependencies-use-agent-skills-sync-metadata.md#existing-installations) keeps human-invoked. The rule adopted (proposed on #389, approved by the owner): a brief may mention a user-invoked skill only when the human's request, or the workflow they started, names that skill for that agent. Expansion is a mechanism, not authority.

## Not tested

- Cursor, Antigravity and OpenCode children through `delegate_task`; their row rests on the owner's hand check.
- A bare mention in a child's Return.
- A mention at the very start or end of a brief, and one followed by a newline instead of a space.
- Whether the arguments T3 passes with the last mention change how the loaded skill behaves (for a skill that reads its arguments, they are the rest of the brief).
- Native Claude Code `Agent` and Codex `spawn_agent` prompts outside T3.
