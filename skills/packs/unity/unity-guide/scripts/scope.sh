#!/usr/bin/env bash
# Grep-only reserialize scope, for when no Editor can run SerializationScope.cs.

usage() {
  cat <<'USAGE'
usage: scope.sh <project> <seed>...

Lists every UnityYAML file under Assets/ and Packages/ that references the seed
scripts, to a fixpoint: each matched prefab adds its own GUID, pulling in nested
instances, variants and scene instances. Paths print relative to <project>, sorted.

  <project>  the folder holding Assets/
  <seed>     a script path, from here or from <project> (its .meta supplies the
             GUID), or a bare 32-hex GUID

Seed with every script whose type serializes the changed type, and their
subclasses. Without the Editor's type closure, hosts reached through subclasses,
nested types or [SerializeReference] fields are missing unless their scripts are
seeded too: say so in the report.

Exit: 0 listed in full (possibly nothing), 1 a seed has no GUID, 2 bad arguments,
3 scope incomplete: a file could not be read, or a matched prefab's GUID could not
be followed. Stderr names each one, and the listing prints what could be read.

With an Editor, use SerializationScope.cs, beside this script: it adds the type
closure this grep lacks. Copy it and call an entry point, treating it as a black
box. Each is public static on the global class SerializationScope. Find and
Reserialize take strings and return a string. <types> is a comma-separated list of
full type names, namespace included.

  Find(types)                   connected Editor, from a scratch copy outside Assets/
  Reserialize(types, pathList)  connected Editor; pathList is the scope's list,
                                one path per line
  FindFromCommandLine,          headless, from a copy in an Editor folder under
  ReserializeFromCommandLine    Assets/ (removed after, with its .meta), reading
                                  -serializationScopeTypes <types>
                                  -serializationScopeOut <file>
                                and, to reserialize,
                                  -serializationScopePaths <file>

Find returns one project-relative path per line, sorted. A line starting with "#"
is a note, and "# scope incomplete" names a file it could not read. Reserialize
skips note lines, re-records each listed scene's prefab overrides, and refuses
while an open scene has unsaved changes.
USAGE
}

set -euo pipefail

case ${1:-} in
  -h|--help)
    usage
    exit 0
    ;;
esac

if [ $# -lt 2 ]; then
  usage >&2
  exit 2
fi

project=$1
shift
patterns=$(mktemp)
matched=$(mktemp)
errors=$(mktemp)
trap 'rm -f "$patterns" "$matched" "$errors"' EXIT

# Prints the GUID from "$1.meta"; prints nothing when the .meta is missing or has none.
guid_of() {
  [ -f "$1.meta" ] || return 0
  sed -n 's/^guid: \([0-9a-f]\{32\}\).*/\1/p' "$1.meta"
}

for seed in "$@"; do
  if [[ $seed =~ ^[0-9a-f]{32}$ ]]; then
    guid=$seed
  else
    guid=$(guid_of "$seed" || true)
    [ -n "$guid" ] || guid=$(guid_of "$project/$seed" || true)
  fi
  if [ -z "$guid" ]; then
    echo "scope.sh: no GUID in $seed.meta" >&2
    exit 1
  fi
  echo "guid: $guid" >> "$patterns"
done

cd "$project"
dirs=(Assets)
[ -d Packages ] && dirs+=(Packages)
incomplete=0

while :; do
  added=0
  code=0
  hits=$(grep -rlF --exclude='*.meta' -f "$patterns" "${dirs[@]}" 2>>"$errors") || code=$?
  if [ "$code" -gt 1 ]; then incomplete=1; fi
  while IFS= read -r file; do
    [ -n "$file" ] || continue
    grep -qxF "$file" "$matched" && continue
    head -c 5 "$file" | grep -q '^%YAML' || continue
    echo "$file" >> "$matched"
    added=1
    case $file in
      *.prefab)
        guid=$(guid_of "$file" || true)
        if [ -n "$guid" ]; then
          echo "guid: $guid" >> "$patterns"
        else
          echo "scope.sh: no GUID in $file.meta: files nesting it were not followed" >&2
          incomplete=1
        fi
        ;;
    esac
  done <<< "$hits"
  [ $added -eq 0 ] && break
done

sort "$matched"

if [ "$incomplete" -eq 1 ]; then
  sort -u "$errors" >&2
  echo "scope.sh: scope incomplete: the errors above name what it could not see. Make them readable and rerun before removing a compatibility attribute." >&2
  exit 3
fi
