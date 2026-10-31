// Extracts component properties (types, defaults, JSDoc) from the library source with the
// TypeScript compiler API, plus the design tokens each component's CSS module reads, and
// writes docs/generated/api.json.
// Usage: node scripts/extract-api.mjs
import ts from 'typescript';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const entry = resolve(root, 'src/index.ts');
const configPath = resolve(root, 'tsconfig.json');
const config = ts.getParsedCommandLineOfConfigFile(configPath, {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} });
const program = ts.createProgram([entry], { ...config.options, noEmit: true });
const checker = program.getTypeChecker();
const source = program.getSourceFile(entry);
const moduleSymbol = checker.getSymbolAtLocation(source);
const exports = checker.getExportsOfModule(moduleSymbol);

const isPascal = (name) => /^[A-Z]/.test(name);
const jsDoc = (symbol) => ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim();
const tag = (symbol, name) => symbol.getJsDocTags(checker).find((t) => t.name === name);
const tagText = (t) => (t ? ts.displayPartsToString(t.text).trim() : undefined);

function cleanType(text) {
  return text
    .replace(/React\.|import\("[^"]+"\)\./g, '')
    .replace(/\s+/g, ' ')
    .replace(/ \| undefined$/, '');
}

const FLAGS = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope;

/** Expands literal-union aliases (e.g. `ButtonSize` → `'sm' | 'md' | 'lg'`) so docs show the options. */
function typeText(type) {
  if (type.isUnion()) {
    const members = type.types.filter((t) => !(t.flags & ts.TypeFlags.Undefined));
    if (members.every((t) => t.flags & (ts.TypeFlags.StringLiteral | ts.TypeFlags.NumberLiteral | ts.TypeFlags.BooleanLiteral | ts.TypeFlags.Null))) {
      const parts = members.map((t) => checker.typeToString(t, undefined, FLAGS));
      const hasBool = parts.includes('true') && parts.includes('false');
      const out = parts.filter((p) => !hasBool || (p !== 'true' && p !== 'false'));
      if (hasBool) out.unshift('boolean');
      return out.join(' | ');
    }
  }
  return checker.typeToString(type, undefined, FLAGS);
}

function propsOf(typeSymbol) {
  const declared = checker.getDeclaredTypeOfSymbol(typeSymbol);
  const props = [];
  let inheritsNative = false;
  for (const prop of checker.getPropertiesOfType(declared)) {
    const decl = prop.declarations?.[0];
    if (!decl) continue;
    const file = decl.getSourceFile().fileName;
    if (file.includes('node_modules')) {
      inheritsNative = true;
      continue;
    }
    if (tag(prop, 'internal')) continue;
    const type = checker.getTypeOfSymbolAtLocation(prop, decl);
    props.push({
      name: prop.getName(),
      type: cleanType(typeText(type)),
      required: !(prop.flags & ts.SymbolFlags.Optional),
      description: jsDoc(prop),
      default: tagText(tag(prop, 'default')),
      source: relative(root, file),
    });
  }
  props.sort((a, b) => Number(b.required) - Number(a.required) || a.name.localeCompare(b.name));
  return { props, inheritsNative };
}

/** Design tokens (`--eui-*`) read by the CSS modules next to a component's source file. */
const tokenCache = new Map();
function cssVariablesFor(file) {
  if (!file) return [];
  const dir = dirname(resolve(root, file));
  if (tokenCache.has(dir)) return tokenCache.get(dir);
  const tokens = new Set();
  if (existsSync(dir)) {
    for (const name of readdirSync(dir)) {
      if (!name.endsWith('.module.css')) continue;
      for (const match of readFileSync(resolve(dir, name), 'utf8').matchAll(/var\((--eui-[a-z0-9-]+)/g)) tokens.add(match[1]);
    }
  }
  const list = [...tokens].sort();
  tokenCache.set(dir, list);
  return list;
}

const exportMap = new Map(exports.map((s) => [s.getName(), s]));
const components = {};
const hooks = {};

for (const symbol of exports) {
  const name = symbol.getName();
  const resolved = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
  if (!(resolved.flags & (ts.SymbolFlags.Function | ts.SymbolFlags.Variable))) continue;
  const decl = resolved.declarations?.[0];
  const file = decl ? relative(root, decl.getSourceFile().fileName) : '';
  if (name.startsWith('use')) {
    hooks[name] = { name, description: jsDoc(resolved), source: file };
    continue;
  }
  if (!isPascal(name)) continue;
  const propsSymbol = exportMap.get(`${name}Props`);
  let entry = { name, description: jsDoc(resolved), source: file, props: [], inheritsNative: false, cssVariables: cssVariablesFor(file) };
  if (propsSymbol) {
    const target = propsSymbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(propsSymbol) : propsSymbol;
    entry = { ...entry, ...propsOf(target) };
  }
  components[name] = entry;
}

const out = resolve(root, 'docs/generated/api.json');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({ components, hooks }, null, 2));
console.log(`API extracted: ${Object.keys(components).length} components, ${Object.keys(hooks).length} hooks → ${relative(root, out)}`);
