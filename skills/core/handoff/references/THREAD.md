# Thread destination

`/handoff thread` (or `new`) moves the work to an ordinary fresh top-level conversation: one the user opens, reads and talks to like any session they started themselves. Its first prompt is the whole handoff document, so it starts with nothing of this conversation but the document.

## Launch

Resolve the selection through `delegating` first, then launch through the first mechanism that reaches the selected harness and model:

1. **The host's own new-thread tool.** In T3 Code, use its ordinary thread-launch tool, read its live schema, and pass the current workspace (the checkout or worktree this session runs in) explicitly. A child or delegated task is not a thread: it reports to this session instead of to the user, so it never substitutes for one.
2. **A harness CLI that starts a background session the user can open.** For Claude Code:

   ```bash
   claude --bg --name "<descriptive name>" [--model <model>] [--effort <level>] -- "$(cat <document path>)"
   ```

   Read `claude --help` before the first run in a session. `--name` sets the name shown in `claude agents`, the session picker and the terminal title; name the work, such as `"Fix login bug"`. Passing the file keeps the shell from running backticks or expanding `$` in the document. The session starts in the current working directory and the command returns at once. Another harness's CLI qualifies only when its current `--help` shows a session the user can later open and continue; a one-shot headless run that exits after answering is not a thread.

Pass no permission or sandbox flag wider than this session runs with. The new thread inherits no authority from the launch: its reader block still makes it confirm with the user before acting.

When no mechanism reaches the selection, the launch is unavailable: fall back as `SKILL.md` says.

## Reply

Give the new thread's name or link and how to open it (in Claude Code, `claude agents` lists it and `claude attach <name>` opens it), the selection that ran and why (`delegating`'s dispatch summary), and the document's path.
