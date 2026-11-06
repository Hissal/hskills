# Decided skill collection catalog

As of **2026-10-28 (Europe/Helsinki)**. A transcription of the current blueprint for `Hissal/skill-collection`, reconciled from owner resolution comments fetched with `gh issue view --comments`, issue #1's Destination/Notes/Decisions-so-far, and repository documentation. This catalogs decisions, not installed or runtime-verified capabilities. Earlier reviews are secondary cross-checks, not authority. Updated with the closing review, [#51 resolution](https://github.com/Hissal/skill-collection/issues/51), which settles the first seven open items below. This is the inventory `/to-spec` starts from; once skills are built, the dependency portion is generated from skill metadata (ADR 0004).

**Counting rule:** one entry per decided independently installed skill identity, using its latest callable name/address. A rename is not an addition. Count experimental skills and generated automatic-guide variant in their own packs. Count guide-owned references, templates, scripts, shared procedures, hooks, steering text, project facts, tools and external setup offers separately, never as collection skills. Totals are catalog membership, not what every project installs. The onboarding variant is counted once despite its unresolved callable name. “—” in Hard requirements means no specific hard installation edge was explicitly established in the reviewed decisions; process calls and optional suggestions below are not silently converted into metadata edges. This report is not a replacement authored dependency graph.

**Common composition contract:** ordinary knowledge lookup follows the project's pack list through applicable guides; knowledge stays inside the caller's current job. Performing a job uses one core process owner without restarting active layers. User-invoked workflows remain gated. Pack skills layering on a core skill require their pack guide; standalone pack workflows are not assigned invented guide dependencies. Internal hard requirements resolve at the selected repository commit, with stable publisher-qualified identity and verified cross-scope reachability; current installers are not claimed to implement this. A skill that cannot load a hard requirement stops before doing any work and names the missing skill ([#51 resolution](https://github.com/Hissal/skill-collection/issues/51), ADR 0004). A pack answers an extension point only where it adds stack knowledge the core process would miss. [#34 resolution](https://github.com/Hissal/skill-collection/issues/34#issuecomment-6124395889); [#45 resolution](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219853780); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993); [#74 resolution](https://github.com/Hissal/skill-collection/issues/74#issuecomment-6442601759); [ADR 0003](adr/0003-core-reaches-packs-through-the-pack-list.md), [ADR 0004](adr/0004-skill-dependencies-use-agent-skills-sync-metadata.md).

## core

| Skill | Address | Source / provenance | Hard requirements | Extension points it carries / Needs it answers | Decided in |
|---|---|---|---|---|---|
| `grilling` | core model-invoked | `mattpocock/skills`, adapted | — | Resolve decisions; scope, one decision per question, assumptions and exit check | [#32 resolution](https://github.com/Hissal/skill-collection/issues/32#issuecomment-6123240761); [#35 resolution](https://github.com/Hissal/skill-collection/issues/35#issuecomment-6126545823) |
| `domain-modeling` | core model-invoked | `mattpocock/skills`, adapted | — | Project vocabulary and ADRs; code names are not automatically domain terms | [#32 resolution](https://github.com/Hissal/skill-collection/issues/32#issuecomment-6123240761); [#35 resolution](https://github.com/Hissal/skill-collection/issues/35#issuecomment-6126545823) |
| `codebase-design` | core model-invoked | `mattpocock/skills`, adapted; Addy and Aaronontheweb lines; pstack and Trail of Bits ideas | — | Seams/compatibility; caller-first, ownership, invariants; published-interface reference; disclosed threat-model reference (assets, actors, trust boundaries, attacker paths with evidence and counterevidence, assumptions and freshness per threat, optional qualitative attack trees, threat → control → test), read when a design crosses a trust boundary; extension points: this stack's seam and compatibility rules; this stack's threats, controls and checks | [#32 resolution](https://github.com/Hissal/skill-collection/issues/32#issuecomment-6123240761); [#40 resolution](https://github.com/Hissal/skill-collection/issues/40#issuecomment-6177796453); [#51 resolution](https://github.com/Hissal/skill-collection/issues/51) |
| `tdd` | core model-invoked | `mattpocock/skills`, adapted; test-value, mutation and generated-input ideas | — | All test work; stack authoring/setup/run needs; red for the right reason | [#32 resolution](https://github.com/Hissal/skill-collection/issues/32#issuecomment-6123240761); [#39 resolution](https://github.com/Hissal/skill-collection/issues/39#issuecomment-6170537610) |
| `diagnosing-bugs` | core model-invoked | `mattpocock/skills`, adapted; pstack and CE lines; superpowers and gstack ideas | — | Feedback loop/instrumentation/profiling; causal chain and divergence; calls tdd/verifying | [#32 resolution](https://github.com/Hissal/skill-collection/issues/32#issuecomment-6123240761); [#38 resolution](https://github.com/Hissal/skill-collection/issues/38#issuecomment-6168634570); [#39 resolution](https://github.com/Hissal/skill-collection/issues/39#issuecomment-6170537610) |
| `writing-for-agents` | core model-invoked | `mattpocock/skills`, adapted; CE, Sentry, Anthropic, dotnet ideas | — | Authoring standard; disclosed skill mechanics, steering and testing references | [#32 resolution](https://github.com/Hissal/skill-collection/issues/32#issuecomment-6123240761); [#42 resolution](https://github.com/Hissal/skill-collection/issues/42#issuecomment-6191540887) |
| `pr` | core model-invoked | `mattpocock/skills`, adapted; `show-me` lines from `humanlayer/skills` | — | PR writing; Why and Not done; visual evidence/test results; writing-for-agents pointer; reads evidence already gathered and runs nothing, so no verifying call ([#130 owner decision](https://github.com/Hissal/skill-collection/issues/130#issuecomment-6562773316)); no consumer-review suggestion | [#32 resolution](https://github.com/Hissal/skill-collection/issues/32#issuecomment-6123240761); [#35 resolution](https://github.com/Hissal/skill-collection/issues/35#issuecomment-6126545823); [#37 resolution](https://github.com/Hissal/skill-collection/issues/37#issuecomment-6166888190); [#42 resolution](https://github.com/Hissal/skill-collection/issues/42#issuecomment-6191540887); [#73 resolution](https://github.com/Hissal/skill-collection/issues/73#issuecomment-6443641717) |
| `commenting` | core model-invoked | tstack `leaving-pr-comments`, adapted in own words | — | Agent comment note; secrets/private-detail check; preview; direct style; URL check; resolve after reply | [#88 answers 19 and 21](https://github.com/Hissal/skill-collection/issues/88#issuecomment-6512311352) |
| `prototype` | core model-invoked | `mattpocock/skills`, adapted; CE, game-studio, playground and Emil ideas | — | Medium/placement/run/removal; UI, logic, behavior; seeded state, browser check, variants | [#32 resolution](https://github.com/Hissal/skill-collection/issues/32#issuecomment-6123240761); [#44 resolution](https://github.com/Hissal/skill-collection/issues/44#issuecomment-6195116678); [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226) |
| `code-review` | core model-invoked | `mattpocock/skills`, adapted; review-theme sources | reviewing (explicit hard installation requirement, #74) | Independent Standards/Spec/Failure; stack correctness/failure/diff limits; shared scope via reviewing; Failure axis: the three outside-diff checks are prompts for when to trace, not a limit; #74 scope governs | [#32 resolution](https://github.com/Hissal/skill-collection/issues/32#issuecomment-6123240761); [#36 resolution](https://github.com/Hissal/skill-collection/issues/36#issuecomment-6165955938); [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226); [#74 resolution](https://github.com/Hissal/skill-collection/issues/74#issuecomment-6442601759); [#51 resolution](https://github.com/Hissal/skill-collection/issues/51) |
| `research` | core model-invoked | `mattpocock/skills`, adapted; source-confidence/coverage ideas | — | External primary-source research; SHA pins; Direct/Supported/Inferred and coverage honesty | [#32 resolution](https://github.com/Hissal/skill-collection/issues/32#issuecomment-6123240761); [#37 resolution](https://github.com/Hissal/skill-collection/issues/37#issuecomment-6166888190) |
| `delegating` | core model-invoked | New synthesis; pstack, goal-loop, Addy, gstack, superpowers | — | Brief/return/evidence; shared resources/isolation; personal policy; host delegation first, then CLI rules | [#35 resolution](https://github.com/Hissal/skill-collection/issues/35#issuecomment-6126545823); [#38 resolution](https://github.com/Hissal/skill-collection/issues/38#issuecomment-6168634570); [#45 resolution](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219853780); [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226); [#55 resolution](https://github.com/Hissal/skill-collection/issues/55#issuecomment-6218080852) |
| `receiving-review` | core model-invoked | New synthesis; superpowers receiving-code-review, R7/R8, Impeccable | — | Judge findings, verify fixes; autonomous authority exceptions; security assessment through applicable guide; disclosed reference for assessing a security finding (reachability, attacker path, counterevidence, sibling bypasses, negative control), also reached by code-review | [#36 resolution](https://github.com/Hissal/skill-collection/issues/36#issuecomment-6165955938); [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226); [#54 resolution](https://github.com/Hissal/skill-collection/issues/54#issuecomment-6215840308); [#73 resolution](https://github.com/Hissal/skill-collection/issues/73#issuecomment-6443641717); [#51 resolution](https://github.com/Hissal/skill-collection/issues/51) |
| `verifying` | core model-invoked | New synthesis; superpowers, gstack, pstack, Addy, gamedev | — | Compile/work/ship-readiness and measuring performance; tree-bound evidence, number checklist, floor guard | [#37 resolution](https://github.com/Hissal/skill-collection/issues/37#issuecomment-6166888190); [#38 resolution](https://github.com/Hissal/skill-collection/issues/38#issuecomment-6168634570); [#45 resolution](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219853780); [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226); [#73 resolution](https://github.com/Hissal/skill-collection/issues/73#issuecomment-6443641717) |
| `refactoring` | core model-invoked | Adapted dotnet csharp-refactoring neutral half; pstack | — | Behavior preservation; stack rename/move hazards and validation; suggest migrating at compatibility transition | [#40 resolution](https://github.com/Hissal/skill-collection/issues/40#issuecomment-6177796453); [#45 resolution](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219853780) |
| `risky-changes` | core model-invoked | Adapted davidondrej | — | Measure against real data; API/data/pricing/default/provider parameters; project approver/eval record; narrow trigger (public API, data transforms or drops, pricing and quotas, defaults, provider and model parameters); no fixed case count, the project decides how much evidence is enough; a core guide model-invoked destination | [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226); [#51 resolution](https://github.com/Hissal/skill-collection/issues/51) |
| `reviewing` | core model-invoked | New shared support extracted from adopted review mechanics | — | Target/base/snapshot, bounded findings/hotspot survey, evidence, missing coverage, out-of-scope observations | [#74 resolution](https://github.com/Hissal/skill-collection/issues/74#issuecomment-6442601759); amended comment supersedes earlier bundled-in-code-review home |
| `wayfinder` | core user-invoked | `mattpocock/skills`, adapted | — | Unclear multi-session decisions; map and resolution record; delegating before research | [#32 resolution](https://github.com/Hissal/skill-collection/issues/32#issuecomment-6123240761); [#35 resolution](https://github.com/Hissal/skill-collection/issues/35#issuecomment-6126545823); [#73 resolution](https://github.com/Hissal/skill-collection/issues/73#issuecomment-6443641717) |
| `grill-with-docs` | core user-invoked | `mattpocock/skills` | — | Decision exploration with project domain docs; contextual to-spec continuation | [#32 resolution](https://github.com/Hissal/skill-collection/issues/32#issuecomment-6123240761); [#73 resolution](https://github.com/Hissal/skill-collection/issues/73#issuecomment-6443641717) |
| `to-spec` | core user-invoked | `mattpocock/skills`, adapted | — | Test seams; playback, chosen-over, assumptions, default fresh-context spec review | [#32 resolution](https://github.com/Hissal/skill-collection/issues/32#issuecomment-6123240761); [#35 resolution](https://github.com/Hissal/skill-collection/issues/35#issuecomment-6126545823); [#36 resolution](https://github.com/Hissal/skill-collection/issues/36#issuecomment-6165955938); [#42 resolution](https://github.com/Hissal/skill-collection/issues/42#issuecomment-6191540887); [#45 resolution](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219853780); [#73 resolution](https://github.com/Hissal/skill-collection/issues/73#issuecomment-6443641717) |
| `to-tickets` | core user-invoked | `mattpocock/skills`, adapted | — | Exclusive surfaces/live tools/humans/expand-contract; proof and pass/fail criteria; avoid duplicate issues | [#32 resolution](https://github.com/Hissal/skill-collection/issues/32#issuecomment-6123240761); [#35 resolution](https://github.com/Hissal/skill-collection/issues/35#issuecomment-6126545823); [#45 resolution](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219853780); [#73 resolution](https://github.com/Hissal/skill-collection/issues/73#issuecomment-6443641717) |
| `implement` | core user-invoked | `mattpocock/skills`, adapted | — | Check cadence; sizing, reuse, diagnosis after two failed fixes; completion through verifying; project guidance | [#32 resolution](https://github.com/Hissal/skill-collection/issues/32#issuecomment-6123240761); [#35 resolution](https://github.com/Hissal/skill-collection/issues/35#issuecomment-6126545823); [#37 resolution](https://github.com/Hissal/skill-collection/issues/37#issuecomment-6166888190); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) |
| `implement-spec` | core user-invoked | `mattpocock/skills`, adapted | — | Parallel worktrees; delegating, receiving-review and integration verifying; draft PR criterion linkage | [#32 resolution](https://github.com/Hissal/skill-collection/issues/32#issuecomment-6123240761); [#35 resolution](https://github.com/Hissal/skill-collection/issues/35#issuecomment-6126545823); [#36 resolution](https://github.com/Hissal/skill-collection/issues/36#issuecomment-6165955938); [#37 resolution](https://github.com/Hissal/skill-collection/issues/37#issuecomment-6166888190) |
| `triage` | core user-invoked | `mattpocock/skills`, adapted | — | Stack involvement, reproduction/completion environment and human participation | [#32 resolution](https://github.com/Hissal/skill-collection/issues/32#issuecomment-6123240761); [#45 resolution](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219853780); [#73 resolution](https://github.com/Hissal/skill-collection/issues/73#issuecomment-6443641717) |
| `architecture-review` | core user-invoked | `mattpocock/skills` improve-codebase-architecture, adapted; gstack duplication rubric | reviewing (explicit hard installation requirement, #74) | Hotspot exclusions/friction; report/design and owner-chosen spec/refactor/delegation continuation | [#32 resolution](https://github.com/Hissal/skill-collection/issues/32#issuecomment-6123240761); [#40 resolution](https://github.com/Hissal/skill-collection/issues/40#issuecomment-6177796453); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993); [#74 resolution](https://github.com/Hissal/skill-collection/issues/74#issuecomment-6442601759); supersedes `improve-codebase-architecture` and default implementation continuation in [#40 resolution](https://github.com/Hissal/skill-collection/issues/40#issuecomment-6177796453) |
| `second-opinion` | core user-invoked | New synthesis; Addy doubt-driven, pstack, gstack and Trail of Bits ideas | — | Fresh-context review/doubt of existing work; family diversity preferred, evidence not votes | [#36 resolution](https://github.com/Hissal/skill-collection/issues/36#issuecomment-6165955938); [#55 resolution](https://github.com/Hissal/skill-collection/issues/55#issuecomment-6218080852); [#73 resolution](https://github.com/Hissal/skill-collection/issues/73#issuecomment-6443641717) |
| `blast-radius` | core user-invoked | Adapted pstack | verifying (explicit hard installation requirement, #80) | Downstream breakage outside diff; prove key safety fact; uses verifying ladder | [#37 resolution](https://github.com/Hissal/skill-collection/issues/37#issuecomment-6166888190); [#73 resolution](https://github.com/Hissal/skill-collection/issues/73#issuecomment-6443641717) |
| `constraints` | core user-invoked | Adapted Addy constraint-driven-development | — | Stack checks/cost tiers; ratchet/floor guard; setup-owned configuration; CI guard lives in project | [#37 resolution](https://github.com/Hissal/skill-collection/issues/37#issuecomment-6166888190); [#45 resolution](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219853780); [#73 resolution](https://github.com/Hissal/skill-collection/issues/73#issuecomment-6443641717) |
| `migrating` | core user-invoked | Adapted Addy deprecation-and-migration; Aaronontheweb ideas | — | Consumer/data/API compatibility transitions; expand-contract, readers before writers, consumer communication | [#37 resolution](https://github.com/Hissal/skill-collection/issues/37#issuecomment-6166888190); [#40 resolution](https://github.com/Hissal/skill-collection/issues/40#issuecomment-6177796453); [#45 resolution](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219853780) |
| `hillclimb` | core user-invoked | New synthesis; pstack Hillclimb, CE ce-optimize, Addy | verifying (explicit hard installation requirement, #80 owner answer 1) | Measured sustained optimization; keep/revert log; stack performance; explicit unattended use permitted | [#38 resolution](https://github.com/Hissal/skill-collection/issues/38#issuecomment-6168634570); [#54 resolution](https://github.com/Hissal/skill-collection/issues/54#issuecomment-6215840308); [#73 resolution](https://github.com/Hissal/skill-collection/issues/73#issuecomment-6443641717) |
| `test-review` | core user-invoked | New synthesis; dotnet anti-patterns/gaps/dead mocks; Slopwatch, gstack, Trail of Bits ideas | reviewing (explicit hard installation requirement, #74) | Report-only tests/standards/cheats/coverage review; stack idioms and coverage needs | [#39 resolution](https://github.com/Hissal/skill-collection/issues/39#issuecomment-6170537610); [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226); [#74 resolution](https://github.com/Hissal/skill-collection/issues/74#issuecomment-6442601759) |
| `how` | core user-invoked | Adapted pstack, harness-neutral | — | Explain local codebase and installed packages; bounded read-only explorers when useful | [#35 resolution](https://github.com/Hissal/skill-collection/issues/35#issuecomment-6126545823) |
| `why` | core user-invoked | Adapted pstack, slim git/tracker form | — | Historical rationale from blame/log/pickaxe/PR/issues; confidence tiers; may also read rationale from directly linked docs or discussions, git-first, confidence tiers kept | [#37 resolution](https://github.com/Hissal/skill-collection/issues/37#issuecomment-6166888190); [#51 resolution](https://github.com/Hissal/skill-collection/issues/51) |
| `wait-what` | core user-invoked | `mattpocock/skills`, adapted with two compound-engineering `wtf` lines | — | Re-explain last response more clearly/compactly; correct errors without inflating certainty | [#32 resolution](https://github.com/Hissal/skill-collection/issues/32#issuecomment-6123240761); [#41 resolution](https://github.com/Hissal/skill-collection/issues/41#issuecomment-6181216467); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) |
| `to-questionnaire` | core user-invoked | `mattpocock/skills` | — | Obtain coherent missing facts/choices from another person; preparation grants no sending authority | [#32 resolution](https://github.com/Hissal/skill-collection/issues/32#issuecomment-6123240761); [#45 resolution](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219853780); [#73 resolution](https://github.com/Hissal/skill-collection/issues/73#issuecomment-6443641717) |
| `unslop` | core user-invoked | Adapted CE ce-noslop + owner pstack catalog + technical-writing; Vercel comparison | — | Author/edit/detect prose; tests, registers and disclosed patterns/docs guidance | [#42 resolution](https://github.com/Hissal/skill-collection/issues/42#issuecomment-6191540887); [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226) |
| `handoff` | core user-invoked | `mattpocock/skills`, adapted; claude-handoff, pstack, CE, davidondrej prompt-for-others ideas | — | Session continuation or self-contained work brief; evidence/authority tags; file/tracker/thread/subagent | [#32 resolution](https://github.com/Hissal/skill-collection/issues/32#issuecomment-6123240761); [#41 resolution](https://github.com/Hissal/skill-collection/issues/41#issuecomment-6181216467); [#42 resolution](https://github.com/Hissal/skill-collection/issues/42#issuecomment-6191540887); [#55 resolution](https://github.com/Hissal/skill-collection/issues/55#issuecomment-6218080852); [#62 resolution](https://github.com/Hissal/skill-collection/issues/62#issuecomment-6414951885); [#73 resolution](https://github.com/Hissal/skill-collection/issues/73#issuecomment-6443641717) |
| `retro` | core user-invoked | `mattpocock/skills`, adapted; pstack correct and others | — | Session/git/PR evidence, fix ladder, admission bar; stack environment gaps; approve writes | [#32 resolution](https://github.com/Hissal/skill-collection/issues/32#issuecomment-6123240761); [#41 resolution](https://github.com/Hissal/skill-collection/issues/41#issuecomment-6181216467); [#73 resolution](https://github.com/Hissal/skill-collection/issues/73#issuecomment-6443641717) |
| `context-audit` | core user-invoked | Adapted finding-unknowns; prompt-audit ideas | — | All context layers and transitive in-repo pointers; measured size, conflicts; propose diff only | [#42 resolution](https://github.com/Hissal/skill-collection/issues/42#issuecomment-6191540887); [#73 resolution](https://github.com/Hissal/skill-collection/issues/73#issuecomment-6443641717) |
| `session-report` | core user-invoked | Copied Anthropic marketplace session-report, Windows temp adapted | — | Claude-only usage measurement; no cross-harness claim | [#17 resolution](https://github.com/Hissal/skill-collection/issues/17#issuecomment-6108951556); [#45 resolution](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219853780); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) |
| `setup-project` | core user-invoked | `mattpocock/skills` setup-matt-pocock-skills, renamed and substantially adapted | — | Catalog/vendor discovery; empty/partial/existing projects; select/scaffold/configure/verify; pack SETUP material | [#32 resolution](https://github.com/Hissal/skill-collection/issues/32#issuecomment-6123240761); [#34 resolution](https://github.com/Hissal/skill-collection/issues/34#issuecomment-6124395889); [#71 resolution](https://github.com/Hissal/skill-collection/issues/71#issuecomment-6419435777); [#72 resolution](https://github.com/Hissal/skill-collection/issues/72#issuecomment-6418702495); supersedes the old name and installed-only #34 discovery |
| `guide` | core user-invoked | New; `mattpocock/skills` ask-matt PHASE-BOUNDARIES ideas | — | Main workflows plus selective supporting routes; installed pack routes; recommendations only; risky-changes added to model-invoked destinations | [#15 resolution](https://github.com/Hissal/skill-collection/issues/15#issuecomment-6107305243); [#18 resolution](https://github.com/Hissal/skill-collection/issues/18#issuecomment-6108951944); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993); [#51 resolution](https://github.com/Hissal/skill-collection/issues/51) |
| `wizard` | core user-invoked | `mattpocock/skills`, demoted to user-invoked | — | Interactive procedure for steps only a human can perform, when material help is needed | [#32 resolution](https://github.com/Hissal/skill-collection/issues/32#issuecomment-6123240761); [#45 resolution](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219853780); [#73 resolution](https://github.com/Hissal/skill-collection/issues/73#issuecomment-6443641717) |
| `freeze` | core user-invoked | New; gstack prior art | Guard engine and supported project/conversation edit adapter (mechanism prerequisite) | Explicit human directory boundary per physical project/logical conversation; supported edit tools only | [#43 resolution](https://github.com/Hissal/skill-collection/issues/43#issuecomment-6135590542); [#57 resolution](https://github.com/Hissal/skill-collection/issues/57#issuecomment-6136328315) |
| `unfreeze` | core user-invoked | New; gstack prior art | Guard engine and supported project/conversation edit adapter (mechanism prerequisite) | Explicit human removal of current conversation editing boundary | [#43 resolution](https://github.com/Hissal/skill-collection/issues/43#issuecomment-6135590542); [#57 resolution](https://github.com/Hissal/skill-collection/issues/57#issuecomment-6136328315) |
| `dependency-audit` | core user-invoked | New; Trail of Bits ideas only | — | Stack dependency ecosystem/supply-chain investigation; web npm/pnpm/Yarn answer decided; owns the stack-neutral adding-a-dependency rule (moved from web security); Unity and C# answer the ecosystem extension point | [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226); [#73 resolution](https://github.com/Hissal/skill-collection/issues/73#issuecomment-6443641717); [#51 resolution](https://github.com/Hissal/skill-collection/issues/51) |
| `break-ui` | core user-invoked | Adapted Emil; persona removed, network/permission failures added | — | Worst-case UI data/layout/failure conditions; stack extension point; Unity answers; C# gives no answer | [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226); [#73 resolution](https://github.com/Hissal/skill-collection/issues/73#issuecomment-6443641717); [#51 resolution](https://github.com/Hissal/skill-collection/issues/51) |

## unity

| Skill | Address | Source / provenance | Hard requirements | Extension points it carries / Needs it answers | Decided in |
|---|---|---|---|---|---|
| `unity-guide` | unity pack model-invoked | Adapted fork unity; fork assemblies/serialization/lifecycle content | — | Direct selective assembly, serialization, lifecycle and asset-import references; project/package detection and needs lookup; new references: dependencies (UPM manifest/lock, scoped registries/OpenUPM, git URLs, Asset Store, vendored/native plugins, NuGetForUnity) with an adding-a-dependency rule; UI worst cases (aspect/safe area/scale, long localized strings, UI Toolkit/uGUI overflow, controller/keyboard focus; points at official ui-uitk/ui-ugui/localization); risky-changes row to verification/debugging evidence plus a note on which values a run really used | [#46 resolution](https://github.com/Hissal/skill-collection/issues/46#issuecomment-6346220677); [#63 resolution](https://github.com/Hissal/skill-collection/issues/63#issuecomment-6367394607); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993); [#51 resolution](https://github.com/Hissal/skill-collection/issues/51) |
| `unity-testing` | unity pack model-invoked | Adapted fork; additional accepted waiting/seam/cleanup knowledge | unity-guide (pack layering requirement, #34 / ADR 0003) | Unity tests, seams, lifetime isolation, cadence/idioms/coverage; core tdd process | [#46 resolution](https://github.com/Hissal/skill-collection/issues/46#issuecomment-6346220677); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) |
| `unity-verification` | unity pack model-invoked | Adapted fork; risk/evidence contributions | unity-guide (pack layering requirement, #34 / ADR 0003) | Check interpretation/costs, Editor/checkout/shared resources, triage/retro environments; core verifying process; small risk-selected QA checklist (interruptions, input switching, state transitions); no device matrix, mobile deferred | [#46 resolution](https://github.com/Hissal/skill-collection/issues/46#issuecomment-6346220677); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993); [#51 resolution](https://github.com/Hissal/skill-collection/issues/51) |
| `unity-debugging` | unity pack model-invoked | Adapted fork; accepted tipoLi/pstack/divergence ideas | unity-guide (pack layering requirement, #34 / ADR 0003) | Runtime-writer/state divergence, logs/players, visual evidence; performance method reference; core diagnosis | [#46 resolution](https://github.com/Hissal/skill-collection/issues/46#issuecomment-6346220677); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) |
| `unity-prototyping` | unity pack model-invoked | Adapted fork; accepted medium/research ideas | unity-guide (pack layering requirement, #34 / ADR 0003) | Medium, isolation, launch, validation/capture/removal; core prototype process | [#46 resolution](https://github.com/Hissal/skill-collection/issues/46#issuecomment-6346220677); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) |
| `unity-networking` | unity pack model-invoked | New | — (standalone gameplay-networking entry; no explicit hard edge recorded) | Authority/replication correctness and participant evidence; complements official services/setup | [#46 resolution](https://github.com/Hissal/skill-collection/issues/46#issuecomment-6346220677); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) |

## gamedev

| Skill | Address | Source / provenance | Hard requirements | Extension points it carries / Needs it answers | Decided in |
|---|---|---|---|---|---|
| `gamedev-guide` | gamedev pack model-invoked | New | — | Engine-neutral logic/presentation, prototyping, invariants/readouts, feel, forgotten siblings; needs and routes; risky-changes row to the balance and invariants/readouts references (paired seeded runs, telemetry or play reports, human fun reports as their own evidence; never starts /playtest); one game UI design-contract step reached from game-brief, screen-audit and UI work (project UI doc pointer first, else study 2-3 screens; state decision, information, states/feedback, input/accessibility; build with project components) | [#47 resolution](https://github.com/Hissal/skill-collection/issues/47#issuecomment-6366449606); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993); [#51 resolution](https://github.com/Hissal/skill-collection/issues/51) |
| `game-brief` | gamedev pack user-invoked | Adapted Unity ledger A2 unity-game-brief + D1 Step 2.5 | — | Six numbered game questions, make-or-break property, medium/setup/one interaction, continue/change/kill | [#47 resolution](https://github.com/Hissal/skill-collection/issues/47#issuecomment-6366449606); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) |
| `playtest` | gamedev pack user-invoked | Merged gamedev A1+A2; D2 economy and W5 new-player evidence | — | Staged intent checks, 2–3 fixes, one change/re-measure, balance reference and evidence classes | [#47 resolution](https://github.com/Hissal/skill-collection/issues/47#issuecomment-6366449606); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) |
| `stress-test-concept` | gamedev pack user-invoked | Adapted gamedev A4; A5/A6 references | — | Probe causal claims for dominant policy, agency collapse, reward exploits, key decision | [#47 resolution](https://github.com/Hissal/skill-collection/issues/47#issuecomment-6366449606); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) |
| `game-jam` | gamedev pack user-invoked | Adapted gamedev W4 | — | Rules/theme/scope/time budget, shipping; export preparation extension point | [#47 resolution](https://github.com/Hissal/skill-collection/issues/47#issuecomment-6366449606); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) |
| `screen-audit` | gamedev pack user-invoked | Merged gamedev A10 + game-studio G3 + Unity A9 readability | — | HUD/information hierarchy at forced moments; frame capture or draw-code reading | [#47 resolution](https://github.com/Hissal/skill-collection/issues/47#issuecomment-6366449606); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993); [#74 resolution](https://github.com/Hissal/skill-collection/issues/74#issuecomment-6442601759) |

## csharp

| Skill | Address | Source / provenance | Hard requirements | Extension points it carries / Needs it answers | Decided in |
|---|---|---|---|---|---|
| `csharp-guide` | csharp pack model-invoked | New guide; adapted dotnet and Aaronontheweb references, ECC style ideas | — | SDK-style .NET: rename/compatibility, benchmarking/perf catalog, tests, AOT, generators, build/debugging, configured Unity-consumer reference; project-owned style; new references: dependencies (PackageReference/CPM version authority, resolved graph per TFM, packed consumer exposure, NuGet Audit coverage, source mapping, build/analyzer/native assets) with an adding-a-dependency rule; release readiness (pack and inspect the nupkg, public API baseline diff and semver, every target, SourceLink/symbols, strong-name, trimming warnings, prefer trusted publishing over a long-lived API key); check tools and cost tiers for constraints (-warnaserror, analyzers, coverage, vulnerable packages); no risky-changes or break-ui answer | [#48 resolution](https://github.com/Hissal/skill-collection/issues/48#issuecomment-6371179357); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993); [#51 resolution](https://github.com/Hissal/skill-collection/issues/51) |

## web

| Skill | Address | Source / provenance | Hard requirements | Extension points it carries / Needs it answers | Decided in |
|---|---|---|---|---|---|
| `web-guide` | web pack model-invoked | New synthesis; Vercel, Impeccable, Emil, Addy, mcollina, wshobson and accepted security ideas | — | UI/accessibility/motion/mobile/SEO; API/runtime/durable work; testing/browser/performance/observability/security/ship-readiness/incidents/TS diagnosis; selected vendors; security reference keeps browser/OWASP/OAuth/scanner/agent-in-CI checklists and answers the new stack-threats extension point; the stack-neutral threat model, security-finding assessment and adding-a-dependency rule moved to core | [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993); [#72 resolution](https://github.com/Hissal/skill-collection/issues/72#issuecomment-6418702495); [#51 resolution](https://github.com/Hissal/skill-collection/issues/51) |
| `browser-check` | web pack user-invoked | Adapted CE ce-test-browser; ce-dogfood and agent-browser dogfood ideas | — | Named-flow browser verification, deep journey mode; project server/port; host-native driver first | [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) |
| `web-audit` | web pack user-invoked | Adapted web-quality-skills | — | Page Core Web Vitals/accessibility/SEO/best-practices assessment | [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) |
| `agent-db-access` | web pack user-invoked | Adapted davidondrej create-readonly-db-role | — | Restricted roles plus negative verification; preserve RLS; deny writes/DDL/secret data, timeouts | [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) |
| `setup-ts-deep-modules` | web pack user-invoked | Copied `mattpocock/skills` as it stands | — | Set up TypeScript deep-module boundaries | [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) |

## in-progress

| Skill | Address | Source / provenance | Hard requirements | Extension points it carries / Needs it answers | Decided in |
|---|---|---|---|---|---|
| `loop-me` | in-progress pack user-invoked | `mattpocock/skills`, completion wording preserved | — | Design recurring-work specifications; owner trial question/keep-if; no execution | [#53 resolution](https://github.com/Hissal/skill-collection/issues/53#issuecomment-6214483933); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) |
| `full-stop` | in-progress pack user-invoked | New; selective pstack, goal-loop, figure-it-out, superpowers, Addy, CE, gstack procedures | — | Goal/spec -> implementation/verification/PR ready for human merge; shared delivery procedure | [#54 resolution](https://github.com/Hissal/skill-collection/issues/54#issuecomment-6215840308); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) |
| `full-send` | in-progress pack user-invoked | New; shared autonomous delivery procedure | — | As full-stop, plus merge authorization; actual project requirements still apply | [#54 resolution](https://github.com/Hissal/skill-collection/issues/54#issuecomment-6215840308); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) |
| `babysit-pr` | in-progress pack user-invoked | New; reopened PR-babysitting capability; shared procedure | — | Existing PR CI/conflicts/feedback; no independent merge authority | [#54 resolution](https://github.com/Hissal/skill-collection/issues/54#issuecomment-6215840308); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) |
| `arena` | in-progress pack user-invoked | New; pstack arena and CE ce-bakeoff ideas | — | Two independent implementations, separate evaluator, verify selected/optionally combined result | [#54 resolution](https://github.com/Hissal/skill-collection/issues/54#issuecomment-6215840308); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) |
| `consumer-review` | in-progress pack user-invoked | Adapted workflow-chains C1 | — | Fresh-consumer installation/quickstart per target; future-core trial with stack extension points | [#48 resolution](https://github.com/Hissal/skill-collection/issues/48#issuecomment-6371179357); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993); [#73 resolution](https://github.com/Hissal/skill-collection/issues/73#issuecomment-6443641717); [#74 resolution](https://github.com/Hissal/skill-collection/issues/74#issuecomment-6442601759) |
| `performance-review` | in-progress pack user-invoked | Adapted dotnet performance catalog / #48 new pass | reviewing (explicit hard installation requirement, #74) | Report-only performance hypotheses/confirming measurements; stack anti-patterns/exclusions; future-core trial | [#48 resolution](https://github.com/Hissal/skill-collection/issues/48#issuecomment-6371179357); [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993); [#74 resolution](https://github.com/Hissal/skill-collection/issues/74#issuecomment-6442601759); final name for unnamed #48 pass |
| `incident-review` | in-progress pack user-invoked | Adapted wshobson incident lifecycle | — | Named incident impact/timeline/contributing conditions/follow-ups | [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993); [#73 resolution](https://github.com/Hissal/skill-collection/issues/73#issuecomment-6443641717); [#74 resolution](https://github.com/Hissal/skill-collection/issues/74#issuecomment-6442601759) |
| `game-legibility` | in-progress pack user-invoked | Adapted gamedev A9 gating-intent-legibility | Frame-capturing project play route (evidence prerequisite) | Gameplay-intent inference from captured play; owner-directed trial | [#47 resolution](https://github.com/Hissal/skill-collection/issues/47#issuecomment-6366449606); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993); [#74 resolution](https://github.com/Hissal/skill-collection/issues/74#issuecomment-6442601759); supersedes `legibility` in [#47 resolution](https://github.com/Hissal/skill-collection/issues/47#issuecomment-6366449606) |
| `placeholder-assets` | in-progress pack user-invoked | Trial synthesis from #63 research/donors | — | Greybox/CC0/SFX/generator ladder, style anchor, measured files, licence traps and AI-file disclosure list | [#63 resolution](https://github.com/Hissal/skill-collection/issues/63#issuecomment-6367394607); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993); [#73 resolution](https://github.com/Hissal/skill-collection/issues/73#issuecomment-6443641717) |
| `in-progress-guide` | in-progress pack model-invoked | New | — | Primarily routes to installed experiments; labelled experimental, no automatic execution/promotion | [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) |

## study

| Skill | Address | Source / provenance | Hard requirements | Extension points it carries / Needs it answers | Decided in |
|---|---|---|---|---|---|
| `teach` | study pack user-invoked | `mattpocock/skills`, adapted with pstack/davidondrej ideas | — | Continuing learning workspace with artifacts; progressive diagrams, lessons rather than long chat | [#32 resolution](https://github.com/Hissal/skill-collection/issues/32#issuecomment-6123240761); [#41 resolution](https://github.com/Hissal/skill-collection/issues/41#issuecomment-6181216467); [#45 resolution](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219853780); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993); study address supersedes core in [#32 resolution](https://github.com/Hissal/skill-collection/issues/32#issuecomment-6123240761) |
| `study-guide` | study pack model-invoked | New | — | Route to continuing learning via teach; needs table only if knowledge exists | [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) |

## onboarding

| Skill | Address | Source / provenance | Hard requirements | Extension points it carries / Needs it answers | Decided in |
|---|---|---|---|---|---|
| `automatic guide (callable name not finalized in record)` | onboarding pack model-invoked | Generated from core guide; only frontmatter/description differ | — | Same routes; suggest readily at task start, offer-and-wait; no workflow execution | [#15 resolution](https://github.com/Hissal/skill-collection/issues/15#issuecomment-6107305243); [#18 resolution](https://github.com/Hissal/skill-collection/issues/18#issuecomment-6108951944); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) |

**Pack content boundaries:** Unity has six model-invoked skills; assemblies, serialization, lifecycle and asset-import rules are selectively loaded guide references, not four extra skills. Gamedev has five references (Logic and presentation, Game prototyping, Invariants/readouts, Game feel, Forgotten siblings), five user workflows and a guide. C# has only its guide; selected style guidance lives in the project. Web has its guide and four workflows; its large reference set is disclosed/selective. No standalone game-prototyping skill is currently adopted. `placeholder-assets` remains a trial rather than a gamedev reference until a later owner decision. No decided extras, writing, service, R3/UniTask or extending-agents pack was found. [#46 resolution](https://github.com/Hissal/skill-collection/issues/46#issuecomment-6346220677); [#47 resolution](https://github.com/Hissal/skill-collection/issues/47#issuecomment-6366449606); [#48 resolution](https://github.com/Hissal/skill-collection/issues/48#issuecomment-6371179357); [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993); [#63 resolution](https://github.com/Hissal/skill-collection/issues/63#issuecomment-6367394607); [#73 resolution](https://github.com/Hissal/skill-collection/issues/73#issuecomment-6443641717).

## Always-on pieces and hooks

Rows explicitly marked “component” are part of another piece and do not add a skill or independent hook.

| Skill | Address | Source / provenance | Hard requirements | Extension points it carries / Needs it answers | Decided in |
|---|---|---|---|---|---|
| Personal steering source | core always-on text | Owner’s current naming convention, maintained here | Install link/copy into owner CLAUDE.md and AGENTS.md; drift check for copy | One source, personal user-scope text; 500-token tripwire; linked per #18 rather than initial copy-only rule | [#14 resolution](https://github.com/Hissal/skill-collection/issues/14#issuecomment-6096108259); [#18 resolution](https://github.com/Hissal/skill-collection/issues/18#issuecomment-6108951944); [#118 scope correction](https://github.com/Hissal/skill-collection/issues/118#issuecomment-6543671754) |
| Attribution rule (component of `commenting` and `pr`) | core model-invoked skill text, not always-on | New rule decided in writing theme; comment note adapted from tstack `leaving-pr-comments` | Full public model name; known user/harness | `commenting`: agent comment note opener; `pr`: PR body attribution footer; no issue-body footer; clear Claude attribution.pr to avoid duplicate attribution | [#42 resolution](https://github.com/Hissal/skill-collection/issues/42#issuecomment-6191540887); [#88 answers 19–20](https://github.com/Hissal/skill-collection/issues/88#issuecomment-6512311352) |
| Command guard | core always-on hook/adapter mechanism | New Node engine; adapted davidondrej, gstack, ECC, hook-collection rule/test ideas | Installed supported adapter; rules as data; project rules may only add blocks | Silent allow; reflection for common destructive Git; human-required operations remain denied for agent execution, even after chat approval; human executes separately; failure stops covered call where enforceable | [#18 resolution](https://github.com/Hissal/skill-collection/issues/18#issuecomment-6108951944); [#43 resolution](https://github.com/Hissal/skill-collection/issues/43#issuecomment-6135590542); [#56 resolution](https://github.com/Hissal/skill-collection/issues/56#issuecomment-6135973362); [#45 resolution](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219853780) |
| Freeze enforcement (component of guard) | core always-on only while explicitly enabled | New; gstack prior art and #57 prototype | Explicit human selection; physical project/logical conversation identity; supported edit interception | Directory union, resolved containment, atomic all-target checks; closure/resume persists; explicit unfreeze/finish clears; shell writes not contained | [#43 resolution](https://github.com/Hissal/skill-collection/issues/43#issuecomment-6135590542); [#57 resolution](https://github.com/Hissal/skill-collection/issues/57#issuecomment-6136328315) |
| Project guard extensions | project-configured additions to core guard | Project rule data; selected protect-secrets cases offered by web setup | Cannot loosen core; selected by project | Optional project-specific protections; .env/key cases offered, .env.example allowed; not blanket core secret-file protection | [#18 resolution](https://github.com/Hissal/skill-collection/issues/18#issuecomment-6108951944); [#43 resolution](https://github.com/Hissal/skill-collection/issues/43#issuecomment-6135590542); [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226) |
| Project pack-list / coding-guidance pointers | project always-on configuration (not another personal core source) | Written by setup-project | Actual selected guide names and project-file/tooling pointers | Normal extension-point route and direct coding-guideline access; tooling wins, disagreements surfaced; no default domain pack always-on hook/text | [#34 resolution](https://github.com/Hissal/skill-collection/issues/34#issuecomment-6124395889); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993); [#71 resolution](https://github.com/Hissal/skill-collection/issues/71#issuecomment-6419435777) |

Guard human-required scope is the ten families in #43 **plus** remote repository deletion approved in #45/[#59 confirmation](https://github.com/Hissal/skill-collection/issues/59#issuecomment-6219227493). The OS-temp repository-root exception retains .git/temp-root/link protections and excludes the extra `/var/tmp` location. The 15-minute retry window is a v0 parameter, not finally ratified blueprint policy. Freeze/unfreeze are already counted in core; their guard rule is not another skill. The #56 fail-closed exception is specific to this guard; other hooks retain the original fail-open admission rule.

Existing `hooks/command-guard/` is a first implementation, not the complete decided catalog: its README still lists ten human-required families, states freeze is unbuilt and records adapter/platform limitations. The code includes `/var/tmp` in its POSIX temporary-root list. Open #59 owns remote-delete implementation; open #75 proposes Cursor support without a deciding resolution. Neither issue body is counted as a new adopted capability.

## Other decided support machinery (not skills or extra packs)

| Skill | Address | Source / provenance | Hard requirements | Extension points it carries / Needs it answers | Decided in |
|---|---|---|---|---|---|
| Manifest, identity/dependency metadata and locks | collection support | New; agent-skills-sync.* contract | Stable publisher-qualified IDs; internal exact-commit closure; verify effective scope | One membership per skill; generated dependency catalog; committed project selection/lock; external locator contract not yet adopted | [#18 resolution](https://github.com/Hissal/skill-collection/issues/18#issuecomment-6108951944); [#45 resolution](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219853780); [#74 resolution](https://github.com/Hissal/skill-collection/issues/74#issuecomment-6442601759) |
| Install routes and doctor | collection support | Folder links/copies and per-list plugins; Unity sync / npx skills consumers | Ownership records; non-owned files never overwritten; hook smoke tests | One canonical tree; user links, project lock, core/pack plugins; no new collection project installer | [#18 resolution](https://github.com/Hissal/skill-collection/issues/18#issuecomment-6108951944); [#45 resolution](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219853780) |
| Format / structure / security checks | collection maintenance | Pinned agnix trial + own Node checker + deterministic Sentry scan | Gate parity, structure/provenance/reference checks; no agnix autofix | Local command + Windows CI; tripwire/body-size warnings, ownership/membership checks; scan own/copied/contributed files alike | [#17 resolution](https://github.com/Hissal/skill-collection/issues/17#issuecomment-6108951556); [#42 resolution](https://github.com/Hissal/skill-collection/issues/42#issuecomment-6191540887) |
| Trigger and behavioural eval procedures | collection maintenance | Anthropic/superpowers and source-eval ideas | Frontier-model gate; inconclusive noise; fresh-context controls | Hand-run triggers; selected behavioural with/without tests; no universal behavioural suite | [#17 resolution](https://github.com/Hissal/skill-collection/issues/17#issuecomment-6108951556); [#42 resolution](https://github.com/Hissal/skill-collection/issues/42#issuecomment-6191540887) |
| Vendoring, notices, baselines and drift | collection maintenance | Copy-with-provenance; per-skill three-way merge | vendor.lock.json, whole-folder baselines, licenses; source SHA/licence/local-change reason | Report-only drift; monthly issue update; adoption of update only when owner asks; no per-skill SPEC/SOURCES requirement | [#17 resolution](https://github.com/Hissal/skill-collection/issues/17#issuecomment-6108951556); [#18 resolution](https://github.com/Hissal/skill-collection/issues/18#issuecomment-6108951944) |
| Release machinery | collection maintenance | release-please | Conventional Commits; manifest/tag version agreement | One repo version; generated guide variant output committed | [#18 resolution](https://github.com/Hissal/skill-collection/issues/18#issuecomment-6108951944) |
| Pack SETUP.md and project configuration | pack support / project files | Fork seeds and decided pack questions | Facts outside installed skill folders; repo-relative project pointers | Setup questions/defaults/configuration, style selection and tool commands; no per-pack setup skills | [#34 resolution](https://github.com/Hissal/skill-collection/issues/34#issuecomment-6124395889); [#48 resolution](https://github.com/Hissal/skill-collection/issues/48#issuecomment-6371179357); [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226); [#71 resolution](https://github.com/Hissal/skill-collection/issues/71#issuecomment-6419435777) |
| Style templates/kits | pack setup offers / project configuration | C# light default + owner kit; TS pstack light default + owner kit; project-owned alternative | One chosen project guide; tooling configuration precedence | Template choice at setup; selected file read directly in ordinary code work; full owner kit details remain open | [#48 resolution](https://github.com/Hissal/skill-collection/issues/48#issuecomment-6371179357); [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) |
| Delegation policy | core support for delegating/handoff | New optional JSON policy | ~/.config/skill-collection/delegation.json; explicit task overrides; invalid policy reported | Role/difficulty/workflow rules; ordered choices/pools, diversity, stable-family/effort resolution; no collection numerical cap | [#55 resolution](https://github.com/Hissal/skill-collection/issues/55#issuecomment-6218080852) |
| Guide generation and route references | core/onboarding/pack support | New, with `mattpocock/skills` PHASE-BOUNDARIES ideas | One core route source; automatic variant differs only in gate/description | Main plus selective supporting routes; pack ROUTES.md only when needed; recommendations never execute workflows | [#15 resolution](https://github.com/Hissal/skill-collection/issues/15#issuecomment-6107305243); [#18 resolution](https://github.com/Hissal/skill-collection/issues/18#issuecomment-6108951944); [#50 resolution](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993); [#73 resolution](https://github.com/Hissal/skill-collection/issues/73#issuecomment-6443641717) |

## Vendor / baseline picks decided as setup offers

These are **conditional offers**, not automatically selected project installs, collection members, or external hard dependencies. Show context cost and hooks/telemetry, explain overlap, verify the chosen route in the target harness, and record the selection separately from the pack list. Dependency-shipped guidance follows its supplying version; separate copies/installs use their own updater. Task-time refresh/removal follows ownership; no background updater by default. No researched delivery product becomes mandatory. [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226); [#71 resolution](https://github.com/Hissal/skill-collection/issues/71#issuecomment-6419435777); [#72 resolution](https://github.com/Hissal/skill-collection/issues/72#issuecomment-6418702495).

| Skill | Address | Source / provenance | Hard requirements | Extension points it carries / Needs it answers | Decided in |
|---|---|---|---|---|---|
| Individual official Unity skills | external per-project setup picks | Unity-Technologies/skills; refreshed official baseline | No hard external-skill edge adopted | Relevant CLI/feature/service knowledge only; never install entire plugin by default; asset-import reference hands off to project-auditor-fixes, optimize-audio, manage-sprite-atlas and CLI integrity checks | [#46 resolution](https://github.com/Hissal/skill-collection/issues/46#issuecomment-6346220677); [#63 resolution](https://github.com/Hissal/skill-collection/issues/63#issuecomment-6367394607) |
| react-best-practices | external conditional React offer | Vercel | — | React projects; version/job/overlap selection | [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226) |
| composition-patterns | external conditional web offer | Vercel | — | Composition guidance for applicable project | [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226) |
| react-view-transitions | external conditional web offer | Vendor source named in web decision | — | Applicable React transitions | [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226) |
| ask-sonner | external conditional web offer | Vendor source named in web decision | — | Applicable Sonner use | [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226) |
| vercel-optimize | external conditional Vercel offer | Vercel | — | Vercel projects | [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226) |
| Playwright CLI / trace / component-testing skills | external conditional browser offers | Playwright vendor skills | Selected host-native route first; one driver per run | Browser/testing/trace jobs; durable new E2E suites use Playwright Test; existing runner retained | [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226) |
| Chrome DevTools MCP / diagnostics skills | external conditional browser offers | GoogleChrome | Tool/skill routes distinct | Browser inspection and diagnostics | [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226) |
| modern-web-guidance | external conditional web offer | GoogleChrome | Disclose MANDATORY description and unpinned npx caveat | Relevant platform knowledge | [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226) |
| Chrome-extension skills | external conditional extension offer | Official vendors in sweep; exact selection per project | — | Chrome extension project knowledge | [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226) |
| Fastify | external conditional web offer | Maintainer-authored community knowledge, labelled accordingly | — | Applicable server framework | [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226) |
| Vite | external conditional web offer | Vendor guidance | — | Applicable bundler | [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226) |
| Vitest | external conditional web offer | Vendor guidance | — | Applicable test runner; separate tsc check for new TS projects | [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226) |
| pnpm | external conditional web offer | Vendor guidance | — | Applicable package manager | [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226) |
| Supabase | external conditional service offer | Official vendor | — | Chosen database/service | [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226) |
| Neon | external conditional service offer | Official vendor | — | Chosen database/service | [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226) |
| Other official vendors in web sweep | external conditional offer class; not an enumerated adopted set | Sources recognized in web decision | Select individually or explicit whole-set opt-in | Stack-dependent selection; this wording adopts an offer category, not all sweep candidates | [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226); [#72 resolution](https://github.com/Hissal/skill-collection/issues/72#issuecomment-6418702495) |
| roslyn-language-server / fallback csharp-lsp | external tool trial, not a skill | Microsoft Roslyn; fallback csharp-ls route | Pinned personal lspServers trial; Claude-only plugin capability | Trial authorized, final recommendation not decided; #64 remains open | [#48 resolution](https://github.com/Hissal/skill-collection/issues/48#issuecomment-6371179357) |
| typescript-lsp | external per-project tool trial, not a skill | Named in web setup decision | Pinned, same trial terms as Roslyn | Optional TypeScript language-server trial | [#49 resolution](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226) |

The vendor table has **19 offer rows**, including grouped skill families, an open-ended category and two tool trials. It has no defensible exact external-skill total; it must not be added to the 78 collection skills. Vercel web-design-guidelines is copied/pinned material **inside web-guide**, not a separate adopted installed skill. Host-provided authoring/document/API capabilities and placeholder generator research are not added to this offer table as invented collection picks.

## Supersession list

Historical resolution comments are not edited. When reading an older decision, check here whether a later one changed it. Entries for documents in this repository and for the map's gists were applied by [#51 resolution](https://github.com/Hissal/skill-collection/issues/51). S08 and S55 describe the existing guard code and are left to the guard build.

Each numbered entry identifies affected earlier wording, the later deciding authority, and exact suggested replacement text. Apply replacements only to current summaries/docs; keep historical resolution comments and superseded ADRs as history with a pointer. Already-reconciled historical cases are labelled rather than presented as uncorrected live docs. Multiple occurrences of one semantic correction are grouped. Earlier proposals are not treated as accepted decisions; the explicitly labelled #63 proposal is included to prevent mistaking its “Resolution” heading for adoption. Changes are transcribed here; none were applied to the repo or tracker.

### S01

- **Where:** docs/adr/0001-fork-stays-a-separate-member-repo.md:7; :9; :13; :18 (already marked superseded); [#15 comment](https://github.com/Hissal/skill-collection/issues/15#issuecomment-6107305243) “core guide”/handoff-to-build paragraphs
- **Earlier wording:** Two authoring repos; fork-only Matt skills; references collection -> fork; guide cannot live in fork; rename/build in fork.
- **Superseded by:** [#18](https://github.com/Hissal/skill-collection/issues/18#issuecomment-6108951944) / ADR 0002
- **Exact suggested replacement:** “Every collection skill is authored in this repository. The fork is a frozen source; Matt-derived copies are tracked against mattpocock/skills. Build and rename collection skills here. Retain ADR 0001 as superseded history.”
- **Later amended:** Since [#244](https://github.com/Hissal/skill-collection/issues/244), Matt-derived skills are copied straight from `mattpocock/skills` at a chosen commit, and the fork is a source for the Unity pack only. See [Matt-derived skills](vendoring.md#matt-derived-skills).

### S02

- **Where:** [#14](https://github.com/Hissal/skill-collection/issues/14#issuecomment-6096108259) “Core always-on”; [#1 Decisions-so-far: #14](https://github.com/Hissal/skill-collection/issues/1)
- **Earlier wording:** Personal steering files are copied from the source.
- **Superseded by:** [#18](https://github.com/Hissal/skill-collection/issues/18#issuecomment-6108951944)
- **Exact suggested replacement:** “Link the single personal steering source into the owner’s user-scope files; use a copy with drift checking where linking is unavailable.”

### S03

- **Where:** [#14](https://github.com/Hissal/skill-collection/issues/14#issuecomment-6096108259) “Admission gates”; [#1 #14 gist](https://github.com/Hissal/skill-collection/issues/1)
- **Earlier wording:** All admitted hooks fail open.
- **Superseded by:** [#56](https://github.com/Hissal/skill-collection/issues/56#issuecomment-6135973362)
- **Exact suggested replacement:** “Hooks normally fail open. The command guard is an explicit exception: failed evaluation stops the affected covered call where enforceable; adapter limitations must be declared.”

### S04

- **Where:** [#14](https://github.com/Hissal/skill-collection/issues/14#issuecomment-6096108259) “Core always-on”; [#18](https://github.com/Hissal/skill-collection/issues/18#issuecomment-6108951944) “Guard”
- **Earlier wording:** Guard scope is catastrophic only.
- **Superseded by:** [#43](https://github.com/Hissal/skill-collection/issues/43#issuecomment-6135590542)
- **Exact suggested replacement:** “The core guard includes selected high-impact human-required operations and reflection for common destructive Git operations, under #43 and later amendments.”

### S05

- **Where:** [#18](https://github.com/Hissal/skill-collection/issues/18#issuecomment-6108951944) “Guard”
- **Earlier wording:** A blocked command is never retried; hand it to the user.
- **Superseded by:** [#43](https://github.com/Hissal/skill-collection/issues/43#issuecomment-6135590542) and [#56](https://github.com/Hissal/skill-collection/issues/56#issuecomment-6135973362)
- **Exact suggested replacement:** “Human-required commands remain denied for agent execution and are handed to the human. Reflection pauses permit one identical retry in the same working directory; changed input requires another pause.”

### S06

- **Where:** [#17](https://github.com/Hissal/skill-collection/issues/17#issuecomment-6108951556) “Measurement and docs” hook house style
- **Earlier wording:** Fail open and one environment switch to disable every hook.
- **Superseded by:** [#56](https://github.com/Hissal/skill-collection/issues/56#issuecomment-6135973362)
- **Exact suggested replacement:** “Other hooks retain the admission house style. The command guard fails closed on covered evaluation failure where enforceable and uses human-operated recovery/disable after stopping the agent session; the agent must not disable it to continue.”

### S07

- **Where:** [#43](https://github.com/Hissal/skill-collection/issues/43#issuecomment-6135590542) family 1
- **Earlier wording:** Every repository root is protected, with no temporary-clone exception.
- **Superseded by:** [#43 comment](https://github.com/Hissal/skill-collection/issues/43#issuecomment-6142088984) confirmed by [#43 comment](https://github.com/Hissal/skill-collection/issues/43#issuecomment-6219227943)
- **Exact suggested replacement:** “Allow deletion of a repository root physically inside the OS temp directory. Keep its .git alone, the temp root itself, non-temp scratch clones and links resolving outside temp protected. Do not add /var/tmp as an extra temp location.”

### S08

- **Where:** [#43](https://github.com/Hissal/skill-collection/issues/43#issuecomment-6135590542) ten-family list; hooks/command-guard/README.md:13 (v0 description)
- **Earlier wording:** Ten human-required families; remote-repository deletion absent.
- **Superseded by:** [#45](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219853780) / [#59 comment](https://github.com/Hissal/skill-collection/issues/59#issuecomment-6219227493)
- **Exact suggested replacement:** “The decided guard has the ten #43 families plus human-required remote repository deletion via CLI and bare-repository API forms. #59 still owns implementation; scope grants and archiving are not implicitly included.”

### S09

- **Where:** [#43](https://github.com/Hissal/skill-collection/issues/43#issuecomment-6135590542) freeze/session paragraph
- **Earlier wording:** Freeze ends when the session ends.
- **Superseded by:** [#57](https://github.com/Hissal/skill-collection/issues/57#issuecomment-6136328315)
- **Exact suggested replacement:** “Freeze belongs to one physical project and one logical conversation, persists across closure/resume, and clears on explicit human unfreeze or finish. A fresh conversation inherits no boundary.”

### S10

- **Where:** [#43](https://github.com/Hissal/skill-collection/issues/43#issuecomment-6135590542) follow-up paragraphs; [#1 #43 gist](https://github.com/Hissal/skill-collection/issues/1)
- **Earlier wording:** Human-only approval architecture and freeze usefulness/behavior remain future decisions.
- **Superseded by:** [#56](https://github.com/Hissal/skill-collection/issues/56#issuecomment-6135973362) and [#57](https://github.com/Hissal/skill-collection/issues/57#issuecomment-6136328315)
- **Exact suggested replacement:** “Human-only execution/guard-failure/recovery behavior is decided in #56 and logical-conversation freeze behavior in #57; adapter/platform implementation verification remains.”

### S11

- **Where:** [#18](https://github.com/Hissal/skill-collection/issues/18#issuecomment-6108951944) “Project configuration”; [#1 #18 gist](https://github.com/Hissal/skill-collection/issues/1)
- **Earlier wording:** Skill behavior is fixed, with no behavior-preference switches.
- **Superseded by:** [#55](https://github.com/Hissal/skill-collection/issues/55#issuecomment-6218080852)
- **Exact suggested replacement:** “Project configuration contains project facts; preference switches are absent by default. Explicitly decided exceptions are allowed, including optional user-scoped delegation policy outside installed skill folders.”

### S12

- **Where:** [#15](https://github.com/Hissal/skill-collection/issues/15#issuecomment-6107305243) “Pack guides”
- **Earlier wording:** At most one model-invoked entry skill per pack.
- **Superseded by:** [#46](https://github.com/Hissal/skill-collection/issues/46#issuecomment-6346220677) / [#50](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993)
- **Exact suggested replacement:** “Each pack has at most one <pack>-guide. It may also contain other model-invoked skills when their job warrants it; Unity initially has six model-invoked entries.”

### S13

- **Where:** [#34](https://github.com/Hissal/skill-collection/issues/34#issuecomment-6124395889) “Layering”
- **Earlier wording:** Typing either pack or core skill always starts the same workflow; pack unconditionally calls core.
- **Superseded by:** [#45](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219853780) / ADR 0003:15
- **Exact suggested replacement:** “Knowledge lookup supplies only the stated need inside the caller’s current job. Performing the job uses core once, without restarting active layers. A user-invoked core workflow remains gated.”

### S14

- **Where:** [#34](https://github.com/Hissal/skill-collection/issues/34#issuecomment-6124395889) “Setup”
- **Earlier wording:** Setup discovers installed guides only and does not suggest uninstalled packs except through pack setup.
- **Superseded by:** [#71](https://github.com/Hissal/skill-collection/issues/71#issuecomment-6419435777) and [#72](https://github.com/Hissal/skill-collection/issues/72#issuecomment-6418702495)
- **Exact suggested replacement:** “Setup uses the collection catalog, installed listing and relevant vendor sources; it may recommend guidance and inspect selected SETUP.md material before installation or completed project facts. Normal extension points still use the configured pack list.”

### S15

- **Where:** [#34](https://github.com/Hissal/skill-collection/issues/34#issuecomment-6124395889) “Picking single skills”
- **Earlier wording:** The onboarding pack is the example of a pack with no guide.
- **Superseded by:** [#50](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993)
- **Exact suggested replacement:** “Onboarding contains the model-invoked automatic variant of the core guide. Study and in-progress additionally have model-invoked route guides. Guide-less standalone selection is distinct from those decided pack entries.”

### S16

- **Where:** [#32](https://github.com/Hissal/skill-collection/issues/32#issuecomment-6123240761) “Core user-invoked”; [#41](https://github.com/Hissal/skill-collection/issues/41#issuecomment-6181216467) teach heading; [#1 #32 gist](https://github.com/Hissal/skill-collection/issues/1)
- **Earlier wording:** teach is core (or may later move).
- **Superseded by:** [#45](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219853780)
- **Exact suggested replacement:** “teach is study user-invoked; wizard and to-questionnaire remain core user-invoked. The fork-pass count is historical, not the current core census.”

### S17

- **Where:** [#32](https://github.com/Hissal/skill-collection/issues/32#issuecomment-6123240761) setup entry; [#1 #32 gist](https://github.com/Hissal/skill-collection/issues/1)
- **Earlier wording:** setup-matt-pocock-skills is taken and awaits renaming.
- **Superseded by:** [#34](https://github.com/Hissal/skill-collection/issues/34#issuecomment-6124395889)
- **Exact suggested replacement:** “The collection skill is setup-project, with catalog/vendor discovery and empty/partial/existing-project configuration under #71.”
- **Later amended:** The ID is `hissal.skill-collection/setup-project`, set before the first release, when nothing had the old name's ID installed, and it stays stable from the first release on. The source is `mattpocock/skills` at `skills/engineering/setup-matt-pocock-skills`, not the fork; the Unity material stays with the Unity pack's `SETUP.md` ([owner ruling](https://github.com/Hissal/skill-collection/issues/147#issuecomment-6589513206)).

### S18

- **Where:** [#32](https://github.com/Hissal/skill-collection/issues/32#issuecomment-6123240761) core architecture entry; [#40](https://github.com/Hissal/skill-collection/issues/40#issuecomment-6177796453) architecture heading/extension point; [#45](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219853780) census; [#1 #40 gist](https://github.com/Hissal/skill-collection/issues/1)
- **Earlier wording:** Callable name improve-codebase-architecture.
- **Superseded by:** [#50](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993)
- **Exact suggested replacement:** “Use architecture-review for the collection skill; preserve its stable identity and fork provenance. The old name is historical.”
- **Later amended:** The ID changed to `hissal.skill-collection/architecture-review` before the first release, when nothing had it installed. Fork provenance stays, and IDs stay stable from the first release on.
- **Later amended:** Provenance is `mattpocock/skills` at `skills/engineering/improve-codebase-architecture`, as the lock entry records, not the fork ([#244](https://github.com/Hissal/skill-collection/issues/244)).

### S19

- **Where:** [#40](https://github.com/Hissal/skill-collection/issues/40#issuecomment-6177796453) architecture continuation
- **Earlier wording:** Chosen-and-grilled candidate is handed automatically to refactoring.
- **Superseded by:** [#50](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993)
- **Exact suggested replacement:** “Review candidates/tradeoffs and stop for owner selection; develop selected design decisions as needed, then offer an explicitly chosen spec, bounded same-session refactor or delegated implementation. Subordinate reviewers return findings only.”

### S20

- **Where:** [#45](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219853780) catalog; [#1 #45 gist](https://github.com/Hissal/skill-collection/issues/1)
- **Earlier wording:** 42 core skills: 14 model-invoked and 28 user-invoked.
- **Superseded by:** [#49](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226) and [#74](https://github.com/Hissal/skill-collection/issues/74#issuecomment-6442601759)
- **Exact suggested replacement:** “Current core is 46 skills: 16 model-invoked and 30 user-invoked. #49 adds risky-changes, dependency-audit and break-ui; amended #74 adds reviewing. architecture-review is a rename.”

### S21

- **Where:** [#45](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219853780) “Composition” and map #45 gist
- **Earlier wording:** Teammate-ready handoff remains a child decision.
- **Superseded by:** [#62](https://github.com/Hissal/skill-collection/issues/62#issuecomment-6414951885)
- **Exact suggested replacement:** “handoff includes a self-contained work-brief form for teammates or the owner’s future session. Prefer an existing/suitable tracker issue unless a document is requested or no tracker is configured; no separate brief/pickup skill.”

### S22

- **Where:** [#35](https://github.com/Hissal/skill-collection/issues/35#issuecomment-6126545823) delegating item 4
- **Earlier wording:** Unattended work stops on anything irreversible.
- **Superseded by:** [#54](https://github.com/Hissal/skill-collection/issues/54#issuecomment-6215840308)
- **Exact suggested replacement:** “Unattended execution honors the invoked workflow’s explicit authority. full-stop/full-send may commit, push, rebase and force-push with lease to their own branch; full-send additionally authorizes merge when actual project requirements are met. Stop for unresolved decisions or actions outside that authority.”

### S23

- **Where:** [#36](https://github.com/Hissal/skill-collection/issues/36#issuecomment-6165955938) receiving-review
- **Earlier wording:** Unattended judgment calls are always parked in PR Not done.
- **Superseded by:** [#54](https://github.com/Hissal/skill-collection/issues/54#issuecomment-6215840308)
- **Exact suggested replacement:** “Within explicitly invoked autonomous delivery flows, resolve implementation judgment calls under the granted implementation authority, recording consequential choices. This exception does not expand scope or weaken project requirements.”

### S24

- **Where:** [#35](https://github.com/Hissal/skill-collection/issues/35#issuecomment-6126545823) “For later”; [#1 #35 gist](https://github.com/Hissal/skill-collection/issues/1)
- **Earlier wording:** Model tiers/concurrency/cross-harness dispatch are likely outside this map; loop-me is parked.
- **Superseded by:** [#53](https://github.com/Hissal/skill-collection/issues/53#issuecomment-6214483933) and [#55](https://github.com/Hissal/skill-collection/issues/55#issuecomment-6218080852)
- **Exact suggested replacement:** “loop-me is an in-progress user-invoked recurring-work design trial. Shared model/effort/transport policy belongs in core delegating, with optional personal policy and no collection-wide numerical concurrency cap.”

### S25

- **Where:** [#35](https://github.com/Hissal/skill-collection/issues/35#issuecomment-6126545823) rejected PR machinery; [#36](https://github.com/Hissal/skill-collection/issues/36#issuecomment-6165955938) rejected arena/bakeoff; [#1 #36 gist](https://github.com/Hissal/skill-collection/issues/1)
- **Earlier wording:** Arena/bakeoff and PR babysitting capability read as wholly rejected.
- **Superseded by:** [#54](https://github.com/Hissal/skill-collection/issues/54#issuecomment-6215840308)
- **Exact suggested replacement:** “Donor suites are not adopted wholesale; competing implementations and PR babysitting are reopened as in-progress user-invoked arena and babysit-pr, alongside full-stop/full-send delivery experiments.”

### S26

- **Where:** [#35](https://github.com/Hissal/skill-collection/issues/35#issuecomment-6126545823) says delegating has no extension point
- **Earlier wording:** delegating carries none.
- **Superseded by:** [#45](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219853780) / docs/agents/core-extension-points.md:20
- **Exact suggested replacement:** “delegating asks for stack-specific shared-resource and isolation constraints whenever parallel work is assessed.”

### S27

- **Where:** [#35](https://github.com/Hissal/skill-collection/issues/35#issuecomment-6126545823) implement/implement-spec extension table
- **Earlier wording:** Each implementation entry directly owns compile/work and integration-check knowledge.
- **Superseded by:** [#37](https://github.com/Hissal/skill-collection/issues/37#issuecomment-6166888190)
- **Exact suggested replacement:** “implement keeps test/check cadence; compile/work and implement-spec integration evidence go through verifying and its extension points.”

### S28

- **Where:** [#37](https://github.com/Hissal/skill-collection/issues/37#issuecomment-6166888190) blast-radius rationale
- **Earlier wording:** Chosen over risky-changes in core.
- **Superseded by:** [#49](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226)
- **Exact suggested replacement:** “blast-radius remains core user-invoked for downstream impact; risky-changes is also core model-invoked for the separately decided representative-real-data gate.”

### S29

- **Where:** [#37](https://github.com/Hissal/skill-collection/issues/37#issuecomment-6166888190) migrating retirement guidance
- **Earlier wording:** A changelog line replaces announcing to consumers.
- **Superseded by:** [#45](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219853780)
- **Exact suggested replacement:** “Retain the changelog and communicate with affected consumers when needed; do not assume the developer is the only consumer.”

### S30

- **Where:** [#37](https://github.com/Hissal/skill-collection/issues/37#issuecomment-6166888190) constraints floor-guard storage; [#17](https://github.com/Hissal/skill-collection/issues/17#issuecomment-6108951556) missing-file check and [#37](https://github.com/Hissal/skill-collection/issues/37#issuecomment-6166888190) why local-reference rationale
- **Earlier wording:** Scripts/references are assumed inside the installed skill folder; CI may appear to use that installed guard.
- **Superseded by:** [#45](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219853780) and [#74](https://github.com/Hissal/skill-collection/issues/74#issuecomment-6442601759)
- **Exact suggested replacement:** “CI-used constraints floor guards live in the project and verifying runs the configured command. Bundled paths must resolve, while explicitly required cross-skill knowledge resolves through verified installed identity/content/reachability; do not assume sibling folders or forbid the decided reviewing reference.”

### S31

- **Where:** [#40](https://github.com/Hissal/skill-collection/issues/40#issuecomment-6177796453) refactoring classification
- **Earlier wording:** Every published-interface change/rename reads as migrating, even when consumers move together.
- **Superseded by:** [#45](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219853780)
- **Exact suggested replacement:** “refactoring covers behavior-preserving changes whose affected consumers can move together. A compatibility transition, persisted-data transition, staged rollout or separately updated consumer requires migrating, suggested rather than auto-invoked.”

### S32

- **Where:** [#17](https://github.com/Hissal/skill-collection/issues/17#issuecomment-6108951556) agnix wording-rule deferral
- **Earlier wording:** Wording-opinion rules stay off pending skill-writing theme.
- **Superseded by:** [#42](https://github.com/Hissal/skill-collection/issues/42#issuecomment-6191540887)
- **Exact suggested replacement:** “Keep agnix wording-opinion rules PE-*, CC-MEM-005 through 008 and AGM-002/004 off; retain the decided mechanical rules. The wording decision is settled.”

### S33

- **Where:** [#17](https://github.com/Hissal/skill-collection/issues/17#issuecomment-6108951556) behavioural eval summary
- **Earlier wording:** Procedure lacks later selected micro-test particulars.
- **Superseded by:** [#42](https://github.com/Hissal/skill-collection/issues/42#issuecomment-6191540887)
- **Exact suggested replacement:** “For selected by-hand behavioural evals use fresh context, a no-guidance control, transcript reading and 5+ repetitions; treat variance as a metric and classify fixture/harness/routing failures before editing text.”

### S34

- **Where:** [#39](https://github.com/Hissal/skill-collection/issues/39#issuecomment-6170537610) Scope; [#1 #39 gist](https://github.com/Hissal/skill-collection/issues/1)
- **Earlier wording:** test-review: named scope, else diff, else hotspots.
- **Superseded by:** [#74](https://github.com/Hissal/skill-collection/issues/74#issuecomment-6442601759)
- **Exact suggested replacement:** “test-review consults and requires reviewing. Explicit user scope, then exact caller scope, then pending work including local changes; with none, survey current modules selected by recent integration history.”

### S35

- **Where:** [#48](https://github.com/Hissal/skill-collection/issues/48#issuecomment-6371179357) performance trial scope/name; [#1 #48 gist](https://github.com/Hissal/skill-collection/issues/1)
- **Earlier wording:** Unnamed performance pass, named scope else diff else hotspots.
- **Superseded by:** [#50](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) and [#74](https://github.com/Hissal/skill-collection/issues/74#issuecomment-6442601759)
- **Exact suggested replacement:** “The trial is performance-review, report-only, in-progress user-invoked. It requires reviewing and uses the shared target/base/snapshot selection; its performance methods remain its own.”

### S36

- **Where:** [#40](https://github.com/Hissal/skill-collection/issues/40#issuecomment-6177796453) history scan and [#50](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) final “New frontier”; [#1 #50 gist](https://github.com/Hissal/skill-collection/issues/1)
- **Earlier wording:** Architecture named-direction/history defaults; shared scope and suggestions still undecided.
- **Superseded by:** [#74](https://github.com/Hissal/skill-collection/issues/74#issuecomment-6442601759) and [#73](https://github.com/Hissal/skill-collection/issues/73#issuecomment-6443641717)
- **Exact suggested replacement:** “Shared scope is decided in amended #74 and contextual suggestions in #73. architecture-review uses explicit/user or exact caller scope before pending work and module-based hotspot fallback, with its chosen continuation retained.”

### S37

- **Where:** [#36](https://github.com/Hissal/skill-collection/issues/36#issuecomment-6165955938) fixed-point-based code-review baseline inherited from fork
- **Earlier wording:** A missing fixed comparison point must be requested before code review.
- **Superseded by:** [#74](https://github.com/Hissal/skill-collection/issues/74#issuecomment-6442601759)
- **Exact suggested replacement:** “Announce target/base/snapshot. Use explicit user scope first, exact caller scope second, otherwise pending work against actual/intended merge base including local changes; absent pending work, use the shared hotspot survey. Clarify genuine ambiguity.”

### S38

- **Where:** Pre-amendment revision of [#74 resolution](https://github.com/Hissal/skill-collection/issues/74#issuecomment-6442601759) (same comment URL, shared-home section)
- **Earlier wording:** Common scope reference bundled in code-review; other reviews depend on code-review.
- **Superseded by:** [#74](https://github.com/Hissal/skill-collection/issues/74#issuecomment-6442601759) amended shared-home section
- **Exact suggested replacement:** “reviewing is a core model-invoked support skill owning common review mechanics and disclosed scope references. code-review, architecture-review, test-review and performance-review each require it; they do not require code-review merely to read shared scope.”

### S39

- **Where:** [#36](https://github.com/Hissal/skill-collection/issues/36#issuecomment-6165955938) pre-existing findings section
- **Earlier wording:** Pre-existing issues get a separate section and do not count, stated without survey qualification.
- **Superseded by:** [#74](https://github.com/Hissal/skill-collection/issues/74#issuecomment-6442601759)
- **Exact suggested replacement:** “Bounded primary findings must be causally connected to the target; credible consequential incidental findings go in brief Out-of-scope observations. Hotspot surveys inspect current selected areas and may report existing problems there.”

### S40

- **Where:** [#47](https://github.com/Hissal/skill-collection/issues/47#issuecomment-6366449606) skills table; [#1 #47 gist](https://github.com/Hissal/skill-collection/issues/1)
- **Earlier wording:** The game-specific trial is legibility.
- **Superseded by:** [#50](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993)
- **Exact suggested replacement:** “The trial is game-legibility, in-progress user-invoked, preserving stable identity/provenance and its frame-capturing project play-route prerequisite.”

### S41

- **Where:** [#46](https://github.com/Hissal/skill-collection/issues/46#issuecomment-6346220677) initial direct guide reference list (before later addition)
- **Earlier wording:** Guide directly owns only assembly/serialization/lifecycle references.
- **Superseded by:** [#63 comment](https://github.com/Hissal/skill-collection/issues/63#issuecomment-6367394607) and [#50](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993)
- **Exact suggested replacement:** “unity-guide directly owns assembly, serialization, lifecycle and asset-import-rules references. This adds a needs row/reference, not a seventh Unity skill.”

### S42

- **Where:** [#63 comment](https://github.com/Hissal/skill-collection/issues/63#issuecomment-6366808822) proposal (not an earlier accepted decision)
- **Earlier wording:** Placeholder art proposed directly as gamedev-guide reference.
- **Superseded by:** [#63 comment](https://github.com/Hissal/skill-collection/issues/63#issuecomment-6367394607)
- **Exact suggested replacement:** “Placeholder material is the in-progress user-invoked placeholder-assets trial. game-brief/game-jam do not depend on it; later owner adoption may move validated material into gamedev-guide.”

### S43

- **Where:** [#46](https://github.com/Hissal/skill-collection/issues/46#issuecomment-6346220677) review handoff superseding old fork rule; [#36 comment](https://github.com/Hissal/skill-collection/issues/36#issuecomment-6165955938) Unity passed-on paragraph
- **Earlier wording:** Meaningful/hard Unity findings restricted to data loss or broken builds.
- **Superseded by:** [#46](https://github.com/Hissal/skill-collection/issues/46#issuecomment-6346220677)
- **Exact suggested replacement:** “Apply core Standards/Spec/Failure review and evidence limits; do not restrict meaningful Unity findings to data loss or broken builds. State what unexercised runtime/import/Player/network behavior cannot be established.”

### S44

- **Where:** [#46](https://github.com/Hissal/skill-collection/issues/46#issuecomment-6346220677) final resolution explicitly replaces earlier/fork testing instruction
- **Earlier wording:** Full EditMode suite at every final review.
- **Superseded by:** [#46](https://github.com/Hissal/skill-collection/issues/46#issuecomment-6346220677) consolidated final decision
- **Exact suggested replacement:** “Prefer EditMode when it establishes behavior; choose checks by affected contracts/risk, widen for shared infrastructure/uncertainty/coupling, and honor project-required checks. Read-only review does not execute tests.”

### S45

- **Where:** [#46](https://github.com/Hissal/skill-collection/issues/46#issuecomment-6346220677) final resolution explicitly replaces earlier/fork prototype default
- **Earlier wording:** Unity is the blanket game-prototype medium.
- **Superseded by:** [#44](https://github.com/Hissal/skill-collection/issues/44#issuecomment-6195116678) and [#46](https://github.com/Hissal/skill-collection/issues/46#issuecomment-6346220677)
- **Exact suggested replacement:** “Use the cheapest medium that does not fake the tested dimension. Engine-dependent behavior requires Unity; faithfully testable rules/layout/coarse gameplay may use browser sketches with explicit porting/Unity-validation limits.”

### S46

- **Where:** [#15](https://github.com/Hissal/skill-collection/issues/15#issuecomment-6107305243) no knowledge beyond same-pack reference statement; GLOSSARY.md:66
- **Earlier wording:** Needs table answers only its own reference files or skills in the same pack.
- **Superseded by:** [#72](https://github.com/Hissal/skill-collection/issues/72#issuecomment-6418702495) and [#50](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993)
- **Exact suggested replacement:** “A needs table maps needs to selectively loaded maintained references/skills, and may consult relevant selected vendor guidance. Project vendor pointers remain separate configuration; reading knowledge grants no workflow authority.”

### S47

- **Where:** docs/adr/0003-core-reaches-packs-through-the-pack-list.md:7
- **Earlier wording:** No skill outside a pack ever names that pack or its skills (unqualified).
- **Superseded by:** [#71](https://github.com/Hissal/skill-collection/issues/71#issuecomment-6419435777) and [#73](https://github.com/Hissal/skill-collection/issues/73#issuecomment-6443641717)
- **Exact suggested replacement:** “Ordinary extension points and embedded core-to-pack workflow suggestions name needs and use applicable guides. Setup may name/discover collection packs and inspect selected SETUP.md material before installation; the core guide discovers installed pack guides to request routes.”

### S48

- **Where:** docs/adr/0003-core-reaches-packs-through-the-pack-list.md:31
- **Earlier wording:** The listing is how setup and guide discover installed guides, omitting the broader setup path despite :25.
- **Superseded by:** [#71](https://github.com/Hissal/skill-collection/issues/71#issuecomment-6419435777)
- **Exact suggested replacement:** “The listing discovers installed guides. setup-project additionally uses the collection catalog and relevant vendor sources, and may inspect selected pack setup material before installation; the core guide continues to discover installed pack routes.”

### S49

- **Where:** docs/adr/0003-core-reaches-packs-through-the-pack-list.md:36
- **Earlier wording:** Every knowledge hop loads a pack skill as well as the guide.
- **Superseded by:** [#46](https://github.com/Hissal/skill-collection/issues/46#issuecomment-6346220677) and [#50](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993)
- **Exact suggested replacement:** “A knowledge hop loads the guide body and only matching target material: a guide-owned reference or another installed pack skill. Several caller needs may reuse one reference.”

### S50

- **Where:** [#50](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) C# ordinary style row proposal / final correction; earlier broad pack-style lookup assumption
- **Earlier wording:** Ordinary coding style is reached through a language-pack needs row.
- **Superseded by:** [#50](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) universal project guidance amendment
- **Exact suggested replacement:** “Setup writes a conditional project-instruction pointer to the selected project coding guide and applicable tooling. Ordinary work and core code-writing/review workflows read those files directly; pack style templates are setup inputs.”

### S51

- **Where:** [#36](https://github.com/Hissal/skill-collection/issues/36#issuecomment-6165955938) second-opinion route passed to #50
- **Earlier wording:** Silent-or-unsure failure alone suggests second-opinion.
- **Superseded by:** [#73](https://github.com/Hissal/skill-collection/issues/73#issuecomment-6443641717)
- **Exact suggested replacement:** “Suggest second-opinion only when a consequential claim remains disputed or uncertain after available evidence is checked and resolving it could change acceptance; silent failure raises stakes but alone is insufficient.”

### S52

- **Where:** [#50](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) “core guide and automatic variant” alone as discovery summary
- **Earlier wording:** Only general guide routes are recorded; per-skill suggestion design remains a future decision.
- **Superseded by:** [#73](https://github.com/Hissal/skill-collection/issues/73#issuecomment-6443641717)
- **Exact suggested replacement:** “Keep guide discovery and add only the observed-condition/timing/ownership connections accepted in #73. Parent agents own user-facing recommendations; suggestions neither execute gated workflows nor replace verification or expand authority.”

### S53

- **Where:** [#50](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) selected intermediate accepted route/name proposals before final index
- **Earlier wording:** Old architecture name, legibility name and unresolved performance-pass name appear in accepted intermediate tables.
- **Superseded by:** [#50](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993) final corrections
- **Exact suggested replacement:** “Use architecture-review, game-legibility and performance-review everywhere in current callable routes; retain earlier tables only as explicitly superseded history.”

### S54

- **Where:** [#32](https://github.com/Hissal/skill-collection/issues/32#issuecomment-6123240761) eight Unity candidates and [#1 #32 gist](https://github.com/Hissal/skill-collection/issues/1)
- **Earlier wording:** Eight Unity skills remain untaken candidates; seven other fork entries wait on themes.
- **Superseded by:** [#46](https://github.com/Hissal/skill-collection/issues/46#issuecomment-6346220677) and [#42](https://github.com/Hissal/skill-collection/issues/42#issuecomment-6191540887) / [#49](https://github.com/Hissal/skill-collection/issues/49#issuecomment-6397980226) / [#53](https://github.com/Hissal/skill-collection/issues/53#issuecomment-6214483933)
- **Exact suggested replacement:** “Fork-pass addresses are historical: Unity now has six decided model-invoked entries; assembly/serialization/lifecycle content is guide-owned; loop-me is an in-progress trial; setup-ts-deep-modules is web user-invoked; other decisions are resolved by their cited themes.”

### S55

- **Where:** hooks/command-guard/README.md:15 and hooks/command-guard/engine/index.js:677 (implementation delta)
- **Earlier wording:** Temp-root exception appears to include the extra /var/tmp root through code.
- **Superseded by:** [#43 comment](https://github.com/Hissal/skill-collection/issues/43#issuecomment-6219227943) and [#45](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219853780)
- **Exact suggested replacement:** “The blueprint permits physical OS-temp repository roots with resolved-path protections and explicitly excludes adding /var/tmp as another allowed location. The v0 implementation must be reconciled before claiming conformance.”

## Open / undecided

Items 1–7 of the earlier list (Unity/gamedev `risky-changes` answer, C#/Unity dependency answers, Unity `break-ui`, game UI design contract, neutral threat-model home, `risky-changes` address, Failure outside-diff restriction) are decided in [#51 resolution](https://github.com/Hissal/skill-collection/issues/51) and folded into the tables above. What remains is specification or build work, or a declared deferral; none blocks `/to-spec`. The Unity style template is tracked in [#76](https://github.com/Hissal/skill-collection/issues/76).

Other #51 decisions: no agents pack in the first build (setup offers Anthropic's `mcp-server-dev` and `agent-sdk-dev` as vendor picks for agentic repos); licence notices and a provenance pointer travel inside each installed skill folder; the check script validates hard requirements after resolution, not as files local to the caller; idle cost is measured after the build; R3 and UniTask are the first Unity pack addition after the build.

8. **Complete hard-install edge declarations.** Four reviewing edges and the pack-layering guide rule are explicit. Many other process calls/layering relations exist without a complete per-skill hard-edge enumeration. They must not be upgraded to metadata dependencies by transcription; final declarations and generated catalog belong to specification/build. [Decision record](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219853780).

9. **Automatic guide callable name / host names.** Its onboarding address, one-skill packaging, generated shared routes and trigger are decided, but no final distinct callable name was found. All final host command-name clashes/effective plugin names remain build checks. [Decision record](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993).

10. **Retry-window final treatment.** The 15-minute identical-retry window is implemented v0 behavior; #45 explicitly did not ratify it. Final treatment is build/spec work. [Decision record](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219853780).

11. **Guard remaining rule questions / Cursor proposal.** Remote-delete scope is already decided and #59 is implementation work. delete_repo scope grants and repository archiving remain separate undecided questions. #75 Cursor support is an open proposal with no resolution; it does not change the supported blueprint by itself. [Decision record](https://github.com/Hissal/skill-collection/issues/56#issuecomment-6135973362).

12. **Language-server adoption.** Pinned Roslyn trial (#64), fallback csharp-lsp and per-project typescript-lsp trial are authorized trials, not completed adoption or runtime verification. No C# pack server ships by default. [Decision record](https://github.com/Hissal/skill-collection/issues/48#issuecomment-6371179357).

13. **Full style-kit contents.** Owner C# kit/.editorconfig, Unity C#10/polyfill variant and TypeScript kit remain map fog. The one-project-guide and tooling-precedence contracts are decided. [Decision record](https://github.com/Hissal/skill-collection/issues/48#issuecomment-6371179357).

14. **Reference entry-point evolution / experiment outcomes.** Unity Option C is initial layout; separate assembly/serialization/lifecycle skills are only an evidence-led alternative. Gamedev prototyping may later become a skill. Trials have no automatic promotion/expiry; no outcome was decided for them. [Decision record](https://github.com/Hissal/skill-collection/issues/50#issuecomment-6426359993).

15. **Deferred domains / optional packs.** R3/UniTask, DOTS/ECS/Jobs/Burst/NFE, mobile/store/Unity release/backend operations, dedicated game/replay harnesses and verification generators, game publishing/full art pipelines, extras/writing/extending-agents packs remain deferred or ideas, not current membership. [Decision record](https://github.com/Hissal/skill-collection/issues/46#issuecomment-6346220677).

16. **Collection identity, fork future, split and migration.** Collection branding, fork disposition, publishable split boundaries, current-install cutover/status-line choice and other map ideas remain unresolved; none changes this catalog until decided. [Decision record](https://github.com/Hissal/skill-collection/issues/18#issuecomment-6108951944).

17. **Build-time evidence and runtime limits.** Final measured tripwires, resolver ownership/integration, gate parity, mixed-scope reachability, plugin naming, selective discovery/coexistence, portable references/notices and actual guard/freeze platform adapters require specification/implementation verification. These are not newly requested blueprint gates or proof that all checks already work. [Decision record](https://github.com/Hissal/skill-collection/issues/45#issuecomment-6219853780).

## Totals

| Part | Model-invoked | User-invoked | Skills |
|---|---:|---:|---:|
| core | 16 | 30 | 46 |
| unity | 6 | 0 | 6 |
| gamedev | 1 | 5 | 6 |
| csharp | 1 | 0 | 1 |
| web | 1 | 4 | 5 |
| in-progress | 1 | 10 | 11 |
| study | 1 | 1 | 2 |
| onboarding | 1 | 0 | 1 |
| **Collection total** | **28** | **50** | **78** |

Core reconstruction is **42 (14 model + 28 user) in #45 + risky-changes (model) + dependency-audit (user) + break-ui (user) in #49 + reviewing (model) in amended #74 = 46 (16 model + 30 user)**. architecture-review is one renamed identity, not another addition; teach was already removed from the #45 core census.

There are **7 decided packs**, containing **32 skills** (12 model-invoked, 20 user-invoked) beyond core. In-progress has ten user-invoked trials plus its guide; study adds teach plus study-guide; onboarding has the generated automatic guide alone.

Support inventory: **2 independent personal core always-on pieces** (steering source and command guard); the always-on table has six descriptive rows including their components and project configuration. Freeze enforcement is a component of the guard; freeze/unfreeze entry skills are already counted in core. No default always-on domain-pack piece is adopted. The separate support table has **10 non-skill machinery rows**. The vendor table has **19 conditional offer rows**, not 19 known external skill identities. These figures are intentionally not added together as one installed-item total.

**Supersession entries: 55. Open/undecided items: 17.**

## Source coverage and transcription limits

Read-only GitHub access used gh on Hissal/skill-collection: issue #1 body; resolution/comment records for #14, #15, #17, #18, #32, #34–#50, #53–#57, #62, #63, #71–#74; open #51/#59/#64/#75 checked for later decisions. The amended #74 comment, not its earlier shared-reference location, controls. #46's final consolidated resolution controls over its intermediate layout proposals; #50's final index and its linked accepted route/needs tables control over old names; #73's final ownership corrections control over unaccepted proposals. Relevant local sources: GLOSSARY.md, all four ADRs, every docs/agents/*.md file, research/themes.md and source-ledger identifiers, and hooks/command-guard README/rules/adapter/engine references. Earlier review reports were used only as cross-checks. This was not an upstream donor re-audit, execution test or acceptance of any review recommendation.

Current GLOSSARY definitions for Handoff, Project configuration and Personal delegation policy already reflect later decisions; ADR 0003 already reflects lookup/execution, setup discovery and generated dependencies; core-extension-points.md already uses architecture-review and the three web-added core needs. They need no fictitious reversal. The narrowed glossary Needs table definition and unqualified ADR sentences are listed above. research/themes.md explicitly labels its candidate entries as proposals, so its unresolved-looking candidate bullets are not recounted as adopted skills or an additional decision frontier.

Provenance shorthand in pack rows follows the deciding comments and pinned ledgers: Unity ledger A = tipoLi5890/unity-dev-skills, D = tea-x-random/unity-game-skills; gamedev ledger A = abagames/agentic-gamedev-skills, J = jammyfu/open-game-skills, W = gamedev-skills/awesome-gamedev-agent-skills; G3 = game-studio game-screen material in the ideas skim. Source pinning/licence records remain the ledgers’ and later vendor.lock’s job; this transcription does not invent new SHA pins or claim that an adapted skill was copied wholesale. Fork-pass seed is d5c5c97, tracked against mattpocock/skills 49dd158; the Unity resolution additionally inspected fork lifecycle material at 4f30320d4ac1c5d747eea1c02b97017529ed578b.

## Built-skill dependencies

The marked table below is generated from the current skill metadata; it covers
implemented skills only. The blueprint tables above record decisions awaiting
implementation, including optional routes and pack membership. Regenerate after
changing skill identity or requirements with
`node scripts/catalog/generate.js`.

<!-- BEGIN GENERATED DEPENDENCIES -->
| Skill ID | Callable / source | Hard requirements |
|---|---|---|
| `hissal.skill-collection/architecture-review` | [`architecture-review`](../skills/core/architecture-review/SKILL.md) | `hissal.skill-collection/reviewing` [`reviewing`](../skills/core/reviewing/SKILL.md) |
| `hissal.skill-collection/blast-radius` | [`blast-radius`](../skills/core/blast-radius/SKILL.md) | `hissal.skill-collection/verifying` [`verifying`](../skills/core/verifying/SKILL.md) |
| `hissal.skill-collection/break-ui` | [`break-ui`](../skills/core/break-ui/SKILL.md) | — |
| `hissal.skill-collection/code-review` | [`code-review`](../skills/core/code-review/SKILL.md) | `hissal.skill-collection/reviewing` [`reviewing`](../skills/core/reviewing/SKILL.md) |
| `hissal.skill-collection/codebase-design` | [`codebase-design`](../skills/core/codebase-design/SKILL.md) | — |
| `hissal.skill-collection/commenting` | [`commenting`](../skills/core/commenting/SKILL.md) | — |
| `hissal.skill-collection/csharp-guide` | [`csharp-guide`](../skills/packs/csharp/csharp-guide/SKILL.md) | — |
| `hissal.skill-collection/delegating` | [`delegating`](../skills/core/delegating/SKILL.md) | — |
| `hissal.skill-collection/dependency-audit` | [`dependency-audit`](../skills/core/dependency-audit/SKILL.md) | — |
| `hissal.skill-collection/diagnosing-bugs` | [`diagnosing-bugs`](../skills/core/diagnosing-bugs/SKILL.md) | — |
| `hissal.skill-collection/domain-modeling` | [`domain-modeling`](../skills/core/domain-modeling/SKILL.md) | — |
| `hissal.skill-collection/grill-with-docs` | [`grill-with-docs`](../skills/core/grill-with-docs/SKILL.md) | `hissal.skill-collection/domain-modeling` [`domain-modeling`](../skills/core/domain-modeling/SKILL.md), `hissal.skill-collection/grilling` [`grilling`](../skills/core/grilling/SKILL.md) |
| `hissal.skill-collection/grilling` | [`grilling`](../skills/core/grilling/SKILL.md) | — |
| `hissal.skill-collection/guide` | [`guide`](../skills/core/guide/SKILL.md) | — |
| `hissal.skill-collection/hillclimb` | [`hillclimb`](../skills/core/hillclimb/SKILL.md) | `hissal.skill-collection/verifying` [`verifying`](../skills/core/verifying/SKILL.md) |
| `hissal.skill-collection/how` | [`how`](../skills/core/how/SKILL.md) | — |
| `hissal.skill-collection/implement` | [`implement`](../skills/core/implement/SKILL.md) | — |
| `hissal.skill-collection/implement-spec` | [`implement-spec`](../skills/core/implement-spec/SKILL.md) | — |
| `hissal.skill-collection/migrating` | [`migrating`](../skills/core/migrating/SKILL.md) | — |
| `hissal.skill-collection/onboarding-guide` | [`onboarding-guide`](../skills/packs/onboarding/onboarding-guide/SKILL.md) | — |
| `hissal.skill-collection/pr` | [`pr`](../skills/core/pr/SKILL.md) | — |
| `hissal.skill-collection/prototype` | [`prototype`](../skills/core/prototype/SKILL.md) | — |
| `hissal.skill-collection/receiving-review` | [`receiving-review`](../skills/core/receiving-review/SKILL.md) | — |
| `hissal.skill-collection/refactoring` | [`refactoring`](../skills/core/refactoring/SKILL.md) | — |
| `hissal.skill-collection/research` | [`research`](../skills/core/research/SKILL.md) | — |
| `hissal.skill-collection/retro` | [`retro`](../skills/core/retro/SKILL.md) | — |
| `hissal.skill-collection/reviewing` | [`reviewing`](../skills/core/reviewing/SKILL.md) | — |
| `hissal.skill-collection/risky-changes` | [`risky-changes`](../skills/core/risky-changes/SKILL.md) | — |
| `hissal.skill-collection/second-opinion` | [`second-opinion`](../skills/core/second-opinion/SKILL.md) | `hissal.skill-collection/reviewing` [`reviewing`](../skills/core/reviewing/SKILL.md) |
| `hissal.skill-collection/session-report` | [`session-report`](../skills/core/session-report/SKILL.md) | — |
| `hissal.skill-collection/setup-project` | [`setup-project`](../skills/core/setup-project/SKILL.md) | — |
| `hissal.skill-collection/tdd` | [`tdd`](../skills/core/tdd/SKILL.md) | — |
| `hissal.skill-collection/test-review` | [`test-review`](../skills/core/test-review/SKILL.md) | `hissal.skill-collection/reviewing` [`reviewing`](../skills/core/reviewing/SKILL.md) |
| `hissal.skill-collection/to-questionnaire` | [`to-questionnaire`](../skills/core/to-questionnaire/SKILL.md) | — |
| `hissal.skill-collection/to-spec` | [`to-spec`](../skills/core/to-spec/SKILL.md) | — |
| `hissal.skill-collection/to-tickets` | [`to-tickets`](../skills/core/to-tickets/SKILL.md) | — |
| `hissal.skill-collection/triage` | [`triage`](../skills/core/triage/SKILL.md) | — |
| `hissal.skill-collection/unity-debugging` | [`unity-debugging`](../skills/packs/unity/unity-debugging/SKILL.md) | `hissal.skill-collection/unity-guide` [`unity-guide`](../skills/packs/unity/unity-guide/SKILL.md) |
| `hissal.skill-collection/unity-guide` | [`unity-guide`](../skills/packs/unity/unity-guide/SKILL.md) | — |
| `hissal.skill-collection/unity-networking` | [`unity-networking`](../skills/packs/unity/unity-networking/SKILL.md) | — |
| `hissal.skill-collection/unity-prototyping` | [`unity-prototyping`](../skills/packs/unity/unity-prototyping/SKILL.md) | `hissal.skill-collection/unity-guide` [`unity-guide`](../skills/packs/unity/unity-guide/SKILL.md) |
| `hissal.skill-collection/unity-testing` | [`unity-testing`](../skills/packs/unity/unity-testing/SKILL.md) | `hissal.skill-collection/unity-guide` [`unity-guide`](../skills/packs/unity/unity-guide/SKILL.md) |
| `hissal.skill-collection/unity-verification` | [`unity-verification`](../skills/packs/unity/unity-verification/SKILL.md) | `hissal.skill-collection/unity-guide` [`unity-guide`](../skills/packs/unity/unity-guide/SKILL.md) |
| `hissal.skill-collection/verifying` | [`verifying`](../skills/core/verifying/SKILL.md) | — |
| `hissal.skill-collection/wait-what` | [`wait-what`](../skills/core/wait-what/SKILL.md) | — |
| `hissal.skill-collection/wayfinder` | [`wayfinder`](../skills/core/wayfinder/SKILL.md) | — |
| `hissal.skill-collection/why` | [`why`](../skills/core/why/SKILL.md) | — |
| `hissal.skill-collection/wizard` | [`wizard`](../skills/core/wizard/SKILL.md) | — |
| `hissal.skill-collection/writing-for-agents` | [`writing-for-agents`](../skills/core/writing-for-agents/SKILL.md) | — |
<!-- END GENERATED DEPENDENCIES -->
