# Running C# in the Editor

Two routes: a connected or resident Editor runs a script live, and a headless launch runs a static method at startup. Take the connected route when one exists. Observed on CLI 1.0.0-beta.15 with Editor 6000.3.20f1 and `com.unity.pipeline` 0.9.1-exp.1.

## Connected: `script run` and `script eval`

`script run` (formerly `run_script`) compiles one C# file in memory, with no domain reload, and calls a static entry point; its return value comes back in `result.result`. `script eval` runs a snippet the same way. Both run arbitrary code in that Editor. Take parameters from `unity command --project-path <project> --detail full --query script`.

- **Exit 0 and `success: true` say nothing about the script.** A script that throws, and a dry run that fails to compile, both exit 0 with envelope `success: true`. The verdict is `result.success`, with `result.error`, `result.errorDetails` and `result.diagnostics` (`id`, `message`, `line`, `column`).
- **`line` in a diagnostic is 0-based**: a first-line error read `line: 0`.
- **`--dry_run true`** compiles that one file against the loaded assemblies and runs nothing. It establishes that file, not the project's compile.
- **A throwaway script goes outside `Assets/`**, in a scratch folder beside it: `script run` still finds it, and Unity never imports it. Delete it when done.
- **`EditorApplication.Exit`** closes the Editor, so it is only for a resident Editor you started.

## Headless: `-executeMethod`

`unity run <project> -- -executeMethod Class.Method` runs a static method from a compiled **Editor** assembly once the project has imported.

- The method must be in the project's compiled code, so it is a real project file: add it for the check and remove it after, with its `.meta`.
- Report failure through the exit code: throw, or call `EditorApplication.Exit(nonZero)`. Call `EditorApplication.Exit(0)` on success so the run ends deterministically. [Reading results](READING-RESULTS.md) has what the CLI then reports.
- Write structured output to a file the method names, or to the log with a tag you can grep.
- A compile error anywhere in the project stops the run before the method (exit 6, `Scripts have compiler errors`).
