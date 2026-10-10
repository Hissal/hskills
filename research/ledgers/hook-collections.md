# Ledger: hook collections

Ticket: [Ledger: hook collections](https://github.com/Hissal/skill-collection/issues/28), part of [Wayfinder: personal skill collection blueprint](https://github.com/Hissal/skill-collection/issues/1).

Sources, each read on 2026-10-10 from a shallow clone outside the repo. All three are still at the SHA the ticket names, so nothing was re-pinned. Nothing from a source was installed or executed.

| Source | Pinned at | Committed | Licence |
|---|---|---|---|
| `karanb192/claude-code-hooks` | [`3c9c90a`][k-root] | 2026-10-04 | MIT ([LICENSE][k-license]) |
| `diet103/claude-code-infrastructure-showcase` | [`07f75ce`][d-root] | 2026-07-11 | MIT ([LICENSE][d-license]) |
| `nizos/tdd-guard` | [`7245912`][t-root] | 2026-10-05 | MIT ([LICENSE][t-license]) |

Vocabulary follows [`GLOSSARY.md`](../../GLOSSARY.md). Harness facts come from [`research/loading-mechanics.md`](../loading-mechanics.md) and [`research/lazy-loading.md`](../lazy-loading.md), plus two doc pages fetched as raw markdown on 2026-10-10: the Claude Code hooks reference (`https://code.claude.com/docs/en/hooks.md`, cited as **CC-hooks**) and the Codex hooks reference (`https://developers.openai.com/codex/hooks.md`, cited as **CX-hooks**). Both pages are unversioned. *Inference* marks a claim reasoned from the sources instead of read in them. Everything below is **proposed**. The owner decides in theme sessions.

**Cost method.** A hook definition costs no context; only its output does ([loading-mechanics §4](../loading-mechanics.md)). So each hook entry gives **output cost per fire** in place of idle cost. Characters were counted from the source strings. Token figures are estimates (inference) at roughly 3 to 4 characters per token; the only measured anchor is the ~45 tokens a one-line `UserPromptSubmit` pointer cost in [lazy-loading §4](../lazy-loading.md). No hook was run, so no figure here is a measurement.

**The admission gate** ([#14 resolution](https://github.com/Hissal/skill-collection/issues/14)) for an always-on hook, used in every hook entry as G1 to G5:

1. prints nothing when it doesn't apply;
2. no per-turn reinforcement;
3. fails open: a broken hook never blocks work;
4. ships with block and allow test cases;
5. works on Claude Code and Codex, or is declared Claude-only on purpose.

## Overview

**What the sources are.**

- **`karanb192/claude-code-hooks`** is a Claude Code plugin marketplace of 22 plugins, one hook script each ([marketplace.json][k-market], [README][k-readme]). All are dependency-free Node (`engines.node >= 18`, [package.json][k-package]). Seven are `PreToolUse` guards, one bundles those seven in one process, and the rest are recorders, cost meters and automation. Eight plugins also ship one user-invoked skill each (all set `disable-model-invocation: true`). Every plugin has a `node --test` file next to it; CI runs them on Node 18/20/22 on Ubuntu, plus a Windows job for the secrets guard only ([test.yml][k-ci]).
- **`diet103/claude-code-infrastructure-showcase`** is a reference `.claude/` folder to copy into a project: 9 hooks, 4 skills, 8 subagents, 4 slash commands and a setup wizard ([README][d-readme]). Its centre is a `UserPromptSubmit` hook that matches the prompt against `skill-rules.json` and prints skill suggestions. Hooks are bash wrappers around TypeScript run with `tsx`. The README requires "macOS, Linux, or WSL2" ([README L37][d-readme]).
- **`nizos/tdd-guard`** is one npm package wired as three hooks. Before every `Write`/`Edit`/`MultiEdit`/`TodoWrite` it asks a Claude model whether the change obeys red-green-refactor, using the last test run captured by a per-framework reporter ([hooks.json][t-hooks], [validator.ts][t-validator]). Its README now opens with "TDD Guard grew into Probity … now for Claude Code, Codex, and GitHub Copilot CLI … New projects should start there" ([README L9-L13][t-readme]). Probity was not read (see open questions).

**What they ship** (counted from the trees at the pinned SHAs):

| Part | karanb192 | diet103 | tdd-guard |
|---|---|---|---|
| Hook scripts | 22 (one per plugin; `guard-pack` re-bundles 7) | 9 (5 wired in `settings.json`, 4 optional Stop hooks) | 1 CLI on 3 events |
| Skills | 8, all user-invoked | 4, all model-invoked (~630 tokens of descriptions, inference at 2.6 chars/token) | 1 user-invoked (`setup`) |
| Subagents / commands | none | 8 subagents (~4.9k tokens of descriptions, inference) / 4 commands | none |
| Tests | a test file per plugin, block and allow cases; README badge claims 1,949 passing | none for the hooks; one end-to-end prompt in `verify-setup.sh` | 39 `*.test.ts` files under `src/` and `test/` |
| Codex | none | `.codex/hooks.json` + adapter + `.agents/skills` mirror | none (successor Probity claims it) |
| Windows | Node only; one Windows CI job (secrets guard) | "use WSL2" | Node 22+; CI is Ubuntu only |

**Idle cost.** Zero for every hook in all three sources. The only idle cost on offer is diet103's 4 model-invoked skills and 8 subagents, all proposed rejected.

### Gate results at a glance

"Mechanically" means the script's behaviour meets the criterion; fit is judged in the entry.

| Hook | G1 silent | G2 no per-turn | G3 fails open | G4 block+allow tests | G5 harnesses | Output per fire |
|---|---|---|---|---|---|---|
| `block-dangerous-commands` | yes | yes | yes | yes | Claude-only as shipped; Bash shape matches Codex (inference) | 0 on allow; one deny line, ~60 chars ≈ 15-25 tok |
| `protect-tests` | yes | yes | yes | yes, but no C# case | Claude-only (edit branch can't see Codex `apply_patch`) | 0 on allow; ~170 chars ≈ 45-55 tok on deny |
| `git-safety` | yes | yes | yes | yes | Claude-only as shipped | 0 / one deny line |
| `protect-secrets` | yes | yes | yes | yes, incl. Windows paths | Claude-only as shipped | 0 / one deny line |
| `config-guard` | yes | yes | yes | yes | Claude-only | 0 / ~250 chars ≈ 65-80 tok on deny |
| `config-watch` | yes | yes | yes | yes (19) | Claude-only (`ConfigChange` is not a Codex event) | 0 model tokens (inference: `systemMessage` is shown to the user) |
| `case-insensitive-guard` | yes | yes | yes | yes | Claude-only as shipped | 0 / one deny line |
| `subagent-spawn-cap` | yes | yes | yes | yes | Claude-only as shipped | 0 / one ask or deny line |
| `guard-pack` | yes | yes | yes, per guard | yes | Claude-only as shipped | as the winning guard |
| `instructions-audit` | yes | yes | **no** in spirit: a finding locks every prompt and tool call | yes | Claude-only | 0 / lock notice on every call once locked |
| `cache-tax` | yes | yes | yes | yes | Claude-only (prompt-cache pricing) | 0 model tokens (inference) |
| `dead-end-registry` | yes | yes | yes | yes | Claude-only | 0 / a warning card on a matching prompt (size not measured) |
| `bounty-board` | **no**: board + 3 "side quests" at every SessionStart in a repo with TODOs | yes | yes | yes | Claude-only | board card per session |
| `standup-autopilot` | yes (only when yesterday left blockers) | yes | yes | yes | Claude-only | blocker list at SessionStart |
| recorders (`context-hogs`, `dead-rules-audit`, `nerf-receipts`, `session-logger`) | yes | yes | yes | n/a (nothing to block) | Claude-only | 0 model tokens (inference) |
| diet103 `skill-activation-prompt` | suggestions yes; **dev-doc reminder no** | suggestions yes (once per session); **reminder no** (every 2 turns) | yes | **no** | Codex wiring shipped, unverified | ~250 chars per suggestion; ~450 chars per reminder |
| diet103 `skill-verification-guard` | yes | yes | yes on error; blocks one edit by design | **no** | Codex via adapter, doubtful (entry 25) | block message on stderr, ~250 chars |
| `tdd-guard` | yes | yes | **no**: a model error or empty reply blocks the edit | yes | Claude-only | 0 on allow; the validator's reason on block |

**Standout candidates (proposed):**

- **`protect-tests`** (entry 2): the one guard here that answers a known agent failure (making a suite green by deleting or skipping tests) with a hook instead of an always-on line. It needs C#/NUnit/Unity coverage before it protects the owner's stack: as shipped it matches bare `[Ignore]` but not NUnit's `[Ignore("reason")]`.
- **The guard conventions** (entry 10): print `{}` and exit 0 on allow, wrap everything in a `try` that falls through to allow, pick the strictness by env var, log every block to JSONL, and pin a ReDoS test over every exported regex. A ready template for the core command guard #14 already admitted.
- **`skill-activation-prompt` as prior art for #15** (entry 20): two things worth taking (suggest each skill once per session; telemetry of suggested versus activated) and three warnings (substring keyword matching, a wording that orders the model to load skills, and a default per-turn reminder).
- **Activation telemetry** (entry 24): `suggested` / `activated` / `blocked` events and a conversion report. The only source so far that measures whether a suggestion hook earns its place.
- **`tdd-guard`'s .NET reporter** (entry 33): proof that test results can be captured from MTP v2 for NUnit, xUnit, MSTest and TUnit. Idea-only, and not usable for Unity's test runner.

**Biggest open questions:**

1. **The owner's shell is PowerShell.** CC-hooks says that on Windows with the PowerShell tool enabled, "Claude treats PowerShell as the primary shell and routes shell commands through it", and tells hook authors to "Match `Bash|PowerShell`". Every command guard in this ledger matches `Bash` only and knows only POSIX commands (`rm`, `dd`, `mv`). The same is true of the davidondrej guard that #14 admitted. Does the core guard need a PowerShell arm (`Remove-Item -Recurse`, `git` through PowerShell) before it guards anything on this machine?
2. **Does #15 want a suggestion hook at all?** #14 ruled out a "check your skills first" nudge because no missed triggers were observed. diet103's hook is exactly that nudge for model-invoked skills. The only use left for the collection is suggesting *user-invoked* workflows, which the model cannot load.
3. **Is "never weaken tests" worth a hook?** #14 admitted no one-liner for it because no failure was observed. A `protect-tests` port is silent until it blocks, so it costs nothing to carry, but the same "no observed failure" test applies.
4. **Probity.** tdd-guard's own author points new users to `nizos/probity` (Codex support, no reporters). Should it get a look before tdd-guard is decided?
5. **Codex hook trust.** Every new or edited Codex hook is skipped until trusted through `/hooks` ([lazy-loading §4](../lazy-loading.md)). No source here solves that; it is a migration step per machine.

### Recurring blockers to direct copying

| Blocker | Evidence | Effect |
|---|---|---|
| `Bash`-only matchers, POSIX-only patterns | All karanb192 guards match `Bash` ([e.g. hooks.json][k-bdc-hooks]); patterns are `rm`, `dd`, `mkfs`, `chmod` ([block-dangerous-commands.js L54-L80][k-bdc]). CC-hooks: "Match `Bash|PowerShell` in hooks that inspect shell commands" | On the owner's machine most shell commands go through the PowerShell tool and pass unseen (inference from CC-hooks) |
| Forward-slash path regexes | `protect-tests` tests directories with `(^|/)(tests?|__tests__|spec|specs)/` ([L50-L61][k-pt]). CC-hooks: "On Windows, the path arrives with backslash separators" | `C:\proj\Assets\Tests\Foo.cs` is not recognised as a test path (inference) |
| `process.env.HOME` with no fallback | `block-dangerous-commands`, `git-safety`, `auto-stage`, `format-code`, `notify-permission`, `session-logger`, `instructions-audit` call `path.join(process.env.HOME, …)` at load ([e.g. L84][k-bdc]) | Under Git Bash `HOME` is set. If a hook ever runs through PowerShell, the script throws at load, exits non-zero, and Claude treats it as a non-blocking error: the guard is silently off (inference) |
| Codex edit shape | Codex edits arrive as `tool_name: "apply_patch"` with the patch in `tool_input.command` (CX-hooks). karanb192's file guards read `tool_input.file_path` for `Edit`/`Write` | File-level guards see nothing on Codex. Only the Bash-command guards have a matching input shape |
| `ask` decisions | karanb192's ask mode returns `permissionDecision: "ask"`. CX-hooks: `ask` is "parsed but not supported yet. Codex marks the hook run as failed … and continues the tool call" | Ask mode fails open on Codex. Use `deny` only for anything shared |
| bash + jq + `tsx` + native module | diet103 hooks are `.sh` wrappers that `source ~/.bashrc`, test `-x`, and run `node_modules/.bin/tsx`; `package.json` depends on `better-sqlite3` ([package.json][d-hookpkg]) | Needs WSL2 by the source's own README; needs an `npm install` inside `.claude/hooks/` per project |
| A model call inside a hook | tdd-guard's validator ([validator.ts][t-validator]); diet103's optional AI classifier ([skill-activation-prompt.ts L254-L287][d-sap]) | Latency and model usage on every fire; tdd-guard blocks when the call fails |

### Index: every hook and mechanism to its entry

| Entry | Hooks / mechanisms |
|---|---|
| 1 | karanb192 `block-dangerous-commands` |
| 2 | `protect-tests` |
| 3 | `git-safety` |
| 4 | `protect-secrets` |
| 5 | `config-guard`, `config-watch` |
| 6 | `case-insensitive-guard` |
| 7 | `subagent-spawn-cap` |
| 8 | `guard-pack` |
| 9 | `instructions-audit` |
| 10 | guard conventions and test machinery (`tests/regex-backtracking.test.js`, Windows CI job, `bench/`) |
| 11 | `dead-rules-audit` |
| 12 | `context-hogs`, `bench/read-replay`, `docs/token-diet.md` |
| 13 | `cache-tax` |
| 14 | `dead-end-registry` |
| 15 | `standup-autopilot`, `nerf-receipts`, `bounty-board`, `session-logger` |
| 16 | `pr-provenance-stamp` |
| 17 | `auto-stage`, `format-code`, `notify-permission` |
| 18 | `utils/event-logger.py` |
| 19 | one-plugin-per-hook marketplace packaging |
| 20 | diet103 `skill-activation-prompt` + `skill-rules.json` prompt triggers |
| 21 | `skill-verification-guard`, `skill-activation-tracker`, file triggers |
| 22 | dev-doc reminder, session intelligence, `session-doc-updater` |
| 23 | AI classification providers |
| 24 | activation telemetry (`metrics.jsonl`, `skill-stats.sh`) |
| 25 | Codex adapter, `.codex/hooks.json`, `.agents/skills` mirror, `sync-agent-skills.sh` |
| 26 | Stop-hook build checks (`tsc-check`, `stop-build-check-enhanced`, `trigger-build-resolver`, `error-handling-reminder`, `post-tool-use-tracker`) |
| 27 | `setup.ts` wizard, `verify-setup.sh`, `/verify-setup` |
| 28 | skills: `skill-developer`, `backend-dev-guidelines`, `frontend-dev-guidelines`, `error-tracking` |
| 29 | 8 subagents, `/dev-docs`, `/dev-docs-update`, `/route-research-for-testing`, editor config |
| 30 | tdd-guard `PreToolUse` validator |
| 31 | `tdd-guard on` / `off` toggle, SessionStart housekeeping |
| 32 | TDD rules text and custom instructions |
| 33 | .NET reporter and the reporter architecture |
| 34 | `setup` skill and plugin packaging (`npx tdd-guard@latest`) |
| 35 | enforcement doc (permission deny rules) |

---

## karanb192/claude-code-hooks

Common to entries 1 to 9, read from the scripts: each reads the hook JSON on stdin, prints `{}` and exits 0 when it allows, and prints a `hookSpecificOutput.permissionDecision` of `deny` (or `ask`) with a one-line reason when it blocks. CC-hooks says stdout that "starts with `{` and ends with `}`" is parsed as JSON, so `{}` adds nothing to context. A parse failure or any thrown error is caught and also prints `{}` (fail open). **Windows**: Node 18+ only, no npm install; the shell-form command `node "${CLAUDE_PLUGIN_ROOT}/x.js"` runs under Git Bash, which the owner has. **Codex**: no Codex manifest or `hooks.json` wiring is shipped.

### 1. `block-dangerous-commands`

- **What it is.** A `PreToolUse` guard on `Bash` with 20 regexes in three levels ([block-dangerous-commands.js][k-bdc]). `critical`: `rm` of `~`, `$HOME`, `/`, system directories or the current directory, `dd` to a disk, `mkfs`, a fork bomb. `high` (default) adds `curl | sh`, force push to `main`/`master` (but not `--force-with-lease`), `git reset --hard`, `git clean -f`, `chmod 777`, `docker volume rm`. `strict` adds any force push, `git checkout .`, `sudo rm`, `docker prune`, `crontab -r`. `HOOK_SAFETY_LEVEL` picks the level; `HOOK_ASK_<LEVEL>=true` turns a deny into a permission prompt.
- **Kind**: hook.
- **Proposed address**: idea-only input to the core always-on command guard that #14 admitted.
- **Why it could fit.** The pattern list is published, unlike davidondrej's (whose `dangerous-patterns.txt` is missing). The `critical` tier is exactly #14's "catastrophic-only" scope. Node needs no `jq`, which removes one Windows dependency from the admitted guard.
- **Why it might not.** POSIX only: nothing for `Remove-Item -Recurse -Force`, `rd /s`, `del`, `format`. It matches `Bash` only (open question 1). The default `high` level blocks `git reset --hard` and `git clean -f` outright, which is beyond "catastrophic". `HOME` has no fallback ([L84][k-bdc]).
- **Gate.** G1 yes. G2 yes. G3 yes. G4 yes ([tests][k-bdc-test], block and allow cases). G5 Claude-only as shipped; the stdin shape (`tool_name: "Bash"`, `tool_input.command`) and the `permissionDecision: "deny"` reply are what CX-hooks documents, so the script should run unchanged on Codex if registered (inference, not tested).
- **Copy / adapt / idea-only**: adapt, as a donor. It can't be copied as the core guard because #14 already chose davidondrej's design and because of the PowerShell gap. Take the `critical` regexes and the level-by-env idea.
- **Overlap**: davidondrej command guard ([davidondrej ledger](davidondrej-skills.md) entry 2), which #14 admitted; fork `git-guardrails-claude-code` ([fork ledger](mattpocock-skills-unity.md)), which #14 replaced.
- **Output cost per fire**: 0 on allow. On deny one line such as "⛔ [git-reset-hard] git reset --hard loses uncommitted work", ~60 chars ≈ 15-25 tokens (inference).
- **Recommendation (proposed)**: don't install the plugin. Use its `critical` tier as the published pattern source when the core guard is built, and decide open question 1 first.

### 2. `protect-tests`

- **What it is.** A `PreToolUse` guard on `Bash|Edit|MultiEdit|Write` against "fake green" ([protect-tests.js][k-pt]). `critical`: a Bash command that names a test path and contains `rm`, `unlink`, `shred`, `trash` or `git rm`. `high` (default): `mv` of a test file to a `.bak`/`.disabled`/`.skip` name, or an `Edit`/`MultiEdit` to a test file whose new text contains a skip marker the old text lacked. `strict`: a `Write` of a test file that is already skipped. Removing a skip marker, editing a test body and renaming a test to another test name are allowed.
- **Kind**: hook.
- **Proposed address**: core always-on (stack-neutral), after a C# port. Alternatively Unity pack always-on if the port is Unity-specific.
- **Why it could fit.** It turns the rejected one-liner "never weaken tests to pass" (#14) into a hook that costs nothing until it fires. The deny reason tells the agent what to do instead ("Fix the code, don't disable the test"). #14 handed it to the maintenance ticket by name.
- **Why it might not.** It does not cover the owner's stack as shipped:
  - The skip list has `/\[Ignore\]/` for "NUnit / MSTest" ([L82][k-pt]). NUnit's attribute takes a reason, `[Ignore("…")]`, which that regex does not match (inference from the regex). `[Explicit]`, `Assert.Ignore(…)`, `Assert.Inconclusive(…)`, xUnit's `Skip = "…"` and `[UnityPlatform]` exclusions are absent.
  - Test-path detection for C# is `…Test.cs` or `Test….cs` ([L57-L58][k-pt]); a Unity file named `FooTests.cs` only matches through the `tests/` directory rule, which needs forward slashes (recurring blockers).
  - Bash only, so `Remove-Item Assets\Tests\…` passes.
  - No C# case in the tests ([tests][k-pt-test]).
  - The Bash branch is text matching: any command that mentions a test token and the word `rm` is blocked, including an innocent one.
  - No observed failure sits behind it yet (open question 3).
- **Gate.** G1 yes. G2 yes. G3 yes. G4 yes, 38 `it(` cases with allow cases for running tests, deleting `node_modules`, and re-enabling a test. G5 Claude-only: the edit branch reads `old_string`/`new_string`, which Codex's `apply_patch` does not send.
- **Copy / adapt / idea-only**: adapt. It can't be copied directly because of the C# and Windows gaps above. Changes: NUnit/xUnit/MSTest/Unity markers, backslash-tolerant path rules, a `PowerShell` arm, and C# block/allow tests.
- **Overlap**: fork `tdd` and `unity-testing` (they teach the discipline; nothing enforces it); davidondrej `AGENTS.md` line "Do not delete, skip, weaken, or narrow tests" ([davidondrej ledger](davidondrej-skills.md) entry 1); superpowers `verification-before-completion` ([superpowers ledger](superpowers.md)). Unity baseline: none.
- **Output cost per fire**: 0 on allow. ~170 chars ≈ 45-55 tokens on deny (inference).
- **Recommendation (proposed)**: adapt as a second core hook, C# and Windows first, and only if the owner has seen an agent weaken a test. Otherwise park it as the ready answer for the first time it happens.

### 3. `git-safety`

- **What it is.** A branch-aware `PreToolUse` guard on `Bash` ([git-safety.js][k-gs]). At the default `high` level it denies `git push … main|master`, deleting `main`/`master`, any `git commit`, `merge`, `rebase`, `reset` or `push` while the current branch is `main` or `master` (it runs `git branch --show-current`), and `gh pr merge`, `gh pr close`, `gh issue close`, `gh release delete`, `gh repo delete`. No ask mode.
- **Kind**: hook.
- **Proposed address**: none (proposed reject).
- **Why it could fit.** It is what a team repo with a protected `main` wants, and it is well tested (100 `it(` cases).
- **Why it might not.** The owner commits to `main` in this repo (`git log`: every recent commit is on `main`) and agents close issues with `gh issue close` as part of the wayfinder flow. This guard would block the owner's normal work. It is the same over-blocking that made #14 drop the fork's `git-guardrails-claude-code`. The `push-main` regex also blocks any push whose arguments contain the word "main".
- **Gate.** Mechanically G1-G4 yes; G5 Claude-only as shipped.
- **Copy / adapt / idea-only**: idea-only. The branch check (ask git, don't guess from the command) is the transferable part.
- **Overlap**: fork `git-guardrails-claude-code` (already replaced); owner's commit conventions in the user-scope steering file.
- **Output cost per fire**: 0 / one deny line.
- **Recommendation (proposed)**: reject. Keep "protected-branch rules belong in a per-project hook, not core" as a note for packs.

### 4. `protect-secrets`

- **What it is.** A `PreToolUse` guard on `Read|Edit|Write|Bash|Grep` ([protect-secrets.js][k-ps]). It denies reading or editing `.env`, SSH keys, cloud credential files and keystores, shell commands that print or upload them (`cat .env`, `printenv`, `curl`/`scp` uploads), and commands that feed a secrets file to an external model CLI or model API host. `.env.example`-style templates stay allowed. It normalises backslashes, UNC paths and mixed separators ([README][k-ps-readme]).
- **Kind**: hook.
- **Proposed address**: core always-on, as a possible extension of the command guard.
- **Why it could fit.** The only guard here tested on Windows (CI job `windows-secrets`, [test.yml][k-ci]; Windows-path cases in [protect-secrets-dispatch.test.js][k-ps-dispatch]). The owner's web and agentic work has `.env` files. It has the largest test file in the repo (269 `it(` lines).
- **Why it might not.** It is not "catastrophic-only": it blocks ordinary debugging reads of `.env`. Unity and C# library work rarely has such files. The owner's harness already has permission `deny` rules for `Read(.env)` if wanted, which need no hook (CC permissions, [loading-mechanics](../loading-mechanics.md)). It adds a Node start to every Read and Grep (~35 ms each on the source's Mac, [bench/RESULTS.md][k-bench]).
- **Gate.** G1-G4 yes. G5 Claude-only as shipped.
- **Copy / adapt / idea-only**: copy if wanted; it is the one guard that would install as-is on this machine.
- **Overlap**: davidondrej guard blocks password-manager CLIs; davidondrej `AGENTS.md` "never commit `.env`".
- **Output cost per fire**: 0 / one deny line.
- **Recommendation (proposed)**: owner's call. Not core by default; a candidate for a web pack, or replaced by two permission deny rules.

### 5. `config-guard` and `config-watch`

- **What it is.** `config-guard` denies agent writes to `settings.json`, `.claude/hooks/`, `hooks.json`, `.mcp.json`, plugin manifests and `claude config|mcp|plugin` commands; `strict` adds `CLAUDE.md`, rules, agents and commands ([config-guard.js][k-cg]). `config-watch` is a `ConfigChange` hook that shows a `systemMessage` when settings or skills change mid-session, or exits 2 to block with `CONFIG_WATCH_BLOCK=true` ([config-watch.js][k-cw]).
- **Kind**: hook (two).
- **Proposed address**: none (proposed reject), idea for #17.
- **Why it could fit.** "An agent that can rewrite its own hook config can switch every other guardrail off" is a real hole in any hook-based guard.
- **Why it might not.** The owner's agents *are* asked to edit settings, hooks and skills: that is this collection's work. The README itself warns that `config-guard` blocks `claude plugin install/uninstall/disable` ([README L127][k-readme]). The threat model (npm worms, prompt injection) is outside the stated purpose of the admitted guard, "accidents, not malicious agents" ([davidondrej ledger](davidondrej-skills.md) entry 2).
- **Gate.** Both pass mechanically (125 and 19 `it(` cases). Claude-only: `ConfigChange` is not in CX-hooks' event list.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: none in the other ledgers.
- **Output cost per fire**: 0. `config-guard` deny ~250 chars ≈ 65-80 tokens (inference).
- **Recommendation (proposed)**: reject for the collection.

### 6. `case-insensitive-guard`

- **What it is.** A `PreToolUse` guard on `Bash` that resolves the real target of `rm`, `rmdir`, `mv`, `mkdir`, `touch` and `find -delete` through `cd` chains and subshells, and denies when the typed name differs only in case from an existing entry, because on NTFS or APFS `rm -rf content` deletes `Content` ([case-insensitive-guard.js][k-cig]).
- **Kind**: hook.
- **Proposed address**: idea-only for the core command guard.
- **Why it could fit.** The owner is on NTFS, and Unity folders are PascalCase (`Assets/Content`), so the failure is plausible.
- **Why it might not.** Bash only. It is a 23 KB shell-semantics model for one rare failure. On Windows a PowerShell `Remove-Item content` has the same effect and is not covered.
- **Gate.** G1-G4 yes (79 `it(` cases). G5 Claude-only as shipped.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: none.
- **Output cost per fire**: 0 / one deny line.
- **Recommendation (proposed)**: reject; note the failure mode.

### 7. `subagent-spawn-cap`

- **What it is.** A `PreToolUse` guard on `Agent|Task` that counts spawns per session in an append-only file, asks at 20, 30, 40, 50 and denies at 60 ([subagent-spawn-cap.js][k-ssc]).
- **Kind**: hook.
- **Proposed address**: core always-on, optional.
- **Why it could fit.** The owner runs fan-out research sessions and already keeps a memory rule "max 4 parallel research subagents". A hook would enforce a budget instead of relying on memory.
- **Why it might not.** It caps the session *total*, not parallelism, so it does not express the owner's rule. `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS` is a built-in setting for the parallel cap ([token-diet.md][k-diet]). The README notes append atomicity is not guaranteed on Windows ([README][k-ssc-readme]).
- **Gate.** G1-G4 yes (45 `it(` cases). Asks become denies in unattended runs (source header). CX-hooks says `spawn_agent` "also matches `Agent`", but ask mode fails open on Codex.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: owner's memory rule; pstack fleet machinery ([pstack ledger](pstack.md)).
- **Output cost per fire**: 0 / one line.
- **Recommendation (proposed)**: reject the hook; note the built-in concurrency setting for the install ticket.

### 8. `guard-pack`

- **What it is.** The seven guards (entries 1-4, `config-guard`, 6, 7) loaded from `lib/` and evaluated in one Node process, first blocking verdict wins, each guard wrapped in its own `try` so "one broken guard can never switch off the other six" ([guard-pack.js][k-gp]). A repo test pins the `lib/` copies byte-identical to the standalone scripts.
- **Kind**: hook + packaging pattern.
- **Proposed address**: idea-only for how core hooks are bundled.
- **Why it could fit.** If core ever carries more than one `PreToolUse` hook, one dispatcher process is the cheap shape: ~38 ms against 7 × ~33 ms on the source's Mac ([bench/RESULTS.md][k-bench]; Windows process start is slower, not measured). Per-guard fail-open is the right failure unit.
- **Why it might not.** One `HOOK_SAFETY_LEVEL` for six guards. It drags in the guards proposed rejected. Two of its libs (`block-dangerous-commands`, `git-safety`) have the `HOME` problem; in the pack they would be skipped with only a log line (inference).
- **Gate.** As its members.
- **Copy / adapt / idea-only**: idea-only (the dispatcher shape and the "copies are pinned by a test" trick).
- **Overlap**: none.
- **Output cost per fire**: as the winning guard, plus " (via guard-pack)".
- **Recommendation (proposed)**: carry "one dispatcher process, fail open per guard" into the core hook design.

### 9. `instructions-audit`

- **What it is.** An `InstructionsLoaded` hook that scans `CLAUDE.md` and rule files for invisible Unicode, bidi overrides, secret-exfiltration directives and `curl | sh`, then *locks the session*: the same script on `UserPromptSubmit` and `PreToolUse` denies every prompt and tool call until a flag file is deleted ([instructions-audit.js][k-ia]).
- **Kind**: hook.
- **Proposed address**: none (proposed reject).
- **Why it could fit.** The owner vendors text from many sources; hidden-character smuggling in a copied skill is a real risk.
- **Why it might not.** It audits loaded instruction files, not skills, and the place to catch a poisoned source is at vendoring time (#17), not in every session. Code fences are not exempt, so a `CLAUDE.md` with an install one-liner locks the session (source header). It registers on every prompt and every tool call.
- **Gate.** G1 yes (prints `{}`). G2 yes. G3 **no** in spirit: a false positive stops all work. G4 yes (109 `it(` cases). G5 Claude-only.
- **Copy / adapt / idea-only**: idea-only. The detector list is a good seed for a vendoring-time scan.
- **Overlap**: discovery-sweep pitch on `skill-scanner` ([discovery-sweep](../discovery-sweep.md)).
- **Output cost per fire**: 0; once locked, a notice on every call.
- **Recommendation (proposed)**: reject as a hook; pass the invisible-Unicode rules to #17 as a check to run over vendored files.

### 10. Guard conventions and test machinery

- **What it is.** The shared shape of the guards plus the repo's checks: `{}` on allow; a `try`/`catch` that allows on any error; three levels by env var because "plugin updates overwrite edited files"; opt-in ask mode; a JSONL audit log under `~/.claude/hooks-logs/`; a pure exported `check…()` function tested directly plus stdin/stdout integration tests; [`tests/regex-backtracking.test.js`][k-redos], which feeds every exported regex a quote-heavy non-match after one rule "wedged the PreToolUse process"; a Windows CI job for one guard ([test.yml][k-ci]); and a latency bench ([bench/RESULTS.md][k-bench]).
- **Kind**: convention doc + CI-eval.
- **Proposed address**: idea-only for #17 and the core guard.
- **Why it could fit.** It is a direct implementation of gate items 1, 3 and 4. The ReDoS test covers a failure the gate does not name: a slow regex is a hook that blocks work without failing.
- **Why it might not.** "Fail open on any error" also means a guard can be silently off (the `HOME` case). The suite never runs a guard under a PowerShell hook shell.
- **Copy / adapt / idea-only**: idea-only; adopt as the house style for any hook the collection writes.
- **Overlap**: davidondrej `test-guard.sh` (the admitted guard's harness); Addy and superpowers test tooling ([addy ledger](addy-agent-skills.md), [superpowers ledger](superpowers.md)).
- **Output cost per fire**: n/a.
- **Recommendation (proposed)**: adopt the conventions for collection hooks, and add two checks they lack: a "guard is actually loaded" smoke test per shell, and a PowerShell-tool case.

### 11. `dead-rules-audit`

- **What it is.** A recorder that parses `CLAUDE.md` into numbered rules at SessionStart, tallies per edit whether each rule was relevant and followed (async `PostToolUse`), and shows a worst-first scorecard at SessionEnd or through the user-invoked `/dead-rules-audit:scorecard`, with a "promote to hook" hint for rules that are ignored ([dead-rules-audit.js][k-dra]).
- **Kind**: hook + skill (user-invoked).
- **Proposed address**: idea-only for #17 (maintenance).
- **Why it could fit.** #14's text gate asks "the agent was seen getting it wrong without the line". This is an instrument for that question, and "promote to a hook" is the gate's own third criterion.
- **Why it might not.** The owner's always-on text is three items (naming convention, two tooling notes). The tally is "fully deterministic" pattern matching (plugin description), so it can only judge rules a regex can check. A commit-naming rule shows up in Bash commands, which the hook does not watch (it matches `Edit|MultiEdit|Write`).
- **Gate.** Not a blocker. Output is a `systemMessage` (0 model tokens, inference).
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: caveman-stats idea ([installed-plugins ledger](installed-plugins.md)).
- **Output cost per fire**: 0 model tokens (inference).
- **Recommendation (proposed)**: reject the plugin; keep "measure whether an always-on line is followed before keeping it" as a #17 idea.

### 12. `context-hogs`, `bench/read-replay` and `docs/token-diet.md`

- **What it is.** `context-hogs` attributes each tool result's tokens to the file it loaded and shows a per-repo leaderboard at SessionEnd ([context-hogs.js][k-ch]). [`bench/read-replay`][k-replay] replays the user's own transcripts to count how much context large reads cost. [`docs/token-diet.md`][k-diet] argues against a read-gate hook and lists built-in settings instead: `CLAUDE_CODE_FILE_READ_MAX_OUTPUT_TOKENS`, `bashOutputMaxChars`, `CLAUDE_CODE_SUBAGENT_MODEL`, `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`, `CLAUDE_CODE_AUTO_COMPACT_WINDOW`, and `ENABLE_CLAUDEAI_MCP_SERVERS=false`.
- **Kind**: hook + script + convention doc.
- **Proposed address**: idea-only for the install and migration tickets.
- **Why it could fit.** The map counts idle context as a budget; these measure *working* context, the other half. `ENABLE_CLAUDEAI_MCP_SERVERS=false` speaks to the map's migration note about idle context from outside the collection. "Measure first, then prefer a setting over a hook" matches the gate's spirit.
- **Why it might not.** The doc's claims about lowering the read cap rest on a decompiled binary quote for one Claude Code version; not verified here. Token attribution is an estimate.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: [loading-mechanics](../loading-mechanics.md) (idle cost only).
- **Output cost per fire**: 0 model tokens (inference).
- **Recommendation (proposed)**: reject the plugin; hand the settings list to the migration item on the map as things to check against current docs.

### 13. `cache-tax`

- **What it is.** A `UserPromptSubmit` hook that warns with a dollar figure when the prompt cache has gone cold and the context is large, or refuses the prompt once with `CACHE_TAX_BLOCK=1`; a SessionStart arm for resumes; and a status-line segment ([cache-tax.js][k-ct]).
- **Kind**: hook + status line + skill (user-invoked).
- **Proposed address**: none; a status-line note for the migration item.
- **Why it could fit.** The owner runs long sessions; the status line is being re-picked anyway (map, "Migrating the current setup").
- **Why it might not.** It prices API rates, which mean little on a subscription. A static price table rots.
- **Gate.** G1-G4 mechanically yes (33 `it(` cases). Claude-only by nature.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: status-line pitch 9 in [discovery-sweep](../discovery-sweep.md).
- **Output cost per fire**: 0 model tokens (inference: `systemMessage`).
- **Recommendation (proposed)**: reject.

### 14. `dead-end-registry`

- **What it is.** Async Stop/PreCompact hooks mine the transcript for approaches that were tried and reverted, store them per repo, inject a "you already tried this" card on a matching prompt, and ask before an edit reintroduces a reverted hunk ([dead-end-registry.js][k-der]).
- **Kind**: hook + skill (user-invoked).
- **Proposed address**: none (proposed reject).
- **Why it could fit.** "Traps and dead ends" is the same knowledge davidondrej's `handoff` writes down by hand ([davidondrej ledger](davidondrej-skills.md) entry 9).
- **Why it might not.** Heuristic transcript mining with no human in the loop, injected into context. A wrong match plants a false "this failed before". 43 KB of script for it.
- **Gate.** G1-G4 mechanically yes; Claude-only.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `handoff`; davidondrej `handoff`.
- **Output cost per fire**: 0 on a non-matching prompt; a card on a match (size not measured).
- **Recommendation (proposed)**: reject; the hand-written handoff section covers the need.

### 15. `standup-autopilot`, `nerf-receipts`, `bounty-board`, `session-logger`

- **What it is.** Four recorders. `standup-autopilot` snapshots each session's outcome and re-injects yesterday's unresolved blockers at SessionStart ([source][k-sa]). `nerf-receipts` records failure rate and edit churn per model version ([source][k-nr]). `bounty-board` prices TODO/FIXME comments as "bounties" and injects the board and three "side quests" at every SessionStart ([source][k-bb]). `session-logger` writes a markdown log of each session ([source][k-sl]).
- **Kind**: hook (four), three with a user-invoked skill.
- **Proposed address**: none (proposed reject).
- **Why it could fit.** `session-logger` to an Obsidian folder is a cheap audit trail. `nerf-receipts` answers a question people argue about without data.
- **Why it might not.** `bounty-board` fails G1 (it prints in any repo that has TODOs) and invites unrequested work, against the fork's surgical-change stance. `standup-autopilot` targets team standups. None serves a stated owner need. `session-logger` has the `HOME` problem and a macOS example path.
- **Gate.** `bounty-board` fails G1. The others are silent or conditional.
- **Copy / adapt / idea-only**: none.
- **Overlap**: fork `handoff` (state across sessions).
- **Output cost per fire**: `bounty-board` a board card per session; `standup-autopilot` a blocker list when one exists; others 0.
- **Recommendation (proposed)**: reject all four.

### 16. `pr-provenance-stamp`

- **What it is.** Records tool calls and test exit codes per session, then rewrites the `--body` of `gh pr create` through `updatedInput` with a stamp of prompts, estimated spend, test tally and agent-authored share. It returns `permissionDecision: "allow"`, so "the user is NOT re-prompted" for that command ([pr-provenance-stamp.js][k-pps]).
- **Kind**: hook + skill (user-invoked).
- **Proposed address**: none (proposed reject).
- **Why it could fit.** Honest test tallies in a PR body are a good idea.
- **Why it might not.** It silently rewrites a command and skips its permission prompt. The owner's PR body is governed by the fork's `pr` skill and a fixed attribution line. It defers on heredoc bodies, the form agents normally use (source header), so it would rarely fire.
- **Gate.** Not a blocker hook; bypassing a permission prompt is the opposite of a guard.
- **Copy / adapt / idea-only**: none.
- **Overlap**: fork `pr`.
- **Output cost per fire**: 0 model tokens.
- **Recommendation (proposed)**: reject.

### 17. `auto-stage`, `format-code`, `notify-permission`

- **What it is.** `auto-stage` runs `git add` on every file the agent edits ([source][k-as]). `format-code` runs `ruff` (via `uv`) on Python and `prettier` (via `npx`) on JS/TS/JSON/MD after each write ([source][k-fc]). `notify-permission` posts a Slack card when Claude waits for input ([source][k-np]).
- **Kind**: hook (three).
- **Proposed address**: none (proposed reject); `format-code` as an idea for a web pack.
- **Why it could fit.** A format-on-write hook is a common pack piece; a C# equivalent would run `dotnet format` on the edited file.
- **Why it might not.** `auto-stage` changes the index behind the owner's back. `format-code` has no C# and reformats Markdown the agent just wrote. `notify-permission` is Slack-only. All three have the `HOME` problem.
- **Gate.** Silent, fail open, tested; not blockers.
- **Copy / adapt / idea-only**: idea-only (`format-code`'s safe-argv pattern).
- **Overlap**: none.
- **Output cost per fire**: 0.
- **Recommendation (proposed)**: reject.

### 18. `utils/event-logger.py`

- **What it is.** A script to register on any hook event that appends the raw payload to a JSONL file, "so you can inspect payload structures … before writing your own hooks" ([event-logger.py][k-evlog]).
- **Kind**: script.
- **Proposed address**: idea-only, a development aid for #17.
- **Why it could fit.** Building the core guard for two harnesses and two shells needs the real payloads (what does the PowerShell tool send? what does Codex send for `apply_patch`?). This is the ten-line tool for that.
- **Why it might not.** Python; trivially rewritten in Node. Its event list (13) is older than CC-hooks' current list.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: the `InstructionsLoaded` logging used in [lazy-loading](../lazy-loading.md).
- **Output cost per fire**: 0.
- **Recommendation (proposed)**: note as the first step of building any collection hook.

### 19. One plugin per hook

- **What it is.** Each hook is its own plugin (`plugins/<name>/` with `.claude-plugin/plugin.json`, `hooks/hooks.json`, the script, tests, a README), listed in one [marketplace.json][k-market]. The README warns that pointing `settings.json` into a clone breaks silently when the repo moves: "Claude Code treats a failing hook command as a non-blocking error: the guard stops enforcing without any visible sig[n]" ([README L192][k-readme]).
- **Kind**: manifest-packaging.
- **Proposed address**: idea-only input to the install ticket (#18).
- **Why it could fit.** The owner wants single pieces pickable. One plugin per hook gives that for hooks, the way per-skill files give it for skills. The silent-failure warning applies to any hook path in the owner's settings.
- **Why it might not.** 22 manifests to version. Codex needs its own manifest; CX-hooks does set `CLAUDE_PLUGIN_ROOT` for compatibility, so the `hooks.json` files could be reused (inference).
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: [vendoring](../vendoring.md); [loading-mechanics](../loading-mechanics.md) on plugin scopes.
- **Output cost per fire**: n/a.
- **Recommendation (proposed)**: carry "a moved hook path fails silently" into #18 as a check the install must make.

---

## diet103/claude-code-infrastructure-showcase

Common to entries 20 to 27. **Windows**: every hook is a bash script; the wired ones run TypeScript through a local `tsx` after `npm install` in `.claude/hooks/`, the Stop hooks need `jq`, and the README says "Windows users: use WSL2" ([README L37][d-readme]). Whether they run under Git Bash was not tested. **Tests**: none for the hooks.

### 20. `skill-activation-prompt` and `skill-rules.json` prompt triggers (input for #15)

- **What it is.** A `UserPromptSubmit` hook ([skill-activation-prompt.ts][d-sap], wrapper [`_run-node-hook.sh`][d-run]). It loads [`.claude/skills/skill-rules.json`][d-rules], where each skill has `promptTriggers.keywords` (case-insensitive substring test) and `promptTriggers.intentPatterns` (regexes), plus `enforcement: suggest | warn | block` ([L293-L335][d-sap]). An intent match on a `block` skill becomes MANDATORY; every other match becomes RECOMMENDED. It prints a boxed block: "RECOMMENDED SKILLS: → name … ACTION: Use Skill tool BEFORE responding", or "MANDATORY SKILL ACTIVATION REQUIRED … EDITS WILL BE BLOCKED" ([L356-L394][d-sap]). Skills already suggested in the session are filtered out, so each is suggested once ([L830-L843][d-sap]). The default mode is regex only; AI classification is opt-in (entry 23). The same script also prints a dev-doc reminder and optional vector-search context (entry 22).
- **Kind**: hook + manifest (the rules file).
- **Proposed address**: idea-only input to #15. If #15 wants a hook, its address would be core always-on, and it must pass the hook gate (#14, "Handed on").
- **Why it could fit.** It is working prior art for the "hook router" [loading-mechanics §5](../loading-mechanics.md) describes. Three things transfer:
  - **Rules as data.** One JSON file maps skills to triggers; the hook has no skill names in code. A collection router could read the same file.
  - **Once per session.** The `skills_used` state file prevents the caveman failure (#14 gate item 2).
  - **Fail open everywhere.** A missing rules file, missing dependencies or any exception prints to stderr and exits 0 ([L711-L717, L898-L906][d-sap]).
- **Why it might not.**
  - **It is the nudge #14 turned down.** Its purpose is "skills don't activate automatically" ([README][d-readme]). #14: "The owner has seen no missed triggers that would justify a nudge; a miss is fixed in that skill's description." For model-invoked skills the collection does not want this.
  - **The wording is wrong for user-invoked skills.** "Use Skill tool BEFORE responding" orders the model to load a skill. A `disable-model-invocation` skill cannot be loaded that way ([loading-mechanics](../loading-mechanics.md)); the line would have to say "tell the user `/x` fits".
  - **Substring keywords over-trigger.** `lowerPrompt.includes(kw.toLowerCase())` with the shipped keyword `"UI"` matches "b**ui**ld", "g**ui**de" and "s**ui**te"; `"React"` matches "reaction" (inference from [L313-L315][d-sap] and [skill-rules.json][d-rules]; not executed).
  - **Heavy output.** The suggestion block is ~250 chars including three 39-character rule lines; a one-line pointer cost ~45 tokens in [lazy-loading §4](../lazy-loading.md).
  - **Gate.** G1: suggestions yes, but the bundled reminder prints by default (entry 22). G2: suggestions yes. G3 yes. G4 **no**: there is no test suite, only one guaranteed-match prompt in [`verify-setup.sh`][d-verify]. G5: Codex wiring is shipped (entry 25), not verified.
  - **Runtime.** bash wrapper, `source ~/.bashrc`, `tsx`, `npm install`; a second rules file to keep in step with every skill description.
- **Copy / adapt / idea-only**: idea-only. It can't be copied because of the wording, the matcher, the missing tests, the bundled reminder and the Windows runtime. A collection version would be one dependency-free Node file (the shape [lazy-loading §4](../lazy-loading.md) already tested), word-boundary matching, a one-line output that addresses the user, once-per-session state, and block/allow style tests (match and no-match prompts).
- **Overlap**: pstack `poteto-mode` router and Addy/superpowers SessionStart routers ([pstack](pstack.md), [addy](addy-agent-skills.md), [superpowers](superpowers.md) ledgers), which are the manual and inject-at-start alternatives; fork `ask-matt` (manual router). Unity baseline: none.
- **Output cost per fire**: 0 on a non-matching prompt (documented and measured for the pattern in [lazy-loading §4](../lazy-loading.md)). ~250 chars per suggestion, roughly 80-150 tokens (inference; box-drawing characters tokenise poorly).
- **Recommendation (proposed)**: don't adopt the hook. Give #15 these inputs: (a) a suggestion hook is feasible and free when silent, but the only job left for it after #14 is pointing the *user* at user-invoked workflows; (b) if built, take rules-as-data, once-per-session and fail-open from here, and avoid substring keywords and imperative wording; (c) entry 24's telemetry is how to find out whether it earns its place.

### 21. `skill-verification-guard`, `skill-activation-tracker` and file triggers

- **What it is.** A `PreToolUse` hook on `Edit|MultiEdit|Write` ([skill-verification-guard.ts][d-svg]). If the prompt hook left mandatory skills pending, it blocks the first edit with exit 2 and a message to stderr, then clears the pending list so the second attempt passes ("two-try blocking model", [L277-L310][d-svg]). It also checks `fileTriggers` from the rules file (`pathPatterns` globs, `contentPatterns` regexes, `skipConditions` such as a `@skip-validation` file marker or an env override) and can ask an AI model whether the code being written needs a skill. [`skill-activation-tracker.ts`][d-sat] is a `PostToolUse` hook on the `Skill` tool that clears a skill from the pending list once it was really loaded.
- **Kind**: hook (two).
- **Proposed address**: none (proposed reject); `fileTriggers` as an idea for packs.
- **Why it could fit.** "Block the first edit to a matching file until the knowledge is loaded, once" is the hook equivalent of a path-scoped rule, and unlike `.claude/rules` it can exist on Codex ([lazy-loading §2](../lazy-loading.md) names the same substitute as untested). For a Unity pack it could mean: first edit of a `.unity` or `.prefab` file, print a pointer to `unity-serialization`.
- **Why it might not.** The collection already has `paths:` on skills, which #14 says is "always allowed" and which lists the skill on first matching read on Claude. Blocking an edit to force a skill load is a hard stop for a soft need. The path check `filePath.startsWith(projectDir)` assumes one separator style ([L260-L263][d-svg]); on Windows the path arrives with backslashes (CC-hooks), so normalisation probably fails (inference). On Codex there is no `Skill` tool event, so the tracker never fires ([README L418][d-readme]).
- **Gate.** G3: errors fail open ([L537-L546][d-svg]), but it blocks by design. G4 no tests.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: [lazy-loading](../lazy-loading.md) §1-§2 (path-scoped skills and rules); fork Unity skills with path-style triggers in their descriptions.
- **Output cost per fire**: 0 on a non-matching edit. ~250 chars on stderr when it blocks.
- **Recommendation (proposed)**: reject. Keep "a silent `PostToolUse`/`PreToolUse` pointer keyed on file path, once per session" as the Codex-side fallback already named in lazy-loading, to be tested if a pack ever needs it.

### 22. Dev-doc reminder, session intelligence and `session-doc-updater`

- **What it is.** Inside the prompt hook: a "DEV-DOC REMINDER" block printed on the first prompt and then whenever 2 turns or 10 minutes have passed, unless `SESSION_DOCS_ENABLED=false` ([skill-activation-prompt.ts L513-L571, L862-L870][d-sap]); and, with a `GEMINI_API_KEY`, a vector search over indexed dev docs whose hits are printed as "RELEVANT PAST CONTEXT". A Stop hook ([session-doc-updater.sh][d-sdu]) re-indexes changed plan files into a SQLite store and prunes state older than 7 days.
- **Kind**: hook.
- **Proposed address**: none (proposed reject).
- **Why it could fit.** It doesn't. It is recorded because it is on by default in the hook entry 20 describes.
- **Why it might not.** The reminder is per-turn reinforcement of static text: ~450 chars every second turn, each copy staying in history. That is the caveman pattern #14 names in gate item 2. The vector search sends prompts to an external API.
- **Gate.** Fails G1 and G2 as shipped.
- **Copy / adapt / idea-only**: none.
- **Overlap**: caveman's per-prompt reminder ([installed-plugins ledger](installed-plugins.md)); fork `handoff` for state across sessions.
- **Output cost per fire**: ~450 chars, roughly 120-200 tokens (inference), about every second prompt.
- **Recommendation (proposed)**: reject. Cite as the second local example, after caveman, of why gate item 2 exists.

### 23. AI classification providers

- **What it is.** Optional modes `fallback` and `ai-only` send the prompt and the skill list to Gemini, OpenAI, Anthropic or a local Ollama model and get back `{mandatory, recommended}` ([providers/][d-providers], [L219-L252][d-sap]), with three "conservativeness" prompts. AI results cannot arm a block unless `ai_can_arm_blocks` is set, because "on the 2026-07 held-out benchmark of real prompts, Gemini classification had perfect recall but false-alarmed on roughly a third of off-topic prompts" ([CONFIG.md L201][d-config]).
- **Kind**: hook option.
- **Proposed address**: none (proposed reject); one data point for #15.
- **Why it could fit.** Intent matching beats keywords in principle.
- **Why it might not.** A network call and an API key on every prompt, with the prompt leaving the machine. The source's own number says one in three off-topic prompts got a false suggestion. The benchmark data is not in the repo, so the figure is the author's claim, unverified.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: none.
- **Output cost per fire**: as entry 20.
- **Recommendation (proposed)**: reject. Tell #15: an LLM classifier in a prompt hook over-suggested by the author's own measure; deterministic rules are the only thing they let block.

### 24. Activation telemetry

- **What it is.** The hooks append `suggested`, `activated` and `blocked` events to `.claude/hooks/state/metrics.jsonl`. [`skill-stats.sh`][d-stats] (needs `jq`) reports, per skill, how often it was suggested, how often a suggestion was followed by an activation in the same session, and how often it was activated with no suggestion, "the model found it on its own" ([CONFIG.md L393-L403][d-config]).
- **Kind**: script + CI-eval idea.
- **Proposed address**: idea-only for #17, and for #15 if a hook is built.
- **Why it could fit.** It is the evidence #14 asks for before any nudge: "activated with no suggestion" is a count of triggers that did *not* miss. A `PostToolUse` hook on `Skill` that only logs is silent and costs nothing.
- **Why it might not.** On Codex there is no `Skill` tool event ([README L418][d-readme]), so activation can't be seen there. `jq` and bash. A typed `/skill` may not pass through the `Skill` tool (not checked).
- **Copy / adapt / idea-only**: idea-only; a few lines of Node.
- **Overlap**: anthropics `claude -p` trigger eval ([anthropic-skills ledger](anthropic-skills.md)) and superpowers triggering tests ([superpowers ledger](superpowers.md)), which test triggers offline; this measures them in real use.
- **Output cost per fire**: 0.
- **Recommendation (proposed)**: add "log skill activations, compare with suggestions" to #17 as an optional measurement, Claude-only.

### 25. Codex adapter, `.codex/hooks.json`, `.agents/skills` mirror

- **What it is.** [`.codex/hooks.json`][d-cxhooks] registers the same four hooks through [`_codex-adapter.sh`][d-adapter], which sets `CLAUDE_PROJECT_DIR` (Codex runs hooks at the session cwd) and turns one `apply_patch` call into one synthetic `Edit` event per file for the guard. [`sync-agent-skills.sh`][d-sync] mirrors `.claude/skills/` into `.agents/skills/` with a `--check` mode for drift. The README says Codex "uses the same events, stdin schema, and exit-code semantics" and names one gap: no `Skill` tool event ([README L404-L418][d-readme]).
- **Kind**: script + manifest-packaging.
- **Proposed address**: idea-only for the install ticket (#18) and the core guard.
- **Why it could fit.** It is the only source so far that ships one hook codebase for both harnesses. It lists the real differences: no `CLAUDE_PROJECT_DIR`, `apply_patch` in place of `Edit`/`Write`, hook trust, no `Skill` event. The `--check` drift mode is a ready CI step for a two-root skill install.
- **Why it might not.** The adapter reads the patch from `.tool_input.input // .tool_input.patch`; CX-hooks says "`Bash` and `apply_patch` use `tool_input.command`". With that shape the adapter falls to `tostring`, the `sed` line match finds no paths, and it exits 0: the guard is silently skipped on Codex (inference from [L31-L37][d-adapter]; Codex's payload may have changed since July, not tested). bash + `jq`. A mirror by copy is what the owner's own sync tooling already does.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: davidondrej guard's multi-agent payload handling ([davidondrej ledger](davidondrej-skills.md) entry 2) and its Codex hash-trust note; [loading-mechanics §3](../loading-mechanics.md); owner's `agent-skills-sync-unity`.
- **Output cost per fire**: n/a.
- **Recommendation (proposed)**: use its gap list as a checklist when the core guard is made to run on Codex, and verify each item against a logged payload (entry 18) instead of trusting either README.

### 26. Stop-hook build checks

- **What it is.** [`post-tool-use-tracker.sh`][d-ptu] records which service folders were edited. Optional Stop hooks then run `tsc` per affected folder ([`tsc-check.sh`][d-tsc]), print build errors with instructions ([`stop-build-check-enhanced.sh`][d-sbc]), launch an error-fixing subagent ([`trigger-build-resolver.sh`][d-tbr]) or remind about error handling ([`error-handling-reminder.ts`][d-ehr]). The README marks them "Heavy - monorepo only" and unwired by default.
- **Kind**: hook (five).
- **Proposed address**: none (proposed reject); the shape as an idea for a C# pack.
- **Why it could fit.** "Track edited projects, compile only those when the agent stops, feed errors back" maps to `dotnet build` on touched `.csproj` files.
- **Why it might not.** TypeScript monorepo paths are hard-coded. For Unity, compilation runs inside the Editor and the fork's `unity-verification` skill already owns "does it compile" ([fork ledger](mattpocock-skills-unity.md)). A Stop hook that blocks until a build passes can loop.
- **Gate.** Not assessed in depth; no tests, bash + `jq`.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `unity-verification`; superpowers `verification-before-completion`.
- **Output cost per fire**: build errors when present (unbounded by the scripts; Claude caps hook output at 10,000 chars, [loading-mechanics §4](../loading-mechanics.md)).
- **Recommendation (proposed)**: reject.

### 27. `setup.ts` wizard, `verify-setup.sh`, `/verify-setup`

- **What it is.** [`setup.ts`][d-setup] copies `.claude/` into a target project, detects the stack, installs hook dependencies and then runs eight health checks. [`verify-setup.sh`][d-verify] repeats the checks any time: Node version, hook registration, executable bits, dependencies, config validity, and "firing a test prompt through the real activation hook", each failure with its fix command. `/verify-setup` has the agent run it and repair failures.
- **Kind**: script + skill-like command.
- **Proposed address**: idea-only for #18 (install).
- **Why it could fit.** "An install verifies itself, including one end-to-end fire of each hook" answers the silent-failure risks in this ledger (moved paths, untrusted Codex hooks, a guard that throws at load). The owner's install spans two harnesses and per-project copies, where drift is likely.
- **Why it might not.** The wizard itself is specific to this source's layout. Re-running copies no files, so upgrades are manual.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: davidondrej's safe end-to-end probe for its guard ([davidondrej ledger](davidondrej-skills.md) entry 2); [vendoring](../vendoring.md).
- **Output cost per fire**: n/a.
- **Recommendation (proposed)**: carry "a doctor command that fires every installed hook once" into #18.

### 28. Skills: `skill-developer`, `backend-dev-guidelines`, `frontend-dev-guidelines`, `error-tracking`

- **What it is.** Four model-invoked skills ([`.claude/skills/`][d-skills]). `skill-developer` documents this repo's trigger system (448-line `SKILL.md` plus six reference files, ~56 KB). The other three are Express/Prisma, React/MUI v7/TanStack and Sentry v8 guides with `resources/` files, following a "500-line rule".
- **Kind**: skill (four).
- **Proposed address**: none (proposed reject).
- **Why it could fit.** The 500-line main file plus resource files is the progressive-disclosure layout the fork already uses.
- **Why it might not.** `skill-developer` teaches `skill-rules.json`, not general skill writing, and overlaps the fork's `writing-for-agents` and the host's `skill-creator`. The three guides are one team's stack (MUI v7, Prisma, Sentry), none of it the owner's. `error-tracking`'s description shouts "ALL ERRORS MUST BE CAPTURED TO SENTRY - no exceptions".
- **Copy / adapt / idea-only**: none.
- **Overlap**: fork `writing-for-agents`; anthropics `skill-creator` ([anthropic-skills ledger](anthropic-skills.md)). Unity baseline: none.
- **Idle context cost**: ~195 + ~145 + ~98 + ~191 ≈ 630 tokens (inference, description chars / 2.6).
- **Recommendation (proposed)**: reject all four.

### 29. Subagents, commands, dev-docs pattern, editor config

- **What it is.** Eight subagents ([`.claude/agents/`][d-agents]: architecture reviewer, refactor planner and executor, documentation writer, plan reviewer, two error fixers, web researcher), four commands ([`.claude/commands/`][d-commands]), and the "dev docs" pattern: three files per task (`plan`, `context`, `tasks`) under `dev/active/`, written by `/dev-docs` and refreshed by `/dev-docs-update` before compaction. Also a NeoVim config.
- **Kind**: skill-like (subagents, commands) + convention doc.
- **Proposed address**: none (proposed reject).
- **Why it could fit.** The three-file task record is a lightweight relative of the fork's spec and ticket flow.
- **Why it might not.** The fork's `to-spec` / `to-tickets` / `handoff` flow covers the same ground with the issue tracker as the store. Seven of the eight subagent descriptions run 1,300 to 2,200 characters with inline examples, about 4.9k tokens of idle context together (inference). Several pin models (`opus`, `sonnet`).
- **Copy / adapt / idea-only**: none.
- **Overlap**: fork workflow skills ([fork ledger](mattpocock-skills-unity.md)); fork `code-review` and `research`.
- **Idle context cost**: ~4.9k tokens for the subagents (inference); commands 0.
- **Recommendation (proposed)**: reject.

---

## nizos/tdd-guard

Common to entries 30 to 35. **Windows**: Node 22+ ([package.json][t-package]); the plugin's command is `npx tdd-guard@latest`, which works in shell form under Git Bash (CC-hooks notes `npx` is a `.cmd` shim that exec form cannot spawn). CI runs on Ubuntu only ([ci.yml][t-ci]); Windows was not tested here. **Codex**: none in this repo.

### 30. The `PreToolUse` validator

- **What it is.** On every `Write|Edit|MultiEdit|TodoWrite` the CLI ([tdd-guard.ts][t-cli], [processHookData.ts][t-phd]) skips ignored files (default: `*.md`, `*.json`, `*.yml`, `*.xml`, `*.html`, `*.css` and a few more, [GuardManager.ts L17-L29][t-gm]), allows an edit that adds exactly one test to a test file, and otherwise builds a prompt from the edit, the last test run (`.claude/tdd-guard/data/test.json`, written by a reporter), the todo list and the rules, and asks a Claude model for `{decision, reason}` ([validator.ts][t-validator]). The default client is the Claude Agent SDK on the user's subscription, default model `claude-sonnet-4-6` ([validation-model.md][t-vm]). On allow it prints nothing; on block it prints `{"decision":"block","reason":…}`.
- **Kind**: hook.
- **Proposed address**: none as shipped (proposed reject). If ever wanted: per-project, opt-in, never core.
- **Why it could fit.** The owner uses the fork's `tdd` skill and writes C# libraries, where strict red-green-refactor is practical. It enforces what the skill only asks for. It is silent when it allows.
- **Why it might not.**
  - **It fails closed.** `validator` returns `block('No response from model, try again')` on an empty reply and `block('Error during validation: …')` on any exception ([L16-L28][t-validator]). A network or auth problem stops every edit. That fails gate item 3.
  - **A model call per edit.** Every non-ignored, non-single-test edit costs a Sonnet round trip in latency and subscription usage. Not measured.
  - **C# is second-class.** `detectLanguage` knows TypeScript, JavaScript, Python, Go, Ruby, PHP and Rust ([fileTypeDetection.ts][t-ftd]). A `.cs` test file never gets the "one new test is always allowed" shortcut, and test-file detection has no `Tests.cs` rule, so every C# edit goes to the model.
  - **Unity.** Tests run inside the Editor's test runner; there is no reporter for it (entry 33).
  - **`npx tdd-guard@latest`** resolves the newest npm release on each fire ([hooks.json][t-hooks]): unpinned third-party code in the hook path, plus npm latency (inference).
  - **It also fires on `UserPromptSubmit`** for the toggle (entry 31), one Node start per prompt.
  - **The author has moved on** to Probity for new projects ([README L9-L13][t-readme]).
- **Gate.** G1 yes. G2 yes. G3 **no**. G4 yes (39 test files). G5 Claude-only, and declared so only by omission.
- **Copy / adapt / idea-only**: idea-only. It can't be copied because of fail-closed validation, the missing C#/Unity support and the unpinned `npx`.
- **Overlap**: fork `tdd` (the discipline as a model-invoked skill, [fork ledger](mattpocock-skills-unity.md)); fork `unity-testing`; superpowers TDD skill ([superpowers ledger](superpowers.md)); entry 2 (`protect-tests` guards the cheap, deterministic part of the same concern).
- **Output cost per fire**: 0 on allow. On block, the model's reason (unbounded by the code; typically a few sentences, inference).
- **Recommendation (proposed)**: reject for the collection. Keep `protect-tests` (entry 2) as the deterministic alternative, and see open question 4.

### 31. `tdd-guard on` / `off` and SessionStart housekeeping

- **What it is.** The `UserPromptSubmit` arm treats the exact prompts `tdd-guard on` and `tdd-guard off` as commands: it flips a persisted flag and stops the turn with `continue: false`, so the prompt never reaches the model ([userPromptHandler.ts][t-uph]). The `SessionStart` arm (`startup|resume|clear`) clears stale test and lint data and writes the default rules file if none exists; it prints nothing ([sessionHandler.ts][t-sh]).
- **Kind**: hook.
- **Proposed address**: idea-only for any hook the collection ships with an off switch.
- **Why it could fit.** A typed toggle that costs zero model tokens is a neat way to give a strict hook an escape hatch for prototyping (the fork has a `prototype` skill where TDD rules are meant to relax). Clearing stale state at session start is the right place for it.
- **Why it might not.** It costs a process start on every prompt to catch two strings. A user-invoked skill or an env var does the same without a per-prompt hook.
- **Gate.** G1 yes (0 tokens; the turn is stopped). G2 yes. G3 yes at CLI level (parse errors exit 0).
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: karanb192's env-var levels (entry 10); vibe-wise's opt-in state file ([installed-plugins ledger](installed-plugins.md)).
- **Output cost per fire**: 0.
- **Recommendation (proposed)**: note "every blocking hook needs a documented off switch" as a house rule; prefer an env var or state file over a prompt hook.

### 32. TDD rules text and custom instructions

- **What it is.** The validator's rules ([rules.ts][t-rules]): one failing test at a time; minimal code for the current failure; refactor only on green; three named violations (multiple test addition, over-implementation, premature implementation); "Reaching a Clean Red" (an import or signature error may be fixed with a stub, no new logic); and refactor allowances (types, constants, extraction of already-tested behaviour). On first run it is written to `.claude/tdd-guard/data/` for the user to edit ([custom-instructions.md][t-ci-doc]).
- **Kind**: convention doc.
- **Proposed address**: idea-only for the fork's `tdd` skill.
- **Why it could fit.** It is a precise statement of edge cases a TDD skill usually leaves vague: what an agent may do when the test cannot even load, and which refactor-phase additions need no new test. Written for a judge model, so each rule is checkable.
- **Why it might not.** The fork is where Matt-derived skills are edited (#16), and its `tdd` may already say this in its own words; not compared line by line here.
- **Copy / adapt / idea-only**: idea-only; a possible merge into the fork's `tdd`.
- **Overlap**: fork `tdd`; superpowers TDD.
- **Idle context cost**: 0 (it would be body text of an existing skill).
- **Recommendation (proposed)**: owner's call: compare "Reaching a Clean Red" and the refactor allowances against the fork's `tdd` when that theme is decided.

### 33. .NET reporter and the reporter architecture

- **What it is.** Each framework gets a small reporter that writes the last run to `.claude/tdd-guard/data/test.json`; the hook only reads that file. The repo holds reporters for Vitest, Jest, Storybook, pytest, PHPUnit, Go, Rust, RSpec, Minitest, JUnit 5 and [.NET][t-dotnet]. The .NET one is a Microsoft Testing Platform v2 extension that "covers TUnit, MSTest, xUnit, NUnit", auto-registers through `buildTransitive` props, and needs .NET 10+. Its README says "Planned distribution: NuGet.org", and neither the main README nor the `setup` skill lists it.
- **Kind**: script (library) + architecture idea.
- **Proposed address**: idea-only for a C# pack.
- **Why it could fit.** "A test reporter writes a small JSON the agent's hooks can read" decouples verification from parsing console output. For C# libraries on MTP v2 the hard part is written. It could feed a verification skill as well as a guard.
- **Why it might not.** Unpublished and undocumented upstream, so it would be vendored source. .NET 10+ and MTP v2 only. Unity's test runner is not MTP, so it does not apply to the owner's main work. The fork's `unity-verification` already defines how Unity test results are read.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `unity-verification` and `unity-testing`; the dotnet ledgers named in #19 (not yet written) may cover test tooling.
- **Idle context cost**: n/a.
- **Recommendation (proposed)**: note for the C# pack theme; no action now.

### 34. `setup` skill and plugin packaging

- **What it is.** A one-plugin marketplace ([marketplace.json][t-market], [plugin/][t-plugin]). The plugin holds `hooks.json` and one user-invoked skill, `/tdd-guard:setup`, which detects the test framework and installs and configures the matching reporter; it is restricted to `allowed-tools: [Read, Glob, Grep]` ([SKILL.md][t-setup]). The hook code itself is not in the plugin: `hooks.json` calls `npx tdd-guard@latest`.
- **Kind**: manifest-packaging + skill (user-invoked).
- **Proposed address**: idea-only for #18.
- **Why it could fit.** "A hook plugin ships a user-invoked setup skill for the per-project part" is a clean split: the plugin enables at user or project scope, the skill does the one-time repo wiring, and it costs no idle context.
- **Why it might not.** Fetching the hook from npm at `@latest` on every fire is the opposite of the pinned vendoring [vendoring](../vendoring.md) proposes. A setup skill limited to read-only tools has to hand the user commands to run.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: entry 27 (diet103's wizard); vibe-wise's opt-in skill ([installed-plugins ledger](installed-plugins.md)).
- **Idle context cost**: 0 (user-invoked).
- **Recommendation (proposed)**: note the "hook plugin + user-invoked setup skill" split for #18; reject `npx @latest` in hook commands as a house rule.

### 35. Enforcement doc

- **What it is.** [docs/enforcement.md][t-enf] closes two bypasses with permission rules instead of hooks: `deny: ["Read(.claude/tdd-guard/**)"]` so the agent cannot read or tamper with guard state, and denying `Bash(echo:*)`, `Bash(sed:*)`, `Bash(awk:*)` and similar so file writes cannot dodge the `Write|Edit` matcher through the shell.
- **Kind**: convention doc.
- **Proposed address**: idea-only for the core guard.
- **Why it could fit.** It states plainly what every file-tool guard in this ledger leaves open: a `Write|Edit` matcher does not see `sed -i` or a PowerShell `Set-Content`. That applies to a `protect-tests` port.
- **Why it might not.** Denying `sed`, `awk` and `echo` cripples normal agent work; the doc itself says it "may limit some agent capabilities".
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: karanb192 `config-guard` (entry 5), the hook answer to the same hole.
- **Idle context cost**: n/a.
- **Recommendation (proposed)**: record as a known limit of any edit-matcher guard: it guards against accidents through the edit tools, not against a determined shell route.

---

## Not verified

- No hook was executed, so every behaviour claim is from reading source, and every token figure is an estimate.
- Whether karanb192's guards run correctly under a PowerShell hook shell, and what the PowerShell tool's `PreToolUse` payload looks like on the owner's machine.
- Whether any karanb192 guard runs on Codex. The claim that the Bash guards' input and output shapes match is from CX-hooks only.
- Whether diet103's hooks run under Git Bash on Windows, and whether its Codex adapter still parses `apply_patch` (entry 25).
- diet103's "one third false alarms" benchmark: the data is not in the repo.
- karanb192's "1,949 passing" badge and its bench latencies (Apple M3 Pro; no Windows figure).
- That a hook's `systemMessage` adds no model context on Claude Code. CX-hooks says it is "surfaced as a warning in the UI"; for Claude this ledger assumes the same.
- `nizos/probity`, tdd-guard's successor, was not read.
- tdd-guard's latency and usage per validation, and its behaviour on Windows.

[k-root]: https://github.com/karanb192/claude-code-hooks/tree/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f
[k-license]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/LICENSE
[k-readme]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/README.md
[k-market]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/.claude-plugin/marketplace.json
[k-package]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/package.json
[k-ci]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/.github/workflows/test.yml
[k-bench]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/bench/RESULTS.md
[k-replay]: https://github.com/karanb192/claude-code-hooks/tree/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/bench/read-replay
[k-diet]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/docs/token-diet.md
[k-redos]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/tests/regex-backtracking.test.js
[k-evlog]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/utils/event-logger.py
[k-bdc]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/plugins/block-dangerous-commands/block-dangerous-commands.js
[k-bdc-hooks]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/plugins/block-dangerous-commands/hooks/hooks.json
[k-bdc-test]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/plugins/block-dangerous-commands/tests/block-dangerous-commands.test.js
[k-pt]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/plugins/protect-tests/protect-tests.js
[k-pt-test]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/plugins/protect-tests/tests/protect-tests.test.js
[k-gs]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/plugins/git-safety/git-safety.js
[k-ps]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/plugins/protect-secrets/protect-secrets.js
[k-ps-readme]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/plugins/protect-secrets/README.md
[k-ps-dispatch]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/tests/protect-secrets-dispatch.test.js
[k-cg]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/plugins/config-guard/config-guard.js
[k-cw]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/plugins/config-watch/config-watch.js
[k-cig]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/plugins/case-insensitive-guard/case-insensitive-guard.js
[k-ssc]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/plugins/subagent-spawn-cap/subagent-spawn-cap.js
[k-ssc-readme]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/plugins/subagent-spawn-cap/README.md
[k-gp]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/plugins/guard-pack/guard-pack.js
[k-ia]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/plugins/instructions-audit/instructions-audit.js
[k-dra]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/plugins/dead-rules-audit/dead-rules-audit.js
[k-ch]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/plugins/context-hogs/context-hogs.js
[k-ct]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/plugins/cache-tax/cache-tax.js
[k-der]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/plugins/dead-end-registry/dead-end-registry.js
[k-sa]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/plugins/standup-autopilot/standup-autopilot.js
[k-nr]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/plugins/nerf-receipts/nerf-receipts.js
[k-bb]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/plugins/bounty-board/bounty-board.js
[k-sl]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/plugins/session-logger/session-logger.js
[k-pps]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/plugins/pr-provenance-stamp/pr-provenance-stamp.js
[k-as]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/plugins/auto-stage/auto-stage.js
[k-fc]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/plugins/format-code/format-code.js
[k-np]: https://github.com/karanb192/claude-code-hooks/blob/3c9c90a60ea7ec66964be6dff48e3db3b050ab4f/plugins/notify-permission/notify-permission.js

[d-root]: https://github.com/diet103/claude-code-infrastructure-showcase/tree/07f75ce3c301259e857343596e7883b8ce5a9f50
[d-license]: https://github.com/diet103/claude-code-infrastructure-showcase/blob/07f75ce3c301259e857343596e7883b8ce5a9f50/LICENSE
[d-readme]: https://github.com/diet103/claude-code-infrastructure-showcase/blob/07f75ce3c301259e857343596e7883b8ce5a9f50/README.md
[d-sap]: https://github.com/diet103/claude-code-infrastructure-showcase/blob/07f75ce3c301259e857343596e7883b8ce5a9f50/.claude/hooks/skill-activation-prompt.ts
[d-run]: https://github.com/diet103/claude-code-infrastructure-showcase/blob/07f75ce3c301259e857343596e7883b8ce5a9f50/.claude/hooks/_run-node-hook.sh
[d-rules]: https://github.com/diet103/claude-code-infrastructure-showcase/blob/07f75ce3c301259e857343596e7883b8ce5a9f50/.claude/skills/skill-rules.json
[d-hookpkg]: https://github.com/diet103/claude-code-infrastructure-showcase/blob/07f75ce3c301259e857343596e7883b8ce5a9f50/.claude/hooks/package.json
[d-svg]: https://github.com/diet103/claude-code-infrastructure-showcase/blob/07f75ce3c301259e857343596e7883b8ce5a9f50/.claude/hooks/skill-verification-guard.ts
[d-sat]: https://github.com/diet103/claude-code-infrastructure-showcase/blob/07f75ce3c301259e857343596e7883b8ce5a9f50/.claude/hooks/skill-activation-tracker.ts
[d-sdu]: https://github.com/diet103/claude-code-infrastructure-showcase/blob/07f75ce3c301259e857343596e7883b8ce5a9f50/.claude/hooks/session-doc-updater.sh
[d-providers]: https://github.com/diet103/claude-code-infrastructure-showcase/tree/07f75ce3c301259e857343596e7883b8ce5a9f50/.claude/hooks/providers
[d-config]: https://github.com/diet103/claude-code-infrastructure-showcase/blob/07f75ce3c301259e857343596e7883b8ce5a9f50/.claude/hooks/CONFIG.md
[d-stats]: https://github.com/diet103/claude-code-infrastructure-showcase/blob/07f75ce3c301259e857343596e7883b8ce5a9f50/.claude/scripts/skill-stats.sh
[d-cxhooks]: https://github.com/diet103/claude-code-infrastructure-showcase/blob/07f75ce3c301259e857343596e7883b8ce5a9f50/.codex/hooks.json
[d-adapter]: https://github.com/diet103/claude-code-infrastructure-showcase/blob/07f75ce3c301259e857343596e7883b8ce5a9f50/.codex/hooks/_codex-adapter.sh
[d-sync]: https://github.com/diet103/claude-code-infrastructure-showcase/blob/07f75ce3c301259e857343596e7883b8ce5a9f50/.claude/scripts/sync-agent-skills.sh
[d-ptu]: https://github.com/diet103/claude-code-infrastructure-showcase/blob/07f75ce3c301259e857343596e7883b8ce5a9f50/.claude/hooks/post-tool-use-tracker.sh
[d-tsc]: https://github.com/diet103/claude-code-infrastructure-showcase/blob/07f75ce3c301259e857343596e7883b8ce5a9f50/.claude/hooks/tsc-check.sh
[d-sbc]: https://github.com/diet103/claude-code-infrastructure-showcase/blob/07f75ce3c301259e857343596e7883b8ce5a9f50/.claude/hooks/stop-build-check-enhanced.sh
[d-tbr]: https://github.com/diet103/claude-code-infrastructure-showcase/blob/07f75ce3c301259e857343596e7883b8ce5a9f50/.claude/hooks/trigger-build-resolver.sh
[d-ehr]: https://github.com/diet103/claude-code-infrastructure-showcase/blob/07f75ce3c301259e857343596e7883b8ce5a9f50/.claude/hooks/error-handling-reminder.ts
[d-setup]: https://github.com/diet103/claude-code-infrastructure-showcase/blob/07f75ce3c301259e857343596e7883b8ce5a9f50/setup.ts
[d-verify]: https://github.com/diet103/claude-code-infrastructure-showcase/blob/07f75ce3c301259e857343596e7883b8ce5a9f50/.claude/scripts/verify-setup.sh
[d-skills]: https://github.com/diet103/claude-code-infrastructure-showcase/tree/07f75ce3c301259e857343596e7883b8ce5a9f50/.claude/skills
[d-agents]: https://github.com/diet103/claude-code-infrastructure-showcase/tree/07f75ce3c301259e857343596e7883b8ce5a9f50/.claude/agents
[d-commands]: https://github.com/diet103/claude-code-infrastructure-showcase/tree/07f75ce3c301259e857343596e7883b8ce5a9f50/.claude/commands

[t-root]: https://github.com/nizos/tdd-guard/tree/7245912d8a368296b0cf161bc183d8ca0d8d03f5
[t-license]: https://github.com/nizos/tdd-guard/blob/7245912d8a368296b0cf161bc183d8ca0d8d03f5/LICENSE
[t-readme]: https://github.com/nizos/tdd-guard/blob/7245912d8a368296b0cf161bc183d8ca0d8d03f5/README.md
[t-package]: https://github.com/nizos/tdd-guard/blob/7245912d8a368296b0cf161bc183d8ca0d8d03f5/package.json
[t-ci]: https://github.com/nizos/tdd-guard/blob/7245912d8a368296b0cf161bc183d8ca0d8d03f5/.github/workflows/ci.yml
[t-hooks]: https://github.com/nizos/tdd-guard/blob/7245912d8a368296b0cf161bc183d8ca0d8d03f5/plugin/hooks/hooks.json
[t-plugin]: https://github.com/nizos/tdd-guard/tree/7245912d8a368296b0cf161bc183d8ca0d8d03f5/plugin
[t-market]: https://github.com/nizos/tdd-guard/blob/7245912d8a368296b0cf161bc183d8ca0d8d03f5/.claude-plugin/marketplace.json
[t-setup]: https://github.com/nizos/tdd-guard/blob/7245912d8a368296b0cf161bc183d8ca0d8d03f5/plugin/skills/setup/SKILL.md
[t-cli]: https://github.com/nizos/tdd-guard/blob/7245912d8a368296b0cf161bc183d8ca0d8d03f5/src/cli/tdd-guard.ts
[t-phd]: https://github.com/nizos/tdd-guard/blob/7245912d8a368296b0cf161bc183d8ca0d8d03f5/src/hooks/processHookData.ts
[t-validator]: https://github.com/nizos/tdd-guard/blob/7245912d8a368296b0cf161bc183d8ca0d8d03f5/src/validation/validator.ts
[t-gm]: https://github.com/nizos/tdd-guard/blob/7245912d8a368296b0cf161bc183d8ca0d8d03f5/src/guard/GuardManager.ts
[t-ftd]: https://github.com/nizos/tdd-guard/blob/7245912d8a368296b0cf161bc183d8ca0d8d03f5/src/hooks/fileTypeDetection.ts
[t-uph]: https://github.com/nizos/tdd-guard/blob/7245912d8a368296b0cf161bc183d8ca0d8d03f5/src/hooks/userPromptHandler.ts
[t-sh]: https://github.com/nizos/tdd-guard/blob/7245912d8a368296b0cf161bc183d8ca0d8d03f5/src/hooks/sessionHandler.ts
[t-rules]: https://github.com/nizos/tdd-guard/blob/7245912d8a368296b0cf161bc183d8ca0d8d03f5/src/validation/prompts/rules.ts
[t-vm]: https://github.com/nizos/tdd-guard/blob/7245912d8a368296b0cf161bc183d8ca0d8d03f5/docs/validation-model.md
[t-ci-doc]: https://github.com/nizos/tdd-guard/blob/7245912d8a368296b0cf161bc183d8ca0d8d03f5/docs/custom-instructions.md
[t-enf]: https://github.com/nizos/tdd-guard/blob/7245912d8a368296b0cf161bc183d8ca0d8d03f5/docs/enforcement.md
[t-dotnet]: https://github.com/nizos/tdd-guard/blob/7245912d8a368296b0cf161bc183d8ca0d8d03f5/reporters/dotnet/README.md
