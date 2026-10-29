import { fireEvent, screen, waitFor, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DataGrid } from '../../src/components/data-grid';
import { DateRangePicker, isDateRangeValid } from '../../src/components/date-range-picker';
import { FilterToken, FilterTokenGroup } from '../../src/components/filter-token';
import { SavedViews, createInMemorySavedViewPersistence, getDefaultSavedView, type SavedView } from '../../src/components/saved-views';
import { axeViolations, renderWithTheme } from '../utils';
import InventoryExample from '../../examples/phase2/inventory';
import ListReportExample from '../../examples/list-report/01-basic';
import { ThemeProvider } from '../../src/themes';

const view: SavedView = { id: 'a', name: 'Inventory', scope: 'personal', isDefault: true, configuration: { filters: [], sort: [], visibleColumns: ['name'], pageSize: 10 } };

describe('Phase 2 controls', () => {
  it('sends server paging and sorting changes without locally filtering the supplied page', async () => {
    const onPageChange = vi.fn();
    const onSortChange = vi.fn();
    renderWithTheme(<DataGrid title="Inventory" data={[{ id: 'a', name: 'Bolt' }]} getRowId={(r) => r.id}
      columns={[{ id: 'name', header: 'Name', accessor: 'name', sortable: true }]}
      search="not in row" onSearchChange={() => {}} sort={null} onSortChange={onSortChange}
      server={{ page: 1, pageSize: 1, totalItems: 3, onPageChange, onPageSizeChange: () => {}, filters: {}, onFiltersChange: () => {}, stale: true }} />);
    expect(screen.getByText('Bolt')).toBeInTheDocument();
    expect(screen.getByText('(3)')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('previous results');
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
    fireEvent.click(screen.getByRole('button', { name: /Name/ }));
    expect(onSortChange).toHaveBeenCalledWith({ columnId: 'name', direction: 'ascending' });
  });

  it('keeps selected IDs when server pages change', () => {
    const columns = [{ id: 'name', header: 'Name', accessor: 'name' as const }];
    const server = { page: 1, pageSize: 1, totalItems: 2, onPageChange: vi.fn(), onPageSizeChange: vi.fn(), filters: {}, onFiltersChange: vi.fn() };
    const { rerender } = render(<ThemeProvider><DataGrid title="Items" columns={columns} data={[{ id: 'a', name: 'First' }]} getRowId={item => item.id} selectionMode="multiple" server={server} /></ThemeProvider>);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
    expect(screen.getByText('1 selected')).toBeInTheDocument();
    rerender(<ThemeProvider><DataGrid title="Items" columns={columns} data={[{ id: 'b', name: 'Second' }]} getRowId={item => item.id} selectionMode="multiple" server={{ ...server, page: 2 }} /></ThemeProvider>);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
    expect(screen.getByText('2 selected')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
    expect(screen.getByText('1 selected')).toBeInTheDocument();
  });

  it('renders the composed inventory example without axe violations', async () => {
    const { container } = renderWithTheme(<InventoryExample />);
    await screen.findByText('Bolt');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('supports inclusive date presets, bounds, and invalid ranges', () => {
    const onChange = vi.fn();
    const { rerender } = renderWithTheme(<DateRangePicker label="Period" value={{ start: '', end: '' }} onChange={onChange} min="2026-10-26" today={() => new Date(2026, 9, 29)} />);
    fireEvent.click(screen.getByRole('button', { name: 'Last 7 Days' }));
    expect(onChange).toHaveBeenCalledWith({ start: '2026-10-26', end: '2026-10-29' });
    rerender(<DateRangePicker label="Period" value={{ start: '2026-10-29', end: '2026-10-26' }} />);
    expect(screen.getByRole('alert')).toHaveTextContent('valid date range');
    expect(screen.getByLabelText('Start date')).toHaveAttribute('aria-invalid', 'true');
  });

  it('names token removal actions accessibly', () => {
    const remove = vi.fn();
    renderWithTheme(<FilterToken name="Status" value="Open" onRemove={remove} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove filter Status: Open' }));
    expect(remove).toHaveBeenCalledOnce();
  });

  it('delegates saved view changes and reports failures', async () => {
    const rename = vi.fn().mockRejectedValue(new Error('Permission denied'));
    const save = vi.fn();
    renderWithTheme(<SavedViews views={[view]} selectedId="a" onSelect={() => {}} onSave={save} onRename={rename} onDelete={() => {}} />);
    fireEvent.change(screen.getByLabelText('View name'), { target: { value: 'New name' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save current view' }));
    expect(save).toHaveBeenCalledWith('New name', 'personal');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Rename' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Rename' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Permission denied');
  });
});

describe('Phase 2 integration and contracts', () => {
  it('offers keyboard-operable widths and externally controlled columns', () => {
    const onVisibleColumnIdsChange = vi.fn();
    renderWithTheme(<DataGrid title="Widths" data={[{ id: '1', name: 'Bolt', qty: 2 }]} columns={[
      { id: 'name', header: 'Name', accessor: 'name' }, { id: 'qty', header: 'Quantity', accessor: 'qty' },
    ]} visibleColumnIds={['name']} onVisibleColumnIdsChange={onVisibleColumnIdsChange} resizableColumns />);
    expect(screen.queryByRole('columnheader', { name: 'Quantity' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Column widths' }));
    const slider = screen.getByRole('slider', { name: /Name width/ });
    fireEvent.change(slider, { target: { value: '240' } });
    expect(screen.getByRole('columnheader', { name: 'Name' })).toHaveStyle({ width: '240px' });
  });

  it('renders external filtering and loading failures distinctly', () => {
    const { rerender } = render(<DataGrid title="Inventory" data={[]} columns={[{ id: 'name', header: 'Name' }]}
      server={{ page: 1, pageSize: 10, totalItems: 0, filters: {}, onFiltersChange: () => {}, onPageChange: () => {}, onPageSizeChange: () => {}, hasActiveFilters: true }} />);
    expect(screen.getByText('No results match your search or filters.')).toBeInTheDocument();
    rerender(<DataGrid title="Inventory" data={[]} columns={[{ id: 'name', header: 'Name' }]}
      server={{ page: 1, pageSize: 10, totalItems: 0, filters: {}, onFiltersChange: () => {}, onPageChange: () => {}, onPageSizeChange: () => {}, error: 'Offline' }} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Offline');
    expect(screen.getByText('Data is unavailable.')).toBeInTheDocument();
  });
  it('validates calendar dates and provides keyboard focus and accessible errors', async () => {
    expect(isDateRangeValid({ start: '2026-02-30', end: '' })).toBe(false);
    expect(isDateRangeValid({ start: '2026-02-28', end: '2026-03-01' })).toBe(true);
    const { user, container } = renderWithTheme(<DateRangePicker label="Period" value={{ start: '2026-03-02', end: '2026-03-01' }} />);
    await user.tab();
    expect(screen.getByLabelText('Start date')).toHaveFocus();
    expect(screen.getByLabelText('End date')).toHaveAttribute('aria-describedby');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('clears a group of filters and names individual actions', () => {
    const clear = vi.fn(); const remove = vi.fn();
    renderWithTheme(<FilterTokenGroup tokens={[{ id: 'a', name: 'Status', value: 'Open' }, { id: 'b', name: 'Owner', value: 'Lee' }]} onClear={clear} onRemove={remove} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove filter Owner: Lee' }));
    expect(remove).toHaveBeenCalledWith('b');
    fireEvent.click(screen.getByRole('button', { name: 'Clear all filters' }));
    expect(clear).toHaveBeenCalledOnce();
  });

  it('persists full configurations with scoped defaults, copies and cancellation', async () => {
    const store = createInMemorySavedViewPersistence([view]);
    const signal = new AbortController().signal;
    const shared = { ...view, id: 'shared', scope: 'shared' as const, name: 'Shared', configuration: { ...view.configuration, grouping: ['status'], search: 'bolt' } };
    await store.save(shared, signal);
    const list = await store.list(signal);
    expect(getDefaultSavedView(list)?.id).toBe('a');
    expect(list.find(item => item.id === 'shared')?.configuration.grouping).toEqual(['status']);
    list[0].name = 'mutated';
    expect((await store.list(signal))[0].name).toBe('Inventory');
    await store.save({ ...view, id: 'new', name: 'New' }, signal);
    expect(getDefaultSavedView(await store.list(signal))?.id).toBe('new');
    await store.delete('new', signal);
    const canceled = new AbortController(); canceled.abort();
    await expect(store.list(canceled.signal)).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('saves and reapplies a view in the inventory example', async () => {
    const { user } = renderWithTheme(<InventoryExample />);
    await screen.findByRole('option', { name: /All inventory/ });
    await user.type(screen.getByRole('searchbox', { name: 'Search Inventory' }), 'Bolt');
    await screen.findByText('Bolt');
    await user.type(screen.getByLabelText('View name'), 'Bolts');
    await user.click(screen.getByRole('button', { name: 'Save current view' }));
    await screen.findByRole('option', { name: /Bolts/ });
    await user.clear(screen.getByRole('searchbox', { name: 'Search Inventory' }));
    await user.selectOptions(screen.getByLabelText('View'), 'all');
    expect(screen.getByRole('searchbox', { name: 'Search Inventory' })).toHaveValue('');
    const option = screen.getByRole('option', { name: /Bolts/ }) as HTMLOptionElement;
    await user.selectOptions(screen.getByLabelText('View'), option.value);
    expect(screen.getByRole('searchbox', { name: 'Search Inventory' })).toHaveValue('Bolt');
  });

  it('orchestrates ListReport filters, tokens, search and paging', async () => {
    const { user } = renderWithTheme(<ListReportExample />);
    await screen.findByText('Valve');
    await user.selectOptions(screen.getByLabelText('Status'), 'Open');
    expect(await screen.findByRole('button', { name: 'Remove filter status: Open' })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Pump')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Clear all filters' }));
    await screen.findByText('Pump');
    await user.type(screen.getByRole('searchbox', { name: 'Search Products' }), 'Pipe');
    await screen.findByText('Pipe');
    expect(screen.queryByText('Valve')).not.toBeInTheDocument();
  });

});
