/**
 * The default `enterprise` collection: the SAP icon SVGs in src/assets/icons plus aliases for common
 * names (`close`, `user`, `chevron-down`…). Loaded lazily by the registry on first use, so apps that
 * never use an icon by name don't download it.
 */
import type { IconCollectionRegistration, IconMetadata } from '../../core/types';
import aliases from './aliases.json';
import { definitionFromSvg } from './definitionFromSvg';

const files = import.meta.glob<string>('../../../assets/icons/*.svg', { query: '?raw', import: 'default', eager: true });

export const enterpriseCollection: Pick<IconCollectionRegistration, 'icons' | 'aliases'> = {
  icons: Object.entries(files).map(([file, svg]) => definitionFromSvg(/([^/]+)\.svg$/.exec(file)![1].toLowerCase(), svg)),
  aliases,
};

/** Categories and search keywords from SAP's metadata (SAP-icons.json), loaded only for search UIs. */
export async function loadEnterpriseMetadata(): Promise<Record<string, IconMetadata>> {
  const { default: meta } = await import('../../../assets/icons/SAP-icons.json');
  const out: Record<string, IconMetadata> = {};
  for (const entry of Object.values(meta as Record<string, { names: string[]; groups?: string[]; tags?: string[] }>)) {
    const metadata: IconMetadata = { category: entry.groups?.[0], keywords: [...(entry.tags ?? []), ...(entry.groups ?? []), ...entry.names.slice(1)] };
    for (const name of entry.names) out[name.toLowerCase()] = metadata;
  }
  return out;
}
