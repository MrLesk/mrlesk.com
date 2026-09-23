#!/usr/bin/env bash
# Finishes a render of the composition for posting. The closing card becomes frame 0, so X shows it as the
# thumbnail before playback; colours are tagged BT.709; the mix is lifted to about -15 LUFS through a limiter.
#
#   cd composition && DO_NOT_TRACK=1 npx -y hyperframes@0.8.58 render --fps 60 --quality high --output ../brag-raw.mp4
#   cd .. && ./finish.sh     # reads brag-raw.mp4, writes brag.mp4 and brag.jpg
set -euo pipefail
cd "$(dirname "$0")"
POSTER_AT=39.5 # the install card with its closing line, fully on screen (1.5 s before the end)
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

ffmpeg -y -loglevel error -ss "$POSTER_AT" -i brag-raw.mp4 -frames:v 1 "$work/poster.png"
ffmpeg -y -loglevel error -i brag-raw.mp4 -i "$work/poster.png" -filter_complex \
  "[1:v]scale=out_color_matrix=bt709:out_range=tv,format=yuv420p[p];[0:v][p]overlay=0:0:enable='eq(n,0)':format=yuv420[v];[0:a]volume=6.7dB,alimiter=limit=0.84:attack=3:release=80:level=false[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -c:a aac -b:a 192k -movflags +faststart brag.mp4
ffmpeg -y -loglevel error -i "$work/poster.png" -q:v 2 brag.jpg
rm -f brag-raw.mp4

# Integrated loudness (aim near -15 LUFS) and true peak.
ffmpeg -hide_banner -nostats -i brag.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | head -2
