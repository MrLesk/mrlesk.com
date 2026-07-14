import { readFileSync, writeFileSync } from 'node:fs';

export type Talk = {
  id: string;
  source: string;
  target: string;
  base: string;
  artifact: string;
  watch: string[];
};

export type ReleaseManifest = {
  version: number;
  site: { artifact: string; watch: string[] };
  fullRebuildWatch: string[];
  allTalksWatch: string[];
  talks: Talk[];
};

export type ReleasePlan = {
  version: number;
  full: boolean;
  buildSite: boolean;
  talks: Talk[];
  changedFiles: string[];
};

export function validateManifest(manifest: ReleaseManifest): void {
  if (manifest.version !== 1) {
    throw new Error(`Unsupported talk manifest version: ${manifest.version}`);
  }

  const ids = new Set<string>();
  const sources = new Set<string>();
  const targets = new Set<string>();
  const artifacts = new Set<string>([manifest.site.artifact]);
  for (const talk of manifest.talks) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(talk.id)) {
      throw new Error(`Invalid talk id: ${talk.id}`);
    }
    if (!/^talks\/[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/.test(talk.source)) {
      throw new Error(`Invalid talk source: ${talk.source}`);
    }
    if (!/^talks\/[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/.test(talk.target)) {
      throw new Error(`Invalid talk target: ${talk.target}`);
    }
    if (talk.base !== `/${talk.target}/`) {
      throw new Error(`Talk ${talk.id} base must be /${talk.target}/`);
    }
    if (!/^component-talk-[a-z0-9-]+$/.test(talk.artifact)) {
      throw new Error(`Invalid talk artifact: ${talk.artifact}`);
    }
    if (ids.has(talk.id) || sources.has(talk.source) || targets.has(talk.target)) {
      throw new Error(`Duplicate talk id, source, or target: ${talk.id}`);
    }
    if (artifacts.has(talk.artifact)) {
      throw new Error(`Duplicate build artifact: ${talk.artifact}`);
    }

    ids.add(talk.id);
    sources.add(talk.source);
    targets.add(talk.target);
    artifacts.add(talk.artifact);
  }
}

function matches(path: string, pattern: string): boolean {
  if (pattern.endsWith('/**')) {
    const directory = pattern.slice(0, -3);
    return path === directory || path.startsWith(`${directory}/`);
  }

  return path === pattern;
}

function matchesAny(path: string, patterns: string[]): boolean {
  return patterns.some((pattern) => matches(path, pattern));
}

export function createReleasePlan(
  manifest: ReleaseManifest,
  changedFiles: string[],
  forceFull = false,
): ReleasePlan {
  validateManifest(manifest);
  const normalizedFiles = [...new Set(changedFiles.map((file) => file.trim()).filter(Boolean))].sort();
  const manifestChanged = normalizedFiles.some((file) => matchesAny(file, manifest.fullRebuildWatch));
  const full = forceFull || manifestChanged;
  const rebuildAllTalks =
    full || normalizedFiles.some((file) => matchesAny(file, manifest.allTalksWatch));

  const buildSite =
    full || normalizedFiles.some((file) => matchesAny(file, manifest.site.watch));

  const talks = manifest.talks.filter((talk) => {
    if (rebuildAllTalks) return true;

    return normalizedFiles.some(
      (file) => file.startsWith(`${talk.source}/`) || matchesAny(file, talk.watch),
    );
  });

  return {
    version: 1,
    full,
    buildSite,
    talks,
    changedFiles: normalizedFiles,
  };
}

function argument(name: string, fallback?: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

if (import.meta.main) {
  const manifestPath = argument('--manifest', 'deploy/talks.json')!;
  const changedFilesPath = argument('--changed-files');
  const outputPath = argument('--output', 'plan.json')!;
  const forceFull = argument('--full', 'false') === 'true';
  const githubOutput = process.env.GITHUB_OUTPUT;

  if (!changedFilesPath) {
    throw new Error('Missing --changed-files');
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as ReleaseManifest;
  const changedFiles = readFileSync(changedFilesPath, 'utf8').split(/\r?\n/);
  const plan = createReleasePlan(manifest, changedFiles, forceFull);
  const matrix = {
    include: plan.talks.map(({ id, source, target, base, artifact }) => ({
      id,
      source,
      target,
      base,
      artifact,
    })),
  };

  writeFileSync(outputPath, `${JSON.stringify(plan, null, 2)}\n`);

  if (githubOutput) {
    const lines = [
      `build_site=${plan.buildSite}`,
      `talk_count=${plan.talks.length}`,
      `has_changes=${plan.buildSite || plan.talks.length > 0}`,
      `full=${plan.full}`,
      `talk_matrix=${JSON.stringify(matrix)}`,
    ];
    writeFileSync(githubOutput, `${lines.join('\n')}\n`, { flag: 'a' });
  }
}
