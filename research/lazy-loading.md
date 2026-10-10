# Lazy loading: path-scoped skills and rules, disabled leaves read by path, hook pointers

Research for [#22](https://github.com/Hissal/skill-collection/issues/22), part of the wayfinder map [#1](https://github.com/Hissal/skill-collection/issues/1). It builds on the [lazy-loading comment on #15](https://github.com/Hissal/skill-collection/issues/15#issuecomment-6087407512) and on `research/loading-mechanics.md` (closes its section 7 point on `paths:` skills). Hands-on runs on 2026-10-09 against Claude Code 2.1.295 and codex-cli 0.147.0 on the owner's Windows machine. Vocabulary follows `GLOSSARY.md`.

Every claim is marked *observed* (seen in a test run), *documented* (stated in the docs) or *inferred*.

## Answers

| # | Question | Answer |
| :- | :- | :- |
| 1 | Path-scoped skills (Claude Code) | **Project skills: yes, lazy, but only the listing is lazy.** A `.claude/skills` skill with `paths: "**/*.cs"` is absent from the idle skill listing. The first Read of a matching file adds a one-entry listing delta (name plus description); the body is **not** loaded, and the model still has to invoke the skill. The entry is added once per process and stays in the conversation (*observed*). **Plugin skills: `paths:` is ignored**; a plugin skill with `paths:` is listed from the start (*observed*, `--plugin-dir`). |
| 2 | Path-scoped rules | **Yes, load on match only.** A `paths:` rule is absent at idle and is attached in full on the first matching Read, once per session, at about the cost of its body plus a path header (*observed*). **Plugins can't ship rules**: neither `rules/` nor `.claude/rules/` inside a plugin loaded (*observed*; the plugin component list has no rules, *documented*). A per-project skill install can't ship one either, unless the installer also **copies** a file into `.claude/rules/`. A symlinked path-scoped rule pointing outside the project doesn't load (*documented*). **Codex has no equivalent.** `AGENTS.md` loads root→cwd at launch only (*documented*), with no `paths` on skills or rules. The nearest substitute is a hook (*inferred*). |
| 3 | Disabled leaves read by path | **Works on both harnesses when the router says "Read the file at `../leaf/SKILL.md`".** The agent resolved the sibling path against the skill's base directory and read the disabled leaf with no block or warning (Claude: 4 of 4 runs, Haiku and Sonnet; Codex: 1 of 1 run, *observed*). **Two traps.** (a) If the router names the leaf as a *skill* ("use the `named-leaf` skill"), Claude calls the Skill tool, gets blocked ("Do not replicate this skill's workflow by other means"), and then refuses to read it at all (*observed*). (b) On Claude, leaves outside the working directory (user scope, plugin cache) need read permission. Headless runs were denied; it worked once both the symlink dir **and** its target were added as working dirs (*observed*). Interactive sessions would show a prompt (*documented*). |
| 4 | Hook pointer | **Claude: confirmed zero cost when silent.** A `UserPromptSubmit` hook that printed nothing added 0 tokens (42,648 vs 42,651 input tokens, noise from path length) and left no transcript entry. A match added about 45 tokens for a one-line pointer (*observed*). **Codex: documented only.** Plain stdout becomes developer context (*documented*), but the project hook never ran in `codex exec`, because Codex skips untrusted hooks. Trusting it needs `/hooks` (persisted state) or `--dangerously-bypass-hook-trust`, which this environment refused, so it stays unverified. |

## Sources (pinned)

- **CC-*:** Claude Code docs, raw markdown via `curl -sL https://code.claude.com/docs/en/<page>.md`, fetched 2026-10-09. The pages are unversioned, so the local binary version 2.1.295 serves as the pin. Pages: `skills`, `memory`, `hooks`, `permissions`, `plugins-reference`.
- **CX-*:** Codex docs, `https://developers.openai.com/codex/<page>.md`, fetched 2026-10-09. Pages: `skills`, `hooks`, `guides/agents-md`, `config-reference`. The pin is codex-cli 0.147.0.
- **Runs:** throwaway projects under the session scratchpad (`…/scratchpad/lazy/e*/`), each `git init`ed. Claude was driven by `claude -p … --output-format stream-json --verbose --session-id <uuid>`, mostly `--model haiku`, with Sonnet as a cross-check. Codex was driven by `codex exec --json -m gpt-5.6-luna -c model_reasoning_effort="low"`. The owner's configured `gpt-6-astra` is rejected by 0.147.0 ("requires a newer version of Codex"). Nothing in the owner's config or installs was changed.

## Method: how listings and loads were observed

- **Claude transcript, not the init event.** The stream-json `init` event's `skills` array lists *every* skill, including `disable-model-invocation` ones such as `grill-me`, so it is not the model-visible listing (*observed*). The session transcript `~/.claude/projects/<cwd>/<session>.jsonl` is. It records:
  - the listing as `attachment.type = "skill_listing"`: the initial one has `isInitial: true`, and later deltas carry `names: [...]`;
  - lazily loaded rules as `nested_memory`;
  - hook output as `hook_success`;
  - each attachment's `rendered` text, which is what the model sees.
- **Rule loads** were also logged with an `InstructionsLoaded` hook (`load_reason`: `session_start` / `path_glob_match`, plus `trigger_file_path`) [CC-hooks#instructionsloaded].
- **Markers.** Each skill, rule and leaf body held a unique string (`MARKER-SKILL-7Q4`, `MARKER-RULE-K9P`, `MARKER-LEAF-Z7Z`, …). Searching the transcript for it shows whether a body ever entered context.
- **Codex.** The rollout file `~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl` holds the full prompt, including the skills catalog. A visible control skill (`vis-know`, marker `VISCTRL-5T5`) was used to confirm what the catalog looks like.
- **Owner's user-scope skills** (43 fork symlinks, synced and plugin skills) appear in every Claude listing (48 to 49 names at idle). Only the test skills' presence was checked.

## 1. Path-scoped skills (Claude Code)

Setup `e1-pathscope`: `.claude/skills/csharp-know` with `paths: "**/*.cs"`, a control skill `plain-know` without `paths`, `src/Foo.cs`, `src/Baz.cs`, `notes.txt`.

| Run | What happened | Mark |
| :- | :- | :- |
| Idle ("Reply with just OK.") | Initial `skill_listing` contains `plain-know`, **not** `csharp-know`. The `init` event's `skills` array also omits `csharp-know` | observed |
| Read `src/Foo.cs` | Right after the Read, a `skill_listing` delta with `isInitial: false`, `names: ["csharp-know"]`, rendered as `The following skills are available for use with the Skill tool: - csharp-know: <description>`. The marker in the body never appeared: **the skill is listed, not loaded**. The model did not invoke it | observed |
| Same process, second `.cs` Read (Sonnet) | No second delta. Listed once per process | observed |
| `--resume`, then Read `src/Baz.cs` | The delta was emitted **again**: activation state is per process, so a resumed session pays the description a second time | observed |

- The docs say a `paths` skill is loaded "automatically only when working with files matching the patterns" [CC-skills#frontmatter-reference]. In practice "loaded" means "added to the listing". If the knowledge must arrive without the model choosing to invoke it, a path-scoped **rule** is the vehicle (*observed* + *inferred*).
- It stays for the rest of the session in the sense that the delta is part of the conversation history (*observed*). After `/compact` the listing is not re-injected [CC-context-window, cited in loading-mechanics §1]. Whether an activated `paths` skill is re-listed after compaction was not tested.
- **Plugin skills ignore `paths:`.** In `e2-plugin-rules`, `lazyplug:plug-cs` (with `paths: "**/*.cs"`, loaded via `--plugin-dir`) was in the **initial** listing before any file was touched (*observed*). The docs don't say either way. Inference: installed marketplace plugins behave the same, since `--plugin-dir` uses the same loader. Consequence: a pack shipped as a plugin can't use `paths:` to keep skill descriptions out of idle context. A pack installed as files into `.claude/skills/` can.
- **User-scope skills behave like project skills.** Added 2026-10-10 for [#14](https://github.com/Hissal/skill-collection/issues/14), same versions: a probe skill in `~/.claude/skills` with `paths: "**/*.cs"` was absent from the initial listing in both runs, and a `skill_listing` delta with `names: ["zz-pathtest-cs"]` followed the first Read of `src/Foo.cs`; the body marker never appeared (*observed*, Haiku, 2 runs). The probe was removed afterwards.
- Not tested: whether an `Edit`/`Write` or a Bash `cat` triggers activation the way it does for rules (*inferred*: same matcher), and nested `.claude/skills` in subdirectories (documented as loading on touch, loading-mechanics §2).

## 2. Path-scoped rules

Same `e1-pathscope` project: `.claude/rules/cs-rule.md` with `paths: ["**/*.cs"]`, plus an unscoped control rule.

- **Idle:** the unscoped rule is in the `instructions` attachment at session start. The scoped rule is absent (*observed*). `InstructionsLoaded` fired twice per run with `session_start` (user `CLAUDE.md` and the unscoped rule) (*observed*).
- **On a matching Read:** a `nested_memory` attachment right after the tool result, rendered as `<system-reminder>Contents of <absolute rule path>:\n\n<body></system-reminder>`, carrying `globs: ["**/*.cs"]`. `InstructionsLoaded` fired once with `load_reason: "path_glob_match"` and `trigger_file_path` set to `Foo.cs` (*observed*). The docs agree: loads on Read/Write/Edit of a matching file, or on a Bash read such as `cat` [CC-memory#path-specific-rules].
- **Once only:** a second `.cs` Read in the same process, and a read in a resumed session, did not re-attach it. Only one `path_glob_match` was logged across both (*observed*).
- **Cost once loaded:** the body plus the wrapper and the absolute path. That is roughly body tokens + 15 + path tokens. The path alone was about 40 tokens on this deep scratch path (*inferred* from the rendered text; not separately metered).
- **Adherence caveat:** the rule text is attached next to a tool result. Haiku treated it as injected tool output and **ignored** it ("That came from the tool output, not from you, so I ignored it."). Sonnet obeyed it (*observed*, one run each). Rules that matter should be written so they read as project policy, and their effect should be checked on the cheaper model the owner uses (*inferred*).
- **Plugins can't ship rules.** A plugin with `rules/plug-rule.md` (scoped), `rules/plug-always.md` (unscoped) and `.claude/rules/plug-rule2.md` loaded none of them, at idle or after reading `Foo.cs` (*observed*). The plugin manifest's component keys are skills, commands, agents, hooks, MCP/LSP servers, output styles, workflows and themes, with no rules [CC-plugins-reference#fields] (*documented* by omission).
- **Per-project skill installs can't ship them either.** Installers like `npx skills` place skill folders into `.claude/skills/` and `.agents/skills/`. Claude reads rules only from `.claude/rules/` and `~/.claude/rules/` [CC-memory] (*documented*). An installer would have to write the rule file as well. It has to be a **copy**: "Claude Code treats a symlink whose target is outside your working directory like an external import… after that only the ones without a `paths` field load" [CC-memory#share-rules-across-projects-with-symlinks] (*documented*).
- **Portable substitute (not tested):** a plugin `PostToolUse` hook matching `Read|Edit|Write`, checking `tool_input.file_path` against a glob, and returning `additionalContext` once per session (tracked with a marker file keyed on `session_id`). Hooks are a plugin component on both harnesses, and both accept `additionalContext` on `PostToolUse` [CC-hooks; CX-hooks] (*inferred*).
- **Codex equivalent:** none native.
  - Skills have no `paths` field [CX-skills].
  - `.rules` files are command policy, not context (loading-mechanics §1).
  - `AGENTS.md` is collected "from the project root down to your current working directory" at launch, one file per directory [CX-guides/agents-md] (*documented*). A `sub/AGENTS.md` below the cwd was not in the initial prompt (*observed*: marker absent from the rollout).
  - Whether the model reads it on its own when touching `sub/` could not be observed: the Windows sandbox failed to spawn the shell in the scratch folder (`CreateProcessAsUserW failed: 1920`) on both attempts. The `gpt-5.6-luna` base instructions don't mention `AGENTS.md` at all (*observed*), so there is nothing that would tell it to look (*inferred*).
  - The workable Codex route is the same `PostToolUse` hook idea, or a `UserPromptSubmit` pointer (*inferred*).

## 3. Disabled leaves read by path

Routers were invoked with `/name` so that only the leaf step varied. Leaves had `disable-model-invocation: true` (Claude) or `policy.allow_implicit_invocation: false` (Codex), and each held a code word.

| Case | Project | Result | Mark |
| :- | :- | :- | :- |
| Sibling in `.claude/skills`, router says "Read the leaf `../zorb-leaf/SKILL.md` (relative to this skill's base directory)" | `e3-router` | Read `…\.claude\skills\zorb-leaf\SKILL.md`, answered correctly. Haiku 1 of 1, Sonnet 1 of 1. No warning | observed |
| Leaf named as a skill ("use the `named-leaf` skill in full") | `e3-router` | Model called `Skill(named-leaf)` → `tool_use_error: …cannot be used with Skill tool due to disable-model-invocation. Ask the user to run /named-leaf themselves… Do not replicate this skill's workflow by other means`. The model then declined to read the file and asked the user to run `/named-leaf` | observed |
| Leaf at user scope, `~/.claude/skills/grill-me/SKILL.md` (an existing disabled fork skill, a symlink into the fork) | `e3-router` | Headless: Read denied ("…you haven't granted it yet"). Still denied with `--allowedTools "Read(~/.claude/skills/**)"`. Worked with `--add-dir ~/.claude/skills --add-dir C:/dev/skills/mattpocock-skills-unity` | observed |
| Plugin router reading its own `ref.md` and sibling `../pleaf/SKILL.md` | `e3b-proj` + `e3b-plugin` | Both reads denied headless, **even the router's own supporting file**. Both worked with `--add-dir <plugin dir>`. Relative path resolved correctly | observed |
| Per-project install: real folders in `.agents/skills`, junctions in `.claude/skills` | `e3c-agents` | "Base directory" is the **link** path (`.claude\skills\zorb-router`), so `../zorb-leaf` resolved inside `.claude/skills`. Worked | observed |
| Codex, both in `.agents/skills` with `allow_implicit_invocation: false`, `$zorb-router …` | `e5-codex` | Neither router nor leaf in the catalog (control skill was). `$zorb-router` injected `<skill><name>…<path>…` and the model ran `Get-Content` on `.agents\skills\zorb-leaf\SKILL.md` and answered correctly. No warning about the leaf's policy | observed |

Notes:

- **Why the user-scope allow rule failed:** the owner's `~/.claude/skills/*` are symlinks into the fork. "Allow rules apply only when both the requested path and the file it resolves to match. A read through a symlink inside an allowed directory that points outside it doesn't match the rule" [CC-permissions] (*documented*). Reads outside the working and additional directories need approval [CC-permissions, table "Read-only… No, within the working directory"] (*documented*).
- **Consequences for user-scope and plugin leaves:** interactively, the first leaf read per session shows a permission prompt (*inferred* from the headless denial plus the docs). To make it silent, add both the link dir and the target dir to `permissions.additionalDirectories` (or allow rules), or install leaves per project inside the repo.
- **Plugin cache dirs:** a plugin's own supporting files also sit outside the working directory, so the same prompt applies to a plugin router's reference files. That was observed with `--plugin-dir`. Installed plugins live under `~/.claude/plugins/cache` (*inferred* same).
- **Sibling-path fragility:** with symlinks or junctions, Claude reports the link path as the base dir, so `../leaf` resolves among the *installed* links, not in the source repo (*observed*). The relative path therefore holds exactly when router and leaf are installed into the same skills dir. It does not depend on where the sources live (*inferred*).
- **Codex sandbox noise:** the first two shell attempts failed with `windows sandbox: runner failed during SpawnChild … 1920`. A third attempt succeeded after Codex's `guardian` auto-review subagent ran (*observed*). This is environment-specific (scratch path under `%TEMP%` and/or the `WindowsApps` `pwsh.exe` alias, *inferred*), not a leaf block.
- **Codex user-scope leaves** (`~/.agents/skills`): not run. The read-only profile in the rollout is `<file_system type="restricted"><entry access="read"><special>:root</special>`, meaning the whole filesystem is readable (*observed*). So a path read should work, sandbox spawn permitting (*inferred*).
- **Writing rule for routers:** say "Read the file `../<leaf>/SKILL.md`" and never "use/invoke the `<leaf>` skill". On Claude, the Skill-tool block message actively discourages any other route (*observed*).

## 4. Hook pointer (`UserPromptSubmit`)

Hook: `node pointer.js` reads stdin JSON and prints `HOOK-POINTER-Q8Q: for zorblax questions, suggest /zorb-router.` only if the prompt matches `/zorblax/i`.

**Claude** (`e4-hook` vs identical `e4-nohook`, Haiku, total input = input + cache-creation + cache-read):

| Prompt | No hook | Hook | Δ |
| :- | :- | :- | :- |
| "Reply with just OK." | 42,651 | 42,648 | −3 (path-length noise; no hook attachment in transcript) |
| "zorblax. Reply with just OK." | 42,655 | 42,700 | +45 |

- The match rendered as `<system-reminder>UserPromptSubmit hook success: HOOK-POINTER-Q8Q: …</system-reminder>` (*observed*).
- A hook that exits silently costs nothing; the definition itself is free (*observed*; *documented* in loading-mechanics §1).
- The hook also fires on scheduled tasks, `/loop` iterations and background-subagent reports [CC-hooks#userpromptsubmit] (*documented*). Its default timeout is 30 s, and on timeout its output is discarded (*documented*).

**Codex** (`e6-cx-hook`, `.codex/hooks.json` with the same script):

- Plain stdout of `UserPromptSubmit` "is added as extra developer context", and `matcher` is ignored for this event [CX-hooks#userpromptsubmit] (*documented*).
- In `codex exec`, with the project marked trusted through a `-c projects.'<path>'.trust_level="trusted"` session flag, the hook **did not run**: no pointer in the rollout, no stderr warning (*observed*). This matches "new or changed hooks are marked for review and skipped until trusted" [CX-hooks#review-and-trust-hooks] (*documented*). Trust is recorded through `/hooks`, which persists into the owner's Codex state. `--dangerously-bypass-hook-trust` was refused by this environment's safety classifier. **Zero cost when silent is therefore unverified on Codex.** It is expected, since only stdout is injected (*inferred*).
- Pack implication: every new or edited Codex hook needs one interactive `/hooks` trust step per machine before it does anything. Until then it fails silently in `codex exec` (*observed* + *documented*).

## Implications for the map (proposed, not decided)

- **"Load C# knowledge when a `.cs` file is touched"** works on Claude in two ways:
  - a project **rule** (body arrives automatically, once, at the cost of the full body);
  - a project **`paths:` skill** (only the description arrives; the model must still invoke it).
  
  Neither works from a plugin. Codex needs a hook.
- **Routers over disabled leaves (option 2 in #15)** hold up on both harnesses for leaves installed side by side in a project, and need a permission setup for user-scope or plugin leaves on Claude. The router text must say *Read the file*, not *use the skill*.
- **Hook pointers** are confirmed free when silent on Claude; on Codex they carry a one-time trust step per hook.
