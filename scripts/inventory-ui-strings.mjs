/** Heuristic source inventory, not a proof that a string is visible or translatable. */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const textAttributes = new Set(['aria-label', 'aria-description', 'aria-valuetext', 'title', 'placeholder', 'alt', 'label']);

/** Return potential user-facing JSX text, text attributes, and message literals. */
export function inventory(source, fileName = 'source.tsx') {
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found = [];
  const add = (node, kind, text) => {
    const value = text.replace(/\s+/g, ' ').trim();
    if (!value || !/[\p{L}]/u.test(value)) return;
    const { line } = file.getLineAndCharacterOfPosition(node.getStart(file));
    found.push({ line: line + 1, kind, text: value });
  };
  const isType = (node) => {
    for (let parent = node.parent; parent; parent = parent.parent) {
      if (ts.isTypeNode(parent)) return true;
      if (ts.isStatement(parent) || ts.isJsxExpression(parent) || ts.isJsxAttribute(parent)) break;
    }
    return false;
  };
  const visit = (node) => {
    if (ts.isJsxText(node)) add(node, 'jsx-text', node.text);
    else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateExpression(node)) {
      const parent = node.parent;
      if (ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent) || ts.isLiteralTypeNode(parent) || isType(node)) return;
      if (ts.isJsxAttribute(parent)) {
        if (textAttributes.has(parent.name.getText(file))) add(node, 'attribute', node.text);
      } else if (ts.isJsxExpression(parent) && ts.isJsxAttribute(parent.parent)) {
        if (textAttributes.has(parent.parent.name.getText(file))) add(node, 'attribute', node.getText(file).slice(1, -1));
      } else if (ts.isPropertyAssignment(parent) && parent.name === node) {
        // Object property names are not message values.
      } else if (ts.isElementAccessExpression(parent) || ts.isCaseClause(parent)) {
        // Usually keys or control flow, not UI content.
      } else {
        const value = ts.isTemplateExpression(node) ? node.getText(file).slice(1, -1) : node.text;
        // Strings with spaces or punctuation are likely messages; include single words only
        // when directly rendered in JSX. This deliberately trades recall for fewer code tokens.
        if (ts.isJsxExpression(parent) || /[\s.!?…:]/u.test(value)) add(node, 'literal', value);
      }
      if (ts.isTemplateExpression(node)) return;
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return found;
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : entry.isFile() && /\.[jt]sx?$/.test(entry.name) && !/\.(?:test|spec)\.[jt]sx?$/.test(entry.name) ? [path] : [];
  });
}

export function scan(sourceRoot = join(root, 'src')) {
  return ['components', 'layouts', 'patterns'].flatMap((dir) => walk(join(sourceRoot, dir))).sort().flatMap((path) => inventory(readFileSync(path, 'utf8'), path).map((candidate) => ({ file: relative(root, path).replaceAll('\\', '/'), ...candidate })));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const candidates = scan();
  if (process.argv.includes('--summary')) {
    const counts = new Map();
    for (const candidate of candidates) counts.set(candidate.file, (counts.get(candidate.file) ?? 0) + 1);
    console.log(`${candidates.length} candidate strings in ${counts.size} files (manual triage required)`);
    for (const [file, count] of [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) console.log(`${String(count).padStart(3)} ${file}`);
  } else console.log(JSON.stringify(candidates, null, 2));
}
