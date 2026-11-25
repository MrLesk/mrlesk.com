#!/bin/sh
# Renders frame.html to frame.png at exactly 1920 x 1080. Run it again after every change to frame.html.
cd "$(dirname "$0")" || exit 1
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1920,1080 \
  --screenshot="$PWD/frame.png" "file://$PWD/frame.html"
