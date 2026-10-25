# Ledger: web browser verification and quality skills

Ticket: [#67](https://github.com/Hissal/skill-collection/issues/67), part of the [wayfinder map](https://github.com/Hissal/skill-collection/issues/1); feeds Theme: web pack. Read on 2026-10-25 through `gh api` (HEAD, trees, contents and compare endpoints) and SHA-pinned raw text. Nothing from a source was installed or executed. Statements about runtime behavior are source/documentation findings, not observations of a running tool.

Vocabulary follows [GLOSSARY.md](../../GLOSSARY.md); harness facts follow [loading-mechanics](../loading-mechanics.md). Cross-checks: the [discovery sweep](../web-pack-discovery.md), [frontend ledger](web-frontend-skills.md), [Addy agent-skills ledger](addy-agent-skills.md), [fork ledger](mattpocock-skills-unity.md), and the map's Notes. **24 entries. Recommendations are proposed; the owner decides.**

## Fixed context and proposed answer

**Fixed by the owner:** the whole-app web pack exists, with TypeScript as its framework-neutral baseline. One model-invoked `web-guide` owns disclosed references answering core extension points; skills sit on top. Official vendor knowledge is selected per project at setup, with idle cost, hooks and telemetry disclosed, and layered on without duplication. The owner works in teams; neither team work nor broad coverage is a reason to reject a candidate.

`browser-check` is already decided: user-invoked, adapted from compound-engineering's `ce-test-browser`, every touched route Pass/Fail/Skip with a reason, human-only flows paused, and `ce-dogfood`'s journey taxonomy available as deep mode. Its guide reference answers `verifying`, uses [Addy's Security Boundaries][add-security], prefers the host-native browser, keeps one driver per run, and introduces no third browser stack. `break-ui` is also decided. This ledger adds evidence and proposed reference content; it does not reopen those decisions.

**Proposed answer to the ticket:** retain **host-native browser, then `agent-browser` fallback** for interactive `browser-check`, including the existing preflight-only switch rule. Name **Playwright Test as the default for a new durable cross-browser E2E suite**, while retaining an existing project's Cypress or other established runner. For `tdd`, choose the seam and cheapest meaningful test first: the project's unit/API runner, DOM/component tests where appropriate, and browser E2E for browser-dependent journeys. Offer Vitest for a new TypeScript unit/integration suite; do not make every test a browser test or prescribe test-percentage quotas.

These are separate jobs: the browser-check driver controls a live verification session; a repository's test runner executes committed regression tests. Running a project's existing E2E command does not authorize another interactive browser-control stack. A missing interactive capability is a recorded blocker/Skip, or a separately scoped diagnostic run, not an excuse to swap sessions halfway through.

## Source pins and scope

All nine pitch-source HEADs below were checked with `gh api repos/<repo>/commits/HEAD` and are **unchanged from the discovery sweep**. A HEAD pin describes the source read, not the version installed in a project or proof that a published npm release contains that commit.

| Source | SHA read | Scope read | Licence |
|---|---|---|---|
| `microsoft/playwright` | [`8c1b148`][p-root] | All 3 package-shipped skills in full; CLI test-running reference in full, generation reference's planning/assertion/healing sections; official best-practices, auth, browser, accessibility and component-testing docs in relevant sections; LICENSE and NOTICE | [Apache-2.0][p-license], [NOTICE][p-notice] |
| `microsoft/playwright-cli` | [`b1a5903`][pc-root] | README installation/skills/CLI-versus-MCP sections, skill frontmatter/command outline and text comparison with package skill; tree | [Apache-2.0][pc-license], as in sweep |
| `ChromeDevTools/chrome-devtools-mcp` | [`ada7963`][c-root] | All 7 skills; README privacy, configuration, manifests and tree; relevant diagnostic instructions | [Apache-2.0][c-license] |
| `GoogleChrome/modern-web-guidance` | [`65e7edd`][g-root] | Both skills; README, manifests, tree; accessibility, security and image-priority guides | [Apache-2.0][g-license] |
| `addyosmani/web-quality-skills` | [`afa8da9`][q-root] | All 6 skills; measurement/RUM, accessibility/WCAG, browser security references; analyzer script text and manifests | [MIT, 2026 Addy Osmani][q-license] |
| `vercel-labs/agent-browser` | [`372ac5c`][a-root] | Discovery stub, dogfood, taxonomy, report template and trust boundaries in full; README relevant commands/security; tree and LICENSE | [Apache-2.0][a-license] |
| `openai/plugins` → `build-web-apps` | [`0722921`][o-root] | README, manifest, 2 workflow skills, their Codex metadata, 4 vendor-copy frontmatters/outlines, full subtree paths | Manifest [declares MIT][o-manifest]; no root or build-web-apps licence/notice file in the tree read |
| `currents-dev/playwright-best-practices-skill` | [`283d5cb`][r-root] | Skill in full; 12 selected references in outline and the sections cited below; all 58 reference paths inventoried; licence | [MIT, 2026 Currents Software Inc.][r-license] |
| `lackeyjb/playwright-skill` | [`dd47a6a`][l-root] | Skill, `run.js`, `lib/helpers.js` and licence in full; tree | [MIT, 2025 lackeyjb][l-license] |

Overlap sources were also refreshed: compound-engineering is still [`1522cc3`][ce-root], the frontend ledger's pin; its two browser skills, route/report reference and journey taxonomy were re-read. Addy `agent-skills` moved from the Addy ledger's `1401c8b` to [`aeac41d`][add-root] (64 commits); the compare contains no change to `browser-testing-with-devtools/SKILL.md`, and its Security Boundaries were re-read at HEAD. No new decision is inferred from those upstream commits.

Supporting primary sources for the tooling answer: Vitest [`867a5e4`][v-root] (getting-started and Browser Mode provider/motivation sections), Cypress AI Toolkit [`5258ece`][cy-root] (README and skills overview; unchanged from sweep), DOM Testing Library [`6049cc0`][tl-root] (README's purpose and guiding principles). Google's telemetry implementation was checked separately at `modern-web-guidance-src` [`d048db9`][g-telemetry]; that is **not** a release provenance claim. W3C WCAG source is pinned in the conflict notes below. These supporting sources are not additional vendor-skill ledgers.

**Reading limits.** Currents' framework references, remaining 46 references and most examples were not read in full. Agent-browser's Electron/Slack/cloud/HAR-to-client/WebMCP-generation guides were inventoried but not evaluated; protected-deployment access remains deployment research. Playwright's repo-maintainer `.claude/skills` are not the package's consumer skills and are outside this ticket. No browser, audit, script, hook or test was run, and no performance or accessibility score was measured.

## Loading, execution and provenance

Idle estimates below use **description characters / 2.6 + about 5 tokens for the name**, matching the closest prior ledger's method. They are estimates, not harness measurements. User-invoked adaptations and disclosed guide references add **0** idle tokens; they share the one `web-guide` trigger (previous ledger estimate: 40–70 tokens). This is not a reason to narrow the pack: breadth belongs in disclosed references. Model-invoked vendor picks cost context only in projects that select them.

| Source as published | Description cost estimate | Setup disclosures |
|---|---|---|
| Playwright's 3 package skills | ~217 tokens: CLI 35, trace 54, component testing 128 | Version-match to the project's package. CLI README advertises `install --skills`; main's CT docs also show `init-skills`. Do not assume a particular release supports either solely from HEAD |
| Chrome's 7 skills | ~740 total | No lifecycle hooks found in inspected tree/manifests. MCP tool exposure is additional context beyond descriptions. Usage statistics default on; `--no-usage-statistics` opts out. Trace-URL CrUX transmission has separate `--no-performance-crux`; update checks separate `CHROME_DEVTOOLS_MCP_NO_UPDATE_CHECKS`. Isolation and sensitive-header redaction default false ([README][c-readme], [configuration][c-config]) |
| Google's 2 skills | ~732 total | No lifecycle hooks found. `npx -y modern-web-guidance@latest` executes an unpinned package. Telemetry includes search queries, retrieval IDs, agent identity and installation counts; `DISABLE_TELEMETRY=1` opts out ([README][g-readme], [logger][g-telemetry]) |
| Addy's 6 quality skills | ~546 total | No lifecycle hooks found. Optional Bash HTML analyzer is source-only smoke testing, not a rendered-app audit ([script][q-script]); no runtime telemetry conclusion from reading skill text |
| Agent-browser discovery stub | ~361 if listed | `hidden: true` is present, but is not either harness's documented user-only gate. Do not infer zero idle cost from that key. Nine version-served guides are not nine additional catalog entries. Installing the CLI/browsers is an execution decision outside this research |
| Build Web Apps' 6 skills | ~850 total | No lifecycle-hook file in inspected subtree; shadcn skill embeds a dynamic `npx shadcn@latest info` command ([skill][o-shadcn]). No runtime telemetry audit of its external tools |
| Currents / Lackeyjb | ~383 / ~142 | Neither needs another catalog entry in the pack. Lackeyjb installs dependencies in the skill directory and uses its own executor; Bash examples need a PowerShell rewrite |

Permissive copying/adaptation is allowed under the owner's rule. At implementation, store the pinned source and original baseline, describe local changes, and carry the applicable MIT copyright/permission notice or Apache licence/attribution and any applicable NOTICE. No source text is vendored by this ledger. OpenAI's manifest is useful licence evidence, but supplies no copyright notice to carry: take the independently expressed validation ideas now and resolve notice provenance before copying substantial text. This is not a CC-BY-SA restriction; none of the nine pitch sources is CC-BY-SA.

## Guide answers and workflow boundaries (proposed)

| Core extension point / need | Reference answer |
|---|---|
| `tdd`: test choice and seam | Discover package manager, installed versions, scripts, existing runner and public seam. Use unit/API tests for logic/contracts, DOM Testing Library-style user-visible queries for component behavior, real-browser tests for layout/browser APIs, and Playwright Test for new E2E journeys. Vitest is a candidate for new TS unit/integration work; keep existing Jest, node:test, Cypress or another established runner when appropriate |
| `tdd`: browser component testing | Select the project's established component tooling. Vitest Browser Mode can use Playwright or WebdriverIO providers; its docs prefer a real provider for CI and say Browser Mode does not replace E2E ([providers][v-browser], [limits][v-why]). Current Playwright source's story-gallery approach is another option, with installed-version checks. Do not migrate a working component suite merely to unify tools |
| `verifying`: automated evidence | Run the project commands for typecheck, lint, build and relevant tests. Preserve failure, flaky-on-retry and could-not-run distinctions. Report commit/URL, browser/device, dataset/auth role, conditions and artifact locations; do not turn an unexecuted check into a pass |
| `verifying`: rendered evidence | Apply the decided browser verification reference: changed-file-to-route mapping, route statuses, explicit expected interaction/result, relevant console/network evidence and screenshots for visual claims. Record the chosen driver and fallback reason. Passing tests/build alone does not prove an affected rendered journey |
| `diagnosing-bugs` / performance | Trace-backed attribution, controlled reruns, retained failure evidence and the project's official tooling. Chrome's diagnostics are vendor picks for a separately selected diagnostic environment, not permission to replace the active browser-check driver |
| UI quality, performance, SEO, browser security | Expand existing disclosed references with Q1–Q5; new SEO reference where needed. Keep field/lab/source-only/human-pending evidence distinct. Q6 proposes a user-invoked audit across these references |

The runner proposal is based on first-party Playwright behavior/isolation/locator and cross-browser documentation ([best practices][p-best], [browsers][p-browsers]), not the popularity of a community skill. It is a default for new suites, not a claim of universal superiority: this investigation did not benchmark Playwright against Cypress, WebdriverIO, Selenium or other tools. Cypress has its own [official author/explain/docs skills][cy-readme]; select those in Cypress projects rather than translating its suite into Playwright. Testing Library's [public-behavior principle][tl-readme] fits core `tdd`; no framework-specific component library is mandated.

The decided driver policy is precise: host-native capability first; `agent-browser` only when unavailable or initialization fails **before any route is tested**. After testing starts, finish with that driver and mark unsupported work explicitly. An offline trace reader is evidence analysis, not a replacement live driver. A pre-existing automated suite can launch its configured browsers separately; do not share its element refs, cookies or active session with an interactive run. A diagnostic capability that would require a different live driver needs its own scope and evidence record.

## Playwright (P1–P3)

### P1. Package-shipped `playwright-cli`

- **What it is.** Official browser command/reference skill: snapshot refs, semantic locators, interactions, emulation, network, trace/recording and test generation. The [package skill][p-cli] has the same 77-character description as the [CLI repo copy][pc-skill]; [README][pc-readme] documents skill installation and argues CLI versus MCP token tradeoffs.
- **Kind**: skill.
- **Proposed address**: project-selected official vendor skill; not copied into the web pack.
- **Why it could fit.** Version-matched browser/test commands and current generation/debugging mechanics for teams maintaining Playwright suites.
- **Why it might not.** It supplies another live driver, global-install examples, cookie reads and WebMCP shortcuts. Its preference for lighter mobile pages cannot substitute for the actual target viewport. The two source copies differ in documented `--raw` snapshot behavior despite matching descriptions; use installed-version knowledge. Command capability is not task authorization.
- **Copy / adapt / idea-only**: pick the package-matched vendor skill where needed; keep the collection's policy in the guide. If later adapting text, Apache provenance applies. Do not copy the large command catalog or install `@latest` from the guide.
- **Overlap**: decided browser-check driver contract; core `tdd` and `diagnosing-bugs`; C1 and A1 are alternative driver knowledge.
- **Idle context cost**: ~35 tokens where selected; 0 additional collection tokens.
- **Recommendation (proposed)**: vendor pick for Playwright tooling, subordinate to the selected run's driver and security policy.

### P2. `playwright-trace`

- **What it is.** [Official trace CLI skill][p-trace]: open a trace zip, inspect actions, requests, errors, console, frozen DOM snapshots, screenshots and attachments, then close extracted data.
- **Kind**: skill.
- **Proposed address**: project-selected official vendor skill; guide pointer from test-failure diagnosis.
- **Why it could fit.** Teammates can inspect CI evidence without reproducing a flaky browser failure. Frozen-snapshot inspection is distinct from driving a new live session.
- **Why it might not.** Trace contents can include sensitive data, and main's CLI commands may be newer than the installed package. A snapshot cannot prove a currently running app works.
- **Copy / adapt / idea-only**: select version-matched vendor knowledge; guide states evidence handling/limits without copying commands.
- **Overlap**: R1 flake investigation, R3 artifacts and core diagnosis; no Unity-baseline duplication.
- **Idle context cost**: ~54 tokens where selected.
- **Recommendation (proposed)**: vendor pick when Playwright traces are produced; disclose from the guide, not a new pack skill.

### P3. `playwright-component-testing`

- **What it is.** [Official skill][p-ct] creates a story gallery owned by the app and uses `@playwright/test`'s `mount` fixture. Current [component docs][p-ct-doc] say experimental CT packages were removed; React/Vue examples and migration references are provided.
- **Kind**: skill.
- **Proposed address**: conditional official vendor pick; guide's testing reference explains when real-browser component tests earn their cost.
- **Why it could fit.** Real layout, browser APIs and visual regression using the team's existing app/dev-server context.
- **Why it might not.** Gallery setup, providers and bundler glue belong to a project. The skill says no extra packages are needed, then requires Vite/framework plugins for its standalone-server branch. Current main is not proof the project's installed version has `mount`.
- **Copy / adapt / idea-only**: select matched vendor content after checking the installed version; do not reproduce framework templates in the guide or force migration from existing tooling.
- **Overlap**: R4's older experimental-CT examples conflict; Vitest Browser Mode is another component-testing option; `break-ui` supplies data cases, not a test runtime.
- **Idle context cost**: ~128 tokens where selected.
- **Recommendation (proposed)**: conditional vendor pick, with version-aware guidance; no universal component runner.

## Chrome DevTools and Google platform guidance (C1–C3, G1–G2)

### C1. `chrome-devtools` and `chrome-devtools-cli`

- **What it is.** Two official interfaces: [MCP skill][c-mcp] teaches page IDs, snapshot UIDs, wait/snapshot/interact and output filtering; [CLI skill][c-cli] uses a persistent background server through terminal commands. The MCP skill excludes slim mode; the CLI's unrestricted file access can be limited to OS temp with `--allowUnrestrictedPaths=false`.
- **Kind**: skill (two vendor alternatives).
- **Proposed address**: project-selected official vendor tooling, outside the pack.
- **Why it could fit.** Browser internals and focused diagnostics when that tool is the project's chosen diagnostic environment.
- **Why it might not.** Extra tool/context cost, privacy defaults above, Chrome-specific evidence and a direct collision with adding a third interactive stack.
- **Copy / adapt / idea-only**: select the appropriate official interface; no duplicated command reference. Setup must show telemetry, profile, redaction and path-access behavior.
- **Overlap**: P1, A1, host-native browsing and Addy's browser-testing skill. A Playwright API inside a host surface is still host-native; an independently configured Chrome MCP is not.
- **Idle context cost**: ~111 + ~57 tokens, plus exposed MCP tool context where applicable.
- **Recommendation (proposed)**: conditional vendor picks for explicitly scoped diagnostics; never an automatic browser-check fallback.

### C2. Accessibility, cookie, LCP and memory diagnostics

- **What it is.** Four official skills: [a11y-debugging][c-a11y] combines Lighthouse/tree/keyboard/focus checks; [cookie-debugging][c-cookie] separates active sessions from isolated consent tests and inspects rejection/revocation and request headers; [debug-optimize-lcp][c-lcp] follows trace/subparts/element/waterfall/fix/retrace; [memory-leak-debugging][c-memory] compares baseline/action/reverted heap snapshots and retaining paths, requiring `--memoryDebugging`.
- **Kind**: skill (four focused vendor skills).
- **Proposed address**: per-project official vendor picks, disclosed from the guide by diagnostic need.
- **Why it could fit.** Causal runtime evidence across UI accessibility, sessions, loading and repeated interaction. Memory and cookie diagnosis fill gaps in generic visual QA.
- **Why it might not.** Tool-specific prerequisites; some instructions expose cookie values or mutate state. A missing heap/Lighthouse capability in the chosen driver does not justify a mid-run switch.
- **Copy / adapt / idea-only**: leave specialized mechanics with the vendor; guide applies the already-decided Security Boundaries, preserves test profiles, and excludes credential access from ordinary diagnostic output.
- **Overlap**: Q1–Q3/Q5 and Addy performance/browser references; `diagnosing-bugs` owns the diagnosis loop. Unity profiling remains its own domain.
- **Idle context cost**: a11y ~87, cookies ~140, LCP ~174, memory ~90 tokens; ~491 together where picked.
- **Recommendation (proposed)**: pick individually where needed, never copy the four as pack skills or let them override browser-check policy.

### C3. `troubleshooting`

- **What it is.** [Vendor support skill][c-trouble] diagnoses MCP configuration, auto-connect, launch flags, missing tools and client read-only restrictions, then suggests configuration/launch changes.
- **Kind**: skill.
- **Proposed address**: vendor support knowledge after Chrome has been selected.
- **Why it could fit.** Removes guesswork when a team actually uses this integration.
- **Why it might not.** Not general web knowledge; suggestions to alter integration setup cannot take over a host-native browser preflight or bypass host restrictions.
- **Copy / adapt / idea-only**: leave upstream; no pack adaptation.
- **Overlap**: C1 and host-specific troubleshooting; core diagnosis owns the general method.
- **Idle context cost**: ~81 tokens where selected.
- **Recommendation (proposed)**: vendor-only support, leave unpicked unless that integration needs it.

### G1. `modern-web-guidance`

- **What it is.** [Official platform skill][g-skill] searches/retrieves a catalog of 192 guides, including native primitives, accessibility, performance and security. The [image-priority guide][g-image] is an example of platform-level knowledge distinct from framework recipes.
- **Kind**: skill.
- **Proposed address**: conditional official vendor pick; guide points to selected platform knowledge without duplicating the catalog.
- **Why it could fit.** Framework-neutral answers to whether the platform already supplies a primitive and how to handle support/fallbacks.
- **Why it might not.** Mandatory-first description, required response boilerplate, unpinned `npx ...@latest`, telemetry, broad preferred-standard claims and `as any` suggestions conflict with collection/project policy. A skill-version flag is not a package-code pin.
- **Copy / adapt / idea-only**: no catalog copy. At setup, disclose these behaviors and choose a reviewed version/source if admitted; selected vendor text does not outrank project standards or the one-guide architecture.
- **Overlap**: existing UI/motion/mobile references, Q1–Q5 and official framework skills. Its [security guide][g-security] is not a full-app threat model.
- **Idle context cost**: ~396 tokens where selected, excluding CLI output.
- **Recommendation (proposed)**: conditional vendor pick with explicit admission caveats; do not make it mandatory for all web edits.

### G2. `chrome-extensions`

- **What it is.** [Official Chrome extension skill][g-ext]: Manifest V3, worker lifetime, messaging, permissions/user gestures, CSP, side panels and store preparation; maintains a project-root `CHROMEWEBSTORE.md`.
- **Kind**: skill.
- **Proposed address**: official vendor pick in extension projects only.
- **Why it could fit.** Extension-specific security/lifecycle behavior and team release preparation need knowledge beyond ordinary web pages.
- **Why it might not.** Not a whole-app baseline; imposes a project document and shares G1's executable CLI/telemetry dependency.
- **Copy / adapt / idea-only**: select upstream if the project builds extensions; disclose its file writes and execution path, no copied reference in the pack.
- **Overlap**: project release/security workflows; no need for a parallel extension persona or baseline skill.
- **Idle context cost**: ~335 tokens where selected.
- **Recommendation (proposed)**: extension-project vendor pick only.

## Addy web quality (Q1–Q6)

### Q1. `core-web-vitals`

- **What it is.** [CWV skill][q-cwv] separates field p75 from diagnostic lab measurements and uses LCP ≤2.5s, INP ≤200ms and CLS ≤0.1. Supporting references require phase/cause attribution rather than an undirected list of optimizations.
- **Kind**: skill (knowledge).
- **Proposed address**: web pack disclosed performance reference, reached through model-invoked `web-guide`.
- **Why it could fit.** Gives the team common metric definitions and prevents lab evidence being reported as a field result.
- **Why it might not.** Framework quick fixes belong in selected vendor knowledge; conditional prerendering advice becomes unconditional in a checklist. A metric boundary alone is not a project SLO.
- **Copy / adapt / idea-only**: adapt under MIT with notice; preserve metric/source/conditions, remove framework recipes and universal prerender instructions, reconcile thresholds with Q6.
- **Overlap**: existing performance reference, Addy agent-skills entry 35, C2's LCP diagnostic; not another performance workflow.
- **Idle context cost**: published ~97 tokens; proposed reference 0 additional.
- **Recommendation (proposed)**: merge into the guide's performance reference.

### Q2. `performance` and measurement/RUM references

- **What it is.** [Skill][q-perf] plus [MEASUREMENT.md][q-measure] and [RUM.md][q-rum]: field/lab/source evidence, URL versus origin CrUX, unavailable evidence, device/cache/auth/tool conditions, at least three equivalent navigations for headline comparisons with median/range, and privacy-aware production aggregation using route templates and release identifiers.
- **Kind**: skill (knowledge).
- **Proposed address**: same disclosed performance reference; project-selected observability tooling supplies implementation.
- **Why it could fit.** Repeatable evidence and privacy-aware route/release segmentation matter in team web work; useful beyond frontend render micro-optimizations.
- **Why it might not.** Repeated measurement can be costly; three navigations are a lab comparison minimum, not statistical proof or field p75. RUM must match the project's consent/data policy.
- **Copy / adapt / idea-only**: adapt measurement/evidence taxonomy with MIT notice; merge with the already-decided experiment/keep-or-revert method rather than invent another loop. Do not add RUM dependencies on a routine check.
- **Overlap**: Q1, prior frontend performance synthesis, Addy performance and observability entries; C2 is tool mechanics, not policy.
- **Idle context cost**: published ~89 tokens; reference 0 additional.
- **Recommendation (proposed)**: merge measurement and RUM guidance into the existing performance reference.

### Q3. `accessibility`

- **What it is.** [Skill][q-a11y] and disclosed WCAG/pattern references cover WCAG 2.2 focus obscuration, dragging alternatives, redundant entry and accessible authentication, plus keyboard, screen-reader, zoom, high-contrast and reduced-motion checks. It explicitly distinguishes Lighthouse 100 from WCAG conformance.
- **Kind**: skill (knowledge).
- **Proposed address**: expand the guide's already-proposed UI-quality/accessibility reference.
- **Why it could fit.** Adds stateful and manual verification that screenshots and automated scans miss; the same criteria can serve implementation, review and browser checks.
- **Why it might not.** Its contrast table confuses large-text point sizes with pixels; some checks require human assistive-technology testing. An accessibility-tree snapshot is not a screen-reader test.
- **Copy / adapt / idea-only**: adapt MIT material after correcting units against W3C; retain human-pending and scan-limit language. Do not copy framework-specific examples or a claim of conformance from partial evidence.
- **Overlap**: frontend UI-quality reference, C2, R4 and Google's platform accessibility guide; core test-review can consume the same criteria.
- **Idle context cost**: published ~87 tokens; reference 0 additional.
- **Recommendation (proposed)**: expand the shared accessibility reference, with standards correction and explicit human coverage.

### Q4. `seo`

- **What it is.** [SEO skill][q-seo] checks rendered metadata, redirects, robots/noindex, sitemap/canonical agreement, structured data and international/mobile concerns. It distinguishes pending search-engine validation, agentic browsability and optional `llms.txt` from ranking promises; multiple `<h1>` elements alone are not an audit failure.
- **Kind**: skill (knowledge).
- **Proposed address**: new disclosed SEO reference in `web-guide`; invoked audit work uses Q6.
- **Why it could fit.** Public app routes and marketing/documentation surfaces need crawl/index correctness, with claims restrained to observed evidence.
- **Why it might not.** Private app routes may intentionally be unindexed; authenticated or preview environments cannot prove public indexing. Search-engine behavior is external and evolves.
- **Copy / adapt / idea-only**: adapt MIT criteria; use project route visibility/canonical origin as facts. Keep live indexing/rich-result validation pending when unavailable and recheck vendor docs when applying.
- **Overlap**: prior frontend semantics/content, deploy preview configuration and Q5 headers; no replacement for content strategy or search analytics.
- **Idle context cost**: published ~83 tokens; reference 0 additional.
- **Recommendation (proposed)**: add a guide SEO reference, applied to relevant public surfaces.

### Q5. `best-practices`

- **What it is.** [Skill][q-best] and [SECURITY.md][q-security] cover HTTPS, deployed headers, CSP report-only rollout, Trusted Types, sanitization, dependencies, cookies, source maps and permissions. They reject a high Lighthouse score as proof of application security.
- **Kind**: skill (knowledge).
- **Proposed address**: disclosed browser security/compatibility reference, coordinated with the web security research.
- **Why it could fit.** Deployment headers and browser boundaries are often missed by UI-only review, and rollout guidance fits teams maintaining existing apps.
- **Why it might not.** Browser checks do not establish backend authorization, tenant isolation or threat-model coverage. Blindly applying header recipes can break integrations.
- **Copy / adapt / idea-only**: adapt MIT checklist and staged verification; join the security reference instead of creating a competing hardening workflow. Keep project-specific header/permissions decisions explicit.
- **Overlap**: Addy security-and-hardening, browser Security Boundaries, C2 cookie diagnosis and the separate web security ticket. Runtime app security differs from safety of the agent's browser access.
- **Idle context cost**: published ~91 tokens; reference 0 additional.
- **Recommendation (proposed)**: merge browser security/compatibility evidence into the guide, pending coordination with full-app security research.

### Q6. `web-quality-audit`

- **What it is.** [Combined audit][q-audit] samples representative URLs/states/journeys across performance, accessibility, SEO, best practices and agentic browsing, localizes findings to evidence and repeats verification. Reports distinguish measured failures, source hypotheses and pending field/human evidence. Its [optional HTML analyzer][q-script] inspects source text only.
- **Kind**: skill; optional script is a separate implementation mechanism.
- **Proposed address**: web pack user-invoked `web-audit` (proposed name), consuming shared guide references.
- **Why it could fit.** A team can request a broad quality pass before a release or after significant changes, with a durable evidence report and dimension-specific gaps.
- **Why it might not.** Expensive and overlaps browser-check deep mode/UI review. Sampling must not imply every changed route passed; static HTML misses client rendering and interactions. Quality diagnosis is not authorization for an automatic fix/commit loop.
- **Copy / adapt / idea-only**: adapt MIT report/evidence method; use the decided driver/security contract, reference Q1–Q5 rather than duplicate them, and omit the Bash analyzer from the initial adaptation. Carry licence/provenance if text is copied.
- **Overlap**: browser-check owns change-scoped route/journey status; `break-ui` owns worst-case input; frontend UI review owns visual/motion criteria; core `verifying` owns proof of a claim.
- **Idle context cost**: published ~100 tokens; user-invoked adaptation 0 on both harnesses with matching gates.
- **Recommendation (proposed)**: offer one user-invoked `web-audit`, report-first, with scope/category matrix distinct from browser-check. Owner may instead merge it into a quality mode; do not install six model-invoked audit skills.

## Agent-browser (A1–A2)

### A1. Driver discovery stub and trust boundaries

- **What it is.** [Stub][a-skill] loads installed-version workflows through `agent-browser skills get`; the [trust-boundary reference][a-trust] treats DOM/console/network/WebMCP metadata as untrusted, keeps secrets out of transcripts, treats auth-state files as secrets, and warns that HAR/screenshots/video can disclose data. The current stub describes a native Rust/CDP CLI without a Playwright/Puppeteer dependency.
- **Kind**: skill (vendor tooling).
- **Proposed address**: fallback vendor driver knowledge already reached by browser-check; no separate pack skill.
- **Why it could fit.** Version-served commands and compact refs support the already-decided fallback. The artifact and provenance rules strengthen evidence handling.
- **Why it might not.** The stub says prefer it over built-in browser tools, contrary to the owner's policy. Blanket requests to export real browser cookies must not replace host-approved authentication or test profiles. Ref labels/content markers are not security isolation.
- **Copy / adapt / idea-only**: leave driver mechanics with the vendor; adapt Apache-licensed artifact cautions into the existing browser reference if useful, carrying notice. Retain Addy's decided Security Boundaries and host authority. Never copy its preference for overriding the host.
- **Overlap**: P1/C1 alternative drivers; Addy browser-testing entry 18 and prior frontend D1/D3. Core authentication/secret facilities remain authoritative.
- **Idle context cost**: stub ~361 if listed; disclosed references 0. `hidden: true` does not establish supported harness gating.
- **Recommendation (proposed)**: retain only as the decided fallback; enrich the shared reference with auth-state/HAR/artifact handling, not another browser stack.

### A2. `dogfood`, issue taxonomy and report template

- **What it is.** [Exploratory QA guide][a-dogfood], [taxonomy][a-tax] and [report template][a-report] explore navigation, interactions, empty/error/boundary states and roles; findings are written immediately with severity and reproduction evidence. Static defects need one screenshot; interactive defects demand video and step screenshots. It targets 5–10 issues and rejects findings that fail a repeat reproduction.
- **Kind**: skill.
- **Proposed address**: ideas/adaptations for the already-decided browser-check deep mode and its report; no additional dogfood skill.
- **Why it could fit.** Team handoff is strong: expected/actual behavior, exact steps, environment and linked evidence reduce reviewer reproduction cost. Incremental reports survive interrupted sessions.
- **Why it might not.** Whole-app default, issue quota, mandatory videos, no-source rule and discarding intermittent findings clash with diff-scoped checks, route mapping and flake investigation. Login examples put credentials in command arguments and save auth state under the report directory; real create/delete/payment actions need the decided human boundary.
- **Copy / adapt / idea-only**: adapt Apache report/taxonomy details with notice. Keep CE's journey taxonomy as the spine, report intermittent defects with frequency/uncertainty, remove quotas and universal video requirements, and put private auth state outside shareable artifacts.
- **Overlap**: frontend D3/decided CE deep mode, `break-ui`, Q6 and core diagnosis. No new autonomous fix/commit workflow is needed.
- **Idle context cost**: ~182 if separately installed; 0 as disclosed deep-mode material.
- **Recommendation (proposed)**: merge incremental reporting, severity calibration and proportionate evidence into browser-check deep mode; reject a separate driver-bound dogfood skill.

## OpenAI Build Web Apps (O1–O3)

### O1. `frontend-testing-debugging`

- **What it is.** [Validation skill][o-test] defines entry route → user action/state → expected rendered result, then checks page identity, nonblank content, framework overlays, console health, screenshot evidence and one interaction. It classifies Browser availability and records a Playwright fallback reason.
- **Kind**: skill.
- **Proposed address**: ideas for the web guide's browser verification reference and browser-check evidence fields.
- **Why it could fit.** Concrete expected-result checks and environment/remaining-risk reporting make a small UI change reviewable by a teammate.
- **Why it might not.** Browser-plugin/Node-REPL-specific setup, standalone Playwright fallback, installation suggestion in every fallback report and rigid screenshot ordering conflict with a host-neutral guide and the decided fallback. It requires rendered validation on every frontend edit; risk/scope still matter.
- **Copy / adapt / idea-only**: use independently written flow/check/report ideas now; do not copy substantial text until notice provenance is resolved. No copying of its runtime APIs or third-stack fallback.
- **Overlap**: decided browser-check, CE route/report template, Q6 and prior frontend browser reference; core `verifying` still owns completion claims.
- **Idle context cost**: published ~147 tokens; merged reference 0 additional. Its Codex metadata does not set an implicit-invocation gate.
- **Recommendation (proposed)**: merge the named-flow and concrete page-state evidence ideas; no pack copy or install.

### O2. `frontend-app-builder`

- **What it is.** [Builder skill][o-builder] requires image-generated design concepts by default, section/state design before code, extracted design tokens, reference comparison and fidelity verification; defaults new complex apps to React/Vite. Browser validation supports the accepted design.
- **Kind**: skill.
- **Proposed address**: no collection skill; optional ideas for existing prototype/visual-direction references.
- **Why it could fit.** Accepted design, explicit mismatch ledger and comparison at readable viewport sizes are useful review evidence.
- **Why it might not.** Image generation for almost every new UI, prescribed aesthetic/stack and a subjective 10/10 completion bar are not framework-neutral verification criteria. Existing design systems and product requirements should set the target.
- **Copy / adapt / idea-only**: take only independently expressed reference-versus-rendered comparison ideas; no workflow copy. Licence-notice limitation is as in O1.
- **Overlap**: core prototype, prior frontend visual direction/UI review, imagegen already supplied by the host; browser-check verifies functionality without owning visual concept creation.
- **Idle context cost**: published ~140 tokens; no proposed addition.
- **Recommendation (proposed)**: reject as a pack workflow; retain accepted-design/mismatch-evidence ideas where useful.

### O3. React, shadcn, Stripe and Supabase copies / whole plugin

- **What it is.** Four bundled vendor knowledge trees listed in [README][o-readme] and [manifest][o-manifest]. Their frontmatters credit Vercel, shadcn, Stripe and Supabase; for example [React][o-react] says 64 rules and [shadcn][o-shadcn] embeds a latest-CLI context command. The plugin combines them with O1/O2.
- **Kind**: manifest-packaging (four skills plus bundle).
- **Proposed address**: original vendor picks selected by project setup, not this collection bundle.
- **Why it could fit.** Convenient coverage for projects actually using that stack.
- **Why it might not.** Duplicates vendor knowledge, broadens context/commands unnecessarily, and can lag originals. The prior frontend V1 read 70 React rules in the vendor source; these are not automatically interchangeable copies. No full comparison of the four trees was done.
- **Copy / adapt / idea-only**: no copies; choose package-shipped/original vendor knowledge, avoiding competing providers for the same need. Show any dynamic commands, hooks and telemetry at setup.
- **Overlap**: frontend V1 and discovery vendor layer; Stripe/Supabase knowledge does not become a framework-neutral pack baseline.
- **Idle context cost**: four copies ~563 tokens; six-skill bundle ~850 before external tool costs.
- **Recommendation (proposed)**: reject whole-plugin selection as the collection's baseline and reject vendoring its four copies; pick originals per project.

## Community Playwright references (R1–R4, L1)

Currents publishes one [984-character-description skill][r-skill] routing to 58 references, not 58 separately listed skills. The four entries below evaluate selected content groups. Their source idle cost is **one ~383-token description**, not four times that amount. MIT copying is allowed with Currents' notice; the proposal is selective adaptation into the guide's testing reference, not installing this competing guide.

### R1. Test choice, architecture and flaky-test diagnosis

- **What it is.** [Test architecture][r-arch] chooses API/component/E2E by the cheapest confidence-bearing seam; [POM versus fixtures][r-pom] separates UI interactions, resource lifecycles and stateless helpers; [flaky tests][r-flake] classifies UI, environment, data/parallelism and suite leakage and compares repeated/single-worker runs, traces and CI conditions.
- **Kind**: convention doc (references behind one skill).
- **Proposed address**: web pack disclosed testing reference answering `tdd`, `test-review` and `diagnosing-bugs`.
- **Why it could fit.** Web-specific seams and a failure classification add useful detail to core's public-behavior test method; tests should remain readable and independent.
- **Why it might not.** POM thresholds such as 5+ interactions are heuristics, not design rules. Quarantine/retries can conceal defects; repeated green runs do not establish absence of a race. Broad automatic test-healing could weaken requirements.
- **Copy / adapt / idea-only**: adapt classification/decision reasoning with MIT notice; preserve original failures, flaky-on-retry status and tracked quarantine reasons, never rewrite expected behavior solely to get green. Keep API syntax with official version-matched sources.
- **Overlap**: core `tdd` owns red/green and seam agreements; diagnosis owns root-cause work; P2 supplies trace mechanics, P1 generation asks the user when intent is unclear.
- **Idle context cost**: shares the source's ~383-token skill; proposed reference 0 additional.
- **Recommendation (proposed)**: selectively adapt test-choice and flake triage into one testing reference; no additional Playwright guide skill.

### R2. Auth state, test data and multi-user isolation

- **What it is.** [Authentication][r-auth] reuses storage state; [data factories][r-data] include seeded generation; [multi-user][r-multi] uses separate contexts/roles and concurrent collaboration scenarios. [Mock strategy][r-mock] says never mock owned API/database communication and always mock external providers.
- **Kind**: convention doc.
- **Proposed address**: testing reference, coordinated with browser security and project test-environment configuration.
- **Why it could fit.** Parallel workers, roles, stale sessions and collaboration matter for team apps; seed/namespace/cleanup discipline prevents cross-test interference.
- **Why it might not.** Example passwords and storage-state paths are not production credential practices. Absolute never-mock-own-API rules conflict with isolated component error-state tests; full-stack and component claims require different boundaries.
- **Copy / adapt / idea-only**: adapt principles with MIT notice, use [official auth guidance][p-auth] for shared-versus-per-worker account choice and secret-state files. Separate roles/tenants, deterministic data and teardown; use mocks at the selected seam and label what remains unproved. Human-only OAuth/payment/email flows stay paused in browser-check.
- **Overlap**: Addy Security Boundaries, A1 artifact rules, `break-ui` worst-case fixtures, future server/security references. No duplication of framework auth vendor recipes.
- **Idle context cost**: source cost shared; reference 0 additional.
- **Recommendation (proposed)**: adapt isolation/data/auth patterns with explicit secret handling and seam-specific mocking, not its absolutes.

### R3. CI, sharding, reporting and retained artifacts

- **What it is.** [CI guide][r-ci] and [reporting][r-report] cover project scripts, sharding/blob merges, CI environment and retained traces/screenshots/video. Reports can serve both machines and human reviewers.
- **Kind**: convention doc.
- **Proposed address**: disclosed testing/verification reference; commands and retention facts live in project configuration.
- **Why it could fit.** Parallel test runs and usable CI artifacts reduce team feedback time; explains how a failed run becomes inspectable evidence.
- **Why it might not.** Shell, container and CI-provider examples are not portable defaults; dependency/container versions drift. Artifacts can contain authentication/PII, and a run that passes on retry is still flaky evidence.
- **Copy / adapt / idea-only**: adapt artifact and merge concepts under MIT; use installed package/version-matched official CI instructions for implementation. Specify project retention/access/redaction and distinguish unavailable artifacts from passed checks. Never run installs from the ledger.
- **Overlap**: P2 trace, core verifying and project's existing CI; separate backend/deploy research owns deployment pipelines.
- **Idle context cost**: source cost shared; reference 0 additional.
- **Recommendation (proposed)**: adapt team evidence/CI principles; retain project-specific runner and scripts.

### R4. Accessibility, visual regression and older component recipes

- **What it is.** Selected [accessibility][r-a11y] sections use axe plus keyboard/focus checks; [visual regression][r-visual] uses screenshot assertions, controlled environments and baselines. [Component testing][r-ct] imports the older `@playwright/experimental-ct-react` runtime.
- **Kind**: convention doc.
- **Proposed address**: testing reference pointers to official tool knowledge; shared UI-quality criteria live in the existing guide reference.
- **Why it could fit.** Functional assertions miss visual drift; automated accessibility checks cover states that a static source scan cannot.
- **Why it might not.** Experimental CT conflicts with current official source; a sample visual Docker tag is `v1.48.0-noble`. Unreviewed snapshot refreshes and broad axe exclusions can erase real failures. Automated checks cannot establish complete WCAG conformance ([official limitations][p-a11y]).
- **Copy / adapt / idea-only**: adapt only controlled-baseline/state/keyboard reasoning with MIT notice; replace tool recipes with version-matched official guidance, review baseline changes as intended product changes, and keep exclusions narrow and explained.
- **Overlap**: P3, Q3, browser-check screenshots, UI-quality/motion references and `break-ui` fixtures; no second UI audit checklist.
- **Idle context cost**: source cost shared; reference 0 additional.
- **Recommendation (proposed)**: retain visual/a11y test-selection ideas, reject stale CT setup and copied version pins.

### L1. Lackeyjb `playwright-skill`, executor and helpers

- **What it is.** [Skill][l-skill] detects dev servers, writes temporary reusable scripts, launches visible browsers by default and reports artifacts. [Executor][l-run] runs scripts with skill-local dependencies and can preserve them; [helpers][l-helpers] probe common localhost ports with HEAD, create browser contexts and dismiss cookie banners.
- **Kind**: skill / script.
- **Proposed address**: no additional pack skill or executor; a few ideas for project-aware preflight.
- **Why it could fit.** Temporary scripts, cleanup and server discovery are concrete operational guidance. The source uses `os.tmpdir()` rather than assuming `/tmp`, and current locator guidance avoids sleeps/networkidle.
- **Why it might not.** Skill-local npm setup duplicates project tooling, Bash exports do not work directly in PowerShell, common-port detection can select the wrong app, and broad Accept/OK cookie-button helpers can consent to the wrong action. Its arbitrary scripting/CDP attach route conflicts with the decided interactive driver contract.
- **Copy / adapt / idea-only**: MIT copying is permitted, but prefer official project-version tools over this wrapper. Independently carry the ideas of OS-native temp paths, server identity checks and explicit artifact locations into browser preflight; do not copy the executor or cookie dismissal helper.
- **Overlap**: P1 and decided browser-check preflight, O1's repo-script discovery, core verification and browser Security Boundaries.
- **Idle context cost**: ~142 tokens as published; no proposed addition.
- **Recommendation (proposed)**: reject as an install/adaptation; keep temp-path and server-identity ideas only.

## Source conflicts and proposed resolutions

| Conflict | Evidence | Proposed resolution |
|---|---|---|
| Who drives an interactive check | CE browser test says host-native then agent-browser, preflight-only fallback; CE dogfood says agent-browser exclusively ([browser test][ce-test], [dogfood][ce-dogfood]). Agent-browser stub prefers itself over host tools; OpenAI uses Browser then standalone Playwright | Fixed owner's browser-check policy wins. No new third stack; vendor tools remain available for separately scoped tasks |
| Test runner versus interactive driver | Playwright CLI README argues CLI is cheaper than MCP; OpenAI's Browser fallback is Playwright; the pack already chose a different interactive fallback | Treat cost claims as vendor positioning, not a mandate. Propose Playwright Test for new durable E2E, preserve the decided interactive driver policy |
| Auth/telemetry versus test isolation | Chrome default isolation/redaction false and usage/CrUX transmissions; cookie diagnostics inspect live session values. Agent-browser dogfood puts credentials in shell commands and auth-state near shareable reports | Setup discloses defaults; selected test profile, secret-safe auth and artifact redaction follow Addy's already-decided boundaries. Do not copy credential-reading examples or infer an exception from tool availability |
| Platform guidance versus project authority | Google's mandatory-first trigger, response boilerplate and unpinned `@latest`; README privacy/offline wording alongside telemetry disclosure | Conditional vendor pick, explicit execution/telemetry disclosure, no always-on mandatory-first collection rule; installed package/version and project standards remain authoritative |
| Component API drift | Currents' experimental CT imports versus Playwright main's removed packages and built-in gallery `mount`; P3's no-extra-packages introduction versus standalone Vite dependency branch | Installed-version check; official matching docs/skills for API details, no copied stale scaffold or unconditional setup claim |
| Official CLI copies also drift | CLI repo skill says `--raw` strips snapshot sections; package skill says it keeps snapshots or snapshot links ([CLI copy][pc-skill], [package copy][p-cli]) | Matching descriptions do not establish matching bodies; prefer knowledge shipped with the installed package and validate supported commands |
| Blanket mocking rules | Currents says never mock owned frontend/backend traffic ([mocking][r-mock]); component error/loading states require isolation, while integration E2E must prove real contracts | State the seam and claim: controlled mocks for isolated states, real owned integration coverage where the claim crosses that boundary. Mocked tests do not prove production authorization/payment delivery |
| Bug quota and repeatability | Agent-browser dogfood targets 5–10 issues and excludes unreproducible issues; browser-check promises every route's status; core diagnosis must retain intermittent failures | Scope/coverage, not defect count, ends the check. Record intermittent evidence and uncertainty; do not manufacture issues or silently discard failures |
| Evidence volume and report destination | Agent-browser requires video for interactive defects and defaults to repo-local output; CE separates transient temp artifacts and committed reports; OpenAI defaults artifacts/reports outside repo | Use project artifact/retention facts. Capture enough evidence for the claim; make video conditional on timing/interaction value, keep auth state separate, commit reports only when intended |
| Failure converted to skip | CE route/report interaction offers Skip after a detected failure ([reference][ce-report]); its summary also has Fail | Preserve the observed Fail; distinguish a deferred fix from an unexecuted human-only Skip. Do not erase a known failure to complete the matrix |
| Target sizes and contrast units | Chrome a11y recommends 48×48; Q3/platform guide uses 24×24; Q4 also says 48. Q3's table calls large text 18px/14px | Distinguish usability targets from [WCAG target minimum 24 CSS px with exceptions][wcag-target]. Correct large-text units to [18pt / 14pt bold, with CSS-pixel conversion][wcag-contrast], not 18px / 14px |
| Quality thresholds and blanket optimization | Q6 uses strict CWV `<` while Q1 uses `≤`; Q1's measured/conditional prerendering becomes a universal checklist | Use consistent inclusive good boundaries, identify actual measurement conditions, and keep speculative navigation conditional on measured benefit and side effects |
| Green scores and security/conformance | Q3 says Lighthouse 100 is not WCAG conformance; Q5 says high Lighthouse is not application security; automated axe has known limits | Retain measured/observed/hypothesis/pending distinctions. Browser security, agent browser-access safety, app authorization and full accessibility verification remain different claims |

## Coverage gaps and follow-through

- **Full-app testing:** these sources give browser tactics and broad test-choice guidance, not a tested policy for server transactions, API contracts, authorization/tenant isolation, data migrations, queues/jobs, webhooks, deploy/rollback and production incident evidence. Coordinate with server/tooling and security research; do not present this ledger as whole-app coverage.
- **Runner comparison:** no benchmark or project trial of Playwright versus Cypress/WebdriverIO/Selenium, no Windows execution test and no end-to-end check of the new gallery API. The proposed default has first-party capability evidence, not a measured superiority claim. Package-shipped knowledge discovery is separate research; this ledger does not settle that architecture.
- **Browser coverage:** Chrome diagnostics and a single host-native session do not prove Firefox/WebKit, real mobile, Safari device quirks, assistive technology or visual parity across OS/font/rendering environments. Set the required matrix from project support facts; label untested combinations, and reserve human-only checks explicitly.
- **Evidence unavailable here:** field/RUM/CrUX data, authenticated production states, search-indexing outcomes, WCAG conformance and all measured quality scores remain unverified. Source hypotheses and static analyzer output must not fill those fields as passes.
- **Vendor execution/admission:** hooks were absent in the inspected Chrome/Google/Addy trees, not proven absent across all dependencies or future versions. Runtime telemetry/security of all binaries, dynamic skill commands and copied vendor trees was not audited. Before selecting vendor tools, show the measured catalog cost plus MCP/hook output and execution/privacy behavior, and confirm package provenance/version support.
- **Design work still for the owner:** whether Q6 is a separate user-invoked `web-audit` or a quality mode; exact division of UI-review/browser-check/audit reports; SEO and browser security reference placement. All adaptations need provenance/notices and correction of the conflicts above. No new always-on rule, automatic audit, or autonomous fix/commit chain is proposed.

## Pinned references

<!-- Playwright and its CLI -->
[p-root]: https://github.com/microsoft/playwright/tree/8c1b148f3d73120aa90f10119920358062fda177
[p-license]: https://github.com/microsoft/playwright/blob/8c1b148f3d73120aa90f10119920358062fda177/LICENSE
[p-notice]: https://github.com/microsoft/playwright/blob/8c1b148f3d73120aa90f10119920358062fda177/NOTICE
[p-cli]: https://github.com/microsoft/playwright/blob/8c1b148f3d73120aa90f10119920358062fda177/packages/playwright-core/src/tools/skills/playwright-cli/SKILL.md
[p-trace]: https://github.com/microsoft/playwright/blob/8c1b148f3d73120aa90f10119920358062fda177/packages/playwright-core/src/tools/skills/playwright-trace/SKILL.md
[p-ct]: https://github.com/microsoft/playwright/blob/8c1b148f3d73120aa90f10119920358062fda177/packages/playwright-core/src/tools/skills/playwright-component-testing/SKILL.md
[p-ct-doc]: https://github.com/microsoft/playwright/blob/8c1b148f3d73120aa90f10119920358062fda177/docs/src/test-components-js.md
[p-best]: https://github.com/microsoft/playwright/blob/8c1b148f3d73120aa90f10119920358062fda177/docs/src/best-practices-js.md
[p-browsers]: https://github.com/microsoft/playwright/blob/8c1b148f3d73120aa90f10119920358062fda177/docs/src/browsers.md
[p-auth]: https://github.com/microsoft/playwright/blob/8c1b148f3d73120aa90f10119920358062fda177/docs/src/auth.md
[p-a11y]: https://github.com/microsoft/playwright/blob/8c1b148f3d73120aa90f10119920358062fda177/docs/src/accessibility-testing-js.md
[pc-root]: https://github.com/microsoft/playwright-cli/tree/b1a5903c5b633b8c9f843ad7b629c2a78437040c
[pc-license]: https://github.com/microsoft/playwright-cli/blob/b1a5903c5b633b8c9f843ad7b629c2a78437040c/LICENSE
[pc-skill]: https://github.com/microsoft/playwright-cli/blob/b1a5903c5b633b8c9f843ad7b629c2a78437040c/skills/playwright-cli/SKILL.md
[pc-readme]: https://github.com/microsoft/playwright-cli/blob/b1a5903c5b633b8c9f843ad7b629c2a78437040c/README.md

<!-- Chrome DevTools -->
[c-root]: https://github.com/ChromeDevTools/chrome-devtools-mcp/tree/ada7963246c0c91eae185125a57aecd13cbe0376
[c-license]: https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/ada7963246c0c91eae185125a57aecd13cbe0376/LICENSE
[c-readme]: https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/ada7963246c0c91eae185125a57aecd13cbe0376/README.md
[c-config]: https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/ada7963246c0c91eae185125a57aecd13cbe0376/docs/configuration.md
[c-mcp]: https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/ada7963246c0c91eae185125a57aecd13cbe0376/skills/chrome-devtools/SKILL.md
[c-cli]: https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/ada7963246c0c91eae185125a57aecd13cbe0376/skills/chrome-devtools-cli/SKILL.md
[c-a11y]: https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/ada7963246c0c91eae185125a57aecd13cbe0376/skills/a11y-debugging/SKILL.md
[c-cookie]: https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/ada7963246c0c91eae185125a57aecd13cbe0376/skills/cookie-debugging/SKILL.md
[c-lcp]: https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/ada7963246c0c91eae185125a57aecd13cbe0376/skills/debug-optimize-lcp/SKILL.md
[c-memory]: https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/ada7963246c0c91eae185125a57aecd13cbe0376/skills/memory-leak-debugging/SKILL.md
[c-trouble]: https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/ada7963246c0c91eae185125a57aecd13cbe0376/skills/troubleshooting/SKILL.md

<!-- Google platform guidance -->
[g-root]: https://github.com/GoogleChrome/modern-web-guidance/tree/65e7edd67e77420eaf02c5df00fdc0521417d809
[g-license]: https://github.com/GoogleChrome/modern-web-guidance/blob/65e7edd67e77420eaf02c5df00fdc0521417d809/LICENSE
[g-readme]: https://github.com/GoogleChrome/modern-web-guidance/blob/65e7edd67e77420eaf02c5df00fdc0521417d809/README.md
[g-skill]: https://github.com/GoogleChrome/modern-web-guidance/blob/65e7edd67e77420eaf02c5df00fdc0521417d809/skills/modern-web-guidance/SKILL.md
[g-ext]: https://github.com/GoogleChrome/modern-web-guidance/blob/65e7edd67e77420eaf02c5df00fdc0521417d809/skills/chrome-extensions/SKILL.md
[g-image]: https://github.com/GoogleChrome/modern-web-guidance/blob/65e7edd67e77420eaf02c5df00fdc0521417d809/skills/modern-web-guidance/guides/performance/optimize-image-priority.md
[g-security]: https://github.com/GoogleChrome/modern-web-guidance/blob/65e7edd67e77420eaf02c5df00fdc0521417d809/skills/modern-web-guidance/guides/security/security.md
[g-telemetry]: https://github.com/GoogleChrome/modern-web-guidance-src/blob/d048db93bb286e9ea54b0fc52026a6867f55d7ca/src/cli/telemetry/clearcut-logger.ts

<!-- Addy quality -->
[q-root]: https://github.com/addyosmani/web-quality-skills/tree/afa8da942115f2961fdbfa80807ea0b232ff6c00
[q-license]: https://github.com/addyosmani/web-quality-skills/blob/afa8da942115f2961fdbfa80807ea0b232ff6c00/LICENSE
[q-cwv]: https://github.com/addyosmani/web-quality-skills/blob/afa8da942115f2961fdbfa80807ea0b232ff6c00/skills/core-web-vitals/SKILL.md
[q-perf]: https://github.com/addyosmani/web-quality-skills/blob/afa8da942115f2961fdbfa80807ea0b232ff6c00/skills/performance/SKILL.md
[q-measure]: https://github.com/addyosmani/web-quality-skills/blob/afa8da942115f2961fdbfa80807ea0b232ff6c00/skills/performance/references/MEASUREMENT.md
[q-rum]: https://github.com/addyosmani/web-quality-skills/blob/afa8da942115f2961fdbfa80807ea0b232ff6c00/skills/performance/references/RUM.md
[q-a11y]: https://github.com/addyosmani/web-quality-skills/blob/afa8da942115f2961fdbfa80807ea0b232ff6c00/skills/accessibility/SKILL.md
[q-seo]: https://github.com/addyosmani/web-quality-skills/blob/afa8da942115f2961fdbfa80807ea0b232ff6c00/skills/seo/SKILL.md
[q-best]: https://github.com/addyosmani/web-quality-skills/blob/afa8da942115f2961fdbfa80807ea0b232ff6c00/skills/best-practices/SKILL.md
[q-security]: https://github.com/addyosmani/web-quality-skills/blob/afa8da942115f2961fdbfa80807ea0b232ff6c00/skills/best-practices/references/SECURITY.md
[q-audit]: https://github.com/addyosmani/web-quality-skills/blob/afa8da942115f2961fdbfa80807ea0b232ff6c00/skills/web-quality-audit/SKILL.md
[q-script]: https://github.com/addyosmani/web-quality-skills/blob/afa8da942115f2961fdbfa80807ea0b232ff6c00/skills/web-quality-audit/scripts/analyze.sh

<!-- Agent browser -->
[a-root]: https://github.com/vercel-labs/agent-browser/tree/372ac5ce20fab885dbf45ee0c9d510ec8c3b6fdb
[a-license]: https://github.com/vercel-labs/agent-browser/blob/372ac5ce20fab885dbf45ee0c9d510ec8c3b6fdb/LICENSE
[a-skill]: https://github.com/vercel-labs/agent-browser/blob/372ac5ce20fab885dbf45ee0c9d510ec8c3b6fdb/skills/agent-browser/SKILL.md
[a-trust]: https://github.com/vercel-labs/agent-browser/blob/372ac5ce20fab885dbf45ee0c9d510ec8c3b6fdb/skill-data/core/references/trust-boundaries.md
[a-dogfood]: https://github.com/vercel-labs/agent-browser/blob/372ac5ce20fab885dbf45ee0c9d510ec8c3b6fdb/skill-data/dogfood/SKILL.md
[a-tax]: https://github.com/vercel-labs/agent-browser/blob/372ac5ce20fab885dbf45ee0c9d510ec8c3b6fdb/skill-data/dogfood/references/issue-taxonomy.md
[a-report]: https://github.com/vercel-labs/agent-browser/blob/372ac5ce20fab885dbf45ee0c9d510ec8c3b6fdb/skill-data/dogfood/templates/dogfood-report-template.md

<!-- OpenAI -->
[o-root]: https://github.com/openai/plugins/tree/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/build-web-apps
[o-manifest]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/build-web-apps/.codex-plugin/plugin.json
[o-readme]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/build-web-apps/README.md
[o-test]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/build-web-apps/skills/frontend-testing-debugging/SKILL.md
[o-builder]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/build-web-apps/skills/frontend-app-builder/SKILL.md
[o-react]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/build-web-apps/skills/react-best-practices/SKILL.md
[o-shadcn]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/build-web-apps/skills/shadcn-best-practices/SKILL.md

<!-- Currents -->
[r-root]: https://github.com/currents-dev/playwright-best-practices-skill/tree/283d5cbc5d11aac1abda058b16ad22c317d54dc0
[r-license]: https://github.com/currents-dev/playwright-best-practices-skill/blob/283d5cbc5d11aac1abda058b16ad22c317d54dc0/LICENSE.md
[r-skill]: https://github.com/currents-dev/playwright-best-practices-skill/blob/283d5cbc5d11aac1abda058b16ad22c317d54dc0/playwright-best-practices/SKILL.md
[r-arch]: https://github.com/currents-dev/playwright-best-practices-skill/blob/283d5cbc5d11aac1abda058b16ad22c317d54dc0/playwright-best-practices/architecture/test-architecture.md
[r-pom]: https://github.com/currents-dev/playwright-best-practices-skill/blob/283d5cbc5d11aac1abda058b16ad22c317d54dc0/playwright-best-practices/architecture/pom-vs-fixtures.md
[r-flake]: https://github.com/currents-dev/playwright-best-practices-skill/blob/283d5cbc5d11aac1abda058b16ad22c317d54dc0/playwright-best-practices/debugging/flaky-tests.md
[r-auth]: https://github.com/currents-dev/playwright-best-practices-skill/blob/283d5cbc5d11aac1abda058b16ad22c317d54dc0/playwright-best-practices/advanced/authentication.md
[r-data]: https://github.com/currents-dev/playwright-best-practices-skill/blob/283d5cbc5d11aac1abda058b16ad22c317d54dc0/playwright-best-practices/core/test-data.md
[r-multi]: https://github.com/currents-dev/playwright-best-practices-skill/blob/283d5cbc5d11aac1abda058b16ad22c317d54dc0/playwright-best-practices/advanced/multi-user.md
[r-mock]: https://github.com/currents-dev/playwright-best-practices-skill/blob/283d5cbc5d11aac1abda058b16ad22c317d54dc0/playwright-best-practices/architecture/when-to-mock.md
[r-ci]: https://github.com/currents-dev/playwright-best-practices-skill/blob/283d5cbc5d11aac1abda058b16ad22c317d54dc0/playwright-best-practices/infrastructure-ci-cd/ci-cd.md
[r-report]: https://github.com/currents-dev/playwright-best-practices-skill/blob/283d5cbc5d11aac1abda058b16ad22c317d54dc0/playwright-best-practices/infrastructure-ci-cd/reporting.md
[r-a11y]: https://github.com/currents-dev/playwright-best-practices-skill/blob/283d5cbc5d11aac1abda058b16ad22c317d54dc0/playwright-best-practices/testing-patterns/accessibility.md
[r-visual]: https://github.com/currents-dev/playwright-best-practices-skill/blob/283d5cbc5d11aac1abda058b16ad22c317d54dc0/playwright-best-practices/testing-patterns/visual-regression.md
[r-ct]: https://github.com/currents-dev/playwright-best-practices-skill/blob/283d5cbc5d11aac1abda058b16ad22c317d54dc0/playwright-best-practices/testing-patterns/component-testing.md

<!-- Lackeyjb -->
[l-root]: https://github.com/lackeyjb/playwright-skill/tree/dd47a6a023e249eb1b36e9e943eab89d0900865d
[l-license]: https://github.com/lackeyjb/playwright-skill/blob/dd47a6a023e249eb1b36e9e943eab89d0900865d/LICENSE
[l-skill]: https://github.com/lackeyjb/playwright-skill/blob/dd47a6a023e249eb1b36e9e943eab89d0900865d/skills/playwright-skill/SKILL.md
[l-run]: https://github.com/lackeyjb/playwright-skill/blob/dd47a6a023e249eb1b36e9e943eab89d0900865d/skills/playwright-skill/run.js
[l-helpers]: https://github.com/lackeyjb/playwright-skill/blob/dd47a6a023e249eb1b36e9e943eab89d0900865d/skills/playwright-skill/lib/helpers.js

<!-- Existing decisions and overlap sources -->
[ce-root]: https://github.com/EveryInc/compound-engineering-plugin/tree/1522cc36e14b5c2c44afcdb5793370bd4ac8d418
[ce-test]: https://github.com/EveryInc/compound-engineering-plugin/blob/1522cc36e14b5c2c44afcdb5793370bd4ac8d418/skills/ce-test-browser/SKILL.md
[ce-dogfood]: https://github.com/EveryInc/compound-engineering-plugin/blob/1522cc36e14b5c2c44afcdb5793370bd4ac8d418/skills/ce-dogfood/SKILL.md
[ce-report]: https://github.com/EveryInc/compound-engineering-plugin/blob/1522cc36e14b5c2c44afcdb5793370bd4ac8d418/skills/ce-test-browser/references/route-and-report.md
[add-root]: https://github.com/addyosmani/agent-skills/tree/aeac41d4d005999432bb7312f7ff06383a91d59d
[add-security]: https://github.com/addyosmani/agent-skills/blob/aeac41d4d005999432bb7312f7ff06383a91d59d/skills/browser-testing-with-devtools/SKILL.md#L60-L108

<!-- Test-tool selection and standards cross-checks -->
[v-root]: https://github.com/vitest-dev/vitest/tree/867a5e41c30167a936a7ba27ad95b47529952c88
[v-browser]: https://github.com/vitest-dev/vitest/blob/867a5e41c30167a936a7ba27ad95b47529952c88/docs/guide/browser/index.md
[v-why]: https://github.com/vitest-dev/vitest/blob/867a5e41c30167a936a7ba27ad95b47529952c88/docs/guide/browser/why.md
[cy-root]: https://github.com/cypress-io/ai-toolkit/tree/5258ece52a0010d268946e08606c98784c98f255
[cy-readme]: https://github.com/cypress-io/ai-toolkit/blob/5258ece52a0010d268946e08606c98784c98f255/README.md
[tl-root]: https://github.com/testing-library/dom-testing-library/tree/6049cc0bc7cf2201625c476c95fa6299d0e2fa8b
[tl-readme]: https://github.com/testing-library/dom-testing-library/blob/6049cc0bc7cf2201625c476c95fa6299d0e2fa8b/README.md
[wcag-target]: https://github.com/w3c/wcag/blob/457cece22d8219be32d29c5c1313e71aa6b61eae/guidelines/sc/22/target-size-minimum.html
[wcag-contrast]: https://github.com/w3c/wcag/blob/457cece22d8219be32d29c5c1313e71aa6b61eae/understanding/20/contrast-minimum.html
