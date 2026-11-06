# Steering files

The steering-file branch of [`writing-for-agents`](SKILL.md): what changes when the document is an `AGENTS.md`, a `CLAUDE.md` or another file the harness loads into every session. Everything in `SKILL.md` still applies; a steering file is the extreme case of context load, since every line is paid for on every turn of every session in the repo.

## What earns a line

A line stays only when it passes the **text gate**, all three tests:

1. It applies in nearly every session where the file loads.
2. An agent was seen getting it wrong without the line.
3. No skill, hook, check or configuration file could carry it instead.

There is no line target. The length is whatever survives the gate, line by line; a short file full of lines that fail it is still too long. The 500-token tripwire governs only the core always-on file (the personal steering source) and sets no budget for a project's steering files.

## Writing or editing one

1. **Inspect first.** Read the repository before writing a line: its manifests and scripts, CI configuration, directory layout, existing steering files and the docs they point at. Write only what that reading shows the agent cannot find by looking.
2. **Start from the smallest useful file.** Begin empty and add lines that pass the gate, rather than filling a template's sections.
3. **Nest only where a subtree differs.** Add an `AGENTS.md` in a subfolder only when that subtree's commands, conventions or constraints differ from the root's. It holds the difference and nothing the root already says.
4. **Point with a table.** Material only some sessions need goes in its own doc, reached by a pointer table: one row per doc, a repo-relative path, and the condition for reading it. Each row is a context pointer; word it by the pointer rules in `SKILL.md`.
5. **Give file-scoped commands.** Prefer the command that lints, type-checks or tests one file or package over the whole-repo run, so the agent can check its own change quickly. Keep the full run beside it only when the agent must run it before finishing.
6. **Verify every path and command.** Open each path and run each command (or its `--help`) before keeping the line, and again whenever you edit the file. A stale command sends the agent down a wrong path with the file's full authority.

**Done** when every line passes the text gate and every path and command in the file was opened or run in this edit.

## What not to add

- **Restated linter or formatter configuration.** The config file is the source of truth and the tool enforces it; point at the command that runs it.
- **Lists of installed skills.** The harness already lists them, and a copy goes stale with the next install. A project's pack list (the `### Packs` lines naming the pack guides the project selected) is project configuration, not an installed-skill list, and stays.
- **Slogans.** "Write clean code" or "think carefully" changes nothing the model does by default: a no-op on every turn.
- **What the code already says.** Facts any agent sees at a glance from the files themselves: the language, the framework, what a well-named folder holds.
- **Generic good practice.** Advice true of every project, which the model follows without being told.
- **One-off fixes.** A correction from a single session that will not recur; it fails the first test of the gate.
- **An attribution section.** Credits for where the file's ideas came from cost load and steer nothing.

## Both harnesses in one repo

When a repo is used by both Claude and Codex (or another `AGENTS.md` reader), put the content in `AGENTS.md`. `CLAUDE.md` holds one line, `@AGENTS.md`, which imports it, so both harnesses read one source of truth.

Write that `CLAUDE.md` as a real file, never as a symlink to `AGENTS.md`: on Windows, a git checkout without symlink support turns the link into a one-line text file holding the target's name, and Claude reads the word `AGENTS.md` instead of the file.
