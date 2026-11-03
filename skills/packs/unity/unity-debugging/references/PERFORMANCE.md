# Measuring Unity performance

Choose the cheapest method that can resolve the claim, and state what it measured. `verifying`'s number reference owns the verdict, run counts and report. This file supplies the Unity methods and what each can support.

**Versions inspected on 2026-11-03**, read from docs and not run. Tags mark each API claim:

- `[U]`: Unity 6000.3 Manual and Script Reference.
- `[T]`: Performance testing API 3.2.1 (`com.unity.test-framework.performance`).
- `[A]`: Profile Analyzer 1.2.4 (`com.unity.performance.profile-analyzer`).
- `[N]`: .NET 9 API docs.

These are the versions read, not a compatibility promise. At other versions, confirm a claim you rely on through the guide's docs lookup. Close your answer with the versions behind the API behaviour you used, naming only those: `Versions inspected (docs, not run): Unity 6000.3, Performance testing API 3.2.1.`

## Three quantities

Use these three names in your answer, place every number under one of them, and claim only what that one supports.

| Quantity | What it is | Supports | Read with |
|---|---|---|---|
| **Operation duration** | Elapsed time across one call or boundary | "This operation is cheaper under these inputs" | `Stopwatch`, `Measure.Method` |
| **Summed marker work** | All invocations of a marker in a frame, added up | "This frame does less marked work" | `ProfilerRecorder`, `Measure.ProfilerMarkers`, a capture |
| **Frame critical-path impact** | Whether the frame got shorter, through the chain of work and waits that sets its length | "Frames are faster" | Frame times with the CPU Timeline, `FrameTiming` |

Inference from those boundaries, not a Unity statement:

- An operation's saving, times its calls per frame, bounds the frame's gain. It says nothing about frames that never call it.
- Work saved off the critical path shortens nothing: a main thread that then waits longer on workers, or a frame set by the GPU or a frame cap.
- Overlapping or nested marker durations do not add up to the frame. Less total worker time need not mean a shorter frame.
- A faster mean and fewer hitches are separate claims. A change that removes allocations can leave the median alone and move only the worst frames.

## Choose the method

1. **Write the claim**, and name the quantity it needs. "Faster frames" needs the third, whatever cheaper numbers exist.
2. **Look for what the project already has**: a play route, an overlay, markers, recorders, performance tests, saved captures. Say what each can answer for this claim, and build on those: an existing marker gives the summed work beside any frame number. A new package or helper framework needs a reason they cannot answer.
3. **Take the first row below that can reach that quantity**, in the cheapest environment that can, and say why cheaper rows cannot. The rows complement each other, and none fits every question. Name that first method, then what would make you escalate.
4. **Escalate on evidence.** Noise: the difference sits inside the run-to-run range, so repeat whole runs or compare distributions. Poor representativeness: the scenario is not what the game does, or Editor overhead could explain the result, so use the real scenario or a Player.
5. **State what was measured**: the quantity, method, environment, and the claim it supports. Everything beyond that is unmeasured, and the report says so.

| Question | Method | Needs | Limits |
|---|---|---|---|
| Is this synchronous operation cheaper? | `Stopwatch` around it, through `script run` or an EditMode test | Nothing installed | Wall time, including waits and descheduling. `IsHighResolution` and `Frequency` describe the timer `[N]`. Says nothing about the frame |
| How much marked work per frame, or what does a counter read? | An existing `ProfilerMarker`, read with `ProfilerRecorder` across real frames | Play mode, or a Player | Sum per frame. See the recorder notes below |
| Did frames get shorter in this environment? | Before-and-after frame times over one scenario, uncapped, from the project's recorder or a small probe logging `Time.unscaledDeltaTime` `[U]` | Play mode | Relative only, and reported as this environment's |
| Where does a frame's time go, and who waits on whom? | Profiler capture, CPU Timeline `[U]` | A capture, often a human at the window | A capture is one sample, and recording adds overhead |
| Did the distribution change between captures? | Profile Analyzer `[A]` | The package, and captures of both sides | It compares captures and does not standardize the workload or give independent trials. `.pdata` omits the original data, so keep the `.data` or `.raw` |
| Controlled, repeatable operation numbers | `Measure.Method` `[T]` | The package, a test assembly | Warmup, measurement and iteration counts are explicit options. `GC()` counts allocation calls, not bytes or pauses |
| Did this scenario's frame times change, kept with the tests? | `Measure.Frames` `[T]` | The package, a PlayMode test | Unsupported in Edit Mode. The scenario's stability is yours |
| Marked work per frame, kept with the tests | `Measure.ProfilerMarkers` `[T]` | As above | Sums all invocations per frame. Unsupported in Edit Mode, Deep Profiling and `Profiler.BeginSample` labels |
| Another number: counts, throughput, memory | `Measure.Custom` `[T]` | As above | Its definition and correctness are the harness's |
| Is the frame limited by CPU, GPU or presentation? | `FrameTiming` through `FrameTimingManager` `[U]` | Platform support | See below |

Adding the performance package is a dependency change, so check it with the owner and the guide's dependency need. Test setup belongs to `unity-testing`.

**Recorders.** `ProfilerRecorder` reads marker timings and counters in the Editor and in Players, Release included; list what is available with `ProfilerRecorderHandle.GetAvailable`, and dispose it `[U]`. Release support does not save a custom marker: `ProfilerMarker.Begin` and `End` compile away in non-Development builds `[U]`. So a Release harness reads built-in metrics or its own timing. The older `Recorder` gives a sampler's accumulated time for the previous frame, and samplers exist only in the Editor and Development Players `[U]`. An earlier build of this pack saw `LastValue` read 0 in the frame the recorder starts and on stepped frames, not rerun here: read it after real frames have passed.

**Frame timing.** Read the fields together: `cpuFrameTime` runs from one frame's start to the next on the main thread, so it includes waiting, and `gpuFrameTime` can include idle time `[U]`. Results arrive four frames late, support varies by platform and graphics API, and tile-based GPUs report across deferred phases `[U]`. Check the platform table on the Manual page before relying on a GPU number. Release builds need Frame Timing Stats enabled `[U]`.

## What changes what is measured

Name the ones that apply to this change, and how they could move the number.

- **Warmup.** Cold start and steady state are different questions. A warmup can hide first-use cost, and a change can move cost to load time, where a frame timer never sees it. `Measure.Method` and `Measure.Frames` warm up by default `[T]`.
- **Batching.** Repeated executions in one measurement are not independent launches. They can mutate state, warm caches and reuse allocations. `Measure.Method` picks its own iteration count unless told `[T]`.
- **Reset policy.** Setup and cleanup can restore inputs while warming memory. Reused state can skip work the original did, so check the two sides do the same work.
- **Asynchronous completion.** Timing a job's `Schedule` measures submission. `JobHandle.Complete` prioritizes that job and its dependencies, and may run them on the calling thread, so forcing it inside a timer can destroy the overlap the real frame relies on `[U]`. A CPU timer around render submission is not GPU time. Work deferred past the timed region, such as a later destroy or a collection, is missed altogether.
- **Instrumentation.** A timer, a marker, an overlay that builds strings and an open Profiler all add cost. Deep Profiling support slows a Player even with Deep Profiling off, since checks are added to every C# method `[U]`. Attribute in runs separate from the one that gives the number.
- **Frame cap.** VSync or a target frame rate turns saved time into waiting, so a real gain can read as no change. Measure uncapped to see the work, and capped to see what players get.

## Repeatability

`DynamicMeasurementCount` targets 2% relative error at 99% confidence by default, excluding outliers unless configured `[T]`. Treat it as adaptive sampling, and as no proof of a realistic workload or of repeatability across runs or machines. A narrow interval can describe a biased experiment, and excluding outliers can hide the stall a hitch investigation is after. When run-to-run variation matters, repeat whole scenario runs.

The package records build and player metadata, and `-perfTestResults` exports JSON `[T]`. Neither controls the workload, device load or thermal state. Record with the number: Unity and package versions, backend and Burst, device, scenario and input, quality and resolution, frame cap and VSync, warmup, reset and batch policy, and instrumentation.

## Player evidence

Require a Player when the claim is about the target runtime: a device's frame rate, a shipped build, IL2CPP. Everything else starts in the cheaper environment, before and after in one environment, reported as that environment's. So a claim naming no target, such as "faster frames" in a PR, starts with frame times there, and the Player is its escalation: when Editor overhead could explain the result, or the owner wants the claim made about the target. A practical loop for a device problem: find it on the device, iterate locally, rebuild to confirm.

Play mode shares the Editor's main thread, so the Editor's UI, Inspectors, Scene rendering and asset management affect its numbers. That sentence is on the Unity 6000.0 page and was not found on the 6000.3 one. Its absolute numbers make no target claim.

Built performance tests always run in a Development Player, whatever the build setting says, so they are not a release-equivalent benchmark `[T]`. A release-equivalent number is a separate harness, reading built-in `ProfilerRecorder` metrics, its own timing or Frame Timing Stats.

## Sources

- Performance testing API 3.2.1: [overview](https://docs.unity3d.com/Packages/com.unity.test-framework.performance@3.2/manual/index.html), [method](https://docs.unity3d.com/Packages/com.unity.test-framework.performance@3.2/manual/measure-method.html), [frames](https://docs.unity3d.com/Packages/com.unity.test-framework.performance@3.2/manual/measure-frames.html), [markers](https://docs.unity3d.com/Packages/com.unity.test-framework.performance@3.2/manual/measure-profile-markers.html), [custom](https://docs.unity3d.com/Packages/com.unity.test-framework.performance@3.2/manual/measure-custom.html), [results argument](https://docs.unity3d.com/Packages/com.unity.test-framework.performance@3.2/manual/cmd-line-args.html).
- Profile Analyzer 1.2.4: [manual](https://docs.unity3d.com/Packages/com.unity.performance.profile-analyzer@1.2/manual/index.html).
- Unity 6000.3: [ProfilerMarker](https://docs.unity3d.com/6000.3/Documentation/ScriptReference/Unity.Profiling.ProfilerMarker.html), [ProfilerRecorder](https://docs.unity3d.com/6000.3/Documentation/ScriptReference/Unity.Profiling.ProfilerRecorder.html), [Recorder](https://docs.unity3d.com/6000.3/Documentation/ScriptReference/Profiling.Recorder.html), [FrameTiming](https://docs.unity3d.com/6000.3/Documentation/ScriptReference/FrameTiming.html), [FrameTimingManager](https://docs.unity3d.com/6000.3/Documentation/Manual/frame-timing-manager.html), [getting the data](https://docs.unity3d.com/6000.3/Documentation/Manual/frame-timing-manager-get-timing-data.html), [JobHandle.Complete](https://docs.unity3d.com/6000.3/Documentation/ScriptReference/Unity.Jobs.JobHandle.Complete.html), [CPU Profiler](https://docs.unity3d.com/6000.3/Documentation/Manual/ProfilerCPU.html), [collecting data](https://docs.unity3d.com/6000.3/Documentation/Manual/profiling-collect-data-introduction.html), [Deep Profiling support](https://docs.unity3d.com/6000.3/Documentation/ScriptReference/BuildOptions.EnableDeepProfilingSupport.html).
- Unity 6000.0: [collecting data, Play mode](https://docs.unity3d.com/6000.0/Documentation/Manual/profiling-collect-data-introduction.html).
- .NET 9: [Stopwatch](https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.stopwatch?view=net-9.0).
