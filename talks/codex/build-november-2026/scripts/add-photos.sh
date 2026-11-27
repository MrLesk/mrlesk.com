#!/bin/bash
# Copies pictures and video clips into the deck, made small enough to load fast on a projector.
#
#   bun run photos <folder with the new files> [event folder]
#
# The event folder is a folder under ./photos. Without one, the files go to 07-today.
#
# Pictures (JPEG, PNG, HEIC) become JPEGs of at most 2000 pixels, turned the right way up and
# without their hidden data, such as the place where the picture was taken. Clips (MOV, MP4)
# become small MP4s without sound. The original files are not changed.
#
# Needs ImageMagick (`magick`) for pictures and `ffmpeg` for clips. Both come from Homebrew.
set -euo pipefail

SOURCE="${1:?Name the folder with the new pictures, for example: bun run photos ~/Downloads/today}"
TARGET="$(cd "$(dirname "$0")/.." && pwd)/photos/${2:-07-today}"
mkdir -p "$TARGET"

# Match file endings in capital and small letters, and skip patterns that match nothing.
shopt -s nullglob nocaseglob

added=0

for picture in "$SOURCE"/*.{jpg,jpeg,png,heic,heif}; do
  name="$(basename "${picture%.*}")"
  magick "$picture" -auto-orient -resize '2000x2000>' -strip -quality 82 "$TARGET/$name.jpg"
  added=$((added + 1))
done

for clip in "$SOURCE"/*.{mov,mp4,m4v}; do
  name="$(basename "${clip%.*}")"
  # At most 1280 pixels high, no sound, and ready to play before the whole file has loaded.
  ffmpeg -v error -y -i "$clip" -vf "scale=-2:'min(1280,ih)'" -an -c:v libx264 -crf 24 -pix_fmt yuv420p -movflags +faststart "$TARGET/$name.mp4"
  added=$((added + 1))
done

echo "Added $added files to $TARGET"
