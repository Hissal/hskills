# Logs and Players

Finding a log or crash file, and what a Player's build options add. Building the Player is `unity-verification`'s.

- [Editor log and crash files](#editor-log-and-crash-files)
- [Player log](#player-log)
- [Reading a crash](#reading-a-crash)
- [What each build option adds](#what-each-build-option-adds)
- [IL2CPP stack traces](#il2cpp-stack-traces)

## Editor log and crash files

From 6000.6 the Editor writes `<project>/Logs/Editor.log` by default, and the global log only with Use Global Editor Log or `-useGlobalLog`. The 6000.3 manual lists only the global one. `-logFile <path>` overrides both, and `Application.consoleLogPath` returns the file in use.

| Platform | Global Editor log |
|---|---|
| Windows | `%LOCALAPPDATA%\Unity\Editor\Editor.log` |
| macOS | `~/Library/Logs/Unity/Editor.log` |
| Linux | `~/.config/unity3d/Editor.log` |

Editor crash files on Windows are in `%TMP%\Unity\Editor\Crashes`, or the folder `-crash-report-folder` names. Player crash files on Windows are in `%TMP%\CompanyName\ProductName\Crashes` (`CrashReporting.crashReportFolder`). (Locations from the 6000.3 and 6000.6 log files pages.)

## Player log

Pass `-logFile <path>` whenever you launch a player: a player run with `-batchmode -nographics` and no `-logFile` logs to stdout and writes no file. `Application.consoleLogPath` returns the file in use, or an empty string when there is none. `PlayerSettings.usePlayerLog` decides whether a player writes a log at all.

Default locations, when no `-logFile` is given (`CompanyName` and `ProductName` from Player Settings):

| Platform | Location |
|---|---|
| Windows | `%USERPROFILE%\AppData\LocalLow\CompanyName\ProductName\Player.log` |
| macOS | `~/Library/Logs/Company Name/Product Name/Player.log` |
| Linux | `~/.config/unity3d/CompanyName/ProductName/Player.log` |
| UWP | `%USERPROFILE%\AppData\Local\Packages\<productname>\TempState\UnityPlayer.log` |
| Android, iOS, Web | logcat, the Xcode device console, the browser's JavaScript console (no file) |

A Windows Development player can raise a Windows Firewall prompt on its first launch. It ran and logged while the prompt was open; answering the prompt is the user's call.

## Reading a crash

Start from the artifact: the Player log and the crash folder. A later launch of the same Player moves `Player.log` to `Player-prev.log` and starts a new one (observed on 6000.3, Windows), so read both, and copy them before reproducing. Query it for the last lines before the crash, the first exception and your tagged lines. Then resolve the frames that matter: a release stack has no file or line, so reproduce in a Development Build, or point the IL2CPP stack at its `.pdb` files as below. State what the frames show, and what is left unresolved.

## What each build option adds

Observed on a Windows Mono player, 6000.6, one scene built three ways:

| | Release | Development | Development + Script Debugging |
|---|---|---|---|
| `Debug.isDebugBuild` | false | true | true |
| `Debug.Log` in the log | message only | with a managed stack trace | same |
| Exception stack | no file, no line, inlined caller missing | file and line, inlined frames still missing | file and line, every frame |
| `Assert.IsTrue(false)` | nothing (compiled out) | `AssertionException` with file and line | same |
| Managed debugger | none | none | listening; the log names the port |

- **Development Build** adds the Profiler and assertions. **Script Debugging** adds debug symbols, turns off code optimization, and lets a debugger attach ([DEBUGGER.md](DEBUGGER.md)). **Wait For Managed Debugger** makes the player wait before running any script: only when a human is about to attach.
- **Defines**: test `Debug.isDebugBuild` at runtime. Unity's symbol reference says `DEBUG` equals `UNITY_EDITOR || DEVELOPMENT_BUILD`, its managed code variants page ties `DEBUG` to the Debug variant only, and an observed 6.6 Development Build defined `DEVELOPMENT_BUILD`, `DEBUG` and `UNITY_ASSERTIONS`. On 6.6 a script using `#if DEVELOPMENT_BUILD` compiles with warning `UAC0009` (the directive is deprecated).
- **Managed code variants (6.6 and later)**: Release (no symbols), Instrumented (`UNITY_INCLUDE_INSTRUMENTATION`, `ENABLE_PROFILER`), Checked (adds `UNITY_ASSERTIONS`, `UNITY_ENABLE_CHECKS`), Debug (adds `DEBUG`, optimization off), set in Player > Other Settings > Managed Code Variant or `PlayerSettings.SetManagedCodeVariant`. Per the docs, a Development Build before 6.6 implied the Checked variant and no longer does. Log the defines a build carries rather than assuming.
- **Stack trace logging** is per log type (None, ScriptOnly, Full), set in Player > Other Settings > Stack Trace or `Application.SetStackTraceLogType`; a change reaches a player only after a rebuild.

## IL2CPP stack traces

The Debug C++ configuration gives complete managed stacks without line numbers; Release and Master may drop inlined frames. Setting **IL2CPP Stacktrace Information** to "Method Name, File Name, and Line Number" restores file and line in any configuration when the `.pdb` files exist; Script Debugging also does, at a size and speed cost. Everything observed here was Mono; IL2CPP is per the docs only.
