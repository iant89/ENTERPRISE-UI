/** C6 decision 3a: Insert a component at the cursor and add its import if missing (one undo step). */
import { defaultSnippet } from '../../model/catalog';
import { ensureImports, parseModule } from '../../model/jsx';
import { relative } from '../../core/vfs/paths';
import type { CatalogItem, CatalogProp } from './types';

/* eslint-disable @typescript-eslint/no-explicit-any -- Babel AST */

function placeholder(p: CatalogProp): string {
  const t = (p.type ?? '').replace(/\s*\|\s*undefined/g, '').trim();
  const literal = /^['"]([^'"]+)['"]/.exec(t);
  if (literal) return `${p.name}="${literal[1]}"`;
  if (t === 'number') return `${p.name}={0}`;
  if (t === 'boolean') return p.name;
  if (t.endsWith('[]')) return `${p.name}={[]}`;
  if (t.includes('=>')) return `${p.name}={() => {}}`;
  return `${p.name}="${p.name[0].toUpperCase()}${p.name.slice(1)}"`;
}

/** Project components: required props (except children) as placeholders. */
export function snippetFor(item: CatalogItem): string {
  if (item.origin === 'library') return defaultSnippet(item.name);
  const attrs = item.props.filter((p) => p.required && p.name !== 'children').map(placeholder);
  return `<${[item.name, ...attrs].join(' ')} />`;
}

/** Import specifier: `@enterprise-ui/react`, or the relative path (extension and `/index` dropped). */
export function importSpecifier(item: CatalogItem, into: string, files?: Readonly<Record<string, string>>): string {
  if (item.origin === 'library' || !item.source) return '@enterprise-ui/react';
  // Prefer the folder's index (the C5 layout) when it exists.
  const dir = item.source.slice(0, item.source.lastIndexOf('/'));
  const viaIndex = files && ['index.ts', 'index.tsx', 'index.js'].some((f) => Object.hasOwn(files, `${dir}/${f}`) && files[`${dir}/${f}`].includes(item.name));
  return relative(into, viaIndex ? `${dir}/index.ts` : item.source).replace(/\.[jt]sx?$/, '').replace(/\/index$/, '');
}

function ensureDefaultImport(code: string, name: string, source: string): string {
  let program: any;
  try { program = parseModule(code).program; } catch { return code; }
  const imports = (program.body as any[]).filter((n) => n.type === 'ImportDeclaration');
  if (imports.some((n) => n.specifiers.some((s: any) => s.local.name === name))) return code;
  const line = `import ${name} from '${source}';`;
  const last = imports.at(-1);
  return last ? `${code.slice(0, last.end)}\n${line}${code.slice(last.end)}` : `${line}\n${code}`;
}

/** The edited text for the file: snippet at `offset`, then the import (never duplicated). */
export function planInsert(code: string, offset: number, item: CatalogItem, path: string, files?: Readonly<Record<string, string>>): string {
  const at = Math.max(0, Math.min(offset, code.length));
  const withSnippet = code.slice(0, at) + snippetFor(item) + code.slice(at);
  const spec = importSpecifier(item, path, files);
  return item.exportName === 'default' ? ensureDefaultImport(withSnippet, item.name, spec) : ensureImports(withSnippet, [item.name], spec);
}

/** 1-based line/column → offset. */
export function offsetOf(code: string, line: number, column: number): number {
  const lines = code.split('\n');
  let o = 0;
  for (let i = 0; i < Math.min(line - 1, lines.length); i++) o += lines[i].length + 1;
  return o + Math.max(0, Math.min(column - 1, (lines[line - 1] ?? '').length));
}
