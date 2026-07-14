# Static site deployment

The Raspberry Pi never builds this repository. GitHub Actions builds Astro and
only the talks affected by a change, assembles a complete static archive, and
publishes it as a `site-*` GitHub Release.

The Pi pulls rather than accepting an inbound deployment:

1. `mrlesk-site-update.timer` checks the public GitHub Releases API every five minutes.
2. The updater downloads the archive and checksum into a temporary directory.
3. It validates the checksum, archive paths, release metadata, site, and every talk.
4. It moves the release under `/srv/mrlesk/releases/` and atomically switches the
   `/srv/mrlesk/current` symlink.
5. It keeps only `current` and `previous`.

Nginx is the only application container. It serves `/srv/mrlesk/current` and has
a generic fallback for any `/talks/<group>/<talk>/` route, so adding a talk does
not require a new Dockerfile, container, or Nginx location.

## Before the first push

Disable the existing Coolify application's Git push auto-deploy. Its old root
Dockerfile still compiles every deck on the Pi and must not be triggered during
the migration.

The workflow explicitly grants its `GITHUB_TOKEN` `contents: write` so it can
create Releases. If an organization policy forbids write-capable workflow
tokens, that policy must allow this repository before the publish job can run.

## Install the pull updater on the Pi

From a checkout on the Pi:

```sh
sudo deploy/pi/install.sh
systemctl list-timers mrlesk-site-update.timer
```

The repository is public, so the updater needs no GitHub credential and the Pi
needs no inbound port. For a private repository, put a fine-grained read-only
token in `/etc/default/mrlesk-site-update` as `GITHUB_TOKEN=...`.

## Create the Nginx service in Coolify

Create one **Docker Compose / Empty** resource in Coolify and use the contents of
`deploy/pi/docker-compose.yml`. The service only pulls the small official Nginx
image; it has no build step. The same file is installed at
`/etc/mrlesk/docker-compose.yml` for non-Coolify recovery:

```sh
docker compose -f /etc/mrlesk/docker-compose.yml up -d
```

Do not start it until the first GitHub Release has been downloaded, because the
`current` symlink does not exist before then. The first matching push performs a
complete build automatically; the manual `full_rebuild` workflow is also
available. Then either wait five minutes or trigger:

```sh
sudo systemctl start mrlesk-site-update.service
readlink -f /srv/mrlesk/current
```

After `curl http://127.0.0.1:8321/healthz` and the public site both work, remove
the old build-based Coolify application.

## Add another talk

Add one entry to `deploy/talks.json`. `source` is the talk directory, `target` is
its public directory, `base` is its URL with leading and trailing slashes, and
`watch` lists shared theme directories that should rebuild it. Changing the
manifest intentionally causes one complete release build.

## Roll back

```sh
sudo /usr/local/libexec/mrlesk/rollback-site
```

Rollback swaps `current` and `previous` atomically. The next timer run will move
forward to the newest GitHub Release again.
