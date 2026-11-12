#!/usr/bin/env python3
"""pr-stack: carry a stack of PR branches and push it without losing anyone's work.

  pr-stack.py sync [--remote R] [--upstream U] [--trunk T] [--new] <bottom ref> ... <top ref>
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
  <upstream>'s default branch. With --new (a new stack's first push), every
  ref is recorded as absent whatever the fetch shows, and no local branch
  moves. Prints KEY: value lines:
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
  outside branches or merge commits, or git is older than 2.38; merge commits
  come out linear, so it refuses, moving nothing, when a merge commit holds
  changes beyond its parents' clean merge, or on git older than 2.38 when the
  stack holds any merge commit. Then checks
  that every ref moved and each is an ancestor of the one above; if not, it
  puts every ref back where it stood before the carry. On a conflict it stops
  with the rebase in progress: resolve the files, `git add` them, then run
  `carry --continue`, or `carry --abort` to put every ref back. Several
  changed refs: carry each, bottom first, then push once.

push
  Checks that each ref is an ancestor of the one above it and that every ref
  above a carried one moved. If a check fails, it puts every ref back where it
  stood before the last carry and pushes nothing; when a ref gained commits
  since that carry, it moves nothing and names the ref instead. Otherwise
  pushes every ref in one atomic push, each leased at the SHA sync recorded (a
  ref recorded as absent is leased as absent), so a push that landed after the
  sync fails the lease and nothing lands. Then records the pushed SHAs. When a
  lease fails, it prints, for each ref someone else pushed to:
    pushed-by-others: <ref> <recorded sha|absent> <sha now on the remote|absent>

Exit codes
  0  safe, or done
  1  not safe, a conflict, a failed check, or a rejected push; the last stderr
     line is "pr-stack: <reason>"
  2  bad arguments, no stack recorded, or a ref that exists nowhere

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
    # PR_STACK_GIT_VERSION=<x.y> makes it act as on that git version; the tests use it.
    raw = os.environ.get("PR_STACK_GIT_VERSION") or out("version").split()[2]
    parts = (raw.split(".") + ["0"])[:2]
    return int(parts[0]), int("".join(c for c in parts[1] if c.isdigit()) or 0)


def head(ref: str) -> str:
    """A stack ref's full name, so a tag of the same name never stands in for it."""
    return f"refs/heads/{ref}"


def trunk_ref(state: dict) -> str:
    return f"refs/remotes/{state['upstream']}/{state['trunk']}"


def git_dir() -> Path:
    return Path(out("rev-parse", "--absolute-git-dir"))


def state_path() -> Path:
    return git_dir() / "pr-stack.json"


def load() -> dict:
    path = state_path()
    if not path.exists():
        raise Stop("no stack recorded in this worktree: run sync first", 2)
    return json.loads(path.read_text(encoding="utf-8"))


def load_ready() -> dict:
    state = load()
    if state.get("pending") or rebase_in_progress():
        raise Stop("a carry is in progress: run carry --continue or carry --abort")
    if not state["safe"]:
        raise Stop("sync found the stack not safe: fix what it reported and sync again")
    return state


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


def stack_range(state: dict) -> str:
    top = head(state["refs"][-1])
    return f"{out('merge-base', trunk_ref(state), top)}..{top}"


def outside_branches(state: dict) -> list[str]:
    refs = state["refs"]
    commits = set(out("rev-list", stack_range(state)).split())
    found = []
    for line in out("for-each-ref", "--format=%(objectname) %(refname:short)", "refs/heads/").splitlines():
        sha, name = line.split(" ", 1)
        if sha in commits and name not in refs:
            found.append(name)
    return found


def merge_count(state: dict) -> int:
    return len(out("rev-list", "--merges", stack_range(state)).split())


def merges_with_own_changes(state: dict) -> str | None:
    """The first merge commit in the stack whose tree is not its parents' clean merge, or None."""
    for line in out("rev-list", "--merges", "--parents", stack_range(state)).splitlines():
        sha, *parents = line.split()
        if len(parents) != 2:
            return sha
        res = git("merge-tree", "--write-tree", *parents, check=False)
        if res.returncode != 0 or res.stdout.split()[0] != out("rev-parse", f"{sha}^{{tree}}"):
            return sha
    return None


def put_back(refs: list[str], heads: dict) -> None:
    """Set every ref to its noted head, or move none. git branch -f refuses a checked-out ref, so this
    worktree is freed first, and a ref another worktree holds stops the undo before any ref moves."""
    moving = [r for r in refs if rev(head(r)) != heads[r]]
    held = held_elsewhere(moving)
    if held:
        raise Stop("cannot put the refs back, none moved: checked out in another worktree: "
                   + ", ".join(f"{r} ({p})" for r, p in held) + "; free it, then run the command again")
    reattach = current_branch() if current_branch() in moving else None
    if reattach:
        git("switch", "--detach", "-q")
    for ref in moving:
        git("branch", "-f", ref, heads[ref])
    if reattach:
        git("switch", "-q", reattach)


# --- sync ------------------------------------------------------------------

def sync(argv: list[str]) -> int:
    opts = {"--remote": "origin", "--upstream": None, "--trunk": None}
    new_stack = False
    refs: list[str] = []
    it = iter(argv)
    for arg in it:
        if arg in opts:
            value = next(it, None)
            if value is None:
                raise Stop(f"{arg} needs a value", 2)
            opts[arg] = value
        elif arg == "--new":
            new_stack = True
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
    if state_path().exists() and load().get("pending"):
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
    if rev(f"refs/remotes/{upstream}/{trunk}") is None:
        raise Stop(f"{upstream}/{trunk} does not exist", 2)

    if new_stack:
        recorded = {r: None for r in refs}
    else:
        recorded = {r: rev(f"refs/remotes/{remote}/{r}") for r in refs}
    for ref in refs:
        if rev(head(ref)) is None and recorded[ref] is None:
            raise Stop(f"{ref} exists neither locally nor on {remote}", 2)
    lines = [f"ref: {r} {recorded[r] or 'absent'}" for r in refs]
    problems: list[str] = []
    held = dict(held_elsewhere(refs))
    for ref, path in held.items():
        lines.append(f"held: {ref} {path}")
    if held:
        problems.append(f"{len(held)} ref(s) checked out in another worktree")

    for ref in refs:
        local, remote_sha = rev(head(ref)), recorded[ref]
        if local is None:
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
                git("merge", "--ff-only", "-q", remote_sha)
            else:
                git("branch", "-f", ref, remote_sha)
            lines.append(f"moved: {ref} {local} {remote_sha}")

    state = {"remote": remote, "upstream": upstream, "trunk": trunk, "refs": refs,
             "recorded": recorded, "safe": not problems, "carries": [], "pending": None}
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
    state = load_ready()
    refs = state["refs"]
    if argv[0] == "--trunk":
        changed, base_name, above = None, trunk_ref(state), refs
    elif argv[0] in refs:
        changed, base_name = argv[0], head(argv[0])
        above = refs[refs.index(changed) + 1:]
    else:
        raise Stop(f"{argv[0]} is not a ref of the recorded stack", 2)
    if not above:
        print(f"carried: nothing above {argv[0]}")
        return 0
    base = rev(base_name)
    if is_ancestor(base, head(above[0])):
        print(f"carried: nothing to carry, {above[0]} already sits on {argv[0]}")
        return 0
    held = held_elsewhere(refs)
    if held:
        raise Stop("checked out in another worktree: " + ", ".join(f"{r} ({p})" for r, p in held))
    if not clean():
        raise Stop("this worktree has uncommitted changes: commit or stash them first")

    before = {r: rev(head(r)) for r in refs}
    reasons = []
    if git_version() < (2, 38):
        reasons.append("git older than 2.38")
    outside = outside_branches(state)
    if outside:
        reasons.append("outside branches " + ", ".join(outside))
    if merge_count(state):
        if git_version() < (2, 38):
            raise Stop("the stack holds merge commits, and git older than 2.38 cannot check them for changes "
                       "of their own: nothing moved")
        own = merges_with_own_changes(state)
        if own:
            raise Stop(f"merge commit {own} holds changes its parents' plain merge lacks (a conflict resolution "
                       "or an amendment), which a linear carry would drop: nothing moved")
        reasons.append("merge commits")
    plan = []
    lower_head = base
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
            onto = pending["base"] if i == 0 else rev(head(plan[i - 1][0]))
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


def lowest_index(state: dict, changed: str | None) -> int:
    """The changed ref's place in the stack; -1 for the trunk."""
    return -1 if changed is None else state["refs"].index(changed)


def check_stack(state: dict, tips: dict, before: dict | None = None, lowest: int = -1) -> str | None:
    """None when the refs at `tips` hold as a stack; otherwise what failed. With `before`, every ref
    above `lowest` must also have moved from its head there."""
    refs = state["refs"]
    if before is not None and lowest < 0 and not is_ancestor(trunk_ref(state), tips[refs[0]]):
        return f"{refs[0]} does not sit on {state['upstream']}/{state['trunk']}"
    for lower, upper in zip(refs, refs[1:]):
        if not is_ancestor(tips[lower], tips[upper]):
            return f"{upper} was left behind: {lower} is not its ancestor"
    if before is not None:
        for ref in refs[lowest + 1:]:
            if tips[ref] == before[ref]:
                return f"{ref} was left behind: it did not move"
    return None


def finish_carry(state: dict) -> int:
    pending = state["pending"]
    after = {r: rev(head(r)) for r in state["refs"]}
    failed = check_stack(state, after, pending["before"], lowest_index(state, pending["changed"]))
    if failed:
        undo_pending(state)
        raise Stop(failed + "; every ref is back where it stood before the carry")
    state["carries"].append({"changed": pending["changed"], "before": pending["before"], "after": after})
    state["pending"] = None
    save(state)
    for ref in state["refs"]:
        if after[ref] != pending["before"][ref]:
            print(f"carried: {ref} {pending['before'][ref]} {after[ref]}")
    return 0


# --- push ------------------------------------------------------------------

def push(argv: list[str]) -> int:
    if argv:
        raise Stop("push takes no arguments", 2)
    state = load_ready()
    refs, carries = state["refs"], state["carries"]
    tips = {r: rev(head(r)) for r in refs}
    if carries:
        lowest = min(lowest_index(state, c["changed"]) for c in carries)
        failed = check_stack(state, tips, carries[0]["before"], lowest)
    else:
        failed = check_stack(state, tips)
    if failed and carries:
        last = carries[-1]
        since = [r for r in refs if tips[r] != last["after"][r]]
        if since:
            raise Stop(f"{failed}; nothing pushed and no ref moved: {', '.join(since)} changed since the last "
                       "carry, so carry from the lowest of them, then push")
        put_back(refs, last["before"])
        state["carries"] = carries[:-1]
        save(state)
        raise Stop(failed + "; nothing pushed, every ref is back where it stood before the last carry")
    if failed:
        raise Stop(failed + "; nothing pushed")
    remote = state["remote"]
    leases = [f"--force-with-lease={head(r)}:{state['recorded'][r] or ''}" for r in refs]
    specs = [f"{tips[r]}:{head(r)}" for r in refs]
    res = git("push", "--atomic", "--porcelain", remote, *leases, *specs, check=False)
    if res.returncode != 0:
        others = []
        if git("fetch", "-q", remote, check=False).returncode == 0:
            for ref in refs:
                now = rev(f"refs/remotes/{remote}/{ref}")
                if now != state["recorded"][ref]:
                    others.append(f"pushed-by-others: {ref} {state['recorded'][ref] or 'absent'} {now or 'absent'}")
        print("\n".join(others))
        detail = (res.stderr.strip().splitlines() or ["push failed"])[-1]
        if others:
            raise Stop(f"nothing pushed: someone else pushed to {len(others)} ref(s) since sync")
        raise Stop(f"nothing pushed: {detail}")
    for ref in refs:
        state["recorded"][ref] = tips[ref]
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
