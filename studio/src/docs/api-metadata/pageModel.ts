/**
 * Code Studio C7: one page model for library and project components (§7.2, §7.5). Missing values are
 * left undefined and shown as "Not documented yet"; nothing is invented.
 */
import api from '../../../../docs/generated/api.json';
import { docs as registry } from '../../../../docs/src/registry';
import { defaultSnippet } from '../../model/catalog';
import { version } from '../../../../package.json';
import type { CatalogItem } from '../../components/catalog/types';
import { parseMarkdown, type Block } from '../project-markdown/markdown';
import { importSpecifier, snippetFor } from '../../components/catalog/insert';

export const NOT_DOCUMENTED = 'Not documented yet';
export type Origin = 'docs' | 'jsdoc' | 'types' | 'api';

export interface PageProp { name: string; type?: string; required: boolean; default?: string; description?: string; descriptionFrom?: Origin }
export interface DocsPage {
  id: string;
  kind: 'library' | 'project';
  name: string;
  description?: string;
  descriptionFrom?: Origin;
  importStatement: string;
  example?: string;
  props: PageProp[];
  events: PageProp[];
  states: PageProp[];
  cssVariables: string[];
  a11y: string[];
  related: string[];
  docsUrl?: string;
  source?: string;
  location?: { line: number; column: number };
  /** Project: the rendered `.docs.md` (front matter stripped). */
  markdown?: Block[];
  docsFile?: string;
  examples: { label: string; code: string; source?: string }[];
}

type ApiComponent = { name: string; description?: string; source?: string; props: { name: string; type: string; required?: boolean; default?: string; description?: string }[]; cssVariables?: { name: string }[] | string[] };
const components = (api as unknown as { components: Record<string, ApiComponent> }).components;

/** `@enterprise-ui/react` version + api.json content hash (Vite define), e.g. `0.1.0 · api 3f9a12bc`. */
function apiHash(): string { try { return __EUI_API_HASH__ ?? 'dev'; } catch { return 'dev'; } }
export const BUILD_ID = `${version} · api ${apiHash()}`;
export const LIBRARY_VERSION = version;

const EVENT = /^on[A-Z]/;
const STATE = /^(disabled|readOnly|loading|busy|invalid|required|selected|checked|open|expanded|active|pressed|error|status)$/;
const split = (props: PageProp[]) => ({ props: props.filter((p) => !EVENT.test(p.name)), events: props.filter((p) => EVENT.test(p.name)), states: props.filter((p) => STATE.test(p.name)) });

export function libraryPage(name: string): DocsPage | null {
  const c = components[name];
  if (!c) return null;
  const doc = registry.find((d) => d.components.includes(name));
  const props = c.props.map((p): PageProp => ({ name: p.name, type: p.type, required: !!p.required, default: p.default, description: p.description || undefined, descriptionFrom: p.description ? 'api' : undefined }));
  // The default snippet's text content (e.g. `<Button>Button</Button>`) seeds `children`, so the live example has an accessible name.
  const text = defaultSnippet(name).match(new RegExp(`^<${name}[^>]*>([^<{]+)</${name}>$`))?.[1];
  if (text && !props.some((p) => p.name === 'children')) props.push({ name: 'children', type: 'ReactNode', required: false, default: JSON.stringify(text), description: 'Content (label text).' });
  const css = (c.cssVariables ?? []).map((v) => (typeof v === 'string' ? v : v.name));
  return {
    id: `library:${name}`, kind: 'library', name,
    description: c.description || doc?.summary || undefined, descriptionFrom: c.description || doc?.summary ? 'api' : undefined,
    importStatement: `import { ${name} } from '@enterprise-ui/react';`,
    example: defaultSnippet(name),
    ...split(props), cssVariables: css, a11y: doc?.a11y ?? [], related: doc?.related ?? [],
    docsUrl: doc ? `../#/components/${doc.slug}` : undefined,
    source: c.source,
    examples: [{ label: 'Example', code: defaultSnippet(name) }],
  };
}

/** Description column per prop from a Markdown props table (`| Prop | Type | Default | Description |`). */
function tableDescriptions(blocks: Block[]): Map<string, string> {
  const out = new Map<string, string>();
  for (const b of blocks) {
    if (b.t !== 'table') continue;
    const head = b.head.map((h) => h.map((x) => ('v' in x ? x.v : '')).join('').toLowerCase());
    const n = head.findIndex((h) => h === 'prop' || h === 'name');
    const d = head.indexOf('description');
    if (n < 0 || d < 0) continue;
    for (const r of b.rows) {
      const name = r[n]?.map((x) => ('v' in x ? x.v : '')).join('').trim();
      const desc = r[d]?.map((x) => ('v' in x ? x.v : 'c' in x ? x.c.map((y) => ('v' in y ? y.v : '')).join('') : '')).join('').trim();
      if (name && desc && desc !== '—' && !/^todo/i.test(desc)) out.set(name, desc);
    }
  }
  return out;
}

/** First paragraph under "Overview" (or the first paragraph) of the docs file. */
function docsDescription(blocks: Block[]): string | undefined {
  const i = blocks.findIndex((b) => b.t === 'heading' && b.c.some((x) => 'v' in x && /overview/i.test(x.v)));
  const p = blocks.slice(i + 1).find((b) => b.t === 'para') ?? blocks.find((b) => b.t === 'para');
  const text = p && p.t === 'para' ? p.c.map((x) => ('v' in x ? x.v : 'c' in x ? x.c.map((y) => ('v' in y ? y.v : '')).join('') : '')).join('') : undefined;
  return text && !/^todo/i.test(text) && !/^describe what/i.test(text) ? text : undefined;
}

/** §7.5 precedence: docs file → JSDoc → TS types → "Not documented yet". */
export function projectPage(item: CatalogItem, files: Readonly<Record<string, string>>, into = 'src/App.tsx'): DocsPage {
  const md = item.docs ? parseMarkdown(files[item.docs] ?? '') : null;
  const fromTable = md ? tableDescriptions(md.blocks) : new Map<string, string>();
  const props = item.props.map((p): PageProp => {
    const d = fromTable.get(p.name);
    return { ...p, description: d ?? p.description, descriptionFrom: d ? 'docs' : p.description ? 'jsdoc' : undefined };
  });
  const dd = md ? docsDescription(md.blocks) : undefined;
  const spec = importSpecifier(item, into, files);
  const examples = (item.examples ?? []).map((p) => ({ label: p.slice(p.lastIndexOf('/') + 1), code: files[p] ?? '', source: p }));
  return {
    id: item.id, kind: 'project', name: item.name,
    description: dd ?? item.description, descriptionFrom: dd ? 'docs' : item.description ? 'jsdoc' : undefined,
    importStatement: item.exportName === 'default' ? `import ${item.name} from '${spec}';` : `import { ${item.name} } from '${spec}';`,
    example: snippetFor(item),
    ...split(props), cssVariables: [], a11y: [], related: [],
    source: item.source, location: item.location, markdown: md?.blocks, docsFile: item.docs,
    examples,
  };
}

/** §7.6 controls inferred from a type: Input (string), Switch (boolean), Select (string-literal union), number. */
export type Control = { kind: 'text' } | { kind: 'switch' } | { kind: 'number' } | { kind: 'select'; options: string[] } | null;
export function inferControl(type?: string): Control {
  const t = (type ?? '').replace(/\s*\|\s*undefined/g, '').trim();
  if (t === 'string' || t === 'ReactNode') return { kind: 'text' };
  if (t === 'boolean') return { kind: 'switch' };
  if (t === 'number') return { kind: 'number' };
  const parts = t.split('|').map((x) => x.trim());
  if (parts.length > 1 && parts.every((x) => /^(['"]).*\1$/.test(x))) return { kind: 'select', options: parts.map((x) => x.slice(1, -1)) };
  return null;
}

/** Initial preview-only values: defaults (parsed when literal) or a sample for required props. */
export function initialValues(props: PageProp[]): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const p of props) {
    const c = inferControl(p.type);
    if (!c) continue;
    const d = p.default?.trim();
    if (c.kind === 'switch') out[p.name] = d === 'true';
    else if (c.kind === 'number') { if (d !== undefined && !Number.isNaN(Number(d))) out[p.name] = Number(d); else if (p.required) out[p.name] = 0; }
    else if (c.kind === 'select') out[p.name] = d ? d.replace(/^['"]|['"]$/g, '') : c.options[0];
    else if (d && /^(['"]).*\1$/.test(d)) out[p.name] = d.slice(1, -1);
    else if (p.required || p.name === 'children') out[p.name] = p.name === 'children' ? 'Content' : `Sample ${p.name}`;
  }
  return out;
}

/** JSX for the live example with the preview-only values. */
export function exampleJsx(name: string, values: Record<string, string | number | boolean>): string {
  const attrs = Object.entries(values).filter(([k]) => k !== 'children').map(([k, v]) => (typeof v === 'string' ? `${k}=${JSON.stringify(v)}` : `${k}={${JSON.stringify(v)}}`));
  const kids = values.children;
  const open = [name, ...attrs].join(' ');
  return kids !== undefined && kids !== '' ? `<${open}>${String(kids).replace(/[{}<>]/g, '')}</${name}>` : `<${open} />`;
}
