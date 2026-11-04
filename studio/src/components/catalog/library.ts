/** Code Studio C6: library entries adapted from model/catalog.ts (api.json); read-only, no duplicated definitions. */
import { catalog, categories, propsFor, descriptionFor } from '../../model/catalog';

/** Category order from the docs registry. */
export const CATEGORY_ORDER: string[] = categories.map((c) => c.id);
import { version } from '../../../../package.json';
import type { CatalogItem } from './types';

/** Named JSON import, so only the version string is bundled. */
export const LIBRARY_VERSION: string = version;

let cached: CatalogItem[] | null = null;
export function libraryItems(): CatalogItem[] {
  return (cached ??= catalog.map((e) => ({
    id: `library:${e.name}`, name: e.name, exportName: e.name, origin: 'library' as const,
    props: propsFor(e.name).map((p) => ({ name: p.name, type: p.type, required: !!p.required, default: p.default, description: p.description })),
    description: descriptionFor(e.name) || undefined, category: e.category,
  })));
}
