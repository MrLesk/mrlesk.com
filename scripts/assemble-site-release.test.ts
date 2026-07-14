import { afterEach, describe, expect, test } from 'bun:test';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { ReleaseManifest, ReleasePlan } from './release-plan';
import { assembleRelease } from './assemble-site-release';

const temporaryDirectories: string[] = [];

function temporaryDirectory(): string {
  const directory = mkdtempSync(join(tmpdir(), 'mrlesk-release-'));
  temporaryDirectories.push(directory);
  return directory;
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('assembleRelease', () => {
  test('overlays changed components and removes stale component files', () => {
    const root = temporaryDirectory();
    const release = join(root, 'release');
    const artifacts = join(root, 'artifacts');
    const manifest: ReleaseManifest = {
      version: 1,
      site: { artifact: 'component-site', watch: [] },
      fullRebuildWatch: [],
      allTalksWatch: [],
      talks: [
        {
          id: 'demo',
          source: 'talks/demo/deck',
          target: 'talks/demo/deck',
          base: '/talks/demo/deck/',
          artifact: 'component-talk-demo',
          watch: [],
        },
      ],
    };
    const plan: ReleasePlan = {
      version: 1,
      full: false,
      buildSite: true,
      talks: manifest.talks,
      changedFiles: [],
    };

    mkdirSync(join(release, 'talks/demo/deck'), { recursive: true });
    writeFileSync(join(release, 'stale-root.txt'), 'stale');
    writeFileSync(join(release, 'talks/demo/deck/stale-talk.txt'), 'stale');
    mkdirSync(join(artifacts, 'component-site'), { recursive: true });
    writeFileSync(join(artifacts, 'component-site/index.html'), 'site');
    mkdirSync(join(artifacts, 'component-talk-demo'), { recursive: true });
    writeFileSync(join(artifacts, 'component-talk-demo/index.html'), 'talk');

    assembleRelease({
      manifest,
      plan,
      artifactsDirectory: artifacts,
      releaseDirectory: release,
      commit: '0123456789abcdef0123456789abcdef01234567',
      releaseName: 'site-abc123-1',
    });

    expect(existsSync(join(release, 'stale-root.txt'))).toBeFalse();
    expect(existsSync(join(release, 'talks/demo/deck/stale-talk.txt'))).toBeFalse();
    expect(readFileSync(join(release, 'index.html'), 'utf8')).toBe('site');
    expect(readFileSync(join(release, 'talks/demo/deck/index.html'), 'utf8')).toBe('talk');
    expect(JSON.parse(readFileSync(join(release, '.release.json'), 'utf8')).commit).toBe(
      '0123456789abcdef0123456789abcdef01234567',
    );
    expect(JSON.parse(readFileSync(join(release, '.release.json'), 'utf8')).release).toBe(
      'site-abc123-1',
    );
  });
});
