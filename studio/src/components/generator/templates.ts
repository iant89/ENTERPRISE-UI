/**
 * Code Studio C5: pure templates for the §6.2 generated component files. No I/O; `generate.ts`
 * validates and writes them as one undo step. C7's docs reuse `docsTemplate`, so keep its front
 * matter and headings stable.
 */
export type Language = 'ts' | 'js';
export type ExportStyle = 'named' | 'default';
export type Styling = 'css' | 'none';

export interface ComponentOptions {
  language: Language;
  exportStyle: ExportStyle;
  styling: Styling;
  tests: boolean;
  docs: boolean;
  index: boolean;
  /** Spec gap: `Name.example.tsx` exporting a default `Example` that renders the component with sample props. Off by default. */
  example: boolean;
}

export const DEFAULT_OPTIONS: ComponentOptions = { language: 'ts', exportStyle: 'named', styling: 'css', tests: true, docs: true, index: true, example: false };

/** `ExampleCard` → `example-card` (the BEM block). */
export const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase();

const ext = (o: ComponentOptions) => (o.language === 'ts' ? '.tsx' : '.jsx');
/** Generated file names (relative to the `Name/` folder) in display order. */
export function fileNames(name: string, o: ComponentOptions): string[] {
  const x = ext(o);
  return [
    `${name}${x}`,
    ...(o.styling === 'css' ? [`${name}.css`] : []),
    ...(o.tests ? [`${name}.test${x}`] : []),
    ...(o.docs ? [`${name}.docs.md`] : []),
    ...(o.example ? [`${name}.example${x}`] : []),
    ...(o.index ? [o.language === 'ts' ? 'index.ts' : 'index.js'] : []),
  ];
}

export function componentTemplate(name: string, o: ComponentOptions): string {
  const b = kebab(name);
  const ts = o.language === 'ts';
  const lines: string[] = [];
  if (ts) lines.push("import type { ReactNode } from 'react';");
  if (o.styling === 'css') lines.push(`import './${name}.css';`);
  if (ts) {
    lines.push(
      `export interface ${name}Props {`,
      '  /** Main heading displayed by the card. */',
      '  title: string;',
      '  /** Optional supporting content. */',
      '  children?: ReactNode;',
      '  /** Applies the emphasized visual treatment. */',
      '  emphasized?: boolean;',
      '}',
    );
  }
  lines.push(
    `export ${o.exportStyle === 'default' ? 'default ' : ''}function ${name}({`,
    '  title,',
    '  children,',
    '  emphasized = false,',
    `}${ts ? `: ${name}Props` : ''}) {`,
    '  return (',
    '    <article',
    '      className={',
    '        emphasized',
    `          ? '${b} ${b}--emphasized'`,
    `          : '${b}'`,
    '      }',
    '    >',
    `      <h2 className="${b}__title">{title}</h2>`,
    `      <div className="${b}__content">`,
    '        {children}',
    '      </div>',
    '    </article>',
    '  );',
    '}',
    '',
  );
  return lines.join('\n');
}

export const cssTemplate = (name: string) => {
  const b = kebab(name);
  return `.${b} {
  display: flex;
  flex-direction: column;
  gap: var(--eui-space-2, 0.5rem);
  padding: var(--eui-space-4, 1rem);
  border: 1px solid var(--eui-color-border, #d0d5dd);
  border-radius: var(--eui-radius-md, 0.5rem);
  background: var(--eui-color-surface, #fff);
  color: var(--eui-color-text, inherit);
}

.${b}--emphasized {
  border-color: var(--eui-color-primary, #0064d9);
}

.${b}__title {
  margin: 0;
  font-size: var(--eui-font-size-lg, 1.125rem);
}

.${b}__content {
  color: var(--eui-color-text-secondary, inherit);
}
`;
};

const importLine = (name: string, o: ComponentOptions, from: string) =>
  o.exportStyle === 'default' ? `import ${name} from '${from}';` : `import { ${name} } from '${from}';`;

export const testTemplate = (name: string, o: ComponentOptions) => `import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
${importLine(name, o, `./${name}`)}

describe('${name}', () => {
  it('renders the title and content', () => {
    render(<${name} title="Hello">Body</${name}>);
    expect(screen.getByRole('heading', { name: 'Hello' })).toBeTruthy();
    expect(screen.getByText('Body')).toBeTruthy();
  });

  it('applies the emphasized modifier', () => {
    const { container } = render(<${name} title="Hello" emphasized />);
    expect(container.firstElementChild?.className).toContain('${kebab(name)}--emphasized');
  });
});
`;

export const docsTemplate = (name: string, o: ComponentOptions) => `---
title: ${name}
component: ${name}
---

# ${name}

Describe what ${name} is for and when to use it.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| \`title\` | \`string\` | — | Main heading displayed by the card. |
| \`children\` | \`ReactNode\` | — | Optional supporting content. |
| \`emphasized\` | \`boolean\` | \`false\` | Applies the emphasized visual treatment. |

## Usage

\`\`\`tsx
${importLine(name, o, `./components/${name}`)}

<${name} title="Hello">Supporting content</${name}>
\`\`\`
`;

export const exampleTemplate = (name: string, o: ComponentOptions) => `${importLine(name, o, `./${name}`)}

/** Example usage of ${name}, rendered with sample props. */
export default function Example() {
  return (
    <${name} title="Example title" emphasized>
      Sample content
    </${name}>
  );
}
`;

export const indexTemplate = (name: string, o: ComponentOptions) =>
  o.exportStyle === 'default'
    ? `export { default, default as ${name} } from './${name}';\n${o.language === 'ts' ? `export type { ${name}Props } from './${name}';\n` : ''}`
    : `export { ${name} } from './${name}';\n${o.language === 'ts' ? `export type { ${name}Props } from './${name}';\n` : ''}`;

/** The full file map relative to the `Name/` folder. */
export function componentFiles(name: string, o: ComponentOptions): Record<string, string> {
  const x = ext(o);
  const out: Record<string, string> = { [`${name}${x}`]: componentTemplate(name, o) };
  if (o.styling === 'css') out[`${name}.css`] = cssTemplate(name);
  if (o.tests) out[`${name}.test${x}`] = testTemplate(name, o);
  if (o.docs) out[`${name}.docs.md`] = docsTemplate(name, o);
  if (o.example) out[`${name}.example${x}`] = exampleTemplate(name, o);
  if (o.index) out[o.language === 'ts' ? 'index.ts' : 'index.js'] = indexTemplate(name, o);
  return out;
}
