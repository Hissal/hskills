#!/usr/bin/env python3
# /// script
# requires-python = ">=3.9"
# dependencies = ["pyyaml==6.0.3"]
# ///
"""Run the deterministic part of Sentry's skill-scanner on changed skill and hook files.

Usage:
    uv run scripts/security-scan/scan.py --base <rev>   files changed in <rev>...HEAD
    uv run scripts/security-scan/scan.py <path>...      the named files

Exit 0: no findings. Exit 1: findings, one FAIL line each. Exit 2: usage or setup error.
"""
from __future__ import annotations

import hashlib
import importlib.util
import os
import subprocess
import sys
import urllib.request
from pathlib import Path

# The scanner pin: getsentry/skills commit and the sha256 of its scan_skill.py.
SCANNER_COMMIT = "d12f250460ffd961f549dbebf7eeb0cf4afd4c2e"
SCANNER_SHA256 = "58f6f3f0164b5d1b96378207f9c717dd26554175df30d1ebbc7128fbf5d593ac"
SCANNER_URL = (
    "https://raw.githubusercontent.com/getsentry/skills/"
    f"{SCANNER_COMMIT}/skills/skill-scanner/scripts/scan_skill.py"
)
CODE_SUFFIXES = (".py", ".sh", ".js", ".ts")


class SetupError(Exception):
    pass


def git(root: Path, *args: str) -> str:
    r = subprocess.run(["git", *args], cwd=root, capture_output=True, text=True)
    if r.returncode != 0:
        raise SetupError(f"git {' '.join(args)}: {r.stderr.strip()}")
    return r.stdout


def load_scanner():
    """Fetch the pinned scan_skill.py into the cache once, verify it, import it."""
    cache = Path(os.environ.get("SKILL_SCANNER_CACHE") or Path.home() / ".cache" / "skill-collection" / "skill-scanner")
    file = cache / SCANNER_COMMIT / "scan_skill.py"
    if not file.exists():
        try:
            with urllib.request.urlopen(SCANNER_URL, timeout=60) as resp:
                data = resp.read()
        except OSError as e:
            raise SetupError(f"cannot download {SCANNER_URL}: {e}")
        file.parent.mkdir(parents=True, exist_ok=True)
        file.write_bytes(data)
    digest = hashlib.sha256(file.read_bytes()).hexdigest()
    if digest != SCANNER_SHA256:
        raise SetupError(f"{file} has sha256 {digest}, expected {SCANNER_SHA256}; delete it to refetch")
    spec = importlib.util.spec_from_file_location("scan_skill", file)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def in_scope(rel: str) -> bool:
    return rel.startswith("skills/") or rel.startswith("hooks/")


def skill_dir(root: Path, rel: str) -> str | None:
    """The nearest folder under skills/ holding a SKILL.md, as a repo path."""
    if not rel.startswith("skills/"):
        return None
    parts = rel.split("/")[:-1]
    while len(parts) > 1:
        if (root.joinpath(*parts) / "SKILL.md").is_file():
            return "/".join(parts)
        parts.pop()
    return None


def split_location(location: str) -> tuple[str, int | None]:
    """'SKILL.md:42' -> ('SKILL.md', 42); 'SKILL.md frontmatter' -> ('SKILL.md', None)."""
    if location.endswith(" frontmatter"):
        return location[: -len(" frontmatter")], None
    name, sep, line = location.rpartition(":")
    if sep and line.isdigit():
        return name, int(line)
    return location, None


def scan_file(scanner, root: Path, rel: str) -> list[dict]:
    """The scanner's per-file checks, for files its skill walk does not read."""
    path = root / rel
    if path.is_symlink() or not path.is_file():
        return []
    data = path.read_bytes()
    if b"\0" in data:
        return []
    text = data.decode("utf-8", errors="replace")
    findings = scanner.check_prompt_injection(text, rel)
    findings += scanner.check_obfuscation(text, rel)
    findings += scanner.check_secrets(text, rel)
    if path.suffix in CODE_SUFFIXES:
        findings += [{**f, "location": rel + ":" + f["location"].rpartition(":")[2]} for f in scanner.check_scripts(path)]
    return findings


def scan(scanner, root: Path, changed: list[str]) -> list[tuple[str, int | None, dict]]:
    changed = sorted({rel for rel in changed if in_scope(rel)})
    results: list[tuple[str, int | None, dict]] = []
    covered: set[str] = set()
    for d in sorted({s for s in (skill_dir(root, rel) for rel in changed) if s}):
        report = scanner.scan_skill(root / d)
        if "error" in report:
            raise SetupError(f"{d}: {report['error']}")
        for f in report["findings"]:
            name, line = split_location(f["location"])
            rel = f"{d}/{name}"
            if rel in changed:
                results.append((rel, line, f))
        # Files the skill walk reads; anything else changed gets the per-file checks.
        reads = {"SKILL.md"}
        reads |= {f"references/{n}" for n in report["structure"]["reference_files"]}
        reads |= {f"scripts/{n}" for n in report["structure"]["script_files"]}
        covered |= {f"{d}/{n}" for n in reads}
    for rel in changed:
        if rel not in covered:
            for f in scan_file(scanner, root, rel):
                name, line = split_location(f["location"])
                results.append((rel, line, f))
    return results


def changed_files(root: Path, args: list[str]) -> list[str]:
    if args[:1] == ["--base"] and len(args) == 2:
        out = git(root, "diff", "--name-only", "--diff-filter=d", "--no-renames", "-z", f"{args[1]}...HEAD")
        return [p for p in out.split("\0") if p]
    if args and not any(a.startswith("-") for a in args):
        return [Path(os.path.relpath(Path(a).resolve(), root)).as_posix() for a in args]
    raise SetupError(__doc__.strip().split("\n\n")[1])


def main(argv: list[str]) -> int:
    try:
        root = Path(git(Path.cwd(), "rev-parse", "--show-toplevel").strip())
        changed = changed_files(root, argv)
        scanner = load_scanner()
        results = scan(scanner, root, changed)
    except SetupError as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    for rel, line, f in results:
        where = f"{rel}:{line}" if line else rel
        print(f"FAIL {where} [skill-scanner] {f['severity']} {f['type']}: {f['description']}")
    scanned = sum(1 for rel in changed if in_scope(rel))
    if results:
        files = len({rel for rel, _, _ in results})
        print(f"FAILED: {len(results)} finding(s) in {files} file(s); {scanned} changed skill and hook file(s) scanned")
        return 1
    print(f"ok: {scanned} changed skill and hook file(s) scanned, no findings")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
