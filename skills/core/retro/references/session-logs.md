# Session logs

Where each harness keeps its session logs, their format, and how to read them. These formats are undocumented and may change: when a log does not match its row, say so and read what is there. For a harness not in the table, ask the user for a transcript path.

| Harness | Location | Format | How to read |
|---|---|---|---|
| Claude Code | `~/.claude/projects/<project>/<session-id>.jsonl`. `<project>` is the session's working directory with each non-alphanumeric character replaced by `-` (`/work/my.app` becomes `-work-my-app`); when unsure, match the `cwd` field. Subagent transcripts sit in `<session-id>/subagents/`, large tool outputs in `<session-id>/tool-results/`. | JSONL, one event per line. Lines with `type` `user` or `assistant` carry `message.content`: a string, or blocks of type `text`, `thinking`, `tool_use` (`name`, `input`) and `tool_result`. Each also has `timestamp`, `cwd`, `gitBranch` and `isSidechain`. Other line types are harness bookkeeping. | The current session is the newest file in its project folder. Filter with `jq` or a short script rather than loading a whole file: user text turns, tool calls with their inputs, and failed tool results. A `user` line holding only `tool_result` blocks is tool output, not the user; text the harness injects (system reminders, hook output) is not the user either. |

Row verified against Claude Code 2.1.318 logs.
