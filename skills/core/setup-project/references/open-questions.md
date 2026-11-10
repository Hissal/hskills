# Open questions

The routes behind [Open questions](../SKILL.md#open-questions): the research brief, the handoff record and the suggestion wording. Read the part the route needs.

## Research subagent

Start it the moment the question turns out to need investigation, before the next section. Ask `delegating` for one researcher: role researcher, difficulty that of the question, no diversity. When `delegating` is not installed, say so once and use the host's own subagent tool. Run it in the background where the host allows.

Its brief, in `delegating`'s shape, carries:

- **Objective**: the one question, the choice it informs, and the options setup is weighing.
- **Authority**: read sources; write only `docs/agents/setup-research/<slug>.md`, the findings file. Evidence and what it means for each option; the choice stays with the owner.
- **Skills to call**: `research` when installed, doing the reading itself rather than starting another agent. Otherwise primary sources, each cited beside its claim.
- **Stop when**: the question is answered or the sources searched are named as coming up empty.
- **Return**: `research`'s return when it was called: the answer in brief, each line at its confidence tier, and the findings file's path.

While it runs, take every section that does not need the answer, and name the section you are holding back. Their writes wait for the draft as usual. When it returns, read the findings file, then bring the evidence to the owner at the next pause between sections: the answer in brief, its confidence, the file path. Then put the held question. You may say which option you would pick. The section records what the owner answers.

Research still running needs no record while the owner is in the run. A dispatch that is blocked, or an owner who leaves before deciding, turns this into a [handoff](#handoff) whose evidence is the findings file and whose next action is the owner's decision. The findings file stays in the project as the evidence behind the choice.

## Handoff

Setup records the handoff itself, as soon as the block is known, and keeps going. It needs no other skill. It holds:

- **Question**: what has to be answered or done, and by whom.
- **Evidence**: what this run found, with paths, command output and links.
- **Blocks**: the sections or steps waiting on it, and what proceeded without it.
- **Decisions**: each one tagged the owner's, the agent's or pending. Only the owner's are approved.
- **Next action**: the concrete first step, and where setup resumes: re-run `/setup-project`.

Where it goes:

- **GitHub or GitLab tracker settled and reachable**: show the title and body and ask once, then create the issue with the commands in `docs/agents/issue-tracker.md`, or its seed if the file is not written yet, with no assignee and no mention of anyone. Add one line to `docs/agents/setup-handoff.md` linking it. On a no, record it locally.
- **Any other case** (no tracker, one not settled or not reachable yet, local markdown or a tracker with no CLI): write it as an entry in `docs/agents/setup-handoff.md`, a section per open question.

That file opens with `Open setup questions. Re-run /setup-project to bring these back.` and is written at once, ahead of the draft, since it holds only what this run already knows. The `### Setup handoff` sub-block is added at [Deliver guidance](../SKILL.md#4-deliver-guidance), or with the next write for an entry raised after it, where it takes no approval, since it only names what is open.

**On a re-run**, bring each entry back first: read its linked issue when it has one, and ask the owner only what the record leaves open. An answered entry feeds its section and leaves the file, and so does a blocked check that now passes when you run its next action; the last one out removes the file and the sub-block. An unanswered entry stays exactly as written.

## Suggestions

A suggestion is raised at the blocker, in this form, and the owner starts it:

```md
**Suggestion, yours to start:** `<the invocation, with its context filled in>`
**Why:** <the blocker, and what this gets you>
**Resumes at:** <the section or step>, by re-running `/setup-project`
```

You print the invocation and go on with independent work, even where the host would let you call the skill. It adds no permission. Every suggestion comes with a [handoff](#handoff), so the question survives whether the owner starts it, declines it or has no such skill installed, and an absent skill blocks nothing.

**`/wayfinder`**, for several connected decisions whose shape is unclear and which exceed one session. The destination names the decisions needed to resume setup, and the context gives what this run found:

```text
/wayfinder Destination: <the decisions needed to resume setup>. Context: <what exploration found, the sections waiting, the handoff entry>.
```

The map lives on the tracker, so settle [Issue tracker](../SKILL.md#issue-tracker) first; local markdown is enough.

**`/wizard`**, for a sequence only the human can perform that blocks progress, where an interactive procedure would materially help:

```text
/wizard <the outcome>: <the ordered stages, and the values each produces>.
```

**`/handoff`**, when the owner wants the open question carried into another session or to a teammate, rather than waiting for a re-run:

```text
/handoff thread <the question, and the handoff entry or issue to start from>
```
