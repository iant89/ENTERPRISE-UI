import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../../../tests/utils';
import { Table, sortRows, type TableColumn } from './Table';
import { DataGrid } from '../data-grid';

interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
}

const data: Product[] = [
  { id: 'p1', name: 'Notebook', category: 'Hardware', stock: 12 },
  { id: 'p2', name: 'Antivirus', category: 'Software', stock: 140 },
  { id: 'p3', name: 'Monitor', category: 'Hardware', stock: 3 },
];

const columns: TableColumn<Product>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true, rowHeader: true },
  { id: 'category', header: 'Category', accessor: 'category' },
  { id: 'stock', header: 'Stock', accessor: 'stock', sortable: true, align: 'end' },
];

const firstColumn = () => screen.getAllByRole('rowheader').map((c) => c.textContent);

describe('sortRows', () => {
  it('sorts numbers and strings in both directions', () => {
    expect(sortRows(data, columns, { columnId: 'stock', direction: 'ascending' }).map((r) => r.stock)).toEqual([3, 12, 140]);
    expect(sortRows(data, columns, { columnId: 'name', direction: 'descending' }).map((r) => r.name)).toEqual(['Notebook', 'Monitor', 'Antivirus']);
  });
});

describe('Table', () => {
  it('renders a captioned table with row headers', () => {
    renderWithTheme(<Table caption="Products" columns={columns} data={data} />);
    expect(screen.getByRole('table', { name: 'Products' })).toBeInTheDocument();
    expect(firstColumn()).toEqual(['Notebook', 'Antivirus', 'Monitor']);
  });

  it('sorts when a sortable header is clicked and reflects aria-sort', async () => {
    const { user } = renderWithTheme(<Table caption="Products" columns={columns} data={data} />);
    const header = screen.getByRole('columnheader', { name: /Name/ });
    expect(header).toHaveAttribute('aria-sort', 'none');
    await user.click(within(header).getByRole('button'));
    expect(header).toHaveAttribute('aria-sort', 'ascending');
    expect(firstColumn()).toEqual(['Antivirus', 'Monitor', 'Notebook']);
    await user.click(within(header).getByRole('button'));
    expect(header).toHaveAttribute('aria-sort', 'descending');
    await user.click(within(header).getByRole('button'));
    expect(header).toHaveAttribute('aria-sort', 'none');
  });

  it('supports multiple selection with select-all', async () => {
    const onSelectionChange = vi.fn();
    const { user } = renderWithTheme(
      <Table caption="Products" columns={columns} data={data} selectionMode="multiple" onSelectionChange={onSelectionChange} getRowLabel={(r) => r.name} />,
    );
    await user.click(screen.getByRole('checkbox', { name: 'Select Monitor' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(['p3']);
    const all = screen.getByRole('checkbox', { name: 'Select all rows' });
    expect((all as HTMLInputElement).indeterminate).toBe(true);
    await user.click(all);
    expect(onSelectionChange).toHaveBeenLastCalledWith(['p3', 'p1', 'p2']);
  });

  it('activates rows with Enter', async () => {
    const onRowClick = vi.fn();
    const { user } = renderWithTheme(<Table caption="Products" columns={columns} data={data} onRowClick={onRowClick} />);
    const rows = screen.getAllByRole('row');
    rows[1].focus();
    await user.keyboard('{Enter}');
    expect(onRowClick).toHaveBeenCalledWith(data[0]);
  });

  it('shows loading and empty states', () => {
    const { rerender } = renderWithTheme(<Table caption="Products" columns={columns} data={[]} emptyState="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    rerender(<Table caption="Products" columns={columns} data={data} loading />);
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
  });

  it('has no axe violations', async () => {
    const { container } = renderWithTheme(<Table caption="Products" columns={columns} data={data} selectionMode="multiple" />);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('DataGrid', () => {
  const many = Array.from({ length: 23 }, (_, i) => ({ id: `r${i}`, name: `Item ${i + 1}`, category: i % 2 ? 'Hardware' : 'Software', stock: i }));
  const gridColumns = [
    { id: 'name', header: 'Name', accessor: 'name' as const, sortable: true },
    { id: 'category', header: 'Category', accessor: 'category' as const, filterOptions: [{ value: 'Hardware', label: 'Hardware' }, { value: 'Software', label: 'Software' }] },
    { id: 'stock', header: 'Stock', accessor: 'stock' as const, sortable: true },
  ];

  it('paginates, searches and filters', async () => {
    const { user } = renderWithTheme(<DataGrid title="Inventory" columns={gridColumns} data={many} pageSize={10} />);
    expect(screen.getByRole('heading', { name: 'Inventory (23)' })).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(11);
    await user.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(screen.getAllByRole('row')).toHaveLength(4);

    await user.type(screen.getByRole('searchbox', { name: 'Search Inventory' }), 'Item 2');
    expect(screen.getByRole('heading', { name: /Inventory \(5\)/ })).toBeInTheDocument();

    await user.clear(screen.getByRole('searchbox'));
    await user.click(screen.getByRole('combobox', { name: 'Filter by Category' }));
    await user.click(screen.getByRole('option', { name: 'Hardware' }));
    expect(screen.getByRole('heading', { name: 'Inventory (11)' })).toBeInTheDocument();
  });

  it('hides columns from view settings', async () => {
    const { user } = renderWithTheme(<DataGrid title="Inventory" columns={gridColumns} data={many} />);
    await user.click(screen.getByRole('button', { name: 'View settings' }));
    await user.click(await screen.findByRole('menuitemcheckbox', { name: 'Stock' }));
    expect(screen.queryByRole('columnheader', { name: /Stock/ })).not.toBeInTheDocument();
  });
});
