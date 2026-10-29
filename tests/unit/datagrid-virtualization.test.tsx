import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DataGrid } from '../../src';
import { axeViolations, renderWithTheme } from '../utils';
const rows = Array.from({ length: 10000 }, (_, index) => ({ id: `id-${index}`, name: `Item ${index}` }));
const columns = [{ id: 'name', header: 'Name', accessor: 'name' as const }];
describe('DataGrid row virtualization', () => {
  it('windows a large page while selection and select-all refer to the whole page', async () => {
    const onSelectionChange = vi.fn();
    const { user } = renderWithTheme(<DataGrid title="Inventory" columns={columns} data={rows} pageSize={0} getRowId={(row) => row.id} getRowLabel={(row) => row.name} selectionMode="multiple" virtualization={{ rowHeight: 40, height: 200, overscan: 1 }} onSelectionChange={onSelectionChange} />);
    const region = screen.getByRole('region', { name: 'Inventory' });
    expect(within(region).getAllByRole('row').length).toBeLessThan(12);
    expect(within(region).getByRole('table')).toHaveAttribute('aria-rowcount', '10001');
    await user.click(within(region).getByRole('checkbox', { name: 'Select Item 0' }));
    region.focus();
    fireEvent.scroll(region, { target: { scrollTop: 2000 } });
    expect(within(region).getByText('Item 50')).toBeInTheDocument();
    expect(within(region).queryByText('Item 0')).not.toBeInTheDocument();
    fireEvent.scroll(region, { target: { scrollTop: 0 } });
    expect(within(region).getByRole('checkbox', { name: 'Select Item 0' })).toBeChecked();
    await user.click(within(region).getByRole('checkbox', { name: 'Select all rows' }));
    expect(onSelectionChange.mock.lastCall?.[0]).toHaveLength(10000);
    expect(await axeViolations(region)).toEqual([]);
  });
  it('navigates to an offscreen row while keeping focused rows mounted on scroll', async () => {
    const { user } = renderWithTheme(<DataGrid title="Items" columns={columns} data={rows.slice(0, 30)} pageSize={0} getRowId={(row) => row.id} selectionMode="multiple" virtualization={{ rowHeight: 40, height: 80, overscan: 0 }} />);
    const region = screen.getByRole('region', { name: 'Items' });
    const first = within(region).getByText('Item 0').closest('tr')!; first.focus();
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    await waitFor(() => expect(within(region).getByText('Item 3').closest('tr')).toHaveFocus());
    fireEvent.scroll(region, { target: { scrollTop: 800 } });
    expect(within(region).getByText('Item 3').closest('tr')).toHaveFocus();
  });
  it('renders normally when virtualization is absent', () => {
    renderWithTheme(<DataGrid title="Items" columns={columns} data={rows.slice(0, 20)} pageSize={0} />);
    expect(screen.getAllByRole('row')).toHaveLength(21);
  });
});

describe('virtual keyboard tab traversal', () => {
  it('continues from a pinned row to offscreen row controls in both directions', async () => {
    renderWithTheme(<DataGrid title="Tab test" columns={columns} data={rows.slice(0, 50)} pageSize={0} getRowId={(row) => row.id} getRowLabel={(row) => row.name} selectionMode="multiple" virtualization={{ rowHeight: 40, height: 80, overscan: 0 }} />);
    const region = screen.getByRole('region', { name: 'Tab test' });
    const first = within(region).getByRole('checkbox', { name: 'Select Item 0' }); first.focus();
    fireEvent.scroll(region, { target: { scrollTop: 800 } });
    fireEvent.keyDown(first, { key: 'Tab' });
    await waitFor(() => expect(within(region).getByText('Item 1').closest('tr')).toHaveFocus());
    const row = within(region).getByText('Item 1').closest('tr')!;
    fireEvent.scroll(region, { target: { scrollTop: 1200 } });
    fireEvent.keyDown(row, { key: 'Tab', shiftKey: true });
    await waitFor(() => expect(within(region).getByRole('checkbox', { name: 'Select Item 0' })).toHaveFocus());
  });
});
