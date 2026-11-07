# Argument grammar

How `/handoff` reads its arguments: the destination, then the selection, then free text. Parse the whole argument string before writing anything. Matching ignores case, and words are split on whitespace.

## Destination

The first word alone decides where the handoff goes:

| First word | Destination |
|---|---|
| `thread` or `new` | a fresh top-level conversation |
| `subagent` or `sub` | a subagent, with the document as its brief |
| anything else, or no arguments | a file in the temporary directory; every word is free text |

With no destination, nothing is read as a selection: `/handoff opus high` is free text.

## Selection

After a destination, read leading words as the selection while each one fills an empty slot:

- **Harness**: the runtime the work continues on: `claude` (Claude Code), `codex`, `opencode`, or another harness the host lists.
- **Model**: a family (`opus`, `sonnet`, `fable`) optionally followed by a version (`5.5`), or one exact model ID (`claude-opus-5-5`). A version counts only directly after a family.
- **Reasoning**: an effort level: `low`, `medium`, `high`, `xhigh`, `max`, or a level name the chosen harness lists.

A word is known when it names a harness, model or level in the host's live listing or the harness's current `--help`, or one named above. Each slot fills at most once. The selection ends at the first word that is not known or whose slot is already filled; that word and everything after it is free text.

The selection is an explicit instruction under `delegating`: it overrides the personal delegation policy for whatever it names, and the policy decides the rest. No selection: the policy decides, or automatic selection when there is none. A family with no version resolves to the newest suitable stable version, as `delegating` resolves family names. An explicit choice that turns out unavailable gets no substitute: the launch falls back as `SKILL.md` says.

## Free text

Whatever is left describes what the next session will focus on; tailor the document to it. When the free text asks for a work brief (`/handoff brief the reconnect bug for a teammate`, `/handoff file a brief about this`), the work-brief form is chosen instead of the continuation document. The form does not change the destination: `/handoff thread brief the reconnect bug` seeds a fresh thread with the brief, and `/handoff sub brief the reconnect bug` dispatches the brief to a subagent.

## Ambiguity

When the words allow two readings and the reading changes what happens, ask the user one question naming both readings, and write nothing until they answer. Ambiguous cases:

- A destination word that reads as part of a sentence: `/handoff new tests for the parser` (a fresh thread focused on parser tests, or a file handoff about new tests).
- A word that fits two slots, or a harness and a model that cannot go together (`/handoff thread codex opus`).
- A word that nearly matches a known name (`opsu`), or a version with no family before it (`/handoff thread 5.5`).
- A selection word with no destination, when the rest reads as a launch request (`/handoff opus high`).

A parse with one sensible reading needs no question.

## Examples

| Arguments | Destination | Selection | Free text |
|---|---|---|---|
| (none) | file | none | none |
| `focus on the migration` | file | none | `focus on the migration` |
| `thread` | thread | none (policy) | none |
| `thread claude opus 5.5 high` | thread | Claude Code, Opus 5.5, high | none |
| `new sonnet fix the flaky test` | thread | Sonnet, newest stable | `fix the flaky test` |
| `sub codex low write the changelog` | subagent | Codex, low | `write the changelog` |
| `sub high high-risk refactor` | subagent | high | `high-risk refactor` |
| `brief the reconnect bug` | tracker or standalone document, as a work brief | none | `brief the reconnect bug` |
| `thread brief the reconnect bug` | thread, seeded with a work brief | none (policy) | `brief the reconnect bug` |
