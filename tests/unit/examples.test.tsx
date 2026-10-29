import { describe, expect, it } from 'vitest';
import type { ComponentType } from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider, ToastProvider } from '../../src';
import { axeViolations } from '../utils';

/**
 * Renders every documentation example and runs axe-core on it. Examples
 * double as integration tests for realistic component compositions.
 */
const modules = import.meta.glob<{ default: ComponentType }>('../../examples/*/*.tsx', { eager: true });

describe('documentation examples', () => {
  const entries = Object.entries(modules).filter(([path]) => !path.includes('/apps/'));

  it('exist for every component folder', () => {
    expect(entries.length).toBeGreaterThan(60);
  });

  for (const [path, mod] of entries) {
    const name = path.replace('../../examples/', '');
    it(`${name} renders without accessibility violations`, async () => {
      const Example = mod.default;
      const { container } = render(
        <ThemeProvider>
          <ToastProvider>
            <Example />
          </ToastProvider>
        </ThemeProvider>,
      );
      expect(await axeViolations(container, { ignoreStructure: true })).toEqual([]);
    });
  }
});
