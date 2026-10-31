import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import type { Plugin } from 'vite';

const repoRoot = resolve(import.meta.dirname, '../..');
const VIRTUAL = 'virtual:studio-types';

/** Emits the library's declarations in memory, so the build does not depend on `build:lib`. */
function libraryDeclarations(): Record<string, string> {
  const configPath = resolve(repoRoot, 'tsconfig.build.json');
  const parsed = ts.getParsedCommandLineOfConfigFile(configPath, {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => undefined });
  if (!parsed) throw new Error('Could not read tsconfig.build.json');
  const options = { ...parsed.options, declaration: true, emitDeclarationOnly: true, noEmit: false, declarationDir: '/types', outDir: '/types', rootDir: resolve(repoRoot, 'src') };
  const program = ts.createProgram(parsed.fileNames, options);
  const files: Record<string, string> = {};
  program.emit(undefined, (fileName, text) => {
    if (fileName.endsWith('.d.ts')) files[`file:///node_modules/@enterprise-ui/react/${fileName.replace(/^\/types\//, '')}`] = text;
  });
  files['file:///node_modules/@enterprise-ui/react/package.json'] = JSON.stringify({ name: '@enterprise-ui/react', types: 'index.d.ts' });
  return files;
}

/** A compact declaration for lucide-react (its own bundle is over 2 MB of declarations). */
async function lucideDeclarations(): Promise<string> {
  const icons = Object.keys(await import('lucide-react')).filter((name) => /^[A-Z]/.test(name) && !name.endsWith('Icon') && !name.startsWith('Lucide'));
  return `declare module 'lucide-react' {
  import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react';
  export interface LucideProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> { size?: string | number; absoluteStrokeWidth?: boolean }
  export type LucideIcon = ForwardRefExoticComponent<LucideProps & RefAttributes<SVGSVGElement>>;
${icons.map((name) => `  export const ${name}: LucideIcon;`).join('\n')}
}
`;
}

const read = (path: string) => readFileSync(resolve(repoRoot, 'node_modules', path), 'utf8');

/** `virtual:studio-types`: declarations the code editor loads for autocompletion and type checking. */
export function studioTypes(): Plugin {
  let cached: Promise<string> | undefined;
  return {
    name: 'studio-types',
    resolveId: (id) => (id === VIRTUAL ? `\0${VIRTUAL}` : undefined),
    load(id) {
      if (id !== `\0${VIRTUAL}`) return undefined;
      cached ??= (async () => {
        const files: Record<string, string> = {
          ...libraryDeclarations(),
          'file:///node_modules/@types/react/index.d.ts': read('@types/react/index.d.ts'),
          'file:///node_modules/@types/react/global.d.ts': read('@types/react/global.d.ts'),
          'file:///node_modules/@types/react/jsx-runtime.d.ts': read('@types/react/jsx-runtime.d.ts'),
          'file:///node_modules/@types/react/package.json': JSON.stringify({ name: '@types/react', types: 'index.d.ts' }),
          // csstype is about 900 KB; an open record keeps `style` usable without the full catalogue.
          'file:///node_modules/csstype/index.d.ts': 'export interface Properties<TLength = string | 0, TTime = string> { [property: string]: unknown }\nexport interface PropertiesHyphen<TLength = string | 0, TTime = string> { [property: string]: unknown }\nexport type Property = Record<string, unknown>;\n',
          'file:///node_modules/csstype/package.json': JSON.stringify({ name: 'csstype', types: 'index.d.ts' }),
          'file:///node_modules/lucide-react/index.d.ts': await lucideDeclarations(),
        };
        return `export default ${JSON.stringify(files)};`;
      })();
      return cached;
    },
  };
}
