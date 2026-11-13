---
name: issue
description: Use when filing an issue.
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.hskills/issue"
  opencode/autoinvoke: "true"
---

# Issue

File an issue that is not already on the tracker, in the state that says what is left to do with it. Done when one of these holds: the issue is filed with its labels and its URL came back; a match was handled as step 1 says; or the draft waits on the user as a proposed issue.

Read the issue tracker and its triage-labels mapping from the project's configuration: the files its `## Agent skills` block in `AGENTS.md` or `CLAUDE.md` links. When the configuration names no tracker, tell the user to run `/setup-project`, and stop. A role's label is the mapping's entry for it, or the role's own name when the mapping has none.

## Who decides

An issue is **confirmed** when a person saw it before filing: they approved its draft, or dictated what it says in this conversation. Every other issue is **unconfirmed**: one a calling skill hands you from its own findings, or one the user asked for without seeing it ("file issues for whatever you defer").

You file and comment without asking only when:

- the user asked for this issue, or for issues of this kind;
- the skill that called you puts this issue in its scope; or
- the run is an autonomous flow the user explicitly invoked.

Otherwise show the user the draft (title, body, labels) and file once they confirm it, which makes it confirmed. Until it exists, it is a proposed issue.

The run is **unattended** inside an autonomous flow, or when the calling skill runs with nobody to ask. Every other run is attended: the user answers.

## 1. Search before filing

Search open and closed issues for one that already covers this subject, whatever its wording. When the project has a `.out-of-scope/` knowledge base, read it too. Report each match with its standing: open; closed as fixed; closed as `wontfix`; or, for a `.out-of-scope/` entry, already rejected.

- **Attended**: stop and show the match. The user chooses between adding the new evidence to it as a comment, or filing anyway with a link to the match.
- **Unattended**: comment the new evidence on an open match and file nothing. A closed or `.out-of-scope/` match gets neither; report it to the caller.

Post each comment through the `commenting` skill. It is a process call: when it is not installed, open the comment with the note from step 3 and check it for secrets as step 3 checks a body.

## 2. Choose the labels

1. **Unconfirmed**: `needs-triage`, whatever state the rules below would choose, so a person evaluates the issue before anyone builds it; plus the `agent-autofiled` role's label, which marks an issue no person has seen.
2. **A label already decided wins.** When the calling skill, the workflow or the user has set the state label, use it.
3. **Otherwise choose by what is left to decide:**
   - Every decision settled and the criteria checkable: `ready-for-agent`, or `ready-for-human` when a human must do the work. The body is the brief.
   - Decisions or evaluation still open: `needs-triage`.
   - Waiting on a fact from someone: `needs-info`.

Create any of these labels the tracker lacks, under the mapping's string, before filing.

## 3. Write the body

- **Confirmed**: the body holds the issue alone, with no note, disclaimer or signature. It may say where the issue came from in plain words ("Found during review of #12").
- **Unconfirmed**: open the body with this note. `<model>` is the most specific name you can find for the model writing it: a host's runtime note naming `gpt-6.1-sol` beats a harness prompt naming only `GPT-6`. When your context names only a model family, read the configured model from the harness's settings; with no model name anywhere, use the harness name. `<user>` is the login you file as, and the suffix after the bold text says where the issue came from (`during review of #<PR>`, `during triage`); with no origin given, end the line at the bold text.

  ```md
  > [!NOTE]
  > 🤖 **<model> on behalf of @<user>**, during review of #<PR>

  The body starts here.
  ```

Then read the whole body, quoted logs and code included, for secrets and private details: tokens, keys, personal paths, email addresses, internal hostnames. Remove each one; ask the user when removing it changes what the issue says.

## 4. File and confirm

File with the tracker's create command and the labels from step 2, passing the body from a file so the shell leaves it as written. Report the URL the command returns. With no URL, the filing failed or is unknown: search for the issue before filing again, so it appears once.
