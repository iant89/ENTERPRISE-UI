/**
 * C7 decision 2a: "Add documentation" drafts `Name.docs.md` from the C5 template headings, with
 * generated sections wrapped in markers. Regenerate only replaces the content inside markers.
 */
import type { CatalogItem } from '../../components/catalog/types';
import { GEN_CLOSE, GEN_OPEN } from './markdown';

export interface DocsFindings { props: number; jsdoc: number; usages: { path: string; line: number }[]; examples: string[] }

/** Files that use `<Name` (excluding the component's own folder). */
export function findUsages(name: string, files: Readonly<Record<string, string>>, own?: string): { path: string; line: number }[] {
  const dir = own?.slice(0, own.lastIndexOf('/') + 1);
  const re = new RegExp(`<${name}[\\s/>]`);
  const out: { path: string; line: number }[] = [];
  for (const [p, t] of Object.entries(files)) {
    if (!/\.[jt]sx$/.test(p) || (dir && p.startsWith(dir))) continue;
    const i = t.split('\n').findIndex((l) => re.test(l));
    if (i >= 0) out.push({ path: p, line: i + 1 });
  }
  return out;
}

export const findings = (item: CatalogItem, files: Readonly<Record<string, string>>): DocsFindings => ({
  props: item.props.length,
  jsdoc: item.props.filter((p) => p.description).length + (item.description ? 1 : 0),
  usages: findUsages(item.name, files, item.source),
  examples: item.examples ?? [],
});

const esc = (s: string) => s.replace(/\|/g, '\\|');

/** The generated sections, keyed by heading (content only, without markers). */
export function generatedSections(item: CatalogItem, files: Readonly<Record<string, string>>, importPath: string): Record<string, string> {
  const rows = item.props.map((p) => `| \`${p.name}\` | \`${esc(p.type ?? 'unknown')}\` | ${p.required ? 'yes' : 'no'} | ${p.default !== undefined ? `\`${esc(p.default)}\`` : '—'} | ${p.description ? esc(p.description) : 'TODO'} |`);
  const usage = findUsages(item.name, files, item.source)[0];
  const usageLine = usage ? (files[usage.path].split('\n')[usage.line - 1] ?? '').trim() : `<${item.name} />`;
  const imp = item.exportName === 'default' ? `import ${item.name} from '${importPath}';` : `import { ${item.name} } from '${importPath}';`;
  return {
    Props: ['| Prop | Type | Required | Default | Description |', '| --- | --- | --- | --- | --- |', ...rows].join('\n'),
    Usage: ['```tsx', imp, '', usageLine, '```'].join('\n'),
  };
}

const block = (body: string) => `${GEN_OPEN}\n${body}\n${GEN_CLOSE}`;

/** New docs file (C5 docs template front matter and headings). */
export function draftDocs(item: CatalogItem, files: Readonly<Record<string, string>>, importPath: string): string {
  const g = generatedSections(item, files, importPath);
  return `---
title: ${item.name}
component: ${item.name}
---

# ${item.name}

## Overview

${item.description ?? `TODO: describe ${item.name}.`}

## Props

${block(g.Props)}

## Usage

${block(g.Usage)}
`;
}

export type RegenResult = { ok: true; text: string } | { ok: false; error: string };

/**
 * Replaces the content inside each generated marker pair whose preceding heading matches a generated
 * section; prose outside markers is kept byte-for-byte. Malformed markers (unclosed, nested, stray
 * close) → no write.
 */
export function regenerate(existing: string, item: CatalogItem, files: Readonly<Record<string, string>>, importPath: string): RegenResult {
  const g = generatedSections(item, files, importPath);
  const re = /<!-- (\/?)generated -->/g;
  let depth = 0;
  for (const m of existing.matchAll(re)) {
    depth += m[1] ? -1 : 1;
    if (depth < 0 || depth > 1) return { ok: false, error: 'Generated markers are malformed (nested or a stray close). Fix them, then regenerate.' };
  }
  if (depth !== 0) return { ok: false, error: 'A generated section is not closed (missing <!-- /generated -->). Fix it, then regenerate.' };
  let out = '';
  let last = 0;
  const pair = /<!-- generated -->\n?([\s\S]*?)\n?<!-- \/generated -->/g;
  for (const m of existing.matchAll(pair)) {
    const before = existing.slice(0, m.index);
    const heading = [...before.matchAll(/^#{1,6}\s+(.+?)\s*(?:<!-- generated -->)?\s*$/gm)].at(-1)?.[1];
    const fresh = heading && g[heading];
    out += existing.slice(last, m.index) + (fresh !== undefined ? block(fresh) : m[0]);
    last = m.index! + m[0].length;
  }
  return { ok: true, text: out + existing.slice(last) };
}
