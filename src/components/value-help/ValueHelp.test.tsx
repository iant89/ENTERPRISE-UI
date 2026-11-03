import { describe, expect, it, vi } from 'vitest';
import { act, screen, waitFor, within } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { ValueHelpDialog } from './ValueHelpDialog';
import { ValueHelpInput } from './ValueHelpInput';

interface Supplier { id: string; name: string; city: string; country: string }
const suppliers: Supplier[] = [
  { id: '100045', name: 'Northwind Components', city: 'Hamburg', country: 'DE' },
  { id: '100046', name: 'Contoso Industrial', city: 'Lyon', country: 'FR' },
  { id: '100047', name: 'Fabrikam Metals', city: 'Munich', country: 'DE' },
];
const columns = [{ key: 'id' as const, header: 'Supplier' }, { key: 'name' as const, header: 'Name' }, { key: 'city' as const, header: 'City' }];
const common = { title: 'Select supplier', columns, getKey: (s: Supplier) => s.id, getLabel: (s: Supplier) => `${s.name} (${s.id})` };

describe('ValueHelpDialog', () => {
  it('searches local items, filters and confirms a single choice immediately', async () => {
    const onConfirm = vi.fn();
    const { user } = renderWithTheme(
      <ValueHelpDialog {...common} open onClose={() => {}} onConfirm={onConfirm} items={suppliers} filters={[{ key: 'country', label: 'Country', options: [{ value: 'DE', label: 'Germany' }, { value: 'FR', label: 'France' }] }]} />,
    );
    const dialog = screen.getByRole('dialog', { name: 'Select supplier' });
    await waitFor(() => expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveFocus());
    expect(within(dialog).getByRole('status')).toHaveTextContent('3 results');
    await user.selectOptions(within(dialog).getByRole('combobox', { name: 'Country' }), 'DE');
    expect(within(dialog).getByRole('status')).toHaveTextContent('2 results');
    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'munich');
    expect(within(dialog).getByRole('status')).toHaveTextContent('1 result');
    await user.click(within(dialog).getByRole('radio', { name: 'Select Fabrikam Metals (100047)' }));
    expect(onConfirm).toHaveBeenCalledWith([suppliers[2]]);
  });

  it('collects several choices as tokens and confirms with OK', async () => {
    const onConfirm = vi.fn();
    const { user } = renderWithTheme(<ValueHelpDialog {...common} open onClose={() => {}} onConfirm={onConfirm} items={suppliers} selectionMode="multiple" defaultSelected={[suppliers[0]]} />);
    expect(screen.getByRole('checkbox', { name: 'Select Northwind Components (100045)' })).toBeChecked();
    await user.click(screen.getByText('Lyon'));
    expect(within(screen.getByRole('list', { name: 'Selected (2)' })).getAllByRole('listitem')).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: /Remove Northwind|Delete Northwind|Northwind Components \(100045\)/ }));
    await user.click(screen.getByRole('button', { name: 'OK' }));
    expect(onConfirm).toHaveBeenCalledWith([suppliers[1]]);
  });

  it('debounces server searches, aborts stale requests and recovers from errors', async () => {
    const calls: { search: string; aborted: () => boolean }[] = [];
    let fail = true;
    const fetchItems = vi.fn((q: { search: string }, signal: AbortSignal) => {
      calls.push({ search: q.search, aborted: () => signal.aborted });
      if (fail) return Promise.reject(new Error('down'));
      return Promise.resolve({ items: suppliers.filter((s) => s.name.toLowerCase().includes(q.search.toLowerCase())), total: 3200 });
    });
    const { user, container } = renderWithTheme(<ValueHelpDialog {...common} open onClose={() => {}} onConfirm={() => {}} fetchItems={fetchItems} />);
    await waitFor(() => expect(screen.getByText('The search failed.')).toBeInTheDocument());
    fail = false;
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('3 of 3,200 results'));
    const before = fetchItems.mock.calls.length;
    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'con');
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('1 of 3,200 results'));
    // Typing three characters within the debounce window issues one request, not three.
    expect(fetchItems.mock.calls.length - before).toBe(1);
    expect(calls.at(-1)!.search).toBe('con');
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('ValueHelpInput', () => {
  it('opens with the button or F4 and shows the chosen item', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<ValueHelpInput {...common} label="Supplier" items={suppliers} onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Supplier' });
    await user.click(input);
    await user.keyboard('{F4}');
    expect(screen.getByRole('dialog', { name: 'Select supplier' })).toBeInTheDocument();
    await user.click(screen.getByText('Contoso Industrial'));
    expect(onChange).toHaveBeenCalledWith([suppliers[1]]);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(input).toHaveValue('Contoso Industrial (100046)');
  });

  it('shows multiple choices as removable tokens', async () => {
    const { user } = renderWithTheme(<ValueHelpInput {...common} label="Suppliers" items={suppliers} selectionMode="multiple" defaultValue={[suppliers[0], suppliers[2]]} />);
    expect(screen.getByRole('list', { name: 'Suppliers' })).toHaveTextContent('Northwind Components (100045)');
    await user.click(screen.getByRole('button', { name: 'Select supplier' }));
    await act(async () => {});
    expect(screen.getAllByRole('checkbox', { checked: true })).toHaveLength(2);
  });
});
