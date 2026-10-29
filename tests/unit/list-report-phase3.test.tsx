import { useState } from 'react';
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ListReport, createInMemoryAdapter, type DataFilter, type DataRequest, type ListReportView } from '../../src';
import SavedListReportExample from '../../examples/list-report/02-saved-views';
import PurchaseOrderList from '../../examples/list-report/03-purchase-orders';
import { renderWithTheme } from '../utils';

const rows = [{ id: 'a', name: 'Alpha' }, { id: 'b', name: 'Beta' }, { id: 'c', name: 'Gamma' }];
const memory = createInMemoryAdapter(rows, { fields: { name: (row) => row.name } });
const columns = [{ id: 'name', header: 'Name', accessor: 'name' as const, sortable: true }];
const empty: DataFilter[] = [];

describe('ListReport view and selection', () => {
  it('saves and restores view settings and applied filters', async () => {
    const { user } = renderWithTheme(<SavedListReportExample />);
    await screen.findByText('Valve');
    await user.selectOptions(screen.getByLabelText('Status'), 'Open');
    await user.type(screen.getByRole('searchbox', { name: 'Search Products' }), 'Pipe');
    await screen.findByText('Pipe');
    await user.type(screen.getByLabelText('View name'), 'Open pipes');
    await user.click(screen.getByRole('button', { name: 'Save current view' }));
    const saved = await screen.findByRole('option', { name: /Open pipes/ }) as HTMLOptionElement;
    await user.selectOptions(screen.getByLabelText('View'), 'all');
    expect(screen.getByRole('searchbox', { name: 'Search Products' })).toHaveValue('');
    expect(screen.getByLabelText('Status')).toHaveValue('');
    await user.selectOptions(screen.getByLabelText('View'), saved.value);
    expect(screen.getByRole('searchbox', { name: 'Search Products' })).toHaveValue('Pipe');
    expect(screen.getByLabelText('Status')).toHaveValue('Open');
    await screen.findByText('Pipe');
    await waitFor(() => expect(screen.queryByText('Valve')).not.toBeInTheDocument());
  });

  it('resets paging before issuing requests for a changed query', async () => {
    const load = vi.fn((request: DataRequest, signal: AbortSignal) => memory.load(request, signal));
    const adapter = { load };
    function Harness() {
      const [filters, setFilters] = useState<DataFilter[]>(empty);
      return <><button onClick={() => setFilters([{ field: 'name', operator: 'contains', value: 'a' }])}>Filter</button>
        <ListReport title="Items" columns={columns} adapter={adapter} getRowId={(row) => row.id} filters={filters} onFiltersChange={setFilters} pageSize={1} /></>;
    }
    const { user } = renderWithTheme(<Harness />);
    await screen.findByText('Alpha');
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    await screen.findByText('Beta');
    load.mockClear();
    await user.click(screen.getByRole('button', { name: 'Filter' }));
    await waitFor(() => expect(load).toHaveBeenCalled());
    expect(load.mock.calls.every(([request]) => request.pagination.page === 0)).toBe(true);
  });

  it('reports controlled selection across pages and allows clearing it', async () => {
    const selectedChanges = vi.fn();
    function Harness() {
      const [selected, setSelected] = useState<string[]>([]);
      return <ListReport title="Items" columns={columns} adapter={memory} getRowId={(row) => row.id} filters={empty} onFiltersChange={() => {}} pageSize={1}
        selectedIds={selected} onSelectionChange={(ids) => { selectedChanges(ids); setSelected(ids); }} selectionActions={(ids) => <span>Actions for {ids.length}</span>} />;
    }
    const { user } = renderWithTheme(<Harness />);
    await screen.findByText('Alpha');
    await user.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    await screen.findByText('Beta');
    await user.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
    expect(selectedChanges).toHaveBeenLastCalledWith(['a', 'b']);
    await user.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(selectedChanges).toHaveBeenLastCalledWith([]);
  });

  it('applies an externally controlled view including column visibility and sorting', async () => {
    const view: ListReportView = { search: 'Beta', sort: { columnId: 'name', direction: 'descending' }, visibleColumns: ['name'], pageSize: 1 };
    renderWithTheme(<ListReport title="Items" columns={columns} adapter={memory} getRowId={(row) => row.id} filters={empty} onFiltersChange={() => {}} view={view} onViewChange={() => {}} />);
    expect(await screen.findByText('Beta')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Name/ })).toHaveAttribute('aria-sort', 'descending');
    expect(screen.getByRole('searchbox', { name: 'Search Items' })).toHaveValue('Beta');
  });
  it('composes a Page and commands and refreshes after an external mutation', async () => {
    const action = vi.fn();
    const load = vi.fn((request: DataRequest, signal: AbortSignal) => memory.load(request, signal));
    const adapter = { load };
    function Harness() {
      const [revision, setRevision] = useState(0);
      return <ListReport pageLayout pageActions={[{ id: 'create', label: 'Create', onClick: action }]} title="Items"
        columns={columns} adapter={adapter} refreshKey={revision} getRowId={(row) => row.id} filters={empty} onFiltersChange={() => {}}
        toolbarActions={<button onClick={() => setRevision((value) => value + 1)}>Refresh data</button>} />;
    }
    const { user } = renderWithTheme(<Harness />);
    await screen.findByText('Alpha');
    expect(screen.getByRole('heading', { level: 1, name: 'Items' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Create' }));
    expect(action).toHaveBeenCalledOnce();
    const before = load.mock.calls.length;
    await user.click(screen.getByRole('button', { name: 'Refresh data' }));
    await waitFor(() => expect(load.mock.calls.length).toBeGreaterThan(before));
  });

  it('exposes recoverable loading errors', async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error('offline')).mockImplementation((request: DataRequest, signal: AbortSignal) => memory.load(request, signal));
    const { user } = renderWithTheme(<ListReport<(typeof rows)[number]> title="Items" columns={columns} adapter={{ load }} getRowId={(row) => row.id} filters={empty} onFiltersChange={() => {}} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load data');
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('Alpha')).toBeInTheDocument();
  });

  it('integrates bulk actions with a refreshed purchase-order report', async () => {
    const { user } = renderWithTheme(<PurchaseOrderList />);
    await screen.findByText('PO-1001');
    await user.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
    await user.click(screen.getByRole('button', { name: 'Archive' }));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(await screen.findByText('PO-1002: Order is locked')).toBeInTheDocument();
    expect(screen.getByText('2 succeeded; 1 failed.')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('PO-1001')).not.toBeInTheDocument());
    expect(screen.getByText('PO-1002')).toBeInTheDocument();
  });

});
