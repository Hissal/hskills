# Skill dependency metadata: declarations, identity and installation

Research for the Wayfinder core review, read 2026-10-16. This is a findings note; every recommendation below is **proposed, not decided or implemented**. Context read: `AGENTS.md`, `GLOSSARY.md`, `research/vendoring.md` and `research/loading-mechanics.md`. Only this findings file was changed. No installs, issue edits or commits were performed.

## Answer

**Yes: `SKILL.md` can carry a collection-defined dependency and identity declaration inside its standard `metadata` extension point. No: declaring it does not currently make Vercel's normal skill installer or Agent Skills Sync (Unity) install its transitive dependencies.** A consumer must implement the schema and resolver, or maintainers must resolve the closure into the existing flat lock before distribution. The current Agent Skills specification has no standardized skill-to-skill dependency field, global skill identity, version solver or transitive installation contract. [Specification][as-spec], [Vercel install selection][vs-add], [Unity lock parser][sync-lock], [Unity planning][sync-plan].

**The portable type is a string-to-string map.** Nested YAML lists/maps under a metadata key are not the specified type. Encode structured data as a quoted JSON string if it must live there. This preserves the outer type; it does not standardize the inner JSON schema or prove support in every harness. The spec recommends reasonably unique metadata keys. [Specification, metadata section][as-spec].

Avoid the broader claim that unknown metadata is universally ignored or harmless. The reference validator rejects unknown *top-level* fields, while real consumers assign behavior to particular metadata keys. Vercel's `metadata.internal` and OpenCode's `metadata["opencode/autoinvoke"]` are concrete counterexamples to treating all metadata as inert. Other clients may ignore a key, preserve it, validate it, expose it to the agent or interpret it; the spec does not promise a universal behavior for an invented schema. [Reference validator][as-validator], [Vercel parser][vs-skills], [OpenCode documentation][oc-docs].

## Source snapshots and limits

GitHub source links below are pinned to commits resolved through `gh` on 2026-10-16:

- Agent Skills: [`69ef37e9424c0a7ea9dd2293b559e43ec8176379`](https://github.com/agentskills/agentskills/tree/69ef37e9424c0a7ea9dd2293b559e43ec8176379).
- Vercel Skills: [`13e4063a1cf913f5606d57d42ab83a86f5001e04`](https://github.com/vercel-labs/skills/tree/13e4063a1cf913f5606d57d42ab83a86f5001e04), whose `package.json` says `1.7.2`. This is current repository source, not a verification of the npm dist-tag or installed binary.
- Agent Skills Sync (Unity), remote default branch: [`4186d73539238a7b0e248871a74935296fcdd9ee`](https://github.com/Hissal/agent-skills-sync-unity/tree/4186d73539238a7b0e248871a74935296fcdd9ee).
- Codex: [`34420d42648f627f766bd347532dcaad5475a68b`](https://github.com/openai/codex/tree/34420d42648f627f766bd347532dcaad5475a68b).
- OpenCode: [`582c974ee362683f5dd5c7f9741cae207581c6b5`](https://github.com/anomalyco/opencode/tree/582c974ee362683f5dd5c7f9741cae207581c6b5).
- OpenClaw: [`9bb764cb29f0a7cf7885efb5b3476ad996990b6c`](https://github.com/openclaw/openclaw/tree/9bb764cb29f0a7cf7885efb5b3476ad996990b6c).

The local Unity checkout exists at `C:\dev\unity\libs\agent-skills-sync-unity`. It is on `feat/choose-locked-skills` at [`d829e3982c1c259ee6eeabf2cc0cdb8d6c819654`](https://github.com/Hissal/agent-skills-sync-unity/tree/d829e3982c1c259ee6eeabf2cc0cdb8d6c819654), with pre-existing changes to two generated `.gitignore` files. GitHub reports that commit and remote default branch as diverged. Local source was searched read-only; claims about current upstream behavior below use the remote snapshot, rather than silently treating the local feature branch as main.

Official websites and issue/discussion states are mutable; their observation date is the research date. This is source/documentation analysis, not an installation experiment or a runtime compatibility certification.

## What the standard and proposals actually say

The spec's field table includes `name`, `description`, `license`, `compatibility`, `metadata` and experimental `allowed-tools`. `compatibility` can describe environment requirements in prose; `allowed-tools` concerns pre-approved tool use, not fetching required skills. A skill's `name` must match its directory name, so it is unsuitable as a globally unique, rename-independent identity by itself. [Specification][as-spec].

The string-value constraint is deliberate, not an inference from examples. [Issue #474](https://github.com/agentskills/agentskills/issues/474) asked about nested metadata and strict clients; [PR #479](https://github.com/agentskills/agentskills/pull/479), merged 2026-08-04, clarified the field table to explicitly say string keys and string values. The reference model declares `dict[str, str]`; its parser converts metadata values with `str(v)`. That coercion is not evidence that structured YAML values have portable semantics, and Python stringification is not a JSON serialization contract. [Reference model][as-model], [Reference parser][as-parser].

Current relevant discussions are proposals, not adopted fields:

- [#100, best practice for depending on other skills](https://github.com/agentskills/agentskills/issues/100) remains open. A contributor explicitly identifies decentralized identity as unresolved; [the June 30 comment](https://github.com/agentskills/agentskills/issues/100#issuecomment-4845970786) favors distribution-layer bundles. The referenced [`.well-known` distribution PR #254](https://github.com/agentskills/agentskills/pull/254) is still open, not merged.
- [#110, `requires` with version validation](https://github.com/agentskills/agentskills/issues/110) remains open. Its example is a proposal for tooling validation, not current portable frontmatter.
- [#90, prerequisite/related skill fields](https://github.com/agentskills/agentskills/issues/90) is closed. It proposed soft workflow relationships; the contributor response suggested references in the body. Closure does not establish implementation.
- [Discussion #210](https://github.com/agentskills/agentskills/discussions/210) proposes a separate `skills.json` manifest and `skills.lock` for dependency resolution and distribution. It supports considering a separate distribution contract, but it is not the Agent Skills standard.
- [#485](https://github.com/agentskills/agentskills/issues/485) remains an open tool-dependency proposal; [#330](https://github.com/agentskills/agentskills/issues/330) is a closed `required-tools` proposal. Tool availability, skill installation and permissions are different concerns.

## Vercel Skills: metadata survives parsing, but it is not a skill dependency resolver

The YAML parser returns `Record<string, unknown>`. The skill model allows `metadata?: Record<string, unknown>`, and `parseSkillMd` retains an object-shaped metadata value. This implementation is more permissive than the standard's string-value type. It actively tests `metadata.internal === true`, hiding internal skills unless explicitly included or enabled by the environment. Therefore a nested dependency array can parse in Vercel without being standard-compliant or being resolved. [Frontmatter parser][vs-frontmatter], [Skill type][vs-types], [Skill parser][vs-skills].

The examined install flow discovers skills from a source, filters/selects them, installs that selection and writes lock entries. `installFromSource` has no expansion step reading a `requires`, `depends`, `depends_on` or custom metadata dependency graph. Normal `runAdd` likewise installs `selectedSkills`; it does not turn arbitrary skill metadata into additional source requests. This is a bounded code-reading conclusion about these paths, supported by still-open requests [#515](https://github.com/vercel-labs/skills/issues/515), [#860](https://github.com/vercel-labs/skills/issues/860) and [#1438](https://github.com/vercel-labs/skills/issues/1438). [Install flow][vs-add].

There **is** another dependency-related mechanism in current source: `experimental_sync` reads an array-valued **`package.json` `skills` field**, including remote Git sources and `npm:<package>` references. It scans the project and direct installed dependencies, then follows explicitly referenced `npm:` packages with a visited set; npm/package-manager resolution supplies those packages' versions. Remote declarations call `installFromSource`. This is distribution metadata in npm packages, not a reader for `SKILL.md` skill dependencies, and not automatic installation of every transitive npm package's skills. [Skills field grammar/parser][vs-field], [Sync traversal][vs-sync], [CLI command names][vs-cli].

The locks are flat maps keyed by skill name:

- Global v3 records source information, optional `ref`/`skillPath`, `skillFolderHash`, timestamps and optional plugin/provider details. The documented folder-hash field describes a GitHub tree SHA. [Global lock][vs-global-lock].
- Project v1 records `source`, `sourceType`, `computedHash`, optional `sourceUrl`, `ref`, `skillPath`, npm `version`/`via` and placement/provider details. It has no stable skill ID or dependency edges. Local-folder hashing uses SHA-256 over paths and file bytes, but the add flow can instead use a provider's `snapshotHash`; do not assume every `computedHash` uses the same algorithm. [Project lock and hashing][vs-local-lock], [Source hash selection][vs-add].

`experimental_install` groups existing lock entries by source and re-installs their selected names. Its flow does not compare downloaded content to the old `computedHash` before accepting installation; it restores source selections rather than providing a strict frozen-byte install. A branch/tag `ref` can move. Conversely, saying Vercel cannot pin a commit is too strong: source refs are strings passed through source construction, so an explicitly supplied immutable Git commit can be the ref. There is no separate automatically recorded `resolvedCommit` field in these lock interfaces. A hash alone cannot tell an installer which old repository commit to fetch. [Restore implementation][vs-install], [Ref reconstruction][vs-update-source], [Source parsing][vs-source-parser].

## Agent Skills Sync (Unity): installs the lock, not dependencies declared in a skill

The runtime lock parser accepts format v1, installs `sourceType: github`, and lists other source types as unsupported. `LockedSkill` carries name, source, source type, skill path, content hash and optional ref. It has no metadata, stable-ID or dependency-edge model. The planner iterates locked skills and their selected installation folders; selection applies independently per name. Thus adding a dependency declaration to an upstream skill does not add a missing lock entry or make selecting its parent select it. [Lock parser][sync-lock], [Locked skill][sync-locked], [Planner][sync-plan], [Selection][sync-selection].

The GitHub fetcher downloads `archive/<ref>.zip`, or `archive/HEAD.zip` when ref is absent. It locates the skill by `skillPath`, falling back to folder-name matching when path is omitted; it checks for `SKILL.md` rather than parsing its YAML. Pinned mode verifies fetched content against the lock, including a CRLF-checkout accommodation, and refuses mismatches. Latest mode permits current contents at the selected source/ref. A full immutable commit in `ref` supplies a retrievable historical source; a floating ref plus a hash can fail closed but cannot recover the historical commit. [GitHub fetcher][sync-fetch], [Mode strategies][sync-mode].

Important existing limits for reproducibility:

- Pinned mode refuses hashes identified as skills.sh server hashes; non-ASCII path ordering also limits hash verification on mismatches. This is explicit current behavior, not a reason to silently reinterpret those hashes as local SHA-256. [Hash verification][sync-verification], [Fetcher verification][sync-fetch].
- User-scope scanning treats a child folder containing `SKILL.md` as a skill and uses its **folder name**. The planner skips the project copy when that folder's agents have a same-name user copy and no install-anyway override. Content differences generate warnings, rather than preventing that substitution. Same-name detection is not proof of same publisher, ID, revision or compatibility. [User scanner][sync-user], [User-scope state][sync-user-state], [Planner][sync-plan].
- A copy supplied by a plugin may serve only one agent reading a shared skills folder. The README documents per-folder install-anyway choices and incomplete agent coverage. A machine having a dependency somewhere is insufficient to establish availability to every intended harness. [README, user-scope behavior][sync-readme].

Two real dependency mechanisms in this repo must not be confused with skill resolution. `ClaudePluginSource` follows dependencies among **already installed Claude plugins** to determine whether their skills are available; it does not install those dependencies. Separately, the repository-maintenance workflow parses frontmatter and checks `required_editor_version` and `required_packages` to annotate proposals about Unity requirements. That is CI/research behavior outside the Editor installer, not transitive skill installation. [Plugin scanner][sync-claude], [Maintenance frontmatter parser and requirement checks][sync-ci].

## Actual harness extensions: useful precedents, different contracts

**OpenCode** documents namespaced string metadata such as `opencode/slash` and `opencode/autoinvoke`. The latter can hide a skill from model-facing automatic selection. Its documentation explicitly recommends quoted strings for portability, while accepting booleans as an extension. This is a direct precedent for a small, namespaced metadata convention; it is not skill dependency resolution. [Pinned OpenCode skill docs][oc-docs].

**OpenClaw** ships a GitHub skill with `metadata.openclaw.requires.bins: ["gh"]` and a Homebrew install recipe. Its documentation describes OS, binary, environment and configuration gating. That shipped `metadata.openclaw` is a nested object, outside the standard's string-value shape, even though JSON-like braces make it look superficially similar to a JSON string. Its current docs explicitly describe flattening nested metadata and re-parsing it as JSON5. `skillKey` selects an OpenClaw configuration key; it is not a universal cross-harness skill identity. Do not copy this nested structure into a purportedly portable example. [Shipped GitHub skill][claw-example], [OpenClaw skill docs][claw-docs], [Metadata interpretation][claw-frontmatter].

**Codex** uses the separate `agents/openai.yaml` sidecar for presentation, invocation policy and `dependencies.tools`. Its documented dependency category is MCP, with server identifier, transport and URL; this is not a dependency on another skill. The loader reads this sidecar and carries its dependencies onward. Official OpenAI documentation also describes connecting skill workflows to MCP tools. Neither establishes an invented `SKILL.md` dependency schema as supported. [Pinned sidecar reference][cx-example], [Metadata loader][cx-loader], [Official build-skills documentation](https://learn.chatgpt.com/docs/build-skills).

**Claude Code plugins** have their own `plugin.json` dependency installation/version rules, including cross-marketplace controls. These are plugin dependencies, potentially bringing many skills and mechanisms together. They do not imply that standalone skill frontmatter has a skill resolver, nor that other harnesses implement Claude's dependency rules. [Official plugin dependency docs](https://code.claude.com/docs/en/plugins/dependencies).

## Proposed metadata contract and compatible YAML

**Proposed:** use a publisher/collection namespace such as `hissal.skill-collection.*`. It is intentionally an example convention, not a registered standard or a claim of owning a DNS domain. Prefer it to generic keys like `dependencies`, `id`, `harnesses` or `requires`. A manager-specific namespace would couple the published skill to one installer; a collection-owned schema can have several consumers. Version the schema separately from skill releases.

The following is **illustrative**. It does not assert these skills or edges have been adopted by the blueprint. Every outer metadata value is a YAML string, and the dependency array is valid JSON inside one string:

```yaml
---
name: code-review
description: Review code changes against the project's standards and specification.
metadata:
  hissal.skill-collection.schema: "1"
  hissal.skill-collection.id: "hissal.skill-collection/code-review"
  hissal.skill-collection.requires: '[{"id":"hissal.skill-collection/codebase-design","source":"self"}]'
  hissal.skill-collection.harnesses: '{"claude-code":"supported","codex":"supported"}'
---
```

Under this **proposed** schema, `source: "self"` means the **same resolved repository commit as the parent**, not the dependent skill's latest branch tip and not an arbitrary same-named installed skill. A release-local catalog maps each ID to its repo-relative skill directory. The harness map is an author's declared support statement, not a harness-controlled activation switch or a promise that the extension is recognized. If a workflow needs a particular capability, such as an MCP server or delegation API, record that requirement separately; harness names alone do not prove capability availability.

JSON-in-string is appropriate for a small declaration. For longer graphs, a separate collection manifest with structured JSON/YAML is easier to validate and review; metadata can carry just the stable ID and a manifest reference. **Proposed:** choose one authored dependency source and generate any mirrors, rather than manually maintaining conflicting lists in frontmatter, pack definitions and lockfiles. Add schema validation in that future consumer; do not depend on incidental permissiveness of an existing YAML parser.

## Proposed identity, resolution and lock semantics

**Proposed:** separate these concepts explicitly:

1. **Identity:** a publisher-qualified logical ID, e.g. `hissal.skill-collection/code-review`, stable across folder renames. `name` remains the invocation/directory slug. An adapted override that is still the same managed skill can retain its collection ID; an independently maintained fork needs its own authority/ID, with provenance to the borrowed source. ID reuse must not silently treat different publishers as interchangeable.
2. **Locator:** repository URL/provider plus repo-relative skill path, resolved by a catalog. URLs make fetching possible but can move or transfer ownership; paths move and are only meaningful within a source. An opaque UUID would still need a lookup catalog and would not solve retrieval. A logical ID alone is also not installable. Normalize equivalent source spellings deliberately, and require explicit mappings for repository transfers or identity aliases.
3. **Requested version:** optional branch/tag/range policy used when resolving or updating. Do not conflate it with the skill ID or content digest. For same-repository core/pack dependencies, inherit the parent's resolved commit by default so one release is coherent. A same-repo dependency should not independently float to `main`.
4. **Resolved source:** the full immutable repository commit plus the exact path at that commit. Record a requested tag/branch separately if useful for future updates. Paths should be repo-relative with forward slashes; never publish one machine's `C:\...` location as the dependency identity.
5. **Integrity:** a content digest with an explicit algorithm and canonicalization/coverage rules. A commit SHA identifies source history; a Git tree SHA, a skills.sh snapshot hash and a local SHA-256 are not interchangeable. Lock all files needed by the skill, including sidecars, references, assets and scripts, and state exclusions and line-ending rules.
6. **Placement and visibility:** installation scope, target harness/folder, and actual enabled visibility. These are environment decisions separate from identity and version. A dependency on a user-invoked skill does not authorize invoking it, and installation does not change the skill's invocation policy.

For a dependency in another repository, **proposed** declarations should supply an explicit locator (or a catalog entry resolving the stable ID) and requested ref. The resulting lock should record `id`, `source`, `path`, `requestedRef`, `resolvedCommit`, algorithm-qualified digest and dependency edges. Also retain which entries are direct requests versus transitive requirements, so pruning one root does not remove a dependency another root still needs. Detect missing IDs, identity/locator disagreement, ambiguous names, cycles under the chosen graph policy and incompatible revisions before changing installation folders.

For this collection, **proposed first scope:** same-repository hard dependencies at the same resolved commit. The `GLOSSARY.md` says every collection skill lives here, so that covers internal core/pack edges without needing an internet-wide skill registry. Treat optional guide routes, suggestions and related reading as soft references; making every guide link a hard dependency would defeat optional packs. Keep external borrowed-source provenance, described in `research/vendoring.md`, separate from the collection's installation identity.

## Proposed route to transitive installation across machines

The minimum useful integration does **not** require changing every harness:

1. Maintainer tooling reads the proposed declarations/catalog, resolves the selected roots' closure at pinned sources, validates it and emits every required skill as a flat `skills-lock.json` entry. It can store graph/ID information in a versioned sidecar; current v1 lock consumers do not enforce that information.
2. For Unity's existing public-GitHub fetcher, put the full resolved commit into each emitted entry's `ref`, preserve `skillPath` and use a verified compatible `computedHash`. Then current Unity code can fetch those already-enumerated entries without learning the dependency schema. This is a proposed generation step, not a capability the package already provides. Non-GitHub sources remain unsupported by that package.
3. To make selecting one optional skill automatically select its requirements, Unity would additionally need dependency-aware selection, opt-out handling and availability checks. A pre-expanded flat lock alone does not prevent a machine from deselecting a required entry.
4. A strict reproducibility mode should only substitute a user/plugin copy when the required identity and locked content are verified **for each intended harness**. A name-only match or an unverifiable hash must be reported as unsatisfied/unverified, not treated as a successful dependency match. Installing a project copy may still leave a higher-precedence user copy active, or expose both; verify the harness's effective selection rather than assuming placement fixes precedence.
5. When an explicit machine opt-out conflicts with a selected parent's hard requirement, report the conflict and let the user exclude the parent or resolve the requirement. Do not silently override their choice. New transitive sources must also follow the sync tool's existing source-consent process; discovering metadata is not source authorization.

The existing package explicitly distinguishes Latest from Pinned modes and defaults to user-scope substitution. Therefore "the same lock is committed" is insufficient to promise identical effective skill sets across machines today. Immutable source selection, checked integrity, dependency-aware selection and verified harness visibility are separate requirements. [Current package behavior][sync-readme], [Selection][sync-selection], [Verification][sync-verification].

## Open decisions for the core review

- Whether to adopt a collection-specific schema now or retain human references until a resolver is funded. Either way, do not present proposed keys as working automatic installation.
- Whether metadata or a separate collection manifest is the authored graph; which stable IDs and rename/fork rules the collection commits to.
- Whether same-release, same-repository dependencies are the first supported contract, and whether cycles are forbidden for installation simplicity or allowed as coherent bundles.
- Whether strict project reproducibility or a contributor's user-scope copy wins when they differ; current sync defaults favor the latter and warn.
- Which harness/version combinations are actually tested. No compatibility run was performed in this research, so the YAML example certifies the declared types, not universal runtime acceptance.

[as-spec]: https://github.com/agentskills/agentskills/blob/69ef37e9424c0a7ea9dd2293b559e43ec8176379/docs/specification.mdx
[as-model]: https://github.com/agentskills/agentskills/blob/69ef37e9424c0a7ea9dd2293b559e43ec8176379/skills-ref/src/skills_ref/models.py
[as-parser]: https://github.com/agentskills/agentskills/blob/69ef37e9424c0a7ea9dd2293b559e43ec8176379/skills-ref/src/skills_ref/parser.py
[as-validator]: https://github.com/agentskills/agentskills/blob/69ef37e9424c0a7ea9dd2293b559e43ec8176379/skills-ref/src/skills_ref/validator.py
[vs-frontmatter]: https://github.com/vercel-labs/skills/blob/13e4063a1cf913f5606d57d42ab83a86f5001e04/src/frontmatter.ts
[vs-types]: https://github.com/vercel-labs/skills/blob/13e4063a1cf913f5606d57d42ab83a86f5001e04/src/types.ts
[vs-skills]: https://github.com/vercel-labs/skills/blob/13e4063a1cf913f5606d57d42ab83a86f5001e04/src/skills.ts#L96-L153
[vs-add]: https://github.com/vercel-labs/skills/blob/13e4063a1cf913f5606d57d42ab83a86f5001e04/src/add.ts#L1310-L1393
[vs-field]: https://github.com/vercel-labs/skills/blob/13e4063a1cf913f5606d57d42ab83a86f5001e04/src/skills-field.ts
[vs-sync]: https://github.com/vercel-labs/skills/blob/13e4063a1cf913f5606d57d42ab83a86f5001e04/src/sync.ts#L166-L310
[vs-cli]: https://github.com/vercel-labs/skills/blob/13e4063a1cf913f5606d57d42ab83a86f5001e04/src/cli.ts
[vs-global-lock]: https://github.com/vercel-labs/skills/blob/13e4063a1cf913f5606d57d42ab83a86f5001e04/src/skill-lock.ts#L8-L63
[vs-local-lock]: https://github.com/vercel-labs/skills/blob/13e4063a1cf913f5606d57d42ab83a86f5001e04/src/local-lock.ts
[vs-install]: https://github.com/vercel-labs/skills/blob/13e4063a1cf913f5606d57d42ab83a86f5001e04/src/install.ts
[vs-update-source]: https://github.com/vercel-labs/skills/blob/13e4063a1cf913f5606d57d42ab83a86f5001e04/src/update-source.ts
[vs-source-parser]: https://github.com/vercel-labs/skills/blob/13e4063a1cf913f5606d57d42ab83a86f5001e04/src/source-parser.ts
[sync-lock]: https://github.com/Hissal/agent-skills-sync-unity/blob/4186d73539238a7b0e248871a74935296fcdd9ee/Packages/com.hissal.agent-skills-sync/Core/Lockfile.cs
[sync-locked]: https://github.com/Hissal/agent-skills-sync-unity/blob/4186d73539238a7b0e248871a74935296fcdd9ee/Packages/com.hissal.agent-skills-sync/Core/LockedSkill.cs
[sync-plan]: https://github.com/Hissal/agent-skills-sync-unity/blob/4186d73539238a7b0e248871a74935296fcdd9ee/Packages/com.hissal.agent-skills-sync/Core/InstallPlanner.cs#L65-L130
[sync-selection]: https://github.com/Hissal/agent-skills-sync-unity/blob/4186d73539238a7b0e248871a74935296fcdd9ee/Packages/com.hissal.agent-skills-sync/Core/SkillSelection.cs
[sync-fetch]: https://github.com/Hissal/agent-skills-sync-unity/blob/4186d73539238a7b0e248871a74935296fcdd9ee/Packages/com.hissal.agent-skills-sync/Core/GitHubSkillFetcher.cs
[sync-mode]: https://github.com/Hissal/agent-skills-sync-unity/blob/4186d73539238a7b0e248871a74935296fcdd9ee/Packages/com.hissal.agent-skills-sync/Core/InstallModeStrategy.cs
[sync-verification]: https://github.com/Hissal/agent-skills-sync-unity/blob/4186d73539238a7b0e248871a74935296fcdd9ee/Packages/com.hissal.agent-skills-sync/Core/LockVerification.cs
[sync-user]: https://github.com/Hissal/agent-skills-sync-unity/blob/4186d73539238a7b0e248871a74935296fcdd9ee/Packages/com.hissal.agent-skills-sync/Core/UserScopeScanner.cs#L49-L84
[sync-user-state]: https://github.com/Hissal/agent-skills-sync-unity/blob/4186d73539238a7b0e248871a74935296fcdd9ee/Packages/com.hissal.agent-skills-sync/Core/UserScopeState.cs
[sync-readme]: https://github.com/Hissal/agent-skills-sync-unity/blob/4186d73539238a7b0e248871a74935296fcdd9ee/README.md
[sync-claude]: https://github.com/Hissal/agent-skills-sync-unity/blob/4186d73539238a7b0e248871a74935296fcdd9ee/Packages/com.hissal.agent-skills-sync/Core/ClaudePluginSource.cs#L86-L173
[sync-ci]: https://github.com/Hissal/agent-skills-sync-unity/blob/4186d73539238a7b0e248871a74935296fcdd9ee/.github/scripts/sync-skills/plan.mjs#L1-L61
[oc-docs]: https://github.com/anomalyco/opencode/blob/582c974ee362683f5dd5c7f9741cae207581c6b5/packages/web/src/content/docs/skills.mdx#L34-L96
[claw-example]: https://github.com/openclaw/openclaw/blob/9bb764cb29f0a7cf7885efb5b3476ad996990b6c/skills/github/SKILL.md#L1-L23
[claw-docs]: https://github.com/openclaw/openclaw/blob/9bb764cb29f0a7cf7885efb5b3476ad996990b6c/docs/tools/skills.md#L449-L650
[claw-frontmatter]: https://github.com/openclaw/openclaw/blob/9bb764cb29f0a7cf7885efb5b3476ad996990b6c/src/skills/loading/frontmatter.ts#L132-L168
[cx-example]: https://github.com/openai/codex/blob/34420d42648f627f766bd347532dcaad5475a68b/codex-rs/skills/src/assets/samples/skill-creator/references/openai_yaml.md
[cx-loader]: https://github.com/openai/codex/blob/34420d42648f627f766bd347532dcaad5475a68b/codex-rs/ext/skills/src/loader/metadata.rs
