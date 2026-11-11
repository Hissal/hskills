#!/usr/bin/env python3
"""Behaviour tests for the pr skill's bundled pr-stack script.

    python3 scripts/pr-stack/test/run.py

Each case builds a scratch repository with a local bare remote, runs pr-stack
as the agent would, and observes its exit code, its KEY: value lines, and the
refs left locally and on the remote. Runs on Linux, macOS and Windows.
"""
from __future__ import annotations

import os
import shutil
import stat
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SCRIPT = ROOT / "skills/core/pr/scripts/pr-stack.py"
STACK = ["s1", "s2", "s3"]


def run(cwd: Path, *args: str, env: dict | None = None) -> subprocess.CompletedProcess:
    return subprocess.run(list(args), cwd=cwd, capture_output=True, text=True,
                          env=dict(os.environ, **(env or {})))


def git(cwd: Path, *args: str) -> str:
    res = run(cwd, "git", *args)
    if res.returncode != 0:
        raise AssertionError(f"git {' '.join(args)} failed in {cwd}: {res.stderr}")
    return res.stdout.strip()


def commit(cwd: Path, name: str, text: str, msg: str) -> str:
    (cwd / name).write_text(text, encoding="utf-8")
    git(cwd, "add", name)
    git(cwd, "commit", "-q", "-m", msg)
    return git(cwd, "rev-parse", "HEAD")


def clone(src: Path, dest: Path) -> Path:
    git(src.parent, "clone", "-q", str(src), str(dest))
    git(dest, "config", "user.email", "t@example.com")
    git(dest, "config", "user.name", "t")
    git(dest, "config", "core.autocrlf", "false")
    return dest


def force_remove(func, path, _exc):
    os.chmod(path, stat.S_IWRITE)
    func(path)


class Stack(unittest.TestCase):
    """origin (bare) holds main <- s1 <- s2 <- s3; `w` is the agent's clone, `o` someone else's."""

    def setUp(self) -> None:
        self.tmp = Path(tempfile.mkdtemp(prefix="pr-stack-"))
        self.addCleanup(shutil.rmtree, self.tmp, onerror=force_remove)
        self.remote = self.tmp / "remote.git"
        git(self.tmp, "init", "-q", "--bare", "-b", "main", str(self.remote))
        seed = clone(self.remote, self.tmp / "seed")
        git(seed, "switch", "-q", "-c", "main")
        commit(seed, "base.txt", "base\n", "base")
        for ref in STACK:
            git(seed, "switch", "-q", "-c", ref)
            commit(seed, f"{ref}.txt", f"{ref}\n", ref)
        git(seed, "push", "-q", "origin", "main", *STACK)
        self.w = clone(self.remote, self.tmp / "w")
        self.o = clone(self.remote, self.tmp / "o")

    # helpers -----------------------------------------------------------

    def pr_stack(self, *args: str, env: dict | None = None, cwd: Path | None = None) -> subprocess.CompletedProcess:
        return run(cwd or self.w, sys.executable, str(SCRIPT), *args, env=env)

    def ok(self, *args: str, env: dict | None = None) -> str:
        res = self.pr_stack(*args, env=env)
        self.assertEqual(res.returncode, 0, f"pr-stack {' '.join(args)}: {res.stdout}{res.stderr}")
        return res.stdout

    def fails(self, *args: str, code: int = 1, env: dict | None = None) -> str:
        res = self.pr_stack(*args, env=env)
        self.assertEqual(res.returncode, code, f"pr-stack {' '.join(args)}: {res.stdout}{res.stderr}")
        self.assertTrue(res.stderr.strip().splitlines()[-1].startswith("pr-stack: "), res.stderr)
        return res.stdout + res.stderr

    def heads(self, repo: Path | None = None) -> dict:
        repo = repo or self.w
        return {r: run(repo, "git", "rev-parse", "--verify", "-q", f"refs/heads/{r}").stdout.strip() or None
                for r in STACK}

    def remote_heads(self, remote: Path | None = None) -> dict:
        return self.heads(remote or self.remote)

    def fix(self, ref: str, text: str = "fix\n") -> str:
        git(self.w, "switch", "-q", ref)
        return commit(self.w, f"{ref}.txt", f"{ref}\n{text}", f"fix {ref}")

    def assert_chain(self, base: str = "main") -> None:
        chain = [base, *STACK]
        for lower, upper in zip(chain, chain[1:]):
            self.assertEqual(run(self.w, "git", "merge-base", "--is-ancestor", lower, upper).returncode, 0,
                             f"{lower} is not an ancestor of {upper}")

    def push_from_other(self, ref: str) -> str:
        git(self.o, "fetch", "-q")
        git(self.o, "switch", "-q", ref)
        git(self.o, "reset", "-q", "--hard", f"origin/{ref}")
        sha = commit(self.o, "theirs.txt", "theirs\n", f"theirs on {ref}")
        git(self.o, "push", "-q", "origin", ref)
        return sha

    def push_from_other_creating(self, ref: str) -> None:
        git(self.o, "fetch", "-q")
        git(self.o, "switch", "-q", "-c", f"{ref}-new", "origin/s2")
        commit(self.o, "theirs.txt", "theirs\n", f"theirs creates {ref}")
        git(self.o, "push", "-q", "origin", f"{ref}-new:{ref}")

    def conflict_on(self, ref: str) -> None:
        """Commit on s1 a file that <ref>'s own commit also adds, so carrying <ref> conflicts."""
        git(self.w, "switch", "-q", "s1")
        commit(self.w, f"{ref}.txt", "s1 wrote this\n", f"s1 touches {ref}.txt")

    # cases -------------------------------------------------------------

    def test_carry_moves_every_ref_above_and_keeps_the_changed_refs_commits(self):
        out = self.ok("sync", *STACK)
        self.assertIn("safe: yes", out)
        old_s1 = self.heads()["s1"]
        before = self.heads()
        fix = self.fix("s1")
        out = self.ok("carry", "s1")
        self.assertIn("mode: update-refs", out)
        now = self.heads()
        self.assertEqual(now["s1"], fix)
        self.assertEqual(git(self.w, "rev-parse", "s1~1"), old_s1)
        self.assertNotEqual(now["s2"], before["s2"])
        self.assertNotEqual(now["s3"], before["s3"])
        self.assert_chain()
        self.ok("push")
        self.assertEqual(self.remote_heads(), now)

    def test_a_ref_held_by_another_worktree_is_reported_and_nothing_is_carried(self):
        git(self.w, "branch", "s2", "origin/s2")
        git(self.w, "worktree", "add", "-q", str(self.tmp / "wt2"), "s2")
        git(self.w, "branch", "outside", "origin/s1")
        out = self.fails("sync", *STACK)
        self.assertIn("held: s2 ", out)
        self.assertIn("outside: outside", out)
        self.assertIn("safe: no", out)
        before = self.heads()
        self.fix("s1")
        self.fails("carry", "s1")
        self.assertEqual(self.heads()["s2"], before["s2"])
        self.assertEqual(self.heads()["s3"], before["s3"])

    def test_a_ref_the_rebase_left_behind_is_caught_and_every_ref_goes_back(self):
        # The hook checks s2 out in another worktree once the rebase starts, so --update-refs skips it.
        hook = self.w / ".git" / "hooks" / "pre-rebase"
        hook.write_text(f"#!/bin/sh\ngit worktree add -q '{(self.tmp / 'late').as_posix()}' s2 >/dev/null 2>&1\nexit 0\n",
                        encoding="utf-8")
        hook.chmod(0o755)
        self.ok("sync", *STACK)
        self.fix("s1")
        before_carry = self.heads()
        out = self.fails("carry", "s1")
        self.assertIn("s2 was left behind", out)
        self.assertEqual(self.heads(), before_carry)
        remote_before = self.remote_heads()
        self.fails("push")
        self.assertEqual(self.remote_heads(), remote_before)

    def test_a_commit_made_after_the_carry_is_kept_when_push_finds_the_stack_behind(self):
        self.ok("sync", *STACK)
        self.fix("s1")
        self.ok("carry", "s1")
        fix2 = self.fix("s1", "fix\nfix2\n")
        carried = self.heads()
        remote_before = self.remote_heads()
        out = self.fails("push")
        self.assertIn("changed since the last carry", out)
        self.assertEqual(self.heads(), carried)
        self.assertEqual(self.heads()["s1"], fix2)
        self.assertEqual(self.remote_heads(), remote_before)
        self.ok("carry", "s1")
        self.ok("push")
        self.assertEqual(self.remote_heads()["s1"], fix2)

    def test_carry_refuses_a_ref_another_worktree_took_after_sync(self):
        self.ok("sync", *STACK)
        git(self.w, "worktree", "add", "-q", str(self.tmp / "wt3"), "s3")
        before = self.heads()
        self.fix("s1")
        out = self.fails("carry", "s1")
        self.assertIn("s3", out)
        self.assertEqual(self.heads()["s2"], before["s2"])

    def test_a_stack_on_a_fork_rebases_onto_the_upstream_trunk_and_pushes_to_the_fork(self):
        upstream = self.tmp / "upstream.git"
        git(self.tmp, "clone", "-q", "--bare", str(self.remote), str(upstream))
        u = clone(upstream, self.tmp / "u")
        git(u, "switch", "-q", "main")
        trunk = commit(u, "trunk.txt", "trunk\n", "trunk moved")
        git(u, "push", "-q", "origin", "main")
        git(self.w, "remote", "add", "upstream", str(upstream))
        upstream_before = self.remote_heads(upstream)
        self.ok("sync", "--upstream", "upstream", "--trunk", "main", *STACK)
        self.ok("carry", "--trunk")
        self.assert_chain(trunk)
        self.ok("push")
        self.assertEqual(self.remote_heads(), self.heads())
        self.assertEqual(self.remote_heads(upstream), upstream_before)

    def test_a_ref_absent_from_the_remote_is_leased_as_absent(self):
        git(self.w, "branch", "s3", "origin/s3")
        git(self.w, "push", "-q", "origin", "--delete", "s3")
        out = self.ok("sync", *STACK)
        self.assertIn("ref: s3 absent", out)
        self.push_from_other_creating("s3")
        theirs = self.remote_heads()["s3"]
        remote_before = self.remote_heads()
        out = self.fails("push")
        self.assertIn(f"pushed-by-others: s3 absent {theirs}", out)
        self.assertEqual(self.remote_heads(), remote_before)

    def test_a_ref_absent_from_the_remote_is_created_by_the_push(self):
        git(self.w, "branch", "s3", "origin/s3")
        git(self.w, "push", "-q", "origin", "--delete", "s3")
        self.ok("sync", *STACK)
        self.ok("push")
        self.assertEqual(self.remote_heads(), self.heads())

    def test_a_push_landing_after_the_sync_fails_the_lease_and_nothing_lands(self):
        self.ok("sync", *STACK)
        theirs = self.push_from_other("s2")
        remote_before = self.remote_heads()
        self.fix("s1")
        self.ok("carry", "s1")
        git(self.w, "fetch", "-q")  # a background fetch must not defeat the lease
        out = self.fails("push")
        self.assertIn(f"pushed-by-others: s2 ", out)
        self.assertIn("nothing pushed", out)
        self.assertEqual(self.remote_heads(), remote_before)
        self.assertEqual(self.remote_heads()["s2"], theirs)

    def test_an_outside_branch_stays_put_and_the_carry_goes_branch_by_branch(self):
        git(self.w, "config", "rebase.updateRefs", "true")
        git(self.w, "branch", "outside", "origin/s2")
        out = self.ok("sync", *STACK)
        self.assertIn("outside: outside", out)
        outside = git(self.w, "rev-parse", "outside")
        before = self.heads()
        self.fix("s1")
        out = self.ok("carry", "s1")
        self.assertIn("branch by branch", out)
        self.assertEqual(git(self.w, "rev-parse", "outside"), outside)
        self.assertNotEqual(self.heads()["s3"], before["s3"])
        self.assert_chain()

    def test_git_older_than_2_38_carries_branch_by_branch(self):
        old = {"PR_STACK_GIT_VERSION": "2.37.1"}
        self.ok("sync", *STACK, env=old)
        before = self.heads()
        fix = self.fix("s1")
        out = self.ok("carry", "s1", env=old)
        self.assertIn("git older than 2.38", out)
        self.assertEqual(self.heads()["s1"], fix)
        self.assertNotEqual(self.heads()["s2"], before["s2"])
        self.assertNotEqual(self.heads()["s3"], before["s3"])
        self.assert_chain()
        self.ok("push", env=old)
        self.assertEqual(self.remote_heads(), self.heads())

    def test_a_carry_of_a_middle_ref_leaves_the_refs_below_alone(self):
        self.ok("sync", *STACK)
        before = self.heads()
        self.fix("s2")
        self.ok("carry", "s2")
        self.assertEqual(self.heads()["s1"], before["s1"])
        self.assertNotEqual(self.heads()["s3"], before["s3"])
        self.assert_chain()

    def test_a_stack_with_a_merge_commit_carries_branch_by_branch(self):
        git(self.w, "switch", "-q", "-c", "side", "origin/s2")
        commit(self.w, "side.txt", "side\n", "side")
        git(self.w, "switch", "-q", "-c", "s3", "origin/s3")
        git(self.w, "merge", "-q", "--no-ff", "-m", "merge side", "side")
        git(self.w, "branch", "-D", "side")
        git(self.w, "push", "-q", "origin", "s3")
        self.ok("sync", *STACK)
        before = self.heads()
        self.fix("s1")
        out = self.ok("carry", "s1")
        self.assertIn("merge commits", out)
        self.assertNotEqual(self.heads()["s3"], before["s3"])
        self.assert_chain()
        self.assertIn("side.txt", git(self.w, "ls-tree", "--name-only", "s3").split())

    def test_a_commit_someone_pushed_to_a_lower_ref_is_synced_then_carried(self):
        git(self.w, "branch", "s1", "origin/s1")
        theirs = self.push_from_other("s1")
        out = self.ok("sync", *STACK)
        self.assertIn(f"moved: s1 ", out)
        self.assertEqual(self.heads()["s1"], theirs)
        self.ok("carry", "s1")
        self.assert_chain()
        self.ok("push")
        self.assertEqual(self.remote_heads()["s1"], theirs)

    def test_local_work_the_remote_lacks_makes_sync_unsafe(self):
        self.fix("s1")
        out = self.fails("sync", *STACK)
        self.assertIn("unpublished: s1", out)
        self.fails("carry", "s1")

    def test_a_conflict_stops_the_carry_and_continue_finishes_it(self):
        self.ok("sync", *STACK)
        self.conflict_on("s2")
        self.fails("carry", "s1")
        (self.w / "s2.txt").write_text("resolved\n", encoding="utf-8")
        git(self.w, "add", "s2.txt")
        self.ok("carry", "--continue")
        self.assert_chain()

    def test_abort_puts_back_the_refs_a_branch_by_branch_carry_already_moved(self):
        old = {"PR_STACK_GIT_VERSION": "2.37"}
        self.ok("sync", *STACK, env=old)
        self.conflict_on("s3")
        before = self.heads()
        self.fails("carry", "s1", env=old)
        self.assertNotEqual(self.heads()["s2"], before["s2"])  # s2 carried before s3 conflicted
        self.ok("carry", "--abort", env=old)
        self.assertEqual(self.heads(), before)

    def test_an_undo_blocked_by_another_worktree_moves_no_ref(self):
        old = {"PR_STACK_GIT_VERSION": "2.37"}
        self.ok("sync", *STACK, env=old)
        self.conflict_on("s3")
        self.fails("carry", "s1", env=old)
        carried_s2 = self.heads()
        git(self.w, "worktree", "add", "-q", str(self.tmp / "wt2"), "s2")
        out = self.fails("carry", "--abort", env=old)
        self.assertIn("s2", out)
        self.assertEqual(self.heads(), carried_s2)
        git(self.w, "worktree", "remove", "--force", str(self.tmp / "wt2"))
        self.ok("carry", "--abort", env=old)

    def test_a_tag_named_like_a_ref_does_not_stand_in_for_it(self):
        self.ok("sync", *STACK)
        git(self.w, "tag", "s1", "main")
        fix = self.fix("s1")
        self.ok("carry", "s1")
        self.assertEqual(run(self.w, "git", "merge-base", "--is-ancestor", fix, "refs/heads/s2").returncode, 0)

    def test_a_new_stack_is_recorded_absent_and_never_adopts_a_remote_branch(self):
        # The local group branches share names with branches someone else pushed meanwhile.
        git(self.w, "switch", "-q", "-c", "s1", "origin/main")
        for ref in STACK:
            if ref != "s1":
                git(self.w, "switch", "-q", "-c", ref)
            commit(self.w, f"new-{ref}.txt", "new\n", f"new {ref}")
        mine = self.heads()
        out = self.ok("sync", "--new", *STACK)
        self.assertEqual(self.heads(), mine)
        for ref in STACK:
            self.assertIn(f"ref: {ref} absent", out)
        remote_before = self.remote_heads()
        out = self.fails("push")
        self.assertIn("pushed-by-others: s1 absent", out)
        self.assertEqual(self.remote_heads(), remote_before)

    def test_bad_input_exits_2(self):
        self.fails("carry", "s1", code=2)
        self.fails("sync", "nowhere", "--trunk", "main", code=2)


if __name__ == "__main__":
    unittest.main(verbosity=1)
