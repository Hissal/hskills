---
name: orbit-replay
description: Reproduce a recorded telemetry pass frame by frame.
disable-model-invocation: true
metadata:
  opencode/autoinvoke: "false"
---

# Orbit replay

Test-only pack workflow for the core guide's discovery case. Takes a pass id.

1. Write `replay/<pass id>.log` with one line per frame of the recorded pass.
2. Decode each frame again and mark the first one whose CRC fails.
