#!/usr/bin/env python3
"""Behaviour tests for the bundled pr-wait watcher.

    python3 scripts/pr-wait/test/run.py

pr-wait ships in babysit-pr. GitHub is faked by replacing the script's `gh`
function, its one boundary to the outside: each case scripts what `gh` answers
and observes what pr-wait prints, how it exits, and what it reports next poll.
"""
from __future__ import annotations

import contextlib
import importlib.machinery
import importlib.util
import io
import json
import sys
import tempfile
import unittest
from pathlib import Path
from types import ModuleType
from typing import Any, Callable

# Loading a copy must leave no __pycache__ in the shipped skill folder.
sys.dont_write_bytecode = True

ROOT = Path(__file__).resolve().parents[3]
COPIES = [ROOT / "skills/packs/in-progress/babysit-pr/scripts/pr-wait"]
REPO = "octo/repo"
PR = 7
HEAD = "a" * 40


def load(path: Path) -> ModuleType:
    loader = importlib.machinery.SourceFileLoader(f"pr_wait_{path.parent.parent.name.replace('-', '_')}", str(path))
    spec = importlib.util.spec_from_loader(loader.name, loader)
    assert spec is not None
    module = importlib.util.module_from_spec(spec)
    loader.exec_module(module)
    return module


def pr_payload(query: str, base: str = "main", base_oid: str = "b" * 40, threads: list[dict[str, Any]] | None = None,
               thread_total: int | None = None, reviews: list[dict[str, Any]] | None = None,
               comments: list[dict[str, Any]] | None = None, history: list[str] | None = None) -> str:
    """The GraphQL answer for one poll. totalCount appears only when the query asks for it.
    A query for the repo's merged PRs gets `history`: the logins that reviewed them."""
    if "pullRequests(" in query:
        merged = [{"reviews": {"nodes": [{"author": {"login": login, "__typename": "Bot"}}]}} for login in history or []]
        return json.dumps({"data": {"repository": {"pullRequests": {"nodes": merged}}}})
    thread_nodes = threads or []
    review_threads: dict[str, Any] = {"nodes": thread_nodes}
    if "totalCount" in query:
        review_threads["totalCount"] = len(thread_nodes) if thread_total is None else thread_total
    return json.dumps({"data": {
        "viewer": {"login": "me"},
        "repository": {"pullRequest": {
            "url": f"https://github.com/{REPO}/pull/{PR}",
            "state": "OPEN", "headRefOid": HEAD, "baseRefName": base, "mergeStateStatus": "CLEAN",
            "author": {"login": "me", "__typename": "User"},
            "baseRef": {"target": {"oid": base_oid}},
            "comments": {"nodes": comments or []},
            "reviews": {"nodes": reviews or []},
            "reviewThreads": review_threads,
        }},
    }})


class Proc:
    def __init__(self, stdout: str = "", stderr: str = "", returncode: int = 0) -> None:
        self.stdout, self.stderr, self.returncode = stdout, stderr, returncode


class PrWaitCase(unittest.TestCase):
    module: ModuleType

    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.module.STATE_DIR = Path(self.tmp.name)

    def watcher(self, until: str, state: dict[str, Any] | None = None) -> Any:
        """A watcher past its baseline: a state file exists, as after an earlier run."""
        path = Path(self.tmp.name) / f"{REPO.replace('/', '__')}__{PR}.json"
        path.write_text(json.dumps(state or {"reported": [], "summaries": {}, "base_oid": None, "merge_state": None}))
        return self.module.Watcher(REPO, PR, until, 5)

    def poll(self, watcher: Any, gh: Callable[[list[str]], Proc]) -> tuple[int | None, list[str]]:
        """One poll against a fake gh. Returns the exit code (None when it keeps watching) and stdout lines."""
        module = self.module

        def fake(args: list[str], allow: tuple[int, ...] = (0,)) -> Proc:
            proc = gh(args)
            if proc.returncode not in allow:
                raise module.GhError(proc.stderr or f"gh exited {proc.returncode}", False)
            return proc

        module.gh = fake
        out = io.StringIO()
        code: int | None = None
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(io.StringIO()):
            try:
                watcher.poll()
            except SystemExit as stop:
                code = int(stop.code or 0)
        return code, [line for line in out.getvalue().splitlines() if line]


def checks(*rows: tuple[str, str]) -> Proc:
    return Proc(json.dumps([{"name": n, "bucket": b, "link": f"https://ci/{n}", "description": ""} for n, b in rows]))


def not_found() -> Proc:
    return Proc(stderr="gh: Not Found (HTTP 404)", returncode=1)


class RequiredChecks(PrWaitCase):
    def test_a_retargeted_pr_is_gated_by_the_new_base_required_checks(self) -> None:
        required = {"main": "lint", "release": "build"}
        state = {"base": "main", "checks": checks(("lint", "pending"), ("build", "pending"))}

        def gh(args: list[str]) -> Proc:
            if args[:2] == ["api", "graphql"]:
                return Proc(pr_payload(args[3], base=state["base"]))
            if args[:2] == ["pr", "checks"]:
                return state["checks"]
            if args[0] == "api" and "/rules/branches/" in args[1]:
                return Proc(required[args[1].rsplit("/", 1)[1]] + "\n")
            if args[0] == "api" and "/protection/" in args[1]:
                return not_found()
            raise AssertionError(f"unexpected gh call {args}")

        watcher = self.watcher("green")
        self.assertEqual(self.poll(watcher, gh), (None, []))
        state["base"] = "release"
        state["checks"] = checks(("lint", "pass"), ("build", "fail"))
        code, lines = self.poll(watcher, gh)
        self.assertEqual(code, 1)
        self.assertIn(f"#{PR} required check failed: build https://ci/build", lines)


class ReviewThreads(PrWaitCase):
    def test_ready_is_never_reported_when_more_threads_exist_than_were_read(self) -> None:
        resolved = [{"isResolved": True, "path": "a.py", "line": 1, "comments": {"nodes": [
            {"id": f"t{i}", "url": f"https://github.com/{REPO}/pull/{PR}#t{i}", "body": "x", "author": {"login": "me", "__typename": "User"}}]}}
            for i in range(100)]
        greptile = [{"id": "r1", "url": "u", "state": "COMMENTED", "body": "", "commit": {"oid": HEAD},
                     "author": {"login": "greptile-apps", "__typename": "Bot"}}]

        def gh(args: list[str]) -> Proc:
            if args[:2] == ["api", "graphql"]:
                return Proc(pr_payload(args[3], threads=resolved, thread_total=101, reviews=greptile))
            if args[:2] == ["pr", "checks"]:
                return checks(("lint", "pass"))
            if args[0] == "api" and ("/rules/branches/" in args[1] or "/protection/" in args[1]):
                return not_found()
            if args[0] == "api" and "/compare/" in args[1]:
                return Proc("0\n")
            raise AssertionError(f"unexpected gh call {args}")

        watcher = self.watcher("ready")
        self.assertEqual(self.poll(watcher, gh)[0], None)
        code, lines = self.poll(watcher, gh)
        self.assertEqual(code, 1)
        self.assertFalse([line for line in lines if " ready on " in line], lines)
        self.assertTrue([line for line in lines if "101 review threads" in line and "100" in line], lines)

    def test_ready_is_reported_when_every_thread_was_read_and_resolved(self) -> None:
        resolved = [{"isResolved": True, "path": "a.py", "line": 1, "comments": {"nodes": [
            {"id": "t1", "url": "u", "body": "x", "author": {"login": "me", "__typename": "User"}}]}}]
        greptile = [{"id": "r1", "url": "u", "state": "COMMENTED", "body": "", "commit": {"oid": HEAD},
                     "author": {"login": "greptile-apps", "__typename": "Bot"}}]

        def gh(args: list[str]) -> Proc:
            if args[:2] == ["api", "graphql"]:
                return Proc(pr_payload(args[3], threads=resolved, reviews=greptile))
            if args[:2] == ["pr", "checks"]:
                return checks(("lint", "pass"))
            if args[0] == "api" and ("/rules/branches/" in args[1] or "/protection/" in args[1]):
                return not_found()
            if args[0] == "api" and "/compare/" in args[1]:
                return Proc("0\n")
            raise AssertionError(f"unexpected gh call {args}")

        watcher = self.watcher("ready")
        self.poll(watcher, gh)
        code, lines = self.poll(watcher, gh)
        self.assertEqual(code, 0)
        self.assertTrue([line for line in lines if line.startswith(f"#{PR} ready on {HEAD[:7]}")], lines)


class BaseMoves(PrWaitCase):
    def test_a_failed_base_compare_is_retried_on_the_next_poll(self) -> None:
        old, new = "1" * 40, "2" * 40
        compare = {"fails": True}

        def gh(args: list[str]) -> Proc:
            if args[:2] == ["api", "graphql"]:
                return Proc(pr_payload(args[3], base_oid=new))
            if args[:2] == ["pr", "checks"]:
                return checks(("lint", "pending"))
            if args[0] == "api" and ("/rules/branches/" in args[1] or "/protection/" in args[1]):
                return not_found()
            if args[:2] == ["pr", "diff"]:
                return Proc("src/app.py\n")
            if args[0] == "api" and args[1] == f"repos/{REPO}/compare/{old}...{new}":
                return Proc(stderr="gh: Bad credentials (HTTP 401)", returncode=1) if compare["fails"] else Proc("src/app.py\n")
            raise AssertionError(f"unexpected gh call {args}")

        watcher = self.watcher("any-change", {"reported": [], "summaries": {}, "base_oid": old, "merge_state": None})
        self.assertEqual(self.poll(watcher, gh), (None, []))
        compare["fails"] = False
        code, lines = self.poll(watcher, gh)
        self.assertEqual(code, 0)
        self.assertIn(f"#{PR} main moved to {new[:7]} and touches files in this PR: src/app.py", lines)


def bot_review(login: str, oid: str = HEAD) -> dict[str, Any]:
    return {"id": f"r-{login}-{oid[:4]}", "url": "u", "state": "COMMENTED", "body": "", "commit": {"oid": oid},
            "author": {"login": login, "__typename": "Bot"}}


class ReviewBots(PrWaitCase):
    """ready waits for the review bots the repository uses, whatever they are called."""

    def gh_for(self, pr: dict[str, Any], lint: str = "pass", extra: list[tuple[str, str]] | None = None) -> Callable[[list[str]], Proc]:
        def gh(args: list[str]) -> Proc:
            if args[:2] == ["api", "graphql"]:
                return Proc(pr_payload(args[3], **pr))
            if args[:2] == ["pr", "checks"]:
                return checks(("lint", lint), *(extra or []))
            if args[0] == "api" and ("/rules/branches/" in args[1] or "/protection/" in args[1]):
                return not_found()
            if args[0] == "api" and "/compare/" in args[1]:
                return Proc("0\n")
            raise AssertionError(f"unexpected gh call {args}")
        return gh

    def clock(self, start: float = 1000.0) -> dict[str, float]:
        now = {"t": start}
        self.module.now = lambda: now["t"]
        return now

    def ready_lines(self, lines: list[str]) -> list[str]:
        return [line for line in lines if line.startswith(f"#{PR} ready on {HEAD[:7]}")]

    def test_a_bot_that_reviewed_recent_prs_gates_ready_until_it_reviews_the_head(self) -> None:
        self.clock()
        pr: dict[str, Any] = {"history": ["reviewbot"]}
        watcher = self.watcher("ready")
        self.assertEqual(self.poll(watcher, self.gh_for(pr)), (None, []))
        code, lines = self.poll(watcher, self.gh_for(pr))
        self.assertEqual(code, None, lines)
        self.assertFalse(self.ready_lines(lines), lines)
        pr["reviews"] = [bot_review("reviewbot")]
        code, lines = self.poll(watcher, self.gh_for(pr))
        self.assertEqual(code, 0)
        self.assertTrue(self.ready_lines(lines), lines)

    def test_ready_needs_no_bot_when_the_repository_uses_none(self) -> None:
        self.clock()
        watcher = self.watcher("ready")
        self.poll(watcher, self.gh_for({}))
        code, lines = self.poll(watcher, self.gh_for({}))
        self.assertEqual(code, 0)
        self.assertTrue(self.ready_lines(lines), lines)

    def test_a_bot_already_on_this_pr_gates_ready_on_the_new_head(self) -> None:
        self.clock()
        pr: dict[str, Any] = {"reviews": [bot_review("otherbot", oid="c" * 40)]}
        watcher = self.watcher("ready")
        self.poll(watcher, self.gh_for(pr))
        code, lines = self.poll(watcher, self.gh_for(pr))
        self.assertEqual(code, None, lines)

    def test_a_bot_summary_naming_the_head_counts_as_its_review(self) -> None:
        self.clock()
        summary = {"id": "c1", "url": "u", "body": f"Reviewed up to {HEAD[:7]}",
                   "author": {"login": "summarybot", "__typename": "Bot"}}
        pr: dict[str, Any] = {"history": ["summarybot"], "comments": [summary]}
        watcher = self.watcher("ready")
        self.poll(watcher, self.gh_for(pr))
        code, lines = self.poll(watcher, self.gh_for(pr))
        self.assertEqual(code, 0)
        self.assertTrue(self.ready_lines(lines), lines)

    def test_a_bot_with_a_running_check_is_done_when_its_check_finishes(self) -> None:
        self.clock()
        pr: dict[str, Any] = {"history": ["scopebotapp"]}
        watcher = self.watcher("ready")
        self.poll(watcher, self.gh_for(pr, extra=[("ScopeBot review", "pending")]))
        code, _ = self.poll(watcher, self.gh_for(pr, extra=[("ScopeBot review", "pending")]))
        self.assertEqual(code, None)
        self.poll(watcher, self.gh_for(pr, extra=[("ScopeBot review", "pass")]))
        code, lines = self.poll(watcher, self.gh_for(pr, extra=[("ScopeBot review", "pass")]))
        self.assertEqual(code, 0)
        self.assertTrue(self.ready_lines(lines), lines)

    def test_a_bot_that_skips_the_head_stops_gating_after_the_grace_period(self) -> None:
        now = self.clock()
        pr: dict[str, Any] = {"history": ["reviewbot"]}
        watcher = self.watcher("ready")
        self.poll(watcher, self.gh_for(pr))
        self.assertEqual(self.poll(watcher, self.gh_for(pr))[0], None)
        now["t"] += self.module.BOT_GRACE_SECONDS + 1
        code, lines = self.poll(watcher, self.gh_for(pr))
        self.assertEqual(code, 0)
        self.assertTrue([line for line in lines if "reviewbot" in line and "not reviewed" in line], lines)
        self.assertTrue(self.ready_lines(lines), lines)

    def test_a_bot_that_only_comments_does_not_gate_ready(self) -> None:
        self.clock()
        note = {"id": "c2", "url": "u", "body": "No changeset found", "author": {"login": "changeset-bot", "__typename": "Bot"}}
        watcher = self.watcher("ready")
        self.poll(watcher, self.gh_for({"comments": [note]}))
        code, lines = self.poll(watcher, self.gh_for({"comments": [note]}))
        self.assertEqual(code, 0)
        self.assertTrue(self.ready_lines(lines), lines)

    def test_ci_and_deploy_bots_never_gate_ready(self) -> None:
        self.clock()
        pr: dict[str, Any] = {"history": ["github-actions", "vercel"]}
        watcher = self.watcher("ready")
        self.poll(watcher, self.gh_for(pr))
        code, lines = self.poll(watcher, self.gh_for(pr))
        self.assertEqual(code, 0)
        self.assertTrue(self.ready_lines(lines), lines)


def suite() -> unittest.TestSuite:
    tests = unittest.TestSuite()
    for path in COPIES:
        module = load(path)
        for case in (RequiredChecks, ReviewThreads, BaseMoves, ReviewBots):
            bound = type(f"{case.__name__}[{path.parent.parent.name}]", (case,), {"module": module})
            tests.addTests(unittest.defaultTestLoader.loadTestsFromTestCase(bound))
    return tests


if __name__ == "__main__":
    result = unittest.TextTestRunner(verbosity=1).run(suite())
    sys.exit(0 if result.wasSuccessful() else 1)
