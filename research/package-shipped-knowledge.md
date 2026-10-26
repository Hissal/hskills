# Package-shipped vendor knowledge

Research for [Research: package-shipped vendor knowledge](https://github.com/Hissal/skill-collection/issues/70), raised by [Theme: web pack](https://github.com/Hissal/skill-collection/issues/49), part of the [collection blueprint map](https://github.com/Hissal/skill-collection/issues/1). Read 2026-10-26. Vocabulary follows [GLOSSARY.md](../GLOSSARY.md).

**Status:** research complete; adoption and the project configuration contract remain the owner's decisions. This report proposes a route through the existing architecture. It changes no ADR, skill, installer, project configuration or issue state.

## Answer

Package-shipped knowledge is a useful additional **source of vendor knowledge**, with several different delivery mechanisms. It is not a new kind of collection pack. The practical proposal is to let pack setup discover it and let pack guides consult the project's selected sources when answering core extension points. Keep the pack list as a list of pack guides. Keep the collection's skills, vendor knowledge and their installation records distinct.

The strongest advantage is version alignment: a document or skill included in a library's installed package follows that package's release. That advantage does **not** automatically extend to remote Git skills named by an npm package, to a globally installed tool, or to a copy left behind by an earlier installation. Nor does the presence of `SKILL.md` inside a dependency make it visible to either harness. There must be a loading route. [I-load], [N-guide], [S-commands], [P-install], [CC-skills], [CX-skills]

Five findings change the earlier [web discovery pitch](web-pack-discovery.md):

1. **Intent has separate lightweight guidance, explicit mappings and hook delivery.** The default managed block points at discovery; `--map` writes a catalog. Hooks inject another catalog. Those choices have different context costs. An explicit allowlist is supported, but its absence currently permits discovery of all sources with a notice. [I-install], [I-trust], [I-hooks]
2. **Intent's edit gate is weaker than “load the right skill before editing.”** Its generated SessionStart handler itself records a list observation, including after catalog construction catches an error and returns empty. Supported edit calls can subsequently pass without a successful skill load. This is a source-reading finding, not a reproduced runtime result. [I-hook-src]
3. **Next.js uses ordinary documents behind an always-on pointer.** It does not install a native skill for bundled documentation. The managed block is small and version-aware, but an effective instruction-file loading path is still required. [N-guide], [N-generate], [CC-memory], [CX-agents]
4. **`skills experimental_sync` exists in current source and documentation.** It links package skills into native agent skill locations and supports remote declarations. Its discovery, conflict rules and lock differ from the older `skills-npm` tool; the two should not be described as interchangeable implementations. [S-commands], [S-sync], [A-readme]
5. **Playwright's route copies skills.** The copy matches the tool supplying it at installation time; it does not follow future upgrades automatically. A default CLI setup installs `playwright-cli`, although the source tree contains three skills. [P-workspace], [P-install]

## Evidence and boundaries

**Observed** below means read in first-party source or official documentation. It does not mean run on the owner's machine. **Inference** means a conclusion from that evidence. **Proposal** means a possible collection design. **Owner decision** means unresolved policy or architecture.

Only source and documentation inspection was performed. No researched CLI, package install, lifecycle script, hook, browser download, Next.js server, migration or skill-sync command was executed. Repository source files were fetched as text into temporary storage outside this repo. No npm tarball was installed or unpacked to establish release contents. Repository HEAD snapshots can be ahead of published releases: verify a project's actual installed version and files before relying on any mechanism described here. Official documentation pages are dated observations, not immutable release specifications.

The local baseline was `main` at `73606718898812b42703b67ec15411e2511f3e07`. Inputs read: `AGENTS.md`, the issue-tracker instructions, glossary, the map body without opening its other ticket bodies, the research ticket and its comments (none), the web discovery report, ADRs 0002–0004, the core extension-point index, and the existing loading, vendoring and dependency research. The map's recorded install decision supplies the folder/plugin routes. The requested report-on-main instruction supersedes a throwaway research branch; publication belongs to the parent.

### Repository snapshots

Every external repository file citation in this report resolves to a full commit SHA. These are source snapshots, not claims that every feature is available in the corresponding latest npm release.

| Source | Snapshot | Read for |
|---|---|---|
| TanStack Intent | [248c6f0](https://github.com/TanStack/intent/tree/248c6f02605b12f9a31be069fabd945361f701bf) | Discovery, permissions, guidance, generated hooks |
| Next.js | [502b6b7](https://github.com/vercel/next.js/tree/502b6b7daf220f4516eb2d8b7e750ce6874ac201) | Bundled-docs contract and managed instruction writer |
| skills-npm | [37a3aff](https://github.com/antfu/skills-npm/tree/37a3affb356011d52b6e10a6d2066716acd5a4ac) | Original convention and migration boundary |
| Vercel skills CLI | [a80e4c9](https://github.com/vercel-labs/skills/tree/a80e4c9d12d607631249d4d7d059f835d4b2f13a) | Current experimental sync implementation and documentation |
| Playwright CLI wrapper | [b1a5903](https://github.com/microsoft/playwright-cli/tree/b1a5903c5b633b8c9f843ad7b629c2a78437040c) | Documented entry point and tool dependencies |
| Playwright engine | [a2b65a0](https://github.com/microsoft/playwright/tree/a2b65a057a78204d8411b068e1e28d0db23db44b) | Skill content, installer and workspace side effects |
| NuGet documentation | [3882a7e](https://github.com/NuGet/docs.microsoft.com-nuget/tree/3882a7e8f812b84c9169d540f59247d4f0a4b4d0) | Analyzer, README and package-cache conventions |

Claude Code, Codex and Unity documentation are official hosted pages read on the date above. They have no repository SHA asserted here. Unity examples use the versioned Unity 6.0 documentation, not an assumed project Editor version. This repo is not a Unity project; the analogy does not involve running Unity.

## 1. What actually loads

Three questions have separate answers: **where knowledge is distributed**, **how the harness discovers or receives it**, and **when the agent reads it for a task**.

| Mechanism | Where content arrives | Bridge into agent context | What remains version-aligned |
|---|---|---|---|
| Intent, default guidance | Dependency/workspace `skills/` | Managed instruction block tells agent to list and load; tool output supplies the body | Content resolved from the current installed package; the CLI runner must be checked separately |
| Intent, mappings | Same | Always-on task/identity/command mappings in an instruction file | Bodies resolve against installation; generated mapping metadata needs refresh |
| Intent, hooks | Same | SessionStart catalog plus observed-command/edit hooks; later load output | Catalog is rediscovered per session event; successful relevant loading is not guaranteed |
| Next.js | `next/dist/docs/` in installed dependency | `AGENTS.md` block points to relevant files; agent reads them | Bundled docs follow installed `next`; managed block follows writer version |
| Experimental npm skill sync | Root `SKILL.md`, `skills/` or `dist/skills/` in installed packages | Links into `.agents/skills`, plus selected agent locations | Linked bytes follow the installed target; discovery/removal and lock metadata need another sync |
| Package `skills` field with Git sources | Separate source fetched by skills CLI | Native skill installation | Independent Git ref/content; npm package version alone is insufficient |
| Playwright CLI setup | Skills inside supplying `playwright-core` | Copies into `.claude/skills` or `.agents/skills` | Copy matches supplying tool at that moment; refresh is explicit |
| Marketplace vendor plugin | Separate plugin installation | Harness plugin loader | Plugin release/source; no automatic equality with app dependency version |

Sources: [Intent install][I-install], [Intent hooks][I-hooks], [Next.js guide][N-guide], [sync command][S-commands], [sync implementation][S-sync], [Playwright installer][P-install], [Claude plugin installation][CC-plugins], [Codex plugins][CX-plugins].

### Claude Code: observed loading semantics

Native project skills live under `.claude/skills`; personal skills under `~/.claude/skills`; enabled plugins provide namespaced skills. Project skill folders can be symlinks. Normal skill descriptions enter context before invocation; the body is loaded on invocation. `disable-model-invocation: true` removes the description from idle context and leaves user invocation available. Therefore linking every package skill has a recurring description cost. [CC-skills]

Current Claude Code supports direct `AGENTS.md` loading from v2.1.277, but by default a project `CLAUDE.md` or `CLAUDE.local.md` in or above the working directory suppresses that fallback. An explicit `CLAUDE.md` import of `AGENTS.md` remains a supported bridge. Loading both instruction formats is configurable. An existing unrelated `CLAUDE.md` therefore matters when a vendor writes only `AGENTS.md`. [CC-memory]

**Inference:** do not infer visibility from the vendor's “agents read AGENTS.md” statement alone. Setup must account for the actual instruction mode and imports, and avoid loading the same block twice. Plain references permit task-time reading; `@` imports load the imported instructions rather than creating a lazy document catalog. [CC-memory]

### Codex: observed loading semantics

Codex scans repository `.agents/skills` from the current working directory upward to the repository root and supports symlinked skill folders. Skill metadata is initially available; full instructions load when selected. Duplicate names are not merged. `agents/openai.yaml` can disable implicit invocation while preserving explicit invocation. A directory under `node_modules` alone is outside this documented discovery route. [CX-skills]

Codex builds its project instruction chain at run start, root to working directory. At each directory, `AGENTS.override.md` precedes `AGENTS.md`, then configured fallback filenames; at most one is selected there. The default aggregate limit is 32 KiB. **Inference:** writing a block during a running `next dev` session is not proof the current Codex run received it; begin a fresh run or explicitly supply/read changed guidance. [CX-agents]

Current official Codex hooks support SessionStart and PreToolUse, including shell and `apply_patch` paths. Non-managed hooks require review and trust of their definition; project hooks also require a trusted project layer. Specialized tool paths can escape interception. Thus installed hook configuration alone is not evidence it ran, and a tool matcher is not a complete enforcement boundary. [CX-hooks]

**Boundary:** these official CLI semantics do not establish parity in T3, a managed desktop host, cloud sessions or every IDE adapter. OpenCode is supported by the collection, but its current loader/hook behavior was not investigated here. No runtime activation, restart behavior or Windows symlink behavior was tested.

## 2. TanStack Intent

### Observed: discovery and trust

Intent discovers package `skills/` trees, including transitive dependencies and workspace sources. It reads static package files rather than executing discovered package entry points. Yarn PnP resolution is a documented exception: it loads the project's `.pnp.cjs` runtime. npm and `workspace:` identities are distinct policy kinds. The scanner checks resolved skill-file containment within the package root; this protects a filesystem boundary, not the meaning of the instructions. [I-trust], [I-scanner]

`package.json#intent.skills` permits package sources or exact skill identities; `intent.exclude` removes matches afterward. A package/scope rule includes future matching skills. An exact skill rule fixes the name, not future content. Trust does not propagate to dependencies. With **no effective allowlist**, current discovery still surfaces all sources and prints a migration notice. `[]` denies all; `['*']` deliberately enables all. [I-trust], [I-list]

The default first install without a policy requires interactive permission selection and confirmation. A configured project can refresh guidance without changing its permissions. Permission review does not compare content hashes or notify about changed instructions after dependency upgrades. Intent's reserved `git:` source kind is rejected rather than silently loaded. [I-install], [I-trust]

**Inference:** dependency approval and agent-instruction approval are different choices. Intent supplies useful selection controls, but its current default discovery should not be mistaken for deny-by-default admission. A permitted package upgrade can change agent behavior without an additional permission prompt.

### Observed: delivery choices and cost

- **Default `intent install`:** a fixed loading procedure in an `intent-skills` managed block, normally in `AGENTS.md`, or updating an existing supported instruction-file block. It asks for discovery before substantial work and loading relevant skills. No native skill installation is involved. [I-install], [I-guidance]
- **`intent install --map`:** writes `id`, `run` and `for` entries for actionable permitted skills. Reference/meta/maintainer-only skills are excluded from that mapping. The block grows with the selected catalog. [I-install]
- **`intent load <package>#<skill>`:** resolves current package content and prints `SKILL.md`; JSON can include version, package root and path. Supporting references remain separate files. This is a content-loading route, not necessarily a native Skill-tool invocation. [I-load]
- **`intent hooks install`:** independently configures SessionStart and PreToolUse for Claude and Codex, without writing the guidance block. A hook catalog contains package-qualified IDs and normalized descriptions plus instructions to load relevant bodies. [I-hooks], [I-hook-src]

The default guidance is constant-size; mapping and hook catalogs are proportional to the number and length of selected entries. The inspected `formatSkillCatalog` joins every entry and does not impose its own catalog token cap. Exact per-project cost cannot be estimated from repository skill counts alone: effective allowlist, exclusions, package versions and harness output handling matter. Measure actual generated text during a later authorized trial. [I-guidance], [I-hook-src]

The docs recommend installing Intent as a dev dependency and committing the package lock, but also disclose that generated package-manager commands use `@tanstack/intent@latest`. The hook prefers a resolvable local CLI and local bin shim; otherwise it falls back to a package-manager runner. Thus package knowledge may be version-aligned while the loader is floating. The instruction “use installed Intent” is not by itself proof every generated command obeys it. [I-install], [I-hook-src]

### Observed in source: edit-gate limits

The generated runner deserves more precise wording than the discovery report gave it:

1. SessionStart calls `createSessionCatalogContext`, then appends an `action: 'list'` observation to its session/CWD state file.
2. Catalog construction catches failures and returns an empty string. The observation still follows that return.
3. Later supported edit tools are denied only when no list/load observation exists. A separately observed shell load command is also recorded before completion.
4. The script catches outer failures and exits zero. It matches named edit tools, not arbitrary filesystem mutations performed inside a shell command. [I-hook-src], [I-policy]

**Inference, high confidence from source:** after a normal SessionStart path, a catalog attempt alone can satisfy the edit gate. Even absent that path, seeing a load command does not establish success, relevance or application. The hook is a discovery aid and limited edit reminder. It is not a reliable proof-of-read gate or security boundary. The official trust model explicitly distinguishes availability, permission, loading, delivery, activation and application. [I-trust]

Windows compatibility is unproven here. The generated Codex project command uses shell command substitution around `git rev-parse`, with no Windows-specific command in that writer; actual shell/adaptor behavior must be checked. Claude's runner configuration is different. Do not extend this source observation into a claim that all Windows setups fail. [I-hook-src]

**Proposed fit:** optional per-project vendor-knowledge delivery, reached through the web pack's setup/reference knowledge. The static guidance route is the lowest-complexity candidate to evaluate first. Hooks and mapping catalogs need their own context/admission decision. No Intent skill or hook is proposed copied into core.

## 3. Next.js bundled documentation and agent rules

### Observed

The current guide places version-matched docs under `node_modules/next/dist/docs/`. It distinguishes Next.js 16.2, which bundles docs, from 16.3+, which also supports managed instructions. Older versions use a different codemod/download route; that route was not run here. Documentation availability is not a guarantee that an arbitrary package checkout or older installed release contains the directory. [N-guide]

With `agentRules` enabled, `next dev` creates or updates the `nextjs-agent-rules` block when it detects an AI coding agent. The writer preserves content outside its markers and migrates older markers. It can re-add a removed block. The current text points at the installed docs and says to resolve their path from the instruction file's directory, explicitly warning about monorepos. [N-config], [N-generate]

`agentRules: false` stops generation. From 16.4, the next dev run also removes an existing managed rules block, retaining other content and deleting the file only if nothing remains. The `create-next-app --no-agents-md` option separately controls initial scaffolding. Feedback has separate configuration and a separate managed block; enabling documentation instructions does not imply adopting a feedback workflow. [N-config], [N-generate]

The current rules body is roughly 90 words, or approximately 650 characters before substituting marker names; this is a source-text size estimate, not tokenizer measurement. The full docs stay out of initial context until the agent reads a page. An older codemod-generated documentation index is a different artifact with a different cost. [N-generate]

The guide repeats a vendor-reported 100% versus up-to-79% evaluation comparison. That is not evidence that every project should prefer always-on text over skills, nor a result reproduced here. This report makes no adoption recommendation from the percentage. [N-guide]

### Inferences and proposed fit

The useful unit is a small pointer to installed-version reference material. Native skill registration is unnecessary for documentation access. A pack guide can say how to locate the installed framework docs and use them for the caller's need, without copying framework conventions into the collection.

`setup-project` must preserve vendor marker ownership. Rewriting the whole `AGENTS.md`, deleting the block as “generated noise,” or putting collection-owned content between vendor markers creates a recurring conflict. If the owner chooses a different discovery pointer, disabling the producer is a deliberate Next.js project configuration change, not a cleanup operation. Keeping the vendor block is also a choice with idle-context cost.

Instruction loading must be checked separately: a project `CLAUDE.md` can mask the new `AGENTS.md`; `AGENTS.override.md` can replace Codex's selected file at that directory. A root pointer must reach the correct application directory in a monorepo; one hoisted dependency path cannot be assumed to represent every app's version. [CC-memory], [CX-agents], [N-guide]

**Proposed fit:** discovered project documentation, usually consulted on demand through the web guide's knowledge answer. Retain an already-selected vendor pointer rather than generating a second one. Whether setup offers to enable, retain or disable automatic rules remains an owner decision.

## 4. skills-npm and `skills experimental_sync`

### Observed: related conventions, different implementations

`skills-npm` says it is merging into Vercel's skills CLI and will eventually be deprecated. Its documented migration changes scripts/dependencies, removes `skills-npm-lock.json`, and moves tracking to `skills-lock.json`. Its own configuration file is not read by the replacement. This is a migration, not just an alias. [A-readme]

At the inspected Vercel snapshot, `experimental_sync` is documented and implemented. It reads the project's declared installed dependencies, including dev, optional and peer dependency fields. `--recursive` adds workspace packages' declared dependencies; it is not an indiscriminate recursive sweep of every transitive npm dependency. `npm:` declarations can explicitly reach installed packages relative to their declaring package, accommodating isolated layouts. [S-commands], [S-sync]

The current sync scanner recognizes package-root `SKILL.md`, `skills/<name>/SKILL.md` and `dist/skills/<name>/SKILL.md`. The root skill wins that scan path. The older `skills-npm` README additionally advertises `.agents/skills` scanning; that location is not in this replacement scanner's loop. Do not assume a single interoperable npm discovery specification from the tools' shared purpose. [A-readme], [S-sync]

Two delivery branches must stay distinct:

| Branch | Observed behavior | Version claim it supports |
|---|---|---|
| Skill included in installed package, directly or reached with `npm:` | Symlink by default into shared `.agents/skills`, with selected agent links; `--copy` is available | Bytes come from installed package. Linked content follows target updates; copies need resync |
| Git skill named in a package's `skills` array | Installs through the ordinary source installer; cached remote content is reused when already installed | A separately selected Git source/ref. An unpinned request is not made version-matched by the declaring package's version |

[S-commands], [S-sync]

Native loading follows placement: for Claude Code, select its `.claude/skills` links as well; `.agents/skills` alone is not its documented project skill root. Codex explicitly supports the shared directory and symlinked skills. A fresh clone still needs dependencies restored; broken links are not available knowledge. These facts do not establish Windows checkout/junction parity. [S-commands], [CC-skills], [CX-skills]

### Observed: ownership, locks and automation

Current sync protects explicit `skills add` installations and destinations it considers foreign. A nearer package wins over a farther one, while equal-depth name collisions skip all contenders with warnings. Shipped skills can replace remote skills that sync itself installed. Cleanup prunes previously managed skills no longer provided. Include/exclude filters apply to both branches; `--no-remote` suppresses remote installation and removal. These are useful ownership rules, but native skill names still do not constitute publisher-qualified identity. [S-sync], [S-commands]

The package lock resolves npm contents. `skills-lock.json` records sync's skill source, path, npm version and computed hash where available. This sync implementation catches lock-update failures rather than failing the whole installation. Thus “sync complete” is not sufficient proof of a coherent lock, successful placement for every agent, or effective selection in the harness. Existing [dependency research](2026-10-16-skill-dependency-metadata.md) also distinguishes source selection from frozen-byte restoration. [S-sync]

The documented automatic route adds `skills experimental_sync -y` to `prepare`. The source also enables noninteractive mode when it detects an AI agent. Discovery can include remote source requests from a dependency's `skills` field. Consequently a future setup command is potentially an installation/removal/network operation even if its name sounds like local catalog refresh. No such command was run for this investigation. [S-commands], [S-sync]

### Proposed fit

This is a candidate delivery mechanism for **selected** vendor skills, with native harness discovery and its associated description costs. It is not the collection's manifest definition, a substitute for ADR 0004's identity contract, or evidence that hard `SKILL.md` requirements are resolved.

Evaluate manual, explicit selection before adopting a prepare hook. If a project later chooses automatic sync, record the chosen filters, target harnesses, remote-source policy and lifecycle ownership in project configuration. Treat a new dependency, new skill, removal or content change as a reviewable consequence. This is a proposed requirement for a future implementation, not a capability asserted for current sync.

## 5. Playwright CLI's in-package skills

### Observed

The wrapper README recommends `playwright-cli install --skills`; its package manifest pins its own Playwright dependencies. The engine source stores skills under `packages/playwright-core/src/tools/skills/`. Current engine main and the wrapper's pinned alpha dependency are different versions; these snapshots establish architecture, not identical release contents. [P-readme], [P-wrapper], [P-skill]

The engine installer has three named skill sources: `playwright-cli`, `playwright-component-testing` and `playwright-trace`. But the CLI workspace initialization path calls `installSkills(['playwright-cli'], ...)`. It defaults to the `claude` target and uses `agents` only when that value is explicitly selected. The installer recursively copies from its own library path to the project or home agent directory. It does not create a package-following link or a skill provenance lock in this function. [P-workspace], [P-install]

The install path also initializes `.playwright`, may edit `.gitignore`, and can ensure/download a configured browser or a default browser and ffmpeg. It is not a read-only “expose documentation” operation. This matters when designing a later setup prompt; it does not authorize any of those actions in this research. [P-workspace]

### Inferences and proposed fit

“Version-matched” here means **matched to the tool supplying the copy**, at copy time. A globally installed CLI need not match the project's `@playwright/test`, and a copied skill can outlive a tool upgrade. Setup would need to record the supplying tool/version and refresh ownership if this route is selected.

The web guide can return relevant Playwright knowledge during browser verification or test authoring while retaining the caller's core process. The CLI skill also carries an executable browser workflow; a knowledge lookup must not automatically launch it. Pick a browser-control route that fits the project's tools. Marketplace Playwright guidance, host browser tools and the package copy may overlap, but sharing a product name does not prove they perform the same job.

## 6. Package knowledge versus marketplace vendor skills

**Observed:** a plugin installation can contribute skills, agents, hooks and external tools. Its installation/update lifecycle is independent of npm dependency installation. Neither official harness documentation cited here promises to choose a plugin version from the project's library lockfile. [CC-plugins], [CX-plugins]

**Inference:** source authority, version relevance, delivery and invocation are independent axes. A vendor can publish in both places, and a marketplace listing can come from someone other than the product's maker. Distribution through npm is not by itself a reason to prefer its instructions. Distribution through a marketplace is not by itself a reason to reject version-relevant guidance.

Proposed selection rubric, for the owner to adopt or revise:

| Need or condition | Proposed treatment |
|---|---|
| API conventions for the exact installed library | Start with approved package-local docs/skills if present and relevant; they provide the clearest release relationship |
| Deployment, migration, service access, live diagnostics or an external account | Consider the selected vendor workflow/plugin/tool; bundled API docs may not cover the job |
| Package guidance and marketplace guidance duplicate the same job | Select one authoritative route for that scope; keep a complementary workflow only when its difference is useful |
| Package guidance conflicts with project rules or selected workflow | Report the concrete conflict and versions; preserve user authority rather than silently selecting the loudest instruction |
| Package has no knowledge, or dependencies are not restored | Record unavailable evidence; use an approved version-specific external source or ask for an authorized restore, rather than claiming latest docs match |
| Different workspace apps use different versions | Resolve from the application being changed and identify that scope in the answer |
| A package ships a broad workflow or asks for hooks/commands | Review its behavior and costs separately from permission to read API documentation |

This proposal needs no copy of vendor knowledge into the collection. Adapted collection skills still follow [ADR 0002](../docs/adr/0002-every-skill-lives-in-this-repo.md); externally selected vendor material remains external project knowledge. The [vendoring report](vendoring.md) concerns maintaining borrowed/adapted skills and should not be stretched into a requirement to vendor all dependency documentation.

## 7. How setup, pack lists and core can see it

### Existing decisions

[ADR 0003](../docs/adr/0003-core-reaches-packs-through-the-pack-list.md) already separates two paths. `setup-project` discovers installed pack guides and reads their `SETUP.md`; ordinary core extension points consult the project's configured pack list. The guide answers a stated need. A knowledge answer stays in the caller's job and does not start the core workflow on which a pack skill normally layers. The [core extension-point index](../docs/agents/core-extension-points.md) records these needs.

[ADR 0004](../docs/adr/0004-skill-dependencies-use-agent-skills-sync-metadata.md) separates publisher-qualified skill identity, source resolution, availability and permission to invoke. External hard requirements need a later locator/version contract. Nothing found here implements that contract merely by sharing `skills-lock.json` or publishing a package `skills` field.

### Proposed route, with no new core vendor names

1. **Setup enters the relevant pack's `SETUP.md`.** That document supplies ecosystem-specific inspection knowledge: dependency/lock files, workspace boundaries, known package locations and supported delivery formats. Generic setup does not need to know Intent, Next.js, npm, NuGet or UPM by name.
2. **Discover without activating.** Inspect project declarations, already-restored package files, existing instruction markers, skill links/copies and enabled vendor plugins. If dependencies are absent, record that limit. Do not download or invoke a package's setup command as a discovery shortcut.
3. **Present concrete choices once.** Distinguish merely available knowledge from selected sources, native skill placement, always-on text, hooks and automatic syncing. Show actual files, loader versions, additional writes and any remote fetch/lifecycle behavior. Preserve decisions already made for the project.
4. **Record only project facts and selections.** Keep package versions and dependency graphs in their existing lockfiles. Record how this project reaches selected vendor knowledge, which scope it serves, and who owns refresh/removal. Reuse native vendor policy/configuration rather than duplicate its whole catalog in a new document.
5. **Keep the pack list unchanged in meaning.** It names actual pack guides and their domains. Raw `SKILL.md` paths, npm package names, remote skill packs and Next.js docs are not pack guides simply because they carry knowledge. The pack guide consults the selected sources when answering a caller.
6. **Check effective visibility during implementation.** Placement, instruction-file selection, missing dependencies, conflicts and actual content versions are separate checks. Availability is not proof of activation or successful application.

**Proposed small project record:** a pointer beside the pack list to a scoped vendor-knowledge section in the project's existing agent configuration document. For each selected source, it could state package/tool identity, workspace scope, document or native skill/Intent route, configuration owner, and refresh condition. This is an illustrative information set, not a chosen filename, JSON schema, mandatory manifest or new glossary term. A project with a sufficient native policy may need only a pointer to it.

Example of information a future setup might record, without copying vendor instructions:

```text
Scope: apps/store
Knowledge: installed framework documentation
Resolve relative to: apps/store (use its restored dependency version)
Delivery: existing vendor-managed AGENTS.md block
Claude visibility: project CLAUDE.md imports that AGENTS.md
Ownership: vendor owns its markers; setup owns the pack-list section
Refresh: dependency update; missing docs are reported as unavailable
```

The example is a proposal, not a file to write now. It deliberately does not freeze a machine-specific `node_modules` or cache path in committed configuration.

### What an extension-point answer should return

The core caller still asks its existing need. For example, `verifying` asks how to check a change compiles or works. The web guide can return the project's verification commands, installed-version framework references and selected browser tooling. A review asks for failure modes and receives relevant facts; it does not start Playwright setup or a migration workflow. A dependency audit asks about ecosystem dependencies and receives scope/version evidence. No core sentence needs to name a vendor.

**Proposed answer contract:** relevant knowledge, source/version/workspace identity, how it was obtained (read file or load output), and any unavailable or conflicting evidence. Workflow suggestions preserve user invocation gates. This applies whether the source is a native skill, an Intent body, a plain doc or a marketplace plugin.

**Inference:** no amendment to ADR 0003 is necessary if vendor knowledge is an internal source consulted by a pack guide. A direct core-to-vendor registry, or admitting arbitrary vendor skills into the pack list without guides, would change the architecture and requires a separate owner decision. Calling an npm publisher's “skills pack” a collection pack would obscure this distinction.

### Updates and removal

Proposed lifecycle policy: dependency changes invalidate previous evidence about package knowledge. Refresh discovery/metadata when packages change; compare relevant changed instructions before expanding permission. Links may update bytes immediately while leaving catalog/lock observations old. Copies need refresh. Remote declarations keep their own immutable source selection. Removed packages should lose their owned delivery artifacts without deleting handwritten configuration or separately installed skills. No installer should claim ownership of an existing file solely because its name matches.

These are proposed acceptance conditions. Current Intent does not supply instruction-change notifications; current sync has its own ownership heuristics; current Playwright copying supplies no complete managed-artifact lifecycle. None should be described as already implementing the whole policy. [I-trust], [S-sync], [P-install]

## 8. NuGet and Unity: how far the analogy holds

### NuGet — observed

NuGet packages can distribute analyzers for the APIs they implement. Analyzer assemblies have a defined `analyzers/` layout and are executable compiler tooling, not instructions loaded into an agent prompt. NuGet also supports a Markdown package README. Under PackageReference, restored packages are expanded by identifier/version in the configured global packages directory; that directory can be relocated. [D-analyzers], [D-readme], [D-cache]

**Inference:** a C# pack could consult approved docs from the project's resolved package version and use analyzer diagnostics as evidence during its existing check process. Finding a package in the global cache does not establish that the project references it, because several versions can coexist. Use the project's resolution evidence, not a broad cache scan or a hard-coded user path. A package README may merely link to floating online docs.

**Evidence limit:** this investigation establishes distribution and resolution primitives, not a NuGet-wide Agent Skills convention, native Claude/Codex discovery in NuGet caches, or a safe script to register skills during restore. Do not promote a hypothetical NuGet Intent clone, analyzer execution policy or new C# pack dependency from this analogy.

### Unity — observed

Unity's documented package layout includes `Documentation~`; its contents can hold package Markdown docs and avoid asset `.meta` tracking. The package manifest can point the Documentation link elsewhere via `documentationUrl`. `UnityEditor.PackageManager.PackageInfo.resolvedPath` exposes the resolved local package location. Registry package contents are immutable, while embedded packages can override registry versions. [U-layout], [U-docs], [U-path], [U-embed]

**Inference:** a Unity guide can locate the package actually in use and consult its approved documentation for a relevant need. Embedded/local sources require attention to actual content, not only a manifest version. Unity explicitly discourages general access to the package cache outside its documented embedding procedure; a custom cache crawler is not established as a supported integration by `resolvedPath` existing. Prefer supported package metadata and documentation entry points. Do not rewrite `Library/PackageCache` or embed a package merely to expose its documentation. A `documentationUrl` may lead away from version-matched local material. [U-embed], [U-path], [U-docs]

**Evidence limit:** these facts do not establish automatic skill discovery inside UPM packages. Existing Unity Agent Skills Sync is a separate delivery route: the [dependency research](2026-10-16-skill-dependency-metadata.md) describes its GitHub lock support and limits. It is not evidence that an arbitrary installed UPM package's documentation or `SKILL.md` becomes a native harness skill. The `skills-lock.json` npm entries described here must not be assumed compatible with that tool. No UPM agent loader or Unity-specific hook is proposed adopted.

## 9. Newly sharp owner decisions

The research ticket can be resolved as an investigation without resolving these adoption questions. Suggested questions for the parent to carry to a decision session:

| Decision | Alternatives now distinguishable | Proposed starting point, not adopted |
|---|---|---|
| **Where vendor knowledge becomes reachable** | Pack guide consults selected project sources; or a new direct core/provider registry | Use existing pack setup and guide path; leave the pack list as guides |
| **What dependency installation permits** | All shipped instructions automatically; explicit package permission including future skills; exact skill selections | Explicit selection with scope and update implications visible; package availability alone grants no instruction authority |
| **What should be always-on** | Minimal discovery pointer; full mapping/catalog; native skill descriptions; hook catalog | Reuse the smallest sufficient existing pointer; evaluate catalogs/hooks per project against their actual output |
| **Who owns refresh and generated files** | Manual setup refresh; package lifecycle automation; vendor producer owns a block/copy; collection takes ownership | Preserve producer markers and one writer per artifact; choose automation separately and record how removal works |
| **What counts as version evidence** | Installed package identity only; package plus content/source record; independent remote ref | Package resolution plus relevant content identity; remote skills need separate immutable refs; copied skills need supplying-tool evidence |
| **How package and marketplace guidance coexist** | Automatic package precedence; automatic marketplace precedence; choose per job and compatibility | Choose by task and version relevance, identify conflicts, avoid duplicate guidance for the same job |

The first and fourth questions are architecture/setup decisions with effects beyond the web pack. The second and third are instruction-admission/context policy. The fifth intersects ADR 0004 but does not by itself decide an external dependency contract. The sixth belongs in pack setup and project choices. They may be answered together; nothing here authorizes a new installer or pack adoption.

### Later validation, only after the owner selects a route

A small authorized trial should cover one dependency-only project and one workspace with different versions, on both actual target harnesses. Its acceptance evidence would include:

- Correct installed-version source, including missing dependencies and an embedded/local override where applicable.
- Effective Claude and Codex instruction/skill discovery, including a conflicting existing instruction file and duplicate native/plugin skills.
- Idle text/description/hook-output sizes from the real project, with body/reference loads recorded separately.
- Dependency upgrade, package removal, stale copied content, changed remote ref and preservation of handwritten artifacts.
- Windows link/checkout behavior and the exact tool/hook paths the host actually exposes.
- For any hook candidate: trusted versus untrusted state, catalog failure, list without load, failed load and shell-write bypass. Passing the Intent gate cannot be the success criterion.

This is a bounded verification proposal, not work performed in this report. Source inspection is sufficient to select which route deserves that trial; it cannot prove harness activation, instruction quality or improved task outcomes.

## Sources

Repository links below are immutable snapshots. Hosted docs are current observations as of 2026-10-26.

[I-trust]: https://github.com/TanStack/intent/blob/248c6f02605b12f9a31be069fabd945361f701bf/docs/concepts/trust-model.md
[I-list]: https://github.com/TanStack/intent/blob/248c6f02605b12f9a31be069fabd945361f701bf/docs/cli/intent-list.md
[I-load]: https://github.com/TanStack/intent/blob/248c6f02605b12f9a31be069fabd945361f701bf/docs/cli/intent-load.md
[I-install]: https://github.com/TanStack/intent/blob/248c6f02605b12f9a31be069fabd945361f701bf/docs/cli/intent-install.md
[I-hooks]: https://github.com/TanStack/intent/blob/248c6f02605b12f9a31be069fabd945361f701bf/docs/cli/intent-hooks.md
[I-hook-src]: https://github.com/TanStack/intent/blob/248c6f02605b12f9a31be069fabd945361f701bf/packages/intent/src/hooks/install.ts
[I-policy]: https://github.com/TanStack/intent/blob/248c6f02605b12f9a31be069fabd945361f701bf/packages/intent/src/hooks/policy.ts
[I-guidance]: https://github.com/TanStack/intent/blob/248c6f02605b12f9a31be069fabd945361f701bf/packages/intent/src/commands/install/guidance.ts
[I-scanner]: https://github.com/TanStack/intent/blob/248c6f02605b12f9a31be069fabd945361f701bf/packages/intent/src/discovery/scanner.ts
[N-guide]: https://github.com/vercel/next.js/blob/502b6b7daf220f4516eb2d8b7e750ce6874ac201/docs/01-app/02-guides/ai-agents.mdx
[N-config]: https://github.com/vercel/next.js/blob/502b6b7daf220f4516eb2d8b7e750ce6874ac201/docs/01-app/03-api-reference/05-config/01-next-config-js/agentRules.mdx
[N-generate]: https://github.com/vercel/next.js/blob/502b6b7daf220f4516eb2d8b7e750ce6874ac201/packages/next/src/server/lib/generate-agent-files.ts
[A-readme]: https://github.com/antfu/skills-npm/blob/37a3affb356011d52b6e10a6d2066716acd5a4ac/README.md
[S-commands]: https://github.com/vercel-labs/skills/blob/a80e4c9d12d607631249d4d7d059f835d4b2f13a/docs/commands.md#skills-experimental_sync
[S-sync]: https://github.com/vercel-labs/skills/blob/a80e4c9d12d607631249d4d7d059f835d4b2f13a/src/sync.ts
[P-readme]: https://github.com/microsoft/playwright-cli/blob/b1a5903c5b633b8c9f843ad7b629c2a78437040c/README.md
[P-wrapper]: https://github.com/microsoft/playwright-cli/blob/b1a5903c5b633b8c9f843ad7b629c2a78437040c/package.json
[P-workspace]: https://github.com/microsoft/playwright/blob/a2b65a057a78204d8411b068e1e28d0db23db44b/packages/playwright-core/src/tools/cli-daemon/program.ts
[P-install]: https://github.com/microsoft/playwright/blob/a2b65a057a78204d8411b068e1e28d0db23db44b/packages/playwright-core/src/tools/utils/installSkills.ts
[P-skill]: https://github.com/microsoft/playwright/blob/a2b65a057a78204d8411b068e1e28d0db23db44b/packages/playwright-core/src/tools/skills/playwright-cli/SKILL.md
[CC-skills]: https://code.claude.com/docs/en/skills
[CC-memory]: https://code.claude.com/docs/en/memory
[CC-plugins]: https://code.claude.com/docs/en/discover-plugins
[CX-skills]: https://learn.chatgpt.com/docs/build-skills
[CX-agents]: https://learn.chatgpt.com/docs/agent-configuration/agents-md
[CX-hooks]: https://learn.chatgpt.com/docs/hooks
[CX-plugins]: https://learn.chatgpt.com/docs/plugins
[D-analyzers]: https://github.com/NuGet/docs.microsoft.com-nuget/blob/3882a7e8f812b84c9169d540f59247d4f0a4b4d0/docs/guides/analyzers-conventions.md
[D-readme]: https://github.com/NuGet/docs.microsoft.com-nuget/blob/3882a7e8f812b84c9169d540f59247d4f0a4b4d0/docs/nuget-org/package-readme-on-nuget-org.md
[D-cache]: https://github.com/NuGet/docs.microsoft.com-nuget/blob/3882a7e8f812b84c9169d540f59247d4f0a4b4d0/docs/consume-packages/managing-the-global-packages-and-cache-folders.md
[U-layout]: https://docs.unity3d.com/6000.0/Documentation/Manual/cus-layout.html
[U-docs]: https://docs.unity3d.com/6000.0/Documentation/Manual/cus-document.html
[U-path]: https://docs.unity3d.com/6000.0/Documentation/ScriptReference/PackageManager.PackageInfo-resolvedPath.html
[U-embed]: https://docs.unity.com/en-us/engine/6000.0/manual/packages-list/dependencies-lp/upm-embed

Primary references: [Intent trust model][I-trust], [Intent install][I-install], [Intent hooks][I-hooks], [Next.js AI guide][N-guide], [Next.js agentRules][N-config], [skills-npm README][A-readme], [experimental sync][S-commands], [Playwright installer][P-install], [Claude Code skills][CC-skills], [Claude Code memory][CC-memory], [Codex skills][CX-skills], [Codex project instructions][CX-agents], [Codex hooks][CX-hooks], [NuGet analyzer conventions][D-analyzers], [Unity package layout][U-layout].
