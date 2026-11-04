import { useEffect, useRef, useState } from 'react';
import { createCache, updateCatalog } from './cache';
import { tsPass, type TypeResolver } from './discover';
import { libraryItems } from './library';
import type { CatalogItem } from './types';

export const CATALOG_DEBOUNCE_MS = 300;

/**
 * C6: the project catalog (fast pass at once on load, then debounced after edits; the TS pass merges
 * over it when it resolves) plus the read-only library entries. Never persisted.
 */
export function useCatalog(files: Readonly<Record<string, string>>, { resolver, debounceMs = CATALOG_DEBOUNCE_MS, entry }: { resolver?: TypeResolver; debounceMs?: number; entry?: string } = {}) {
  const cache = useRef(createCache());
  const [project, setProject] = useState<CatalogItem[]>(() => updateCatalog(cache.current, files, entry));
  const first = useRef(true);
  useEffect(() => {
    let cancelled = false;
    const run = () => {
      const fast = updateCatalog(cache.current, files, entry);
      setProject(fast);
      if (fast.some((i) => i.propsFrom)) void tsPass(fast, files, resolver).then((full) => { if (!cancelled) setProject(full); });
    };
    if (first.current) { first.current = false; run(); return () => { cancelled = true; }; }
    const t = setTimeout(run, debounceMs);
    return () => { cancelled = true; clearTimeout(t); };
  }, [files, resolver, debounceMs, entry]);
  return { project, library: libraryItems() };
}
