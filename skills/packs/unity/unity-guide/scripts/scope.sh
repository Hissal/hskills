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
seeded too: say so in the proposal.

Exit: 0 listed (possibly nothing), 1 a seed has no GUID, 2 bad arguments.
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
trap 'rm -f "$patterns" "$matched"' EXIT

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

while :; do
  added=0
  while IFS= read -r file; do
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
        fi
        ;;
    esac
  done < <(grep -rlF --exclude='*.meta' -f "$patterns" "${dirs[@]}" || true)
  [ $added -eq 0 ] && break
done

sort "$matched"
