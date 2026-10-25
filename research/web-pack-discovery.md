# Discovery sweep: web pack sources beyond the frontend

Research for [#66](https://github.com/Hissal/skill-collection/issues/66), part of the wayfinder map [#1](https://github.com/Hissal/skill-collection/issues/1). Swept on 2026-10-25. These are **pitches, not ledgers**. Every recommendation is **proposed**; the owner decides which sources earn a full ledger. Vocabulary follows `GLOSSARY.md`.

**Pack shape this sweep is sized for** (fixed by the owner for [Theme: web pack](https://github.com/Hissal/skill-collection/issues/49)): a web pack shaped like the Unity, C# and gamedev packs. One model-invoked `web-guide` owns references and is reached through core extension points, with user-invoked skills on top. It covers the whole web app: browser, server and API, data, auth, deploy, observability, security, end-to-end and browser testing, and TypeScript tooling. The baseline is TypeScript and framework-neutral. Framework and vendor knowledge comes from **official vendor skills**, picked per project and layered on, never duplicated. That is how `Unity-Technologies/skills` is treated for the Unity pack. The pack is sized for real web app work in teams, not kept light.

**How facts are marked.** Stars, last commit, default-branch SHA and licence come from `gh api` on 2026-10-25. Skill counts, descriptions and manifests were read from each repo's tree at the pinned SHA through `gh api` (contents and trees endpoints). Install routes come from the repos' own manifests and READMEs, plus three doc pages fetched as raw markdown on 2026-10-25: Claude Code's [discover-plugins](https://code.claude.com/docs/en/discover-plugins.md) (**CC-plugins**), Codex's [build plugins](https://developers.openai.com/plugins/build/plugins.md) (**CX-plugins**) and Codex's [skills](https://developers.openai.com/codex/skills.md) (**CX-skills**). Anything not read in a source is marked *(inferred)*. **Idle cost** is the summed `description` characters of the skills a plugin would list, divided by 4. It is an estimate, not a measurement. Repos that ship the same skills once per harness were counted once. Nothing was cloned, installed or executed.

**Swept:**

- The official Claude marketplace `anthropics/claude-plugins-official` at [`5826794`](https://github.com/anthropics/claude-plugins-official/tree/58267944f92187b7d6a1c822165c96c81c864806): all 315 entries in `.claude-plugin/marketplace.json`, filtered for web, data, auth, deploy, observability, security and testing.
- The Codex marketplace `openai/plugins` at [`0722921`](https://github.com/openai/plugins/tree/0722921d5542fc593105c27bd52630babd8b8c2a): `.agents/plugins/marketplace.json` and the web-relevant `plugins/*` folders.
- `VoltAgent/awesome-agent-skills` at [`3642aa5`](https://github.com/VoltAgent/awesome-agent-skills/tree/3642aa5456b6518896bd690862296b134d69aa10): its "Official Skills by" team index.
- The skills.sh front page (2026-10-25).
- Org listings on GitHub for about 40 framework, tooling, database, auth and testing vendors. Each listing was searched for repos named `*skill*`, `*agent*`, `*mcp*`, `*plugin*` or `*ai*`.
- GitHub code search for `SKILL.md` in framework repos: `microsoft/playwright`, `shadcn-ui/ui`, `TanStack/router`, `vercel/ai`, `vitest-dev/vitest` and others.
- GitHub repo search for community security skills and TypeScript hook collections.

**Excluded as already covered:** every source in `research/ledgers/` (the fork, pstack, Addy agent-skills, superpowers, `anthropics/skills`, davidondrej, Unity and gamedev repos, dotnet/skills, Aaronontheweb, the Anthropic-authored marketplace plugins (including `frontend-design`, `typescript-lsp`, `security-guidance`, `claude-security`), hook collections, gstack, ECC, compound-engineering, maintenance tooling (`getsentry/skills`, agnix, plugin-eval), and the ideas-only skim (game-studio, five trailofbits skills, finding-unknowns)). Also excluded: `vercel-labs/agent-skills`, `pbakaus/impeccable` and `emilkowalski/skills`, which a parallel ticket ledgers.

## Top recommendations (proposed)

1. **Package-shipped, version-matched vendor knowledge.** TanStack Intent, Next.js's bundled docs with its managed `AGENTS.md` block, `skills-npm` (being merged into `npx skills experimental_sync`), and `playwright-cli install --skills` all ship agent knowledge *inside the npm package*, versioned with the library. This is the strongest finding for "vendor knowledge layered on, never duplicated". The `web-guide` could point at what the installed packages ship instead of naming vendors. It touches the [pack-reach decision](https://github.com/Hissal/skill-collection/issues/34), so it is proposed as a research ticket, not a ledger.
2. **Official browser and e2e tooling:** Playwright's own skills (`playwright-cli`, `playwright-trace`, `playwright-component-testing`), Chrome DevTools MCP's seven skills, and GoogleChrome's `modern-web-guidance`. All three are first-party, framework-neutral and cheap.
3. **`addyosmani/web-quality-skills`** has six audit skills: Core Web Vitals, performance, accessibility, SEO, best practices and a combined audit. They are user-invoked candidates on top of the guide.
4. **`mcollina/skills`** covers server-side TypeScript from the Node.js/Fastify maintainer: `node`, `typescript-magician`, `fastify`, `oauth` and `linting-neostandard-eslint9`.
5. **Security** across Codex Security (`openai/plugins/codex-security`, 15 skills), the web-relevant Trail of Bits skills not yet ledgered, and the OWASP skill. Together they cover threat models, diff scans, supply-chain audits, SAST runs and finding validation.

The official vendor list (Part 2) is the other half of the answer. Next.js, Angular, Svelte, TanStack, Hono, Deno, shadcn/ui, Vercel, Cloudflare, Netlify, Supabase, Neon, Prisma, Stripe, Sentry, Clerk, Auth0, WorkOS, Better Auth, Playwright and about 30 more ship their own skills or plugins today.

# Part 1: Pitches, ranked

### 1. Package-shipped vendor knowledge: TanStack Intent, Next.js agent rules, skills-npm, playwright-cli
- **Repos:**
  - `TanStack/intent` at [`248c6f0`](https://github.com/TanStack/intent/tree/248c6f02605b12f9a31be069fabd945361f701bf) · 355★ · last commit 2026-10-19 · MIT.
  - `vercel/next.js` at [`cbf49db`](https://github.com/vercel/next.js/tree/cbf49db30a655ac17c92c2951885c4256db14b9e) · 143k★ · 2026-10-24 · MIT.
  - `antfu/skills-npm` at [`37a3aff`](https://github.com/antfu/skills-npm/tree/37a3affb356011d52b6e10a6d2066716acd5a4ac) · 572★ · 2026-10-15 · MIT.
  - `microsoft/playwright-cli` at [`b1a5903`](https://github.com/microsoft/playwright-cli/tree/b1a5903c5b633b8c9f843ad7b629c2a78437040c) · 14.6k★ · 2026-10-19 · Apache-2.0.
- **What they do (read):**
  - **Intent** is a CLI for shipping skills inside npm packages under `skills/` ([overview](https://github.com/TanStack/intent/blob/248c6f02605b12f9a31be069fabd945361f701bf/docs/overview.md)). Consumers run `intent list` (scans `node_modules`, workspaces and Yarn PnP), `intent install` (writes a managed `intent-skills` block into `AGENTS.md`/`CLAUDE.md`), `intent load <pkg>#<skill>`, and an allowlist in `package.json#intent.skills`.
  - `intent hooks install` adds a `SessionStart` skill catalog and a `PreToolUse` **edit gate** for Claude Code (`.claude/settings.json`) and Codex (`.codex/hooks.json`). The gate blocks edits until the agent has run `intent list` or `intent load` ([intent-hooks](https://github.com/TanStack/intent/blob/248c6f02605b12f9a31be069fabd945361f701bf/docs/cli/intent-hooks.md)).
  - TanStack Router/Start already ship about 30 such skills inside their packages (code search hits under `packages/*/skills/`).
  - **Next.js** 16.2+ bundles version-matched docs at `node_modules/next/dist/docs/`. On 16.3+, `next dev` writes and re-adds a managed `nextjs-agent-rules` block in `AGENTS.md` pointing at them ([Next.js AI agents guide](https://nextjs.org/docs/app/guides/ai-agents), read 2026-10-25). The guide claims a 100% eval pass rate with bundled docs against "up to 79%" for skill-based approaches; that is Vercel's own eval, not checked here.
  - The old `vercel-labs/next-skills` repo now only redirects. `next-best-practices` and `next-upgrade` stopped being skills; six workflow skills moved to [`vercel/next.js/skills`](https://github.com/vercel/next.js/tree/cbf49db30a655ac17c92c2951885c4256db14b9e/skills) (README of `vercel-labs/next-skills` at `c522619`).
  - **skills-npm** symlinks skills shipped inside installed packages and fetches the skills a package declares in a `skills` field of `package.json`. A package that is only that field is a "skills pack". It is being merged into `npx skills experimental_sync` (README).
  - **playwright-cli** ships its skills in `playwright-core` (`packages/playwright-core/src/tools/skills/`) and installs them with `playwright-cli install --skills` (README).
- **Owner fit:** this answers how vendor knowledge reaches a web project without the collection copying it. Version-matched knowledge arrives with `npm install`, so the `web-guide` can say "check what this project's packages ship" (inferred design). The teams angle fits too: whatever is committed (a managed `AGENTS.md` block, project hooks, `package.json#intent`) reaches every teammate.
- **Tension with the map:**
  - Next.js writes always-on text into the project's `AGENTS.md`. That is a project fact, but its size counts against the session.
  - Intent's `SessionStart` catalog is always-on output, and its edit gate blocks the edit tools. Both would need the hook admission gate from [#14](https://github.com/Hissal/skill-collection/issues/14).
  - Neither is a skill the collection would vendor.
- **Proposed:** a research ticket, "how does the web pack consume package-shipped vendor knowledge". It would read Intent's trust model and hook output size, Next.js's `agentRules` option, and `skills experimental_sync`. Not a ledger.

### 2. Official browser and e2e tooling: Playwright, Chrome DevTools MCP, modern-web-guidance
- **Repos:**
  - `microsoft/playwright` at [`8c1b148`](https://github.com/microsoft/playwright/tree/8c1b148f3d73120aa90f10119920358062fda177) · 98.5k★ · 2026-10-25 · Apache-2.0.
  - `ChromeDevTools/chrome-devtools-mcp` at [`ada7963`](https://github.com/ChromeDevTools/chrome-devtools-mcp/tree/ada7963246c0c91eae185125a57aecd13cbe0376) · 54.1k★ · 2026-10-23 · Apache-2.0.
  - `GoogleChrome/modern-web-guidance` at [`65e7edd`](https://github.com/GoogleChrome/modern-web-guidance/tree/65e7edd67e77420eaf02c5df00fdc0521417d809) · 2.6k★ · 2026-10-19 · Apache-2.0.
- **Interesting pieces (read):**
  - **Playwright:**
    - `playwright-cli` (description 77 chars, about 20 tokens; `allowed-tools` limited to `playwright-cli` and `npx playwright`).
    - `playwright-trace` reads trace files from the command line: actions, requests, console, errors and snapshots.
    - `playwright-component-testing` sets up a story gallery driven by the built-in `mount` fixture, replacing `@playwright/experimental-ct-*`.
    - The README argues that CLI plus skills beats MCP on tokens.
  - **Chrome DevTools MCP**, seven skills (~460 tokens): `chrome-devtools`, `chrome-devtools-cli`, `a11y-debugging`, `cookie-debugging` (401/403 and session state), `debug-optimize-lcp`, `memory-leak-debugging` and `troubleshooting`. It is in the official Claude marketplace as `chrome-devtools-mcp`.
  - **modern-web-guidance**, two skills (~470 tokens): a search over a curated catalog of web-platform guides (dialogs, anchor positioning, View Transitions, INP/LCP, passkeys, sanitisation, forms), plus `chrome-extensions`. It is in the official Claude marketplace, and it ships `.codex-plugin` and `.agents/plugins/marketplace.json`.
- **Owner fit:** framework-neutral browser verification and platform knowledge for the guide's "check it in a browser" and "is there a platform primitive for this" needs. This is the web side of the `verifying` and `prototype` hand-over checks already decided in core.
- **Caveats:**
  - `modern-web-guidance`'s description says "MANDATORY: Execute FIRST for all HTML/CSS and clientside JS tasks". That is the pushy-description style the owner's trigger rule rejects.
  - Each search runs `npx -y modern-web-guidance@latest`, an unpinned remote package on every call (read in its SKILL.md).
  - The owner's desktop host already has browser tools (noted in the Addy ledger, entry on `browser-testing-with-devtools`). Pick one browser route per project.

### 3. `addyosmani/web-quality-skills`: Lighthouse and Core Web Vitals audits
[`afa8da9`](https://github.com/addyosmani/web-quality-skills/tree/afa8da942115f2961fdbfa80807ea0b232ff6c00) · 3.0k★ · last commit 2026-08-24 · MIT · Claude and Codex plugin manifests

- **What it ships (read):** six skills (~335 idle tokens): `core-web-vitals` (LCP, INP and CLS from field and lab evidence), `performance`, `accessibility` (WCAG 2.2), `seo`, `best-practices` (security and compatibility) and `web-quality-audit` (an evidence-led audit across all of them, including "agentic browsing").
- **Owner fit:** audit work is the shape the map makes user-invoked. A `/web-audit` skill plus guide references for CWV and accessibility fits the pack. This is a separate repo from the ledgered `addyosmani/agent-skills`. It overlaps that ledger's `performance-optimization` entry, which [#38](https://github.com/Hissal/skill-collection/issues/38) passed to the web pack.
- **Caveats:** last commit two months ago. Descriptions use quoted trigger phrases ("speed up my site"), which would need rewriting as triggers. Overlaps Chrome DevTools' `debug-optimize-lcp` and Cloudflare's `web-perf`.

### 4. `mcollina/skills`: server-side TypeScript and Node.js
[`c75d70d`](https://github.com/mcollina/skills/tree/c75d70dbfbe991d8cec42aeda0b64ff14fbb9ac7) · 2.0k★ · last commit 2026-10-18 · MIT

- **What it ships (read):** 11 skills (~1.55k idle tokens as a whole). Five are web-relevant (~730 tokens):
  - `node`: TypeScript type stripping, async patterns, error handling, streams, modules, testing and performance.
  - `typescript-magician`: generics, removing `any`, type guards, compiler errors.
  - `fastify`.
  - `oauth`: OAuth 2.0/2.1 flows with PKCE, client credentials, device flow, refresh rotation and JWT.
  - `linting-neostandard-eslint9`: ESLint 9 flat-config migration.
- **Owner fit:** the TypeScript baseline and the server/API side need a source that isn't a framework vendor. The author maintains Node.js core and Fastify, which is about as close to "official" as Node server practice gets.
- **Caveats:**
  - `octocat`, `init`, `documentation`, `skill-optimizer`, `snipgrapher` and `nodejs-core` are out of scope.
  - `octocat`'s trigger ("whenever the prompt contains any `github.com` URL") is very broad.
  - No plugin manifest; it installs with `npx skills add` *(inferred from layout)*.

### 5. `openai/plugins` → `codex-security`: a security review workflow
[`0722921`](https://github.com/openai/plugins/tree/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/codex-security) · repo 7.6k★ · last commit 2026-10-08 · no repo-level licence detected by `gh api`

- **What it ships (read):** 15 skills (~1.1k idle tokens):
  - `threat-model`, `security-scan`, `deep-security-scan` and `security-diff-scan` (PR, commit or working-tree patch).
  - Phase skills: `finding-discovery`, `attack-path-analysis` and `validation`.
  - Follow-ups: `triage-finding`, `fix-finding`, `verify-fix`, `assess-patch-risk`, `propose-security-hardening`, `define-security-policy` (`SECURITY.md`), `track-findings` and `vulnerability-writeup`.
  - Several descriptions already read as gates ("Use only when the user explicitly asks…").
- **Owner fit:** threat modelling and `risky-changes` were sent to the web pack by [#37](https://github.com/Hissal/skill-collection/issues/37). This is the most complete agent-native security flow found. Its discover → validate → fix → verify split mirrors the map's verifying and receiving-review rules.
- **Caveats:**
  - Codex-only packaging (`.codex-plugin`, `.mcp.json`). A Claude port means adapting.
  - No licence file was found at repo level *(read)*, so copying needs checking first.
  - Overlaps the host's `/security-review` and the ledgered `security-guidance`/`claude-security`.
  - An ideas-and-adapt candidate, not an install.

### 6. Trail of Bits (unledgered web-relevant skills) and the OWASP skill
- **Repos:**
  - `trailofbits/skills` at [`196a907`](https://github.com/trailofbits/skills/tree/196a9073ab10d35bacf111f945e02c00b2c6883a) · 7.8k★ · 2026-10-23 · **CC-BY-SA-4.0**.
  - `agamm/claude-code-owasp` at [`8ac7965`](https://github.com/agamm/claude-code-owasp/tree/8ac7965caa212b4a850aff8d3df0081ab3fa9eed) · 400★ · 2026-09-25 · MIT.
- **Interesting pieces (read):**
  - **Trail of Bits:**
    - `supply-chain-risk-auditor`: version-matched advisories for npm dependencies.
    - `static-analysis/semgrep`: presents the scan plan for explicit approval first.
    - `static-analysis/codeql` and `sarif-parsing`.
    - `variant-analysis`: find the other instances of one root cause.
    - `fp-check`: a TRUE or FALSE POSITIVE verdict.
    - `agentic-actions-auditor`: AI agents in GitHub Actions.
    - `insecure-defaults` was not present at this SHA.
    - The five ToB skills already in the ideas-skim ledger (`second-opinion`, `property-based-testing`, `mutation-testing`, `sharp-edges`, `differential-review`) are excluded.
  - **OWASP skill:** one skill (~115 tokens) built on OWASP Top 10:2025, ASVS 5.0 and the LLM and agentic Top 10s.
- **Owner fit:** gives the pack's security reference concrete checklists (ASVS) and user-invoked scans (dependencies, SAST) that matter for team web apps.
- **Caveats:** share-alike makes adapted ToB text CC-BY-SA, so take ideas only, as before. The OWASP skill is one author's digest; useful as a checklist source, not an authority.

### 7. `vercel-labs/agent-browser`: exploratory QA (`dogfood`) and browser automation
[`372ac5c`](https://github.com/vercel-labs/agent-browser/tree/372ac5ce20fab885dbf45ee0c9d510ec8c3b6fdb) · 44.6k★ · last commit 2026-10-23 · Apache-2.0

- **What it ships (read):**
  - One listed skill, `skills/agent-browser` (description ~230 tokens), plus nine loadable guides under `skill-data/`: `core`, `dogfood` ("systematically explore and test a web application to find bugs, UX issues"), `protected-vercel-deployments`, `derive-client` (HAR → API client), `webmcp-gen`, `electron`, `slack`, `agentcore` and `vercel-sandbox`.
  - Next.js's `next-dev-loop` skill pairs `/_next/mcp` with agent-browser.
- **Owner fit:** `dogfood` is a user-invoked exploratory-QA flow on a running app. It is the web counterpart of the gamedev pack's `playtest`. `protected-vercel-deployments` speaks to the prototype-sharing research ([#61](https://github.com/Hissal/skill-collection/issues/61)).
- **Caveats:** a second browser driver beside Playwright and the host's browser. Pick one per project. The `skill-data` guides are reached through the CLI, not listed *(inferred from layout)*.

### 8. `openai/plugins` → `build-web-apps`: a frontend validation loop
[`0722921`](https://github.com/openai/plugins/tree/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/build-web-apps) · no repo-level licence detected

- **What it ships (read):** six skills (~530 tokens): `frontend-app-builder`, `frontend-testing-debugging`, and vendored copies of `react-best-practices`, `shadcn-best-practices`, `stripe-best-practices` and `supabase-best-practices`.
- **Interesting piece:** `frontend-testing-debugging` has a default validation loop: name the target flow in one sentence, choose a browser path, make the smallest edit, validate the rendered result, write a QA report. It also requires recording the reason when it falls back from the host browser to Playwright.
- **Owner fit:** the loop is an idea for the pack's verification reference.
- **Caveats:** the four `*-best-practices` skills are copies of vendor skills, which is exactly the duplication the pack shape forbids. Codex-only packaging.

### 9. `wshobson/agents`: selected backend, observability and threat-modelling skills
[`0874a27`](https://github.com/wshobson/agents/tree/0874a27b17a22e2b7c2e2bcd725768e0803cad06) · 41.7k★ · last commit 2026-10-17 · MIT · multi-harness marketplace

- **Reconsidered here** because the 2026-10-09 sweep skipped it as "generic personas" with no web pack in view.
- **What it ships (read):** 92 plugins, 185 skills, 202 agents. 48 skills fall in web-relevant plugins (~3k idle tokens if all were installed):
  - `security-scanning`: `stride-analysis-patterns`, `attack-tree-construction`, `threat-mitigation-mapping`, `security-requirement-extraction`, `sast-configuration`.
  - `observability-monitoring`: `slo-implementation`, `distributed-tracing`, `prometheus-configuration`, `grafana-dashboards`.
  - `backend-development`: `api-design-principles`, `saga-orchestration`, CQRS/event sourcing.
  - `javascript-typescript`: `typescript-advanced-types`, `javascript-testing-patterns`, `nodejs-backend-patterns`.
  - `cicd-automation`: `secrets-management`, `deployment-pipeline-design`.
  - `incident-response`: `postmortem-writing`, `incident-runbook-templates`.
- **Owner fit:** fills gaps no vendor covers: SLOs, threat-model method, incident write-ups.
- **Caveats:** generic "Master X" descriptions and long template bodies. Cherry-pick ideas, never install a plugin whole.

### 10. `antfu/skills`: Vite, Vitest and pnpm skills generated from docs
[`8886fe2`](https://github.com/antfu/skills/tree/8886fe2d385d3644cbb47e46ae9cb1cf09307d3b) · 6.0k★ · last commit 2026-10-23 · MIT

- **What it ships (read):** 12 skills (~650 tokens). Nine are generated from official docs and tuned by the author: `vite`, `vitest`, `pnpm`, `vue`, `nuxt`, `pinia`, `nitro`, `unocss` and `vitepress`. Three are hand-maintained: `antfu` (opinionated tooling), `antfu-create-pr` and `antfu-issue-triage`.
- **Owner fit:** `vitest`, `vite` and `pnpm` are TypeScript tooling no official vendor ships skills for (none found in `vitest-dev`, `vitejs` or `pnpm`). The README calls it a proof of concept for generating skills from docs and keeping them in sync, which is relevant to how the pack would keep references current.
- **Caveats:** Vue and Nuxt are framework knowledge; for a Vue project they belong in the vendor layer, where this is a community stand-in. Untested by the author's own admission.

### 11. Community Playwright skills: `currents-dev/playwright-best-practices-skill`, `lackeyjb/playwright-skill`
- **Repos:**
  - `currents-dev/playwright-best-practices-skill` at [`283d5cb`](https://github.com/currents-dev/playwright-best-practices-skill/tree/283d5cbc5d11aac1abda058b16ad22c317d54dc0) · 409★ · 2026-07-21 · MIT.
  - `lackeyjb/playwright-skill` at [`dd47a6a`](https://github.com/lackeyjb/playwright-skill/tree/dd47a6a023e249eb1b36e9e943eab89d0900865d) · 3.2k★ · 2026-08-14 · MIT.
- **What they ship (read):**
  - Currents: one skill with a large reference set: flaky tests, Page Object Model, CI, API mocking, auth state. Its 984-char description is too long for a trigger.
  - Lackeyjb: one skill that auto-detects dev servers and writes reusable test scripts.
- **Owner fit:** reference material for an e2e-testing section, where Playwright's own skills lack depth on flakiness and CI.
- **Caveats:** both are older than Playwright's in-package skills, which may supersede the basics.

### 12. `Jeffallan/claude-skills`: rescanned for web, low yield
[`9e7dbd6`](https://github.com/Jeffallan/claude-skills/tree/9e7dbd688015cbd1f440374f8671028bb67c608f) · 12.1k★ · last commit 2026-10-24 · MIT

- **What it ships (read):** 67 skills (~7.35k idle tokens). Web-relevant: `playwright-expert`, `secure-code-guardian`, `fullstack-guardian`, `api-designer`, `typescript-pro`, `nextjs-developer`, `sre-engineer`, `monitoring-expert`, `websocket-engineer`.
- **Owner fit:** marginal. Persona-style "expert" skills, with nothing a vendor or pitches 2 to 9 do not do better. Listed so the closing review sees it was re-read with a web pack in view.

# Part 2: Official vendor skills and plugins

**Install routes, read from the docs and manifests:**

- **Claude Code:**
  - Plugins in the official marketplace install with `/plugin install <name>@claude-plugins-official`, or `claude plugin install … --scope project` for a team, which writes `.claude/settings.json` (CC-plugins).
  - Other repos with `.claude-plugin/marketplace.json` need `/plugin marketplace add owner/repo` first.
  - Bare skill folders install with `npx skills add owner/repo -a claude-code` (`vercel-labs/skills` README).
- **Codex:**
  - Repos with `.agents/plugins/marketplace.json` install with `codex plugin marketplace add owner/repo`, then `/plugins` (CX-plugins).
  - The OpenAI-curated marketplace is browsable in `/plugins`. Its entries are listed in `openai/plugins` *(that this repo backs the curated list is inferred)*.
  - Bare skills go in `.agents/skills` (repo) or `~/.agents/skills` (user), by hand or with `npx skills add … -a codex` (CX-skills).

**Column key:** **CPO** = in `claude-plugins-official` at `5826794`. **OAI** = in `openai/plugins` at `0722921`. **CX-mkt** = the repo has `.agents/plugins/marketplace.json`. **skills CLI** = no plugin route for that harness was found; `npx skills add` or a copy works *(inferred from the folder layout)*. Idle cost is per installed plugin, one copy.

### Frameworks and libraries

| Vendor | Repo @ SHA · ★ · last commit · licence | What it covers (read) | Idle | Claude Code | Codex |
|---|---|---|---|---|---|
| **Next.js** | `vercel/next.js/skills` @ [`cbf49db`](https://github.com/vercel/next.js/tree/cbf49db30a655ac17c92c2951885c4256db14b9e/skills) · 143k · 2026-10-24 · MIT | 6 workflow skills: `next-bundle-optimizer`, `next-cache-components-adoption`/`-optimizer`, `next-partial-prefetching-adoption`/`-optimizer`, `next-dev-loop`. Reference knowledge ships as bundled docs plus a managed `AGENTS.md` block (pitch 1) | ~450 *(inferred from 6 descriptions read)* | `/plugin marketplace add vercel/next.js` (root `.claude-plugin/marketplace.json`, plugin `nextjs`) or `npx skills add vercel/next.js` | skills CLI |
| **Angular** | `angular/skills` @ [`f50f18f`](https://github.com/angular/skills/tree/f50f18f2fb4874296a61b1c59c13bc21e3e328e4) · 696 · 2026-10-25 · none detected | `angular-developer` (signals, forms, DI, routing, SSR, a11y, testing), `angular-new-app`. Mirrored from `angular/angular` | ~175 | skills CLI | skills CLI |
| **Svelte** | `sveltejs/ai-tools` @ [`b2589f8`](https://github.com/sveltejs/ai-tools/tree/b2589f890e9c5c4a788a557315aa5012d1fba4ba) · 335 · 2026-10-20 · MIT | Svelte MCP plus `svelte-code-writer` (docs lookup and autofixer CLI) and `svelte-core-bestpractices` | ~135 | `/plugin marketplace add sveltejs/ai-tools` (plugin `svelte`, bundles MCP) | MCP plus skills CLI *(inferred)* |
| **Vue** (community) | `vuejs-ai/skills` @ [`198f0cd`](https://github.com/vuejs-ai/skills/tree/198f0cd8f7f9c0a3d9b566ccc16de6677519ee78) · 3.1k · 2026-10-23 · MIT | 8 skills (best practices, debugging, Pinia, Router, testing). README: "Early Experiment / Community Project", may be proposed to the Vue org. **Not official** | ~325 | `/plugin marketplace add vuejs-ai/skills` | skills CLI |
| **TanStack Router/Start** | in-package under `TanStack/router` @ [`da2adec`](https://github.com/TanStack/router/tree/da2adec76dbe6c0da6d6a0d5640f7b9388217f45) · 15.2k · 2026-10-24 · MIT | About 30 skills in `packages/*/skills/` (router-core: data loading, search params, auth guards, SSR; start: server functions, middleware, deployment; migrations from Next.js and React Router) | via Intent catalog | `npx @tanstack/intent install` and `hooks install` (pitch 1) | same, Codex hooks supported |
| **shadcn/ui** | `shadcn-ui/ui/skills` @ [`481d523`](https://github.com/shadcn-ui/ui/tree/481d523374745e77d0cf9c53a4115ab5dd7c8481/skills) · 126k · 2026-10-25 · MIT | `shadcn` (add, search, fix, compose components), `migrate-radix-to-base` | not measured | skills CLI (listed on skills.sh as `shadcn/ui/shadcn`) | skills CLI |
| **Hono** | `honojs/skills` @ [`e54ce51`](https://github.com/honojs/skills/tree/e54ce51f6effaeb574ebd2629e89e086e14a2db3) · 16 · 2026-10-15 · MIT | `hono` (routing, middleware, validation, testing), `hono-jsx`, `hono-void` | ~230 | `/plugin marketplace add honojs/skills` | skills CLI |
| **Deno** | `denoland/skills` @ [`d5f6ace`](https://github.com/denoland/skills/tree/d5f6ace6b113aee71ba5286612fa1bde34c7d102) · 101 · 2026-07-29 · MIT | `deno`, `deno-deploy`, `deno-frontend`, `deno-sandbox`, `migrate-to-deno` | ~390 | `/plugin marketplace add denoland/skills` | skills CLI |
| **Vercel AI SDK** | `vercel/ai/skills` @ [`682e2dd`](https://github.com/vercel/ai/tree/682e2dd71456f14f9da33a1b983d1998c3a1184c/skills) · 27.5k · 2026-10-25 · NOASSERTION | `use-ai-sdk` and `migrate-ai-sdk-v6-to-v7` for users; the rest are contributor skills for the repo itself. Also inside the Vercel plugin (below) | not measured | skills CLI | skills CLI |
| **Expo** (mobile, edge of scope) | `expo/skills` @ [`d5caf7f`](https://github.com/expo/skills/tree/d5caf7fdf8b4854351f05841a7e315ac87ad7d24) · 3.0k · 2026-10-23 · MIT | Build, deploy, upgrade and debug Expo/React Native apps, EAS | not measured | CPO `expo` | OAI `expo` |

**No official skills found** (searched 2026-10-25):

- React (`facebook`, `reactjs`).
- Astro: `withastro/skills` is an empty repo. There is a `withastro/docs-mcp` docs MCP (last commit 2025-10-25) and a maintainers-only skills repo.
- Nuxt: only antfu's community skill (pitch 10).
- Remix/React Router: `remix-run/agent-skills` is **archived** (2026-06-18).
- Storybook: `storybookjs/skills` is empty; `storybookjs/mcp` exists.
- Drizzle, Tailwind, Vitest, Vite, Biome, tRPC, NestJS, Fastify (as an org) and the TypeScript team.

### Hosting and deploy

| Vendor | Repo @ SHA · ★ · last commit · licence | What it covers (read) | Idle | Claude Code | Codex |
|---|---|---|---|---|---|
| **Vercel** | `vercel/vercel-plugin` @ [`3c88cfc`](https://github.com/vercel/vercel-plugin/tree/3c88cfc8de5d1e124d23b0ef23f32c5aa127c845) · 312 · 2026-10-23 · Apache-2.0 (LICENSE file; `gh` reports NOASSERTION) | 54 skills: deployments/CI, env vars, functions, storage, queues, flags, firewall, CDN and runtime cache, AI SDK/Gateway, Turborepo, shadcn, observability, `verification`, `investigation-mode`. Points to Next.js's own docs for Next guidance | **~4.6k** | CPO `vercel` | OAI `vercel` |
| **Cloudflare** | `cloudflare/skills` @ [`86505e4`](https://github.com/cloudflare/skills/tree/86505e44f87d801aa1864a3c4109e9a8ae5c409f) · 3.2k · 2026-10-15 · Apache-2.0 | 19 skills: Workers best practices, Wrangler, `cf` CLI, Durable Objects, Agents SDK, Sandbox, Turnstile, `web-perf`, Workers profiling, `nextjs-on-cloudflare`, Zero Trust. Bundles MCP | ~890 | CPO `cloudflare` | OAI `cloudflare`; CX-mkt |
| **Netlify** | `netlify/context-and-tools` @ [`b9f5385`](https://github.com/netlify/context-and-tools/tree/b9f53856d45aa2e8cf24721fd8a82e222deb323d) · 44 · 2026-10-22 · MIT | 15 skills: functions, edge functions, blobs, database, caching, config, deploy, forms, identity, image CDN, access control, frameworks, AI gateway, MCP servers | **~2.2k** | CPO `netlify-skills` | `codex/skills/` folder for manual copy (no Codex marketplace file) |
| **Railway** | `railwayapp/railway-skills` @ [`526e955`](https://github.com/railwayapp/railway-skills/tree/526e95524e964ed326689cbac4464d97a58ab81c) · 335 · 2026-10-13 · MIT | 1 skill `use-railway` plus MCP; ships `hooks/hooks.json` (not read) | ~250 | CPO `railway` | CX-mkt |
| **Render** | `render-oss/render-plugin-claude-code` @ [`d7ecf82`](https://github.com/render-oss/render-plugin-claude-code/tree/d7ecf826c5971eb7dfdb5aed79fa838a8d67ff46) · 1 · 2026-10-08 · MIT | 21 skills (deploy, blueprints, workers, cron, Postgres, key-value, domains, scaling, monitoring, Heroku migration), an agent, slash commands; ships hooks (not read) | ~2.1k | CPO `render` | none found |
| **AWS** | `aws/agent-toolkit-for-aws` @ [`e8c6309`](https://github.com/aws/agent-toolkit-for-aws/tree/e8c630949189f03b3dd77388c86b06a7f2f911a9) · 3.3k · 2026-10-23 · Apache-2.0; `awslabs/agent-plugins` @ [`fbefb37`](https://github.com/awslabs/agent-plugins/tree/fbefb3764e67558fe10ac834dd85db49734aa9b6) · 927 · 2026-10-09 · Apache-2.0 | CPO lists `aws-core`, `deploy-on-aws`, `aws-serverless`, `aws-amplify`, `databases-on-aws`, `aws-agents-for-devsecops` and others (descriptions read in CPO; skills not counted) | not measured | CPO (several) | not checked |
| **Firebase** | `firebase/agent-skills` @ [`92eed24`](https://github.com/firebase/agent-skills/tree/92eed24c0976a79a66d5b8038e9eda8b441ef92d) · 486 · 2026-10-20 · Apache-2.0 | 13 skills: App Hosting, Hosting, Auth, Firestore, security-rules auditor and creation, Data Connect, Remote Config, AI Logic, Crashlytics | ~1.2k | CPO `firebase` (in-tree MCP entry); repo has its own plugin | CX-mkt |
| **HashiCorp** (IaC) | `hashicorp/agent-skills` @ [`f706481`](https://github.com/hashicorp/agent-skills/tree/f706481af9b8fedb66de909f6243ad29601afa0c) · 907 · 2026-09-28 · MPL-2.0 | Terraform skills (mostly provider authoring and module standards, per VoltAgent's index) | not measured | `/plugin marketplace add hashicorp/agent-skills` | CX-mkt |

### Data, ORMs and backends

| Vendor | Repo @ SHA · ★ · last commit · licence | What it covers (read) | Idle | Claude Code | Codex |
|---|---|---|---|---|---|
| **Supabase** | `supabase/agent-skills` @ [`c9be0e9`](https://github.com/supabase/agent-skills/tree/c9be0e931b7930f7d02126d04774d904c381e7d7) · 2.9k · 2026-10-02 · MIT | `supabase` (all products) and `supabase-postgres-best-practices` ("for Postgres running anywhere"). Both descriptions are pushy ("ANY task", "BEFORE writing") | ~405 | CPO `supabase` → `supabase-community/supabase-plugin` @ [`016bf5b`](https://github.com/supabase-community/supabase-plugin/tree/016bf5b36670f7ad189ca90223513bd10406392d) (MCP plus the same 2 skills) | OAI `supabase` |
| **Neon** | `neondatabase/agent-skills` @ [`ccca333`](https://github.com/neondatabase/agent-skills/tree/ccca3334a7542d3133134cc6926f2fafc6edeb1f) · 105 · 2026-10-23 · Apache-2.0 | 9 skills: Postgres connections and migrations, branches, egress optimiser, auth (managed Better Auth), functions, object storage, realtime, AI gateway | **~1.6k** | CPO `neon` | skills CLI |
| **Prisma** | `prisma/skills` @ [`ba3f9d7`](https://github.com/prisma/skills/tree/ba3f9d73200bbb62e49733ab93a961fd138a2c18) · 76 · 2026-10-16 · MIT | 10 skills: CLI, Client API, ORM setup, Postgres setup, v6→v7 upgrade, MongoDB-on-v6 guide, driver adapters, Prisma Compute (2 deprecated aliases) | ~870 | skills CLI. CPO `prisma` is a separate MCP-only plugin (`prisma/claude-plugin` @ `815dbc4`, last commit 2026-03-11) | skills CLI |
| **PlanetScale** | `planetscale/claude-plugin` @ [`95c80f9`](https://github.com/planetscale/claude-plugin/tree/95c80f9f391be9b1b6172bf82d4191e1ec11b637) · 5 · 2026-08-24 · Apache-2.0 | Hosted MCP plus 19 skills | ~910 | CPO `planetscale` | none found |
| **MongoDB** | `mongodb/agent-skills` @ [`155bb9c`](https://github.com/mongodb/agent-skills/tree/155bb9c4b42a9a3e019f47be0669de0e4547d1ea) · 190 · 2026-10-19 · Apache-2.0 | 8 skills: schema design, query optimiser, connection, search and AI, MCP setup | ~1.1k | CPO `mongodb` / `mongodb-atlas` | CX-mkt |
| **Redis** | `redis/agent-skills` @ [`a84871d`](https://github.com/redis/agent-skills/tree/a84871d065f398fed55e1633f66b66f731eb4e2b) · 170 · 2026-09-08 · MIT | 8 skills: core, connections, clustering, search, security, observability, semantic cache | ~930 | CPO `redis-development` | `.codex-plugin` present, no marketplace file |
| **Upstash** | `upstash/skills` @ [`a5da15b`](https://github.com/upstash/skills/tree/a5da15b5bdc221a87203c87587c63ee727682a9a) · 34 · 2026-10-21 · MIT | 14 skills: Redis, rate limiting, QStash, Workflow, Vector, Search, Blob, Box | **~2.7k** | `/plugin marketplace add upstash/skills` | CX-mkt |
| **Turso** | `tursodatabase/agent-skills` @ [`34ced52`](https://github.com/tursodatabase/agent-skills/tree/34ced52fd1bd32e802622126e299cfa886d68441) · 29 · 2026-07-22 · MIT | `turso-db`, `turso-cloud` | ~350 | skills CLI | skills CLI |
| **Convex** | `convex/agent-skills` @ [`191a5c3`](https://github.com/convex/agent-skills/tree/191a5c33a7e7a22ec9d5ff13930f84748bbcf8f8) · 66 · 2026-10-13 · Apache-2.0; plugin `get-convex/convex-backend-skill` @ [`de550bc`](https://github.com/get-convex/convex-backend-skill/tree/de550bc1dd0857bd564e891140832c1ab4498900) · 6 · 2026-10-16 · none detected | 33 skills in the skills repo; the CPO plugin bundles 17 skills, a `convex-expert` subagent, MCP and hooks (not read) | ~1.2k (plugin) | CPO `convex` | skills CLI |
| **Apollo GraphQL** | `apollographql/skills` @ [`f9843dc`](https://github.com/apollographql/skills/tree/f9843dce86b1a561e3bfbb024e65c28a6cbbe38c) · 119 · 2026-10-20 · MIT | 15 skills: Client, Server, Federation, Connectors, Router, Rover | ~1.7k | CPO `apollo-skills` | skills CLI |
| **Sanity** (CMS) | `sanity-io/agent-toolkit` @ [`571a2d0`](https://github.com/sanity-io/agent-toolkit/tree/571a2d077554bd1272f31c345ecb7719889e7957) · 194 · 2026-10-23 · MIT | MCP, skills, slash commands (CPO description; not counted) | not measured | CPO `sanity` | not checked |

**No official skills found:** Drizzle (`drizzle-team` has no agent repo; no `SKILL.md` in `drizzle-orm`), Kysely.

### Auth

| Vendor | Repo @ SHA · ★ · last commit · licence | What it covers (read) | Idle | Claude Code | Codex |
|---|---|---|---|---|---|
| **Clerk** | `clerk/skills` @ [`d694f27`](https://github.com/clerk/skills/tree/d694f2709372feb38b87aa905ee2219a485095ab) · 89 · 2026-10-23 · none detected | 20 skills: a `clerk` router, setup, CLI, custom UI, orgs (B2B), billing, webhooks, backend API, `clerk-testing` (Playwright/Cypress), per-framework patterns (Next.js, React, React Router, TanStack, Vue, Nuxt, Astro, Expo, Chrome extension) | **~1.5k** | `/plugin marketplace add clerk/skills` | CX-mkt |
| **Auth0** | `auth0/agent-skills` @ [`7b3821d`](https://github.com/auth0/agent-skills/tree/7b3821d533430eef35fd7406a87b7b8d02302bdf) · 54 · 2026-10-15 · Apache-2.0 | One `auth0` skill: login, SSO, MFA, API protection | ~180 | CPO `auth0` | CX-mkt |
| **WorkOS** | `workos/skills` @ [`41fdb98`](https://github.com/workos/skills/tree/41fdb988f8f5e015c1feb90ac74aef50b20c0ecd) · 45 · 2026-10-20 · MIT | `workos` (AuthKit, SSO, Directory Sync, RBAC, Vault, Audit Logs, migrations), `workos-widgets` | ~420 | CPO `workos` | CX-mkt |
| **Better Auth** | `better-auth/skills` @ [`20c9e88`](https://github.com/better-auth/skills/tree/20c9e88a5c007461a703f1c213572b073196113e) · 225 · 2026-09-01 · none detected | 6 skills: best practices, create-auth, email and password, organizations, 2FA, `security` (rate limits, CSRF, trusted origins, cookies) | ~450 | `/plugin marketplace add better-auth/skills` | skills CLI |

Supabase, Firebase, Neon and Netlify also ship auth skills inside their plugins (above).

### Payments, email, observability, testing, security scanners

| Vendor | Repo @ SHA · ★ · last commit · licence | What it covers (read) | Idle | Claude Code | Codex |
|---|---|---|---|---|---|
| **Stripe** | `stripe/ai` @ [`8bbcc4b`](https://github.com/stripe/ai/tree/8bbcc4bcc8b6b0d6addb886a72994134cb0334da) · 2.0k · 2026-10-25 · MIT | 10 skills: best practices, docs, API upgrades, Connect, Apps, Projects, Metronome, directory, pay. MCP. Claude plugin ships **hooks**: a `SessionStart` (startup) that emits Stripe CLI guidance as context, plus `PostToolUse` on Skill/Agent | **~1.5k** + hook output | CPO `stripe` (or `/plugin marketplace add stripe/ai`) | OAI `stripe`; CX-mkt (`INSTALLED_BY_DEFAULT` policy in its Codex marketplace) |
| **Resend** | `resend/resend-skills` @ [`b2ae7b1`](https://github.com/resend/resend-skills/tree/b2ae7b1798b70134faf679f35fc05b4331462988) · 206 · 2026-10-17 · MIT | `resend`, `resend-cli`, `react-email`, `email-best-practices`, `agent-email-inbox` | ~585 | CPO `resend` | skills CLI |
| **Sentry** | `getsentry/sentry-for-ai` @ [`cb3ad7d`](https://github.com/getsentry/sentry-for-ai/tree/cb3ad7df272ee52326e1f710a866039aecffc460) · 272 · 2026-10-23 · MIT; published as `getsentry/plugin-claude` @ [`1b082a0`](https://github.com/getsentry/plugin-claude/tree/1b082a07d1a8149cf8a50596dd609fd1edf8f7df) | 8 skills: get-started, instrument, debug-issue, fix-stack-traces (source maps), releases, alerts, OTel exporter, snapshots. 26 per-SDK legacy skills are `disable-model-invocation: true` | ~690 | CPO `sentry` (also `sentry-cli`, whose source repo is now archived) | OAI `sentry`; `src/plugins/codex/marketplace.json` |
| **Datadog** | `datadog-labs/claude-code-plugin` @ [`195f570`](https://github.com/datadog-labs/claude-code-plugin/tree/195f570c002beab3d7bd342739034d0019aa4863) · 17 · 2026-08-27 · Apache-2.0 | MCP (logs, metrics, traces) plus 5 skills; ships hooks (not read) | ~430 | CPO `datadog` | OAI `datadog` (MCP) |
| **PostHog** | `PostHog/ai-plugin` @ [`7ad03cd`](https://github.com/PostHog/ai-plugin/tree/7ad03cd9fb0eec4a97ff480e213aa5933790db49) · 95 · 2026-10-24 · none detected | Analytics, flags, experiments, error tracking, LLM costs. **174 skills**; ships Claude and Codex hooks plus a telemetry sub-plugin | **~21.6k**: far past the pack tripwire on its own | CPO `posthog` | OAI `posthog`; CX-mkt |
| **Grafana** | `grafana/ai-marketplace` @ [`6c28ba1`](https://github.com/grafana/ai-marketplace/tree/6c28ba1961d502d82301cbd64d2322e6e960477c) · 19 · 2026-10-08 · Apache-2.0 | `grafana-mcp`, `grafana-cloud-mcp`, `grafana-assistant` | not measured | CPO (3 entries) | not checked |
| **Playwright** | `microsoft/playwright` in-package (pitch 2); `microsoft/playwright-mcp` @ [`0c4107a`](https://github.com/microsoft/playwright-mcp/tree/0c4107acbecb75472b23c05c0e42471a0011874f) · 38.6k · 2026-10-22 · Apache-2.0 | CLI skills (`playwright-cli`, trace, component testing) or MCP | ~20 per CLI skill | `playwright-cli install --skills`; CPO `playwright` (MCP) | `playwright-cli install --skills` *(the README names Claude Code and Copilot; Codex inferred)* |
| **Chrome DevTools** | pitch 2 | 7 debugging skills plus MCP | ~460 | CPO `chrome-devtools-mcp` | MCP config *(inferred)* |
| **Cypress** | `cypress-io/ai-toolkit` @ [`5258ece`](https://github.com/cypress-io/ai-toolkit/tree/5258ece52a0010d268946e08606c98784c98f255) · 47 · 2026-10-23 · MIT | `cypress-author`, `cypress-explain`, `cypress-docs`, `cypress-tap`, `cypress-cloud-cli` | not measured | `/plugin marketplace add cypress-io/ai-toolkit` | skills CLI |
| **Semgrep** | `semgrep/guardian` @ [`653bd65`](https://github.com/semgrep/guardian/tree/653bd65347baf7f9fcfbf4f5376dee12599eb61b) · 19 · 2026-10-22 · none detected | MCP plus 4 skills; ships hooks (not read) | ~360 | CPO `semgrep` | `.codex-plugin` present |
| **SonarQube** | `SonarSource/sonarqube-agent-plugins` @ [`926e5f0`](https://github.com/SonarSource/sonarqube-agent-plugins/tree/926e5f067ff932d535151e70b1894d22ee298629) · 113 · 2026-10-22 · NOASSERTION | 10 skills plus Claude hooks (not read); "7,000+ rules, secrets scanning" | ~375 | CPO `sonarqube` | CX-mkt |

CPO also lists security partners not opened here: Aikido, Endor Labs, Sonatype, StackHawk (DAST), 42Crunch (OpenAPI), NightVision and JFrog.

### What the vendor layer shows (inferred from the tables)

- **Most vendors ship one plugin for both harnesses.** Of the vendors above, 29 are in CPO and 8 in OAI. Many more carry a `.agents/plugins/marketplace.json`, so `codex plugin marketplace add` works. The remainder install as bare skill folders.
- **Idle cost varies by two orders of magnitude.** Auth0 is ~180 tokens; Vercel ~4.6k; PostHog ~21.6k. The per-pack 1,000-token tripwire from [#14](https://github.com/Hissal/skill-collection/issues/14) measures the collection only, but a project that enables Vercel plus Stripe plus Clerk adds ~7.6k of vendor descriptions. The guide's setup step could report that cost when a vendor plugin is picked. Picking single skills from a vendor repo (as with the Unity baseline) is possible wherever the vendor ships bare folders. CC plugin skills cannot be disabled one at a time ([#2](https://github.com/Hissal/skill-collection/issues/2)).
- **Vendors ship always-on pieces.** Stripe, Vercel, Convex, Railway, Render, Datadog, PostHog, Semgrep and SonarQube ship hooks. Vercel's README says telemetry is **on by default** (`VERCEL_PLUGIN_TELEMETRY=off` to disable) and that session-start context is injected only for detected Vercel/Next.js projects. PostHog has a telemetry sub-plugin. None of these was checked against the hook admission gate. That is a job for the ledger or theme, not this sweep.
- **Pushy descriptions are common** ("MUST", "MANDATORY", "ANY task"): Supabase, Svelte, Vue, modern-web-guidance. Under the owner's trigger rule these are accepted as vendor text, not copied.
- **Duplication already exists between vendors.** OpenAI's `build-web-apps` copies Vercel's React, Stripe's and Supabase's skills. Vercel's plugin carries `react-best-practices` and `shadcn`. Supabase's Postgres skill and Neon's overlap. The pack's "one source per piece of knowledge" rule will need a tie-break: prefer the package-shipped copy, then the vendor's own repo.

# Considered and skipped

- **`sickn33/agentic-awesome-skills`** (48.5k★) and **`alirezarezvani/claude-skills`** (28.7k★, 380 skills): catalogs and control planes, not sources.
- **`yonatangross/orchestkit`** (106 skills, 36 agents, 171 hooks): a kitchen-sink toolkit, against the idle budget, like ECC.
- **`jezweb/claude-skills`** (1.1k★) and **`secondsky/claude-skills`**: Cloudflare/React/Tailwind stack skills that duplicate vendor skills.
- **`alexfazio/plankton`** (377★): a write-time lint/format hook system; Windows is unsupported (README) and the last commit was 2026-03-08. The idea (run the project's checks on every edit) is worth one line in the theme.
- **`bartolli/claude-code-typescript-hooks`**: last commit 2025-08-26.
- **`anthropics/claude-code-security-review`** (6.5k★): a GitHub Action, last commit 2026-02-11. The host's `/security-review` covers in-session work. Reconsider if team CI wants an agent review step.
- **`snyk/agent-scan`** (3.2k★): scans agent skills and MCP servers; a maintenance tool (vendoring flow), not web pack.
- **`browserbase/skills`** (3.7k★, no licence) and scraping vendors (Firecrawl, Bright Data, Zyte, Exa, Tavily): cloud browsing and data extraction, outside building a web app.
- **Offensive security skills** (`MyuriKanao/src-hunter-skill`, `hassan-algo/open-sesame`, `kulchankas/paranoid`, `tanviet12/vbsec`, `UnitOneAI/SecuritySkills`): pentest playbooks or small single-author repos. Pitch 6 covers the defensive side.
- **`vercel-labs/next-skills`**: moved to `vercel/next.js` (pitch 1). **`remix-run/agent-skills`**: archived. **`withastro/skills`** and **`storybookjs/skills`**: empty.
- **`vercel-labs/skills`** (36.5k★, the `npx skills` CLI): a delivery tool, already weighed in `research/vendoring.md` (no SHA pin, silent overwrite). It reappears in pitch 1 only for `experimental_sync`.
- **`wshobson/agents`** plugins outside pitch 9 (Kubernetes, multi-cloud, Python, mobile), and **Jeffallan** beyond pitch 12: out of stack.
- **Awesome lists** (`hesreallyhim/awesome-claude-code`, `travisvn/awesome-claude-skills`, `VoltAgent`): used to sweep, not sources.
- **`github/awesome-copilot`**: not opened; noted for a later look if the ledger wants Copilot-authored web skills.

# Proposed next steps

- **Research ticket:** consuming package-shipped vendor knowledge (pitch 1). Read Intent's trust model, hook output size and edit-gate behaviour on both harnesses; Next.js's `agentRules` configuration and managed block size; and `npx skills experimental_sync`. Output: how the `web-guide` and `setup-project` find and layer vendor knowledge without naming vendors.
- **Ledger A, browser verification and web quality:** pitches 2, 3, 7, 8 and 11 (Playwright in-package skills, Chrome DevTools MCP, modern-web-guidance, web-quality-skills, agent-browser `dogfood`, build-web-apps' validation loop, the community Playwright references).
- **Ledger B, server, TypeScript and tooling:** pitches 4, 10 and the backend/observability half of pitch 9 (mcollina, antfu's vite/vitest/pnpm, wshobson's SLO, tracing, API-design and TS-types skills).
- **Ledger C, web security:** pitches 5, 6 and the threat-modelling half of pitch 9 (Codex Security, Trail of Bits' supply-chain/SAST/variant/fp-check, OWASP, wshobson STRIDE and attack trees), alongside the threat-model and `risky-changes` items already sent to the web pack.
- **No ledger:** pitch 12 (Jeffallan). The vendor list (Part 2) needs no ledger. Per the pack shape, vendors are picked per project at setup. The theme only decides how the guide and setup present them, including idle cost and any hooks a vendor plugin brings.
