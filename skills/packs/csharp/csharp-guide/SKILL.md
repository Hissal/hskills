---
name: csharp-guide
description: Use when designing, changing, reviewing or diagnosing SDK-style .NET code; when a workflow requests C# or .NET-specific knowledge; or when choosing a C# workflow.
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/csharp-guide"
  opencode/autoinvoke: "true"
---

# C# guide

Knowledge for SDK-style .NET: projects built with the `dotnet` SDK, multi-targeted libraries and packages included. You supply knowledge for the job in hand; you never start a workflow.

## Set up or not

A Unity project (one with `ProjectSettings/ProjectVersion.txt`) does not list this pack: its C# belongs to its Unity guidance. There, say only that this guide covers SDK-style projects, and answer nothing more. A library built with the SDK for Unity to consume is SDK-style and is covered here.

Otherwise, read the `### Packs` section of the `## Agent skills` block in the project's `AGENTS.md` or `CLAUDE.md`. When it does not list `csharp-guide`, say this once in the session, then answer anyway:

> `csharp-guide`: installed, not set up: run `<setup-project invocation>`.

Write the invocation as installed in this harness: `/setup-project` on Claude Code (`/plugin:setup-project` from a plugin), `$setup-project` on Codex.

## Answer a need

- **A caller asks.** Another skill names its need. Find the row with that need below, load only that row's reference, and answer from it inside the caller's job: a reviewer stays a reviewer, a refactor stays a refactor. Never start or invoke another workflow, and never load a reference for a need nobody asked about.
- **No caller.** The work itself is SDK-style .NET (a public API change, a rename). Take the rows whose need matches the work and load those references.
- **No row fits.** Return nothing from this pack: no announcement and no general advice. The caller carries on with its own process.
- **Choosing a workflow.** This pack has no workflows of its own. Say so; the core workflows apply unchanged, with this guide answering their needs.

## Needs

| Need | Target |
|---|---|
| This stack's seam and compatibility rules (`codebase-design`) | [Compatibility](references/COMPATIBILITY.md) |
| Migrating stack-specific data or APIs (`migrating`) | [Compatibility](references/COMPATIBILITY.md) |
| Reviewing stack-specific code (`code-review` Standards) | [Compatibility](references/COMPATIBILITY.md) |
| Failure modes specific to the stack (`code-review` Failure) | [Compatibility](references/COMPATIBILITY.md) |
| What a diff cannot prove for this stack (`code-review` Spec) | [Compatibility](references/COMPATIBILITY.md) |
| This stack's sources of friction (`architecture-review`) | [Compatibility](references/COMPATIBILITY.md) |
| What a change can break outside the diff for this stack (`blast-radius`) | [Compatibility](references/COMPATIBILITY.md) |
| This stack's rename and move hazards and how to validate a refactor (`refactoring`) | [Renames](references/RENAMES.md) |
