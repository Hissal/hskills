# Verify guidance

Guidance counts as reachable when a fresh process of the harness shows it. This session's own skill listing may predate this run's installs, so it proves nothing either way.

Done when each skill, pack line and pointer this run delivered has a result for each harness the approved draft lists: reachable, or incomplete with its next step.

## Files

- Each skill's folder is in `.claude/skills/<name>/` and `.agents/skills/<name>/`, or `.claude/settings.json` enables its plugin.
- Each path a pointer names resolves, and the block links each docs file it mentions.

## Harness

Run these from the project root, each with a time limit and stdin closed. `<instructions>` is: `Print the "## Agent skills" section of your project instructions word for word.`

| Harness | Command | Reachable when |
|---|---|---|
| Claude Code | `claude -p '<instructions>' --output-format stream-json --verbose --max-turns 1 --tools "" </dev/null`, one model call | The `system` `init` event's `skills` array names each skill, and the final `result` holds each pointer and pack line. |
| Codex | `codex debug prompt-input </dev/null`, no model call | The output names each model-invoked skill and holds each pointer and pack line. |
| OpenCode | `opencode run 'Name every skill you can load. Then: <instructions> Use no tools.' </dev/null`, one model call; add `-m <provider/model>`, from `opencode models`, when the default model is refused | The reply names each model-invoked skill and holds each pointer and pack line. |
| Another harness | Its documented skill listing | Its listing names each skill. With no listing, write `files only, not verified in <harness>`, as incomplete. |

Each listing should show a pack guide under the exact name its `### Packs` line uses; correct a line that differs.

Codex and OpenCode hide a user-invoked skill from these listings by design. On those two, its folder and its gate are the check: `allow_implicit_invocation: false` in its `openai.yaml` on Codex, `opencode/autoinvoke: "false"` in `SKILL.md` on OpenCode.

Read the harness's `--help` when a flag is refused.

## Results

A harness that is not installed, is not signed in, or has no usable model leaves its results incomplete, with the exact command to run where it works. A skill a working harness does not show is incomplete too: check its folder name and frontmatter first, since a strict loader skips a file it cannot parse. Each goes through [Open questions](../SKILL.md#open-questions), and the other harnesses and checks carry on.

Files alone never make a result reachable. When a skill delivered this run is missing from this session's listing while the fresh process shows it, tell the owner a new session makes it callable.
