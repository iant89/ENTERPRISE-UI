import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { DualListSelector } from './DualListSelector';

const options = [
  { value: 'id', label: 'Order ID', disabled: true },
  { value: 'customer', label: 'Customer' },
  { value: 'status', label: 'Status' },
  { value: 'amount', label: 'Amount' },
];

const pane = (name: string) => screen.getByRole('region', { name });

describe('DualListSelector', () => {
  it('moves checked items across in option order and announces it', async () => {
    const onChange = vi.fn();
    const { user, container } = renderWithTheme(<DualListSelector aria-label="Columns" options={options} defaultValue={['id']} onChange={onChange} />);
    await user.click(within(pane('Available')).getByRole('checkbox', { name: 'Amount' }));
    await user.click(within(pane('Available')).getByRole('checkbox', { name: 'Customer' }));
    await user.click(screen.getByRole('button', { name: 'Add selected' }));
    expect(onChange).toHaveBeenLastCalledWith(['id', 'customer', 'amount']);
    expect(within(pane('Selected')).getAllByRole('checkbox').map((c) => c.closest('label')?.textContent)).toEqual(['Selected', 'Order ID', 'Customer', 'Amount']);
    expect(container).toHaveTextContent('2 items moved to Selected');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('never moves disabled options with Remove all', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<DualListSelector options={options} defaultValue={['id', 'status']} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Remove all' }));
    expect(onChange).toHaveBeenLastCalledWith(['id']);
  });

  it('filters a pane and reorders chosen items', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<DualListSelector options={options} defaultValue={['customer', 'status', 'amount']} onChange={onChange} reorderable />);
    await user.type(screen.getByRole('searchbox', { name: 'Filter available items' }), 'zzz');
    expect(within(pane('Available')).getByText('No matching items')).toBeInTheDocument();
    await user.click(within(pane('Selected')).getByRole('checkbox', { name: 'Amount' }));
    await user.click(screen.getByRole('button', { name: 'Move up' }));
    expect(onChange).toHaveBeenLastCalledWith(['customer', 'amount', 'status']);
  });

  it('select-all checks only the visible, enabled items', async () => {
    const { user } = renderWithTheme(<DualListSelector options={options} />);
    await user.click(within(pane('Available')).getAllByRole('checkbox')[0]);
    expect(within(pane('Available')).getByRole('checkbox', { name: 'Order ID' })).not.toBeChecked();
    expect(within(pane('Available')).getByRole('checkbox', { name: 'Status' })).toBeChecked();
  });
});
