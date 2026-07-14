#!/usr/bin/env bash
set -Eeuo pipefail

SITE_ROOT="${SITE_ROOT:-/srv/mrlesk}"
exec 9>"$SITE_ROOT/update.lock"
if ! flock -n 9; then
  echo "A site update or rollback is already running" >&2
  exit 1
fi

current="$(readlink -f "$SITE_ROOT/current" 2>/dev/null || true)"
previous="$(readlink -f "$SITE_ROOT/previous" 2>/dev/null || true)"

if [[ -z "$current" || -z "$previous" || ! -d "$current" || ! -d "$previous" ]]; then
  echo "Both current and previous releases are required for rollback" >&2
  exit 1
fi

atomic_link() {
  local target="$1"
  local link="$2"
  local temporary_link="$SITE_ROOT/.rollback-${link##*/}-$$"
  ln -s "releases/$(basename "$target")" "$temporary_link"
  mv -Tf "$temporary_link" "$link"
}

atomic_link "$previous" "$SITE_ROOT/current"
atomic_link "$current" "$SITE_ROOT/previous"
echo "Rolled back to $(basename "$previous")"
