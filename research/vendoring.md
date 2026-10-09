# Vendoring: taking skills from many sources and tracking upstream

Research for [#12](https://github.com/Hissal/skill-collection/issues/12), part of the wayfinder map [#1](https://github.com/Hissal/skill-collection/issues/1). Read 2026-10-09. Vocabulary follows `GLOSSARY.md`. Install and loading facts come from `research/loading-mechanics.md` (#2) and are not repeated here.

## Summary

The question is how the collection can take skills from ~5-10 sources, keep up with upstream, and still carry local changes. Short answer: **only two of the six options handle local changes without losing them: a git merge, or a three-way merge against a recorded baseline.** Of those, only copy-with-provenance works per skill rather than per repository.

- **git subtree** merges upstream into a subdirectory and keeps local edits ("this doesn't remove your own local changes") [git-subtree]. It works on a whole repository or ref, though. Taking one skill means re-running `git subtree split` on a clone of the source at every sync (inference from the docs). The overhead is heavy for 5-10 sources that each give 1-5 skills.
- **git submodules** pin one commit per source repository [gitsubmodules]. Local changes need a fork of each source to push to. Codex's marketplace clone does not recurse into submodules [CX-src install.rs], so they arrive empty. Poor fit.
- **skills.sh (`npx skills`)** records the source, the skill path and an upstream folder hash in a lock file, then re-runs `add`, which deletes and recopies the folder [VS update.ts, installer.ts]. **Local edits are overwritten without warning.** The lock holds no commit SHA, and the repository-root `LICENSE` is not copied. Good for unmodified skills only, and Claude needs the `claude-code` agent target or a symlink.
- **Claude plugin dependencies** pull in whole plugins, with semver ranges, from the same or an allowlisted marketplace [CC-deps]. Codex's plugin manifest has no `dependencies` field and ignores it [CX-src manifest.rs]. Adaptation is impossible, so this suits only "install as-is" plugins, which the map already says to install rather than vendor.
- **Copy with provenance** keeps a pinned upstream SHA, a baseline snapshot, licence files and a drift-check script. It is the only per-skill option with three-way merges (`git merge-file`) [git-merge-file]. It is plain files, so it works on both harnesses. Real examples are Grill's `VENDORED.md` + `vendored.lock.json` + `SKILL.upstream.md` + `check-skill-updates` [Grill], and forge-core's SLSA `.provenance/` sidecars [forge].
- **The fork's upstream-merge runbook** is a full-repository `git merge` with fixed conflict rules [F-sync]. It is the right tool for the fork itself, and a model for the collection's own sync procedure, but it doesn't scale to many sources in one repository.
- **Proposed** (not decided): copy with provenance for adapted skills, with a whole-folder baseline kept *outside* the skill roots, a lock file pinning the commit SHA, a `licenses/` directory plus a `NOTICE`, and a script that reports drift and runs `git merge-file`. Unmodified whole plugins are installed as plugins, not vendored. The fork stays a source tracked the same way, or through its own merge runbook if the Unity pack is taken whole.

## Sources (pinned)

| Key | Source | Pin |
| :- | :- | :- |
| git-subtree | `contrib/subtree/git-subtree.adoc` in `git/git` | [`6de20f6`](https://github.com/git/git/blob/6de20f6092dcf9bdb1c8efe03db4b70c82b423dd/contrib/subtree/git-subtree.adoc) |
| gitsubmodules | `Documentation/gitsubmodules.adoc` | [`6de20f6`](https://github.com/git/git/blob/6de20f6092dcf9bdb1c8efe03db4b70c82b423dd/Documentation/gitsubmodules.adoc) |
| git-merge-file | `Documentation/git-merge-file.adoc` | [`6de20f6`](https://github.com/git/git/blob/6de20f6092dcf9bdb1c8efe03db4b70c82b423dd/Documentation/git-merge-file.adoc) |
| VS | `vercel-labs/skills` (the `npx skills` CLI, v1.7.1) | [`e878c45`](https://github.com/vercel-labs/skills/tree/e878c4502674f84094dc27b5ad94ddaf64f22551) |
| CC-deps, CC-mkt-ref, CC-loading, CC-host | Claude Code docs `plugins/plugin-dependencies`, `plugins/marketplace-reference`, `plugins/loading`, `plugins/host-marketplace` (raw `.md`) | fetched 2026-10-09. Unversioned, so the local Claude Code 2.1.295 is the pin |
| CX-build | Codex docs `plugins/build.md` | fetched 2026-10-09 |
| CX-src | `openai/codex` (main) | [`9a59289`](https://github.com/openai/codex/tree/9a59289fbea0e7e829c06aecfdd627651854da0f) |
| AS-spec | Agent Skills specification, `https://agentskills.io/specification.md` | fetched 2026-10-09 |
| F | the fork, local `C:\dev\skills\mattpocock-skills-unity` | `3d926c6` (upstream/main `b0618bc`) |
| Grill | `niko-staszek/Grill` | [`9e2ef08`](https://github.com/niko-staszek/Grill/tree/9e2ef0801a5a91a37508eba488da65b44d81e795) |
| forge | `n4m3z/forge-core` | [`911310b`](https://github.com/n4m3z/forge-core/tree/911310b75a39666f19c23e619e20c9cdeee0173b) |
| fmeyer | `fmeyer/skills` | [`0b6e2ad`](https://github.com/fmeyer/skills/tree/0b6e2ad04cab2bd2664e118fdf5dfd1227edddf8) |
| svelte, emailcn | `sveltejs/ai-tools`, `shadcn-labs/emailcn` (`skills-lock.json` users) | [`6b5d0da`](https://github.com/sveltejs/ai-tools/tree/6b5d0dab3c9c083387247ab20dc684573481076b), [`8ff505e`](https://github.com/shadcn-labs/emailcn/tree/8ff505ea11015b9301802ce59c48a91f9b203cf0) |
| anthropic | `anthropics/skills` | [`9d63080`](https://github.com/anthropics/skills/tree/9d630808e4add0a7146de4af9384155d5dee350a) |
| superpowers | `obra/superpowers` | [`8ca22db`](https://github.com/obra/superpowers/tree/8ca22dba9a94f28898bbce59f2537ff4d87c747d) |
| Licences | pstack [`LICENSE`](https://github.com/cursor/plugins/blob/ccb5507cec1546dc88135c1139c811e6c59115ba/pstack/LICENSE) (MIT © 2026 Lauren Tan); Addy [`LICENSE`](https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/LICENSE) (MIT © 2025 Addy Osmani); Matt Pocock [`LICENSE`](https://github.com/mattpocock/skills/blob/b0618bc436ad893b3c5e84e55fba86586d34a404/LICENSE) (MIT © 2026 Matt Pocock); fork `LICENSE` (MIT, Matt Pocock + Lassi Harjaluoma "Unity adaptations") | as listed |

Everything was read from shallow clones or `curl` in the session scratchpad. Nothing was installed or executed.

---

## 1. git subtree

**How it works.** `git subtree add -P <prefix> <repo> <ref>` imports a ref's tree into a subdirectory. `merge`/`pull` bring in later changes, and `--squash` collapses each import into one commit [git-subtree L12-19, L70-85]. A subtree "is just a subdirectory that can be committed to, branched, and merged along with your project" and needs no `.gitmodules` or special steps from users [git-subtree L30-37].

- **Update cost.** One `git subtree pull` per source. The catch: `add`/`pull` take a whole ref, so the entire source repository lands under the prefix. To take only `skills/foo` from a source, you would clone the source, run `git subtree split -P skills/foo` to get a synthetic history of that folder [git-subtree L97-106], and pull that split commit. Splits are deterministic, so re-splitting extends the earlier history [git-subtree L111-115]. *Inference:* that means one clone and one split per skill per sync. For 5-10 sources and a few dozen skills, this is scripted chores with little benefit over copying. Importing whole repositories instead brings in every unwanted skill. That conflicts with the map's "no blind picks" and would put stray `SKILL.md` files inside skill roots, where Codex scans up to 6 levels deep [CX-src `ext/skills/src/loader/mod.rs` L31].
- **Conflicts with local changes.** This is subtree's strength. `merge` works "as with normal 'git merge'": it "doesn't remove your own local changes", and conflicts are resolved "in the usual ways" [git-subtree L79-91]. Merge base tracking is automatic.
- **Codex.** Neutral. The result is ordinary files in the collection repository, which then ships through whatever install path the collection uses (plugins or symlinks; see #2).
- **Licences.** Only as good as what's imported. A whole-repository import carries the root `LICENSE`. A split of `skills/foo` does not, because MIT sources such as pstack, Addy and Matt Pocock keep `LICENSE` at the root, so it has to be added by hand.

## 2. git submodules

**How it works.** The superproject records a `gitlink`, the commit the submodule is pinned to, plus a `.gitmodules` entry [gitsubmodules L33-37]. Submodules are not checked out by default; you need `clone --recurse-submodules` or `git submodule update --init` [gitsubmodules L250-281]. Upgrading means changing the gitlink and committing [gitsubmodules L235-238].

- **Real example.** `fmeyer/skills` documents a `vendor/` folder of submodules with `make add-fork`, `make update-forks` (`git submodule update --remote --recursive`) and `make init-vendor`, and symlinks each skill into `~/.claude/skills` [fmeyer `Makefile` L10-61, `README.md` L11-60]. At the pinned SHA no submodule is actually registered, so this is the pattern, not a working inventory.
- **Update cost.** Low for tracking: one command bumps all pins. The pins are per repository, though, so you can't take one skill from a repository without the rest.
- **Conflicts with local changes.** Poor. The submodule is its own repository, so a local edit is a commit *inside* it. Unless that commit is pushed to a remote that every clone can reach, the gitlink points at a commit nobody else can fetch. *Inference:* adapting needs a personal fork per source, which turns 5-10 sources into 5-10 forks to maintain, each with its own upstream merges. That is the fork's runbook (§6) multiplied.
- **Codex.** Codex's marketplace install runs a plain `git clone` (and `git checkout <ref>`), or a sparse `clone --filter=blob:none --no-checkout`. Neither uses `--recurse-submodules` [CX-src `core-plugins/src/marketplace_add/install.rs` L6-42]. A marketplace repository with skills in submodules would install with empty directories. Claude's docs say marketplaces are cloned [CC-loading L40] but say nothing about submodules (not verified). Locally linked setups (`fmeyer`-style symlinks) work on both, provided the owner remembers `submodule update --init` in every clone and worktree.
- **Licences.** The whole upstream repository, including `LICENSE`, sits inside the submodule, so the notice is present in the working tree. *Inference:* a plugin built by symlinking into the submodule copies only the linked skill folder into the cache [CC-host L75-79], so the notice does not travel with the installed plugin.

## 3. skills.sh (`npx skills`) and its lock

**How it works.** `npx skills add <owner/repo> --skill <name> [-g] [-a <agent>]` copies a skill folder into a canonical `.agents/skills/<name>` and either symlinks each agent's directory to it (recommended) or copies it (`--copy`) [VS `README.md` L84-142; `src/installer.ts` L326-402]. Claude Code's target is `.claude/skills` or `~/.claude/skills`. Codex's is `.agents/skills` or `~/.agents/skills` [VS `README.md` L294-296].

**Two lock files:**

- **Global** `~/.agents/.skill-lock.json` (v3): per skill `source`, `sourceUrl`, optional `ref` ("Branch or tag"), `skillPath`, `skillFolderHash` ("GitHub tree SHA for the entire skill folder"), and install and update timestamps [VS `src/skill-lock.ts` L13-37]. The owner's machine has one today, holding `find-skills`.
- **Project** `skills-lock.json` (v1): `source`, `ref`, `sourceType`, `skillPath`, `computedHash` (SHA-256 of the files on disk at install). It is "intentionally minimal and timestamp-free to minimize merge conflicts" and "meant to be checked into version control" [VS `src/local-lock.ts` L8-63]. Real users include `sveltejs/ai-tools`, which vendors Matt Pocock's `writing-great-skills` into `.agents/skills` [svelte `skills-lock.json`], and `shadcn-labs/emailcn` [emailcn `skills-lock.json`].

**Update model.** `npx skills update` compares the upstream folder hash at the tracked ref against the hash recorded at install. That is `skillFolderHash` globally and `computedHash` for projects [VS `src/update.ts` L585-596, L636-645, L920-930]. On a mismatch it re-runs `skills add <source> --skill <name> -y` [VS `src/update.ts` L705-715, L941-960]. `add` calls `cleanAndCreateDirectory`, which runs `rm(path, { recursive: true, force: true })` before copying [VS `src/installer.ts` L198-200, L371-402]. Local and plain-git sources are skipped by `update` [VS `src/update.ts` `getSkipReason` L187-200].

- **Update cost.** The lowest of all: one command for every skill.
- **Conflicts with local changes.** None are detected. **They are destroyed.** The hash compared is the *upstream* folder against the *recorded* hash. Local file contents never enter the comparison, and the reinstall deletes the folder first (code reading; not run). There is no merge and no baseline.
- **Pinning.** `ref` is a branch or tag. No commit SHA is stored, only content hashes, so you can't fetch the exact baseline later to diff against (inference from the lock fields).
- **Codex.** Native: Codex reads `~/.agents/skills` and `.agents/skills`. Claude needs the `claude-code` agent target (an extra symlink into `~/.claude/skills`). Note from #2: `find-skills` today reaches Codex only, for this reason.
- **Licences.** Only the skill folder is copied, minus `metadata.json`, `.git` and `__pycache__` [VS `src/installer.ts` L471-476, L513]. A root `LICENSE` is not carried. `sveltejs/ai-tools`'s copy of Matt Pocock's skill has just `SKILL.md` and `GLOSSARY.md`, with no licence [svelte `.agents/skills/writing-great-skills/`]. Sources that put a licence *inside* each skill folder survive the copy: `anthropics/skills` ships `LICENSE.txt` per skill, with `license: Complete terms in LICENSE.txt` in frontmatter [anthropic `skills/pdf/`, `skills/*/SKILL.md`], which is the pattern the Agent Skills spec's `license` field describes [AS-spec L32, L123-136].
- **Scope.** It installs skills only. Hooks, scripts outside the skill folder and other mechanisms are out of reach (inference from the discovery and copy code).

## 4. Plugin dependencies across marketplaces

**How it works (Claude).** `plugin.json` `dependencies` lists `"name"`, `"name@marketplace"`, or `{name, version, marketplace}` with a semver range. The range resolves against `<plugin>--v<version>` git tags [CC-deps "Declare a dependency…", "Release a plugin that others depend on"]. A plugin with only `name` and `dependencies` is a valid "bundle" [CC-deps "Bundle plugins for a team"]. Cross-marketplace dependencies are refused unless the root marketplace lists the target in `allowCrossMarketplaceDependenciesOn`, or the user already has the dependency enabled at that scope [CC-deps "Depend on a plugin from another marketplace"]. Conflicting ranges fail the install, and auto-update stays inside the intersection [CC-deps "Combine constraints"]. Marketplace entries can also pin a source `sha` (40 chars) with `ref` [CC-mkt-ref L151-154], and `git-subdir` fetches one subdirectory by sparse checkout [CC-mkt-ref L215-230].

- **Update cost.** Close to zero: auto-update or `claude plugin update`.
- **Conflicts with local changes.** Not applicable. A dependency is someone else's whole plugin, copied into `cache/<marketplace>/<plugin>/<version>/` [CC-loading L180-187]. There is nowhere to put a local change except by forking that plugin. A marketplace entry can *append* component paths to a plugin that has `plugin.json`, but not remove or edit them (`strict: true`) [CC-mkt-ref L120-132]. Single skills inside a plugin can't be turned off on Claude (#2), so depending on a large plugin brings its whole idle cost.
- **Codex.** **Unsupported.** Codex's `RawPluginManifest` has `name`, `version`, `description`, `keywords`, `skills`, `mcpServers`, `apps`, `hooks`, `interface` and `extensions`. There is no `dependencies` field and no `deny_unknown_fields`, so the key is silently ignored [CX-src `core-plugins/src/manifest.rs` L48-73]. Codex marketplace entries do accept `url`/`git-subdir` sources with `ref` or `sha` [CX-build L480-503], so a collection marketplace can *list* external plugins for both harnesses. The owner then enables them individually.
- **Licences.** Handled by upstream: the plugin arrives whole with its own `LICENSE` (when it sits inside the plugin dir), and nothing is redistributed by the collection.

## 5. Copy with provenance plus a drift-check script

**How it works.** Copy the skill into the collection, record where it came from, keep a pristine baseline, and check drift with a script. Two real implementations differ in useful ways:

- **Grill** [Grill]. `VENDORED.md` is the human ledger: path, upstream, pinned commit, licence, notes, with the rule "no silent copies. Adding a vendored asset means adding a row here in the same commit" [`VENDORED.md` L1-16]. `vendored.lock.json` is the machine mirror: `path`, `raw_url` with a `{ref}` placeholder, the full `pinned` SHA and `branch` [`vendored.lock.json`]. Each adapted skill keeps the untouched upstream file beside it as `SKILL.upstream.md`. The `check-skill-updates` skill fetches upstream at both the pin and the branch HEAD and classifies each entry as `current`, `local-drift`, `update-available`, `both` or `baseline-corrupt`. It normalises CRLF, BOM and trailing whitespace so Windows line endings don't read as drift. It is dry-run only: re-syncs are proposed, never applied [`skills/check-skill-updates/SKILL.md`; `scripts/update_check.py`]. Matt Pocock's MIT text is kept in full at `reference/licenses/mattpocock-skills-MIT.txt`, with a ledger row of its own. **Gap:** the lock and baseline cover `SKILL.md` only. `grill-with-docs` also vendors `ADR-FORMAT.md` and `CONTEXT-FORMAT.md`, and their drift is never checked [Grill `skills/grill-with-docs/`, 5 `raw_url` entries, all `SKILL.md`].
- **forge-core** [forge]. Each adopted skill carries `upstream: <url>` in frontmatter as a human pointer, plus `skills/<Name>/.provenance/SKILL.yaml`. That sidecar is an in-toto/SLSA v1 statement with the output's SHA-256, the upstream permalink at a commit SHA, and the SHA-256 of the upstream content [forge `skills/DesignFrontend/SKILL.md`, `.provenance/SKILL.yaml`]. Their ADR says "the git diff between the adopted artifact and the upstream at the pinned SHA is the authoritative record of what changed", with the commit message carrying the why [forge `docs/decisions/PROV-0006…md` L97]. Adoption is a user-invoked skill (`/AdoptArtifact`), not a CLI [forge `ARCH-0013…md`]. **Gap:** no licence is carried with the adopted skill.
- **Counter-example.** `superpowers` vendors a copy of Anthropic's skill-authoring docs as `skills/writing-skills/anthropic-best-practices.md` with no pinned URL, SHA or date [superpowers `skills/writing-skills/SKILL.md` L20]. There is no way to tell whether it is stale.

**Applying upstream changes.** With a baseline kept, an update is a real three-way merge per file: `git merge-file <ours> <baseline> <new-upstream>` "incorporates all changes that lead from `<base>` to `<other>` into `<current>`" and brackets overlapping edits as conflicts [git-merge-file L1-30]. Afterwards the new upstream becomes the baseline and the pin moves. Neither real example automates this step. Grill re-fetches and asks; forge relies on a manual diff.

- **Update cost.** Medium, all of it scripted: fetch at the new SHA, then `merge-file` per file. The cost scales with *adapted* files, not sources. Unchanged files fast-forward.
- **Conflicts with local changes.** Good: the same semantics as `git merge`, per file, with an explicit base. Without a baseline (forge's model) you need the old upstream SHA re-fetched each time, which works while the commit stays reachable.
- **Codex.** Neutral (plain files). One trap: Codex scans skill roots recursively to depth 6 [CX-src `loader/mod.rs` L31]. It skips hidden directories for host roots [CX-src `loader/host.rs` L178] but includes them in another loader mode [CX-src `loader/environment.rs` L126]. A baseline saved as a second `SKILL.md` inside a skill root could load as a duplicate skill. Grill avoids this by renaming the file (`SKILL.upstream.md`). Keeping baselines outside the skill and plugin directories avoids it entirely, and also keeps them out of Claude's plugin cache, which copies only the plugin directory [CC-loading L187].
- **Licences.** Explicit and under the collection's control. This is the only option where the MIT condition ("The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software" [Addy `LICENSE` L12]) is met on purpose rather than by accident. pstack, Addy and Matt Pocock all keep the notice at the repository root only, so every copy-based option has to add it by hand.

## 6. The fork's upstream-merge runbook

**How it works.** The fork is a real fork of `mattpocock/skills`, with `upstream` configured `--no-tags`. A sync is a branch, `git merge upstream/main` (never squash or rebase, "so `upstream/main` stays an ancestor of `main`"), then fixed rules: drop upstream changesets, keep our `CHANGELOG.md` and `version` fields, regenerate `package-lock.json`, and trace every other conflict to both sides' intent. A check follows: `git diff upstream/main -- skills/ docs/` must show only the intended Unity changes. Then bucket placement, `link-skills.sh`, validation and a changeset [F `.agents/upstream-sync.md` steps 1-8].

- **Update cost.** One merge per upstream release, with most of the cost in judgment-heavy conflicts on adapted files. The step-4 diff is a built-in drift report, and the most rigorous of all the options here.
- **Conflicts with local changes.** The best of the options: full git history on both sides, merge base kept, and recorded reasons per delta (adapt tickets, `research/`).
- **Codex.** Already solved for the fork: `link-skills.sh` links into both `~/.claude/skills` and `~/.agents/skills` [F `scripts/link-skills.sh` L8-16], and `agents/openai.yaml` mirrors the invocation gate (#2).
- **Licences.** Solved by construction: the fork's `LICENSE` keeps Matt Pocock's notice and adds the owner's line for the Unity adaptations [F `LICENSE` L1-4].
- **Scaling.** It works because the fork *is* one upstream. *Inference:* a repository can merge unrelated histories from several upstreams (that is what subtree does under the hood), but each would need its own prefix and conflict rules. For the collection that just means §1.

## 7. Licence handling for the named MIT sources

| Source | Notice lives at | Carried by subtree / submodule / skills.sh / plugin dep / copy+provenance / fork merge |
| :- | :- | :- |
| pstack (`cursor/plugins/pstack`) | `pstack/LICENSE` (plugin root) | whole-repo subtree yes, split no / yes in tree, not in a symlinked plugin / **no** / yes / only if added / n/a |
| Addy (`addyosmani/agent-skills`) | repo root `LICENSE` | same as above |
| Matt Pocock (via the fork) | repo root `LICENSE`. The fork adds a second copyright line | same as above. The fork merge keeps it |
| Per-skill licence (pattern from `anthropics/skills`) | `skills/<name>/LICENSE.txt` + `license:` frontmatter | carried by every option that copies the skill folder |

*Inference (not legal advice):* for every copy-based route the collection needs (a) the full MIT text per source, with its copyright line, kept in the repository (Grill's `reference/licenses/<source>-MIT.txt`), and (b) because copied plugins keep only their own directory [CC-loading L187], a copy *inside each published plugin* that contains vendored material, or a per-skill `LICENSE.txt` as `anthropics/skills` does. A spec-level `license: MIT` frontmatter line [AS-spec] points to the terms but is not itself the notice.

## 8. Comparison

| | Update cost | Local changes on update | Per-skill selection | Codex | Licence notice | Real examples |
| :- | :- | :- | :- | :- | :- | :- |
| git subtree | Medium-high (split per skill per sync) | **Merged** (git merge) | Only through `split` | Neutral (plain files) | Whole-repo yes. Split no | none found for skills |
| git submodules | Low to bump | **Needs a fork per source** | No (whole repo) | **Codex marketplace clone skips submodules** | In tree, not in the installed plugin | `fmeyer/skills` (pattern) |
| skills.sh | **Lowest** (`npx skills update`) | **Overwritten without warning** | Yes | Native (`.agents/skills`). Claude needs a target | **Not carried** unless per-skill | `sveltejs/ai-tools`, `shadcn-labs/emailcn` |
| Plugin dependencies | Lowest (auto-update, semver) | Impossible (whole plugin) | No (whole plugin) | **Ignored by Codex** | Upstream's own | (Claude docs pattern) |
| Copy + provenance + drift script | Medium (scripted, scales with adapted files) | **Three-way merge** with a stored baseline | Yes, per file | Neutral. Keep baselines out of skill roots | **Explicit**, under the collection's control | Grill, forge-core |
| Fork merge runbook | Medium (per release, judgment-heavy) | **Merged** with full history | No (whole repo) | Solved in the fork | Kept in `LICENSE` | the fork |

## 9. Proposed recommendation (for the HITL session; not a decision)

*Proposed:* a hybrid, chosen per candidate by the catalog's copy / adapt / idea-only verdict:

1. **Adopt as-is, whole plugin** (e.g. caveman, the Unity baseline): install from its marketplace and don't vendor it. Optionally list it in the collection's marketplace via a `sha`-pinned `git-subdir`/`github` entry so both harnesses see it [CC-mkt-ref; CX-build]. Avoid `plugin.json` `dependencies`, because Codex ignores them.
2. **Copy or adapt a skill** (the common case): copy with provenance, modelled on Grill but filling its gaps:
   - `vendor.lock.json`: one entry per *skill folder*. Fields: `source`, `path`, full commit `sha`, `branch`, `license`.
   - A whole-folder baseline (every file, not just `SKILL.md`) under a top-level `vendor/<source>/<skill>/` **outside** any skill root or plugin directory, so neither harness loads it and no plugin cache copies it.
   - `licenses/<source>-LICENSE.txt` per source, plus a `NOTICE`/`CREDITS` table. Each published plugin that contains vendored files carries a copy, or a per-skill `LICENSE.txt`.
   - A script (a candidate for the maintenance machinery ticket) that reports `current / local-drift / update-available / both / baseline-corrupt` (Grill's classes, CRLF-safe), and on request fetches the new SHA and runs `git merge-file` per file, then moves the baseline and pin in the same commit. It reports only by default, as in Grill. The "why" of each local change goes in the commit message or ledger, as in forge-core.
3. **The fork**: keep its own merge runbook for `mattpocock/skills` → fork. The collection treats the fork as one more source under (2) for the skills it takes. If the Unity pack is eventually taken wholesale from the fork, a plugin entry pointing at the fork (case 1) avoids double maintenance. That hangs on the open fork-relationship ticket.
4. **Not proposed:** submodules (Codex clone, a fork per source) and skills.sh for adapted skills (it overwrites changes). skills.sh is still fine for one-off unmodified installs into Codex, as today with `find-skills`.

## Open points (not verified here)

- Whether Claude Code's marketplace and plugin clone initialises submodules. The docs say nothing.
- Whether Codex's plugin install keeps symlinks that point outside the plugin directory (Claude dereferences links within the same marketplace and skips links outside it [CC-host L75-81]).
- Whether Claude Code ignores unknown `SKILL.md` frontmatter keys such as `upstream:` without a warning (`metadata` is spec-defined [AS-spec L166-180]. *Inference:* both are safe, since only `name`/`description`/`when_to_use` reach the listing per #2).
- No published skills repository using `git subtree` for upstream sources was found. GitHub code search was rate-limited partway through the search.
