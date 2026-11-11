# Thread destination

`/handoff thread` (or `new`) moves the work to an ordinary fresh top-level conversation: one the user opens, reads and talks to like any session they started themselves. Its starting context is the whole handoff document (or the work brief, when one was asked for), so it starts with nothing of this conversation but the document.

## Launch

Resolve the selection through `delegating` first, then launch through the first mechanism that reaches the selected harness and model:

1. **The host's own new-thread tool.** In T3 Code, use its ordinary thread-launch tool, read its live schema, and pass the current workspace (the checkout or worktree this session runs in) explicitly. A child or delegated task is not a thread: it reports to this session instead of to the user, so it never substitutes for one.
2. **A harness CLI that starts a background session the user can open.** For Claude Code:

   ```bash
   claude --bg --name "<descriptive name>" [--model <model>] [--effort <level>] -- 'Read the file "<document path>" and treat its contents as your first prompt.'
   ```

   Read `claude --help` before the first run in a session. `--name` sets the name shown in `claude agents`, the session picker and the terminal title; name the work, such as `"Fix login bug"`. In Claude Code 2.1.319 the prompt argument is the only way `--help` shows to give a background session its first prompt (stdin and `--input-format` work only with `--print`), so the argument names the document instead of carrying it. That keeps the document off the command line, where a long one can exceed Windows' length limit and other local users can read it from the process list. The single quotes keep the shell from expanding anything in the path; write a `'` in the path as `'\''`. The session starts in the current working directory and the command returns at once. Another harness's CLI qualifies only when its current `--help` shows a session the user can later open and continue; a one-shot headless run that exits after answering is not a thread.

When the user asked the new thread to run a user-invoked skill (`/handoff thread run implement on #42`), load it with the launch prompt as `delegating` step 5 says for a brief: through T3, end the prompt with that skill's `$<name>` line, unless the thread runs Codex; otherwise name the skill's `SKILL.md` path to read. Write every other skill name in the prompt inside backticks.

Pass no permission or sandbox flag wider than this session runs with. The new thread inherits no authority from the launch: its reader block still makes it confirm with the user before acting.

When no mechanism reaches the selection, the launch is unavailable: fall back as `SKILL.md` says.

## Reply

Give the new thread's name or link and how to open it (in Claude Code, `claude agents` lists it and `claude attach <name>` opens it), the selection that ran and why (`delegating`'s dispatch summary), and the document's path.
