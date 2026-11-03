import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { MessagePopover } from './MessagePopover';

const messages = [
  { id: '1', type: 'warning' as const, title: 'Delivery date is a holiday.', targetId: 'f-date' },
  { id: '2', type: 'error' as const, title: 'Enter a supplier.', subtitle: 'Supplier', targetId: 'f-supplier' },
  { id: '3', type: 'error' as const, title: 'Enter a quantity.', subtitle: 'Quantity' },
];

describe('MessagePopover', () => {
  it('summarizes counts, lists errors first, filters by type and focuses the field', async () => {
    const { user, container } = renderWithTheme(
      <>
        <input id="f-supplier" aria-label="Supplier" />
        <MessagePopover messages={messages} />
      </>,
    );
    const trigger = screen.getByRole('button', { name: '2 errors, 1 warning' });
    await user.click(trigger);
    const items = screen.getAllByRole('button').filter((b) => b.closest('ul'));
    expect(items.map((b) => b.textContent)).toEqual(['Errors: Enter a supplier.Supplier', 'Errors: Enter a quantity.Quantity', 'Warnings: Delivery date is a holiday.']);
    await user.click(screen.getByRole('button', { name: 'Warnings (1)' }));
    expect(screen.getAllByRole('button').filter((b) => b.closest('ul'))).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'All (3)' }));
    expect(await axeViolations(container)).toEqual([]);
    await user.click(screen.getByRole('button', { name: /Enter a supplier/ }));
    await new Promise((r) => setTimeout(r, 10));
    expect(screen.getByRole('textbox', { name: 'Supplier' })).toHaveFocus();
  });
});
