/**
 * Code Studio C6: component discovery. The fast pass is sync and pure (Babel, per file); the TS pass
 * (async) resolves props types declared in other files and merges over the fast pass.
 */
import { parseModule } from '../../model/jsx';
import { scan } from '../../core/module-graph';
import type { CatalogItem, CatalogProp } from './types';

/* eslint-disable @typescript-eslint/no-explicit-any -- Babel AST */
type Node = any;

const PASCAL = /^[A-Z][A-Za-z0-9]*$/;
const SOURCE = /\.(tsx|jsx)$/;

function containsJsx(node: Node): boolean {
  if (!node || typeof node !== 'object') return false;
  if (node.type === 'JSXElement' || node.type === 'JSXFragment') return true;
  for (const k of Object.keys(node)) {
    if (k === 'loc' || k === 'leadingComments' || k === 'trailingComments') continue;
    const v = node[k];
    if (Array.isArray(v)) { if (v.some(containsJsx)) return true; } else if (v && typeof v === 'object' && v.type && containsJsx(v)) return true;
  }
  return false;
}

const jsdoc = (node: Node): string | undefined => {
  const c = (node.leadingComments ?? []).filter((x: Node) => x.type === 'CommentBlock' && x.value.startsWith('*')).at(-1);
  if (!c) return undefined;
  const text = c.value.replace(/^\*/, '').split('\n').map((l: string) => l.replace(/^\s*\*\s?/, '')).join(' ').replace(/\s+/g, ' ').trim();
  return text.replace(/@\w+.*$/, '').trim() || undefined;
};

/** Members of an interface or type-literal alias named `name` in `program`. */
export function propsFromType(program: Node, code: string, name: string): CatalogProp[] | null {
  for (const raw of program.body as Node[]) {
    const n = raw.type === 'ExportNamedDeclaration' && raw.declaration ? { ...raw.declaration, leadingComments: raw.leadingComments } : raw;
    let members: Node[] | null = null;
    if (n.type === 'TSInterfaceDeclaration' && n.id.name === name) members = n.body.body;
    else if (n.type === 'TSTypeAliasDeclaration' && n.id.name === name && n.typeAnnotation.type === 'TSTypeLiteral') members = n.typeAnnotation.members;
    if (!members) continue;
    return members.filter((m) => m.type === 'TSPropertySignature' && (m.key.type === 'Identifier' || m.key.type === 'StringLiteral')).map((m) => ({
      name: m.key.name ?? m.key.value,
      type: m.typeAnnotation ? code.slice(m.typeAnnotation.typeAnnotation.start, m.typeAnnotation.typeAnnotation.end) : undefined,
      required: !m.optional,
      description: jsdoc(m),
    }));
  }
  return null;
}

interface FnInfo { node: Node; decl: Node }

function componentFn(program: Node): Map<string, FnInfo> {
  const out = new Map<string, FnInfo>();
  for (const raw of program.body as Node[]) {
    const n = (raw.type === 'ExportNamedDeclaration' || raw.type === 'ExportDefaultDeclaration') && raw.declaration ? raw.declaration : raw;
    if ((n.type === 'FunctionDeclaration') && n.id && PASCAL.test(n.id.name) && containsJsx(n.body)) out.set(n.id.name, { node: n, decl: n });
    if (n.type === 'VariableDeclaration') {
      for (const d of n.declarations) {
        const init = d.init;
        if (d.id.type === 'Identifier' && PASCAL.test(d.id.name) && init && (init.type === 'ArrowFunctionExpression' || init.type === 'FunctionExpression') && containsJsx(init.body)) out.set(d.id.name, { node: init, decl: d });
      }
    }
  }
  return out;
}

/** Props type name and destructuring defaults from the component's first parameter. */
function paramInfo(fn: Node, decl: Node, code: string): { typeName?: string; inline?: Node; defaults: Record<string, string> } {
  const p = fn.params?.[0];
  const defaults: Record<string, string> = {};
  let ann = p?.typeAnnotation?.typeAnnotation;
  // `const X: FC<Props> = (...) =>`
  if (!ann && decl.id?.typeAnnotation?.typeAnnotation?.typeParameters?.params?.[0]) ann = decl.id.typeAnnotation.typeAnnotation.typeParameters.params[0];
  if (p?.type === 'ObjectPattern') {
    for (const prop of p.properties) if (prop.type === 'ObjectProperty' && prop.value.type === 'AssignmentPattern') defaults[prop.key.name] = code.slice(prop.value.right.start, prop.value.right.end);
  }
  if (ann?.type === 'TSTypeReference' && ann.typeName.type === 'Identifier') return { typeName: ann.typeName.name, defaults };
  if (ann?.type === 'TSTypeLiteral') return { inline: ann, defaults };
  return { defaults };
}

/** Local name → import specifier for every named/default import in the file. */
function importsOf(program: Node): Map<string, string> {
  const m = new Map<string, string>();
  for (const n of program.body as Node[]) if (n.type === 'ImportDeclaration') for (const s of n.specifiers) m.set(s.local.name, n.source.value);
  return m;
}

export interface FileResult { items: CatalogItem[]; parsed: boolean }

/** Fast pass for one file: exported components with same-file props. Re-exports are skipped (found once at the source). */
export function fastPass(path: string, code: string): FileResult {
  if (!SOURCE.test(path) || /\.(test|example)\.[jt]sx$/.test(path)) return { items: [], parsed: true };
  let program: Node;
  try { program = parseModule(code).program; } catch { return { items: [], parsed: false }; }
  const fns = componentFn(program);
  const imports = importsOf(program);
  const exported: [local: string, exportName: string][] = [];
  for (const n of program.body as Node[]) {
    if (n.type === 'ExportNamedDeclaration' && !n.source) {
      const d = n.declaration;
      if (d?.type === 'FunctionDeclaration' && d.id) exported.push([d.id.name, d.id.name]);
      if (d?.type === 'VariableDeclaration') for (const v of d.declarations) if (v.id.type === 'Identifier') exported.push([v.id.name, v.id.name]);
      for (const s of n.specifiers ?? []) if (s.type === 'ExportSpecifier') exported.push([s.local.name, s.exported.name ?? s.exported.value]);
    }
    if (n.type === 'ExportDefaultDeclaration') {
      const d = n.declaration;
      if ((d.type === 'FunctionDeclaration') && d.id) exported.push([d.id.name, 'default']);
      else if (d.type === 'Identifier') exported.push([d.name, 'default']);
    }
  }
  const items: CatalogItem[] = [];
  const seen = new Set<string>();
  for (const [local, exportName] of exported) {
    const fn = fns.get(local);
    if (!fn || seen.has(local)) continue;
    seen.add(local);
    const info = paramInfo(fn.node, fn.decl, code);
    let props: CatalogProp[] = [];
    let propsFrom: string | undefined;
    if (info.inline) props = propsFromType({ body: [{ type: 'TSTypeAliasDeclaration', id: { name: '__inline' }, typeAnnotation: info.inline }] }, code, '__inline') ?? [];
    else if (info.typeName) {
      const local = propsFromType(program, code, info.typeName);
      if (local) props = local;
      else {
        propsFrom = imports.get(info.typeName);
        // Until the TS pass resolves the type, show the destructured names (and keep their defaults for the merge).
        props = Object.keys(info.defaults).map((name) => ({ name, required: false }));
      }
    } else props = Object.keys(info.defaults).map((name) => ({ name, required: false }));
    props = props.map((p) => (info.defaults[p.name] !== undefined ? { ...p, default: info.defaults[p.name] } : p));
    const name = exportName === 'default' ? local : exportName;
    items.push({
      id: `project:${path}#${exportName}`, name, exportName, origin: 'project', source: path,
      location: { line: fn.decl.loc.start.line, column: fn.decl.loc.start.column + 1 },
      props, propsType: info.typeName, propsFrom, description: jsdoc(fn.decl) ?? jsdoc(fn.node),
    });
  }
  return { items, parsed: true };
}

/** Associates `Name.css`, `Name.test.tsx`, `Name.docs.md`, `Name.example.tsx` by folder + base name. */
export function withSiblings(item: CatalogItem, files: Readonly<Record<string, string>>): CatalogItem {
  if (!item.source) return item;
  const dir = item.source.slice(0, item.source.lastIndexOf('/') + 1);
  const base = item.source.slice(dir.length).replace(/\.[jt]sx$/, '');
  const stem = base === 'index' ? item.name : base;
  const has = (f: string) => (Object.hasOwn(files, dir + f) ? dir + f : undefined);
  const examples = ['tsx', 'jsx'].map((x) => has(`${stem}.example.${x}`)).filter((x): x is string => !!x);
  return {
    ...item,
    stylesheet: has(`${stem}.css`) ?? has(`${stem}.module.css`),
    tests: has(`${stem}.test.tsx`) ?? has(`${stem}.test.jsx`) ?? has(`${stem}.test.ts`),
    docs: has(`${stem}.docs.md`),
    examples: examples.length ? examples : undefined,
  };
}

/** Resolves imported props types against the VFS (the module graph's resolution), for the TS pass. */
export type TypeResolver = (item: CatalogItem, files: Readonly<Record<string, string>>) => Promise<CatalogProp[] | null>;

export const vfsTypeResolver: TypeResolver = async (item, files) => resolveImportedProps(item, files);

export function resolveImportedProps(item: CatalogItem, files: Readonly<Record<string, string>>, depth = 0): CatalogProp[] | null {
  if (!item.source || !item.propsFrom || !item.propsType || depth > 3) return null;
  const target = scan(files as Record<string, string>, item.source, { includeTypes: true }).imports.find((i) => i.specifier === item.propsFrom);
  if (!target || target.kind !== 'file') return null;
  const code = files[target.path];
  let program: Node;
  try { program = parseModule(code).program; } catch { return null; }
  const found = propsFromType(program, code, item.propsType);
  if (found) return found;
  // One re-export hop: `export type { Props } from './types'` / `export * from`.
  for (const n of program.body as Node[]) {
    if ((n.type === 'ExportNamedDeclaration' || n.type === 'ExportAllDeclaration') && n.source) {
      const r = resolveImportedProps({ ...item, source: target.path, propsFrom: n.source.value }, files, depth + 1);
      if (r) return r;
    }
  }
  return null;
}

/** TS pass: fills props for items whose type is imported; results merge over the fast pass (defaults kept). */
export async function tsPass(items: readonly CatalogItem[], files: Readonly<Record<string, string>>, resolve: TypeResolver = vfsTypeResolver): Promise<CatalogItem[]> {
  return Promise.all(items.map(async (item) => {
    if (!item.propsFrom) return item;
    const props = await resolve(item, files).catch(() => null);
    if (!props) return item;
    const defaults = new Map(item.props.map((p) => [p.name, p.default]));
    return { ...item, propsFrom: undefined, props: props.map((p) => (defaults.get(p.name) !== undefined ? { ...p, default: defaults.get(p.name) } : p)) };
  }));
}

/** One-line signature: `title: string · emphasized?: boolean = false`. */
export const signature = (item: CatalogItem) =>
  item.props.map((p) => (item.origin === 'library' ? p.name : `${p.name}${p.required ? '' : '?'}${p.type ? `: ${p.type}` : ''}${p.default !== undefined ? ` = ${p.default}` : ''}`)).join(' · ');
