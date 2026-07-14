import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { validateManifest, type ReleaseManifest, type ReleasePlan } from './release-plan';

function copyDirectory(source: string, target: string): void {
  if (!existsSync(source)) {
    throw new Error(`Missing build artifact: ${source}`);
  }

  mkdirSync(target, { recursive: true });
  cpSync(source, target, { recursive: true });
}

export function assembleRelease(options: {
  manifest: ReleaseManifest;
  plan: ReleasePlan;
  artifactsDirectory: string;
  releaseDirectory: string;
  commit: string;
  releaseName: string;
}): void {
  const { manifest, plan, artifactsDirectory, releaseDirectory, commit, releaseName } = options;
  validateManifest(manifest);
  if (plan.version !== 1) throw new Error(`Unsupported release plan version: ${plan.version}`);
  if (!/^[0-9a-f]{40}$/.test(commit)) throw new Error(`Invalid release commit: ${commit}`);
  if (!/^[A-Za-z0-9._-]+$/.test(releaseName)) {
    throw new Error(`Invalid release name: ${releaseName}`);
  }
  mkdirSync(releaseDirectory, { recursive: true });

  if (plan.buildSite) {
    for (const entry of readdirSync(releaseDirectory)) {
      if (entry !== 'talks') {
        rmSync(join(releaseDirectory, entry), { recursive: true, force: true });
      }
    }

    copyDirectory(join(artifactsDirectory, manifest.site.artifact), releaseDirectory);
  }

  for (const plannedTalk of plan.talks) {
    const talk = manifest.talks.find(
      (candidate) =>
        candidate.id === plannedTalk.id &&
        candidate.source === plannedTalk.source &&
        candidate.target === plannedTalk.target &&
        candidate.base === plannedTalk.base &&
        candidate.artifact === plannedTalk.artifact,
    );
    if (!talk) throw new Error(`Release plan contains an unknown talk: ${plannedTalk.id}`);

    const target = join(releaseDirectory, talk.target);
    rmSync(target, { recursive: true, force: true });
    copyDirectory(join(artifactsDirectory, talk.artifact), target);
  }

  if (!existsSync(join(releaseDirectory, 'index.html'))) {
    throw new Error('Assembled release is missing the Astro index.html');
  }

  for (const talk of manifest.talks) {
    if (!existsSync(join(releaseDirectory, talk.target, 'index.html'))) {
      throw new Error(`Assembled release is missing ${talk.target}/index.html`);
    }
  }

  writeFileSync(
    join(releaseDirectory, '.release.json'),
    `${JSON.stringify(
      {
        version: 1,
        commit,
        release: releaseName,
        builtAt: new Date().toISOString(),
        talks: manifest.talks.map(({ id, target, base }) => ({ id, target, base })),
      },
      null,
      2,
    )}\n`,
  );
}

function argument(name: string, fallback?: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

if (import.meta.main) {
  const manifestPath = argument('--manifest', 'deploy/talks.json')!;
  const planPath = argument('--plan', 'plan.json')!;
  const artifactsDirectory = argument('--artifacts', 'artifacts')!;
  const releaseDirectory = argument('--release', 'release')!;
  const commit = argument('--commit', process.env.GITHUB_SHA);
  const releaseName = argument('--release-name');

  if (!commit) throw new Error('Missing --commit');
  if (!releaseName) throw new Error('Missing --release-name');

  assembleRelease({
    manifest: JSON.parse(readFileSync(manifestPath, 'utf8')) as ReleaseManifest,
    plan: JSON.parse(readFileSync(planPath, 'utf8')) as ReleasePlan,
    artifactsDirectory,
    releaseDirectory,
    commit,
    releaseName,
  });
}
