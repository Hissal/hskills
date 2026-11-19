#!/usr/bin/env python3
"""Behaviour tests for the prune-landed skill's bundled prune-plan script.

    python3 scripts/prune-landed/test/run.py

Each case builds a scratch repository with a local bare remote, lands work on
its default branch the ways a forge does (merge commit, squash, squash of a
later rewrite), runs prune-plan as the agent would, and observes its exit code
and plan lines. Runs on Linux, macOS and Windows.
"""
from __future__ import annotations

import json
import os
import shutil
import stat
import subprocess
import sys
import tempfile
import time
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SCRIPT = ROOT / "skills/packs/experimental/prune-landed/scripts/prune-plan.py"
MONTH = 30 * 86400

# A run from a git hook would aim these at the outer repository.
GIT_LOCATION = ("GIT_DIR", "GIT_WORK_TREE", "GIT_INDEX_FILE", "GIT_OBJECT_DIRECTORY",
                "GIT_ALTERNATE_OBJECT_DIRECTORIES", "GIT_COMMON_DIR", "GIT_PREFIX")


def run(cwd: Path, *args: str, env: dict | None = None) -> subprocess.CompletedProcess:
    extra = env or {}
    env = {k: v for k, v in os.environ.items() if k not in GIT_LOCATION}
    # No global or system config: a hooksPath or commit signing there would change what the cases see.
    env.update(GIT_CONFIG_GLOBAL=os.devnull, GIT_CONFIG_NOSYSTEM="1", **extra)
    return subprocess.run(list(args), cwd=cwd, capture_output=True, text=True, env=env)


def git(cwd: Path, *args: str) -> str:
    res = run(cwd, "git", *args)
    if res.returncode != 0:
        raise AssertionError(f"git {' '.join(args)} failed in {cwd}: {res.stderr}")
    return res.stdout.strip()


def write(cwd: Path, name: str, text: str) -> None:
    (cwd / name).write_text(text, encoding="utf-8")


def commit(cwd: Path, name: str, text: str, msg: str) -> str:
    write(cwd, name, text)
    git(cwd, "add", name)
    git(cwd, "commit", "-q", "-m", msg)
    return git(cwd, "rev-parse", "HEAD")


def force_remove(func, path, _exc):
    os.chmod(path, stat.S_IWRITE)
    func(path)


class Plan(unittest.TestCase):
    """origin (bare) holds main; `w` is the user's clone, its main worktree on main."""

    def setUp(self) -> None:
        self.tmp = Path(tempfile.mkdtemp(prefix="prune-plan-"))
        self.addCleanup(shutil.rmtree, self.tmp, onerror=force_remove)
        remote = self.tmp / "remote.git"
        git(self.tmp, "init", "-q", "--bare", "-b", "main", str(remote))
        self.w = self.tmp / "w"
        git(self.tmp, "clone", "-q", str(remote), str(self.w))
        for key, value in (("user.email", "t@example.com"), ("user.name", "t"), ("core.autocrlf", "false")):
            git(self.w, "config", key, value)
        git(self.w, "switch", "-q", "-c", "main")
        commit(self.w, "base.txt", "base\n", "base")
        git(self.w, "push", "-q", "-u", "origin", "main")
        git(self.w, "remote", "set-head", "origin", "main")
        self.prs: list[dict] = []

    # helpers -----------------------------------------------------------

    def branch(self, name: str, file: str, text: str) -> str:
        """A branch off main with one commit writing <file>."""
        git(self.w, "switch", "-q", "-c", name, "main")
        sha = commit(self.w, file, text, name)
        git(self.w, "switch", "-q", "main")
        return sha

    def land_merge(self, name: str) -> None:
        git(self.w, "merge", "-q", "--no-ff", "-m", f"merge {name}", name)
        git(self.w, "push", "-q", "origin", "main")

    def land_squash(self, ref: str) -> None:
        git(self.w, "merge", "-q", "--squash", ref)
        git(self.w, "commit", "-q", "-m", f"squash {ref}")
        git(self.w, "push", "-q", "origin", "main")

    def on_main(self, file: str, text: str) -> str:
        sha = commit(self.w, file, text, f"main writes {file}")
        git(self.w, "push", "-q", "origin", "main")
        return sha

    def pr(self, number: int, state: str, name: str, oid: str, base: str = "main") -> None:
        self.prs.append({"number": number, "state": state, "headRefName": name, "headRefOid": oid, "baseRefName": base})

    def worktree(self, name: str) -> Path:
        path = self.tmp / f"wt-{name}"
        git(self.w, "worktree", "add", "-q", str(path), name)
        return path

    def age(self, path: Path) -> None:
        """Make every file in a worktree, and its index, a month old."""
        old = time.time() - MONTH
        gitdir = Path(git(path, "rev-parse", "--absolute-git-dir"))
        for root, dirs, files in os.walk(path):
            dirs[:] = [d for d in dirs if d != ".git"]
            for f in files:
                os.utime(os.path.join(root, f), (old, old))
        for f in ("index", "HEAD"):
            if (gitdir / f).exists():
                os.utime(gitdir / f, (old, old))

    def plan(self, *args: str, code: int = 0, env: dict | None = None) -> list[str]:
        if not any(a in ("--prs", "--no-prs") for a in args) and code == 0:
            prs = self.tmp / "prs.json"
            prs.write_text(json.dumps(self.prs), encoding="utf-8")
            args = ("--prs", str(prs), *args)
        res = run(self.w, sys.executable, str(SCRIPT), *args, env=env)
        self.assertEqual(res.returncode, code, f"prune-plan {' '.join(args)}: {res.stdout}{res.stderr}")
        if code:
            self.assertTrue(res.stderr.strip().splitlines()[-1].startswith("prune-plan: "), res.stderr)
        return res.stdout.splitlines()

    def record(self, lines: list[str], kind: str, name: str) -> list[str]:
        """The fields of the one <kind> record naming <name>: [verdict, check-or-reason, ...]."""
        found = [line.split()[1:] for line in lines if line.startswith(kind + ": ") and name in line.split()]
        self.assertEqual(len(found), 1, f"one {kind} record for {name} in:\n" + "\n".join(lines))
        return found[0]

    def wt_record(self, lines: list[str], path: Path) -> list[str]:
        found = [line.split(None, 4)[1:] for line in lines
                 if line.startswith("worktree: ") and os.path.samefile(line.split(None, 4)[4], path)]
        self.assertEqual(len(found), 1, f"one worktree record for {path} in:\n" + "\n".join(lines))
        return found[0]

    def snapshot(self) -> tuple:
        return (git(self.w, "for-each-ref", "--format=%(refname) %(objectname)"),
                git(self.w, "worktree", "list", "--porcelain"),
                git(self.w, "stash", "list", "--format=%H %gd"),
                git(self.w, "status", "--porcelain"))

    # checks 1-4 --------------------------------------------------------

    def test_check_1_a_branch_merged_with_a_merge_commit_is_landed_as_an_ancestor(self):
        self.branch("merged", "m.txt", "m\n")
        self.land_merge("merged")
        self.assertEqual(self.record(self.plan(), "branch", "merged")[:2], ["landed", "ancestor"])

    def test_check_2_a_squash_merged_branch_is_landed_by_merge_tree(self):
        self.branch("squashed", "s.txt", "s\n")
        self.land_squash("squashed")
        self.on_main("other.txt", "later work\n")
        self.assertEqual(self.record(self.plan(), "branch", "squashed")[:2], ["landed", "merge-tree"])

    def test_check_3_a_branch_at_a_merged_prs_head_is_landed_after_main_moved_on(self):
        tip = self.branch("pr3", "f3.txt", "v1\n")
        self.land_squash("pr3")
        self.on_main("f3.txt", "v2\n")  # merging pr3 now conflicts, so merge-tree cannot decide
        self.pr(3, "MERGED", "pr3", tip)
        self.assertEqual(self.record(self.plan(), "branch", "pr3")[:2], ["landed", "pr-head:#3"])

    def test_check_4_a_branch_behind_a_merged_prs_head_is_landed(self):
        old = self.branch("old4", "f4.txt", "v1\n")
        git(self.w, "switch", "-q", "-c", "pushed4", "old4")
        head = commit(self.w, "f4.txt", "v1\nmore\n", "pushed later")
        git(self.w, "switch", "-q", "main")
        self.land_squash("pushed4")
        git(self.w, "branch", "-q", "-D", "pushed4")
        self.on_main("f4.txt", "v2\n")
        self.pr(4, "MERGED", "pushed4", head)
        self.assertNotEqual(old, head)
        self.assertEqual(self.record(self.plan(), "branch", "old4")[:2], ["landed", "pr-ancestor:#4"])

    def test_a_branch_whose_pr_merged_from_a_later_rewrite_is_unresolved(self):
        self.branch("rewritten", "f5.txt", "draft\n")
        git(self.w, "switch", "-q", "-c", "rewrite5", "main")
        head = commit(self.w, "f5.txt", "final\n", "rewritten")
        git(self.w, "switch", "-q", "main")
        self.land_squash("rewrite5")
        git(self.w, "branch", "-q", "-D", "rewrite5")
        self.pr(5, "MERGED", "rewritten", head)
        self.assertEqual(self.record(self.plan(), "branch", "rewritten")[:2], ["unresolved", "merged-pr:#5"])

    def test_a_branch_with_unlanded_work_and_no_pr_is_unresolved(self):
        self.branch("idea", "idea.txt", "idea\n")
        self.assertEqual(self.record(self.plan(), "branch", "idea")[:2], ["unresolved", "no-pr"])

    # guards ------------------------------------------------------------

    def test_the_default_branch_and_an_open_pr_branch_are_kept_though_landed(self):
        self.branch("wip", "wip.txt", "wip\n")
        self.land_merge("wip")
        self.pr(6, "OPEN", "wip", "0" * 40)
        lines = self.plan()
        self.assertEqual(self.record(lines, "branch", "main")[:2], ["keep", "default-branch"])
        self.assertEqual(self.record(lines, "branch", "wip")[:2], ["keep", "open-pr:#6"])

    def test_a_branch_at_an_open_prs_head_is_kept_under_another_name(self):
        tip = self.branch("copy", "c.txt", "c\n")
        self.land_merge("copy")
        self.pr(7, "OPEN", "elsewhere", tip)
        self.assertEqual(self.record(self.plan(), "branch", "copy")[:2], ["keep", "open-pr:#7"])

    def test_a_pr_merged_into_another_base_does_not_land_its_branch(self):
        tip = self.branch("topic", "t.txt", "t\n")
        self.pr(8, "MERGED", "topic", tip, base="integration")
        self.assertEqual(self.record(self.plan(), "branch", "topic")[:2], ["unresolved", "merged-pr:#8"])

    def test_the_base_of_an_open_pr_is_kept(self):
        self.branch("stack-base", "sb.txt", "sb\n")
        self.land_merge("stack-base")
        self.pr(9, "OPEN", "stack-top", "0" * 40, base="stack-base")
        self.assertEqual(self.record(self.plan(), "branch", "stack-base")[:2], ["keep", "open-pr-base:#9"])

    def test_a_tag_named_like_the_default_branch_leaves_the_guard_working(self):
        git(self.w, "tag", "main")
        self.assertEqual(self.record(self.plan(), "branch", "main")[:2], ["keep", "default-branch"])

    # worktrees ---------------------------------------------------------

    def test_a_recent_worktree_is_skipped_and_its_branch_kept(self):
        self.branch("fresh", "fr.txt", "fr\n")
        self.branch("stale", "st.txt", "st\n")
        self.land_merge("fresh")
        self.land_merge("stale")
        fresh = self.worktree("fresh")
        stale = self.worktree("stale")
        self.age(stale)
        lines = self.plan()
        self.assertEqual(self.wt_record(lines, fresh)[:2], ["skipped", "recent"])
        self.assertEqual(self.record(lines, "branch", "fresh")[:2], ["keep", "worktree-kept"])
        self.assertEqual(self.wt_record(lines, stale)[:2], ["landed", "clean"])
        self.assertEqual(self.record(lines, "branch", "stale")[:2], ["landed", "ancestor"])

    def test_a_worktree_whose_uncommitted_changes_landed_is_removable(self):
        self.branch("done", "d.txt", "d\n")
        self.land_squash("done")
        self.on_main("notes.txt", "first\n")
        self.on_main("notes.txt", "second\n")
        self.on_main("readme.txt", "final\n")
        wt = self.worktree("done")
        write(wt, "readme.txt", "final\n")  # the target holds this exact version
        write(wt, "notes.txt", "first\n")  # the target holds a later version
        self.age(wt)
        lines = self.plan()
        self.assertEqual(self.wt_record(lines, wt)[:2], ["landed", "changes-landed"])
        self.assertEqual(self.record(lines, "branch", "done")[:2], ["landed", "merge-tree"])

    def test_a_worktree_whose_uncommitted_changes_did_not_land_is_kept_with_its_branch(self):
        self.branch("half", "h.txt", "h\n")
        self.land_squash("half")
        wt = self.worktree("half")
        write(wt, "h.txt", "h\nunsaved edit\n")
        write(wt, "new.txt", "untracked\n")
        (wt / "base.txt").unlink()  # the target still has it
        self.age(wt)
        lines = self.plan()
        self.assertEqual(self.wt_record(lines, wt)[:2], ["keep", "changes-unlanded:3"])
        self.assertEqual(self.record(lines, "branch", "half")[:2], ["keep", "worktree-kept"])

    def test_an_unlanded_staged_version_keeps_a_worktree_whose_disk_copy_landed(self):
        self.branch("staged", "st.txt", "st\n")
        self.land_merge("staged")
        wt = self.worktree("staged")
        write(wt, "st.txt", "staged only\n")
        git(wt, "add", "st.txt")
        write(wt, "st.txt", "st\n")  # the disk copy is back to the landed version
        self.age(wt)
        self.assertEqual(self.wt_record(self.plan(), wt)[:2], ["keep", "changes-unlanded:1"])

    def test_an_inherited_git_dir_does_not_hide_a_worktrees_changes(self):
        self.branch("env", "e.txt", "e\n")
        self.land_merge("env")
        wt = self.worktree("env")
        write(wt, "e.txt", "unlanded\n")
        self.age(wt)
        lines = self.plan(env={"GIT_DIR": str(self.w / ".git"), "GIT_WORK_TREE": str(self.w)})
        self.assertEqual(self.wt_record(lines, wt)[:2], ["keep", "changes-unlanded:1"])

    @unittest.skipIf(os.name == "nt", "symbolic links need a POSIX filesystem")
    def test_a_dangling_link_in_a_worktree_is_planned_as_unlanded(self):
        self.branch("link", "l.txt", "l\n")
        self.land_merge("link")
        wt = self.worktree("link")
        self.age(wt)
        os.symlink("nowhere", wt / "dangling")
        os.utime(wt / "dangling", (time.time() - MONTH,) * 2, follow_symlinks=False)
        self.assertEqual(self.wt_record(self.plan(), wt)[:2], ["keep", "changes-unlanded:1"])

    def test_a_recent_file_inside_an_old_ignored_folder_makes_a_worktree_recent(self):
        git(self.w, "switch", "-q", "-c", "build", "main")
        commit(self.w, ".gitignore", "out/\n", "ignore out")
        git(self.w, "switch", "-q", "main")
        self.land_merge("build")
        wt = self.worktree("build")
        (wt / "out").mkdir()
        write(wt / "out", "log.txt", "old\n")
        self.age(wt)
        write(wt / "out", "log.txt", "changed today\n")  # rewriting a file leaves the folder's time alone
        old = time.time() - MONTH
        os.utime(wt / "out", (old, old))
        self.assertEqual(self.wt_record(self.plan(), wt)[:2], ["skipped", "recent"])

    def test_a_worktree_on_an_unresolved_branch_is_unresolved(self):
        self.branch("open-q", "q.txt", "q\n")
        wt = self.worktree("open-q")
        self.age(wt)
        lines = self.plan()
        self.assertEqual(self.wt_record(lines, wt)[:2], ["unresolved", "branch-unresolved"])
        self.assertEqual(self.record(lines, "branch", "open-q")[:2], ["unresolved", "no-pr"])

    def test_the_main_worktree_is_kept(self):
        self.assertEqual(self.wt_record(self.plan(), self.w)[:2], ["keep", "main"])

    def test_a_missing_worktree_on_unlanded_work_is_not_landed(self):
        tip = self.branch("lost", "lost.txt", "lost\n")
        path = self.tmp / "wt-lost"
        git(self.w, "worktree", "add", "-q", "--detach", str(path), tip)
        shutil.rmtree(path, onerror=force_remove)
        lines = self.plan()
        found = [line.split() for line in lines if line.startswith("worktree: ") and line.endswith("wt-lost")]
        self.assertEqual(len(found), 1, "\n".join(lines))
        self.assertEqual(found[0][1:3], ["unresolved", "missing"])

    def test_hidden_edits_in_skip_worktree_and_assume_unchanged_files_keep_a_worktree(self):
        self.branch("hidden", "cfg.txt", "cfg\n")
        self.land_merge("hidden")
        wt = self.worktree("hidden")
        write(wt, "cfg.txt", "local secret\n")
        git(wt, "update-index", "--skip-worktree", "cfg.txt")
        write(wt, "base.txt", "local edit\n")
        git(wt, "update-index", "--assume-unchanged", "base.txt")
        self.age(wt)
        self.assertEqual(self.wt_record(self.plan(), wt)[:2], ["keep", "changes-unlanded:2"])

    def test_a_worktree_mid_rebase_is_kept_with_the_branch_it_rewrites(self):
        self.branch("rebasing", "c.txt", "mine\n")
        self.land_merge("rebasing")
        self.on_main("c.txt", "theirs\n")
        wt = self.worktree("rebasing")
        commit(wt, "c.txt", "mine again\n", "conflicting work")
        self.assertNotEqual(run(wt, "git", "rebase", "origin/main").returncode, 0)  # stops on the conflict
        self.age(wt)
        lines = self.plan()
        self.assertEqual(self.wt_record(lines, wt)[:2], ["keep", "in-progress"])
        self.assertEqual(self.record(lines, "branch", "rebasing")[:2], ["keep", "worktree-kept"])

    def test_a_recent_change_to_an_ignored_file_makes_a_worktree_recent(self):
        git(self.w, "switch", "-q", "-c", "ign", "main")
        commit(self.w, ".gitignore", ".env\n", "ignore env")
        git(self.w, "switch", "-q", "main")
        self.land_merge("ign")
        wt = self.worktree("ign")
        self.age(wt)
        write(wt, ".env", "TOKEN=fresh\n")
        self.assertEqual(self.wt_record(self.plan(), wt)[:2], ["skipped", "recent"])

    # stashes -----------------------------------------------------------

    def test_stashes_are_landed_only_when_every_file_landed(self):
        write(self.w, "base.txt", "base\nedited\n")
        git(self.w, "stash", "push", "-q", "-m", "landed")
        landed = git(self.w, "rev-parse", "stash@{0}")
        write(self.w, "base.txt", "base\nnot on main\n")
        write(self.w, "loose.txt", "untracked\n")
        git(self.w, "stash", "push", "-q", "-u", "-m", "unlanded")
        kept = git(self.w, "rev-parse", "stash@{0}")
        self.on_main("base.txt", "base\nedited\n")
        lines = self.plan()
        self.assertEqual(self.record(lines, "stash", landed)[:2], ["landed", "changes-landed"])
        self.assertEqual(self.record(lines, "stash", kept)[:2], ["keep", "changes-unlanded:2"])

    def test_a_stash_whose_only_change_is_staged_is_kept(self):
        write(self.w, "base.txt", "staged\n")
        git(self.w, "add", "base.txt")
        write(self.w, "base.txt", "base\n")  # the working tree matches HEAD again
        git(self.w, "stash", "push", "-q")
        sha = git(self.w, "rev-parse", "stash@{0}")
        self.assertEqual(self.record(self.plan(), "stash", sha)[:2], ["keep", "changes-unlanded:1"])

    @unittest.skipIf(os.name == "nt", "file modes need a POSIX filesystem")
    def test_a_stash_whose_only_change_is_a_mode_is_kept(self):
        os.chmod(self.w / "base.txt", 0o755)
        git(self.w, "stash", "push", "-q")
        sha = git(self.w, "rev-parse", "stash@{0}")
        self.assertEqual(self.record(self.plan(), "stash", sha)[:2], ["keep", "changes-unlanded:1"])

    def test_a_stash_restoring_a_version_the_target_left_behind_is_kept(self):
        self.on_main("r.txt", "old\n")
        self.on_main("r.txt", "new\n")
        write(self.w, "r.txt", "old\n")  # an old version, not one the target received after the stash's base
        git(self.w, "stash", "push", "-q")
        sha = git(self.w, "rev-parse", "stash@{0}")
        self.assertEqual(self.record(self.plan(), "stash", sha)[:2], ["keep", "changes-unlanded:1"])

    # read-only ---------------------------------------------------------

    def test_a_run_changes_no_ref_worktree_or_stash(self):
        self.branch("merged", "m.txt", "m\n")
        self.land_merge("merged")
        self.branch("idea", "idea.txt", "idea\n")
        wt = self.worktree("merged")
        write(wt, "m.txt", "dirty\n")
        self.age(wt)
        write(self.w, "base.txt", "stashed\n")
        git(self.w, "stash", "push", "-q")
        write(self.w, "loose.txt", "untracked\n")
        before = self.snapshot()
        self.plan()
        self.assertEqual(self.snapshot(), before)

    # bad input ---------------------------------------------------------

    def test_bad_input_exits_2(self):
        self.plan(code=2)  # neither --prs nor --no-prs
        self.plan("--no-prs", "--target", "nowhere", code=2)
        git(self.w, "remote", "set-head", "origin", "--delete")
        self.plan("--no-prs", code=2)


if __name__ == "__main__":
    unittest.main(verbosity=1)
