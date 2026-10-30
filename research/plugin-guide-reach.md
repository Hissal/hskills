# Plugin guide reach gate (#123)

Executed 2026-10-30 on Linux under [spec #78](https://github.com/Hissal/skill-collection/issues/78).
Status: **inconclusive; #123 remains open and #124 remains blocked**.
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

## Remaining gate

Use an existing safe authentication mechanism with isolated configuration;
otherwise leave this gate blocked. Confirm actual model identities and callable
names, and record same-session guide and target loads for both targets on both
hosts. Run the six-query trigger-quality matrix and repeats as needed; the two
smoke queries here do not establish reliability. The trigger script observes only
target loading, so a passing target verdict alone cannot prove guide reach.
Publish actual evidence on #123 and #124 before changing the gate state.

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
