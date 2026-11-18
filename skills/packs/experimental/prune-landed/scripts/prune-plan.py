#!/usr/bin/env python3
"""prune-plan: say which local branches, worktrees and stashes hold work that has landed.

  prune-plan.py [--remote R] [--target REF] (--prs FILE | --no-prs) [--recent-days N]

Run it from any worktree of the repository, with python3 (python on Windows)
and git 2.38 or later on PATH. It reads the repository and prints a plan; it
changes no ref, worktree, stash or file.

--target   the ref work must have landed on; default <remote>/HEAD, the
           remote's default branch (--remote defaults to origin)
--prs      a JSON array of the remote's pull requests, each with number,
           state (OPEN, CLOSED or MERGED), headRefName and headRefOid, as
           `gh pr list --state all --limit 10000 --json number,state,headRefName,headRefOid`
           writes it
--no-prs   the remote has no pull requests to read; checks 3 and 4 and the
           open-PR guard then decide nothing
--recent-days  a worktree with a file changed within this many days is
           skipped; default 7

A branch is landed by the first check that holds:
  ancestor        its tip is an ancestor of the target
  merge-tree      merging it into the target gives the target's own tree
  pr-head:#N      its tip is the head of merged PR N
  pr-ancestor:#N  its tip is an ancestor of merged PR N's head
Before those, it is kept when it is the target's branch name (default-branch),
an open PR uses it by name or tip (open-pr:#N), or its worktree is kept or
skipped (worktree-kept). Otherwise it is unresolved, with the PR that last used
its name (merged-pr:#N, closed-pr:#N) or no-pr.

A worktree's committed work is its branch's (or detached HEAD's) verdict. Its
uncommitted changes, and each stash, have landed when the target holds the
same or a later version of every changed file: the file's content is on the
target, or was at some point of the target's history; a deleted file is absent
from the target.

Output, one record per line:
  target: <ref> <sha>
  branch: <verdict> <check> <name> <sha>
  worktree: <verdict> <reason> <branch|detached:sha> <path>
  stash: <verdict> <reason> <sha> <stash@{n}>
  warning: <text>
  summary: landed <n> keep <n> unresolved <n> skipped <n>
Verdicts are landed, keep, unresolved and skipped. Worktree reasons: main,
current, locked, missing (its folder is gone), recent, branch-kept,
branch-unresolved, changes-unlanded:<n>, changes-landed, clean. Stash reasons:
changes-landed, changes-unlanded:<n>.

Exit codes
  0  the plan printed
  2  bad arguments, no target, git older than 2.38, or not a repository;
     the last stderr line is "prune-plan: <reason>"
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
import time

USAGE = __doc__.split("\n\n")[1]
ZERO = "0" * 40


class Stop(Exception):
    pass


def git(*args: str, cwd: str | None = None, stdin: str | None = None, check: bool = True) -> subprocess.CompletedProcess:
    env = dict(os.environ, GIT_TERMINAL_PROMPT="0", LC_ALL="C", GIT_OPTIONAL_LOCKS="0")
    res = subprocess.run(["git", *args], cwd=cwd, input=stdin, capture_output=True, text=True,
                         encoding="utf-8", errors="surrogateescape", env=env)
    if check and res.returncode != 0:
        detail = (res.stderr or res.stdout).strip().splitlines()
        raise Stop(f"git {args[0]} failed: {detail[-1] if detail else 'exit ' + str(res.returncode)}")
    return res


def out(*args: str, cwd: str | None = None) -> str:
    return git(*args, cwd=cwd).stdout.strip()


def rev(name: str) -> str | None:
    res = git("rev-parse", "--verify", "-q", name + "^{commit}", check=False)
    return res.stdout.strip() if res.returncode == 0 else None


def is_ancestor(a: str, b: str) -> bool:
    return git("merge-base", "--is-ancestor", a, b, check=False).returncode == 0


def same_path(a: str, b: str) -> bool:
    return os.path.normcase(os.path.realpath(a)) == os.path.normcase(os.path.realpath(b))


def parse_args(argv: list[str]) -> dict:
    opts = {"remote": "origin", "target": None, "prs": None, "no_prs": False, "recent_days": 7.0}
    it = iter(argv)
    for arg in it:
        if arg in ("-h", "--help"):
            print(__doc__.strip())
            sys.exit(0)
        if arg in ("--remote", "--target", "--prs", "--recent-days"):
            value = next(it, None)
            if value is None:
                raise Stop(f"{arg} needs a value")
            key = arg[2:].replace("-", "_")
            if key == "recent_days":
                try:
                    opts[key] = float(value)
                except ValueError:
                    raise Stop("--recent-days needs a number")
            else:
                opts[key] = value
        elif arg == "--no-prs":
            opts["no_prs"] = True
        else:
            raise Stop(f"unknown argument {arg}\n{USAGE}")
    if bool(opts["prs"]) == opts["no_prs"]:
        raise Stop("give exactly one of --prs FILE or --no-prs")
    return opts


def load_prs(path: str | None) -> list[dict]:
    if not path:
        return []
    try:
        with open(path, encoding="utf-8") as fh:
            data = json.load(fh)
    except (OSError, ValueError) as exc:
        raise Stop(f"cannot read --prs {path}: {exc}")
    if not isinstance(data, list):
        raise Stop("--prs must hold a JSON array")
    prs = []
    for pr in data:
        try:
            prs.append({"number": int(pr["number"]), "state": str(pr["state"]).upper(),
                        "name": str(pr.get("headRefName") or ""), "oid": str(pr.get("headRefOid") or "")})
        except (KeyError, TypeError, ValueError):
            raise Stop("each --prs entry needs number, state, headRefName and headRefOid")
    return prs


def check_git_version() -> None:
    raw = out("version").split()[2]
    parts = (raw.split(".") + ["0"])[:2]
    version = (int(parts[0]), int("".join(c for c in parts[1] if c.isdigit()) or 0))
    if version < (2, 38):
        raise Stop(f"git {raw} is older than 2.38, which merge-tree --write-tree needs")


def resolve_target(opts: dict) -> tuple[str, str, str]:
    """The target ref, its sha, and the default branch's name."""
    ref = opts["target"]
    if ref is None:
        res = git("symbolic-ref", "-q", f"refs/remotes/{opts['remote']}/HEAD", check=False)
        if res.returncode != 0:
            raise Stop(f"{opts['remote']}/HEAD is not set: run `git remote set-head {opts['remote']} --auto`, or pass --target")
        ref = res.stdout.strip()
    sha = rev(ref)
    if sha is None:
        raise Stop(f"target {ref} does not exist")
    full = git("rev-parse", "--symbolic-full-name", ref, check=False).stdout.strip() or ref
    short = full
    for prefix in (f"refs/remotes/{opts['remote']}/", "refs/remotes/", "refs/heads/"):
        if full.startswith(prefix):
            short = full[len(prefix):]
            if prefix == "refs/remotes/":
                short = short.split("/", 1)[-1]
            break
    return ref, sha, short


def local_branches() -> list[tuple[str, str]]:
    lines = out("for-each-ref", "--format=%(refname:short) %(objectname)", "refs/heads/").splitlines()
    return [tuple(line.rsplit(" ", 1)) for line in lines if line]


def worktrees() -> list[dict]:
    trees, cur = [], None
    for line in git("worktree", "list", "--porcelain").stdout.splitlines():
        if line.startswith("worktree "):
            cur = {"path": line[len("worktree "):], "head": None, "branch": None,
                   "locked": False, "prunable": False, "bare": False}
            trees.append(cur)
        elif cur is None:
            continue
        elif line.startswith("HEAD "):
            cur["head"] = line[5:]
        elif line.startswith("branch refs/heads/"):
            cur["branch"] = line[len("branch refs/heads/"):]
        elif line == "bare":
            cur["bare"] = True
        elif line.startswith("locked"):
            cur["locked"] = True
        elif line.startswith("prunable"):
            cur["prunable"] = True
    return trees


class Landing:
    """Answers whether commits and file versions have landed on the target."""

    def __init__(self, target: str, target_sha: str, prs: list[dict]):
        self.target, self.target_sha = target, target_sha
        self.target_tree = out("rev-parse", target_sha + "^{tree}")
        self.history: dict[str, set[str]] = {}
        merged = [pr for pr in prs if pr["state"] == "MERGED" and pr["oid"]]
        present = self._present([pr["oid"] for pr in merged])
        self.missing = sorted({pr["oid"] for pr in merged} - present)
        self.merged = [pr for pr in merged if pr["oid"] in present]
        self._reach: set[str] | None = None

    @staticmethod
    def _present(oids: list[str]) -> set[str]:
        if not oids:
            return set()
        res = git("cat-file", "--batch-check=%(objectname) %(objecttype)", stdin="\n".join(oids) + "\n")
        return {line.split()[0] for line in res.stdout.splitlines() if line.endswith(" commit")}

    def _reachable_from_pr_heads(self) -> set[str]:
        if self._reach is None:
            heads = sorted({pr["oid"] for pr in self.merged})
            if heads:
                res = git("rev-list", "--stdin", stdin="\n".join(heads + ["^" + self.target_sha]) + "\n")
                self._reach = set(res.stdout.split())
            else:
                self._reach = set()
        return self._reach

    def commit_check(self, sha: str) -> str | None:
        if is_ancestor(sha, self.target_sha):
            return "ancestor"
        res = git("merge-tree", "--write-tree", self.target_sha, sha, check=False)
        if res.returncode == 0 and res.stdout.split() and res.stdout.split()[0] == self.target_tree:
            return "merge-tree"
        for pr in self.merged:
            if pr["oid"] == sha:
                return f"pr-head:#{pr['number']}"
        if sha in self._reachable_from_pr_heads():
            for pr in self.merged:
                if is_ancestor(sha, pr["oid"]):
                    return f"pr-ancestor:#{pr['number']}"
        return None

    def _blobs_on_target(self, path: str) -> set[str]:
        if path not in self.history:
            res = git("log", "--format=", "--raw", "--no-abbrev", "--no-renames", "-z", self.target_sha, "--", path)
            blobs = set()
            fields = res.stdout.split("\0")
            for i, field in enumerate(fields):
                field = field.lstrip("\n")
                if field.startswith(":"):
                    parts = field[1:].split()
                    if len(parts) >= 4 and i + 1 < len(fields) and fields[i + 1] == path:
                        blobs.add(parts[3])
            self.history[path] = blobs
        return self.history[path]

    def file_landed(self, path: str, blob: str | None) -> bool:
        """blob None means the change deleted the file."""
        now = git("rev-parse", "--verify", "-q", f"{self.target_sha}:{path}", check=False)
        on_target = now.stdout.strip() if now.returncode == 0 else None
        if blob is None:
            return on_target is None
        return blob == on_target or blob in self._blobs_on_target(path)


def worktree_changes(path: str) -> list[tuple[str, str | None]]:
    """Each uncommitted change in a worktree: (path, blob of its content, or None if deleted)."""
    tracked = [p for p in git("diff", "--name-only", "--no-renames", "-z", "HEAD", cwd=path).stdout.split("\0") if p]
    untracked = [p for p in git("ls-files", "-z", "-o", "--exclude-standard", cwd=path).stdout.split("\0") if p]
    paths = sorted(set(tracked) | set(untracked))
    existing = [p for p in paths if os.path.lexists(os.path.join(path, p))]
    blobs = {}
    if existing:
        res = git("hash-object", "--stdin-paths", cwd=path, stdin="\n".join(existing) + "\n")
        blobs = dict(zip(existing, res.stdout.split()))
    return [(p, blobs.get(p)) for p in paths]


def stash_changes(sha: str) -> list[tuple[str, str | None]]:
    changes = {}
    raw = git("diff", "--raw", "--no-abbrev", "--no-renames", "-z", sha + "^1", sha).stdout.split("\0")
    for i in range(0, len(raw) - 1, 2):
        meta, path = raw[i], raw[i + 1]
        if not meta.startswith(":"):
            continue
        parts = meta[1:].split()
        changes[path] = None if parts[4] == "D" else parts[3]
    if rev(sha + "^3"):
        for entry in git("ls-tree", "-r", "-z", sha + "^3").stdout.split("\0"):
            if entry:
                meta, path = entry.split("\t", 1)
                changes[path] = meta.split()[2]
    return sorted(changes.items())


def newest_change(path: str) -> float:
    newest = 0.0
    files = git("ls-files", "-z", "-c", "-o", "--exclude-standard", cwd=path).stdout.split("\0")
    gitdir = out("rev-parse", "--absolute-git-dir", cwd=path)
    for full in [os.path.join(path, f) for f in files if f] + [os.path.join(gitdir, "index"), os.path.join(gitdir, "HEAD")]:
        try:
            newest = max(newest, os.lstat(full).st_mtime)
        except OSError:
            pass
    return newest


def plan(opts: dict) -> list[str]:
    git("rev-parse", "--git-dir")
    check_git_version()
    prs = load_prs(opts["prs"])
    target, target_sha, default_name = resolve_target(opts)
    landing = Landing(target, target_sha, prs)
    lines = [f"target: {target} {target_sha}"]
    if landing.missing:
        lines.append(f"warning: {len(landing.missing)} merged PR heads are not in this repository; "
                     "fetch refs/pull/*/head so checks 3 and 4 can see them")

    open_prs = [pr for pr in prs if pr["state"] == "OPEN"]
    by_name: dict[str, dict] = {}
    for pr in sorted(prs, key=lambda p: p["number"]):
        if pr["name"]:
            by_name[pr["name"]] = pr

    def raw_verdict(name: str | None, sha: str) -> tuple[str, str]:
        if name is not None and name == default_name:
            return "keep", "default-branch"
        for pr in open_prs:
            if (name is not None and pr["name"] == name) or pr["oid"] == sha:
                return "keep", f"open-pr:#{pr['number']}"
        check = landing.commit_check(sha)
        if check:
            return "landed", check
        pr = by_name.get(name) if name is not None else None
        if pr is not None and pr["state"] in ("MERGED", "CLOSED"):
            return "unresolved", f"{pr['state'].lower()}-pr:#{pr['number']}"
        return "unresolved", "no-pr"

    branches = {name: (sha, *raw_verdict(name, sha)) for name, sha in local_branches()}

    toplevel = git("rev-parse", "--show-toplevel", check=False).stdout.strip()
    now = time.time()
    kept_by_worktree: set[str] = set()
    wt_lines = []
    for index, wt in enumerate(worktrees()):
        path = wt["path"]
        label = wt["branch"] or f"detached:{wt['head'] or ZERO}"
        if index == 0 or wt["bare"]:
            verdict, reason = "keep", "main"
        elif toplevel and same_path(path, toplevel):
            verdict, reason = "keep", "current"
        elif wt["locked"]:
            verdict, reason = "keep", "locked"
        elif wt["prunable"] or not os.path.isdir(path):
            verdict, reason = "landed", "missing"
        elif now - newest_change(path) < opts["recent_days"] * 86400:
            verdict, reason = "skipped", "recent"
        else:
            if wt["branch"] and wt["branch"] in branches:
                commit_verdict = branches[wt["branch"]][1]
            else:
                commit_verdict = raw_verdict(None, wt["head"])[0] if wt["head"] else "unresolved"
            changes = worktree_changes(path)
            unlanded = [p for p, blob in changes if not landing.file_landed(p, blob)]
            if unlanded:
                verdict, reason = "keep", f"changes-unlanded:{len(unlanded)}"
            elif commit_verdict == "keep":
                verdict, reason = "keep", "branch-kept"
            elif commit_verdict == "unresolved":
                verdict, reason = "unresolved", "branch-unresolved"
            else:
                verdict, reason = "landed", "changes-landed" if changes else "clean"
        if wt["branch"] and verdict in ("keep", "skipped") and reason != "branch-kept":
            kept_by_worktree.add(wt["branch"])
        wt_lines.append(f"worktree: {verdict} {reason} {label} {path}")

    counts = {"landed": 0, "keep": 0, "unresolved": 0, "skipped": 0}
    for name in sorted(branches):
        sha, verdict, check = branches[name]
        if name in kept_by_worktree and verdict != "keep":
            verdict, check = "keep", "worktree-kept"
        counts[verdict] += 1
        lines.append(f"branch: {verdict} {check} {name} {sha}")
    for line in wt_lines:
        counts[line.split()[1]] += 1
    lines.extend(wt_lines)

    stashes = git("stash", "list", "--format=%H %gd").stdout.splitlines()
    for entry in stashes:
        sha, ref = entry.split(" ", 1)
        unlanded = [p for p, blob in stash_changes(sha) if not landing.file_landed(p, blob)]
        verdict, reason = ("keep", f"changes-unlanded:{len(unlanded)}") if unlanded else ("landed", "changes-landed")
        counts[verdict] += 1
        lines.append(f"stash: {verdict} {reason} {sha} {ref}")

    lines.append("summary: " + " ".join(f"{k} {v}" for k, v in counts.items()))
    return lines


def main(argv: list[str]) -> int:
    try:
        opts = parse_args(argv)
        for line in plan(opts):
            print(line)
        return 0
    except Stop as exc:
        print(f"prune-plan: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
