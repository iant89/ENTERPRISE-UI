/** Code Studio C6: one catalog entry with every §6.3 field. Missing values stay undefined (never invented). */
export interface CatalogProp {
  name: string;
  type?: string;
  required: boolean;
  default?: string;
  description?: string;
}

export interface CatalogItem {
  /** Stable key: `project:path#exportName` or `library:Name`. */
  id: string;
  name: string;
  /** The export it is imported by (`default` for a default export). */
  exportName: string;
  origin: 'project' | 'library';
  /** Source file (project) or library source path from api.json. */
  source?: string;
  location?: { line: number; column: number };
  props: CatalogProp[];
  /** Name of the props interface/type, when there is one. */
  propsType?: string;
  /** Set when the props type is imported and not yet resolved (TS pass fills it). */
  propsFrom?: string;
  stylesheet?: string;
  tests?: string;
  docs?: string;
  examples?: string[];
  description?: string;
  /** Library only: docs category. */
  category?: string;
}
