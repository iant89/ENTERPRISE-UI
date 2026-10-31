/** Generate a reference inventory from pinned UI5 package metadata and the matching docs source.
 * Usage: node scripts/generate-component-roadmap.mjs <metadata-root> <extracted-ui5-source-root>
 * See docs/roadmap/README.md for provenance and limitations.
 */
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { compactRoadmap } from './compact-component-roadmap.mjs';
import { writeRoadmap } from './roadmap-parts.mjs';

const [metadataRoot, sourceRoot] = process.argv.slice(2);
if (!metadataRoot || !sourceRoot) throw new Error('Provide the extracted npm package root and UI5 source root');
const groups = JSON.parse(fs.readFileSync('scripts/ui5-requested-components.json', 'utf8'));
const packageNames = { main: '@ui5/webcomponents', fiori: '@ui5/webcomponents-fiori', compat: '@ui5/webcomponents-compat', ai: '@ui5/webcomponents-ai', base: '@ui5/webcomponents-base' };
const packageDirs = Object.fromEntries(Object.entries(packageNames).map(([key, name]) => [name, key === 'base' ? path.join(metadataRoot, 'base/package') : path.join(metadataRoot, `ui5-webcomponents${key === 'main' ? '' : `-${key}`}-2.28.1/package`)]));
const packageManifests = Object.fromEntries(Object.entries(packageNames).filter(([key]) => key !== 'base').map(([key, name]) => [key, JSON.parse(fs.readFileSync(path.join(packageDirs[name], 'dist/custom-elements.json'), 'utf8'))]));
const sampleRoot = path.join(sourceRoot, 'packages/website/docs');
const samples = Object.fromEntries(Object.keys(groups).map((key) => [key, JSON.parse(fs.readFileSync(path.join(sampleRoot, 'components', key, 'samples.json'), 'utf8'))]));
const base = 'https://github.com/UI5/webcomponents/blob/v2.28.1';
const allDirs = [...fs.readdirSync('src/components').map((name) => `src/components/${name}`), ...fs.readdirSync('src/patterns').filter((name) => !name.includes('.')).map((name) => `src/patterns/${name}`), ...fs.readdirSync('src/layouts').map((name) => `src/layouts/${name}`)];
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const equivalents = { BusyIndicator: 'spinner', CheckBox: 'checkbox', ProgressIndicator: 'progress-bar', RadioButton: 'radio-group', NumericInput: 'number-input', TabContainer: 'tabs', Tab: 'tabs', Toolbar: 'command-toolbar', Search: 'search-field', ShellBar: 'application-header', NotificationList: 'notification-center', SegmentedButton: 'button-group', Text: null };
const table = (s) => String(s ?? 'Not specified').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
const code = (s) => { const text = String(s ?? 'Not specified').replace(/\|/g, '\\|').replace(/\r?\n/g, ' '); return text.includes('`') ? `\`\` ${text} \`\`` : `\`${text}\``; };
const no = 'None listed in the pinned manifest; inherited or runtime behavior requires verification.';
const read = (p) => fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';

function chain(decl, pkg) {
  const output = []; const seen = new Set();
  let d = decl; let owner = pkg;
  while (d && owner && !seen.has(`${owner}:${d.name}`)) {
    seen.add(`${owner}:${d.name}`); output.push({ d, owner });
    const sup = d.superclass; if (!sup || !packageDirs[sup.package]) break;
    const manifestPath = path.join(packageDirs[sup.package], 'dist/custom-elements.json');
    if (!fs.existsSync(manifestPath)) break;
    const man = JSON.parse(read(manifestPath));
    d = man.modules.flatMap((m) => m.declarations ?? []).find((x) => x.name === sup.name);
    owner = sup.package;
  }
  return output;
}
function dtsFields(module, pkg, className) {
  const text = read(path.join(packageDirs[pkg], module.replace(/\.js$/, '.d.ts')));
  if (!text) return new Map();
  const sf = ts.createSourceFile('module.d.ts', text, ts.ScriptTarget.Latest, true);
  const cls = sf.statements.find((s) => ts.isClassDeclaration(s) && s.name?.text === className);
  const result = new Map();
  for (const m of cls?.members ?? []) {
    if (m.name && (ts.isPropertyDeclaration(m) || ts.isGetAccessorDeclaration(m) || ts.isMethodDeclaration(m))) {
      const key = m.name.getText(sf).replace(/^['"]|['"]$/g, '');
      result.set(key, { type: m.type ? `${m.type.getText(sf)}${ts.isPropertyDeclaration(m) && m.questionToken ? ' | undefined' : ''}` : undefined, declaration: m.getText(sf).replace(/\s+/g, ' ') });
    }
  }
  return result;
}
function eventFlags(evt, chainNodes, moduleMap) {
  for (const { d, owner } of chainNodes) {
    const module = moduleMap.get(`${owner}:${d.name}`);
    if (!module) continue;
    const src = read(path.join(packageDirs[owner], module));
    const sf = ts.createSourceFile(module, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    let flags;
    const visit = (node) => {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && /^event(?:Strict)?$/.test(node.expression.text) && ts.isStringLiteral(node.arguments[0]) && node.arguments[0].text === evt) {
        const obj = node.arguments[1];
        if (!obj || ts.isObjectLiteralExpression(obj)) {
          const bool = (key) => {
            const p = obj?.properties.find((v) => ts.isPropertyAssignment(v) && v.name.getText(sf) === key);
            return !p ? 'false' : p.initializer.kind === ts.SyntaxKind.TrueKeyword ? 'true' : p.initializer.kind === ts.SyntaxKind.FalseKeyword ? 'false' : 'not statically determined';
          };
          flags = { bubbles: bool('bubbles'), cancelable: bool('cancelable') };
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sf); if (flags) return flags;
  }
  return { bubbles: 'not specified', cancelable: 'not specified' };
}
const moduleMap = new Map();
for (const [key, man] of [...Object.entries(packageManifests), ['base', JSON.parse(read(path.join(packageDirs[packageNames.base], 'dist/custom-elements.json'))) ]]) for (const mod of man.modules) for (const d of mod.declarations ?? []) moduleMap.set(`${packageNames[key]}:${d.name}`, mod.path);
const sampleText = read(path.join(sampleRoot, '_samples/main/Avatar/Basic/sample.tsx')).trim();
let out = `# Component implementation roadmap\n\n`;
out += `## Purpose and completion gate\n\nThis is a **reference-derived implementation backlog**, not a claim of UI5 compatibility or a completed implementation. Every entry requires a TypeScript/React API design compatible with this library, implementation, unit and interaction tests, accessibility and keyboard tests, responsive/RTL review where relevant, and documentation before it can be marked complete. Existing components are **candidates for comparison**, not verified matches. Do not mechanically copy web-component APIs into React or equate UI5 slots/events with React props. Preserve application-owned transport, authorization and routing.\n\n`;
out += `## Source and interpretation\n\n- Snapshot: [Apache-2.0 licensed](https://github.com/UI5/webcomponents/blob/v2.28.1/LICENSE.txt) [UI5 Web Components v2.28.1](https://github.com/UI5/webcomponents/tree/v2.28.1), npm manifests \`@ui5/webcomponents\`, \`@ui5/webcomponents-fiori\`, \`@ui5/webcomponents-compat\` and \`@ui5/webcomponents-ai\`, all **2.28.1**. The supplied Fiori, compat and AI URLs refer to **nightly**; this pinned stable snapshot is not a claim that the moving nightly site has identical APIs. Reconcile against the linked nightly docs before implementation. The main/compat table names and tags collide; they are separate entries and must not be registered together.\n- Types come from published TypeScript declarations where available, falling back to custom-elements manifest types. Named types can require their imported declarations; links to the published declaration files are included. Slot names come from the manifest and slot types from matching declaration fields where identifiable; unknown means verify upstream, not no restriction. Properties list public manifest fields; missing defaults are **not specified**, not inferred.\n- Event payload types and descriptions come from the manifest. Bubbles/cancelable flags are taken only from statically identifiable UI5 event decorators (including a resolvable same-package superclass), whose omitted flags default to false; otherwise they are explicitly not specified. Native events, event dispatch variants and inheritance need separate verification. CSS parts and custom states are the published manifest, not a complete CSS contract. Empty documentation fields indicate missing information in the snapshot, not proof that a feature does not exist at runtime.\n- Regenerate from the four pinned npm package tarballs and \`@ui5/webcomponents-base@2.28.1\` extracted under a metadata root, plus the v2.28.1 GitHub source archive extracted separately; run \`node scripts/generate-component-roadmap.mjs <metadata-root> <extracted-source-root>\`. The folder names expected by the generator match \`npm pack\` tarball names; the base package goes under \`base/package\`. The requested component list is in \`scripts/ui5-requested-components.json\`.
- Sample links and descriptions point to the pinned source. Some child components are illustrated only in their parent samples; absence here does not prove no sample exists. Examples are reference material, not runnable examples in this library. Long descriptions include upstream keyboard guidance where supplied; missing guidance must be researched and tested, not treated as no keyboard behavior.\n\n`;
out += `## Playground parsed: Avatar / Basic\n\nThe upstream playground presents HTML, JavaScript and React/TypeScript tabs backed by [sample.html](${base}/packages/website/docs/_samples/main/Avatar/Basic/sample.html), [main.js](${base}/packages/website/docs/_samples/main/Avatar/Basic/main.js) and [sample.tsx](${base}/packages/website/docs/_samples/main/Avatar/Basic/sample.tsx). The sample creates a React wrapper for the UI5 custom element and renders initials; this project should implement its own React component rather than assume the wrapper is the desired integration. The complete TypeScript playground sample is:\n\n\`\`\`tsx\n${sampleText}\n\`\`\`\n\n`;
let count = 0; const missing = [];
for (const [group, names] of Object.entries(groups)) {
  out += `## ${group === 'main' ? 'Core components' : group === 'fiori' ? 'Advanced / Fiori components' : group === 'compat' ? 'Compatibility components' : 'AI components'}\n\n`;
  for (const name of names.split(/\s+/)) {
    const mod = packageManifests[group].modules.find((m) => m.declarations?.some((d) => d.name === name && d.tagName));
    if (!mod) { missing.push(`${group}/${name}`); continue; }
    const d = mod.declarations.find((x) => x.name === name && x.tagName); const pkg = packageNames[group]; const inherited = chain(d, pkg);
    const fields = new Map();
    for (const { d: item, owner } of inherited) {
      const m = moduleMap.get(`${owner}:${item.name}`) ?? (item === d ? mod.path : undefined);
      if (!m) continue;
      for (const [key, value] of dtsFields(m, owner, item.name)) if (!fields.has(key)) fields.set(key, value);
    }
    const url = group === 'main' ? `https://ui5.github.io/webcomponents/components/${name}/` : `https://ui5.github.io/webcomponents/nightly/components/${group}/${name}/`;
    const sourceUrl = `https://unpkg.com/${pkg}@2.28.1/${mod.path.replace(/\.js$/, '.d.ts')}`;
    const candidateName = Object.hasOwn(equivalents, name) ? equivalents[name] : name;
    const candidates = candidateName ? allDirs.filter((p) => norm(path.basename(p)) === norm(candidateName)) : [];
    count++;
    out += `### [${name}](${url})\n\n- Tag: \`${d.tagName}\`\n- Package: \`${pkg}@2.28.1\`; [TypeScript declaration](${sourceUrl}).\n- Local implementation: ${candidates.length ? candidates.map((p) => `\`${p}\``).join(', ') + ' (candidate only; parity unverified)' : 'No same-name local implementation identified; verify before implementation.'}\n- Status: [ ] Implement or verify behavior, tests, accessibility, documentation and integration.\n\n`;
    out += `#### Description and keyboard interaction\n\n${(d.description || 'Not supplied in manifest; consult the upstream component page.').replace(/^#{1,4} /gm, '##### ')}\n\n`;
    const properties = (d.members ?? []).filter((m) => m.kind === 'field' && m.privacy !== 'private' && m.privacy !== 'protected');
    out += `#### TypeScript properties\n\n`;
    if (!properties.length) out += `${no}\n\n`;
    else {
      out += '| Name | TypeScript type | Default | Description |\n| --- | --- | --- | --- |\n';
      for (const p of properties) { const tsType = fields.get(p.name)?.type || p.type?.text; out += `| ${code(p.name)} | ${code(tsType)} | ${code(p.default)} | ${table(p.description)}${p.deprecated ? `<br>**Deprecated:** ${table(p.deprecated)}` : ''} |\n`; }
      out += '\n';
    }
    out += `#### Slots\n\n`;
    if (!d.slots?.length) out += `${no}\n\n`;
    else { out += '| Slot | TypeScript slot type | Description |\n| --- | --- | --- |\n'; for (const s of d.slots) { let typ = fields.get(s.name)?.type; if (s.name === 'default') { const possible = [...fields.values()].filter((v) => v.type?.includes('DefaultSlot<')); if (possible.length === 1) typ = possible[0].type; } out += `| ${code(s.name)} | ${code(typ ?? 'Not identified; inspect declaration')} | ${table(s.description)} |\n`; } out += '\n'; }
    out += `#### Events\n\n`;
    if (!d.events?.length) out += `${no}\n\n`;
    else { out += '| Event | Type | Bubbles | Cancelable | Description |\n| --- | --- | --- | --- | --- |\n'; for (const e of d.events) { const flags = eventFlags(e.name, inherited, moduleMap); out += `| ${code(e.name)} | ${code(e.type?.text)} | ${flags.bubbles} | ${flags.cancelable} | ${table(e.description)} |\n`; } out += '\n'; }
    out += `#### Public methods\n\n`;
    const methods = (d.members ?? []).filter((m) => m.kind === 'method' && m.privacy !== 'private' && m.privacy !== 'protected');
    if (!methods.length) out += `${no}\n\n`;
    else { out += '| Method | Signature / return | Description |\n| --- | --- | --- |\n'; for (const m of methods) out += `| ${code(m.name)} | ${code(fields.get(m.name)?.declaration || m.return?.type?.text)} | ${table(m.description)} |\n`; out += '\n'; }
    for (const [title, entries] of [['CSS parts', d.cssParts], ['CSS custom states', d.cssStates]]) {
      out += `#### ${title}\n\n`; if (!entries?.length) out += `${no}\n\n`;
      else { for (const e of entries) out += `- ${code(e.name)}: ${table(e.description)}\n`; out += '\n'; }
    }
    out += `#### Samples\n\n`;
    const ss = samples[group][name]?.samples ?? [];
    if (!ss.length) out += `No component-specific playground samples listed in the pinned samples index; check parent examples and the linked documentation.\n\n`;
    else { for (const sample of ss) { const p = `${base}/packages/website/docs/_samples/${group}/${name}/${sample.name}`; out += `- [${sample.title || sample.name}](${p}/sample.tsx)${sample.description ? ` — ${table(sample.description)}` : ''}; [HTML](${p}/sample.html), [JavaScript](${p}/main.js).\n`; } out += '\n'; }
    out += `#### Acceptance and possible tests\n\n- [ ] Verify public TypeScript surface, required/default values, composition and documented states against the pinned declaration and current linked docs.\n- [ ] Add focused unit, keyboard, accessible-name/state, interaction and error/disabled-state tests where applicable; verify events, payloads and cancellation where specified.\n`;
    if (properties.length) out += `- [ ] Test documented defaults and representative boundaries/controlled changes for ${properties.slice(0, 3).map((p) => code(p.name)).join(', ')}.\n`;
    if (d.events?.length) out += `- [ ] Verify ${d.events.map((e) => code(e.name)).join(', ')} semantics and payloads, including cancellation and propagation where applicable.\n`;
    if (candidates.length) out += `- [ ] Compare the existing ${candidates.map((p) => code(p)).join(', ')} against this entry and add regression tests for gaps before claiming parity.\n`;
    out += '\n';
  }
}
if (missing.length) throw new Error(`Requested components absent from metadata: ${missing.join(', ')}`);
out += `## Inventory summary\n\n${count} requested entries, with core and compat variants kept separate. Metadata and samples are a pinned starting point, not proof of current nightly parity.\n`;
writeRoadmap(compactRoadmap(out));
console.log(`Wrote ${count} entries to docs/roadmap/`);
