#!/usr/bin/env bash
set -Eeuo pipefail

script_directory="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
temporary_directory="$(mktemp -d "${TMPDIR:-/tmp}/mrlesk-update-test.XXXXXX")"
trap 'rm -rf "$temporary_directory"' EXIT
site_root="$temporary_directory/site"
mkdir -p "$site_root"

# macOS has no flock; the production Pi does. A no-op shim lets this test cover
# release validation/switching locally while the real lock is exercised on Linux.
if ! command -v flock >/dev/null; then
  mkdir -p "$temporary_directory/bin"
  printf '#!/bin/sh\nexit 0\n' > "$temporary_directory/bin/flock"
  printf '%s\n' '#!/bin/sh' 'if [ "$1" = "-Tf" ]; then' '  shift' '  /bin/rm -f "$2"' 'fi' 'exec /bin/mv "$@"' > "$temporary_directory/bin/mv"
  chmod +x "$temporary_directory/bin/flock"
  chmod +x "$temporary_directory/bin/mv"
  export PATH="$temporary_directory/bin:$PATH"
fi

make_release() {
  local version="$1"
  local marker="$2"
  local directory="$temporary_directory/$version"
  mkdir -p "$directory/content/talks/demo/deck"
  printf '%s\n' "$marker" > "$directory/content/index.html"
  printf '%s\n' "$marker talk" > "$directory/content/talks/demo/deck/index.html"
  jq -n \
    --arg release "$version" \
    --arg commit '0123456789abcdef0123456789abcdef01234567' \
    '{version: 1, release: $release, commit: $commit, builtAt: "test", talks: [{id: "demo", target: "talks/demo/deck", base: "/talks/demo/deck/"}]}' \
    > "$directory/content/.release.json"
  tar -C "$directory/content" -czf "$directory/mrlesk-site.tar.gz" .
  (cd "$directory" && sha256sum mrlesk-site.tar.gz > mrlesk-site.tar.gz.sha256)
}

activate() {
  local version="$1"
  SITE_ROOT="$site_root" "$script_directory/update-site.sh" \
    --archive "$temporary_directory/$version/mrlesk-site.tar.gz" \
    --checksum "$temporary_directory/$version/mrlesk-site.tar.gz.sha256" \
    --version "$version"
}

version_one='site-0123456789abcdef0123456789abcdef01234567-1-1'
version_two='site-0123456789abcdef0123456789abcdef01234567-2-1'
version_three='site-0123456789abcdef0123456789abcdef01234567-3-1'
make_release "$version_one" one
make_release "$version_two" two
make_release "$version_three" three

activate "$version_one"
activate "$version_two"
activate "$version_three"

[[ "$(basename "$(readlink -f "$site_root/current")")" == "$version_three" ]]
[[ "$(basename "$(readlink -f "$site_root/previous")")" == "$version_two" ]]
[[ ! -e "$site_root/releases/$version_one" ]]
[[ "$(find "$site_root/releases" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')" == 2 ]]
[[ "$(cat "$site_root/current/index.html")" == three ]]

SITE_ROOT="$site_root" "$script_directory/rollback-site.sh"
[[ "$(basename "$(readlink -f "$site_root/current")")" == "$version_two" ]]
[[ "$(basename "$(readlink -f "$site_root/previous")")" == "$version_three" ]]

activate "$version_three"
[[ "$(basename "$(readlink -f "$site_root/current")")" == "$version_three" ]]
[[ "$(basename "$(readlink -f "$site_root/previous")")" == "$version_two" ]]

echo "Updater retention and rollback tests passed"
