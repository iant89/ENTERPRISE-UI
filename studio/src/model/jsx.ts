import { parse } from '@babel/parser';

/**
 * The visual model of a Studio page. Code is the source of truth: the page's default-exported
 * component is parsed, its returned JSX becomes a tree of nodes, and every visual edit is a
 * precise text splice, so formatting and comments outside the edited range are preserved.
 *
 * Node ids are child-index paths among JSX element children (`0`, `0.1`, `0.1.2`).
 * Elements nested inside `{expressions}` or attribute values are not editable visually; they
 * appear as locked entries.
 */

export type AttrValue =
  | { kind: 'string'; value: string }
  | { kind: 'boolean'; value: boolean }
  | { kind: 'number'; value: number }
  | { kind: 'expression'; text: string };

export interface StudioAttr {
  name: string;
  start: number;
  end: number;
  value: AttrValue;
}

export interface StudioNode {
  id: string;
  /** Tag name (`Button`, `div`, `UI.Card`); empty for fragments. */
  name: string;
  kind: 'element' | 'fragment';
  start: number;
  end: number;
  /** Offset just after the tag name, where new attributes go. */
  nameEnd: number;
  /** Offset just after the opening tag (`>` or `/>`). */
  openEnd: number;
  selfClosing: boolean;
  /** Start of the closing tag, or `end` when self-closing. */
  closeStart: number;
  attributes: StudioAttr[];
  children: StudioNode[];
  /** Child expressions such as `{items.map(...)}`, shown as locked. */
  locked: { start: number; end: number; text: string }[];
  /** Text content when every child is plain text. */
  text: string | null;
  line: number;
}

export interface StudioDocument {
  root: StudioNode | null;
  error: string | null;
}

/* eslint-disable @typescript-eslint/no-explicit-any -- Babel AST nodes are walked structurally. */
type AnyNode = any;

export function parseModule(code: string): AnyNode {
  return parse(code, { sourceType: 'module', plugins: ['jsx', 'typescript'], errorRecovery: false });
}

function findRootJsx(program: AnyNode): AnyNode | null {
  const body: AnyNode[] = program.body;
  const exported = body.find((n) => n.type === 'ExportDefaultDeclaration')?.declaration;
  if (!exported) return null;
  let fn = exported;
  if (fn.type === 'Identifier') {
    fn = body.map((n) => (n.type === 'ExportNamedDeclaration' ? n.declaration : n)).find((n) => n?.type === 'FunctionDeclaration' && n.id?.name === exported.name)
      ?? body.flatMap((n) => (n.type === 'VariableDeclaration' ? n.declarations : [])).find((d: AnyNode) => d.id?.name === exported.name)?.init;
  }
  if (!fn) return null;
  if (fn.type === 'ArrowFunctionExpression' && fn.body.type !== 'BlockStatement') return unwrap(fn.body);
  const statements: AnyNode[] = fn.body?.body ?? [];
  const ret = [...statements].reverse().find((s) => s.type === 'ReturnStatement');
  return ret?.argument ? unwrap(ret.argument) : null;
}

const unwrap = (node: AnyNode): AnyNode => (node?.type === 'ParenthesizedExpression' ? unwrap(node.expression) : node);
const isJsx = (node: AnyNode) => node?.type === 'JSXElement' || node?.type === 'JSXFragment';

function tagName(name: AnyNode): string {
  if (name.type === 'JSXIdentifier') return name.name;
  if (name.type === 'JSXMemberExpression') return `${tagName(name.object)}.${name.property.name}`;
  if (name.type === 'JSXNamespacedName') return `${name.namespace.name}:${name.name.name}`;
  return '';
}

function attrValue(code: string, attr: AnyNode): AttrValue {
  const v = attr.value;
  if (v == null) return { kind: 'boolean', value: true };
  if (v.type === 'StringLiteral') return { kind: 'string', value: v.value };
  if (v.type === 'JSXExpressionContainer') {
    const e = v.expression;
    if (e.type === 'BooleanLiteral') return { kind: 'boolean', value: e.value };
    if (e.type === 'NumericLiteral') return { kind: 'number', value: e.value };
    if (e.type === 'UnaryExpression' && e.operator === '-' && e.argument.type === 'NumericLiteral') return { kind: 'number', value: -e.argument.value };
    if (e.type === 'StringLiteral') return { kind: 'string', value: e.value };
    if (e.type === 'TemplateLiteral' && e.expressions.length === 0) return { kind: 'string', value: e.quasis[0].value.cooked };
    return { kind: 'expression', text: code.slice(e.start, e.end) };
  }
  return { kind: 'expression', text: code.slice(v.start, v.end) };
}

function toNode(code: string, jsx: AnyNode, id: string): StudioNode {
  const fragment = jsx.type === 'JSXFragment';
  const opening = fragment ? jsx.openingFragment : jsx.openingElement;
  const closing = fragment ? jsx.closingFragment : jsx.closingElement;
  const elementChildren: StudioNode[] = [];
  const locked: StudioNode['locked'] = [];
  let onlyText = true;
  let text = '';
  for (const child of jsx.children as AnyNode[]) {
    if (isJsx(child)) { elementChildren.push(toNode(code, child, `${id}.${elementChildren.length}`)); onlyText = false; }
    else if (child.type === 'JSXExpressionContainer') {
      if (child.expression.type !== 'JSXEmptyExpression') { locked.push({ start: child.start, end: child.end, text: code.slice(child.start, child.end) }); onlyText = false; }
    } else if (child.type === 'JSXText') text += child.value;
    else onlyText = false;
  }
  return {
    id,
    name: fragment ? '' : tagName(opening.name),
    kind: fragment ? 'fragment' : 'element',
    start: jsx.start,
    end: jsx.end,
    nameEnd: fragment ? opening.start + 1 : opening.name.end,
    openEnd: opening.end,
    selfClosing: !fragment && opening.selfClosing,
    closeStart: closing ? closing.start : jsx.end,
    attributes: fragment ? [] : (opening.attributes as AnyNode[]).filter((a) => a.type === 'JSXAttribute').map((a) => ({ name: tagName(a.name), start: a.start, end: a.end, value: attrValue(code, a) })),
    children: elementChildren,
    locked,
    text: onlyText && !fragment && !opening.selfClosing ? text.trim() : null,
    line: jsx.loc?.start.line ?? 1,
  };
}

/** Parses a page. Returns `{ root: null, error }` when the code does not parse or has no default-exported JSX. */
export function parseDocument(code: string): StudioDocument {
  try {
    const ast = parseModule(code);
    const jsx = findRootJsx(ast.program);
    if (!isJsx(jsx)) return { root: null, error: 'The default export must be a component that returns JSX.' };
    return { root: toNode(code, jsx, '0'), error: null };
  } catch (error) {
    return { root: null, error: error instanceof Error ? error.message : String(error) };
  }
}

export function findNode(root: StudioNode | null, id: string): StudioNode | null {
  if (!root) return null;
  if (root.id === id) return root;
  for (const child of root.children) {
    if (id === child.id || id.startsWith(`${child.id}.`)) return findNode(child, id);
  }
  return null;
}

export const parentId = (id: string) => (id.includes('.') ? id.slice(0, id.lastIndexOf('.')) : null);
const indexOf = (id: string) => Number(id.slice(id.lastIndexOf('.') + 1));

export function walk(root: StudioNode | null, visit: (node: StudioNode) => void) {
  if (!root) return;
  visit(root);
  root.children.forEach((child) => walk(child, visit));
}

/** Adds `data-studio-id` to every editable element so the preview can report element boxes. */
export function instrument(code: string, root: StudioNode | null): string {
  if (!root) return code;
  const inserts: { at: number; text: string }[] = [];
  walk(root, (node) => { if (node.kind === 'element') inserts.push({ at: node.nameEnd, text: ` data-studio-id="${node.id}"` }); });
  return splice(code, inserts);
}

function splice(code: string, inserts: { at: number; text: string; to?: number }[]): string {
  let out = code;
  for (const edit of [...inserts].sort((a, b) => b.at - a.at)) out = out.slice(0, edit.at) + edit.text + out.slice(edit.to ?? edit.at);
  return out;
}

const lineIndent = (code: string, offset: number) => /^[ \t]*/.exec(code.slice(code.lastIndexOf('\n', offset - 1) + 1))![0];
const reindent = (text: string, indent: string) => text.split('\n').map((line, i) => (i === 0 || !line.trim() ? line : indent + line)).join('\n');

/** Removes the common leading indentation of lines after the first, so moved text can be re-indented. */
function dedent(code: string, start: number, end: number): string {
  const text = code.slice(start, end);
  const base = lineIndent(code, start);
  return text.split('\n').map((line, i) => (i > 0 && line.startsWith(base) ? line.slice(base.length) : line)).join('\n');
}

const escapeAttr = (value: string) => value.replace(/"/g, '&quot;');
const escapeText = (value: string) => value.replace(/[{}<>]/g, (c) => `{'${c}'}`);

function formatAttr(name: string, value: string | number | boolean | { expression: string }): string {
  if (value === true) return name;
  if (typeof value === 'string') return /["\n\\]/.test(value) ? `${name}={${JSON.stringify(value)}}` : `${name}="${escapeAttr(value)}"`;
  if (typeof value === 'object') return `${name}={${value.expression}}`;
  return `${name}={${String(value)}}`;
}

export type AttrInput = string | number | boolean | { expression: string } | null;

/** Sets, replaces or (with `null`) removes an attribute. */
export function setAttribute(code: string, id: string, name: string, value: AttrInput): string {
  const node = findNode(parseDocument(code).root, id);
  if (!node || node.kind !== 'element') return code;
  const existing = node.attributes.find((a) => a.name === name);
  if (value === null) {
    if (!existing) return code;
    let start = existing.start;
    while (start > 0 && /\s/.test(code[start - 1])) start--;
    return code.slice(0, start) + code.slice(existing.end);
  }
  const text = formatAttr(name, value);
  if (existing) return code.slice(0, existing.start) + text + code.slice(existing.end);
  const last = node.attributes.at(-1);
  const at = last ? last.end : node.nameEnd;
  return code.slice(0, at) + ` ${text}` + code.slice(at);
}

/** Replaces the plain-text content of an element. */
export function setText(code: string, id: string, text: string): string {
  const node = findNode(parseDocument(code).root, id);
  if (!node || node.text === null) return code;
  return code.slice(0, node.openEnd) + escapeText(text) + code.slice(node.closeStart);
}

/** Text splice that places `snippet` as child `index` of `parent`. */
function insertionEdit(code: string, parent: StudioNode, index: number, snippet: string): { at: number; to?: number; text: string } {
  const parentIndent = lineIndent(code, parent.start);
  const childIndent = `${parentIndent}  `;
  const body = reindent(snippet, childIndent);
  if (parent.selfClosing) {
    let at = parent.openEnd - 2;
    while (/\s/.test(code[at - 1])) at--;
    return { at, to: parent.openEnd, text: `>\n${childIndent}${body}\n${parentIndent}</${parent.name}>` };
  }
  const sibling = parent.children[index];
  if (sibling) return { at: sibling.start, text: `${body}\n${lineIndent(code, sibling.start)}` };
  let at = parent.closeStart;
  while (at > parent.openEnd && /\s/.test(code[at - 1])) at--;
  const inline = !code.slice(parent.openEnd, parent.closeStart).includes('\n') && code.slice(parent.openEnd, parent.closeStart).trim() === '';
  return inline
    ? { at: parent.openEnd, to: parent.closeStart, text: `\n${childIndent}${body}\n${parentIndent}` }
    : { at, text: `\n${childIndent}${body}` };
}

/** Inserts JSX as child `index` of `parentId` (appends when `index` is past the end). */
export function insertElement(code: string, targetParentId: string, index: number, snippet: string): string {
  const parent = findNode(parseDocument(code).root, targetParentId);
  if (!parent) return code;
  return splice(code, [insertionEdit(code, parent, index, snippet)]);
}

function removalRange(code: string, node: StudioNode) {
  let start = node.start;
  let end = node.end;
  const before = code.slice(code.lastIndexOf('\n', start - 1) + 1, start);
  const afterLineEnd = code.indexOf('\n', end);
  const after = code.slice(end, afterLineEnd === -1 ? code.length : afterLineEnd);
  if (!before.trim() && !after.trim()) {
    start -= before.length;
    end += after.length;
    if (code[start - 1] === '\n') start -= 1;
  }
  return { start, end };
}

export function removeNode(code: string, id: string): string {
  const node = findNode(parseDocument(code).root, id);
  if (!node || !parentId(id)) return code;
  const { start, end } = removalRange(code, node);
  return code.slice(0, start) + code.slice(end);
}

export function duplicateNode(code: string, id: string): string {
  const doc = parseDocument(code);
  const node = findNode(doc.root, id);
  const parent = parentId(id);
  if (!node || !parent) return code;
  return insertElement(code, parent, indexOf(id) + 1, dedent(code, node.start, node.end));
}

/** The id `id` has after the node at `removed` is deleted, or `null` when it was inside it. */
export function idAfterRemoval(id: string, removed: string): string | null {
  if (id === removed || id.startsWith(`${removed}.`)) return null;
  const parent = parentId(removed);
  const prefix = `${parent}.`;
  if (!parent || !id.startsWith(prefix)) return id;
  const rest = id.slice(prefix.length).split('.');
  if (Number(rest[0]) > indexOf(removed)) rest[0] = String(Number(rest[0]) - 1);
  return prefix + rest.join('.');
}

/** Moves a node to child `index` of `targetParentId`; `index` refers to positions before the move. Returns the new code and the node's new id. */
export function moveNode(code: string, id: string, targetParentId: string, index: number): { code: string; id: string } {
  const doc = parseDocument(code);
  const node = findNode(doc.root, id);
  if (!node || !parentId(id) || targetParentId === id || targetParentId.startsWith(`${id}.`)) return { code, id };
  const text = dedent(code, node.start, node.end);
  let targetIndex = index;
  if (parentId(id) === targetParentId && indexOf(id) < index) targetIndex -= 1;
  if (parentId(id) === targetParentId && targetIndex === indexOf(id)) return { code, id };
  const newParent = idAfterRemoval(targetParentId, id)!;
  const removed = removeNode(code, id);
  const result = insertElement(removed, newParent, targetIndex, text);
  const parentNode = findNode(parseDocument(result).root, newParent);
  const position = Math.min(targetIndex, (parentNode?.children.length ?? 1) - 1);
  return { code: result, id: `${newParent}.${position}` };
}

/** Ensures `import { names } from source` exists, adding missing specifiers. */
export function ensureImports(code: string, names: string[], source = '@enterprise-ui/react'): string {
  if (!names.length) return code;
  let program: AnyNode;
  try { program = parseModule(code).program; } catch { return code; }
  const imports = (program.body as AnyNode[]).filter((n) => n.type === 'ImportDeclaration');
  const declaration = imports.find((n) => n.source.value === source && n.importKind !== 'type' && n.specifiers.some((s: AnyNode) => s.type === 'ImportSpecifier'));
  const imported = new Set(imports.filter((n) => n.source.value === source).flatMap((n) => n.specifiers.map((s: AnyNode) => s.local.name)));
  const missing = [...new Set(names)].filter((name) => !imported.has(name));
  if (!missing.length) return code;
  if (declaration) {
    const last = declaration.specifiers.filter((s: AnyNode) => s.type === 'ImportSpecifier').at(-1);
    return code.slice(0, last.end) + `, ${missing.join(', ')}` + code.slice(last.end);
  }
  const line = `import { ${missing.join(', ')} } from '${source}';\n`;
  const lastImport = imports.at(-1);
  return lastImport ? `${code.slice(0, lastImport.end)}\n${line.trimEnd()}${code.slice(lastImport.end)}` : line + code;
}

/** Capitalised tag names used in a snippet (for imports). */
export const componentNames = (snippet: string) => [...new Set([...snippet.matchAll(/<([A-Z][A-Za-z0-9]*)/g)].map((m) => m[1]))];
