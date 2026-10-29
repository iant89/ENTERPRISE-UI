import type { ComponentType } from 'react';

interface ExampleModule {
  default: ComponentType;
  title?: string;
  description?: string;
  frame?: boolean;
}

export interface Example {
  id: string;
  folder: string;
  title: string;
  description?: string;
  frame: boolean;
  Component: ComponentType;
  code: string;
}

const modules = import.meta.glob<ExampleModule>('../../examples/*/*.tsx', { eager: true });
const sources = import.meta.glob<string>('../../examples/*/*.tsx', { eager: true, query: '?raw', import: 'default' });

/** Removes the docs-only metadata exports from the displayed source. */
function cleanSource(code: string): string {
  return code
    .replace(/^export const (title|description|frame) = [\s\S]*?;\n/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export const examples: Example[] = Object.entries(modules)
  .filter(([path]) => !path.includes('/apps/'))
  .map(([path, mod]) => {
    const [, folder, file] = /examples\/([^/]+)\/([^/]+)\.tsx$/.exec(path)!;
    return {
      id: `${folder}/${file}`,
      folder,
      title: mod.title ?? file,
      description: mod.description,
      frame: !!mod.frame,
      Component: mod.default,
      code: cleanSource(sources[path]),
    };
  })
  .sort((a, b) => a.id.localeCompare(b.id));

export const examplesFor = (folder: string) => examples.filter((e) => e.folder === folder);
