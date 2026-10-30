# Disposable plugin reach fixture (#123)

Use this fixture only for the [plugin gate](https://github.com/Hissal/skill-collection/issues/123).
Plugin manifests are templates materialized only in the scratch copy, outside
release stamping. Its separate test marketplace is outside the release marketplace, collection
manifest, catalog and install selection. The one-skill pack is test data;
production skill plugins remain gated on #123. It carries no hooks.

Run `node scripts/eval/trigger.js --help`, then:

```sh
CLAUDE_BIN=/path/to/claude CODEX_BIN=/path/to/codex node scripts/eval/test/plugin-fixture/prepare.js
```

The printed scratch root contains a marketplace copy, two Git projects, configs,
an empty home, and a private evidence directory populated by `capture.js`.
Each real CLI call retains stdout, stderr, argv, cwd and exit status there.
Keep these raw transcripts local; inspect and redact before sharing any excerpts.
The six queries cover three guide requests and three unrelated controls.

Check existing authentication first with `claude auth status` and
`codex login status`. Use the existing authenticated runtime; keep inherited
headers and guard variables. An empty scratch home is suitable for plugin
registration, but hiding existing credentials during model execution does not
test reachability. Claude supports per-invocation `--plugin-dir` and
`--setting-sources project` with normal auth. Codex can use a scratch
`CODEX_HOME` with an auth-file path reference (symlink, never a credential copy)
and a regular scratch config preserving existing runtime settings plus the
fixture marketplace/plugin tables. Verify `login status` again before execution.
A config-file symlink can resolve the config directory back to the real home,
selecting its plugins instead; verify the fixture appears enabled in `plugin list`.
Use `--no-daemon` to keep these sessions independent of the shared daemon.
Keep real user settings and installed plugins untouched. If the current runtime
cannot expose auth safely to the scratch config, report that blocker.

In that environment register the scratch marketplace with
`codex plugin marketplace add <root>/marketplace --json`, then
`codex plugin add reach-fixture@skill-collection-reach-fixture --json` and
`codex plugin list --json`. Claude uses the scratch pack via `--plugin-dir`;
validate it with `claude plugin validate <root>/marketplace/pack`.
Run `node scripts/eval/trigger.js <root>/bare.json` and then the qualified config.
Each starts fresh processes; no explicit skill invocation is added to prompts.

Before a gate pass, inspect successful session evidence that **both** the guide and target
loaded in the same run, record actual callable names, replace qualified targets
if the host reports different names, and test host-command collisions. The
trigger evaluator observes the target only; it cannot certify the guide chain.
Codex's narrow read detector uses `readName` for the bare directory/frontmatter
name and `name` for the callable report label. That is parser support, not proof
that Codex exposes a particular qualified name. Failed auth, unavailable models,
HTTP 402, timeouts and unobservable reads leave #124 blocked. Only actual failed
reachability supports the owner's fallback; inconclusive never means wontfix.
