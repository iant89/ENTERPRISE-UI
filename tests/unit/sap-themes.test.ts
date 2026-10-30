import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { THEMES } from '../../src/themes';

const read = (name: string) => readFileSync(resolve(`src/themes/${name}.css`), 'utf8');
const tokens = (css: string) => new Set([...css.matchAll(/--(eui-[\w-]+):/g)].map((m) => m[1]));

describe('SAP Fiori themes', () => {
  const sap = { 'sap-horizon': '#0070f2', 'sap-horizon-dark': '#3890f5', 'sap-fiori-3': '#0a6ed1', 'sap-fiori-3-dark': '#559edc' } as const;

  it('are registered alongside the existing themes', () => {
    expect(THEMES.map((t) => t.name)).toEqual(['light', 'dark', 'high-contrast', ...Object.keys(sap)]);
    const index = readFileSync(resolve('src/styles/index.css'), 'utf8');
    for (const name of Object.keys(sap)) expect(index).toContain(`@import '../themes/${name}.css';`);
  });

  it.each(Object.entries(sap))('%s defines every token the light theme defines, with SAP values', (name, primary) => {
    const css = read(name);
    expect(css).toContain(`[data-eui-theme='${name}']`);
    expect(css).toContain('theming-base-content 11.36.5 (Apache-2.0');
    const own = tokens(css);
    for (const token of tokens(read('light'))) expect(own, token).toContain(token);
    expect(css).toContain(`--eui-color-primary: ${primary};`);
    expect(css).toMatch(/--eui-font-family: "72", "72full", Arial/);
  });

  it('use the SAP content shadow levels and interaction shadows', () => {
    const horizon = read('sap-horizon');
    expect(horizon).toContain('--eui-shadow-level-0: 0 0 0.125rem 0 rgba(34,53,72,0.2), 0 0.125rem 0.25rem 0 rgba(34,53,72,0.2);');
    expect(horizon).toContain('--eui-shadow-interaction: inset 0 0 0 0.0625rem rgba(85,107,129,0.25);');
    expect(horizon).toContain('--eui-radius-lg: .75rem;');
    expect(read('sap-fiori-3')).toContain('--eui-radius-md: .25rem;');
  });

  it('keep the existing themes visually unchanged: levels alias the old scale, state shadows are transparent', () => {
    for (const name of ['light', 'dark', 'high-contrast']) {
      const css = read(name);
      expect(css).toContain('--eui-shadow-level-0: var(--eui-shadow-sm);');
      expect(css).toContain('--eui-shadow-level-3: var(--eui-shadow-xl);');
      expect(css).toContain('--eui-shadow-interaction: 0 0 0 0 transparent;');
    }
  });
});
