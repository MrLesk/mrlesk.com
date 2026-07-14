#!/usr/bin/env bash
set -Eeuo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Run this installer with sudo" >&2
  exit 1
fi

script_directory="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for command in curl jq tar flock sha256sum; do
  if ! command -v "$command" >/dev/null; then
    echo "Required command is missing: $command" >&2
    exit 1
  fi
done

install -d -m 0755 /usr/local/libexec/mrlesk /etc/mrlesk /srv/mrlesk/releases
install -m 0755 "$script_directory/update-site.sh" /usr/local/libexec/mrlesk/update-site
install -m 0755 "$script_directory/rollback-site.sh" /usr/local/libexec/mrlesk/rollback-site
install -m 0644 "$script_directory/nginx.conf" /etc/mrlesk/nginx.conf
install -m 0644 "$script_directory/docker-compose.yml" /etc/mrlesk/docker-compose.yml
install -m 0644 "$script_directory/mrlesk-site-update.service" /etc/systemd/system/mrlesk-site-update.service
install -m 0644 "$script_directory/mrlesk-site-update.timer" /etc/systemd/system/mrlesk-site-update.timer

systemctl daemon-reload
systemctl enable --now mrlesk-site-update.timer

echo "Installed the release updater. It will remain idle until a site-* GitHub Release exists."
echo "The Nginx Compose service has not been started."
