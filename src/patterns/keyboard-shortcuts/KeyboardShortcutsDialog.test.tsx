import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { KeyboardShortcutsDialog } from './KeyboardShortcutsDialog';

const groups = [
  { title: 'General', shortcuts: [{ keys: ['Mod+K'], description: 'Open command palette' }, { keys: ['?'], description: 'Show shortcuts' }] },
  { title: 'Lists', shortcuts: [{ keys: ['J', 'ArrowDown'], description: 'Next item' }] },
];

describe('KeyboardShortcutsDialog', () => {
  it('opens with ? outside text fields and filters shortcuts', async () => {
    const { user } = renderWithTheme(
      <>
        <input aria-label="Name" />
        <KeyboardShortcutsDialog groups={groups} platform="other" />
      </>,
    );
    await user.click(screen.getByRole('textbox', { name: 'Name' }));
    await user.keyboard('?');
    expect(screen.queryByRole('dialog')).toBeNull();
    await user.click(document.body);
    await user.keyboard('?');
    const dialog = screen.getByRole('dialog', { name: 'Keyboard shortcuts' });
    expect(dialog).toHaveTextContent('Control plus K');
    await user.type(screen.getByRole('searchbox', { name: 'Search shortcuts' }), 'next');
    expect(screen.getAllByRole('term').map((t) => t.textContent)).toEqual(['Next item']);
    expect(await axeViolations(dialog)).toEqual([]);
  });
});
