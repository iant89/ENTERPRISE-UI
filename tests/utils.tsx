import type { ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { ThemeProvider } from '../src/themes';

/** Renders inside a ThemeProvider and returns a userEvent instance. */
export function renderWithTheme(ui: ReactElement, options?: RenderOptions) {
  const user = userEvent.setup();
  const result = render(<ThemeProvider>{ui}</ThemeProvider>, options);
  return { user, ...result };
}

/** Runs axe on a container and returns the violations (colour contrast is checked in the browser suite). */
export async function axeViolations(container: Element) {
  const results = await axe.run(container, {
    rules: {
      'color-contrast': { enabled: false },
      region: { enabled: false },
    },
  });
  return results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`);
}
