# Cross-scope install evidence (#127)

Partial evidence, 2026-10-30, for [#127](https://github.com/Hissal/skill-collection/issues/127)
under [#78](https://github.com/Hissal/skill-collection/issues/78).
**Keep #127 open:** no effective harness selection or model reference read was
verified in this environment. Filesystem reachability is a separate observation.

## Inputs and environment

Read #127 (no comments), #78 and its owner answers, [trigger evals](../trigger-evals.md),
[behavioural evals](../behavioural-evals.md), [personal installation](../user-install.md),
[project installation](../project-install.md), and [ADR 0004](../adr/0004-skill-dependencies-use-agent-skills-sync-metadata.md).
Integration branch `feat/implement-issue-78` and starting HEAD were
`dc23962a20d4af423c85f12ae454bda1d0da57ee`.
`git merge-base --is-ancestor 68215ca97e00fe45532490309af6462f168c4105 feat/implement-issue-78`
exited 0: #117 was already integrated; no extra merge was necessary.

Observed parent runtime: Linux `6.12.113+deb13-amd64 x86_64`, Node `v20.19.2`.
`/home/agent/.local/bin/claude --version` exited 0, reporting
`2.1.312 (Claude Code)`. Its `--help` and `auth status --help` exited 0.
Initial noninteractive `command -v codex` and `command -v opencode` returned no
path (exit 1); that was a PATH limitation, not binary absence. After the user's
interactive-shell correction, explicit-path probes exited 0:
`/home/agent/.npm-global/bin/codex --version` reported `codex-cli 0.166.0`;
`/home/agent/.opencode/bin/opencode --version` reported `opencode v2.2.2`.
Codex `login --help` and `exec --help` also exited 0. No harness was installed;
no Windows host was available. OpenCode #125 live validation is separately
assigned and was not duplicated here.

## Authentication boundary

Executed only this status probe (exit 0):

```sh
mkdir -p /tmp/issue-127-probe/home
HOME=/tmp/issue-127-probe/home \
CLAUDE_CONFIG_DIR=/tmp/issue-127-probe/home/.claude \
/home/agent/.local/bin/claude auth status --json
```

It reported `loggedIn: false`, `authMethod: none`, `apiProvider: firstParty`,
`analyticsDisabled: false`, with config and project directories under the temporary
home. No credential values were read, printed or copied. Existing inherited
runtime authentication was left intact. This establishes no authenticated runtime
in this isolated configuration; it says nothing about authentication in the real
home. No login, model request, model selector, transcript or spend was produced.
The supported CLI alone is insufficient to justify a live run. Real home settings,
plugins and skills were neither modified nor imported.

Codex authentication was also probed using the installed binary:

```sh
mkdir -p /tmp/issue-127-codex/home/.codex
HOME=/tmp/issue-127-codex/home \
CODEX_HOME=/tmp/issue-127-codex/home/.codex \
/home/agent/.npm-global/bin/codex login status
```

It exited 1 with `Not logged in`, plus a warning: `Refusing to create helper
binaries under temporary dir "/tmp"`. No real-home config or credentials were
imported. No Codex model request was made; actual selection and double listing
remain unverified despite the installed CLI.

## Isolated filesystem run

Run from the collection checkout:

```sh
node scripts/install/evidence/cross-scope.js
```

Exit 0 on 2026-10-30, roots `/tmp/skill-scope-127-sTuMBM` and `/tmp/skill-scope-127-JpOCPc` (rerun
with explicit reference-content and duplicate-marker assertions), with all three
scenarios passing.

The builder creates fresh temporary homes, fixture sources and Git projects with
committed baselines. It calls the real installer using `--home`, `--source`,
`--pack fixture`, and `--skill ... --project ...`. Installer stdout/stderr is kept
in each scenario's `install.log`. It checks installer exit status, actual symlink
type, canonical targets in both `.claude/skills` and `.agents/skills`, and an empty
project `git status --porcelain`. The rerun also reads the exact reference token
through each installed rules link and checks the duplicate user body marker.
These are Node filesystem reads; the builder does not invoke any harness.

`scope-caller` declares a hard requirement on
`hissal.skill-collection/eval-scope-scope-rules`; the required `scope-rules` has
`references/token.md`. Both identities and the requires array use ADR 0004 metadata.
The caller instructs loading the requirement through installed visibility and
reading its reference before answering, with a stop on missing content.

- `project-to-user`: caller only in project, rules and reference only in user home.
- `user-to-project`: caller only in user home, rules and reference only in project.
- `duplicate`: project caller marker `CALLER`, user caller marker `USER-CALLER`,
  same callable name and identity, with rules at user scope. Duplicate user caller
  links are manually created and explicitly marked as not installer-owned.

The mixed-scope skills are never installed as siblings. Source fixture folders
are implementation inputs, not a substitute for discovering installed skills.
This is a hand-run build-evidence fixture, not a trigger quality or behavioural
eval pass. Temporary artifacts are disposable; rerunning chooses a fresh root.
Early builder iterations failed on invalid manifest path shape, then an incorrect
duplicate destination (`ENOENT`); both were corrected before the successful run.

## Remaining matrix

| Observation | Claude Code | Codex |
| --- | --- | --- |
| Linux installer symlinks resolve on disk | Verified in `.claude` root | Verified in `.agents` root; no CLI run |
| Effective duplicate selection | Missing: no isolated auth | Missing: no isolated auth |
| Actual duplicate listing | Missing | Missing: no isolated auth |
| Project caller loads user requirement and reference | Missing: no isolated auth | Missing: no isolated auth |
| User caller loads project requirement and reference | Missing: no isolated auth | Missing: no isolated auth |
| Windows installer directory symlink followed by harness | Missing: no Windows | Missing: no Windows |
| Windows installer junction followed by harness | Missing: no Windows | Missing: no Windows |

## Integration and checks

Merged integration tip `711a8aeeb31d59a03c5de5bb99a4c042a3341b1e` after the
initial evidence commit; merge commit `f91019b` includes the steering changes.
The merged fixture rerun exited 0 at `/tmp/skill-scope-127-TSfa76`.
The merged collection check passed with 611 guard cases, 26 installer cases,
zero failures and zero warnings. The post-merge `node scripts/check/test/run.js`
passed all 216 cases with zero failures. The collection check also passed after
the PATH/authentication correction. `npm ci` completed before checks;
`git diff --check` passed.

## Live verification completion criteria

For each live run use a fresh scenario and an authenticated existing runtime whose
config, logs and caches stay inside the temporary home. Do not copy credentials
or install harnesses to fill this matrix. Record CLI version, exact model ID,
OS, invocation, tool transcript, selected skill path/body marker, reference path
and token, permission denials, exit status and any spend reported. Explicitly
invoke `/scope-caller` on Claude or `$scope-caller` on Codex. Selection requires
an observed body load and its marker, not a name in prose. Mixed-scope success
requires observed loads of both skill bodies and `references/token.md` with token
`RULES-REFERENCE` before the answer. Capture Codex's actual two listing entries
separately from body loads. A denial or unobservable read is inconclusive.

On Claude grant temporary read permission for both installed links and source
targets; the install logs print suggested rules. Keep normal skill discovery
active, while excluding unrelated hooks, MCP servers and plugins from the isolated
configuration. Do not use safe mode, which disables the skills being tested.
On Windows repeat with directory symlink permission enabled and refused, recording
installer-reported type and independently confirming the symlink or junction,
then observing each harness follow it and read the reference. Linux filesystem
results cannot establish either Windows behavior.

Expected personal precedence on Claude and double listing on Codex remain
expectations from the install contract, not findings of this run. No observed
runtime result contradicts the docs; no expectation was promoted to a verified
claim. Plugin reachability belongs to the separate plugin gate.

A matrix cell is complete only when its recorded transcript and paths satisfy
the corresponding observation above. Close #127 only after every acceptance
item is verified on both harnesses, both Windows link types are covered, and
the required repository checks pass.
