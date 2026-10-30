import { describe, expect, it } from 'vitest';
import { docs, docsBySlug } from '../../docs/src/registry';
import { examplesFor } from '../../docs/src/examples';
import * as publicApi from '../../src';
import { componentApi } from '../../docs/src/components/ApiTables';

describe('documentation registry integrity', () => {
  it('has unique slugs and resolves all related documentation links', () => {
    expect(new Set(docs.map((page) => page.slug)).size).toBe(docs.length);
    const broken = docs.flatMap((page) => (page.related ?? []).filter((slug) => !docsBySlug.has(slug)).map((slug) => `${page.slug} -> ${slug}`));
    expect(broken).toEqual([]);
  });
  it('only references generated public API entries', () => {
    const missing = docs.flatMap((page) => page.components.filter((name) => !componentApi[name]).map((name) => `${page.slug}: ${name}`));
    expect(missing).toEqual([]);
  });
  it('only documents components exported from the package entry point', () => {
    const missing = docs.flatMap((page) => page.components.filter((name) => !(name in publicApi)).map((name) => `${page.slug}: ${name}`));
    expect(missing).toEqual([]);
  });
  it('provides examples for registered pages', () => {
    const missing = docs.filter((page) => examplesFor(page.examples ?? page.slug).length === 0).map((page) => page.slug);
    expect(missing).toEqual([]);
  });
});
