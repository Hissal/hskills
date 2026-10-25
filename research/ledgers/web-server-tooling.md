# Ledger: web server, TypeScript and tooling skills

Ticket: [#68](https://github.com/Hissal/skill-collection/issues/68), part of [Wayfinder #1](https://github.com/Hissal/skill-collection/issues/1), feeding [Theme: web pack #49](https://github.com/Hissal/skill-collection/issues/49). Read on 2026-10-25 through `gh api` and raw source files. Nothing from a source was installed or executed; examples, SQL, hooks, generators and installers were read as text. No runtime correctness is claimed.

Vocabulary follows [GLOSSARY.md](../../GLOSSARY.md). Every recommendation is **proposed**. The owner decides; this ledger does not amend a decision.

## Sources and reading boundary

| Source | Full HEAD SHA read | Change since discovery | Scope read | Licence |
|---|---|---|---|---|
| `mcollina/skills` | [`c75d70dbfbe991d8cec42aeda0b64ff14fbb9ac7`][m-root] | unchanged | all five requested `SKILL.md` in full; all their rule/reference paths inventoried and downloaded; Node TypeScript rule in full, streams/stuck-test/shutdown and other rule files selectively; Fastify deployment rule selectively; README and licence. Six unrelated skills not reviewed | [MIT][m-license], Matteo Collina, 2026 |
| `antfu/skills` | [`8886fe2d385d3644cbb47e46ae9cb1cf09307d3b`][a-root] | unchanged | Vite, Vitest and pnpm skills and generation metadata in full; all 44 associated reference paths inventoried, selectively read/searched, especially Vite config/environment/migration, Vitest mocks/type testing, pnpm config/security/CI; README, AGENTS.md, `.gitmodules`, tree gitlinks and licence. Other nine skills and generator implementation not reviewed | [MIT][a-license], Anthony Fu, 2025–present |
| `wshobson/agents` | [`0874a27b17a22e2b7c2e2bcd725768e0803cad06`][w-root] | unchanged | all 9 backend, 4 JavaScript/TypeScript, 4 observability, 4 CI/CD and 4 incident-response skill bodies read, the longest selectively; API-design, tracing and SLO details in full; saga, Node backend and pipeline details selectively; README, marketplace, relevant plugin manifests and licence. Adjacent FastAPI and Postgres-schema skills inspected for scope only. Most deeper references, agents, commands, evaluators and installers not read | [MIT][w-license], Seth Hobson, 2024; external plugins have separate terms |
| `davidondrej/skills` | [`fa268fec7afc15a8b7a5444cad6c3245c2c7df56`][d-root] | **re-pinned** from earlier ledger's `7874889bd037d411f6079e38ee8601557c4a8995` | old and current `create-readonly-db-role` in full; current adds conditional `BYPASSRLS` guidance and executable SQL. Other skills not re-reviewed | [MIT][d-license] |

The database-vendor corpus and its additional official repositories are pinned separately under D1. All inspected recursive trees were untruncated. Downloaded files were kept outside the worktree. Downloading is not the same as reading: this ledger only makes content claims about the passages described above or under D1.

Cross-checks: [discovery sweep](../web-pack-discovery.md), [frontend ledger](web-frontend-skills.md), [Addy ledger](addy-agent-skills.md), [pstack entry 24](pstack.md#24-typescript-best-practices), [fork ledger](mattpocock-skills-unity.md), [David entry 24](davidondrej-skills.md#24-create-readonly-db-role-and-openrouter), and [loading mechanics](../loading-mechanics.md). Existing ledgers are overlap evidence, not permission to reopen the owner's later decisions.

**Fixed context.** The web pack exists, covers browser, server, data, auth and deploy, and follows the Unity/C#/gamedev shape: one model-invoked `web-guide` owns disclosed references answering core extension points, with skills on top. TypeScript is the baseline; the guide is framework-neutral. Setup picks official vendor skills per project and layers them on without duplicating them. TypeScript style follows one picked project guide, pstack's table as the light default, and project tsconfig/ESLint configuration wins. Observability (Addy), idempotency, security, performance (Core Web Vitals plus optimization patterns) and web deploy ship-readiness are already guide references; core `hillclimb` owns the measurement loop. `setup-ts-deep-modules` is user-invoked, pre-commit setup belongs in web `SETUP.md`, and `risky-changes` is model-invoked. Team needs are in scope; pack size is not a reason to discard them.

**Idle-cost method.** Rounded `(description characters / 2.6) + 5` per skill, matching the frontend ledger and the locally measured ratio in loading-mechanics §6. These are estimates of name/description cost, excluding body, path and harness overhead. Source descriptions have no implicit-invocation gates in the examined M/A/W skills. Disclosed references and correctly gated user-invoked skills cost **0** idle tokens. Gate user invocation for both Claude and Codex, following loading-mechanics; Claude's `disable-model-invocation` alone does not gate Codex. This ledger does not add always-on rules or hooks.

## Overview and proposed synthesis

**26 entries:** M1–M5, A1–A4, W1–W16, D1. Grouped entries cover files doing one job; W8 names three event-system skills, W9 two Temporal skills, W14 three pipeline skills, and W16 three incident-lifecycle skills. The macOS connectivity skill, Python FastAPI templates, and Postgres schema catalogue are explicitly scoped out below. Security-scanning/threat-modelling skills from sweep pitch 9 belong to the security ticket.

The strongest additions are **server runtime/lifecycle and API-contract references**, plus **SLO, tracing and incident material extending Addy's chosen observability reference**. Durable jobs and event processing deserve disclosed coverage for teams, with retries, deadlines, compensation, replay and consistency checks; no blanket microservices, CQRS or Temporal architecture is proposed. Vite, Vitest and pnpm are useful version-bound project tooling, not a new default stack.

| Need reached from core | Proposed guide material | Candidates | Boundary |
|---|---|---|---|
| `codebase-design`, `refactoring`, API review | HTTP/GraphQL contracts: boundary validation, error semantics, pagination, compatibility and request-scoped batching | W1, M2, W2 | Addy's idempotency reference remains the owner of duplicate-request semantics; project framework skills supply implementation |
| `diagnosing-bugs`, `verifying`, `test-review` | Server lifecycle and a Node annex: bounded I/O, streams/backpressure, shutdown/drain, resource teardown, typecheck separate from execution | M1, W2, W4 | Runtime/version detection first; core keeps the diagnosis and verification loops |
| `migrating`, `blast-radius`, `risky-changes` | Durable work and consistency: retries, deadlines, compensation failure, duplicate delivery, replay, checkpoint/side-effect atomicity, lag | W6–W9 | Knowledge disclosed on need; vendor SDK instructions selected per project |
| `hillclimb`, performance review | Bounded caching, concurrency and profiling details | M1, W2 | Append details to the decided performance reference; no competing optimization workflow |
| Observability and deploy verification | SLI definitions, error budgets, burn windows, trace propagation and privacy, tested alerts, incident/runbook/handoff/postmortem evidence | W10–W16 | Extend the decided Addy references; project facts supply targets, runbook paths, escalation, approvals and deployment route |
| Setup and quality gates | Selected compiler/test/lint/package-manager commands and versions, build approvals, clean CI installs, tooling-skill provenance | M5, A1–A4, W14–W15 | One style guide; no neostandard/pnpm/Vitest mandate and no new pre-commit skill |
| Agent database access | Ask vendor knowledge for role mechanics, then prepare/review/verify a restricted connection | D1 | Thin user-invoked candidate only; do not duplicate official grants/RLS references |

**Optional skills on top (proposed):** a project-selected Fastify knowledge skill (M3, clearly maintainer-authored rather than official-org); version-matched Vite/Vitest/pnpm community tooling skills (A1–A3) only where no suitable official/package-shipped skill is already selected; a user-invoked `service-incident-review` using W16's evidence and follow-up structure; and a user-invoked `prepare-agent-db-access` using D1's residual workflow. Names are proposals. Runbook and shift-handoff templates can remain disclosed references without separate skills.

The five mcollina descriptions total **~1,150 tokens**; antfu's three total **~254**; the 24 W skills represented in entries total **~2,736**. These differ from the sweep's `/4` estimates. None is a reason to keep the pack small: references have zero idle cost. Taking every source skill would create competing owners and needless routing. M/A are personal maintainer repositories, **not official vendor distributions**. If setup finds an official vendor/package-shipped equivalent, use it rather than copying the same knowledge into this collection.

### Source conflicts and corrections required before adaptation

| Conflict or defect | Pinned evidence | Proposed treatment |
|---|---|---|
| Native Node TypeScript prescribed for every Node project, with inconsistent minimum-version advice | M1 says prefer stripping over tsx; its [rule][m-node-ts] includes Node 20 under a stripping command and says Node 22.19 enables stripping by default. Node's own **22.18.0** release docs say it was enabled in 22.18, allow a full-support runner, and say Node ignores tsconfig ([release commit][node-ts]) | Detect runtime/build requirements; retain independent typechecking; do not replace the project's runner or tsconfig |
| Shutdown examples disagree inside mcollina | Node's [shutdown section][m-shutdown] says Fastify automatically handles shutdown and shows only `onClose`; Fastify's [deployment rule][m-fastify-deploy] explicitly registers `close-with-grace` to call `app.close()` | Preserve the lifecycle requirement; verify signal and platform behavior against the installed framework before copying code |
| A predicate claims a stronger type than its checks establish | M2's [API example][m-ts] checks only that `id` and `name` keys exist, then returns `value is User` | `{id: null, name: 123}` passes those checks (*static inference*). Use the picked style guide's boundary schema/checks, not this predicate |
| Prescriptive tooling and language taste | M5 installs neostandard/ESLint 9; A1 always chooses ESM; W3 prefers `interface`; W5 prefers arrows/array methods | Existing config and the owner's one-style-guide decision win; extract task-specific knowledge only |
| Generated-tooling metadata needs version reconciliation | A1 targets Vite 8.3.1; A2 targets Vitest **5.1.0-beta.1**; A3 targets pnpm 12. Vite/pnpm `GENERATION.md` SHAs differ from their source gitlinks at the same antfu commit ([generation files][a-vite-gen], [pnpm][a-pnpm-gen], [tree][a-root]); pnpm's frontmatter names `pnpm/pnpm`, whereas [`.gitmodules`][a-modules] points to `pnpm/pnpm.io` | Generation SHA is the last recorded generation baseline, not proof of full sync to the current gitlink. Check installed versions and the underlying docs; do not apply these skills to older majors blindly |
| POST idempotency and versioning guidance conflict with chosen API policy | W1 warns against POST for idempotent operations and says to version APIs from day one; Addy's chosen idempotency reference explicitly handles keys for repeated requests | Transport method does not replace the chosen duplicate-request contract; compatibility/version policy is a project fact, not a compulsory `/v1` rewrite |
| Saga templates overstate guarantees | W7 advertises atomic rollback/always-successful compensation; its own [details][w-saga-detail] admit compensation can fail. The idempotency example checks for a record then calls an unspecified `reserve`, with no atomic claim shown | Keep tests for duplicate delivery/partial failure; require atomic claim/outbox guarantees from implementation evidence. Do not infer them from the template |
| SLO formulas and alert wiring are incomplete/inconsistent | W10 [body][w-slo] defines only a 5-minute burn-rate recording rule while alerts reference 1h/6h/30m rules. It combines a 28-day SLI window with 30-day downtime arithmetic; names a latency example `p95` while targeting 99% under 500 ms | Choose the event population/window first; recompute thresholds, define every rule and verify alert behavior. Do not copy YAML as a complete monitoring setup |
| Error-budget release thresholds differ | W10 freezes non-critical changes at 10% remaining; Addy's [shipping ledger entry 38](addy-agent-skills.md#38-shipping-and-launch) describes a different 20% staged-rollout gate | Do not import either number as universal policy; the team's stated policy belongs in project configuration |
| Secret-handling rules contradict examples | W15 [GitHub examples][w-secrets] say never print secrets, but its GitLab example echoes `$API_KEY` and `$DATABASE_URL` | Strip secret output and literal secret-creation commands from adapted examples; resolve credentials through the host's protected channel |
| Read-only roles overlap official skills; RLS policy differs | D1: official Supabase/Neon contain role recipes; current David adds `ALTER ROLE ... BYPASSRLS`; PlanetScale warns its reader does not bypass RLS | Reuse vendor mechanics, preserve RLS by default, and keep credential identity/permission checks. Never use nonempty query results as a reason to disable tenant filtering |

All three main sources are permissively licensed: copied or adapted material carries its source SHA, copyright and licence notice. This is permission to copy with provenance, not a requirement to install unchanged. No CC-BY-SA material is copied; the owner's ideas-only rule remains intact.

## Matteo Collina: `mcollina/skills`

### M1. `node`

- **What it is.** A Node knowledge entry with 15 rule files, covering native TypeScript, async/error patterns, streams, cache/logging, profiles, environment, shutdown and hanging tests. The [skill][m-node] routes concrete symptoms to those files; [stuck-test guidance][m-stuck] ties teardown to the resource's creation scope.
- **Kind**: skill.
- **Proposed address**: web pack model-invoked `web-guide` reference, with a Node-specific disclosed annex; no separate `node` trigger.
- **Why it could fit**: operational detail beyond browser work, especially backpressure, resource cleanup and server shutdown. Team CI hangs are real server-verification needs.
- **Why it might not**: broad ~326-token description; unconditional type stripping, library picks and Unix `SIGUSR1`/`kill`/`timeout` commands. Fastify shutdown advice conflicts internally (table above).
- **Copy / adapt / idea-only**: adapt lifecycle/stream/teardown knowledge with MIT provenance. Detect Node version and project runner, replace Windows-local diagnostic commands, and remove forced library choices. Correct the TypeScript advice against [Node's own docs][node-ts].
- **Overlap**: fork `diagnosing-bugs`, `tdd`, verification; Addy observability/performance; W2. Core owns the loops, this supplies runtime facts. Unity baseline does not cover Node servers.
- **Idle context cost**: ~326 as published; 0 as disclosed references.
- **Recommendation (proposed)**: **adapt selected rules into the server-runtime reference and Node annex**.

### M2. `typescript-magician`

- **What it is.** Type-error investigation, before/after `tsc --noEmit`, elimination of `any`, generics, brands, narrowing and 14 rule files ([skill][m-ts]).
- **Kind**: skill.
- **Proposed address**: web pack model-invoked guide reference for type diagnosis, beneath the picked project style guide.
- **Why it could fit**: call-site validation and before/after compiler evidence are useful for TypeScript changes.
- **Why it might not**: demands type theory explanations, multiple solutions and comprehensive type tests for every challenge; the sample `User` predicate does not check property value types. A second type-discipline skill competes with pstack's chosen default.
- **Copy / adapt / idea-only**: adapt the compiler-evidence and narrowing traps only, with notice. Use the project's actual typecheck command/workspace rather than assuming bare `tsc`; scope removal of `any` to the task.
- **Overlap**: pstack entry 24, `setup-ts-deep-modules`, core `codebase-design`, W3. No Unity-baseline TypeScript replacement.
- **Idle context cost**: ~185 published; 0 as reference.
- **Recommendation (proposed)**: **merge diagnosis details into the TypeScript reference; reject a standalone skill**.

### M3. `fastify` (frontmatter name `fastify-best-practices`)

- **What it is.** Fastify plugin encapsulation, routes, schema validation/serialization, hooks, testing through `inject`, Pino, auth, database and deployment rules; 19 rule files ([skill][m-fastify]).
- **Kind**: skill.
- **Proposed address**: web pack model-invoked optional project selection for Fastify repos; maintainer-authored community knowledge, not an official-org vendor skill.
- **Why it could fit**: useful disclosed implementation detail for a project that actually uses Fastify; its [deployment rule][m-fastify-deploy] explicitly initiates shutdown.
- **Why it might not**: unrelated Node REST prompts appear among its triggers, and it prescribes native type stripping. Framework internals do not belong in the neutral guide. Personal authorship does not establish official vendor status.
- **Copy / adapt / idea-only**: copy/adapt with MIT notice only if no selected official/package-shipped equivalent covers the need; narrow the trigger to Fastify and validate against the installed major. Keep all relative rule files together.
- **Overlap**: M1 runtime, M4 auth, W2 backend templates; vendor layer owns framework implementation. Unity baseline: none.
- **Idle context cost**: ~266 when selected; 0 otherwise.
- **Recommendation (proposed)**: **conditional project pick for Fastify, never a general web-pack default**.

### M4. `oauth`

- **What it is.** Fastify OAuth implementation guidance: authorization-code/PKCE, JWT checks, rotation and four further flow/token references ([skill][m-oauth]).
- **Kind**: skill.
- **Proposed address**: web pack model-invoked guide's decided security reference, auth subsection; implementation delegated to the project's selected auth vendor knowledge.
- **Why it could fit**: makes redirect/state/issuer/audience/token lifetime and refresh handling explicit; forbids raw-token logging.
- **Why it might not**: its broad auth trigger conceals a Fastify implementation. The checkpoint demands `sub` validation, but the shown middleware does not check it; its check of `exp` only rejects expired numeric values. Examples assume separately configured session/JWT plugins, and provider-specific behavior is not verified here.
- **Copy / adapt / idea-only**: adapt neutral review questions with notice; no turnkey auth code. Check actual provider/library and protocol versions before using examples. Do not duplicate Clerk/Auth0/Better Auth/etc. selected official skills.
- **Overlap**: Addy security reference, security-ticket threat modelling, M3, W2; `risky-changes` remains the workflow owner.
- **Idle context cost**: ~209 published; 0 as reference.
- **Recommendation (proposed)**: **merge neutral OAuth checks into security; reject a broad standalone auth skill**.

### M5. `linting-neostandard-eslint9`

- **What it is.** Flat-config setup/migration, neostandard integration, local autofix and non-fixing CI lint runs; five rules ([skill][m-lint]).
- **Kind**: skill.
- **Proposed address**: web pack setup reference reached from `SETUP.md`, not another model-invoked skill.
- **Why it could fit**: migration sequencing and consistent local/CI commands fit teams and setup's chosen quality gates.
- **Why it might not**: prescribes ESLint 9 and neostandard. Neither is the owner's universal TypeScript style decision, and an existing ESLint config wins.
- **Copy / adapt / idea-only**: adapt config-discovery/migration checks with notice; offer version-appropriate instructions only when the project actually chooses that stack. No automatic install or style replacement.
- **Overlap**: pre-commit setup already folded into web `SETUP.md`; pstack TypeScript table and the picked style guide; core constraints/check placement.
- **Idle context cost**: ~164 published; 0 as setup reference.
- **Recommendation (proposed)**: **fold useful migration checks into setup; reject neostandard as a pack default**.

## Anthony Fu: `antfu/skills`

### A1. `vite`

- **What it is.** An index plus six generated references for config/plugins, env/assets, SSR/library builds, environments and Vite 8 Rolldown migration ([skill][a-vite], [generation pin][a-vite-gen]).
- **Kind**: skill.
- **Proposed address**: web pack model-invoked optional tooling skill selected per Vite project, as a community fallback.
- **Why it could fit**: useful build/SSR knowledge without selecting a UI framework; references disclose one topic at a time.
- **Why it might not**: targets Vite 8.3.1, always prefers ESM, and the quick config chooses `target: esnext`. Neither browser support nor module strategy should change merely because this skill is present.
- **Copy / adapt / idea-only**: copy/adapt with MIT notice only after version matching and checking for official/package-shipped coverage. Preserve generation provenance; replace generic trigger with Vite-specific need and defer browser targets to project facts.
- **Overlap**: frontend performance reference covers bundle outcomes; core `migrating` owns migration procedure; vendor framework knowledge stays separate. Unity WebGL build tooling is different.
- **Idle context cost**: ~77 selected; 0 otherwise.
- **Recommendation (proposed)**: **conditional version-matched Vite tooling pick, outside the neutral guide**.

### A2. `vitest`

- **What it is.** A generated API/reference index with 19 references: mocks, fixtures, timers, concurrency, environments, type tests and coverage. It explicitly targets **5.1.0-beta.1** ([skill][a-vitest], [generation pin][a-vitest-gen]).
- **Kind**: skill.
- **Proposed address**: web pack model-invoked optional tooling skill for a matching Vitest project.
- **Why it could fit**: concrete APIs, mock teardown and separate type-testing knowledge support core TDD without replacing it.
- **Why it might not**: beta-only features such as `vi.when` in the [mocking reference][a-mocks] are not a safe assumption for an arbitrary installed Vitest. Passing runtime tests does not prove type correctness.
- **Copy / adapt / idea-only**: copy/adapt with notice, version-check every relevant API, and route TDD/test design back to core. Pick official/package-owned knowledge instead when available; preserve an explicit project typecheck command.
- **Overlap**: fork `tdd` and testing seams, frontend browser-check, W4. This is runner syntax, not another testing philosophy.
- **Idle context cost**: ~73 selected; 0 otherwise.
- **Recommendation (proposed)**: **conditional version-matched Vitest tooling pick; retain separate typechecking**.

### A3. `pnpm`

- **What it is.** A generated pnpm 12 index with 19 references for workspaces, catalogs, patches, store, CI and install-script/trust controls ([skill][a-pnpm], [security reference][a-pnpm-security]).
- **Kind**: skill.
- **Proposed address**: web pack model-invoked optional tooling skill for a matching pnpm project; neutral supply-chain questions also inform setup/security.
- **Why it could fit**: lockfile reproducibility, workspace behavior and explicit dependency-build approval matter for team repos and agent worktrees.
- **Why it might not**: version-specific config migrations (`allowBuilds`, YAML-only settings, v12 commands) could damage an older pnpm project. A command list includes approving every pending build; listing a command is not authorization to do that.
- **Copy / adapt / idea-only**: copy/adapt with notice after matching the project's pinned package-manager version; retain per-dependency build decisions and frozen CI install. Never choose pnpm for a project already using another manager merely to reuse this material.
- **Overlap**: web setup/pre-commit, decided security reference, W14–W15; package-knowledge research owns distribution mechanics.
- **Idle context cost**: ~104 selected; 0 otherwise.
- **Recommendation (proposed)**: **conditional version-matched pnpm tooling pick; adapt neutral install safeguards into setup**.

### A4. Generation provenance (`GENERATION.md`, source gitlinks, generation instructions)

- **What it is.** Documentation-generation convention: record source repo/SHA/date, inspect the docs diff since that SHA, update affected references and metadata ([AGENTS.md][a-agents], [Vite metadata][a-vite-gen]). The README calls the project a proof of concept, not fully tested.
- **Kind**: convention doc / manifest-packaging.
- **Proposed address**: collection maintenance mechanism, not an installed skill or always-on rule.
- **Why it could fit**: a reproducible update boundary for borrowed knowledge and a way to review drift rather than trusting a tool's current website.
- **Why it might not**: generation metadata and gitlink differ for Vite/pnpm; a SHA alone neither validates generated claims nor measures behavioral quality. Scripts and submodules would introduce execution/setup work not needed by this research.
- **Copy / adapt / idea-only**: adapt the provenance convention with MIT notice; record separately the source-doc commit, generated-content commit, target tool version, licence and validation. Do not copy or run the generator as part of adopting knowledge.
- **Overlap**: vendoring/maintenance ledgers and package-shipped-knowledge research. No Unity-baseline skill replacement.
- **Idle context cost**: 0.
- **Recommendation (proposed)**: **use the provenance idea in maintenance; defer generator adoption**.

## Seth Hobson: backend and operations in `wshobson/agents`

The [README][w-readme] counts **94 marketplace entries: 92 local plugins plus 2 external**, 185 local skills, 202 agents and 105 commands. The [marketplace description][w-market] still says 181 skills; the tree contains 185. Counts here use the tree, not that stale description. The repo documents individual-skill installation as distinct from whole-plugin installation, which brings agents/commands and potentially other mechanisms. No install route was exercised. This ledger recommends no whole plugin and no specialist-persona agent.

### W1. `api-design-principles`

- **What it is.** REST/GraphQL contracts, HTTP methods, versioning, pagination, status/error shapes, schema/resolvers and DataLoader examples ([skill][w-api], [details][w-api-detail]).
- **Kind**: skill.
- **Proposed address**: web pack model-invoked guide's API-contract reference.
- **Why it could fit**: fills the server half missing from the frontend ledger; limits on collections and consistent errors are reviewable across frameworks.
- **Why it might not**: examples are largely Python/FastAPI/Ariadne; compulsory API versioning and the anti-idempotent-POST warning conflict with a project-specific compatibility policy and the chosen idempotency reference.
- **Copy / adapt / idea-only**: adapt neutral contract questions with MIT notice, TypeScript examples and explicit authorization/error boundaries; strip the blanket versioning rule. Check library implementations through selected vendor skills.
- **Overlap**: Addy `api-and-interface-design`, core `codebase-design`, `migrating`, frontend boundary/state checks. Idempotency remains in its decided reference. Unity baseline: none.
- **Idle context cost**: ~89 published; 0 as reference.
- **Recommendation (proposed)**: **adapt into one API-contract reference, not another API-design skill**.

### W2. `nodejs-backend-patterns`

- **What it is.** Express/Fastify, layered services, middleware, validation/errors, JWT, SQL/NoSQL, pooling, caching and health checks ([skill][w-node], [details][w-node-detail]).
- **Kind**: skill.
- **Proposed address**: web pack model-invoked server-runtime/API references, Node annex.
- **Why it could fit**: connects transport, application and database lifecycle concerns rather than assuming server work is React Server Components.
- **Why it might not**: a broad production-readiness claim around generic templates; the auth middleware verifies then asserts `JWTPayload`, rather than proving each application claim. Mandatory dependency injection and blanket CORS advice are not neutral project policy.
- **Copy / adapt / idea-only**: use as a secondary checklist with notice; prefer M1 for Node mechanics, W1 for contracts, selected auth/data vendors for code. Translate pooling/shutdown checks into observable evidence rather than cloning a layered application scaffold.
- **Overlap**: M1/M3/M4, Addy security/performance/observability; core `codebase-design` owns seams. No Unity-baseline overlap beyond shared service concerns.
- **Idle context cost**: ~114 published; 0 as reference.
- **Recommendation (proposed)**: **merge only uncovered server checks; reject the standalone backend skill**.

### W3. `typescript-advanced-types`

- **What it is.** Generic/conditional/mapped/template-literal types, recursive paths, utility types and type-testing examples ([skill][w-ts]).
- **Kind**: skill.
- **Proposed address**: web pack model-invoked TypeScript reference, only for targeted diagnosis needs.
- **Why it could fit**: recursion/complexity pitfalls and validating public type behavior complement the baseline table.
- **Why it might not**: overlaps M2 and pstack; style opinions (`interface` for object shapes) compete with the picked guide. The `ShouldError = ExpectError<AssertEqual<string, number>>` example produces a constraint error rather than a passing negative test; it lacks an expected-error directive. It also recommends skipping production typechecking without specifying an earlier gate.
- **Copy / adapt / idea-only**: retain useful edge-case topics with notice; rebuild checked examples against the project's compiler and fail if the independent typecheck is missing. Do not promote advanced type machinery as the default design.
- **Overlap**: pstack entry 24, M2, `setup-ts-deep-modules`, core `codebase-design` and review.
- **Idle context cost**: ~122 published; 0 as reference.
- **Recommendation (proposed)**: **reference-only supplementary material; reject a second type-style skill**.

### W4. `javascript-testing-patterns`

- **What it is.** Jest/Vitest config, fixtures, mocks, API/database integration, Testing Library and timer/snapshot guidance ([skill][w-tests]).
- **Kind**: skill.
- **Proposed address**: web pack model-invoked testing reference reached by core `tdd`/`test-review`.
- **Why it could fit**: resource cleanup, real HTTP/database boundaries and semantic DOM queries answer concrete stack needs.
- **Why it might not**: claims behavior-focused testing while showing `service["transporter"]` mock assertions; blanket 80% coverage, pervasive mocking and database truncation before every test do not establish good test boundaries or parallel isolation.
- **Copy / adapt / idea-only**: adapt only stack checks absent from A2/frontend references, with notice. Test through public seams, use isolated disposable test data, and keep project thresholds separate from behavioral evidence. Do not copy another TDD loop.
- **Overlap**: fork `tdd`/mocking references, A2 runner APIs, frontend browser-check, constraints/ratchet work.
- **Idle context cost**: ~123 published; 0 as reference.
- **Recommendation (proposed)**: **merge selective integration/teardown checks into web testing references**.

### W5. `modern-javascript-patterns`

- **What it is.** ES6+ syntax and functional-pattern advice: arrows, destructuring, async/await, array methods, spread, modules and pure functions ([skill][w-js]).
- **Kind**: skill.
- **Proposed address**: none as an installed piece.
- **Why it could fit**: callback/promise pitfalls could help a specific legacy migration.
- **Why it might not**: ordinary syntax/taste instructions add a second style guide; they provide no distinct workflow or server invariant. “Prefer array methods” is not performance evidence.
- **Copy / adapt / idea-only**: idea-only for a concrete migration when evidence calls for it; no copy needed for common syntax advice.
- **Overlap**: picked TypeScript style guide, pstack baseline, core `refactoring` and `migrating`; M1 async details are more targeted.
- **Idle context cost**: ~128 published; 0 if rejected.
- **Recommendation (proposed)**: **reject as redundant style/tutorial material**.

### W6. `architecture-patterns` and `microservices-patterns`

- **What it is.** Clean/hexagonal/DDD boundaries and adapters, then service decomposition, synchronous/asynchronous communication, database ownership, circuit breakers and bulkheads ([architecture][w-arch], [microservices][w-micro]).
- **Kind**: skills.
- **Proposed address**: web pack model-invoked server-design reference answering core design/migration needs; no architecture skill on top.
- **Why it could fit**: service ownership, anti-corruption boundaries and failure isolation matter for team apps, including modular monoliths.
- **Why it might not**: mandates abstract interfaces at every layer and treats in-memory use-case tests as an architectural hallmark. Service decomposition and repositories are not automatically improvements to a deep module.
- **Copy / adapt / idea-only**: adapt the decision/tradeoff questions with notice. Start with actual deployment/consistency needs, keep core's deep-module vocabulary and avoid mechanical folder scaffolds. Never infer that team size requires microservices.
- **Overlap**: core `codebase-design`, `domain-modeling`, `refactoring`, `blast-radius`; `setup-ts-deep-modules` owns dependency enforcement.
- **Idle context cost**: ~150 + ~84 = ~234 published; 0 as reference.
- **Recommendation (proposed)**: **adapt service-boundary/resilience questions; reject prescriptive architecture skills**.

### W7. `saga-orchestration`

- **What it is.** Multi-service step/compensation state machines, deadlines, correlation, stuck-state/DLQ recovery and failure-injection tests ([skill][w-saga], [details][w-saga-detail]).
- **Kind**: skill.
- **Proposed address**: web pack model-invoked durable-work/consistency reference.
- **Why it could fit**: captures partial success and recovery obligations that ordinary request handlers miss; payment, booking and approval workflows are meaningful team-app work.
- **Why it might not**: compensation is advertised as atomic/always successful while its own failure table requires retries/manual intervention. Its duplicate guard does not show atomic claim/side-effect coordination, and “never synchronous calls inside a saga step” is overly prescriptive.
- **Copy / adapt / idea-only**: adapt the state/failure/test checklist with notice, not the orchestrator. Require explicit replay and durable delivery guarantees; share Addy's existing idempotency contract and use the chosen workflow vendor's SDK knowledge.
- **Overlap**: decided idempotency, `risky-changes`, `blast-radius`, core `tdd`; W8/W9 durability. Unity baseline does not cover service sagas.
- **Idle context cost**: ~208 published; 0 as reference.
- **Recommendation (proposed)**: **adapt saga failure/compensation checks into durable-work knowledge**.

### W8. `cqrs-implementation`, `event-store-design`, `projection-patterns`

- **What it is.** Read/write model separation, append/version/ordering requirements, optimistic concurrency, idempotent projections, checkpoints, lag and rebuilds ([CQRS][w-cqrs], [event store][w-events], [projection][w-projection]).
- **Kind**: skills.
- **Proposed address**: web pack model-invoked consistency reference, disclosed when the system already needs event processing.
- **Why it could fit**: lag bounds, replay tests and recoverability are concrete review needs; not limited to a particular cloud or framework.
- **Why it might not**: prescriptions such as never querying from commands and never deleting events need domain/privacy context; three architecture skills encourage adopting an event platform before showing the requirement. Detailed stores/projectors were not fully validated here.
- **Copy / adapt / idea-only**: adapt invariant questions with notice. Check the actual event schema/version policy, duplicate handling, checkpoint/update atomicity, retention and rebuild permissions; vendor skills supply the store/client APIs.
- **Overlap**: W7/W9, core domain/design/migration, Addy idempotency/performance/security. C# event libraries are a separate selected vendor concern.
- **Idle context cost**: ~77 + ~77 + ~74 = ~228 published; 0 as reference.
- **Recommendation (proposed)**: **retain event/replay/lag checks as disclosed knowledge; reject separate CQRS/store/projector skills**.

### W9. `workflow-orchestration-patterns` and `temporal-python-testing`

- **What it is.** Temporal workflow/activity separation, deterministic replay, retries/timeouts/heartbeats and Python time-skipping/replay test resources ([workflow][w-workflow], [testing][w-temporal]).
- **Kind**: skills.
- **Proposed address**: web pack model-invoked durable-work reference; selected official workflow-vendor knowledge for SDK details.
- **Why it could fit**: explicit “when not to use” includes CRUD and stateless requests; replay compatibility and failure classification apply to durable background work.
- **Why it might not**: the worked APIs are Python, the testing skill assumes ≥80% coverage, and payload/timeout limits are vendor/version facts. No Temporal TypeScript implementation was validated.
- **Copy / adapt / idea-only**: adapt neutral durable-work questions with notice; do not mechanically port Python examples or promise Temporal adoption. When Temporal is chosen, setup should discover its current official/package-shipped knowledge rather than manufacture a competing SDK skill.
- **Overlap**: W7–W8, core `tdd`/`migrating`, vendor layer. No Unity-baseline duplication.
- **Idle context cost**: ~107 + ~96 = ~203 published; 0 as reference.
- **Recommendation (proposed)**: **keep replay/deadline knowledge; defer Temporal specifics to project vendor selection**.

### W10. `slo-implementation`

- **What it is.** User-visible SLIs/SLOs, error budgets, recording rules, multi-window burn alerts and recurring review ([skill][w-slo], [details][w-slo-detail]).
- **Kind**: skill.
- **Proposed address**: web pack model-invoked guide's decided observability reference, with a link to decided deploy readiness.
- **Why it could fit**: the strongest new team-operations material: measurable reliability and release decisions, extending Addy's question-first observability.
- **Why it might not**: undefined recording-rule dependencies, mixed 28/30-day arithmetic, mismatched latency label and hard-coded release-freeze percentages (conflict table). Missing-data and low-traffic behavior are not resolved by the examples.
- **Copy / adapt / idea-only**: adapt the method and review questions with notice; define event population/window, include every dependency, recompute burn thresholds and require rule/alert validation when implemented. Targets and release policy are project facts.
- **Overlap**: Addy observability and ship-readiness, core `verifying`/`hillclimb`. No new measure loop or separate SRE persona.
- **Idle context cost**: ~92 published; 0 as reference.
- **Recommendation (proposed)**: **extend the chosen observability reference with corrected SLO/error-budget guidance**.

### W11. `distributed-tracing`

- **What it is.** Cross-service spans/context, correlated logs, sampling, latency/error analysis and Jaeger/Tempo setup, with Node/Python/Go instrumentation ([skill][w-tracing], [details][w-tracing-detail]).
- **Kind**: skill.
- **Proposed address**: web pack model-invoked guide's decided observability reference.
- **Why it could fit**: context propagation across service boundaries and correlation provide concrete evidence for distributed diagnosis.
- **Why it might not**: recommends `user_id` tagging and baggage without a privacy boundary, arbitrary 1–10% sampling and <1% CPU targets, plus hard-coded exporters/operator versions. These were read, not confirmed current or runnable.
- **Copy / adapt / idea-only**: adapt propagation/correlation/sampling questions with notice. Require approved fields/redaction and measured overhead; select collector/exporter/provider instructions through current vendor knowledge. Do not copy the infrastructure manifests or personal-data tags.
- **Overlap**: Addy observability already owns instrumentation; M1 logging, W10 SLO, decided security/privacy and `hillclimb` performance evidence.
- **Idle context cost**: ~98 published; 0 as reference.
- **Recommendation (proposed)**: **extend observability with propagation, correlation and privacy checks**.

### W12. `prometheus-configuration`

- **What it is.** Metric scrape/recording-rule setup, naming/retention/HA guidance and target/config/query diagnostics ([skill][w-prom]).
- **Kind**: skill.
- **Proposed address**: project-specific monitoring knowledge only; neutral verification checks in the guide's observability reference.
- **Why it could fit**: checking that targets are scraped and rules answer expected queries helps verify telemetry itself.
- **Why it might not**: a Prometheus/Thanos/Cortex infrastructure selection is not inherent to a web app; managed observability can meet the same need. Deep templates were not fully read or evaluated.
- **Copy / adapt / idea-only**: idea-only for scrape/recording-rule acceptance checks; use selected official vendor docs/skills when the project uses Prometheus. No copied cluster setup.
- **Overlap**: Addy telemetry verification, W10/W11, vendor monitoring layer; Unity baseline: none.
- **Idle context cost**: ~92 published; 0 if not selected.
- **Recommendation (proposed)**: **reject as a pack skill; keep telemetry-verification questions**.

### W13. `grafana-dashboards`

- **What it is.** Dashboard information hierarchy, RED/USE panels, latency queries, filters, dashboard-as-code and provisioning examples ([skill][w-grafana]).
- **Kind**: skill.
- **Proposed address**: project-specific vendor knowledge; small dashboard verification checklist in observability.
- **Why it could fit**: user-facing symptoms first, drill-down later, explicit units/time ranges and linked dashboards improve team incident response.
- **Why it might not**: JSON mixes `graph` panels and inline alert configuration; no target Grafana version or validation evidence establishes compatibility. General RED/USE is already in Addy's checklist.
- **Copy / adapt / idea-only**: idea-only for dashboard acceptance criteria; use official current Grafana knowledge for JSON/provisioning. Do not copy the dashboard blobs or assume a Grafana install.
- **Overlap**: Addy observability/checklist, W10–W12; frontend dashboard-building skill is a different job from operating Grafana.
- **Idle context cost**: ~90 published; 0 if rejected.
- **Recommendation (proposed)**: **reject as a pack skill; retain dashboard evidence checks**.

### W14. `deployment-pipeline-design`, `github-actions-templates`, `gitlab-ci-patterns`

- **What it is.** Stages/gates, shallow versus dependency-aware readiness, rollout/rollback and migration compatibility, plus CI-specific template libraries ([pipeline][w-pipeline], [details][w-pipeline-detail], [GitHub][w-ghci], [GitLab][w-glci]).
- **Kind**: skills.
- **Proposed address**: web pack model-invoked decided deploy-readiness reference; setup reference for project CI commands.
- **Why it could fit**: checks a successful job against actual running-service health; backwards-compatible schema/code rollout is a substantive server concern.
- **Why it might not**: hard-coded Kubernetes/Argo/platform examples, tagged actions, thresholds and approval topologies are not portable guarantees. Automated rollback can still leave incompatible schema/data; “zero downtime” needs evidence.
- **Copy / adapt / idea-only**: adapt gate/readiness/rollback questions with notice, not whole YAML. Preserve the project's approvals, platform and immutable dependency/action policy; require both new and previous code to tolerate the rollout schema. No duplicate deployment workflow skill.
- **Overlap**: decided ship-readiness, core `verifying`/`migrating`/`wizard`, `risky-changes`, Addy CI/CD entry 19 and shipping entry 38. Official deploy vendors own mechanics.
- **Idle context cost**: ~122 + ~94 + ~94 = ~310 published; 0 as references.
- **Recommendation (proposed)**: **merge pipeline/readiness/rollback checks into decided deploy and setup references**.

### W15. `secrets-management`

- **What it is.** Secret stores, CI injection, masking, rotation, least privilege, scanning and Kubernetes external-secret examples ([skill][w-secrets]).
- **Kind**: skill.
- **Proposed address**: web pack model-invoked decided security reference and setup's CI facts.
- **Why it could fit**: rotation ordering, environment isolation and auditability are concrete team needs.
- **Why it might not**: internal contradiction between “never print” and GitLab echo examples; long-lived cloud access-key examples and literal CLI secret arguments need review. Vault/AWS/Kubernetes tutorials duplicate vendor knowledge.
- **Copy / adapt / idea-only**: adapt safe handling/rotation/verification questions with notice. Strip unsafe output and credential-taking examples, use host protected-secret channels and selected vendor authentication mechanisms. Do not turn pre-commit scanning into another setup skill.
- **Overlap**: decided security, web setup/pre-commit, W14, D1; security-source ticket owns deeper scan workflows.
- **Idle context cost**: ~86 published; 0 as reference.
- **Recommendation (proposed)**: **merge corrected secret-handling/rotation checks; reject the standalone skill**.

### W16. `incident-runbook-templates`, `on-call-handoff-patterns`, `postmortem-writing`

- **What it is.** Detection/triage/mitigation/recovery runbooks, shift and mid-incident handoffs, then blameless timeline/evidence/action-item reports ([runbooks][w-runbook], [handoff][w-handoff], [postmortem][w-postmortem]). Deeper incident templates were inspected selectively, not tested against a live incident.
- **Kind**: skills.
- **Proposed address**: web pack user-invoked `service-incident-review` candidate; runbook and responder-handoff templates disclosed under observability.
- **Why it could fit**: the owner works in teams; escalation, ownership, state transfer and follow-up verification are distinct service-operation needs. Postmortems should preserve evidence and dissent, with accountable actions.
- **Why it might not**: hard-coded severity/response deadlines, PagerDuty/Slack/wiki choices and 30-minute overlaps are team facts. A shift handoff is different from core's agent handoff. The existing core retro/learning workflow may absorb the incident report rather than justify a new skill.
- **Copy / adapt / idea-only**: adapt with notice: evidence-first incident record, timeline, impact, contributing conditions, unresolved uncertainties, owners and real-tracker follow-ups. Drop fixed schedules/severity numbers; require the team's comms permissions. No automatic messages, remediations or alerts merely because a template says so.
- **Overlap**: core `diagnosing-bugs`, `handoff`, `retro` and admission bar; Addy observability/runbook links and deploy rollback. These supply the operations-specific content, not a replacement lifecycle.
- **Idle context cost**: ~192 + ~244 + ~83 = ~519 published; 0 as correctly gated user-invoked skill plus references.
- **Recommendation (proposed)**: **adapt team incident references and propose a user-invoked incident review, subject to overlap with core retro**.

**Adjacent scope exclusions.** `connectivity-triage` is explicitly macOS (`scutil`, `nettop`, `networkQuality`); its fault-domain/evidence-first idea is already core diagnosis, so it is not a Windows web-pack candidate ([source][w-connectivity], ~146 tokens if installed). `fastapi-templates` is Python-specific and belongs to a Python/vendor choice, not the TypeScript baseline ([source][w-fastapi], ~80). `postgresql-table-design` is a substantial Postgres-only type/index/schema catalogue ([source][w-pg], ~72), overlapping the official Supabase/Neon/PlanetScale skills inspected under D1. Do not duplicate it in the framework-neutral guide; take data constraints/consistency needs to the selected database knowledge. These three inspection-only exclusions are not counted as ledger entries.

## Database-role follow-up to David entry 24

### D1. `create-readonly-db-role` versus official Supabase, Neon, PlanetScale and Prisma skills

- **What it is.** David's user-invoked [workflow][d-role] prepares a Postgres login, SELECT grants/default privileges, sensitive-table exclusions, read-only transaction/timeout defaults, protected connection, human-applied production SQL and seven verification checks. At current HEAD it also contains conditional `ALTER ROLE agent_reader BYPASSRLS`. Official skills already cover important role mechanics, as the comparison below demonstrates.
- **Kind**: skill; official skills/references compared for overlap, not separate adoption entries.
- **Proposed address**: web pack user-invoked `prepare-agent-db-access` candidate, reached by suggestion from `web-guide`; vendor role/RLS instructions remain in the project's selected official knowledge.
- **Why it could fit**: testing the actual login's permissions after turning off the transaction soft guard is a useful residual agent-access workflow. Positive, denied-write, denied-sensitive-table and identity checks go beyond a generic least-privilege sentence.
- **Why it might not**: most role-creation SQL duplicates official guidance. Current SQL grants future access broadly then relies on a manually maintained denylist; it names only object creator `postgres`; “real number, NOT 0” is not valid evidence for a legitimately empty or row-filtered dataset. Conditional RLS bypass can broaden data visibility. Existing-role updates need a privilege/membership audit, not just more SELECT grants. The sample's destructive revert (`DROP OWNED`) also needs review rather than blind reuse.
- **Copy / adapt / idea-only**: adapt only preparation, credential protection and verification with MIT notice. **Do not copy the current SQL template unchanged.** Ask the human for the allowed data boundary, prefer explicit allowed tables/views, preserve RLS by default, inspect role inheritance/ownership/routine privileges, cover all actual object-creator roles, and test failures with the actual restricted connection. Keep production DDL with the authorized human. Treat timeout/read-only transaction defaults and MCP read-only flags as additional controls, not proof of database privilege restriction. Use vendor instructions for role syntax, poolers and RLS; rewrite macOS-only installation guidance for the target platform if needed.
- **Overlap**: David ledger entry 24; chosen security reference and `risky-changes`; official vendor knowledge supplies grants/defaults/RLS, core `wizard` supplies human-only setup steps. `openrouter`, grouped with this skill in the old ledger, is not re-evaluated here.
- **Idle context cost**: 0 user-invoked; current description would be ~48 tokens if model-invoked. Verification/vendor references cost 0 idle beyond the existing guide trigger.
- **Recommendation (proposed)**: **do not adopt a duplicate generic role-creation skill; adapt a thin user-invoked agent-access preparation/verification workflow, with vendor mechanics and RLS preserved**.

### Official coverage: the answer is partial overlap, not absence

| Official source | Concrete coverage found | What this does not establish |
|---|---|---|
| **Supabase** | [Least-privilege reference][sb-priv] creates `app_readonly NOLOGIN`, grants schema usage and SELECT on **named tables**, and shows revoking PUBLIC defaults. Separate writer group/login example and [RLS policies][sb-rls] are present | The reference does not assign the reader group to a login, manage future-table defaults, or run agent-specific denial tests. Scoped management tokens in the [main skill][sb-main] are token permissions, not database role restrictions |
| **Neon** | Main Postgres skill [routes general PostgreSQL work][neon-route] to official `neondatabase/postgres-skills`; that [skill][neon-pg-skill] routes to [security-roles][neon-roles]. It creates a reader group plus analyst login/membership, grants SELECT/schema usage, demonstrates revokes and `ALTER DEFAULT PRIVILEGES`, and separately explains creator-specific defaults and future-only effect | Application/analyst recipe rather than an agent workflow; no sensitive-table agreement or David-style seven-check sequence. Main Neon setup's [MCP `--read-only`][neon-mcp] and agent-platform [least-privilege API keys][neon-platform] are different layers |
| **PlanetScale** | [Safety review][ps-safety] explicitly recommends read-only roles for agents and separate credentials by service/environment/access need. [MCP guidance][ps-mcp] prefers reader scopes and says its `pg_read_all_data` reader **does not bypass RLS**. [CLI skill][ps-cli] defaults SQL to reader; [command reference][ps-create] lists `pscale role create` | No SELECT-only grants/revokes/default-privilege recipe found in the searched skill corpus. The role-create command alone does not show restrictions. [Pooled-session `default_transaction_read_only` discussion][ps-pool] is about leaked session state, not role provisioning |
| **Prisma** | [Postgres setup][prisma-setup] verifies a read-only **query**. [ORM setup][prisma-route] hands off to the package-owned Prisma 8 skill; its [Supabase reference][prisma-sb] covers existing platform roles/RLS and admin `service_role` SELECT grants | Neither a read-only query nor adding SELECT to an admin role creates restricted credentials. No agent reader-role workflow found in the searched skills. That reference explicitly places grant authoring outside its contract model |

**Decision-ready distinction.** If the question means “does an official skill show read-only DB-role creation?”, **yes: Supabase and the official Postgres skill Neon links to**. If it means “does one already supply David's entire agent-specific prepare/human-apply/connect/negative-test workflow?”, **none found in this pinned corpus**. PlanetScale has the clearest explicit agent recommendation but leaves the creation recipe to other knowledge. Prisma's read-only test query is not a role.

**RLS and privilege boundary.** The old [David pin][d-role-old] deferred RLS questions to the administrator; current HEAD adds both the conditional advice and a runnable bypass statement. This is substantive drift, not a cosmetic re-pin. Neon separately documents inherited privileges, function privilege audits and owner/`BYPASSRLS` exceptions ([security reference][neon-roles]); a failed DELETE test alone does not audit those other paths (*inference*). Restrict the candidate's acceptance claim to the tested operations/data boundary, and include RLS/tenant and effective-privilege checks before claiming the connection is suitable for agents. Do not disable row filters because a SELECT returns zero rows.

### Database source pins, provenance and limits

The four discovery vendor sources and discovery-listed wrappers remain at their sweep pins. Additional repositories were followed from their own skill references or wrapper/vendoring metadata; their current HEADs were resolved independently.

| Repository | Full HEAD SHA read | Licence / provenance |
|---|---|---|
| `supabase/agent-skills` | [`c9be0e931b7930f7d02126d04774d904c381e7d7`][sb-root] | MIT |
| `supabase-community/supabase-plugin` | [`016bf5b36670f7ad189ca90223513bd10406392d`][sb-plugin-root] | no root licence found; copied Postgres skill declares MIT; compared duplicate blobs, no copying proposed |
| `neondatabase/agent-skills` | [`ccca3334a7542d3133134cc6926f2fafc6edeb1f`][neon-root] | Apache-2.0 |
| `neondatabase/postgres-skills` | [`27fe45e0f71ea89a6eaf9ea4d2e4068957c81c26`][neon-pg-root] | Apache-2.0; additional official source reached from `neon-postgres` |
| `neondatabase/neon-for-agent-platforms` | [`028b69be7180122a2701131f5286104b9e79b10b`][neon-platform-root] | Apache-2.0; additional official agent-platform source |
| `planetscale/claude-plugin` | [`95c80f9f391be9b1b6172bf82d4191e1ec11b637`][ps-plugin-root] | Apache-2.0 root, **MIT in both bundled skill directories** ([database notice][ps-db-license], [safety/tooling notice][ps-skills-license]) |
| `planetscale/skills` | [`999045cfbad79222f38a99599eb96bc736feabee`][ps-root] | MIT; plugin's upstream skill source |
| `planetscale/database-skills` | [`f6ed002d03084cb39c01d1d58904d47a36f5322a`][ps-db-root] | MIT; plugin's upstream database source |
| `prisma/skills` | [`ba3f9d73200bbb62e49733ab93a961fd138a2c18`][prisma-root] | MIT |
| `prisma/orm` | [`f543fb4173e64e45f87fdcfa85d6cfbd3ea034a5`][prisma-orm-root] | Apache-2.0; additional package-owned Prisma 8 skill |
| `prisma/claude-plugin` | [`815dbc4a045a29e3b81510ba0e3ab806f1baaf0e`][prisma-plugin-root] | no licence file found; MCP wrapper, no copied text proposed |

A narrow background fact-finding helper enumerated complete trees and content-searched shipped skills/references in these vendor sources and wrappers, both PlanetScale upstreams, both linked Neon repos, and Prisma 8's router plus all 15 immediate references. Role/security/MCP/RLS/setup/transaction passages above were closely read; matching blob SHAs identified duplicate wrapper files. The parent also read the current David skill, Supabase privileges recipe and Neon's least-privilege recipe directly. This division was read-only and involved no SQL or MCP execution.

**Negative-finding limits:** not a sentence-by-sentence review of every vendor file; no comprehensive reading of Neon evaluation fixtures/diffs, Prisma's historical upgrade scripts or ORM implementation, unrelated David skills, or all external product documentation. “Not found” applies to this pinned skill corpus, not the vendors' entire documentation, their running MCP permission enforcement, or future releases. Read-only transaction settings, RLS and transport/tool scopes are kept distinct throughout.

## Coverage gaps and questions left for the theme

- **Auth implementation and tenant isolation:** M4 is not a verified neutral authentication recipe. Select official auth-provider knowledge; the guide still needs authorization/tenant-boundary checks, session/CSRF/token lifecycle evidence and sensitive-data handling fitted to the actual project. The security ticket owns deeper threat-model/scan candidates.
- **Data correctness and migration:** these sources give useful patterns but no validated, neutral SQL/NoSQL concurrency/locking/isolation, backup/restore rehearsal, online backfill and irreversible-data migration reference. Official database skills cover specifics; core migration/risk skills need those disclosed checks. D1 does not certify arbitrary SELECT-capable routines or inherited privileges safe.
- **Durable jobs:** saga/Temporal material is a starting point, not a complete TypeScript queue/webhook/worker lifecycle reference. Atomic enqueue/outbox, deduplication retention, poison jobs, retry budgets, cancellation, schedule overlap and worker deploy compatibility need implementation-specific evidence. Do not claim exactly-once processing from these templates.
- **Telemetry correctness:** missing/low-volume data, alert-rule test cases, trace trust boundaries/PII, propagation into queues and collector outage/backpressure still require deliberate treatment. No exporter, Grafana JSON or Prometheus YAML was run or certified against current packages.
- **Version-bound tooling:** no live Vite/Vitest/pnpm behavior was tested; package-owned knowledge should be checked during setup. antfu's generation/gitlink mismatches need reconciliation before content is copied. TypeScript/Node compiler-versus-runtime behavior must follow installed versions; this ledger checked Node's historical release source to resolve one concrete version error, not every current API.
- **Whole-app breadth outside this ticket:** browser/e2e/flakiness and web-quality auditing are covered by the browser/quality ticket and frontend ledger; framework/platform build and deploy commands remain selected vendor knowledge. These server sources do not finish accessibility, SEO, edge/runtime portability, websocket/realtime, email/payment integrations or production restoration procedures.
- **Owner choices still proposed:** whether the incident review deserves a separate user-invoked skill or extends core retro; whether to retain the thin agent-DB setup workflow after official knowledge is selected; which optional community tooling skills earn a place in the collection. None is decided by this ledger.

For the map's Decisions-so-far (proposed gist): server/runtime and API-contract knowledge can extend `web-guide`, while corrected SLO, tracing, pipeline and incident material augments the already-decided observability/security/deploy references; core keeps the workflows. Fastify/Vite/Vitest/pnpm are conditional project knowledge, not stack defaults. Official Supabase and Neon already teach reader-role creation, so David's candidate narrows to agent-access preparation/negative verification and must shed its new RLS-bypass/default-wide-access recipe.

<!-- Pinned source references -->

[a-agents]: https://github.com/antfu/skills/blob/8886fe2d385d3644cbb47e46ae9cb1cf09307d3b/AGENTS.md
[a-license]: https://github.com/antfu/skills/blob/8886fe2d385d3644cbb47e46ae9cb1cf09307d3b/LICENSE.md
[a-mocks]: https://github.com/antfu/skills/blob/8886fe2d385d3644cbb47e46ae9cb1cf09307d3b/skills/vitest/references/features-mocking.md#L68-L97
[a-modules]: https://github.com/antfu/skills/blob/8886fe2d385d3644cbb47e46ae9cb1cf09307d3b/.gitmodules
[a-pnpm]: https://github.com/antfu/skills/blob/8886fe2d385d3644cbb47e46ae9cb1cf09307d3b/skills/pnpm/SKILL.md
[a-pnpm-gen]: https://github.com/antfu/skills/blob/8886fe2d385d3644cbb47e46ae9cb1cf09307d3b/skills/pnpm/GENERATION.md
[a-pnpm-security]: https://github.com/antfu/skills/blob/8886fe2d385d3644cbb47e46ae9cb1cf09307d3b/skills/pnpm/references/features-supply-chain-security.md
[a-root]: https://github.com/antfu/skills/tree/8886fe2d385d3644cbb47e46ae9cb1cf09307d3b
[a-vite]: https://github.com/antfu/skills/blob/8886fe2d385d3644cbb47e46ae9cb1cf09307d3b/skills/vite/SKILL.md
[a-vite-gen]: https://github.com/antfu/skills/blob/8886fe2d385d3644cbb47e46ae9cb1cf09307d3b/skills/vite/GENERATION.md
[a-vitest]: https://github.com/antfu/skills/blob/8886fe2d385d3644cbb47e46ae9cb1cf09307d3b/skills/vitest/SKILL.md
[a-vitest-gen]: https://github.com/antfu/skills/blob/8886fe2d385d3644cbb47e46ae9cb1cf09307d3b/skills/vitest/GENERATION.md
[d-license]: https://github.com/davidondrej/skills/blob/fa268fec7afc15a8b7a5444cad6c3245c2c7df56/LICENSE
[d-role]: https://github.com/davidondrej/skills/blob/fa268fec7afc15a8b7a5444cad6c3245c2c7df56/skills/ops-and-setup/create-readonly-db-role/SKILL.md
[d-role-old]: https://github.com/davidondrej/skills/blob/7874889bd037d411f6079e38ee8601557c4a8995/skills/ops-and-setup/create-readonly-db-role/SKILL.md
[d-root]: https://github.com/davidondrej/skills/tree/fa268fec7afc15a8b7a5444cad6c3245c2c7df56
[m-fastify]: https://github.com/mcollina/skills/blob/c75d70dbfbe991d8cec42aeda0b64ff14fbb9ac7/skills/fastify/SKILL.md
[m-fastify-deploy]: https://github.com/mcollina/skills/blob/c75d70dbfbe991d8cec42aeda0b64ff14fbb9ac7/skills/fastify/rules/deployment.md#L23-L56
[m-license]: https://github.com/mcollina/skills/blob/c75d70dbfbe991d8cec42aeda0b64ff14fbb9ac7/LICENSE
[m-lint]: https://github.com/mcollina/skills/blob/c75d70dbfbe991d8cec42aeda0b64ff14fbb9ac7/skills/linting-neostandard-eslint9/SKILL.md
[m-node]: https://github.com/mcollina/skills/blob/c75d70dbfbe991d8cec42aeda0b64ff14fbb9ac7/skills/node/SKILL.md
[m-node-ts]: https://github.com/mcollina/skills/blob/c75d70dbfbe991d8cec42aeda0b64ff14fbb9ac7/skills/node/rules/typescript.md
[m-oauth]: https://github.com/mcollina/skills/blob/c75d70dbfbe991d8cec42aeda0b64ff14fbb9ac7/skills/oauth/SKILL.md
[m-root]: https://github.com/mcollina/skills/tree/c75d70dbfbe991d8cec42aeda0b64ff14fbb9ac7
[m-shutdown]: https://github.com/mcollina/skills/blob/c75d70dbfbe991d8cec42aeda0b64ff14fbb9ac7/skills/node/rules/graceful-shutdown.md#L60-L79
[m-stuck]: https://github.com/mcollina/skills/blob/c75d70dbfbe991d8cec42aeda0b64ff14fbb9ac7/skills/node/rules/stuck-processes-and-tests.md
[m-ts]: https://github.com/mcollina/skills/blob/c75d70dbfbe991d8cec42aeda0b64ff14fbb9ac7/skills/typescript-magician/SKILL.md
[neon-mcp]: https://github.com/neondatabase/agent-skills/blob/ccca3334a7542d3133134cc6926f2fafc6edeb1f/skills/neon/SKILL.md#L230-L246
[neon-pg-root]: https://github.com/neondatabase/postgres-skills/tree/27fe45e0f71ea89a6eaf9ea4d2e4068957c81c26
[neon-pg-skill]: https://github.com/neondatabase/postgres-skills/blob/27fe45e0f71ea89a6eaf9ea4d2e4068957c81c26/skills/postgres-best-practices/SKILL.md#L26-L42
[neon-platform]: https://github.com/neondatabase/neon-for-agent-platforms/blob/028b69be7180122a2701131f5286104b9e79b10b/skills/neon-postgres-agent-platforms/SKILL.md#L275-L288
[neon-platform-root]: https://github.com/neondatabase/neon-for-agent-platforms/tree/028b69be7180122a2701131f5286104b9e79b10b
[neon-roles]: https://github.com/neondatabase/postgres-skills/blob/27fe45e0f71ea89a6eaf9ea4d2e4068957c81c26/skills/postgres-best-practices/references/security-roles.md
[neon-root]: https://github.com/neondatabase/agent-skills/tree/ccca3334a7542d3133134cc6926f2fafc6edeb1f
[neon-route]: https://github.com/neondatabase/agent-skills/blob/ccca3334a7542d3133134cc6926f2fafc6edeb1f/skills/neon-postgres/SKILL.md#L104-L108
[node-ts]: https://github.com/nodejs/node/blob/c9ff1aecf268802fc29272c93aaa4b0691c7c6d8/doc/api/typescript.md
[prisma-orm-root]: https://github.com/prisma/orm/tree/f543fb4173e64e45f87fdcfa85d6cfbd3ea034a5
[prisma-plugin-root]: https://github.com/prisma/claude-plugin/tree/815dbc4a045a29e3b81510ba0e3ab806f1baaf0e
[prisma-root]: https://github.com/prisma/skills/tree/ba3f9d73200bbb62e49733ab93a961fd138a2c18
[prisma-route]: https://github.com/prisma/skills/blob/ba3f9d73200bbb62e49733ab93a961fd138a2c18/prisma-orm-setup/SKILL.md#L12-L14
[prisma-sb]: https://github.com/prisma/orm/blob/f543fb4173e64e45f87fdcfa85d6cfbd3ea034a5/skills/prisma-8/references/supabase.md
[prisma-setup]: https://github.com/prisma/skills/blob/ba3f9d73200bbb62e49733ab93a961fd138a2c18/prisma-postgres-setup/SKILL.md#L39-L45
[ps-cli]: https://github.com/planetscale/skills/blob/999045cfbad79222f38a99599eb96bc736feabee/planetscale-pscale-cli-automation/SKILL.md#L40-L48
[ps-create]: https://github.com/planetscale/database-skills/blob/f6ed002d03084cb39c01d1d58904d47a36f5322a/skills/postgres/references/ps-cli-commands.md#L49-L55
[ps-db-license]: https://github.com/planetscale/claude-plugin/blob/95c80f9f391be9b1b6172bf82d4191e1ec11b637/database-skills/LICENSE#L1-L13
[ps-db-root]: https://github.com/planetscale/database-skills/tree/f6ed002d03084cb39c01d1d58904d47a36f5322a
[ps-mcp]: https://github.com/planetscale/skills/blob/999045cfbad79222f38a99599eb96bc736feabee/planetscale-mcp-agent-operating-model/SKILL.md
[ps-plugin-root]: https://github.com/planetscale/claude-plugin/tree/95c80f9f391be9b1b6172bf82d4191e1ec11b637
[ps-pool]: https://github.com/planetscale/database-skills/blob/f6ed002d03084cb39c01d1d58904d47a36f5322a/skills/postgres/references/ps-connection-pooling.md#L49-L66
[ps-root]: https://github.com/planetscale/skills/tree/999045cfbad79222f38a99599eb96bc736feabee
[ps-safety]: https://github.com/planetscale/skills/blob/999045cfbad79222f38a99599eb96bc736feabee/planetscale-postgres-safety-review/SKILL.md#L33-L49
[ps-skills-license]: https://github.com/planetscale/claude-plugin/blob/95c80f9f391be9b1b6172bf82d4191e1ec11b637/planetscale-skills/LICENSE#L1-L13
[sb-main]: https://github.com/supabase/agent-skills/blob/c9be0e931b7930f7d02126d04774d904c381e7d7/skills/supabase/SKILL.md#L41-L43
[sb-plugin-root]: https://github.com/supabase-community/supabase-plugin/tree/016bf5b36670f7ad189ca90223513bd10406392d
[sb-priv]: https://github.com/supabase/agent-skills/blob/c9be0e931b7930f7d02126d04774d904c381e7d7/skills/supabase-postgres-best-practices/references/security-privileges.md#L24-L51
[sb-rls]: https://github.com/supabase/agent-skills/blob/c9be0e931b7930f7d02126d04774d904c381e7d7/skills/supabase-postgres-best-practices/references/security-rls-basics.md#L22-L47
[sb-root]: https://github.com/supabase/agent-skills/tree/c9be0e931b7930f7d02126d04774d904c381e7d7
[w-api]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/backend-development/skills/api-design-principles/SKILL.md
[w-api-detail]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/backend-development/skills/api-design-principles/references/details.md
[w-arch]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/backend-development/skills/architecture-patterns/SKILL.md
[w-connectivity]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/incident-response/skills/connectivity-triage/SKILL.md
[w-cqrs]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/backend-development/skills/cqrs-implementation/SKILL.md
[w-events]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/backend-development/skills/event-store-design/SKILL.md
[w-fastapi]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/api-scaffolding/skills/fastapi-templates/SKILL.md
[w-ghci]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/cicd-automation/skills/github-actions-templates/SKILL.md
[w-glci]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/cicd-automation/skills/gitlab-ci-patterns/SKILL.md
[w-grafana]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/observability-monitoring/skills/grafana-dashboards/SKILL.md
[w-handoff]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/incident-response/skills/on-call-handoff-patterns/SKILL.md
[w-js]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/javascript-typescript/skills/modern-javascript-patterns/SKILL.md
[w-license]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/LICENSE
[w-market]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/.claude-plugin/marketplace.json
[w-micro]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/backend-development/skills/microservices-patterns/SKILL.md
[w-node]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/javascript-typescript/skills/nodejs-backend-patterns/SKILL.md
[w-node-detail]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/javascript-typescript/skills/nodejs-backend-patterns/references/details.md
[w-pg]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/database-design/skills/postgresql-table-design/SKILL.md
[w-pipeline]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/cicd-automation/skills/deployment-pipeline-design/SKILL.md
[w-pipeline-detail]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/cicd-automation/skills/deployment-pipeline-design/references/details.md
[w-postmortem]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/incident-response/skills/postmortem-writing/SKILL.md
[w-projection]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/backend-development/skills/projection-patterns/SKILL.md
[w-prom]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/observability-monitoring/skills/prometheus-configuration/SKILL.md
[w-readme]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/README.md
[w-root]: https://github.com/wshobson/agents/tree/0874a27b17a22e2b7c2e2bcd725768e0803cad06
[w-runbook]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/incident-response/skills/incident-runbook-templates/SKILL.md
[w-saga]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/backend-development/skills/saga-orchestration/SKILL.md
[w-saga-detail]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/backend-development/skills/saga-orchestration/references/details.md
[w-secrets]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/cicd-automation/skills/secrets-management/SKILL.md
[w-slo]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/observability-monitoring/skills/slo-implementation/SKILL.md
[w-slo-detail]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/observability-monitoring/skills/slo-implementation/references/details.md
[w-temporal]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/backend-development/skills/temporal-python-testing/SKILL.md
[w-tests]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/javascript-typescript/skills/javascript-testing-patterns/SKILL.md
[w-tracing]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/observability-monitoring/skills/distributed-tracing/SKILL.md
[w-tracing-detail]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/observability-monitoring/skills/distributed-tracing/references/details.md
[w-ts]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/javascript-typescript/skills/typescript-advanced-types/SKILL.md
[w-workflow]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/backend-development/skills/workflow-orchestration-patterns/SKILL.md
