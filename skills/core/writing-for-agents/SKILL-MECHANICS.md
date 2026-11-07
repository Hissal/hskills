# Skill mechanics

The skill-specific branch of [`writing-for-agents`](SKILL.md): what changes when the document is a skill (frontmatter, the invocation choice, and router skills). Everything else about writing it is the universal reference in `SKILL.md`.

## Invocation

Two choices, trading the two loads:

- A **model-invoked** skill keeps a `description`, so the agent can fire it autonomously, and other skills can reach it. You can still type its name: model-invocation always _includes_ user reach; a description only ever adds agent discovery, never removes the human's. The description is the skill's top-level context pointer, forced to stay loaded at all times: permanent context load in exchange for discoverability. A model-invoked skill whose content is all reference is also one home for shared reference: another skill can invoke it, so reference needed by several skills lives in one place. Mechanics: omit `disable-model-invocation`, and write a model-facing description carrying the trigger branches (the pointer-writing rules in `SKILL.md` apply in full).
- A **user-invoked** skill strips the description from the agent's reach: only the human typing its name can invoke it, and no other skill can. Zero context load, but it spends cognitive load: you are the index that must remember it exists. Mechanics: set `disable-model-invocation: true`; the `description` becomes human-facing: a one-line summary, trigger lists stripped.

Pick model-invocation only when the agent must reach the skill on its own, or another skill must. If it only ever fires by hand, make it user-invoked and pay no context load.

Shared reference that two user-invoked skills both need can live in neither: with no descriptions, neither can fire the other. Push it to a plain file outside the skill system: external reference any skill can point at.

## Descriptions

A model-invoked description is a **trigger**: it says when to reach for the skill and nothing else. The name says what the skill is, so an identity phrase ("Writing documents for agents.") repeats it at permanent context cost; add one only when the name alone is opaque. Keep it as short as its branches allow.

- **Name the familiar case.** The skill most often skipped is the one whose job looks easy: the agent thinks "I can just do this myself" and never loads it. Name that case among the triggers.
- **Never summarise the steps.** An agent that reads a summary of the procedure in the description follows the summary and skips the body. Trigger examples belong in the body, not the description.
- **Exclusions follow evidence.** Add a sibling exclusion ("use X for that") only after a trigger eval shows the two skills colliding. Then re-read the description whole: an exclusion worded too broadly locks the skill out of its own job.

## Body mechanics

- **One reference per mode.** When a skill has mutually exclusive modes, give each its own reference file and tell the agent to read exactly one.
- **Freedom matches fragility.** Where a wrong move breaks something, give exact steps. Where many paths work, state the goal and leave the path to judgement. State the skill's autonomy once, as one policy (what it may do without asking and when it stops), rather than as permissions scattered through the steps.
- **Scripts are black boxes.** Tell the agent to run a bundled script with `--help` first, never to read it. Put detection in a script that prints `KEY: value` lines, and branch the prose on those keys. Name every dependency the script needs installed.
- **Discover before asking.** Mark no input required when the agent can find it in the repository, its configuration or the environment; ask only for what it cannot find.
- **Versioned claims.** A skill about a versioned library states the version its claims were checked against, and whether each was run or only read. Compile or probe every API claim the skill leans on.

## Splitting by invocation

The invocation cut of splitting (the sequence cut lives in `SKILL.md`): split off a model-invoked skill when you have a distinct leading word that should trigger it on its own (a trigger word you actually use in your prompts), or another skill must reach it. You pay context load for the new always-loaded description, so that independent reach has to be worth it.

## Router skills

When user-invoked skills multiply past what you can remember, that piled-up cognitive load is cured by a **router skill**: one user-invoked skill that names the others and when to reach for each, so the human has one skill to remember instead of many. It can only hint, never fire them: user-invoked skills have no description, so nothing but the human can reach them.
