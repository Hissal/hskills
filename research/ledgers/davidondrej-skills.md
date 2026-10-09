# Ledger: davidondrej/skills

Ticket: [Ledger: davidondrej/skills](https://github.com/Hissal/skill-collection/issues/21), part of [Wayfinder: personal skill collection blueprint](https://github.com/Hissal/skill-collection/issues/1).

Source: `davidondrej/skills`, read at commit [`7874889`][root] (committed 2026-10-08, "Publish sanitized skills snapshot"). Read on 2026-10-09 from a shallow clone in the session scratchpad. Nothing from the source was installed or executed. Every source link below is pinned to that SHA. Fork links point at the local fork `C:\dev\skills\mattpocock-skills-unity` @ `3d926c6`, the SHA the other ledgers used.

Vocabulary follows [`GLOSSARY.md`](../../GLOSSARY.md). Harness facts come from [`research/loading-mechanics.md`](../loading-mechanics.md) (ticket #2). *Inference* marks a claim reasoned from the sources rather than stated by them. Everything below is **proposed**. The owner decides in theme sessions.

**Idle cost method.** Description characters were measured from each `SKILL.md` frontmatter by a script. Tokens are estimated at 2.6 chars/token plus ~5 for the name, the ratio [loading-mechanics](../loading-mechanics.md) measured on fork descriptions and the [anthropic-skills ledger](anthropic-skills.md) reused. This is an estimate (inference), not a `claude plugin details` measurement.

## Overview

**What the source is.** A public, *sanitized mirror* of one person's private skills repo. Every recent commit is titled "Publish sanitized skills snapshot" with a `Source: davidondrej/priva…` trailer (`gh api repos/davidondrej/skills/commits`, read 2026-10-09). The [`push-skills`][push-skills] skill describes the pipeline: pushing the private repo's `main` triggers a sanitizer that publishes here. MIT licence ([LICENSE][license]); `browser-use` carries its own MIT licence from its upstream author ([LICENSE.md][bu-license]); `teach` credits Matt Pocock ([teach L144][teach]). GitHub shows ~4.1k stars and ~600 forks (`gh api repos/davidondrej/skills`, 2026-10-09).

**What it ships** (counted from the tree at `7874889`):

| Part | Count | Where |
|---|---|---|
| Skills | 57, in 5 category folders: `agent-orchestration` 17, `ops-and-setup` 13, `research-and-web` 10, `skill-authoring` 3, `thinking-and-docs` 14 | [`skills/`][skills], [README][readme] |
| Model-invoked | 29 (no `disable-model-invocation`) | per-skill frontmatter |
| User-invoked | 28 set `disable-model-invocation: true`. 26 of them also ship `agents/openai.yaml` with `allow_implicit_invocation: false`. `file-tree` and `rename` ship no `openai.yaml`, so on Codex they stay implicitly invocable (inference from [loading-mechanics §1](../loading-mechanics.md)) | per-skill frontmatter and `agents/openai.yaml` |
| Global steering file | 1 root [`AGENTS.md`][agents-md] (128 lines), the author's *user-global* instructions, published by `push-skills` | repo root |
| Hooks | 2 scripts: [`deny-dangerous.sh`][hook-deny] (a `PreToolUse` command guard) and [`test-guard.sh`][hook-test] (its test harness). The patterns file they read is **not** published | [`hooks/`][hooks] |
| Bundled scripts | 6: `anti-sleep.sh`, `persistent-localhost.sh`, `reset-cursor-acp.sh`, `permission-mode.sh`, `check_domains.py`, `fetch-sources.py` | under each skill's `scripts/` |
| Packaging | None. No plugin manifest, no marketplace. The README only describes the folder layout ([README][readme]); `distribute-skill-to-all-agents` shows the author installs by copying/symlinking into `~/.agents/skills` | — |

**Idle cost if installed as published.** The 29 model-invoked descriptions total about 5,900 characters, about **2.4k tokens** (or ~1.6k at chars/4). `deepapi` alone is ~195 tokens (a 494-char description). For comparison, the owner's 19 model-invoked fork skills cost ~1.6k ([loading-mechanics](../loading-mechanics.md)). Because there is no plugin, nothing forces all-or-nothing: single skills can be copied.

**Fit to the owner, in one line.** No skill mentions Unity, C# or .NET (case-insensitive grep: every "unity" hit is the substring of "community"). 12 `SKILL.md` files depend on macOS (`launchctl`, `pbcopy`, Homebrew, `caffeinate`; grep). About half the catalog wraps tools in the author's own stack: bb, Cloudroom, cmux, Herdr, Boat, Grok Bots, Cursor ACP, DeepAPI, Fireflies.

**Standout candidates (proposed):**

- **`handoff`** (entry 9): "describe state, not actions", a *Traps & Dead Ends* section and a closing "verify every claim against the code" instruction. Three concrete upgrades for the fork's thinner `handoff`.
- **`goal-loop`'s 4-part contract** (entry 10): objective / constraints / validation command / verifiable stop condition, plus "forbid reward-hacking" and "never pre-approve ADRs". A tight brief format for AFK runs and for the owner's own ticket briefs.
- **The command guard** (entry 2): a fail-open `PreToolUse` deny-list with a ~150-case test harness covering both block and allow cases, wired for 9 agents. A much better model for an always-on safety hook than the fork's `git-guardrails-claude-code` (which blocks every `git push`).
- **`risky-changes`** (entry 11): research and 10-20 live measured cases before changing APIs, pricing, defaults or provider parameters, saved to `docs/evals/`. A sharp, short discipline for the owner's web and API work.
- **`total-review` / `gpt-review`** (entry 13): neutral, unsteered cross-model review briefs, then a merge that says "Agreement alone does not prove an issue is real". Pairs with Addy's `doubt-driven-development` cross-model step.
- **`effective-agent-skills`** (entry 6): a compact authoring guide. Its two concrete gotchas (colon-space in unquoted descriptions breaks strict YAML parsers; `disable-model-invocation` is not in the core spec, Codex needs `openai.yaml`) are worth one line each in the fork's `writing-for-agents`.

**Biggest open questions:**

1. **Is any "micro-prompt" skill worth a slot?** A third of `thinking-and-docs` are 2-6 line prompts (`decisions`, `stop-overthinking`, `remind`, `file-tree`, `rename`, `keep-track`). User-invoked they cost nothing idle, but each is one more name to remember. Are they better as owner-typed snippets than as skills (entry 15)?
2. **Cross-model review on the owner's machine.** `gpt-review` assumes a review harness (bb) and named models. Codex is installed locally ([loading-mechanics](../loading-mechanics.md)), so a `codex exec --sandbox read-only` reviewer is feasible. One theme should decide this together with Addy's `doubt-driven-development` and pstack's `interrogate`/`arena`.
3. **A global steering file.** The source's [`AGENTS.md`][agents-md] is a ~1.7k-token always-on file (inference: 6.2 KB / ~3.7 chars per token) mixing tone, git, DB, ADR and secrets rules. Which of its rules, if any, earn a line in the owner's always-on text (ticket #14)?
4. **Speed vs care.** The source repeatedly pushes speed ("avoid overthinking at all cost", [AGENTS.md L98-L107][agents-md-speed]; `stop-overthinking`; `before-building` "from the gut"). The fork leans the other way (`grilling`, `wayfinder`). Borrowing any of these needs a stance on which default the owner wants.

### Recurring blockers to direct copying

| Blocker | Evidence | Effect |
|---|---|---|
| Sanitized placeholders and missing dependencies | `<chat-system>`, `<chat-cli>`, `<reset-script>` in [`reset-cursor-acp`][reset-acp]; `<skills-repo>`, `OWNER/PRIVATE_REPO` in [`push-skills`][push-skills]. Skills named but not published: `research-prompt` (from `deep-research`), `publish-skill`, `youtube-transcript`, `bb-plugin-authoring`, `submit-a-plugin`, `cursor-cli`, a "secrets skill" (grep) | Some skills don't run as published; copying means filling holes |
| macOS only | `launchctl`, `pbcopy`, `caffeinate`, Homebrew in 12 `SKILL.md` files (grep) | Owner is on Windows; those skills need rewriting or don't apply |
| Pinned model names | `gpt-5.6-sol` ([codex-subagent L46][codex-sub]), "GPT-6 Astra" ([gpt-review][gpt-review]), "Fable 5.1 Extra High" ([fable-review][fable-review]) vs "Fable 5 Max 1M" ([total-review][total-review]) | Rots fast, and contradicts the repo's own "Don't include time-sensitive information" ([effective-agent-skills L217][eas-time]) |
| Author-specific stack | bb, Cloudroom, cmux, Herdr, Boat, DeepAPI, Fireflies, Grok Bots | ~20 skills are tool wrappers for tools the owner doesn't use (entry 25) |
| Nonstandard `triggers: [user, model]` frontmatter | On 20 skills, including user-invoked ones (grep). Neither Claude Code nor Codex documents a `triggers` key ([loading-mechanics §1](../loading-mechanics.md)) | Inference: inert in both harnesses (perhaps read by bb). Drop it when copying |

### Index: every skill to its entry

| Entry | Skills / mechanisms |
|---|---|
| 1 | global `AGENTS.md` |
| 2 | `hooks/deny-dangerous.sh`, `hooks/test-guard.sh`, `global-agent-guardrails` |
| 3 | dual gating convention, `triggers:` field |
| 4 | category layout + sanitized mirror, `push-skills` |
| 5 | cross-agent distribution, `distribute-skill-to-all-agents` |
| 6 | `effective-agent-skills` |
| 7 | DeepAPI managed-skill updater (`deepapi` VERSION/MANIFEST) |
| 8 | `deepapi`, `deep-research`, `deep-scrape`, `varied-search`, `who-is-this`, `online-shopping` |
| 9 | `handoff` |
| 10 | `goal-loop` |
| 11 | `risky-changes` |
| 12 | `codex-subagent` |
| 13 | `gpt-review`, `fable-review`, `total-review` |
| 14 | `git-worktree` |
| 15 | `decisions`, `stop-overthinking`, `remind`, `file-tree`, `rename`, `keep-track`, `read-all-adrs` |
| 16 | `ask-then-build` |
| 17 | `before-building` |
| 18 | `adr-verbatim` |
| 19 | `teach` |
| 20 | `setup-help` |
| 21 | `prompt-for-others` |
| 22 | `larp-detector` |
| 23 | `github-outside-sandbox` |
| 24 | `create-readonly-db-role`, `openrouter` |
| 25 | `bb-cli`, `bb-plugins`, `nagent`, `self-archive`, `reset-cursor-acp`, `herdr`, `cmux`, `boat`, `cua-driver`, `new-grok-bot`, `fable-safe-prompt`, `anti-sleep`, `persistent-localhost`, `repo-sync`, `rename-process`, `browser-harness`, `browser-use` |
| 26 | `signal-from-expert`, `domain-checker`, `fireflies-transcript`, `image-prompt`, `save-idea` |

---

## Mechanisms

### 1. Global `AGENTS.md`

- **What it is.** The author's user-global steering file, published at the repo root ([`AGENTS.md`][agents-md]). Sections: RESPONSES (concise, plain English, "the User cannot see tool outputs"), BEHAVIOR (no multi-choice UI, never Plan Mode, no new dependencies without approval), CODE QUALITY, BUG FIXES ("start with reproducing the bug in an E2E setting"; "Do not delete, skip, weaken, or narrow tests", [L28-L33][agents-md-bug]), DOCUMENTATION (nested `AGENTS.md` per important subfolder), ADRs (agent reminds, never writes, [L46-L57][agents-md-adr]), DATABASE (never touch prod; every change as a `.sql` in `docs/database/`), OTHER CONTRIBUTORS (never revert others' changes; "NEVER EVER auto-add your agent name as co-author", [L71][agents-md-coauthor]), SECRETS, FINAL SELF-REVIEW, PROJECT BASICS (every project has `.agents/` and `.claude/skills/` as "an exact symlink to `.agents/skills/`", [L95][agents-md-basics]), SPEED, SIMPLICITY, FORBIDDEN.
- **Kind**: convention doc (always-on).
- **Proposed address**: idea-only input to ticket #14 (always-on).
- **Why it could fit.** Several rules are cheap, general and stack-neutral: "do not weaken tests to pass", "check the diff before declaring done", "if unrelated changes appear, assume other actors made them", "never commit `.env`". The PROJECT BASICS symlink rule is the same dual `.claude/skills` + `.agents/skills` layout the owner's install direction targets (map Notes).
- **Why it might not.** About 1.7k tokens always-on (inference: 6.2 KB). Several rules fight the owner's setup or the harness: "never suggest Plan Mode", "DO NOT use the multi-choice question UI", the co-author ban (the owner's harness attaches a `Co-Authored-By` line by design), and SPEED ("avoid overthinking at all cost") pulls against the fork's `grilling`. Its tone ("other agents are workign on other shit") is personal.
- **Copy / adapt / idea-only**: idea-only. Copying would import someone else's preferences wholesale. Distil 3-5 candidate one-liners for #14.
- **Overlap**: karpathy-skills' "surgical changes" ([installed-plugins ledger](installed-plugins.md)); superpowers `verification-before-completion` ([superpowers ledger](superpowers.md) entry 12); fork `domain-modeling` (ADRs).
- **Idle context cost**: ~1.7k tokens if adopted whole (inference). One-liners ~20-40 each.
- **Recommendation (proposed)**: don't adopt. Carry "never weaken tests to pass", "check the diff before done", and "don't revert changes you didn't make" as candidate one-liners into #14.

### 2. Command guard: `deny-dangerous.sh` + `test-guard.sh` + `global-agent-guardrails`

- **What it is.** A shared `PreToolUse` hook script ([`deny-dangerous.sh`][hook-deny]) that reads the hook JSON, extracts the command from `.tool_input.command` (Claude/Codex), `.toolInput.command` (Grok) or `.command` (Cursor), and blocks with exit 2 plus a stderr reason (or deny JSON in Cursor mode) when any line of `~/.agents/hooks/dangerous-patterns.txt` matches as ERE. It **fails open** without `jq` or without the patterns file ([L26-L34][hook-deny-failopen]). [`test-guard.sh`][hook-test] runs ~150 block and allow cases through both payload shapes: `rm -rf ~` blocked but `rm -rf node_modules` allowed, `git push --force` blocked but `--force-with-lease` allowed, password-manager CLIs blocked, `git commit -m "rm -rf mention"` allowed. The skill [`global-agent-guardrails`][guardrails] is the operating manual: a per-agent wiring table for 9 agents, the rule "Block only catastrophic commands … avoid over-blocking" ([L42][guardrails-scope]), "This guards against accidents, not malicious agents" ([L8][guardrails]), the Codex gotcha that hook trust is hash-pinned and an edited hook entry is silently skipped until re-trusted ([L76][guardrails-codex]), a known false-positive class ([L83][guardrails-fp]), and a safe E2E probe (`git push --force` from a non-git directory, [L88][guardrails-probe]).
- **Kind**: hook + script (test harness) + skill (operating manual).
- **Proposed address**: the hook as **core always-on** (a hook definition costs no context; only output is paid, [loading-mechanics §4](../loading-mechanics.md)); the skill as idea-only.
- **Why it could fit.** It is the best-tested always-on safety piece read so far. The block/allow test pairs are exactly what keeps a regex guard from over-blocking. One script serves Claude Code and Codex, the owner's two harnesses. It prints nothing when it allows, so idle cost is zero.
- **Why it might not.** Bash + `jq` on a Windows-first machine. The hook runs in Git Bash only if the harness launches it that way (inference; not checked). The patterns file is unpublished, so the actual deny-list must be rebuilt from the test cases. The `/opt/homebrew` `PATH` line is macOS. Fail-open is a deliberate trade-off the owner should accept knowingly.
- **Copy / adapt / idea-only**: adapt. Rebuild `dangerous-patterns.txt` from the test cases, drop the Cursor/Grok/Hermes/Pi/Droid branches, port to PowerShell or make the bash path explicit, and keep `test-guard.sh` as the CI check for the patterns. Keep the "catastrophic only" scope rule as the design principle.
- **Overlap**: fork `git-guardrails-claude-code` ([fork ledger](mattpocock-skills-unity.md)), which blocks all `git push` and has no allow tests. This source answers most of that entry's "why it might not" points.
- **Idle context cost**: 0 as a hook. `global-agent-guardrails` would be ~81 tokens model-invoked.
- **Recommendation (proposed)**: adapt the hook + test harness as the core always-on command guard, replacing the fork's `git-guardrails-claude-code` idea. Decide in the always-on theme (#14).

### 3. Dual gating convention (`disable-model-invocation` + `agents/openai.yaml`) and the `triggers:` field

- **What it is.** 26 user-invoked skills set both Claude's `disable-model-invocation: true` and Codex's `policy.allow_implicit_invocation: false`. [`effective-agent-skills` L85-L95][eas-gating] documents why: the flag "is **not** part of the core Agent Skills specification", and Codex needs the separate file. Gaps: `file-tree` and `rename` have the Claude flag but no `openai.yaml`, and `online-shopping` explicitly forbids adding either ("Auto-invoke for online purchases", [L8][shopping]). Separately, 20 skills carry `triggers: [user, model]`, including user-invoked ones such as `before-building`, whose description also says "Fire the moment the user proposes a build" ([before-building][before-building]).
- **Kind**: manifest-packaging convention.
- **Proposed address**: idea-only for the collection's maintenance machinery (#17).
- **Why it could fit.** Confirms the fork's own convention ([fork ledger](mattpocock-skills-unity.md), `agents/openai.yaml` entry) from an independent source. The two missing `openai.yaml` files show the drift such a convention suffers without a check.
- **Why it might not.** Nothing new beyond the fork's practice. The `triggers` key is undocumented in both harnesses (inference: inert), and its `model` value contradicts the Claude flag on the same skill.
- **Copy / adapt / idea-only**: idea-only. The lesson is a lint: "every skill with `disable-model-invocation: true` has a matching `openai.yaml`", and "no description promises model firing on a user-invoked skill".
- **Overlap**: fork `agents/openai.yaml` convention; Addy's lint, which *forbids* `disable-model-invocation` ([addy ledger](addy-agent-skills.md) entry 8).
- **Idle context cost**: n/a.
- **Recommendation (proposed)**: add the gating-parity lint to #17's checks.

### 4. Category layout, sanitized mirror, and `push-skills`

- **What it is.** Skills sit in five category folders ([README][readme]). The private repo is canonical. [`push-skills`][push-skills] pushes private `main`, which triggers a workflow that sanitizes and mirrors to this public repo. The skill then verifies the publication run and reads the published file back ("green CI and file existence do not prove correctness"). It isolates unrelated local work in a temporary worktree and uses `git commit --only` with explicit paths.
- **Kind**: manifest-packaging (publishing pipeline) + skill.
- **Proposed address**: idea-only, for the "publishable split boundaries" item on the map.
- **Why it could fit.** The owner may publish packs or the fork as separate repos (map, "Not yet specified"). A private-canonical / public-sanitized mirror is one way to keep personal paths and secrets out of a published copy. The "verify the published file, not the CI badge" rule is good practice.
- **Why it might not.** The sanitizer itself is not published (`<skills-repo>/tools/`, [push-skills][push-skills]), so only the shape is visible. The sanitized output leaks its own seams: placeholders and references to unpublished skills (Recurring blockers). The skill is specific to the author's repos.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: vendoring research ([`vendoring.md`](../vendoring.md)) on how sources are tracked; fork `pr`.
- **Idle context cost**: `push-skills` 0 (user-invoked); ~58 if model-invoked.
- **Recommendation (proposed)**: reject the skill; note "private canonical, sanitized public mirror, verify the published file" as one option for the split-boundaries decision.

### 5. Cross-agent distribution and `distribute-skill-to-all-agents`

- **What it is.** [`distribute-skill-to-all-agents`][distribute] makes `~/.agents/skills/` canonical, symlinks `~/.claude/skills` and `~/.pi/agent/skills` to it as whole directories, copies into Hermes, and symlinks per skill into `~/.cursor/skills`. It verifies matching byte counts at all five locations.
- **Kind**: skill + install convention.
- **Proposed address**: idea-only input to the install-architecture ticket.
- **Why it could fit.** The owner has the same two-root problem: Claude doesn't read `~/.agents/skills` ([loading-mechanics §2](../loading-mechanics.md)), and the fork is already symlinked into both roots (map Notes). "Make one root canonical, link the other" is the minimal fix, and the byte-count check is a cheap verification.
- **Why it might not.** Pi, Hermes and Cursor are out of scope for the owner (map: "Other agents are a future consideration only"). A whole-directory symlink of `~/.claude/skills` would collide with the owner's per-skill symlinks and with plugins. The owner's direction is per-project installs plus user-scope plugins, which this doesn't cover.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: the owner's `Hissal/agent-skills-sync-unity` (map Notes); [vendoring](../vendoring.md).
- **Idle context cost**: ~75 tokens as published (model-invoked).
- **Recommendation (proposed)**: reject the skill; carry the "one canonical root + verify" idea into the install ticket.

### 6. `effective-agent-skills`

- **What it is.** A 294-line authoring guide ([`SKILL.md`][eas]): progressive disclosure levels; a frontmatter section with two concrete gotchas (an unquoted `description` containing `: ` is rejected by strict YAML parsers such as Pi's though Claude Code accepts it, [L81][eas-colon]; dual gating, [L85-L95][eas-gating]); "capability primitives vs process primitives" ([L100-L115][eas-patterns]); description guidance ("[Capability]. Use when [specific tasks]"); anti-patterns ("Don't write style-only variants", [L211][eas-style]); an authoring workflow with triggering tests on realistic requests and near-misses ([L235][eas-trigger]) and "test against the weakest model you'll deploy on" ([L248][eas-weak]); a security checklist for third-party skills ([L264][eas-security]); a ship checklist.
- **Kind**: skill (convention doc).
- **Proposed address**: ideas into fork `writing-for-agents` (core model-invoked).
- **Why it could fit.** Short and agent-neutral. The colon-space and dual-gating notes are concrete failure modes for a collection that targets both Claude and Codex. The third-party security checklist matches this map's "no blind picks" stance.
- **Why it might not.** Most of it restates the agentskills.io guidance and Anthropic's skill-creator (already on the owner's machine, [anthropic-skills ledger](anthropic-skills.md)). "~100 tokens per skill" for Level 1 is higher than the ~60 average the owner measured ([loading-mechanics](../loading-mechanics.md)). As a second authoring skill it would compete with `writing-for-agents`.
- **Copy / adapt / idea-only**: idea-only. Merge the colon-space gotcha, the gating-parity note and the security checklist into `writing-for-agents`.
- **Overlap**: fork `writing-for-agents`; superpowers `writing-skills` ([superpowers ledger](superpowers.md) entry 17); anthropic `skill-creator` ([anthropic-skills ledger](anthropic-skills.md) entries 1, 10).
- **Idle context cost**: ~66 tokens as published.
- **Recommendation (proposed)**: reject as a skill; merge the three items above in the skill-writing theme.

### 7. DeepAPI managed-skill updater

- **What it is.** `deepapi` is a vendor-managed skill: its frontmatter carries `version` and `fingerprint` ([SKILL.md][deepapi]); [`VERSION.txt`][deepapi-version] and a hash [`MANIFEST.txt`][deepapi-manifest] list the managed files. Every request sends an `X-DeepAPI-Skill-Version` header. "Once per day, at the first DeepAPI use", the agent is told to launch a local updater script as a detached background job ([L86][deepapi-update]).
- **Kind**: manifest-packaging (self-updating skill).
- **Proposed address**: idea-only (anti-pattern reference for #17 and the vendoring ticket).
- **Why it could fit.** The hash manifest is a clean way to detect local edits to a vendored skill, the problem [vendoring](../vendoring.md) addresses with stored baselines.
- **Why it might not.** A skill that instructs the agent to run a background updater means the skill text can change underneath the collection with no review. That conflicts with "pin every source" and with this map's no-blind-picks rule.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: [vendoring](../vendoring.md) (skills.sh update overwrites edits; copy-with-provenance + baseline).
- **Idle context cost**: n/a (see entry 8).
- **Recommendation (proposed)**: reject the mechanism; note the hash-manifest idea for #17's drift detection.

---

## Skills

### 8. The DeepAPI family: `deepapi`, `deep-research`, `deep-scrape`, `varied-search`, `who-is-this`, `online-shopping`

- **What it is.** Six skills built on the author's DeepAPI service (a paid search/scrape/research API, [README][readme] "Most are powered by DeepAPI"). [`deepapi`][deepapi] is the router: its description tells the agent to use DeepAPI "for all web search … instead of built-in search, research, fetch, or browser tools" ([L3][deepapi]), with a 20-row endpoint table and a polling/idempotency/402 protocol. [`deep-research`][deep-research] (user-invoked) wraps `POST /v1/research/deep`; [`deep-scrape`][deep-scrape] builds sourced JSON dossiers with a careful "covered / incomplete / missing per requested area" checklist and idempotent recovery; [`varied-search`][varied-search] is a 2-line "5 web + 5 GitHub + 5 X searches" prompt; [`who-is-this`][who-is-this] (user-invoked) gives a 100-word credibility verdict on a person; [`online-shopping`][shopping] does price/shop-trust research scaled to price tier, plus a business VAT reminder.
- **Kind**: skills.
- **Proposed address**: none.
- **Why it could fit.** Two transferable ideas: `deep-scrape`'s per-area coverage checklist ("a URL alone is not coverage", "Empty sections mean no information returned, not proof of absence") is a good evidence-reporting rule for any research skill; its "never use a new idempotency key to recover an uncertain submission" is good API hygiene.
- **Why it might not.** All need a paid DeepAPI account the owner doesn't have. `deepapi`'s description actively steers the agent away from the harness's own search and fetch, which would change behaviour in every session. `who-is-this` compiles a person's profile across platforms; `online-shopping` is a consumer task.
- **Copy / adapt / idea-only**: idea-only. Service-bound.
- **Overlap**: fork `research` (primary-source write-ups); the host's `deep-research` skill (in this session's listing).
- **Idle context cost**: as published ~195 (`deepapi`) + 82 (`deep-scrape`) + 86 (`varied-search`) + 58 (`online-shopping`) ≈ 420 tokens; the two user-invoked ones 0.
- **Recommendation (proposed)**: reject all six. Carry the coverage-checklist rule into the fork `research` skill if the research theme wants it.

### 9. `handoff`

- **What it is.** Captures session context for a fresh agent ([`SKILL.md`][handoff]). Six principles, including "**Describe state.** Write 'Auth is implemented; logout is not started,' not 'Implement logout next'" ([L14][handoff]), "Preserve why", "Require verification". A fixed 7-section template: Goal; Why; Current State (DONE / PARTIAL / NOT STARTED); Key Decisions (and why); **Traps & Dead Ends** ([L54][handoff-traps]); Relevant Files with line ranges; Open Work as status with dependencies. It ends with a fixed closing prompt: read every listed file, "Treat every claim in this handoff as context to verify against the code", then wait ([L74-L80][handoff-close]). It saves to the OS temp dir ([L84][handoff-save]) and updates a prior handoff rather than starting over.
- **Kind**: skill.
- **Proposed address**: ideas into fork `handoff` (core user-invoked).
- **Why it could fit.** The fork's `handoff` is 11 lines with no template ([fork ledger](mattpocock-skills-unity.md)). The state-not-actions rule stops a handoff from smuggling in a plan the next agent follows blindly. *Traps & Dead Ends* is exactly what code can't tell the next session. Handoffs are frequent for the owner's AFK workflow (inference from the wayfinder/ticket flow).
- **Why it might not.** The fork's version has a "suggested skills" section this one lacks. A rigid 7-section template can bloat short handoffs (the skill says to mark empty sections `None`). The "wait for my instructions" closing line suits interactive pickup, not AFK pickup.
- **Copy / adapt / idea-only**: adapt into the fork's `handoff`: add state-not-actions, Traps & Dead Ends, and the verify-claims closing line; keep the fork's suggested-skills section.
- **Overlap**: fork `handoff`, `claude-handoff` (in-progress); pstack continuity playbooks ([pstack ledger](pstack.md) entry 35).
- **Idle context cost**: 0 (user-invoked); ~61 if model-invoked.
- **Recommendation (proposed)**: adapt: merge the three ideas into the fork `handoff`.

### 10. `goal-loop`

- **What it is.** Drafting `/goal` prompts for persistent agent loops ("Ralph loop") ([`SKILL.md`][goal-loop]). Every goal needs a **4-part contract**: objective, constraints, validation command, verifiable stop condition ([L31-L36][goal-loop-contract]), rendered as a 6-line Markdown block with two worked examples (migration, coverage lift). Writing rules include "Never instruct the agent to create new ADRs" and "Forbid reward-hacking: 'Do not delete, skip, weaken, or narrow tests to make the goal pass'" ([L79-L80][goal-loop-rules]). It lists good fits (migrations, coverage lifts, deploy retry loops) and bad fits (exploratory work, prod credentials), plus a drift playbook that undoes only the run's own changes, never a blanket reset.
- **Kind**: skill.
- **Proposed address**: core user-invoked, or the contract folded into the fork's AFK brief format.
- **Why it could fit.** The owner runs AFK agents on tickets (this map). A verifiable stop condition plus an explicit validation command is the piece most AFK briefs lack. For Unity, the validation command could be the fork's `unity-verification` ladder (inference).
- **Why it might not.** It is model-invoked as published with a broad description ("autonomous run setup, monitoring"). It defers runtime details to "check goal support in the installed agent"; whether the owner's Claude Code and Codex versions have a `/goal` command was not checked. It overlaps the fork's `to-tickets`/`implement` acceptance criteria.
- **Copy / adapt / idea-only**: adapt. Keep the contract, fit/bad-fit lists and writing rules; make it user-invoked; drop runtime-specific notes (cmux, `create_goal`).
- **Overlap**: fork `to-spec`, `to-tickets`, `implement`, `in-progress/loop-me` ([fork ledger](mattpocock-skills-unity.md)); pstack "Autonomous run" playbook ([pstack ledger](pstack.md) entry 35).
- **Idle context cost**: ~58 tokens as published; 0 user-invoked.
- **Recommendation (proposed)**: adapt the contract as core user-invoked, or merge it into the ticket-brief format, in the workflow theme (#15).

### 11. `risky-changes`

- **What it is.** A five-step gate for changes "where being wrong is expensive or customer-visible": public API fields, dropping or transforming upstream data, billing and quotas, defaults and provider parameters ([`SKILL.md`][risky]). It opens with an incident: "A filter once passed every test but disabled ~99% of the feature on live data" ([L8][risky]). Steps: list assumptions with evidence status; research; run "10–20+ realistic cases against the real endpoint" with numbers ([L38][risky-measure]); save them to `docs/evals/YYYY-MM-DD-….md` ("Without this record, the change is not verified", [L46][risky-evals]); get product-owner approval; re-measure on real traffic "Within one day" ([L54][risky-post]).
- **Kind**: skill.
- **Proposed address**: web pack model-invoked, or core user-invoked.
- **Why it could fit.** Short (54 lines), concrete, and fills a gap: none of the fork's skills measure a change against live data. It suits the owner's web-app and API work. "Tests check correctness; measurement checks usefulness" also applies to Unity tuning and balance changes (inference).
- **Why it might not.** Assumes a production service with real traffic; much of the owner's work (Unity, C# libraries) has none. The model-invoked description (~105 tokens) is broad ("large or risky changes").
- **Copy / adapt / idea-only**: adapt. Tighten the description to its API/data/pricing triggers; replace "product owner" with "the owner" for a solo dev.
- **Overlap**: pstack `blast-radius`, `benchmark-checklist` ([pstack ledger](pstack.md) entries 8, 9); gamedev `evaluating-gameplay-balance` ([gamedev ledger](gamedev-repos.md) A2); Addy `deprecation-and-migration` ([addy ledger](addy-agent-skills.md) entry 26).
- **Idle context cost**: ~105 tokens as published.
- **Recommendation (proposed)**: adapt into the web pack; decide against `blast-radius` in one theme.

### 12. `codex-subagent`

- **What it is.** Launching Codex CLI non-interactively as a subagent with ChatGPT-subscription auth ([`SKILL.md`][codex-sub]): preflight (`codex login status`), a full `codex exec … --sandbox workspace-write --output-last-message` template, "`</dev/null` is MANDATORY when stdin is not a real terminal" ([L49][codex-sub-stdin]), resume, one worktree per parallel run, failure modes, "NEVER use `--dangerously-bypass-approvals-and-sandbox`" ([L93][codex-sub-never]), and "Review Codex's diff yourself" ([L98][codex-sub-review]).
- **Kind**: skill.
- **Proposed address**: core user-invoked.
- **Why it could fit.** Codex is installed on the owner's machine ([loading-mechanics](../loading-mechanics.md)), so delegating a self-contained task to a different model family from Claude Code is cheap. The stdin hang and the read-own-diff rule are real operational traps.
- **Why it might not.** Pins a model (`gpt-5.6-sol`) and reasoning flags; uses `/tmp` and `mktemp` paths (bash on macOS/Linux). Overlaps Addy's `doubt-driven-development` cross-model step, which the [addy ledger](addy-agent-skills.md) proposed pre-writing for Windows.
- **Copy / adapt / idea-only**: adapt. Drop the pinned model, make paths Windows-safe, keep the preflight, stdin rule, read-only option for reviews and the diff review.
- **Overlap**: Addy `doubt-driven-development` (entry 28); pstack `interrogate`/`arena` (model diversity, [pstack ledger](pstack.md) open question 2); entry 13 here.
- **Idle context cost**: 0 (user-invoked); ~98 if model-invoked.
- **Recommendation (proposed)**: adapt as the one shared "call Codex from Claude" recipe that entry 13 and Addy's doubt step reuse. Decide in the cross-model theme.

### 13. `gpt-review`, `fable-review`, `total-review`

- **What it is.** Two near-identical reviewer launchers and a combiner. [`gpt-review`][gpt-review] and [`fable-review`][fable-review] launch an independent review on a named model through a review harness. The brief is neutral: "without steering toward suspected bugs, solutions, or verdicts", review only, plain-English report that separates verified findings from uncertainty ([gpt-review L20][gpt-review-brief]). They return the reviewer's response verbatim and "never silently downgrade" an unavailable model ([L16][gpt-review-downgrade]). [`total-review`][total-review] runs both in parallel as bb threads, then merges: deduplicate, judge each finding ("Agreement alone does not prove an issue is real", [L22][total-review-agree]), mark `[both]`/`[fable]`/`[gpt]`, report how many were dropped, ask for approval, then fix, commit and push ([L31][total-review-ship]).
- **Kind**: skills.
- **Proposed address**: one core user-invoked skill (cross-model review), adapted.
- **Why it could fit.** The neutral-brief rules and the merge discipline are the valuable part, and they are stack-neutral. Running the fork's `code-review` through Claude and a Codex reviewer side by side (via entry 12) would give the owner model diversity without bb.
- **Why it might not.** Depends on bb and named, already-dated models (Fable 5.1 vs Fable 5 Max between files). `total-review`'s auto-push after approval conflicts with the owner's commit conventions and the harness's own git rules. Three skills where one would do.
- **Copy / adapt / idea-only**: adapt. Merge into one user-invoked skill: neutral brief + Codex reviewer via entry 12 + the merge/triage rules; drop the push step.
- **Overlap**: fork `code-review`; Addy `doubt-driven-development`; superpowers `requesting-code-review` / `receiving-code-review` ([superpowers ledger](superpowers.md) entries 13, 14); pstack `arena`.
- **Idle context cost**: 0 (all user-invoked); ~50-58 each if model-invoked.
- **Recommendation (proposed)**: adapt the brief and merge rules into one cross-model review skill, decided together with entry 12 and Addy's doubt step.

### 14. `git-worktree`

- **What it is.** Worktree discipline for parallel agents ([`SKILL.md`][worktree]): detect primary checkout vs worktree with `--git-dir` vs `--git-common-dir`; "One task = one worktree = one agent session" ([L26][worktree-one]); a six-item bootstrap checklist for a fresh worktree (copy, never symlink, `.env`; install deps locally, never symlink `node_modules`; pin shared Docker Compose project names; ports; generated files; shared git hooks) ([L50-L55][worktree-setup]); Cursor-specific commands.
- **Kind**: skill.
- **Proposed address**: idea-only.
- **Why it could fit.** The bootstrap checklist is better than most: "a fresh worktree contains tracked files only" is the trap that breaks web projects in worktrees.
- **Why it might not.** For Unity a fresh worktree means a fresh `Library/` and a full reimport (the [superpowers ledger](superpowers.md) entry 11 already rejected isolation-by-default for this reason). Claude Code has a native worktree tool. Half the skill is Cursor commands.
- **Copy / adapt / idea-only**: idea-only. The bootstrap checklist could become a short section in the fork's `implement-spec` or a web-pack note.
- **Overlap**: superpowers `using-git-worktrees` (proposed reject); fork `implement-spec`, `unity` (parallel worktrees in Unity); pstack worktree cleanup ([pstack ledger](pstack.md) entry 36).
- **Idle context cost**: 0 (user-invoked); ~61 if model-invoked.
- **Recommendation (proposed)**: reject the skill; offer the bootstrap checklist to whichever skill owns worktrees.

### 15. Micro-prompt skills: `decisions`, `stop-overthinking`, `remind`, `file-tree`, `rename`, `keep-track`, `read-all-adrs`

- **What it is.** Seven skills of 2-6 lines each, all a single prompt the user would otherwise type:

| Skill | Prompt in brief | Gate | Cost if model-invoked |
|---|---|---|---|
| [`decisions`][decisions] | "which important decisions … are you not confident about?"; list only the unsure ones | user | ~59 |
| [`stop-overthinking`][stop-overthinking] | name critical issues or say proceed; next steps; "think like a practical entrepreneur" | user | ~62 |
| [`remind`][remind] | TLDR of the conversation (repeat the first user prompt), then the last answer shorter | user | ~66 |
| [`file-tree`][file-tree] | high-level file tree of the current topic in a code block | user (no `openai.yaml`) | ~59 |
| [`rename`][rename] | rename the thread to 2-5 lowercase words | user (no `openai.yaml`) | ~77 |
| [`keep-track`][keep-track] | a `---` separator plus a running list of open topics in every reply; only add items on approval | **model** | ~54 (paid) |
| [`read-all-adrs`][read-all-adrs] | read every file in `docs/adr/` in full (body contains a profane emphasis line and a `TODO(David)`) | user | ~63 |

- **Kind**: skills.
- **Proposed address**: `decisions` as core user-invoked (candidate); the rest none.
- **Why it could fit.** `decisions` is a cheap, useful end-of-task check: it asks the agent to surface low-confidence choices, which complements the fork's `grilling` (before) and `code-review` (after). `keep-track` is a sensible pattern for long HITL sessions such as this map's theme sessions.
- **Why it might not.** Each is a one-line prompt; as skills they add names to the `/` menu for little gain. `keep-track` is model-invoked and changes every later reply. `rename` depends on a harness that lets the agent rename threads. `read-all-adrs` is superseded by the fork's ADR conventions.
- **Copy / adapt / idea-only**: `decisions`: copy with a cleaner body. The rest: idea-only (owner snippets, not skills).
- **Overlap**: fork `grilling`, `wait-what` (productivity), `domain-modeling` (ADRs); pstack `reflect` ([pstack ledger](pstack.md) entry 15).
- **Idle context cost**: 0 for the user-invoked six; `keep-track` ~54 as published.
- **Recommendation (proposed)**: owner's call on `decisions` as a core user-invoked micro-skill; reject the others.

### 16. `ask-then-build`

- **What it is.** Two phases ([`SKILL.md`][ask-then-build]): ask 3-6 non-obvious questions *one at a time*, each with options A-D and "My pick: A. One-line reason", recording each answer in the repo's docs immediately; then output a single-paragraph build prompt for another agent (read-first files, numbered steps, validation, "don't commit, report back"). It insists on a blank line between options because "Markdown renderers … collapse single newlines".
- **Kind**: skill.
- **Proposed address**: none (ideas into fork `grilling`).
- **Why it could fit.** "Options plus my pick plus one-line reason" is a good question format, and "record the decision immediately" matches the fork's ADR habit.
- **Why it might not.** Duplicates the fork's `grilling` → `to-spec` flow in a lighter form. Model-invoked as published.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `grilling`, `grill-with-docs`, `to-spec`; superpowers `brainstorming` ([superpowers ledger](superpowers.md) entry 3).
- **Idle context cost**: ~81 tokens as published.
- **Recommendation (proposed)**: reject; the "my pick + reason" format is a possible line in `grilling`.

### 17. `before-building`

- **What it is.** A 6-line prompt ([`SKILL.md`][before-building]): answer instantly "from the gut", using no tools, with the 1-3 consequential choices hidden in the user's build idea and a recommendation for each. Classics: one-off vs repeated, few lines vs proper module, biggest thing it could break.
- **Kind**: skill.
- **Proposed address**: none.
- **Why it could fit.** A cheap pre-flight that catches the "one-off vs reusable" decision before code exists.
- **Why it might not.** The description says "Fire the moment the user proposes a build" but the skill is user-invoked, and the `triggers: [user, model]` field contradicts the flag. "Do NOT read files" makes the answer uninformed by the codebase. It overlaps `grilling`.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `grilling`; entry 16.
- **Idle context cost**: 0 (user-invoked); ~65 if model-invoked.
- **Recommendation (proposed)**: reject.

### 18. `adr-verbatim`

- **What it is.** Write a short ADR that keeps the user's decision without conversational noise ([`SKILL.md`][adr-verbatim]): find the project's ADR location and next number, strip filler, "Remove invented requirements and unapproved agent suggestions", format `Status: accepted (user, YYYY-MM-DD)` plus the decision, and "Do not add speculative rationale, alternatives, consequences".
- **Kind**: skill.
- **Proposed address**: idea-only into fork `domain-modeling`.
- **Why it could fit.** "Check every statement against the user's decision; remove unapproved agent suggestions" is a useful guard for agent-written ADRs.
- **Why it might not.** The fork's `domain-modeling` already owns ADRs, with a format that records context and consequences, which this skill forbids. Model-invoked as published.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `domain-modeling`; Addy `documentation-and-adrs` ([addy ledger](addy-agent-skills.md) entry 27).
- **Idle context cost**: ~80 tokens as published.
- **Recommendation (proposed)**: reject; offer the "no unapproved agent suggestions" line to `domain-modeling`.

### 19. `teach`

- **What it is.** Matt Pocock's `teach` ([`SKILL.md`][teach], credited at the end), modified: it adds a "Be Very Concise" section and a Stanford "Feedback Principle" paragraph, and drops the fork's `./assets/` reusable-components section (diff against fork `skills/productivity/teach/SKILL.md`).
- **Kind**: skill.
- **Proposed address**: none (the fork owns it).
- **Why it could fit.** The concise-chat rule ("Lengthy explanations belong in lessons, not the conversation") is a reasonable tweak.
- **Why it might not.** A fork of a skill the fork already has, minus the assets section. The Feedback Principle cites an unnamed Stanford study with no source.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `teach`; pstack `teach` ([pstack ledger](pstack.md) entry 6).
- **Idle context cost**: 0 (user-invoked).
- **Recommendation (proposed)**: reject; optionally add the concise-chat line to the fork's `teach`.

### 20. `setup-help`

- **What it is.** A response format for walking the user through any setup ([`SKILL.md`][setup-help]): one coherent current step (1-4 lines with every value needed), a divider, then "Still remaining" as headline-only items, never more than 8, with later steps merged into phases. Before every reply, audit the list against an internal canonical checklist.
- **Kind**: skill.
- **Proposed address**: none (owner's call).
- **Why it could fit.** A good answer shape for human-only steps (dashboards, credentials). The 8-item cap and the audit rule keep it honest.
- **Why it might not.** The fork's `wizard` already generates an interactive script for exactly these steps, which is stronger when the steps are repeatable.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `wizard`; entry 15's `keep-track`.
- **Idle context cost**: 0 (user-invoked); ~47 if model-invoked.
- **Recommendation (proposed)**: reject; mention the "current step + ≤8 remaining" shape to `wizard` as a fallback for one-off setups.

### 21. `prompt-for-others`

- **What it is.** Writes one copy-safe paragraph a teammate can paste into their own agent to apply a fix ([`SKILL.md`][prompt-for-others]): goal, context, exact commands, verify commands with expected output, a stop rule ("If `brew` … is missing, stop … instead of installing anything"), what to report back. Only already-tested commands.
- **Kind**: skill.
- **Proposed address**: none.
- **Why it could fit.** "Stop rule instead of install fallback" and "verify with expected output" are good brief-writing rules.
- **Why it might not.** The owner is a solo developer (map Notes); there are no teammates to brief. The fork's `writing-for-agents` covers agent-facing text.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `writing-for-agents`; entry 10's contract.
- **Idle context cost**: 0 (user-invoked); ~64 if model-invoked.
- **Recommendation (proposed)**: reject.

### 22. `larp-detector`

- **What it is.** A 21-line prompt for reviewing outside PRs and issues on public repos ([`SKILL.md`][larp]): assume many are AI-generated drive-by contributions or LLM-hallucinated "issues"; judge the intent and origin (real bug? real care? or "issues that were artificially found by an LLM"?).
- **Kind**: skill.
- **Proposed address**: none for now (possible future core user-invoked if the owner maintains public repos).
- **Why it could fit.** The fork is meant to stay publishable, and the owner publishes Unity packages (inference from `Hissal/agent-skills-sync-unity`). Triage of outside PRs may come.
- **Why it might not.** Model-invoked with a broad trigger; the tone is dismissive ("complete nonsense"). The fork's `triage` covers issue triage.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `triage`, `code-review`.
- **Idle context cost**: ~84 tokens as published.
- **Recommendation (proposed)**: reject for now.

### 23. `github-outside-sandbox`

- **What it is.** Seven rules for when a sandbox blocks `gh` auth, network or `.git` writes ([`SKILL.md`][gh-sandbox]): escalate only the blocked command, rerun `gh auth status` outside the sandbox before claiming auth is broken, use the harness's official escalation (Codex `sandbox_permissions: "require_escalated"`), never shell wrappers or broad approval prefixes.
- **Kind**: skill.
- **Proposed address**: none (possibly a line in an always-on Codex note).
- **Why it could fit.** The owner runs Codex, whose sandbox does block network and some `.git` writes (inference from the skill's own reasons). "Check outside the sandbox before declaring auth broken" avoids a common false alarm.
- **Why it might not.** Model-invoked at ~88 tokens for a situation that arises rarely; mostly Codex-specific.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: none found in other ledgers.
- **Idle context cost**: ~88 tokens as published.
- **Recommendation (proposed)**: reject as a skill; owner's call whether one line belongs in Codex-side always-on text.

### 24. `create-readonly-db-role` and `openrouter`

- **What it is.** Two web-stack skills. [`create-readonly-db-role`][readonly-db] (user-invoked): a SELECT-only Postgres role for agents, with a denylist for secret/PII tables, `default_transaction_read_only` and `statement_timeout` as soft guards, "Agents never run production DDL", and seven verification queries that prove both the soft guard and the hard `permission denied` wall. [`openrouter`][openrouter] (model-invoked): rules for OpenRouter integrations (explicit reasoning effort per model, check every fallback for the same capabilities, "HTTP 200 is not application success", measure valid-result rate and cost per valid result) with five references.
- **Kind**: skills.
- **Proposed address**: web pack user-invoked (both, if the owner uses Postgres or OpenRouter).
- **Why it could fit.** The owner builds web apps and agentic workflows (map Notes). The read-only role's two-layer verification is a well-made recipe. `openrouter`'s "cost per valid result" metric generalizes to any LLM API.
- **Why it might not.** Whether the owner uses Postgres/Supabase or OpenRouter is unknown. The Unity and C# work never needs either.
- **Copy / adapt / idea-only**: copy as web-pack user-invoked if the stack matches; otherwise idea-only.
- **Overlap**: the host's `claude-api` skill (LLM API work, [anthropic-skills ledger](anthropic-skills.md)); entry 11.
- **Idle context cost**: `create-readonly-db-role` 0 (~49 if model-invoked); `openrouter` ~78 as published.
- **Recommendation (proposed)**: owner's call, conditional on stack; park as web-pack user-invoked candidates.

### 25. Author-stack tool wrappers

- **What it is.** Seventeen skills that operate tools specific to the author's machine or services. None is Unity- or C#-relevant.

| Skill | What it drives | Platform | Gate | Idle cost as published |
|---|---|---|---|---|
| [`bb-cli`][bb-cli] | the bb agent-orchestration app's CLI (+9 references) | any | model | ~73 |
| [`bb-plugins`][bb-plugins] | building bb plugins (TypeScript) | any | model | ~95 |
| [`nagent`][nagent] | spawning bb worker threads; permission-mode check script | any | model | ~89 |
| [`self-archive`][self-archive] | archive the current Cloudroom/bb thread | any | model | ~67 |
| [`reset-cursor-acp`][reset-acp] | reset a stuck Cursor ACP thread (sanitized placeholders) | macOS | user | 0 |
| [`herdr`][herdr] | Herdr terminal-pane agents in Ghostty; says "ALWAYS launch agents with auto-approval" ([L92][herdr-yolo]) | macOS/Linux | model | ~85 |
| [`cmux`][cmux] | the cmux macOS terminal | macOS | model | ~80 |
| [`boat`][boat] | Boat cloud sandboxes | any | model | ~86 |
| [`cua-driver`][cua] | Cua desktop/browser automation | macOS | model | ~127 |
| [`new-grok-bot`][grok-bot] | design a Grok Bot role (8-point "unit-of-work test") | any | user | 0 |
| [`fable-safe-prompt`][fable-safe] | rephrase prompts to avoid one model's refusal classifier | macOS (`pbcopy`) | user | 0 |
| [`anti-sleep`][anti-sleep] | `caffeinate` via a one-shot LaunchAgent | macOS | user | 0 |
| [`persistent-localhost`][persistent-localhost] | dev servers as LaunchAgents | macOS | model | ~98 |
| [`repo-sync`][repo-sync] | the author's auto-commit-and-push daemon | macOS | user | 0 |
| [`rename-process`][rename-process] | renaming repos across Git, bb, services | any | model | ~91 |
| [`browser-harness`][browser-harness] | browser-use's CDP harness on the user's Chrome | any | model | ~65 |
| [`browser-use`][browser-use] | the browser-use CLI (vendored, own MIT licence) | any | model | ~49 |

- **Kind**: skills (two with scripts).
- **Proposed address**: none.
- **Why it could fit.** Isolated ideas transfer: `persistent-localhost`'s "replace a stale port holder only if it's our own app, otherwise pick the next free port" rule; `anti-sleep`'s "verify in a *separate* call before claiming success"; `cua-driver`'s observe → act → verify with fresh state after every action; `new-grok-bot`'s unit-of-work test for what deserves a standing agent.
- **Why it might not.** The owner uses none of these tools, most are macOS-only, and the model-invoked ones together cost ~1.1k idle tokens. `herdr` instructs launching agents with `--dangerously-skip-permissions`, relying on the entry 2 guard. The harness already offers browser and computer-use tools.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `unity-debugging` (observe/act/verify loop); host browser tools.
- **Idle context cost**: see table; ~1.1k tokens for the 11 model-invoked ones.
- **Recommendation (proposed)**: reject all seventeen.

### 26. Personal-workflow skills: `signal-from-expert`, `domain-checker`, `fireflies-transcript`, `image-prompt`, `save-idea`

- **What it is.** Five skills tied to the author's content and business work. [`signal-from-expert`][signal] (user-invoked): compares the user's notes with an expert's essays, saves sources verbatim with a fetch script (DeepAPI), and reports exact quotes with `file:START-END` locations plus at least one "Gap:". [`domain-checker`][domain-checker] (user-invoked): batch domain-registration lookup over public RDAP with a stdlib Python script, careful that `NOT_FOUND` is "**Not confirmed available**". [`fireflies-transcript`][fireflies] (user-invoked): pull meeting transcripts via GraphQL. [`image-prompt`][image-prompt] (model-invoked): four image-model prompts. [`save-idea`][save-idea] (model-invoked): route an idea into one of eight backlog files in a private ideas repo, then commit and push.
- **Kind**: skills (two with scripts).
- **Proposed address**: none.
- **Why it could fit.** `signal-from-expert`'s "save sources verbatim, cite by line range, require at least one gap" is a strong citation discipline that parallels the fork's `research` skill. `domain-checker`'s honest status vocabulary is a model for any availability check.
- **Why it might not.** Content-creator and business workflows outside the owner's stack; `save-idea` is hard-wired to the author's repo layout; `signal-from-expert` and `fireflies-transcript` need paid services.
- **Copy / adapt / idea-only**: idea-only.
- **Overlap**: fork `research`.
- **Idle context cost**: `image-prompt` ~59 and `save-idea` ~77 as published; the other three 0.
- **Recommendation (proposed)**: reject all five.

---

## Summary of proposals

| Proposal | Entries | Address |
|---|---|---|
| Adapt | 2 (command guard hook + tests), 9 (`handoff` ideas into fork), 10 (`goal-loop` contract), 11 (`risky-changes`), 12 + 13 (one Codex recipe + one cross-model review skill) | core always-on; core user-invoked; web pack |
| Owner's call | 15 (`decisions`), 24 (`create-readonly-db-role`, `openrouter`) | core user-invoked; web pack user-invoked |
| Idea-only | 1, 3, 4, 5, 6, 7, 8, 14, 16-23, 25, 26 | inputs to #14, #15, #17, the install ticket, `writing-for-agents`, `domain-modeling`, `research`, `wizard` |
| Reject as skills | everything not listed above | — |

[root]: https://github.com/davidondrej/skills/tree/7874889bd037d411f6079e38ee8601557c4a8995
[readme]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/README.md
[license]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/LICENSE
[skills]: https://github.com/davidondrej/skills/tree/7874889bd037d411f6079e38ee8601557c4a8995/skills
[hooks]: https://github.com/davidondrej/skills/tree/7874889bd037d411f6079e38ee8601557c4a8995/hooks
[agents-md]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/AGENTS.md
[agents-md-bug]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/AGENTS.md#L28-L33
[agents-md-adr]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/AGENTS.md#L46-L57
[agents-md-coauthor]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/AGENTS.md#L71
[agents-md-basics]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/AGENTS.md#L92-L96
[agents-md-speed]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/AGENTS.md#L98-L107
[hook-deny]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/hooks/deny-dangerous.sh
[hook-deny-failopen]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/hooks/deny-dangerous.sh#L26-L34
[hook-test]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/hooks/test-guard.sh
[guardrails]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/ops-and-setup/global-agent-guardrails/SKILL.md
[guardrails-scope]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/ops-and-setup/global-agent-guardrails/SKILL.md#L42
[guardrails-codex]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/ops-and-setup/global-agent-guardrails/SKILL.md#L76
[guardrails-fp]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/ops-and-setup/global-agent-guardrails/SKILL.md#L83
[guardrails-probe]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/ops-and-setup/global-agent-guardrails/SKILL.md#L88
[push-skills]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/skill-authoring/push-skills/SKILL.md
[distribute]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/skill-authoring/distribute-skill-to-all-agents/SKILL.md
[eas]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/skill-authoring/effective-agent-skills/SKILL.md
[eas-time]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/skill-authoring/effective-agent-skills/SKILL.md#L217-L219
[eas-colon]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/skill-authoring/effective-agent-skills/SKILL.md#L81
[eas-gating]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/skill-authoring/effective-agent-skills/SKILL.md#L85-L95
[eas-patterns]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/skill-authoring/effective-agent-skills/SKILL.md#L100-L115
[eas-style]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/skill-authoring/effective-agent-skills/SKILL.md#L211
[eas-trigger]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/skill-authoring/effective-agent-skills/SKILL.md#L235
[eas-weak]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/skill-authoring/effective-agent-skills/SKILL.md#L248
[eas-security]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/skill-authoring/effective-agent-skills/SKILL.md#L264
[deepapi]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/research-and-web/deepapi/SKILL.md
[deepapi-update]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/research-and-web/deepapi/SKILL.md#L86-L89
[deepapi-version]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/research-and-web/deepapi/VERSION.txt
[deepapi-manifest]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/research-and-web/deepapi/MANIFEST.txt
[deep-research]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/research-and-web/deep-research/SKILL.md
[deep-scrape]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/research-and-web/deep-scrape/SKILL.md
[varied-search]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/research-and-web/varied-search/SKILL.md
[who-is-this]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/research-and-web/who-is-this/SKILL.md
[shopping]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/research-and-web/online-shopping/SKILL.md
[browser-harness]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/research-and-web/browser-harness/SKILL.md
[browser-use]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/research-and-web/browser-use/SKILL.md
[bu-license]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/research-and-web/browser-use/LICENSE.md
[domain-checker]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/research-and-web/domain-checker/SKILL.md
[fireflies]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/research-and-web/fireflies-transcript/SKILL.md
[handoff]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/handoff/SKILL.md
[handoff-traps]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/handoff/SKILL.md#L54-L58
[handoff-close]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/handoff/SKILL.md#L74-L80
[handoff-save]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/handoff/SKILL.md#L84
[goal-loop]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/goal-loop/SKILL.md
[goal-loop-contract]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/goal-loop/SKILL.md#L31-L36
[goal-loop-rules]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/goal-loop/SKILL.md#L79-L80
[risky]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/ops-and-setup/risky-changes/SKILL.md
[risky-measure]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/ops-and-setup/risky-changes/SKILL.md#L38-L44
[risky-evals]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/ops-and-setup/risky-changes/SKILL.md#L46
[risky-post]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/ops-and-setup/risky-changes/SKILL.md#L54
[codex-sub]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/codex-subagent/SKILL.md
[codex-sub-stdin]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/codex-subagent/SKILL.md#L49-L50
[codex-sub-never]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/codex-subagent/SKILL.md#L93
[codex-sub-review]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/codex-subagent/SKILL.md#L98
[gpt-review]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/gpt-review/SKILL.md
[gpt-review-brief]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/gpt-review/SKILL.md#L20
[gpt-review-downgrade]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/gpt-review/SKILL.md#L16
[fable-review]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/fable-review/SKILL.md
[total-review]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/total-review/SKILL.md
[total-review-agree]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/total-review/SKILL.md#L20-L23
[total-review-ship]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/total-review/SKILL.md#L31
[worktree]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/git-worktree/SKILL.md
[worktree-one]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/git-worktree/SKILL.md#L26
[worktree-setup]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/git-worktree/SKILL.md#L46-L55
[decisions]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/thinking-and-docs/decisions/SKILL.md
[stop-overthinking]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/thinking-and-docs/stop-overthinking/SKILL.md
[remind]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/thinking-and-docs/remind/SKILL.md
[file-tree]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/thinking-and-docs/file-tree/SKILL.md
[rename]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/thinking-and-docs/rename/SKILL.md
[keep-track]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/thinking-and-docs/keep-track/SKILL.md
[read-all-adrs]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/thinking-and-docs/read-all-adrs/SKILL.md
[ask-then-build]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/thinking-and-docs/ask-then-build/SKILL.md
[before-building]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/thinking-and-docs/before-building/SKILL.md
[adr-verbatim]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/thinking-and-docs/adr-verbatim/SKILL.md
[teach]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/thinking-and-docs/teach/SKILL.md
[setup-help]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/ops-and-setup/setup-help/SKILL.md
[prompt-for-others]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/ops-and-setup/prompt-for-others/SKILL.md
[larp]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/larp-detector/SKILL.md
[gh-sandbox]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/ops-and-setup/github-outside-sandbox/SKILL.md
[readonly-db]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/ops-and-setup/create-readonly-db-role/SKILL.md
[openrouter]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/ops-and-setup/openrouter/SKILL.md
[bb-cli]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/bb-cli/SKILL.md
[bb-plugins]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/bb-plugins/SKILL.md
[nagent]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/nagent/SKILL.md
[self-archive]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/self-archive/SKILL.md
[reset-acp]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/reset-cursor-acp/SKILL.md
[herdr]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/herdr/SKILL.md
[herdr-yolo]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/herdr/SKILL.md#L92-L98
[cmux]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/cmux/SKILL.md
[boat]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/ops-and-setup/boat/SKILL.md
[cua]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/ops-and-setup/cua-driver/SKILL.md
[grok-bot]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/new-grok-bot/SKILL.md
[fable-safe]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/agent-orchestration/fable-safe-prompt/SKILL.md
[anti-sleep]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/ops-and-setup/anti-sleep/SKILL.md
[persistent-localhost]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/ops-and-setup/persistent-localhost/SKILL.md
[repo-sync]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/ops-and-setup/repo-sync/SKILL.md
[rename-process]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/ops-and-setup/rename-process/SKILL.md
[signal]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/thinking-and-docs/signal-from-expert/SKILL.md
[image-prompt]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/thinking-and-docs/image-prompt/SKILL.md
[save-idea]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/thinking-and-docs/save-idea/SKILL.md
