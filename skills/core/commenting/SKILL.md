---
name: commenting
description: Use when posting a comment, reply or dismissal reason on a PR or issue on the user's behalf.
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/commenting"
  opencode/autoinvoke: "true"
---

# Commenting

A comment you post for the user says up front that an agent wrote it, leaks nothing, and lands. Done when every comment carries the note, has passed the check before posting, and its URL came back; and every review thread you resolved got its reply first.

**Covers** top-level PR and issue comments, inline review comments, replies to reviewers or bots, and the written reason for dismissing or resolving feedback. A review's summary and each of its inline comments are separate comments, each with its own note.

**Leaves out** PR bodies (the `pr` skill writes their footer), issue bodies, commit messages, and text the user asked you to post verbatim.

## 1. Open with the note

```md
> [!NOTE]
> 🤖 **<model> on behalf of @<user>**

The comment starts here.
```

- `<model>`: the full public name the harness reports for the model writing the comment, copied as reported (for example "Claude Opus 5.5", not "Claude"). When the harness reports no model name, use the harness name. A guessed name is worse than the harness name.
- `<user>`: the GitHub login you post as (`gh api user --jq .login`).
- Context suffix: only when the skill that called you supplies one, add it as given after the bold text, a comma and a space between. For example, the suffix `during triage` gives `> 🤖 **<model> on behalf of @<user>**, during triage`. With none supplied, the line ends at the bold text.
- The note holds that one line; the comment sits below it, outside the quote. It is the comment's only attribution: no signature, footer, heading or rule.

## 2. Write the comment

- Lead with the conclusion: the answer, decision or result is the first sentence.
- Cite what backs it: the file and line, the check or command and its output, or the reproduction.
- Keep verified facts apart from judgement: say what you ran or read, and mark what you think.
- Every sentence carries a fact, a reason or a request. Thanks, restated questions and a log of what you did along the way carry none.

## 3. Check before posting

- **Secrets and private details.** Read the whole comment, quoted text, logs, code blocks, links and attachments included, for tokens, keys, passwords, connection strings, personal paths, email addresses, internal hostnames, and anything from a private source going somewhere more public. Remove each one; ask the user when removing it would change what the comment says.
- **Preview.** Write the comment to a file and render it, for example `gh api markdown -f mode=gfm -F text=@<file>`. Confirm the note, quotes, code fences and blank lines render as written. Post from the same file (`--body-file`, or `-F body=@<file>` with `gh api`), so the shell changes nothing.

## 4. Post and confirm

- The post's response carries the new comment's or review's URL; report it to the user. With no URL, the post failed or is unknown: look for the comment before posting again, so it never appears twice.
- Resolve a review thread only after its reply has posted and returned its URL.
