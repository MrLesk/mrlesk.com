#!/usr/bin/env bash
set -Eeuo pipefail

SITE_ROOT="${SITE_ROOT:-/srv/mrlesk}"
GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-MrLesk/mrlesk.com}"
ASSET_NAME="${ASSET_NAME:-mrlesk-site.tar.gz}"
API_URL="${GITHUB_API_URL:-https://api.github.com}"
ARCHIVE_PATH=""
CHECKSUM_PATH=""
VERSION=""

usage() {
  cat <<'EOF'
Usage: update-site [--archive FILE --checksum FILE --version NAME]

With no arguments, downloads the newest site-* GitHub Release. The explicit
file arguments are intended for validation and offline bootstrapping.
EOF
}

while (($#)); do
  case "$1" in
    --archive) ARCHIVE_PATH="${2:?Missing value for --archive}"; shift 2 ;;
    --checksum) CHECKSUM_PATH="${2:?Missing value for --checksum}"; shift 2 ;;
    --version) VERSION="${2:?Missing value for --version}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage >&2; exit 2 ;;
  esac
done

if [[ $EUID -ne 0 && ! -w "$SITE_ROOT" ]]; then
  echo "update-site must run as root or be able to write $SITE_ROOT" >&2
  exit 1
fi

mkdir -p "$SITE_ROOT/releases"
exec 9>"$SITE_ROOT/update.lock"
if ! flock -n 9; then
  echo "Another site update is already running"
  exit 0
fi

temporary_directory="$(mktemp -d "${TMPDIR:-/tmp}/mrlesk-update.XXXXXX")"
staging_directory=""
cleanup() {
  rm -rf "$temporary_directory"
  if [[ -n "$staging_directory" ]]; then
    rm -rf "$staging_directory"
  fi
}
trap cleanup EXIT

curl_headers=(-H 'Accept: application/vnd.github+json' -H 'X-GitHub-Api-Version: 2022-11-28')
if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  curl_headers+=(-H "Authorization: Bearer $GITHUB_TOKEN")
fi

if [[ -z "$ARCHIVE_PATH" || -z "$CHECKSUM_PATH" || -z "$VERSION" ]]; then
  if [[ -n "$ARCHIVE_PATH$CHECKSUM_PATH$VERSION" ]]; then
    echo "--archive, --checksum, and --version must be supplied together" >&2
    exit 2
  fi

  releases_json="$temporary_directory/releases.json"
  curl --fail --silent --show-error --location --retry 3 \
    "${curl_headers[@]}" \
    "$API_URL/repos/$GITHUB_REPOSITORY/releases?per_page=20" \
    --output "$releases_json"

  release_json="$temporary_directory/release.json"
  jq '[.[] | select(.draft == false and (.tag_name | startswith("site-")))] | sort_by(.published_at) | last // null' \
    "$releases_json" > "$release_json"
  VERSION="$(jq -r '.tag_name // empty' "$release_json")"

  if [[ -z "$VERSION" ]]; then
    echo "No published site-* release exists yet"
    exit 0
  fi

  archive_url="$(jq -r --arg name "$ASSET_NAME" '.assets[] | select(.name == $name) | .browser_download_url' "$release_json" | head -n 1)"
  checksum_url="$(jq -r --arg name "$ASSET_NAME.sha256" '.assets[] | select(.name == $name) | .browser_download_url' "$release_json" | head -n 1)"
  if [[ -z "$archive_url" || -z "$checksum_url" ]]; then
    echo "Release $VERSION is missing $ASSET_NAME or its checksum" >&2
    exit 1
  fi

  ARCHIVE_PATH="$temporary_directory/$ASSET_NAME"
  CHECKSUM_PATH="$temporary_directory/$ASSET_NAME.sha256"
  curl --fail --silent --show-error --location --retry 3 "${curl_headers[@]}" "$archive_url" --output "$ARCHIVE_PATH"
  curl --fail --silent --show-error --location --retry 3 "${curl_headers[@]}" "$checksum_url" --output "$CHECKSUM_PATH"
fi

if [[ ! "$VERSION" =~ ^[A-Za-z0-9._-]+$ ]]; then
  echo "Unsafe release name: $VERSION" >&2
  exit 1
fi

current_directory="$(readlink -f "$SITE_ROOT/current" 2>/dev/null || true)"
if [[ -n "$current_directory" && "$(basename "$current_directory")" == "$VERSION" ]]; then
  echo "$VERSION is already active"
  exit 0
fi

if [[ ! -f "$ARCHIVE_PATH" || ! -f "$CHECKSUM_PATH" ]]; then
  echo "Release archive or checksum does not exist" >&2
  exit 1
fi

cp "$ARCHIVE_PATH" "$temporary_directory/$ASSET_NAME.local"
cp "$CHECKSUM_PATH" "$temporary_directory/checksum.local"
expected_checksum="$(awk 'NR == 1 { print $1 }' "$temporary_directory/checksum.local")"
actual_checksum="$(sha256sum "$temporary_directory/$ASSET_NAME.local" | awk '{ print $1 }')"
normalized_checksum="$(printf '%s' "$expected_checksum" | tr '[:upper:]' '[:lower:]')"
if [[ ! "$expected_checksum" =~ ^[0-9a-fA-F]{64}$ || "$normalized_checksum" != "$actual_checksum" ]]; then
  echo "Checksum validation failed for $VERSION" >&2
  exit 1
fi

if ! tar -tzf "$temporary_directory/$ASSET_NAME.local" | awk '
  /^\// || /(^|\/)\.\.($|\/)/ || /\\/ { invalid = 1 }
  END { exit invalid ? 1 : 0 }
'; then
  echo "Archive contains an unsafe path" >&2
  exit 1
fi
if ! tar -tvzf "$temporary_directory/$ASSET_NAME.local" | awk '
  substr($1, 1, 1) != "-" && substr($1, 1, 1) != "d" { invalid = 1 }
  END { exit invalid ? 1 : 0 }
'; then
  echo "Archive contains a link or special file" >&2
  exit 1
fi

destination="$SITE_ROOT/releases/$VERSION"
previous_directory_before="$(readlink -f "$SITE_ROOT/previous" 2>/dev/null || true)"
if [[ -e "$destination" && ( -z "$previous_directory_before" || ! "$destination" -ef "$previous_directory_before" ) ]]; then
  echo "Release directory already exists but is not active: $destination" >&2
  exit 1
fi

staging_directory="$SITE_ROOT/releases/.staging-${VERSION}-$$"
mkdir "$staging_directory"
tar -xzf "$temporary_directory/$ASSET_NAME.local" -C "$staging_directory"

metadata="$staging_directory/.release.json"
if [[ ! -f "$staging_directory/index.html" || ! -f "$metadata" ]]; then
  echo "Release is missing index.html or .release.json" >&2
  exit 1
fi
if ! jq -e --arg release "$VERSION" '
  .version == 1 and
  .release == $release and
  (.commit | type == "string") and
  (.commit | test("^[0-9a-f]{40}$")) and
  (.talks | type == "array" and length > 0)
' "$metadata" >/dev/null; then
  echo "Release metadata is invalid or does not match $VERSION" >&2
  exit 1
fi

while IFS= read -r target; do
  if [[ ! "$target" =~ ^talks/[A-Za-z0-9._-]+/[A-Za-z0-9._-]+$ || ! -f "$staging_directory/$target/index.html" ]]; then
    echo "Release is missing a valid talk at $target" >&2
    exit 1
  fi
done < <(jq -r '.talks[].target' "$metadata")

if [[ -e "$destination" ]]; then
  rm -rf "$destination"
fi
mv "$staging_directory" "$destination"
staging_directory=""

atomic_link() {
  local target="$1"
  local link="$2"
  local temporary_link="$SITE_ROOT/.link-${link##*/}-$$"
  ln -s "$target" "$temporary_link"
  mv -Tf "$temporary_link" "$link"
}

old_version=""
if [[ -n "$current_directory" && -d "$current_directory" ]]; then
  old_version="$(basename "$current_directory")"
  atomic_link "releases/$old_version" "$SITE_ROOT/previous"
fi
atomic_link "releases/$VERSION" "$SITE_ROOT/current"

previous_directory="$(readlink -f "$SITE_ROOT/previous" 2>/dev/null || true)"
previous_version="$(basename "$previous_directory" 2>/dev/null || true)"
while IFS= read -r release_directory; do
  release_name="$(basename "$release_directory")"
  if [[ "$release_name" != "$VERSION" && "$release_name" != "$previous_version" ]]; then
    rm -rf "$release_directory"
  fi
done < <(find "$SITE_ROOT/releases" -mindepth 1 -maxdepth 1 -type d -not -name '.staging-*' -print)

echo "Activated $VERSION${old_version:+; previous release is $old_version}"
