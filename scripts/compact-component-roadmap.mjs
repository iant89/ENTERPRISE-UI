/** Group empty metadata sections without interpreting absence as proof of no runtime behavior. */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const emptyMarker = 'None listed in the pinned manifest; inherited or runtime behavior requires verification.';
const emptySamples = 'No component-specific playground samples listed in the pinned samples index; check parent examples and the linked documentation.';
const emptyDescription = 'Not supplied in manifest; consult the upstream component page.';
const sectionPattern = /^#### ([^\n]+)\n([\s\S]*?)(?=^#### |^### \[|^## |(?![\s\S]))/gm;

function isEmpty(content) {
  const trimmed = content.trim();
  if ([emptyMarker, emptySamples, emptyDescription].includes(trimmed)) return true;
  // A collection of headings alone conveys no content. Preserve real subheadings and their content.
  return trimmed.replace(/^\s*#{1,6}\s+[^\n]*$/gm, '').trim() === '';
}

export function compactRoadmap(input) {
  const entryPattern = /^### \[[^\n]+\n[\s\S]*?(?=^### \[|^## |(?![\s\S]))/gm;
  return input.replace(entryPattern, (entry) => {
    const empty = [];
    const body = entry.replace(sectionPattern, (whole, name, content) => {
      if (name === 'Empty documentation fields') {
        for (const match of content.matchAll(/^\s*-\s+(.+)$/gm)) empty.push(match[1].trim());
        return '';
      }
      if (name === 'Description and keyboard interaction' && /^`import [^\n]+;`$/.test(content.trim())) {
        empty.push(name);
        return `Module import: ${content.trim()}\n\n`;
      }
      if (!isEmpty(content)) return whole;
      empty.push(name);
      return '';
    }).trimEnd();
    return `${body}\n\n${empty.length ? `#### Empty documentation fields\n\n${[...new Set(empty)].map((name) => `- ${name}`).join('\n')}\n\n` : ''}`;
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const filename = process.argv[2] ?? 'Component-Impl-Roadmap.md';
  writeFileSync(filename, compactRoadmap(readFileSync(filename, 'utf8')));
  console.log(`Grouped empty fields in ${filename}`);
}
