/** Check generated documentation prop names against the built public declarations. */
import ts from 'typescript';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const entry = resolve(root, 'dist/types/index.d.ts');
const config = ts.getParsedCommandLineOfConfigFile(resolve(root, 'tsconfig.json'), { noEmit: true }, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: (diagnostic) => { throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')); } });
const program = ts.createProgram([entry], config.options);
const checker = program.getTypeChecker();
const source = program.getSourceFile(entry);
if (!source) throw new Error('Declarations missing; run npm run build:lib first.');
const symbol = checker.getSymbolAtLocation(source);
if (!symbol) throw new Error('Could not resolve declaration entry point.');
const exports = new Map(checker.getExportsOfModule(symbol).map((item) => [item.name, item]));
const api = JSON.parse(readFileSync(resolve(root, 'docs/generated/api.json'), 'utf8'));
const errors = [];
for (const [name, component] of Object.entries(api.components)) {
  if (!exports.has(name)) { errors.push(`${name}: missing public declaration`); continue; }
  const exportedProps = exports.get(`${name}Props`);
  if (!exportedProps) {
    if (component.props.length) errors.push(`${name}: documented props but no exported ${name}Props`);
    continue;
  }
  const props = exportedProps.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exportedProps) : exportedProps;
  const documented = new Set(component.props.map((prop) => prop.name));
  const declaredProperties = checker.getPropertiesOfType(checker.getDeclaredTypeOfSymbol(props)).filter((prop) => {
    const decl = prop.declarations?.[0];
    return decl && !decl.getSourceFile().fileName.includes('node_modules') && !prop.getJsDocTags(checker).some((tag) => tag.name === 'internal');
  });
  const declared = new Set(declaredProperties.map((prop) => prop.name));
  for (const prop of declaredProperties) {
    const doc = component.props.find((item) => item.name === prop.name);
    if (doc && doc.required !== !(prop.flags & ts.SymbolFlags.Optional)) errors.push(`${name}.${prop.name}: optionality differs from declarations`);
  }
  for (const prop of documented) if (!declared.has(prop)) errors.push(`${name}.${prop}: documented but absent from declarations`);
  for (const prop of declared) if (!documented.has(prop)) errors.push(`${name}.${prop}: present in declarations but undocumented`);
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Checked prop names and optionality for ${Object.keys(api.components).length} documented public exports against generated declarations.`);
