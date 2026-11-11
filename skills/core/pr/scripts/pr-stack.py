#!/usr/bin/env python3
"""pr-stack: carry a stack of PR branches and push it without losing anyone's work.

  pr-stack.py sync [--remote R] [--upstream U] [--trunk T] <bottom ref> ... <top ref>
  pr-stack.py carry <changed ref>
  pr-stack.py carry --trunk
  pr-stack.py carry --continue | --abort
  pr-stack.py push

Run it from a worktree of the repository, with python3 (python on Windows) and
git on PATH. Name the stack's refs bottom to top, ending at the highest ref you
may rewrite.

sync
  Fetches <remote> (default origin) and <upstream> (default <remote>; the
  repository the PRs merge into, when the stack lives on a fork) with --prune,
  and records each ref's remote SHA, or "absent". Creates each missing local
  branch at its recorded SHA and fast-forwards each local branch that is behind
  it. It rewrites nothing that holds work the remote lacks. <trunk> defaults to
  <upstream>'s default branch. Prints KEY: value lines:
    ref: <ref> <recorded sha|absent>    one per ref, bottom to top
    moved: <ref> <old sha> <new sha>    a local branch it created or fast-forwarded
    held: <ref> <worktree path>         another worktree has the ref checked out
    unpublished: <ref>                  the local branch has commits the remote lacks
    outside: <branch>                   a branch that is not a stack ref points into the stack
    merges: <n>                         merge commits in the stack
    safe: yes | no (<reason>)
  It saves what it recorded for carry and push. Run it before changing a ref.

carry <changed ref> | --trunk
  After you commit a fix on <changed ref>, moves every ref above it onto it
  (with --trunk, moves the whole stack onto <upstream>/<trunk>). The changed
  ref and every ref below it keep their commits. Uses `git rebase
  --update-refs`, or goes branch by branch with `rebase --onto` when there are
  outside branches or merge commits, or git is older than 2.38. Then checks
  that every ref moved and each is an ancestor of the one above; if not, it
  puts every ref back where it stood before the carry. On a conflict it stops
  with the rebase in progress: resolve the files, `git add` them, then run
  `carry --continue`, or `carry --abort` to put every ref back. Several
  changed refs: carry each, bottom first, then push once.

push
  Checks that each ref is an ancestor of the one above it and that every ref
  above a carried one moved. If a check fails, it puts every ref back where it
  stood before the last carry and pushes nothing. Otherwise pushes every ref
  in one atomic push, each leased at the SHA sync recorded (a ref recorded as
  absent is leased as absent), so a push that landed after the sync fails the
  lease and nothing lands. Then records the pushed SHAs.

Exit codes
  0  safe, or done
  1  not safe, a conflict, a failed check, or a rejected push; the last stderr
     line is "pr-stack: <reason>"
  2  bad arguments, no stack recorded, or a ref that exists nowhere

PR_STACK_GIT_VERSION=<x.y> makes it behave as on that git version (for tests).
State lives in <git dir>/pr-stack.json, one per worktree.
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

USAGE = __doc__.split("\n\n")[1]


class Stop(Exception):
    def __init__(self, reason: str, code: int = 1):
        super().__init__(reason)
        self.reason = reason
        self.code = code


def git(*args: str, check: bool = True) -> subprocess.CompletedProcess:
    env = dict(os.environ, GIT_EDITOR="true", GIT_SEQUENCE_EDITOR="true", GIT_TERMINAL_PROMPT="0", LC_ALL="C")
    res = subprocess.run(["git", *args], capture_output=True, text=True, env=env)
    if check and res.returncode != 0:
        detail = (res.stderr or res.stdout).strip().splitlines()
        raise Stop(f"git {args[0]} failed: {detail[-1] if detail else 'exit ' + str(res.returncode)}")
    return res


def out(*args: str) -> str:
    return git(*args).stdout.strip()


def rev(name: str) -> str | None:
    res = git("rev-parse", "--verify", "-q", name + "^{commit}", check=False)
    return res.stdout.strip() if res.returncode == 0 else None


def is_ancestor(a: str, b: str) -> bool:
    return git("merge-base", "--is-ancestor", a, b, check=False).returncode == 0


def git_version() -> tuple[int, int]:
    raw = os.environ.get("PR_STACK_GIT_VERSION") or out("version").split()[2]
    parts = (raw.split(".") + ["0"])[:2]
    return int(parts[0]), int("".join(c for c in parts[1] if c.isdigit()) or 0)


def git_dir() -> Path:
    return Path(out("rev-parse", "--absolute-git-dir"))


def state_path() -> Path:
    return git_dir() / "pr-stack.json"


def load() -> dict:
    path = state_path()
    if not path.exists():
        raise Stop("no stack recorded in this worktree: run sync first", 2)
    return json.loads(path.read_text(encoding="utf-8"))


def save(state: dict) -> None:
    state_path().write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")


def rebase_in_progress() -> bool:
    d = git_dir()
    return (d / "rebase-merge").exists() or (d / "rebase-apply").exists()


def same_path(a: str, b: str) -> bool:
    return os.path.normcase(os.path.realpath(a)) == os.path.normcase(os.path.realpath(b))


def worktrees() -> list[tuple[str, str | None]]:
    """(path, checked-out branch or None) for every worktree."""
    found: list[tuple[str, str | None]] = []
    path: str | None = None
    branch: str | None = None
    for line in out("worktree", "list", "--porcelain").splitlines() + [""]:
        if line.startswith("worktree "):
            path, branch = line[len("worktree "):], None
        elif line.startswith("branch refs/heads/"):
            branch = line[len("branch refs/heads/"):]
        elif not line and path is not None:
            found.append((path, branch))
            path = None
    return found


def here() -> str:
    return out("rev-parse", "--show-toplevel")


def held_elsewhere(refs: list[str]) -> list[tuple[str, str]]:
    me = here()
    return [(b, p) for p, b in worktrees() if b in refs and not same_path(p, me)]


def current_branch() -> str | None:
    res = git("symbolic-ref", "-q", "--short", "HEAD", check=False)
    return res.stdout.strip() if res.returncode == 0 else None


def clean() -> bool:
    return out("status", "--porcelain", "--untracked-files=no") == ""


def stack_base(state: dict, top: str) -> str:
    return out("merge-base", f"{state['upstream']}/{state['trunk']}", top)


def outside_branches(state: dict) -> list[str]:
    refs = state["refs"]
    commits = set(out("rev-list", f"{stack_base(state, refs[-1])}..{refs[-1]}").split())
    found = []
    for line in out("for-each-ref", "--format=%(objectname) %(refname:short)", "refs/heads/").splitlines():
        sha, name = line.split(" ", 1)
        if sha in commits and name not in refs:
            found.append(name)
    return found


def merge_count(state: dict) -> int:
    top = state["refs"][-1]
    return len(out("rev-list", "--merges", f"{stack_base(state, top)}..{top}").split())


def put_back(refs: list[str], heads: dict) -> None:
    """Set every ref to its noted head. Frees this worktree first: git branch -f refuses a checked-out ref."""
    if current_branch() in refs:
        git("switch", "--detach", "-q")
    for ref in refs:
        git("branch", "-f", ref, heads[ref])


# --- sync ------------------------------------------------------------------

def sync(argv: list[str]) -> int:
    opts = {"--remote": "origin", "--upstream": None, "--trunk": None}
    refs: list[str] = []
    it = iter(argv)
    for arg in it:
        if arg in opts:
            value = next(it, None)
            if value is None:
                raise Stop(f"{arg} needs a value", 2)
            opts[arg] = value
        elif arg.startswith("-"):
            raise Stop(f"unknown option {arg}", 2)
        else:
            refs.append(arg)
    if not refs:
        raise Stop("name the stack's refs, bottom to top", 2)
    if len(set(refs)) != len(refs):
        raise Stop("a ref is named twice", 2)
    if rebase_in_progress():
        raise Stop("a rebase is in progress: finish it, or run carry --continue or carry --abort")
    old = state_path()
    if old.exists() and json.loads(old.read_text(encoding="utf-8")).get("pending"):
        raise Stop("a carry is in progress: run carry --continue or carry --abort")
    remote = opts["--remote"]
    upstream = opts["--upstream"] or remote
    git("fetch", "--prune", "-q", remote)
    if upstream != remote:
        git("fetch", "--prune", "-q", upstream)
    trunk = opts["--trunk"]
    if trunk is None:
        res = git("symbolic-ref", "-q", "--short", f"refs/remotes/{upstream}/HEAD", check=False)
        if res.returncode != 0:
            raise Stop(f"{upstream} has no default branch recorded: pass --trunk", 2)
        trunk = res.stdout.strip()[len(upstream) + 1:]
    if rev(f"{upstream}/{trunk}") is None:
        raise Stop(f"{upstream}/{trunk} does not exist", 2)

    recorded = {r: rev(f"refs/remotes/{remote}/{r}") for r in refs}
    lines = [f"ref: {r} {recorded[r] or 'absent'}" for r in refs]
    problems: list[str] = []
    held = dict(held_elsewhere(refs))
    for ref, path in held.items():
        lines.append(f"held: {ref} {path}")
    if held:
        problems.append(f"{len(held)} ref(s) checked out in another worktree")

    for ref in refs:
        local, remote_sha = rev(f"refs/heads/{ref}"), recorded[ref]
        if local is None:
            if remote_sha is None:
                raise Stop(f"{ref} exists neither locally nor on {remote}", 2)
            git("branch", ref, remote_sha)
            lines.append(f"moved: {ref} absent {remote_sha}")
        elif remote_sha is None or local == remote_sha:
            continue
        elif not is_ancestor(local, remote_sha):
            lines.append(f"unpublished: {ref}")
            problems.append(f"{ref} has commits {remote} lacks")
        elif ref in held:
            continue
        else:
            if current_branch() == ref:
                if not clean():
                    problems.append(f"{ref} is behind {remote} and checked out here with changes")
                    continue
                git("switch", "--detach", "-q")
            git("branch", "-f", ref, remote_sha)
            lines.append(f"moved: {ref} {local} {remote_sha}")

    state = {"remote": remote, "upstream": upstream, "trunk": trunk, "refs": refs,
             "recorded": recorded, "safe": not problems, "carries": [], "pending": None}
    if not problems:
        for name in outside_branches(state):
            lines.append(f"outside: {name}")
        lines.append(f"merges: {merge_count(state)}")
    save(state)
    print("\n".join(lines))
    if problems:
        print(f"safe: no ({'; '.join(problems)})")
        raise Stop("not safe: " + "; ".join(problems))
    print("safe: yes")
    return 0


# --- carry -----------------------------------------------------------------

def carry(argv: list[str]) -> int:
    if argv in (["--continue"], ["--abort"]):
        return carry_resume(argv[0])
    if len(argv) != 1:
        raise Stop("carry takes one changed ref, or --trunk, --continue or --abort", 2)
    state = load()
    if state.get("pending") or rebase_in_progress():
        raise Stop("a carry is in progress: run carry --continue or carry --abort")
    if not state["safe"]:
        raise Stop("sync found the stack not safe: fix what it reported and sync again")
    refs = state["refs"]
    if argv[0] == "--trunk":
        changed, base, above = ":trunk", f"{state['upstream']}/{state['trunk']}", refs
    elif argv[0] in refs:
        changed = base = argv[0]
        above = refs[refs.index(changed) + 1:]
    else:
        raise Stop(f"{argv[0]} is not a ref of the recorded stack", 2)
    if not above:
        print(f"carried: nothing above {argv[0]}")
        return 0
    if is_ancestor(base, above[0]):
        print(f"carried: nothing to carry, {above[0]} already sits on {base}")
        return 0
    held = held_elsewhere(refs)
    if held:
        raise Stop("checked out in another worktree: " + ", ".join(f"{r} ({p})" for r, p in held))
    if not clean():
        raise Stop("this worktree has uncommitted changes: commit or stash them first")

    before = {r: rev(f"refs/heads/{r}") for r in refs}
    reasons = []
    if git_version() < (2, 38):
        reasons.append("git older than 2.38")
    outside = outside_branches(state)
    if outside:
        reasons.append("outside branches " + ", ".join(outside))
    if merge_count(state):
        reasons.append("merge commits")
    plan = []
    lower_head = rev(base) if changed == ":trunk" else before[changed]
    for ref in above:
        plan.append([ref, out("merge-base", lower_head, before[ref])])
        lower_head = before[ref]
    pending = {"changed": changed, "base": base, "before": before,
               "mode": "branch" if reasons else "update-refs", "plan": plan, "next": 0}
    print(f"mode: {'branch by branch (' + '; '.join(reasons) + ')' if reasons else 'update-refs'}")
    state["pending"] = pending
    save(state)
    return run_carry(state)


def run_carry(state: dict) -> int:
    pending = state["pending"]
    plan = pending["plan"]
    if pending["mode"] == "update-refs":
        if pending["next"] == 0:
            git("switch", "-q", plan[-1][0])
            pending["next"] = len(plan)
            save(state)
            if git("rebase", "--update-refs", pending["base"], check=False).returncode != 0:
                return conflict(state, plan[-1][0])
    else:
        flag = ["--no-update-refs"] if git_version() >= (2, 38) else []
        while pending["next"] < len(plan):
            i = pending["next"]
            ref, old_base = plan[i]
            onto = pending["base"] if i == 0 else plan[i - 1][0]
            pending["next"] = i + 1
            save(state)
            if git("rebase", *flag, "--onto", onto, old_base, ref, check=False).returncode != 0:
                return conflict(state, ref)
    return finish_carry(state)


def conflict(state: dict, ref: str) -> int:
    if not rebase_in_progress():
        undo_pending(state)
        raise Stop(f"the rebase of {ref} failed without a conflict to resolve; every ref is back where it stood")
    files = out("diff", "--name-only", "--diff-filter=U")
    raise Stop(f"conflict carrying {ref} ({', '.join(files.split()) or 'see git status'}): resolve, git add, "
               "then carry --continue, or carry --abort")


def carry_resume(how: str) -> int:
    state = load()
    if not state.get("pending"):
        raise Stop("no carry in progress", 2)
    if how == "--abort":
        if rebase_in_progress():
            git("rebase", "--abort")
        undo_pending(state)
        print("carried: aborted, every ref is back where it stood before the carry")
        return 0
    if rebase_in_progress():
        if git("rebase", "--continue", check=False).returncode != 0:
            ref = state["pending"]["plan"][max(state["pending"]["next"] - 1, 0)][0]
            return conflict(state, ref)
    return run_carry(state)


def undo_pending(state: dict) -> None:
    put_back(state["refs"], state["pending"]["before"])
    state["pending"] = None
    save(state)


def check_stack(state: dict, before: dict, lowest: int) -> str | None:
    """None when the stack holds; otherwise what failed."""
    refs = state["refs"]
    if lowest < 0 and not is_ancestor(f"{state['upstream']}/{state['trunk']}", refs[0]):
        return f"{refs[0]} does not sit on {state['upstream']}/{state['trunk']}"
    for lower, upper in zip(refs, refs[1:]):
        if not is_ancestor(lower, upper):
            return f"{upper} was left behind: {lower} is not its ancestor"
    for ref in refs[lowest + 1:]:
        if rev(f"refs/heads/{ref}") == before[ref]:
            return f"{ref} was left behind: it did not move"
    return None


def lowest_index(state: dict, changed: str) -> int:
    return -1 if changed == ":trunk" else state["refs"].index(changed)


def finish_carry(state: dict) -> int:
    pending = state["pending"]
    failed = check_stack(state, pending["before"], lowest_index(state, pending["changed"]))
    if failed:
        undo_pending(state)
        raise Stop(failed + "; every ref is back where it stood before the carry")
    state["carries"].append({"changed": pending["changed"], "before": pending["before"]})
    state["pending"] = None
    save(state)
    for ref in state["refs"]:
        now = rev(f"refs/heads/{ref}")
        if now != pending["before"][ref]:
            print(f"carried: {ref} {pending['before'][ref]} {now}")
    return 0


# --- push ------------------------------------------------------------------

def push(argv: list[str]) -> int:
    if argv:
        raise Stop("push takes no arguments", 2)
    state = load()
    if state.get("pending") or rebase_in_progress():
        raise Stop("a carry is in progress: run carry --continue or carry --abort")
    if not state["safe"]:
        raise Stop("sync found the stack not safe: fix what it reported and sync again")
    refs, carries = state["refs"], state["carries"]
    if carries:
        lowest = min(lowest_index(state, c["changed"]) for c in carries)
        failed = check_stack(state, carries[0]["before"], lowest)
    else:
        failed = check_stack(state, {r: None for r in refs}, len(refs))
    if failed:
        if carries:
            put_back(refs, carries[-1]["before"])
            state["carries"] = carries[:-1]
            save(state)
            raise Stop(failed + "; nothing pushed, every ref is back where it stood before the last carry")
        raise Stop(failed + "; nothing pushed")
    leases = [f"--force-with-lease=refs/heads/{r}:{state['recorded'][r] or ''}" for r in refs]
    specs = [f"refs/heads/{r}:refs/heads/{r}" for r in refs]
    res = git("push", "--atomic", "--porcelain", state["remote"], *leases, *specs, check=False)
    if res.returncode != 0:
        rejected = [line for line in res.stdout.splitlines() if line.startswith("!")]
        why = rejected[0].split("\t")[-1] if rejected else (res.stderr.strip().splitlines() or ["push failed"])[-1]
        raise Stop(f"push rejected, nothing pushed ({why}): {state['remote']} changed since sync; "
                   "sync, inspect the other commits and reconcile")
    for ref in refs:
        state["recorded"][ref] = rev(f"refs/heads/{ref}")
        print(f"pushed: {ref} {state['recorded'][ref]}")
    state["carries"] = []
    save(state)
    return 0


def main(argv: list[str]) -> int:
    if not argv or argv[0] in ("-h", "--help", "help"):
        print(__doc__.strip())
        return 0 if argv else 2
    commands = {"sync": sync, "carry": carry, "push": push}
    if argv[0] not in commands:
        print(f"pr-stack: unknown command {argv[0]}\n{USAGE}", file=sys.stderr)
        return 2
    try:
        if git("rev-parse", "--is-inside-work-tree", check=False).returncode != 0:
            raise Stop("run it from a worktree of the repository", 2)
        return commands[argv[0]](argv[1:])
    except Stop as stop:
        sys.stdout.flush()
        print(f"pr-stack: {stop.reason}", file=sys.stderr)
        return stop.code


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
