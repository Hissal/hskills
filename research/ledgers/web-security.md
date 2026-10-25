# Ledger: web security skills

Ticket: [Ledger: web security skills](https://github.com/Hissal/skill-collection/issues/69), part of [the wayfinder map](https://github.com/Hissal/skill-collection/issues/1), feeding [Theme: web pack](https://github.com/Hissal/skill-collection/issues/49).

Read on 2026-10-25 through `gh api` and raw responses. Nothing from a source was installed or executed: no scanner, launcher, hook, collector, build, workflow or eval ran. Descriptions of execution are **source-reading findings**, not runtime verification. Vocabulary follows [`GLOSSARY.md`](../../GLOSSARY.md); harness facts and the cost method follow [`loading-mechanics.md`](../loading-mechanics.md). Every recommendation below is **proposed**; the owner decides.

## Sources and scope

All four HEADs still equal their [discovery-sweep](../web-pack-discovery.md) pins. Links below use the full immutable SHA. An unchanged pin does not establish that the sweep described every file correctly.

| Source | SHA read; commit date | Scope read | Licence |
|---|---|---|---|
| `openai/plugins`, `plugins/codex-security` | [`0722921`][o-root]; 2026-10-08 | All 15 skill frontmatters and workflow/contract sections; threat-model, triage, fix, verify-fix, patch-risk, policy and tracking bodies; scan, storage, core-audit and threat-model references; manifests, all 15 `agents/openai.yaml`, capability profiles and Windows launcher. Other reference files were inspected selectively. Bundled MCP implementation, compressed parts, Python implementation and schemas were not audited | No repo-level licence found, **but plugin manifest explicitly says `Proprietary`**. Third-party native notices do not license the skill prose ([manifest][o-manifest], [native notices][o-notices]) |
| `trailofbits/skills` | [`196a907`][t-root]; 2026-10-23 | Seven target `SKILL.md` bodies/frontmatters; Semgrep workflow and scan principles, CodeQL build/quality excerpts, SARIF processing, variant references, fp-check gates and hooks, agentic Actions methodology; `insecure-defaults` README, command, manifest and corpus outlines. No scripts or workflows executed; collector/scanner implementations and full category corpora not audited | [CC-BY-SA-4.0][t-license]: **ideas only**, per owner's rule |
| `agamm/claude-code-owasp` | [`8ac7965`][a-root]; 2026-09-25 | Skill, review checklist, config/supply-chain reference, JS/TS language section, report outline and standards tables, both manifests, licence, all five eval prompts and selected graders. Other language sections and the long worked-example report were not read end to end | [MIT][a-license], copyright 2026; preserve the actual notice. Its digest is not the authority for the standards it cites |
| `wshobson/agents`, `plugins/security-scanning` | [`0874a27`][w-root]; 2026-10-17 | All five skills and their four modeling references; Claude/Codex manifests, root licence, threat-modeling agent and three bundled commands. A read-only helper independently inspected this source; parent synthesis distinguishes the examples from measured results | [MIT][w-license], copyright 2024 Seth Hobson |

Primary-source spot checks for the OWASP digest: [ASVS V6][asvs-v6] and [licence][asvs-license] at `2b47a9dd16760ee484a6672d197f1f7e25d9c632`; the official [legacy LLM project redirect][llm-index] at `99f4395589bdbd120ae961f9cd179e79d7f9b27f`; and the canonical 2026 [Excessive Agency][llm-agency], [Hidden Context Exposure][llm-hidden] and [Improper Output Handling][llm-output] at `9253e38ade58e959b531c0c5c9a4842272c9cd0e`. These confirm the selected IDs, names and password requirements, **not the entire digest**. The ASVS text is itself CC-BY-SA: do not assume the wrapper's MIT notice makes copied standard text permissive.

## Fixed context and overlap

The pack exists, covers the whole web app, has a TypeScript baseline and is framework-neutral. One model-invoked `web-guide` owns disclosed references answering core extension points; skills layer on top. Official vendor skills are selected per project, never duplicated. Team use is a reason to consider ownership, CI and sustained finding management; pack breadth is not a reason to reject a candidate.

The owner has already chosen **all of Addy's `security-and-hardening`, its hardening-pattern reference and security checklist**, opening with trust boundaries (including LLM output), assets, STRIDE per boundary and abuse cases as first tests, followed by web controls and Always / Ask First / Never tiers ([procedure][addy-skill], [patterns][addy-patterns], [checklist][addy-checklist]; [Addy ledger entry 37](addy-agent-skills.md#37-security-and-hardening)). This ledger proposes additions to that reference, not a replacement or a new security router. Whether the threat-model procedure also belongs in core waits on the closing review.

Secrets protection is also decided: web `SETUP.md` offers ported `protect-secrets` cases as project rule data for the **core cross-harness Node command guard**. Projects may add restrictions and never loosen core. [Hook ledger entry 4](hook-collections.md#4-protect-secrets) is prior research, not an undecided alternative here. None of these sources justifies another secrets hook. `security-guidance` is already rejected for failing the hook gates: it is not silent, pays for model calls per stop and installs software ([earlier entry 16](anthropic-marketplace-plugins.md#16-security-guidance)).

Existing jobs matter:

- Core `code-review` already owns Standards/Spec review ([fork ledger](mattpocock-skills-unity.md#code-review)); `verifying`, `blast-radius`, `tdd`, triage and the spec/ticket flow own evidence, change impact, tests and work tracking. Security knowledge should answer their extension points before another workflow earns a name.
- The harness already ships `/security-review` (owner-provided fact; no claim of equivalent coverage or runtime comparison). [Sentry security review](maintenance-tooling.md) and Anthropic `claude-security` are further prior candidates.
- The [frontend ledger](web-frontend-skills.md) proposes browser checks and UI review, but explicitly leaves security and the server half uncovered. Browser content remains untrusted; UI stress tests do not establish authorization or tenant isolation.
- Five Trail of Bits skills already have [ideas-only entries T1–T5](ideas-skim.md): `second-opinion`, `property-based-testing`, `mutation-testing`, `sharp-edges`, `differential-review`. They are not re-ledgered. The new variant and verification entries below state their incremental contribution. Unity's vendor baseline does not supply these web security jobs.

**Idle cost method.** Frontmatter description characters, folded across YAML lines, divided by 2.6 plus about 5 tokens for the name, rounded; `when_to_use` counted separately where present. These are estimates using the repo's measured ratio, not live harness measurements. The sweep used chars/4, so its estimates differ even where the SHA is unchanged. All 15 Codex Security YAMLs leave implicit invocation enabled (one explicitly sets true); prose saying “only when asked” is not an invocation gate. Their descriptions total **~1,754 tokens**. The seven ToB skill descriptions total **~1,450**; its command-only `insecure-defaults` has no skill description. Wshobson's five total **~389**, excluding its agents and commands. OWASP has a 455-character description (**~180**) plus a 351-character `when_to_use` (**~135** on Claude). Proposed user-invoked workflows need real gates on every supported harness; their idle cost is 0. Guide reference additions add no separate description, though they cost context when read. The 1,000-token pack tripwire prompts review, not automatic rejection.

## Synthesis (proposed)

**31 entries**: O1–O16 cover every Codex Security skill plus its packaging; T1–T8 cover the seven unledgered ToB skills and the command-only defaults auditor; A1–A2 cover OWASP's skill/reference set and eval mechanism; W1–W5 cover the five security-scanning skills. Bundled wshobson commands are examined as install hazards under W5, not additional adoption candidates.

The strongest additions are a small evidence contract for findings (source → control → sink, counterevidence, unresolved proof gaps), optional AND/OR attack trees for compound threats, and threat → invariant → control → acceptance-test traceability. Addy keeps ownership of the reference and its opening order. Proposed workflows worth the owner's comparison are **a user-invoked dependency audit** and **one user-invoked finding assessment** supporting triage and fix verification; names and whether they need separate skills remain open. Do not install any source wholesale or build fifteen security phase skills.

For dependency audits, distinguish the exact lockfile version from a declared range/latest release, assessed-clean from unassessable, and registry publish rights from GitHub contributors. For scanner use, prefer an existing project CI/toolchain and record extraction/rule coverage before interpreting zero findings. The references can explain those limits without shipping or automatically installing scanners.

### Conflicts to resolve when adapting

| Conflict | Source evidence | Proposed treatment |
|---|---|---|
| A visible source is not necessarily copyable | Codex manifest says `Proprietary` [O16][o-manifest]; ToB is CC-BY-SA [licence][t-license] | Ideas only for both. Permissive OWASP/wshobson material may use copy-with-provenance and notices; independently verify standard text provenance |
| Prose opt-in versus actual invocation gate | Codex descriptions restrict invocation but YAMLs lack `allow_implicit_invocation: false` (e.g. [verify-fix YAML][o-verify-yaml]) | Real cross-harness gates for expensive standalone workflows; do not claim zero idle cost from wording |
| Incomplete evidence versus a false finding | ToB [fp-check gates][t-fp-gates] make any failed gate FALSE POSITIVE; [insecure-defaults][t-defaults] refutes incomplete traces. Codex [triage][o-triage] and OWASP [rubric][a-skill] retain uncertainty | Preserve an inconclusive/needs-review state; missing proof is neither a vulnerability nor disproof |
| Scope and severity policy can hide real boundary failures | ToB fp-check's impact gate names RCE, privilege escalation or disclosure; Addy explicitly covers resource abuse. Codex separates severity from final policy suppression ([attack paths][o-attack]) | Include integrity and availability/denial-of-wallet threats. Keep factual validity, severity and owner-accepted risk separate |
| Scanner setup and remote rules versus pinned evidence | Wshobson runs installation and `--config=auto`; ToB Semgrep fetches registry/third-party rules but disables metrics ([W5][w-sast], [T2][t-semgrep]) | Existing project tools first; record exact tool/ruleset versions and network scope. No auto-install as a side effect of reading a reference |
| Approval differs even within a source | ToB Semgrep skill insists on a second approval, its workflow treats invocation as opt-in [skill][t-semgrep]; wshobson's hardening command begins scanning before its checkpoint [command][w-hardening] | Bind scope and actions to the user's authorization and the decided tiers; do not inherit redundant approval loops or implicit mutation authority |
| Logging evidence can disclose secrets | Addy's checklist pipes staged content into a matching grep [checklist][addy-checklist]; OWASP's checklist says log all exceptions but also exclude credentials [checklist][a-checklist] | Preserve the selected coverage while adapting commands to report paths/rule IDs and redacted evidence. Never print credential values; project guard rules still apply |
| OWASP edition drift | Addy's procedure calls Insecure Design `A04`; agamm uses `A06:2025` [skill][a-skill]. The 2026 LLM numbering changes Excessive Agency to LLM03 and output handling to LLM10 [official][llm-agency], [official][llm-output] | Keep Addy's procedure, refresh edition labels and cite an edition plus risk name. Selected 2026 checks succeeded; do not reject a correct new ID from memory |
| Templates look more authoritative than their evidence | Wshobson attack-tree difficulty uses both max and sum; mitigation “risk reduction” averages declared coverage [W2][w-tree-ref], [W3][w-mitigate-ref] | Use qualitative structure and explicit assumptions; no pseudo-measured probabilities or efficacy claims |
| Windows support is uneven | Codex ships a [.cmd launcher][o-launch]; ToB scanner recipes use Bash, jq and uv; wshobson examples use pip/Bash | Codex is not simply “Unix-only”; none was tested here. Re-author any adopted workflow for PowerShell/project commands and verify it later |

---

## OpenAI Codex Security

All O entries are **ideas only** because the plugin declares `Proprietary`. Each proposed merge below means independently authoring the behavior, not copying source prose or code. Its managed artifacts/MCP are part of the product, not a portable text-only skill library.

### O1. `threat-model`

- **What it is.** Creates or reuses a source-backed repository model; caches are bound to repository/version and bypassed for supplied context or narrower scope. The [skill][o-threat] and [reference][o-threat-ref] distinguish architecture facts, deployment assumptions, hypotheses and findings.
- **Kind**: skill.
- **Proposed address**: web pack, reference owned by model-invoked `web-guide`.
- **Why it could fit.** Actual enforcing controls, derived resource locations and caller authority deepen Addy's boundary map; team deployments have materially different modes.
- **Why it might not.** Cached models, workbench checkpoints and an independent architecture reviewer are much more machinery than a per-feature first pass.
- **Copy / adapt / idea-only**: idea-only; add evidence and freshness fields, preserving Addy's STRIDE-per-boundary and abuse-test opening.
- **Overlap**: Addy 37 already owns this job; closing review owns any core extraction.
- **Idle context cost**: 293 chars, ~118 tokens published; 0 separate tokens proposed.
- **Recommendation (proposed)**: merge evidence, assumptions and refresh-on-change ideas into the decided reference; reject a second threat-model entry skill.

### O2. `security-scan`

- **What it is.** A single-pass repository or scoped-path audit, preserving source scope, threat model, findings and coverage; its [skill][o-scan] reads the [core audit][o-core], with host-dependent finalization and explicit Windows scope handling.
- **Kind**: skill.
- **Proposed address**: possible web pack user-invoked workflow, if an uncovered need is established.
- **Why it could fit.** Scope-bound whole-app audits cover surfaces beyond a diff and can matter before release.
- **Why it might not.** Mandatory managed storage/MCP ownership couples the flow to Codex Security; installing the whole product duplicates existing review entry points.
- **Copy / adapt / idea-only**: idea-only; retain honest reviewed/unreviewed coverage, independently author any integration.
- **Overlap**: host `/security-review`, core `code-review`, Addy checklist; none proves equivalent whole-repo coverage.
- **Idle context cost**: 268 chars, ~108 published; user-invoked 0.
- **Recommendation (proposed)**: no collection scan skill yet; compare the host workflow against whole-repo needs, retaining its coverage contract as a reference idea.

### O3. `deep-security-scan`

- **What it is.** [Repeated independent complete Standard scans][o-deep], aggregated by a coordinator with persistent scan identity, resumability and one parent completion; excludes diffs.
- **Kind**: skill.
- **Proposed address**: none as a separate collection skill.
- **Why it could fit.** Independent passes can expose variance on a large team's high-risk app.
- **Why it might not.** Repeated full audits multiply cost, and the coordinator/MCP contract cannot be reproduced by copying instructions. Independent agreement still is not proof.
- **Copy / adapt / idea-only**: idea-only; any repetition must be an explicit requested audit, with scope, actual worker count and unfinished coverage reported.
- **Overlap**: core cross-model review, ToB second-opinion T1 in the ideas skim, `verifying`.
- **Idle context cost**: 400 chars, ~159 published; 0 proposed.
- **Recommendation (proposed)**: reject a separate deep-scan skill; retain bounded independent-pass ideas for the existing review workflow.

### O4. `security-diff-scan`

- **What it is.** [Reviews a PR, commit, branch or working-tree patch][o-diff]: bind target, model repository, inventory changed files, discover, validate, trace attack paths, finalize coverage and SARIF.
- **Kind**: skill.
- **Proposed address**: security reference used by core `code-review`, rather than another review command.
- **Why it could fit.** Deleted baseline files, supporting unchanged code and deferred candidates prevent a superficial changed-lines-only pass.
- **Why it might not.** Phase invocations and candidate tools require this product; a second default review path adds orchestration overlap.
- **Copy / adapt / idea-only**: idea-only; distinguish diff scope from repository-model scope and retain every unresolved candidate.
- **Overlap**: core `code-review`, host `/security-review`, ToB differential-review already skimmed (T5), `blast-radius`.
- **Idle context cost**: 95 chars, ~42 published; 0 separate proposed.
- **Recommendation (proposed)**: merge scope and unresolved-coverage ideas into security review guidance; reject a duplicate entry point.

### O5. `finding-discovery`

- **What it is.** [Collects plausible candidates][o-discovery] with controlled source, broken control/sink, preconditions, source evidence and exact location roles, leaving final severity to a later stage.
- **Kind**: skill.
- **Proposed address**: web pack guide reference.
- **Why it could fit.** Separating a suspicion from a validated finding reduces premature certainty and keeps independent affected operations visible.
- **Why it might not.** Its scan ledgers and compact-diff tool protocol are internal phase machinery.
- **Copy / adapt / idea-only**: idea-only; use a small candidate record, not the workbench schema.
- **Overlap**: core review already produces findings; A1 supplies a permissive source-to-sink rubric.
- **Idle context cost**: 266 chars, ~107 published; 0 separate proposed.
- **Recommendation (proposed)**: merge the candidate-versus-finding distinction into the reference; reject a standalone phase skill.

### O6. `validation`

- **What it is.** [Assesses each candidate][o-validation] against an explicit rubric, using static evidence or a bounded PoC/dynamic check and preserving exact proof gaps when execution is unavailable.
- **Kind**: skill.
- **Proposed address**: web pack user-invoked finding-assessment candidate, sharing a reference with core `verifying`.
- **Why it could fit.** Security claims need stronger evidence than an unsafe-looking API; unperformed checks stay visible.
- **Why it might not.** PoC/build execution and scan artifacts require environment and authorization boundaries; copying a phase can imply authority the caller never supplied.
- **Copy / adapt / idea-only**: idea-only; source/static/runtime evidence and inconclusive outcomes must remain distinct.
- **Overlap**: core `verifying`, O8 triage, O10 fix verification, T6 fp-check, A1 rubric.
- **Idle context cost**: 259 chars, ~105 published; user-invoked 0.
- **Recommendation (proposed)**: merge into one finding-assessment candidate; do not create a validation phase skill.

### O7. `attack-path-analysis`

- **What it is.** [Turns candidates into attacker stories][o-attack], explicitly checking exposure, privileges, preconditions and strongest counterevidence before severity calibration and policy suppression.
- **Kind**: skill.
- **Proposed address**: guide security reference.
- **Why it could fit.** Separating source facts, severity and accepted risk helps a team review why a claim survived or was suppressed.
- **Why it might not.** Its mechanical severity policy is product-specific; absence of deployment evidence cannot automatically suppress a reachable library boundary.
- **Copy / adapt / idea-only**: idea-only; retain the three reasoning stages, not the product's policy matrix.
- **Overlap**: Addy STRIDE/abuse cases, A1 triage, W2 attack trees (a different, pre-finding planning tool).
- **Idle context cost**: 269 chars, ~108 published; 0 separate proposed.
- **Recommendation (proposed)**: merge attacker-path and counterevidence fields into the reference; reject a separate phase skill.

### O8. `triage-finding`

- **What it is.** [Read-only static assessment of supplied findings][o-triage] from scanners, advisories or tickets; retains one verdict per input, with confirmed, not-actionable and needs-review queues and exploitability ranking.
- **Kind**: skill.
- **Proposed address**: web pack user-invoked finding assessment, name open.
- **Why it could fit.** Team apps receive findings from several systems; source-backed dismissal and explicit unknowns prevent alert noise from hiding real work.
- **Why it might not.** Connector intake and a dedicated JSON contract duplicate project tracker knowledge; static confirmation is not runtime proof.
- **Copy / adapt / idea-only**: idea-only; use project tracker facts, preserve source/local version mismatches and route fixes only when requested.
- **Overlap**: core triage, `verifying`, T6, A1; adds security-specific actor/control/sink assessment.
- **Idle context cost**: 274 chars, ~110 published; user-invoked 0.
- **Recommendation (proposed)**: retain as the main workflow candidate, merged with O6/O10 rather than three new skills; owner's call whether core triage plus reference suffices.

### O9. `fix-finding`

- **What it is.** [Re-establishes the original vulnerability][o-fix], permits no-change for already-safe code, patches the shared boundary and challenges sibling bypasses plus legitimate behavior before checks.
- **Kind**: skill.
- **Proposed address**: guide security reference reached by the core implementation/test workflow.
- **Why it could fit.** A negative control and a legitimate control prevent a patch that merely blocks the reproducer or breaks valid callers.
- **Why it might not.** Workbench remediation stages and the dedicated patch contract repeat existing implementation and review ownership.
- **Copy / adapt / idea-only**: idea-only; independently state a security regression criterion and keep scope on the actual invariant.
- **Overlap**: core `tdd`, `code-review`, `verifying`; T5 variant analysis; O10 verification.
- **Idle context cost**: 255 chars, ~103 published; 0 separate proposed.
- **Recommendation (proposed)**: merge bypass/legitimate-control checks into the reference; reject a parallel fix workflow.

### O10. `verify-fix`

- **What it is.** [Standalone read-only fix verification][o-verify], following moved code and the original exploit through current controls, with fixed, still-vulnerable or inconclusive outcomes. Closed tickets and unrelated passing tests are insufficient.
- **Kind**: skill.
- **Proposed address**: web pack user-invoked finding assessment, with verification as a stated task.
- **Why it could fit.** Independent evidence of boundary closure matters when a teammate or external contributor supplies a patch.
- **Why it might not.** A distinct JSON-only entry skill is unnecessary beside core `verifying`; the source forbids modifying the repository even for validation.
- **Copy / adapt / idea-only**: idea-only; preserve explicit verification scope, current revision and legitimate behavior evidence.
- **Overlap**: core `verifying`, receiving-review rules, O6/O8, T6.
- **Idle context cost**: 308 chars, ~123 published; user-invoked 0.
- **Recommendation (proposed)**: merge with O8's finding-assessment candidate and the guide reference; no standalone verify-fix skill.

### O11. `assess-patch-risk`

- **What it is.** [Binds immutable patch bytes][o-risk] and separates impact, regression likelihood, test protection, recoverability and confidence; advisory merge/hold labels never grant merge authority.
- **Kind**: skill.
- **Proposed address**: possible core `blast-radius` / `verifying` reference merge, outside the web catalog decision.
- **Why it could fit.** Tests can reduce likelihood without reducing the damage if wrong; bounded evidence holds make risk review actionable.
- **Why it might not.** Auto-merge eligibility, a schema and bundled validator are a new policy surface, not a web-specific need.
- **Copy / adapt / idea-only**: idea-only; offer the five dimensions to the closing review, not a scanner-derived merge policy.
- **Overlap**: core `blast-radius`, `verifying`, `why`; davidondrej risky-changes remains a web candidate with different live-data emphasis.
- **Idle context cost**: 357 chars, ~142 published; 0 separate proposed.
- **Recommendation (proposed)**: reject a web skill; offer the risk-dimension distinction to the closing review for existing core workflows.

### O12. `propose-security-hardening`

- **What it is.** [Builds a portfolio of structural options][o-hardening] from evidence: current architecture, desired invariants, materially different alternatives, tradeoffs, rollout/rollback and a selected implementation plan.
- **Kind**: skill.
- **Proposed address**: guide reference used during core design/spec work.
- **Why it could fit.** Repeated vulnerability families can justify a structural fix beyond patching every occurrence; teams need migration costs and ownership.
- **Why it might not.** A long portfolio and diagrams for every finding can exceed the need; automatic post-scan invocation would become an expensive chain.
- **Copy / adapt / idea-only**: idea-only; require an actual request for systemic alternatives and retain source drift checks before implementation.
- **Overlap**: core `codebase-design`, `grilling`, spec flow, W3 mitigation mapping, Addy hardening.
- **Idle context cost**: 597 chars, ~235 published; 0 separate proposed.
- **Recommendation (proposed)**: merge option/tradeoff questions into the reference; reject a separate hardening workflow.

### O13. `define-security-policy`

- **What it is.** [Creates reviewed root/scoped security guidance][o-policy] covering actors, supported surfaces, invariants and accepted risk. It distinguishes scanner guidance from `.github/SECURITY.md` disclosure information.
- **Kind**: skill.
- **Proposed address**: web pack setup/reference; project configuration holds the facts.
- **Why it could fit.** Team reviewers need explicit deployment and trust assumptions, and accepted risk must come from an owner.
- **Why it might not.** A scanner-specific `SECURITY.md` hierarchy can confuse existing disclosure files and silently suppress findings if treated as command authority.
- **Copy / adapt / idea-only**: idea-only; ask for existing policy locations, ownership and supported boundaries without prescribing a new hierarchy or accepted risks.
- **Overlap**: project configuration rule, `setup-project`, Addy's Ask First tiers, core domain docs.
- **Idle context cost**: 259 chars, ~105 published; 0 separate proposed.
- **Recommendation (proposed)**: merge policy-location and assumption fields into web `SETUP.md`; reject a separate policy authoring skill.

### O14. `track-findings`

- **What it is.** [Tracks validated findings][o-track] in issues or draft advisories, binding source identity, destination/audience and reviewed payload, checking duplicates and reconciling uncertain writes before retrying.
- **Kind**: skill.
- **Proposed address**: project tracker convention plus guide security reference.
- **Why it could fit.** Batches, ownership and disclosure audience matter in teams; accepted writes and failed readback must stay distinct.
- **Why it might not.** Linear/Jira/GitHub adapters duplicate existing tracker setup, and public issue publication is inappropriate for some vulnerabilities.
- **Copy / adapt / idea-only**: idea-only; preserve destination/audience, redaction, source revision and retry reconciliation as requirements, using the project's tracker.
- **Overlap**: core triage/tickets/PR workflows and issue-tracker docs; this adds disclosure-sensitive handling.
- **Idle context cost**: 202 chars, ~83 published; 0 separate proposed.
- **Recommendation (proposed)**: merge disclosure and duplicate/retry checks into tracking guidance; reject an additional multi-tracker skill.

### O15. `vulnerability-writeup`

- **What it is.** [Produces one evidence-backed report per vulnerability][o-writeup], checking actual attacker prerequisites, source, affected/fixed releases and real versus unperformed PoCs; requires delegated drafting and independent acceptance.
- **Kind**: skill.
- **Proposed address**: guide reference for vulnerability reports.
- **Why it could fit.** Verified versions, negative controls and a causal attack narrative are useful when communicating with a team's maintainers or a vendor.
- **Why it might not.** Mandatory worker-per-finding campaigns, prescribed actors/voice and disclosure packaging are a specialist workflow rather than every web review's output.
- **Copy / adapt / idea-only**: idea-only; retain evidence/impact/version fields and keep unobserved results explicit, without its prose template.
- **Overlap**: core writing/research evidence rules, O14, A1 report format.
- **Idle context cost**: 262 chars, ~106 published; 0 separate proposed.
- **Recommendation (proposed)**: merge report acceptance criteria into the reference; defer a standalone disclosure workflow until requested.

### O16. Plugin packaging, managed artifacts and capability preflight

- **What it is.** [Codex plugin 0.1.32][o-manifest] bundles an [MCP server declaration][o-mcp], [capability profiles][o-preflight], native libraries, launchers and persistent workbench artifacts. [Storage policy][o-storage] requires its tools for retained output and makes missing MCP a blocker over older shell fallbacks.
- **Kind**: manifest-packaging / script.
- **Proposed address**: none as a collection install.
- **Why it could fit.** Durable target/revision identity, interrupted-scan checkpoints and partial coverage are sound requirements for long audits.
- **Why it might not.** Proprietary licensing and product-owned state/credentials/tool contracts; copying skill folders alone cannot implement them. Windows launcher presence proves source support intent, not successful operation here.
- **Copy / adapt / idea-only**: idea-only; do not copy bundled binaries, validators or source. An external product trial is a separate owner's decision.
- **Overlap**: maintenance provenance/gating, core handoff and `verifying`; no need for another always-on mechanism.
- **Idle context cost**: ~1,754 description tokens for all 15 skills, plus MCP listing and runtime output (not measured); no source hook appears in this plugin subtree.
- **Recommendation (proposed)**: reject wholesale installation as part of the collection; retain state/coverage requirements as ideas and flag explicit proprietary status.

## Trail of Bits: new web-relevant candidates

All T entries are **ideas only**, following the owner's CC-BY-SA rule. No source prose, query, corpus, script or test fixture is proposed for copying or close adaptation.

### T1. `supply-chain-risk-auditor`

- **What it is.** [Audits dependency metadata][t-supply]: exact-version advisories, abandoned/archived repositories, npm publish-right concentration and install scripts. It instructs a Python/uv collector and renderer, not an install of the target dependencies. Supported lockfiles include npm package-lock/shrinkwrap, uv and Go; **pnpm, Yarn and Poetry lockfiles are not parsed**.
- **Kind**: skill / script.
- **Proposed address**: web pack user-invoked dependency audit; supporting knowledge in the guide.
- **Why it could fit.** Transitive/version-matched advisory coverage and measured provenance are substantial additions to Addy's native-audit-before-release rule, useful to a team choosing packages.
- **Why it might not.** Registry/network credentials and tool prerequisites; partial lockfile support is a major gap for TypeScript projects. No dependency-source analysis or licence-compliance audit is claimed.
- **Copy / adapt / idea-only**: idea-only; use already-configured native audit tools or independently authored collection logic, with exact-version, unsupported-lockfile and unassessable states. Do not port its collector.
- **Overlap**: Addy security checklist/supply chain, A1 config reference, project dependency CI; neither secret guards nor SAST answer maintainer/publisher risk.
- **Idle context cost**: 367 chars, ~146 published; user-invoked 0.
- **Recommendation (proposed)**: retain a dependency-audit workflow candidate built independently, explicitly supporting the project's actual package manager; reject the source install/copy.

### T2. `static-analysis/semgrep`

- **What it is.** [Detects languages, selects rules and requests plan approval][t-semgrep], then instructs a Bash runner to batch scans and merge SARIF. Requires metrics-off, records failed/skipped/partial/covered-nothing scans, distinguishes OSS from Pro and provides a separate no-second-approval workflow.
- **Kind**: skill / script.
- **Proposed address**: web pack guide scanner reference; possible user-invoked tool integration only for projects that select Semgrep.
- **Why it could fit.** An explicit coverage ledger prevents failed rules or unscanned large files from masquerading as a clean audit; existing Semgrep CI is preferred by the source itself.
- **Why it might not.** Third-party rules are mandatory and fetched; scripts, Bash/jq/uv and Pro capabilities are dependencies. The source's “250% more true positives” statement is not validated here.
- **Copy / adapt / idea-only**: idea-only; record actual tool/engine/ruleset versions, failures and excluded files, using the project's configured scan command. No borrowed runner or rules.
- **Overlap**: O2/O4 coverage, W5 configuration, `verifying`; SAST output still requires T6/A1 claim assessment.
- **Idle context cost**: 707 chars, ~277 published; reference 0.
- **Recommendation (proposed)**: merge scanner-coverage and telemetry checks into the reference; defer a Semgrep workflow to a project that uses it, rather than mandate a scanner.

### T3. `static-analysis/codeql`

- **What it is.** [Builds/reuses a CodeQL database and selects suites][t-codeql], with extraction-quality checks, explicit suite validation, project wrapper source/sink models and SARIF output. [Build workflow][t-codeql-build] can clean/build, repair setup and install dependencies; JS/TS follows its no-build extraction route.
- **Kind**: skill / script.
- **Proposed address**: guide scanner reference, vendor/tool knowledge layered per project.
- **Why it could fit.** A successful database build can extract little useful source; query selection and custom wrappers also bound what zero findings means.
- **Why it might not.** Bash helpers, CodeQL/tool prerequisites, query licences and build-side effects need project-specific handling; compiled-language repair should not silently alter an audited checkout.
- **Copy / adapt / idea-only**: idea-only; independently require extraction/suite diagnostics and record the exact revision, tool, build mode and missing models. Use official CodeQL knowledge for implementation.
- **Overlap**: T2 coverage, T4 results, core `verifying`; C# projects may also benefit, without making CodeQL part of core or Unity's baseline.
- **Idle context cost**: 751 chars, ~294 published; reference 0.
- **Recommendation (proposed)**: merge extraction/query-quality criteria into the reference; reject the copied build/repair workflow and defer integration to project tooling.

### T4. `static-analysis/sarif-parsing`

- **What it is.** [Reads existing SARIF][t-sarif]: validates shape, resolves a result's effective level through its rule/default, normalizes paths, deduplicates and preserves tool metadata. Includes jq/Python recipes and CI upload/gate examples.
- **Kind**: skill / script.
- **Proposed address**: guide scanner-results reference, potentially a disclosed tool-specific reference.
- **Why it could fit.** Filtering only `result.level` can miss inherited severity; malformed or partial results should not become a passing security gate.
- **Why it might not.** SARIF severity levels are not proof of exploitability or a universal risk rating. Upload and fail-CI policies belong to the project; large parsing/query bodies do not earn a separate trigger.
- **Copy / adapt / idea-only**: idea-only; author a small parsing contract against the SARIF specification and chosen tool rather than copy utilities.
- **Overlap**: T2/T3 outputs, O8 triage, maintenance report parsing; no overlap with UI/browser verification.
- **Idle context cost**: 373 chars, ~148 published; reference 0.
- **Recommendation (proposed)**: merge effective-level, provenance and coverage requirements into results guidance; reject a standalone SARIF skill.

### T5. `variant-analysis`

- **What it is.** [Starts from one known bug][t-variant], extracts its root cause, calibrates an exact match, generalizes one element at a time and triages each match. The bundled workflow expands axes in parallel; references separate searching from report writing.
- **Kind**: skill.
- **Proposed address**: guide security reference; optional user-invoked broader hunt if later needed.
- **Why it could fit.** A fixed endpoint can leave a sibling route or representation vulnerable; root-cause searches add more than literal duplicate search.
- **Why it might not.** Unbounded parallel expansion and a mandatory CI-rule write-up are beyond a small fix. Its noise threshold is a search heuristic, not measured recall.
- **Copy / adapt / idea-only**: idea-only; independently state “calibrate against the known instance, vary one feature, inspect all results, preserve ruled-out controls and coverage.”
- **Overlap**: O9 sibling checks, core `blast-radius`/diagnosing-bugs; differs from already-ledgered differential-review T5 in [ideas-skim](ideas-skim.md), which starts with a diff.
- **Idle context cost**: 566 chars, ~223 published; reference 0 or user-invoked 0.
- **Recommendation (proposed)**: merge a bounded same-root-cause search into security fix guidance; defer a standalone hunt until the reference proves insufficient.

### T6. `fp-check` and completeness hooks

- **What it is.** [Claim restatement and standard/deep verification][t-fp] trace dataflow, exploitability, impact, PoCs, negative controls and adversarial objections. [Gate rules][t-fp-gates] force TRUE/FALSE verdicts. [Stop/SubagentStop prompt hooks][t-fp-hooks] ask a model to inspect phase completeness, including on unrelated stops before returning OK.
- **Kind**: skill / hook.
- **Proposed address**: ideas for the web pack user-invoked finding-assessment candidate; no hook address.
- **Why it could fit.** Caller controls, environment protections and a counterexample to the claim are strong defenses against inflated findings.
- **Why it might not.** A missing PoC or incomplete phase fails a gate and becomes FALSE POSITIVE, conflating unknown with disproven. The impact gate is narrower than integrity/availability risks. Prompt hooks incur model work and are not deterministic silent guards; three agent definitions add further context.
- **Copy / adapt / idea-only**: idea-only; keep the questions, require an inconclusive state, discard hooks, binary forcing, process-for-process gates and agent machinery.
- **Overlap**: O6/O8/O10, A1 rubric, `verifying`; `security-guidance` has already failed the analogous hook gates.
- **Idle context cost**: 343 chars, ~137 skill tokens, plus three agent descriptions (not measured); hook prompts/runtime cost unmeasured. Proposed user-invoked 0, no hooks.
- **Recommendation (proposed)**: reject the published skill/hook bundle; merge negative controls and counterevidence questions into one finding-assessment candidate.

### T7. `agentic-actions-auditor`

- **What it is.** [Static analysis of AI-enabled GitHub Actions][t-actions]: follows event data, env intermediaries, prompt fields and action permissions; resolves composite/reusable workflows one level deep and records deeper unresolved references. Includes AI-output execution, PR-target checkout, unsafe sandbox and wildcard-allowlist vectors.
- **Kind**: skill / convention doc.
- **Proposed address**: web pack guide CI-security reference; possible broader core contribution at closing review.
- **Why it could fit.** Team repositories running coding agents create a separate boundary between outsider-controlled content and CI credentials. Purely reading the workflow is enough to assess many paths.
- **Why it might not.** Specific to GitHub AI actions, not all CI or all web apps; hard-coded action profiles drift. One-level resolution is a coverage limit, not evidence that nested workflows are safe.
- **Copy / adapt / idea-only**: idea-only; independently trace event actor → reusable/composite inputs → agent/tools → credentials/write surface, pinned to the actual action revision.
- **Overlap**: Addy's LLM-output boundary, secrets guard rules, A1 pipeline checklist, maintenance skill scan. Guards on this desktop do not secure remote CI.
- **Idle context cost**: 571 chars, ~225 published; reference 0.
- **Recommendation (proposed)**: merge an agent-in-CI boundary checklist into the guide, reached only for relevant workflows; offer generalization beyond web to closing review.

### T8. `insecure-defaults` command and corpus

- **What it is.** A [command-only audit][t-defaults-command] over six categories: fallback secrets, default credentials, fail-open controls, weak crypto, permissive access and debug leakage. [README][t-defaults] describes recon, six discovery workers, refuting verifiers and a report, with separate handling for configurable versus unconditional weaknesses.
- **Kind**: script / convention doc (user-invoked command).
- **Proposed address**: guide security reference; no parallel command install.
- **Why it could fit.** Tracing the effective value through deployment configuration to a security decision adds useful context to Addy's safe-default controls.
- **Why it might not.** Model-pinned multi-agent workflow, Bash/POSIX seeds and corpus dependency; incomplete traces are refuted and missing deployment overrides can escalate severity without establishing attacker impact.
- **Copy / adapt / idea-only**: idea-only; retain configurable/unconditional distinction and actual-value tracing; uncertain reachability stays inconclusive. No corpus or workflow copying.
- **Overlap**: Addy config/secrets controls, T6, A1; command guard rules prevent local secret access/exfiltration, not insecure production defaults.
- **Idle context cost**: no `SKILL.md`, so no skill description cost; command expansion and delegated work cost on invocation. Full harness command-list cost not measured.
- **Recommendation (proposed)**: merge effective-default checks into the reference; reject the command/workflow. **Correct the sweep:** it exists at the same SHA; only a skill file is absent.

## OWASP digest (`agamm/claude-code-owasp`)

### A1. `owasp-security` and four disclosed references

- **What it is.** [One review/secure-implementation skill][a-skill] with [coverage checklist][a-checklist], [language pitfalls][a-languages], [configuration/supply-chain checks][a-config] and a [long standards digest][a-report]. It maps entry points, loads relevant sections, traces candidate source-to-sink paths and reports severity separately from confidence, including needs-verification.
- **Kind**: skill / convention doc.
- **Proposed address**: web pack security reference owned by `web-guide`.
- **Why it could fit.** Central auth middleware checks, every-step attacker capability, deployment/IaC/CI coverage and LLM tool/tenant boundaries give concrete review depth without another scanner. It does not mandate scanner installation.
- **Why it might not.** Its broad trigger and `when_to_use` duplicate the guide; five progress lines in every response are noise. A digest is not full ASVS coverage or an assurance assessment. Short “safe” examples and severity buckets still require project context.
- **Copy / adapt / idea-only**: adapt selected MIT-authored rubric/checklist material with provenance and notice; eliminate trigger/progress duplication, keep TypeScript examples only where needed, verify editions/IDs against primary standards and do not copy third-party CC-BY-SA standard text through an MIT wrapper.
- **Overlap**: Addy remains the full base; core `code-review` owns the review, host `/security-review` may already cover much of it; O6–O8 and T6 address the same claim-evidence problem.
- **Idle context cost**: 455 chars ~180 plus `when_to_use` ~135 on Claude as published; 0 separate description proposed.
- **Recommendation (proposed)**: adapt the claim triage rubric and missing config/CI/LLM checks into the decided guide reference; reject a second general security skill and wholesale standards digest.

### A2. Five trigger and false-positive evals

- **What it is.** [Five prompt/Markdown-grader cases][a-evals] check unrelated requests, IDOR with a decoy, safe risky-looking code, conditional severity and LLM-output handling; the [2026-risk grader][a-llm-grader] accepts particular risk-name/ID combinations. A local [grader test script][a-eval-test] is supplied but was not run.
- **Kind**: CI-eval / script.
- **Proposed address**: maintenance behavioral eval input, not an installed pack skill.
- **Why it could fit.** Near-miss triggers, safe centralized auth and unsupported attacker capabilities are useful regression cases for a reference that must reduce noise as well as find bugs.
- **Why it might not.** Regex graders reward formatting and labels, not causal correctness; pinned `sonnet` in fixtures and current ID checks are not a cross-harness/frontier-model acceptance policy.
- **Copy / adapt / idea-only**: adapt test scenarios under MIT with notice, re-author assertions around evidence and allowed uncertainty; keep the owner's maintenance eval procedure and model policy.
- **Overlap**: decided maintenance hand-run behavioral/trigger evals, Addy's security fixtures, ToB variant eval ideas, core `verifying`.
- **Idle context cost**: 0; model/eval cost only when deliberately run.
- **Recommendation (proposed)**: adapt a small positive/negative security case set for maintenance; do not install/run this repo's eval machinery or treat label matches as proof.

## Wshobson security-scanning: modeling half and scanner boundary

The five skills are MIT and can be copied with provenance and the 2024 Seth Hobson notice where substantial material is used. The proposed destination is reference material, not the whole plugin with two agent personas and three command workflows.

### W1. `stride-analysis-patterns`

- **What it is.** [STRIDE questions and control families][w-stride], with a [reference][w-stride-ref] for assets, trust boundaries, DFD interactions and likelihood × impact scoring.
- **Kind**: skill / convention doc.
- **Proposed address**: web pack guide security reference.
- **Why it could fit.** Concrete category questions can help a team notice a missing abuse case and record a reviewable threat model.
- **Why it might not.** Addy already supplies the process; the generic component-oriented material does not explicitly treat LLM output and can turn a five-minute first pass into documentation ceremony.
- **Copy / adapt / idea-only**: adapt only missing diagnostic questions with provenance/notice; preserve STRIDE **per boundary**, not an alternate top-level sequence.
- **Overlap**: Addy 37 is nearly complete overlap; O1 adds source evidence and deployment assumptions.
- **Idle context cost**: 169 chars, ~70 published; reference 0.
- **Recommendation (proposed)**: merge only demonstrably missing questions into Addy's reference; reject a separate STRIDE skill/template system.

### W2. `attack-tree-construction`

- **What it is.** [Structures an attacker goal into AND/OR branches][w-tree]; [reference examples][w-tree-ref] enumerate paths, attributes and diagrams, plus executable Python models/builders.
- **Kind**: skill / convention doc.
- **Proposed address**: an optional disclosed section of the guide's security reference.
- **Why it could fit.** Compound conditions such as credential theft plus bypassing MFA are clearer as branches; trees can expose alternative routes missed by a flat control checklist.
- **Why it might not.** Max-versus-sum difficulty calculations disagree within the examples. Numeric attack cost/probability is not evidence, and generating a Python modeling framework is unnecessary.
- **Copy / adapt / idea-only**: adapt the conceptual goal/AND/OR method and a small hand-authored example with notice; omit code, score calculations and automatic exporters.
- **Overlap**: Addy abuse cases and STRIDE; O7 traces an actual finding rather than planning alternative attacks.
- **Idle context cost**: 169 chars, ~70 published; reference 0.
- **Recommendation (proposed)**: adapt optional qualitative attack trees for multi-step threats; reject the executable model framework and a separate skill.

### W3. `threat-mitigation-mapping`

- **What it is.** [Maps threats to preventive, detective and corrective controls][w-mitigate]; [reference][w-mitigate-ref] includes status, effectiveness/coverage, gaps, roadmaps and control tests.
- **Kind**: skill / convention doc.
- **Proposed address**: guide security reference, project records holding actual owners/status.
- **Why it could fit.** A team needs to know which control enforces an invariant, how it is checked and what risk remains, not merely that a control was proposed.
- **Why it might not.** Coverage percentages and budget optimizers operate on assumed values; a planned control is not an effective deployed mitigation.
- **Copy / adapt / idea-only**: adapt a qualitative threat → control → enforcing component → evidence/test → owner/status table, carrying notice; omit numeric efficacy and optimizer examples.
- **Overlap**: Addy control families, O12 structural options, core spec acceptance and `verifying`.
- **Idle context cost**: 181 chars, ~75 published; reference 0.
- **Recommendation (proposed)**: adapt a compact control/evidence traceability record; no separate mapping skill or invented risk-reduction score.

### W4. `security-requirement-extraction`

- **What it is.** [Turns threats into requirements, acceptance criteria and tests][w-requirements]; [reference][w-requirements-ref] adds threat traceability, story/epic generation and compliance mappings.
- **Kind**: skill / convention doc.
- **Proposed address**: guide reference answering core spec/ticket and test-design extension points.
- **Why it could fit.** A tenant-isolation invariant can become a concrete acceptance case where tenant A cannot read tenant B's object, with an allowed same-tenant control.
- **Why it might not.** A second story/epic generator competes with core planning; default acceptance templates cannot establish compliance or replace a project threat model.
- **Copy / adapt / idea-only**: adapt threat → invariant → test traceability with notice; preserve Addy's abuse-case-first ordering and the core tracker/spec workflow.
- **Overlap**: Addy first abuse tests, core `tdd`, spec/ticket flow, W3 evidence map.
- **Idle context cost**: 193 chars, ~79 published; reference 0.
- **Recommendation (proposed)**: adapt requirement/test traceability as a reference section; reject a parallel requirements skill or compliance generator.

### W5. `sast-configuration` and bundled security commands

- **What it is.** [SAST setup recipes][w-sast] install/run Semgrep, SonarQube and CodeQL and show CI/pre-commit configuration. The plugin also includes [SAST][w-sast-command], [dependencies][w-deps] and [hardening][w-hardening] commands with scanning, writes and delegated stages; dependency examples run update/fix operations.
- **Kind**: skill / convention doc / manifest-packaging.
- **Proposed address**: none as a source install; scanner-selection facts in project configuration.
- **Why it could fit.** CI baselines, custom project sources/sinks and repeatable scanner commands are real team needs.
- **Why it might not.** Skill refers to absent `scripts/run-sast.sh` and `references/semgrep-rules.md`; uses deprecated `returntocorp/semgrep-action@v1` ([action notice][semgrep-deprecated]), old pre-commit pin and unscoped `--config=auto`. Command CI examples suppress failures with `|| true`; its “secure” path check uses `realpath(...).startswith(...)`, which accepts a sibling prefix such as `uploads-other` for `uploads` (*static inference*, not an executed exploit).
- **Copy / adapt / idea-only**: permissive licence allows adaptation, but take only the need for project-selected tooling. Do not copy command bodies, auto-update recipes, broken containment example or install steps. Use current official scanner guidance when implementing a chosen tool.
- **Overlap**: T2/T3 are deeper scanner sources, T1 dependency metadata, Addy controls and safe derived-path checks, core maintenance CI.
- **Idle context cost**: skill 234 chars, ~95; five-skill subtotal ~389, plus two agent descriptions (not measured). Proposed 0.
- **Recommendation (proposed)**: reject this skill and the whole security-scanning plugin as installs; retain project-owned scan-command configuration and prefer T2/T3's coverage ideas over these recipes.

## Coverage gaps and limits

- **No effectiveness or compatibility results.** Scanners, collectors, model evals and Windows workflows were not run. No claim here establishes exploitability in an owner's app or recall/precision for a tool. The unread bundled implementations are named in Sources and scope.
- **Dependency depth remains incomplete.** The ToB collector explicitly lacks pnpm/Yarn lockfile parsing, and advisory metadata alone misses malicious code, unpublished compromises and runtime reachability. A future workflow must state package-manager/transitive coverage and selected registries/advisory sources; it cannot silently audit latest versions instead of the lockfile.
- **A real ASVS assessment is still missing.** The OWASP digest supplies selected checks, not every requirement, levels or proof. Only selected 2026 LLM/ASVS assertions were primary-source checked here; Top 10, Agentic and all language examples were not independently revalidated. Follow primary standards for assurance claims and respect their licences.
- **Production controls and service behavior need project evidence.** Multi-tenant authorization, OAuth/OIDC/session lifecycle, signed webhooks and replay, uploads/SSRF, queues/retries, data retention and backup recovery all need actual integration tests/configuration. Addy covers their security principles; neither a ledger nor a browser pass verifies a deployment. Vendor-specific recipes remain in the selected official vendor layer.
- **Agentic CI coverage is bounded.** T7's profiles and one-level cross-file resolution do not cover every action, arbitrary shell-installed agent or other CI provider. A local command guard protects local tool access; it cannot guarantee remote workflow isolation or cloud permissions.
- **Operational response and disclosure remain distinct needs.** Finding tracking and writeups do not supply a complete incident-response, credential-rotation, breach-notification or private-disclosure workflow. Do not publish findings to a normal issue merely because the project uses GitHub Issues.
- **Identity and evidence are shared requirements.** If the owner selects any new workflow, bind its result to target/revision, scope, exact tool/ruleset identity, what ran and did not, raw-result provenance, candidate disposition and next proof gaps. Keep redacted artifacts and ownership in project storage chosen by setup; do not invent another mandatory workbench.
- **Closing-review candidates, not new decisions:** source-backed threat models may belong partly in core; patch-risk dimensions and agent-in-CI checks may generalize beyond web; one finding-assessment entry may be unnecessary if core triage/`verifying` plus this reference suffice. Ledger proposals do not settle those questions.

## Map-ready gist (proposed)

31 entries across Codex Security, eight new Trail of Bits candidates, the OWASP digest/evals and five wshobson security skills; no wholesale install proposed. Addy's decided guide reference remains the base, with proposed additions for finding evidence/counterevidence, optional qualitative attack trees and threat-to-control/test traceability, plus user-invoked dependency-audit and finding-assessment candidates for the owner to compare with existing workflows. Codex Security explicitly declares Proprietary (ideas only), ToB stays CC-BY-SA ideas-only, and the sweep's absent `insecure-defaults` is corrected to a command-only workflow at the same pin; scanner/Windows effectiveness and full standards coverage remain unverified.

<!-- External source links are immutable. Issue links and local research links are context, not source pins. -->

[o-root]: https://github.com/openai/plugins/tree/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/codex-security
[o-manifest]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/codex-security/.codex-plugin/plugin.json
[o-notices]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/codex-security/mcp/native/THIRD_PARTY_NOTICES.txt
[o-mcp]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/codex-security/.mcp.json
[o-preflight]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/codex-security/preflight/capability-profiles.toml
[o-launch]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/codex-security/scripts/launch_codex_security_mcp.cmd
[o-storage]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/codex-security/references/artifact-storage.md
[o-core]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/codex-security/references/core-scan.md
[o-threat-ref]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/codex-security/references/threat-model.md
[o-verify-yaml]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/codex-security/skills/verify-fix/agents/openai.yaml
[o-threat]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/codex-security/skills/threat-model/SKILL.md
[o-scan]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/codex-security/skills/security-scan/SKILL.md
[o-deep]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/codex-security/skills/deep-security-scan/SKILL.md
[o-diff]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/codex-security/skills/security-diff-scan/SKILL.md
[o-discovery]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/codex-security/skills/finding-discovery/SKILL.md
[o-validation]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/codex-security/skills/validation/SKILL.md
[o-attack]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/codex-security/skills/attack-path-analysis/SKILL.md
[o-triage]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/codex-security/skills/triage-finding/SKILL.md
[o-fix]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/codex-security/skills/fix-finding/SKILL.md
[o-verify]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/codex-security/skills/verify-fix/SKILL.md
[o-risk]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/codex-security/skills/assess-patch-risk/SKILL.md
[o-hardening]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/codex-security/skills/propose-security-hardening/SKILL.md
[o-policy]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/codex-security/skills/define-security-policy/SKILL.md
[o-track]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/codex-security/skills/track-findings/SKILL.md
[o-writeup]: https://github.com/openai/plugins/blob/0722921d5542fc593105c27bd52630babd8b8c2a/plugins/codex-security/skills/vulnerability-writeup/SKILL.md
[t-root]: https://github.com/trailofbits/skills/tree/196a9073ab10d35bacf111f945e02c00b2c6883a
[t-license]: https://github.com/trailofbits/skills/blob/196a9073ab10d35bacf111f945e02c00b2c6883a/LICENSE
[t-supply]: https://github.com/trailofbits/skills/blob/196a9073ab10d35bacf111f945e02c00b2c6883a/plugins/supply-chain-risk-auditor/skills/supply-chain-risk-auditor/SKILL.md
[t-semgrep]: https://github.com/trailofbits/skills/blob/196a9073ab10d35bacf111f945e02c00b2c6883a/plugins/static-analysis/skills/semgrep/SKILL.md
[t-codeql]: https://github.com/trailofbits/skills/blob/196a9073ab10d35bacf111f945e02c00b2c6883a/plugins/static-analysis/skills/codeql/SKILL.md
[t-sarif]: https://github.com/trailofbits/skills/blob/196a9073ab10d35bacf111f945e02c00b2c6883a/plugins/static-analysis/skills/sarif-parsing/SKILL.md
[t-variant]: https://github.com/trailofbits/skills/blob/196a9073ab10d35bacf111f945e02c00b2c6883a/plugins/variant-analysis/skills/variant-analysis/SKILL.md
[t-fp]: https://github.com/trailofbits/skills/blob/196a9073ab10d35bacf111f945e02c00b2c6883a/plugins/fp-check/skills/fp-check/SKILL.md
[t-actions]: https://github.com/trailofbits/skills/blob/196a9073ab10d35bacf111f945e02c00b2c6883a/plugins/agentic-actions-auditor/skills/agentic-actions-auditor/SKILL.md
[t-codeql-build]: https://github.com/trailofbits/skills/blob/196a9073ab10d35bacf111f945e02c00b2c6883a/plugins/static-analysis/skills/codeql/workflows/build-database.md
[t-fp-gates]: https://github.com/trailofbits/skills/blob/196a9073ab10d35bacf111f945e02c00b2c6883a/plugins/fp-check/skills/fp-check/references/gate-reviews.md
[t-fp-hooks]: https://github.com/trailofbits/skills/blob/196a9073ab10d35bacf111f945e02c00b2c6883a/plugins/fp-check/hooks/hooks.json
[t-defaults]: https://github.com/trailofbits/skills/blob/196a9073ab10d35bacf111f945e02c00b2c6883a/plugins/insecure-defaults/README.md
[t-defaults-command]: https://github.com/trailofbits/skills/blob/196a9073ab10d35bacf111f945e02c00b2c6883a/plugins/insecure-defaults/commands/audit.md
[a-root]: https://github.com/agamm/claude-code-owasp/tree/8ac7965caa212b4a850aff8d3df0081ab3fa9eed
[a-license]: https://github.com/agamm/claude-code-owasp/blob/8ac7965caa212b4a850aff8d3df0081ab3fa9eed/LICENSE
[a-skill]: https://github.com/agamm/claude-code-owasp/blob/8ac7965caa212b4a850aff8d3df0081ab3fa9eed/.claude/skills/owasp-security/SKILL.md
[a-checklist]: https://github.com/agamm/claude-code-owasp/blob/8ac7965caa212b4a850aff8d3df0081ab3fa9eed/.claude/skills/owasp-security/reference/review-checklist.md
[a-languages]: https://github.com/agamm/claude-code-owasp/blob/8ac7965caa212b4a850aff8d3df0081ab3fa9eed/.claude/skills/owasp-security/reference/languages.md
[a-config]: https://github.com/agamm/claude-code-owasp/blob/8ac7965caa212b4a850aff8d3df0081ab3fa9eed/.claude/skills/owasp-security/reference/config-and-supply-chain.md
[a-report]: https://github.com/agamm/claude-code-owasp/blob/8ac7965caa212b4a850aff8d3df0081ab3fa9eed/.claude/skills/owasp-security/reference/owasp-report.md
[a-evals]: https://github.com/agamm/claude-code-owasp/tree/8ac7965caa212b4a850aff8d3df0081ab3fa9eed/evals
[a-llm-grader]: https://github.com/agamm/claude-code-owasp/blob/8ac7965caa212b4a850aff8d3df0081ab3fa9eed/evals/llm-agent-output-handling/graders/names-2026-core-risk.md
[a-eval-test]: https://github.com/agamm/claude-code-owasp/blob/8ac7965caa212b4a850aff8d3df0081ab3fa9eed/scripts/test-graders.mjs
[w-root]: https://github.com/wshobson/agents/tree/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/security-scanning
[w-license]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/LICENSE
[w-stride]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/security-scanning/skills/stride-analysis-patterns/SKILL.md
[w-stride-ref]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/security-scanning/skills/stride-analysis-patterns/references/details.md
[w-tree]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/security-scanning/skills/attack-tree-construction/SKILL.md
[w-tree-ref]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/security-scanning/skills/attack-tree-construction/references/details.md
[w-mitigate]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/security-scanning/skills/threat-mitigation-mapping/SKILL.md
[w-mitigate-ref]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/security-scanning/skills/threat-mitigation-mapping/references/details.md
[w-requirements]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/security-scanning/skills/security-requirement-extraction/SKILL.md
[w-requirements-ref]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/security-scanning/skills/security-requirement-extraction/references/details.md
[w-sast]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/security-scanning/skills/sast-configuration/SKILL.md
[w-sast-command]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/security-scanning/commands/security-sast.md
[w-deps]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/security-scanning/commands/security-dependencies.md
[w-hardening]: https://github.com/wshobson/agents/blob/0874a27b17a22e2b7c2e2bcd725768e0803cad06/plugins/security-scanning/commands/security-hardening.md
[semgrep-deprecated]: https://github.com/returntocorp/semgrep-action/blob/713efdd345f3035192eaa63f56867b88e63e4e5d/README.md
[addy-skill]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/skills/security-and-hardening/SKILL.md
[addy-patterns]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/skills/security-and-hardening/references/hardening-patterns.md
[addy-checklist]: https://github.com/addyosmani/agent-skills/blob/1401c8b8030e023baeebb31781a6653fe8e93026/references/security-checklist.md
[asvs-v6]: https://github.com/OWASP/ASVS/blob/2b47a9dd16760ee484a6672d197f1f7e25d9c632/5.0/en/0x15-V6-Authentication.md
[asvs-license]: https://github.com/OWASP/ASVS/blob/2b47a9dd16760ee484a6672d197f1f7e25d9c632/LICENSE.md
[llm-index]: https://github.com/OWASP/www-project-top-10-for-large-language-model-applications/blob/99f4395589bdbd120ae961f9cd179e79d7f9b27f/index.md
[llm-agency]: https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/9253e38ade58e959b531c0c5c9a4842272c9cd0e/2026/final/LLM03_ExcessiveAgency.md
[llm-hidden]: https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/9253e38ade58e959b531c0c5c9a4842272c9cd0e/2026/final/LLM08_HiddenContextExposure.md
[llm-output]: https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/9253e38ade58e959b531c0c5c9a4842272c9cd0e/2026/final/LLM10_ImproperOutputHandling.md
