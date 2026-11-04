/**
 * Code Studio C6: derived catalog cache keyed by path + content hash. Never persisted (code is
 * authoritative, §18). A changed file invalidates itself and its dependents through the module graph.
 */
import { hashText, scan, withDependents, type ModuleNode } from '../../core/module-graph';
import { fastPass, withSiblings } from './discover';
import type { CatalogItem } from './types';

export interface CatalogCache {
  entries: Map<string, { hash: string; items: CatalogItem[] }>;
  nodes: Map<string, ModuleNode>;
  /** Paths recomputed by the last update (for tests). */
  lastInvalidated: Set<string>;
}

export const createCache = (): CatalogCache => ({ entries: new Map(), nodes: new Map(), lastInvalidated: new Set() });

const SCRIPT = /\.(tsx|jsx|ts|js)$/;

/** Updates the cache for `files`; returns the project items (siblings attached), sorted by name. */
export function updateCatalog(cache: CatalogCache, files: Readonly<Record<string, string>>): CatalogItem[] {
  const changed = new Set<string>();
  const fileSetChanged = [...cache.nodes.keys()].some((p) => !Object.hasOwn(files, p)) || Object.keys(files).some((p) => SCRIPT.test(p) && !cache.nodes.has(p));
  for (const p of [...cache.nodes.keys()]) if (!Object.hasOwn(files, p)) { cache.nodes.delete(p); cache.entries.delete(p); changed.add(p); }
  for (const [p, text] of Object.entries(files)) {
    if (!SCRIPT.test(p)) continue;
    const hash = hashText(text);
    const prev = cache.nodes.get(p);
    if (prev && prev.hash === hash && !fileSetChanged) continue;
    cache.nodes.set(p, scan(files as Record<string, string>, p, { includeTypes: true }));
    if (!prev || prev.hash !== hash) changed.add(p);
  }
  const invalid = withDependents(cache.nodes, changed);
  for (const p of invalid) {
    if (!Object.hasOwn(files, p)) continue;
    const r = fastPass(p, files[p]);
    // A file that doesn't parse keeps its last good entries.
    if (r.parsed || !cache.entries.has(p)) cache.entries.set(p, { hash: hashText(files[p]), items: r.items });
  }
  cache.lastInvalidated = invalid;
  return [...cache.entries.values()].flatMap((e) => e.items).map((i) => withSiblings(i, files)).sort((a, b) => a.name.localeCompare(b.name) || (a.source ?? '').localeCompare(b.source ?? ''));
}
