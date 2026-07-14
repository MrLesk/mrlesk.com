import { describe, expect, test } from 'bun:test';
import manifestJson from '../deploy/talks.json';
import { createReleasePlan, type ReleaseManifest } from './release-plan';

const manifest = manifestJson as ReleaseManifest;

describe('createReleasePlan', () => {
  test('builds only the changed talk', () => {
    const plan = createReleasePlan(manifest, [
      'talks/codex/meetup-july-2026/pages/agenda.md',
    ]);

    expect(plan.buildSite).toBeFalse();
    expect(plan.talks.map((talk) => talk.id)).toEqual(['codex-july-2026']);
  });

  test('rebuilds talks which consume a changed theme', () => {
    const plan = createReleasePlan(manifest, ['slidev-theme-codex/styles/layout.css']);

    expect(plan.talks.map((talk) => talk.id)).toEqual([
      'codex-april-2026',
      'codex-build-june-2026',
    ]);
  });

  test('rebuilds submodule theme consumers when its gitlink changes', () => {
    const plan = createReleasePlan(manifest, ['slidev-theme-penguin']);

    expect(plan.talks.map((talk) => talk.id)).toEqual([
      'vienna-zero',
      'vienna-backlog',
      'devoxx-backlog',
      'devoxx-success',
      'ai-native-presentation',
      'ai-native-workshop',
      'voxxed-backlog',
      'vienna-explosion',
    ]);
  });

  test('rebuilds every talk when shared Slidev dependencies change', () => {
    const plan = createReleasePlan(manifest, ['slidev-build.package.json']);

    expect(plan.buildSite).toBeFalse();
    expect(plan.talks).toHaveLength(manifest.talks.length);
  });

  test('performs a complete build for the first release', () => {
    const plan = createReleasePlan(manifest, [], true);

    expect(plan.full).toBeTrue();
    expect(plan.buildSite).toBeTrue();
    expect(plan.talks).toHaveLength(manifest.talks.length);
  });

  test('rejects a future talk whose URL does not match its output target', () => {
    const invalid = structuredClone(manifest);
    invalid.talks[0]!.base = '/somewhere-else/';

    expect(() => createReleasePlan(invalid, [], true)).toThrow('base must be');
  });
});
