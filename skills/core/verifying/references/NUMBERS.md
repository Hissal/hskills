# A reported number is a claim

Broken measurements look like good ones. Failed requests return quickly, a cache skips the work, lazy code never runs, one side keeps its defaults, noise hides the gap, and each still yields a tidy figure. Before you report, trust or act on a measured number (a speedup, a regression, a throughput, a latency, a size, an eval score), find what bounds it and rule out that it timed something other than the work.

This file holds the stack-neutral checks. The stack's measuring tools come from the project's pack guides (step 2 of the skill).

## Before the run

- Draft the claim first, numbers included ("search answers in half the time on the 2 GB index"), and test that draft against the questions below.
- Know what the harness actually times and counts, and what falls outside it.
- Note how loaded the machine is. When you cannot quiet it, interleave the sides so both share the noise, and say so in the report.

When the user wants only a rough figure, a single run will do, provided questions 4 and 7 are answered and the report says it was one run. Comparing options always takes the full set.

## The seven questions

Answer each from a run, not from reading the code.

1. **Why not double?** Identify the bottleneck (a saturated core, a contended lock, disk, network, or the load generator itself) from profiling or system counters gathered in a separate run, since instrumentation slows what it watches, and trace it to source. A change that leaves the number flat is explained by that bottleneck.
2. **Was each side tuned?** Give every side production conditions: optimised builds, the real settings, the cache state real use sees, identical versions and input data. When one side keeps its defaults, the run compares settings rather than code; tune that side and run again before calling a winner.
3. **Does it break physical limits?** Check the arithmetic against the hardware: throughput against disk and network bandwidth, operation rates against the cores available, time saved against the time the changed piece cost. Cutting a piece that takes 20% of a run gives at most a 25% speedup. A result beyond a limit timed something other than the work.
4. **Did it error?** Count failures and non-success responses, and check that outputs are right, not merely there. Errors and successes take different amounts of time. Add a count to the harness when it has none.
5. **Does it reproduce?** Run each side at least five times, interleaved (A, B, A, B) so warm-up and drift hit both, and report the median and the range. A difference inside the run-to-run range is no measurable difference.
6. **Does it matter end to end?** Beside any micro-benchmark, measure the path a user waits on with realistic sizes and concurrency, and state the micro result as its share of that path. A helper that is 2% of a request's time can save at most 2% of it.
7. **Did the work happen?** Check that the timed region did the work: the request was served, the rows landed, the output was consumed. Results nobody reads, work nobody awaited and timeouts all yield numbers for nothing.

## Verdict and report

- Open with the verdict: **faster**, **slower**, **no measurable difference**, or **inconclusive**.
- Then the number with its unit, the run count, the range and the bottleneck: "cold start 2.4 s → 1.9 s, median of 6 runs each, range 1.8–2.0 s after; bound by disk reads".
- The verdict is **inconclusive** when you claim a difference but cannot name the bottleneck, when a side ran untuned, or when question 4 or 7 went unanswered. Name the gap.
- Observed numbers are given exactly; projections only as rough magnitudes.
- Keep the runs, the range and the bottleneck evidence beside the number (a notes file or a linked log) so a reader can check it.

## Metric honesty

A number exists only when a tool measured it. Reading code measures nothing.

- With no tool data, mark the metric **not measured** and label each finding **potential impact**.
- With data, label each value with where it came from (a field measurement, a lab run, a trace), and keep the sources apart: they are not interchangeable.
- An invented number is worse than none.
