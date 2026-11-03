---
name: unity-networking
description: Use when Unity networked gameplay involves authority over shared state, RPC validation, replication through a NetworkVariable or NetworkObject, or what a host, client or late joiner observes. Setting up sessions, Relay, Lobby or matchmaking is a different job.
metadata:
  agent-skills-sync.schema: "1"
  agent-skills-sync.id: "hissal.skill-collection/unity-networking"
  opencode/autoinvoke: "true"
---

# Unity networking

Authority and replication checks for networked gameplay, for a change or a review. The work is an **authority map** of the shared state, the **cases** that break it, and **evidence** per participant. Take the steps in order. Your final reply carries the [report](#report), even when a progress message already said parts of it.

## 1. Read the stack

Take the netcode and transport from `Packages/manifest.json` and `Packages/packages-lock.json`, and the topology (host and clients, dedicated server, distributed authority) from the code. Netcode for GameObjects with Unity Transport is this skill's home ground. On another gameplay netcode, ask the same questions in its terms. Netcode for Entities is outside this skill for now: say so and return.

Version-specific NGO and transport facts come from the docs at the locked version: signatures, permission defaults, RPC attributes, callback order. Use `unity-guide`'s docs lookup when it is installed, and the official docs otherwise. Label anything from memory as memory.

## 2. Map the authority

For each piece of shared state in the work, answer from the code as it runs, tracing real callers:

- **Initiator**: who may ask for the change, and what stops everyone else.
- **Authority**: which instance holds the truth and decides. Everything a client sends (amount, target, its own identity) is a claim, which the authority checks against its own state before it writes.
- **Replication**: what carries the result to the others, with its read and write permissions. Held state reaches a late joiner; a one-shot RPC or event reaches only those connected when it fired.
- **Observation**: what the host, a remote client and a late joiner each see, and when, including any local prediction and how it is corrected.

Done when every write to that state and every RPC reaching it, found by searching the project, sits in the map. Include the paths that get a client there, such as a client-side trigger or input that decides the outcome.

## 3. Walk the cases

Take all four. Each ends as `applies`, with what to check, or `does not apply`, with the reason from this code.

- **Host/client.** A host is server and client in one process, so a path that works on the host says little about a remote client. Check `IsServer`, `IsHost` and `IsOwner` guards on each role. Check whether the host's own player gets powers the design withholds from clients.
- **Late join.** A joiner gets held state at spawn and misses every earlier event. Check that views driven by change callbacks also read the value they spawned with, and that anything joiners need is held state.
- **Despawn.** Check who may despawn, what dies with the object (state stored on it), which subscriptions outlive it, and what happens to an RPC or a second trigger arriving as it goes.
- **Reconnect.** A returning player can be a new client with a new object. Check what identifies them, whether their state survives on something that outlives the connection, and whether stale references to the old client remain. Check too what the session does when the host itself leaves.

## 4. Gather evidence

Verify each applicable case with the project's actual stack and whatever support it already has: its tests, a second Player, a Multiplayer Play Mode setup, a host and client session. Ask `unity-guide` how to run checks here when it is installed. Each result names the participant that observed it: "remote client saw 10 after the host awarded it", never "works". What you could not run goes in the report as not exercised.

When the job is a review or a knowledge lookup for another workflow, the map and cases are your answer: write nothing, start no run, and list runtime behaviour as not exercised. The caller keeps its own process and format.

## Limits

- A change uses the netcode and transport already in the project. New transport abstractions, Steam integration and multiplayer frameworks arrive only at the owner's request; planned Steam networking stays planned. When the report needs one, name it as the owner's decision.
- Sessions, Relay, Lobby, matchmaking, topology choice, host-migration hooks, backfill and dedicated-server setup belong to the official multiplayer services skill, `setup-multiplayer-services` in the official Unity plugin. Point there when it is installed, and otherwise to the official docs.
- Live-service operations and backend workflows are out of scope.

## Report

The final reply holds this block in a fenced code block, one per piece of state, with every label on its own line in this order. A summary may come first; it never replaces a label, and all four case lines appear even when the summary covered them.

```
<state>
Initiator: ...
Authority: ...
Replication: ...
Observation: host ...; remote client ...; late joiner ...

Cases
Host/client: applies | does not apply, because ...
Late join: ...
Despawn: ...
Reconnect: ...

Exercised: <participant>: <what was observed>, or none
Not exercised: <what, and which participant or case>
```

A case that applies and is still open after the change stays in the report with what remains to do.
