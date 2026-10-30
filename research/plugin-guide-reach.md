# Authenticated retry (2026-10-30)

**Gate passed on the installed Linux hosts.** Both bare and qualified guide
references reached the fixture plugin on Claude Code 2.1.314 and Codex 0.166.0.
The owner fallback in [#78 answer 3](https://github.com/Hissal/skill-collection/issues/78#issuecomment-6510537918)
is not triggered. #124 production plugin generation remains outside this task;
the successful gate is evidence for its prerequisite, not completion of #124.
The passed gate and controls are recorded on [#123](https://github.com/Hissal/skill-collection/issues/123)
and [#124](https://github.com/Hissal/skill-collection/issues/124).

## Evidence and scope

The [sanitized run summaries](evidence/plugin-guide-reach/results.json) record
24 matrix sessions, plus diagnostic controls. Every one of the twelve positive
sessions loaded the guide and then the target in the same session and returned
`REACH-123-ORCHID`. All twelve unrelated queries avoided both skills. Both
`trigger.js` matrices exited zero. Each matrix used three positive and three
negative prompts; no model substitution or synthetic unavailable command was used.
Raw stdout/stderr and command metadata remain private under
`/tmp/reach-123-nNMntC/evidence`; they are not committed as unreviewed transcripts.

Claude's `opus` selector resolved to **claude-opus-5-5**, reported by session init
and usage. Codex selected **gpt-6.1-sol**, also confirmed in rollout turn context.
Claude's Skill calls were `reach-guide`, then `reach-fixture:reach-token`, even
when the guide said bare `reach-token`. Codex's installed listing exposed
`reach-fixture:reach-token` with the bare frontmatter/directory `reach-token`;
successful `cat` events read both installed entry points in order. The plugin was
`reach-fixture@skill-collection-reach-fixture`, enabled, version 0.1.0. Neither
fixture name duplicates an entry in Claude's emitted skills/slash-command inventory
or a Codex CLI command in `--help`; no clash was observed. This does not prove
arbitrary future plugin names collision-free or cover other platforms.

Both plugin-disabled controls loaded the guide, stopped on the missing target,
and returned no token. Claude omitted `--plugin-dir`; Codex used a regular
scratch config with the fixture disabled. A Codex `-c` enablement override did
not actually disable it in this setup and is retained as an ineffective-override
diagnostic, not counted as a disabled control or a gate failure.

## Authentication and reproduction

Normal `claude auth status` reported logged in through claude.ai; normal and
scratch `codex login status` reported `Logged in using ChatGPT`. No credential
contents were inspected or copied, no login was attempted, and inherited runtime
headers and environment remained intact. Claude retained normal auth while using
project settings and a session-only plugin directory. Codex used a temporary
cache, a symlink selecting the existing auth file, and a regular scratch config
preserving the existing config (whose top-level keys were `tui`, `projects`,
`hooks`) with fixture marketplace/plugin tables appended. No persistent real-home
plugin was installed and no real user settings were edited.

A config-file symlink selected the real config directory and its plugin set,
so those initial diagnostic sessions did not test plugin reach and were excluded.
Replacing it with a regular scratch config produced an enabled fixture in
`plugin list --json` and the successful matrix. No actual auth/account/trust
error occurred during the authenticated retry; no human login action is needed.

Commands, with `R=/tmp/reach-123-nNMntC` and installed CLI paths:

```sh
claude auth status
codex login status
# Register only in the scratch CODEX_HOME; retain normal HOME.
CODEX_HOME="$R/home/.codex" codex plugin marketplace add "$R/marketplace" --json
CODEX_HOME="$R/home/.codex" codex plugin add reach-fixture@skill-collection-reach-fixture --json
# After safe existing-auth selection and config overlay, verify actual selection.
CODEX_HOME="$R/home/.codex" codex login status
CODEX_HOME="$R/home/.codex" codex --no-daemon plugin list --json
CODEX_HOME="$R/home/.codex" node scripts/eval/trigger.js "$R/bare.json"
CODEX_HOME="$R/home/.codex" node scripts/eval/trigger.js "$R/qualified.json"
```

The configs use the fixture capture wrapper, installed absolute CLI paths,
Claude `--setting-sources project --plugin-dir "$R/marketplace/pack"
--strict-mcp-config --no-session-persistence --permission-mode bypassPermissions`,
and Codex `--no-daemon`. Prompts match the fixture's six-query matrix.
The wrapper preserves real exit status and stores private streams so target-only
trigger verdicts can be checked against guide-load evidence.

## Recovery verification

The usage-limit continuation recovered the tracked diff and both untracked
fixture/evidence paths from worktree `t3-35531dac` onto integration tip
`6815c96`, retaining the original files. The requested `evidence/capture.js`
was found at `scripts/eval/test/plugin-fixture/capture.js`. The continuation
reopened all 24 matrix stdout streams and command metadata: all processes
exited zero; Codex successful reads included the matching guide/target
frontmatter bodies; Claude sessions completed successfully. Both effective
disabled controls loaded only the guide. These are recovered actual runtime
observations, not a new matrix run.

Continuation checks passed: `npm ci` (zero vulnerabilities),
`node scripts/eval/test/run.js`, `node scripts/check/check.js`
(611 guard cases, 36 install cases, zero failures, four existing warnings),
and `node scripts/check/test/run.js` (218 passed, zero failed). Fixture
preparation, JavaScript syntax checks and `git diff --check` also passed.
No gate writer or vendoring script changed.

## Integration and verification

The starting HEAD was `6c99b5a52aa8a558ed2146002abc46184cf19b2b`, confirmed as
an ancestor. Integration tip `a37ed41dcef3074b30ab4fbe05b9de6fa9c53830` was merged before
the final report. `npm ci` completed with zero audit vulnerabilities.
`node scripts/check/check.js` passed: 611 guard cases, 36 install cases,
zero failures and the same four packaging warnings as the historical attempt.
`node scripts/eval/test/run.js` passed, including the new evidence-capture test
for stream forwarding, exit status and private file permissions. JavaScript
syntax checks, fixture preparation, `git diff --check`, and assertions over all
24 matrix sessions and both effective disabled controls passed.
The collection fixture suite was interrupted before its final result was recorded.
The continuation verification below supersedes that incomplete check record.
No gate writer or vendoring script was changed.

---

# Historical empty-home attempt (#123)

Executed 2026-10-30 on Linux under [spec #78](https://github.com/Hissal/skill-collection/issues/78).
Historical first attempt: **inconclusive** (superseded by the authenticated retry above).
The owner's [answer 3](https://github.com/Hissal/skill-collection/issues/78#issuecomment-6510537918)
requires actual bare-name reach. Authentication blocks establish neither success
nor failure and do not support closing #124 as wontfix. No production skill
plugins were built.

## Fixture and execution

The [test-only marketplace](../scripts/eval/test/plugin-fixture/README.md) contains
one pack plugin with one target skill and a separate guide. It is outside the
real marketplace and collection manifest. Scratch root for this run was
`/tmp/reach-123-L8YdvZ`; both test projects were initialized as Git repositories.
Both guide copies were installed in project `.claude/skills` and `.agents/skills`.
Bare guide target: `reach-token`; qualified candidate: `reach-fixture:reach-token`.
The prompt asked for the issue 123 token through the guide, without an explicit
skill invocation. A second query asked two plus two as a negative control.

CLI versions: Claude Code **2.1.314**, Codex **0.166.0**. Executables were
`/home/agent/.local/bin/claude` and `/home/agent/.npm-global/bin/codex`.
Selectors were Claude `opus` (documented alias in CLI help) and Codex
`gpt-6.1-sol` (listed by the existing local model catalog). No fallback was used.
The effective Claude model behind the alias could not be confirmed without a
successful session. Local model listing does not establish account availability.

Every run used a disposable `HOME`, `CLAUDE_CONFIG_DIR` and `CODEX_HOME`.
No credentials were copied or inspected, no login was attempted, and no real-home
settings or plugin installs were changed. Claude loaded the scratch pack with
`--plugin-dir` and selected project settings only. Codex registered the scratch
marketplace and installed its fixture in the disposable home. Initial Codex
registration attempts failed because its config directory did not exist; after
creating it, marketplace add, plugin add and list all exited zero. Codex warned
that helper PATH aliases cannot be created under `/tmp`.

Claude plugin validation passed with an author warning; directory submission
checks additionally reported missing README/license/icon. This fixture was not
submitted. Codex listing reported enabled true, version 0.1.0,
`reach-fixture@skill-collection-reach-fixture`, plugin name `reach-fixture`, local
source `marketplace/pack` and a versioned cache path. These are registration
names, not effective skill names. Actual callable names and host command-name
collisions remain **unobserved**, not collision-free.

## Outcomes

Both configs ran through `node scripts/eval/trigger.js` (no fake commands):

| Guide target | Claude opus q1 / q2 | Codex gpt-6.1-sol q1 / q2 |
|---|---|---|
| bare | inconclusive / inconclusive | inconclusive / inconclusive |
| qualified candidate | inconclusive / inconclusive | inconclusive / inconclusive |

Every model and overall skill verdict was inconclusive. Claude isolated auth
status returned exit 1, `loggedIn: false`, `authMethod: none`; an additional
headless probe exited 1 with `Not logged in` and `Please run /login`.
Codex isolated login status reported `Not logged in`; an additional headless
probe exited 1 with HTTP 401 `Missing bearer or basic authentication in header`.
The evaluator discards raw
responses and stderr, so per-query errors are not attributed more specifically.
No guide or target load, resolved frontier identity, collision result or token
spend was observed. HTTP 402, if encountered on a future authenticated retry,
must likewise remain inconclusive.

## Historical follow-up (completed)

The authenticated retry above completed the bare and qualified matrices on both
hosts, confirmed same-session guide and target loads, and recorded unrelated and
plugin-disabled controls. The passed gate is recorded on #123 and #124; the
empty-home authentication failure is historical evidence only. The trigger
script observes target loading, so the captured guide-load evidence remains
necessary to establish the chain.

The CLI parser's optional `readName` supports Codex's bare entry-point name when
the report label is plugin-qualified. An offline successful `cat` fixture failed
against the previous CLI (both fake frontier verdicts fail) and passed with the
change. Offline streams establish parsing only, not this owner gate.

## Repository verification

`npm ci` completed. Trigger CLI tests passed, including qualified-callable/bare
entry-point classification; seven gate cases passed. The collection check passed
with 611 guard cases, 31 installer cases and zero failures. Four agnix warnings
remain: fixture guide directory/name mismatch (the prepared install uses the
correct directory), missing fixture marketplace description, and `policy` ignored
by Claude in both marketplaces (needed by Codex). These are packaging warnings,
not evidence of effective names or reachability. No gate writer was changed.
The collection fixture suite also passed: 216 cases, zero failures. Fixture
preparation and JavaScript syntax checks passed after the final implementation.

The final integration merge added #122's release configuration. Fixture plugin
manifests now use `.json.fixture` templates, materialized only by preparation in
the disposable marketplace; their generated bytes match the manifests exercised
above. This keeps test plugins outside production release stamping as well as
real installs. Updated dependencies installed with zero audit vulnerabilities;
Node 20 reported the release tool's Node 22 requirement, so integration checks
and the offline release dry run use Node 22.
After the release integration, Node 22 verification passed the collection check
(zero failures, four warnings), all 218 collection fixtures, and the offline
release dry run. After merging the subsequent installer integration, its updated
32-case suite passed. The integration tip is included in this work branch.
