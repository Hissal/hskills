# Unity official coverage refresh

Bounded background research for the Unity pack theme, inspected 2026-10-22. This refresh establishes available upstream coverage before deciding needs and skill boundaries; it does not propose retaining the fork's existing boundaries.

## Revisions and change since the baseline

- `Unity-Technologies/skills` HEAD is **`9d282100540601cfddc4bbd69f36a239d7a6f55c`**, exactly the revision read by [the existing baseline](unity-baseline.md). Its current tree still contains 34 skills. [Pinned source tree](https://github.com/Unity-Technologies/skills/tree/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills).
- `Unity-Technologies/unity-agent-plugin` HEAD is **`d95425b6c0055e1473566476d90e116645999878`**, with 32 skills and metadata version `0.1.8-beta`. Since baseline `cf6b2da24e424b0a60d560a57f39f676cb6f79f3`, nine commits changed manifests, Antigravity support, README placement, logos and release tooling. **No skill files changed.** [Exact comparison](https://github.com/Unity-Technologies/unity-agent-plugin/compare/cf6b2da24e424b0a60d560a57f39f676cb6f79f3...d95425b6c0055e1473566476d90e116645999878), [metadata](https://github.com/Unity-Technologies/unity-agent-plugin/blob/d95425b6c0055e1473566476d90e116645999878/scripts/plugin-metadata.json).
- The plugin still excludes the standalone distribution's `unity-pipeline` and `project-auditor-fixes`; there are no newly added official gameplay-netcode or ECS skills. [Plugin skills tree](https://github.com/Unity-Technologies/unity-agent-plugin/tree/d95425b6c0055e1473566476d90e116645999878/skills).

## Sources and vendoring limits

Both public repositories contain their skill text directly; inspecting their complete git trees found no git submodule entries. Both allow a publishing workflow named `unity/skills/.github/workflows/publish-to-public.yml` to update their `skills/` trees. This is evidence of a publishing source, not access to that source or proof of its private contents. The checked public copies are the inspected artifacts. [Skills workflow permission](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/.github/allowed-remote-repos.yaml), [plugin workflow permission](https://github.com/Unity-Technologies/unity-agent-plugin/blob/d95425b6c0055e1473566476d90e116645999878/.github/allowed-remote-repos.yaml).

The CLI skill also describes skills shipped by installed packages/catalog plugins: `unity-pipeline` inside `com.unity.pipeline`, and an AI plugin skill mirrored through `unity skill install`/`refresh`. Their mention does not establish an additional installed or publicly inspected multiplayer/ECS skill. No package or catalog plugin was installed for this research. [CLI distribution and plugin-skill instructions](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-cli/SKILL.md).

## Multiplayer: concrete coverage

Read the complete `setup-multiplayer-services/SKILL.md` and all six reference files. Official coverage is broader than merely installing multiplayer packages:

- Requirements and architecture fit: player count, topology, host versus dedicated server, fairness/latency concerns, discovery, reconnect, host departure, platform constraints and the project's existing networking stack. It explicitly distinguishes Netcode for GameObjects (NGO) from Netcode for Entities (NFE), and says to extend the existing stack rather than introduce another without a request. [Implementation fit](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/setup-multiplayer-services/references/implementation-fit.md).
- Sessions-first service integration: create/join/browse/matchmake/reconnect; session and player metadata; direct and relayed networking; network startup/state and a custom `INetworkHandler`; host-migration hooks; matchmaking backfill. `With*Network*` session options can bring up configured NGO/NFE without a separate start step. [Entrypoints](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/setup-multiplayer-services/references/entrypoints.md).
- Dedicated-server session entrypoints and server-only build/assembly constraints (`UNITY_SERVER`, `ENABLE_UCS_SERVER`, guarded references and asmdef constraints). [Dedicated servers](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/setup-multiplayer-services/references/dgs-entrypoint.md).
- Package/cloud prerequisites, deployment and the distinction between room metadata and a gameplay networking stack; lower-level Lobby/Matchmaker/Relay clients are fallback paths. [Prerequisites](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/setup-multiplayer-services/references/workflows-prerequisites.md), [underlying services](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/setup-multiplayer-services/references/underlying-services.md).

**Remaining candidate need (inference from inspected text and corpus search):** implementing and validating replicated gameplay: NGO RPCs/NetworkVariables, gameplay ownership and authority enforcement, or NFE ghosts, prediction and reconciliation. The service skill identifies stack/authority concerns and owns connection/session integration, but supplies no substantive implementation discipline for these gameplay mechanisms. Its external documentation-map pointer is a route to more documentation, not bundled coverage of all linked topics. [Skill entrypoint](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/setup-multiplayer-services/SKILL.md).

## DOTS/ECS, Jobs and Burst

The complete current skill and reference inventories contain no dedicated ECS/Entities, Jobs or Burst skill. A whole-corpus search found no `IComponentData`, `IJobEntity`, `EntityCommandBuffer` or `BurstCompile` guidance. This supports a **candidate gap**, not a claim that official Unity documentation lacks these topics.

There is a small, explicit exception: `physics-3d-collision` has a DOTS/Unity Physics fast path. It labels this outside primary scope, offers a brief best-effort answer with APIs such as `PhysicsCollider`, `ICollisionEventsJob` and `SimulationSingleton`, directs verification against package documentation, and defers to a dedicated specialist if present. This is not general ECS or job-safety coverage. [Pinned fast path](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/physics-3d-collision/SKILL.md#L51-L61).

**Remaining candidate needs:** data/system/world lifetime, structural changes and command buffers, job dependencies and native-container ownership, Burst constraints, baking, and NFE-specific simulation/prediction boundaries. These are investigation categories inferred from the requested scope, not verified missing-rule lists or decided skills.

## Bounded adjacent check

The current source identity means the old baseline's other coverage findings have not been superseded by new source. Targeted reads of the CLI/Pipeline bodies and reference inventories reconfirm execution support: live Editor control, compilation, test modes and reporting, affected-test selection, builds, Play observation and Unity-aware VCS. The CLI's affected-test guidance itself warns that its dependency graph is a lower bound and documents fallback and comparison modes. [Test/build reference](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-cli/references/build-run-test.md#L278-L300), [Pipeline](https://github.com/Unity-Technologies/skills/blob/9d282100540601cfddc4bbd69f36a239d7a6f55c/skills/unity-pipeline/SKILL.md).

This refresh does not perform a new exhaustive correctness review of all test-writing, serialization, assembly or lifecycle needs and does not choose their eventual skill/reference boundaries.

## Inspection versus validation

Used GitHub API and read-only shallow clones in a temporary directory; read current trees, the exact plugin comparison, multiplayer body and every reference, targeted CLI/Pipeline material and corpus searches. No source scripts, CLI binary, Editor, networking sample or DOTS code was executed. No upstream behavior or API correctness was validated. External documentation links were not followed in this bounded pass. No installation, branch, push or tracker mutation was performed. This document is the only repository file created.

## Follow-up: Markdown documentation lookup

After the bounded audit above, checked the installed CLI: `unity --version` reports `1.0.0-beta.14`. Its `unity docs --help` advertises `--content` to print a page as Markdown, `--editor-version`, `--package`, and `docs toc` for discovering actual pages. Unity's [official release notes](https://docs.unity.com/en-us/unity-cli/release-notes) confirm these additions, including JSON output containing page URL, version and source. These are rolling documentation, read 2026-10-22.

An actual `unity docs --content --editor-version 6000.3 GameObject` attempt failed with `Unable to reach docs.unity.com to download the documentation page index`. A second attempt, `unity docs --cli --content docs`, failed because no Markdown existed at the guessed CLI topic URL. Thus flag availability and official support are confirmed; successful content retrieval was not demonstrated here. No Editor was launched. For pack design, use current CLI help and topic discovery rather than copying the fork's older URL-only lookup instructions.
