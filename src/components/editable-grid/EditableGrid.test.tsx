import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen, within } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { EditableGrid, type EditableGridColumn } from './EditableGrid';

interface Item { id: string; material: string; qty: number | null; plant: string; urgent: boolean }
const columns: EditableGridColumn<Item>[] = [
  { key: 'material', header: 'Material', required: true },
  { key: 'qty', header: 'Quantity', type: 'number', decimals: 0, validate: (v) => (typeof v === 'number' && v < 1 ? 'Order at least 1.' : undefined) },
  { key: 'plant', header: 'Plant', type: 'select', options: [{ value: '1010', label: 'Hamburg' }, { value: '2020', label: 'Lyon' }] },
  { key: 'urgent', header: 'Urgent', type: 'checkbox' },
];
const rows: Item[] = [
  { id: 'a', material: 'Valve', qty: 2, plant: '1010', urgent: false },
  { id: 'b', material: 'Sensor', qty: 5, plant: '2020', urgent: true },
];
let n = 0;
const createRow = (): Item => ({ id: `new-${++n}`, material: '', qty: null, plant: '', urgent: false });
const cell = (r: number, c: number) => document.querySelector<HTMLElement>(`[data-cell="${r}-${c}"]`)!;

describe('EditableGrid', () => {
  it('is a labelled grid with one tab stop and arrow-key navigation', async () => {
    const { user, container } = renderWithTheme(<EditableGrid label="Order items" columns={columns} defaultRows={rows} createRow={createRow} allowDuplicate />);
    expect(screen.getByRole('grid', { name: 'Order items' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add row' })).toBeInTheDocument();
    await user.tab();
    expect(cell(0, 0)).toHaveFocus();
    await user.keyboard('{ArrowRight}{ArrowDown}');
    expect(cell(1, 1)).toHaveFocus();
    expect(container.querySelectorAll('[role="gridcell"][tabindex="0"]')).toHaveLength(1);
    await user.keyboard('{End}');
    expect(screen.getByRole('button', { name: 'Delete row 2' })).toHaveFocus();
    await user.keyboard('{Control>}{Home}{/Control}');
    expect(cell(0, 0)).toHaveFocus();
    expect(await axeViolations(container)).toEqual([]);
  });

  it('starts editing by typing, commits with Enter and moves down', async () => {
    const onRowsChange = vi.fn();
    const { user } = renderWithTheme(<EditableGrid label="Items" columns={columns} defaultRows={rows} onRowsChange={onRowsChange} locale="en-US" />);
    cell(0, 1).focus();
    await user.keyboard('1');
    const editor = screen.getByRole('textbox');
    expect(editor).toHaveValue('1');
    await user.keyboard('200{Enter}');
    expect(onRowsChange).toHaveBeenLastCalledWith([{ ...rows[0], qty: 1200 }, rows[1]]);
    expect(cell(0, 1)).toHaveTextContent('1,200');
    expect(cell(1, 1)).toHaveFocus();
  });

  it('cancels with Escape and keeps invalid numbers in the editor with an error', async () => {
    const onRowsChange = vi.fn();
    const { user } = renderWithTheme(<EditableGrid label="Items" columns={columns} defaultRows={rows} onRowsChange={onRowsChange} />);
    cell(0, 0).focus();
    await user.keyboard('{Enter}');
    await user.keyboard('{Control>}a{/Control}Gasket{Escape}');
    expect(cell(0, 0)).toHaveTextContent('Valve');
    cell(0, 1).focus();
    await user.keyboard('x{Enter}');
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText(/Row 1, Quantity: Enter a valid number/)).toBeInTheDocument();
    expect(onRowsChange).not.toHaveBeenCalled();
  });

  it('validates edited cells and reports all errors', async () => {
    const onValidationChange = vi.fn();
    const { user } = renderWithTheme(<EditableGrid label="Items" columns={columns} defaultRows={rows} onValidationChange={onValidationChange} />);
    expect(onValidationChange).toHaveBeenLastCalledWith([]);
    cell(0, 0).focus();
    await user.keyboard('{Delete}');
    expect(cell(0, 0)).toHaveAttribute('aria-invalid', 'true');
    expect(cell(0, 0)).toHaveTextContent('Enter a value.');
    expect(onValidationChange).toHaveBeenLastCalledWith([{ rowId: 'a', rowIndex: 0, key: 'material', column: 'Material', message: 'Enter a value.' }]);
    expect(screen.getByText(/Row 1, Material: Enter a value/)).toBeInTheDocument();
  });

  it('toggles checkboxes with Space and edits selects', async () => {
    const onRowsChange = vi.fn();
    const { user } = renderWithTheme(<EditableGrid label="Items" columns={columns} defaultRows={rows} onRowsChange={onRowsChange} />);
    cell(0, 3).focus();
    await user.keyboard(' ');
    expect(onRowsChange).toHaveBeenLastCalledWith([{ ...rows[0], urgent: true }, rows[1]]);
    expect(cell(0, 3)).toHaveTextContent('Yes');
    cell(0, 2).focus();
    await user.keyboard('{Enter}');
    await user.selectOptions(screen.getByRole('combobox'), '2020');
    await user.keyboard('{Enter}');
    expect(cell(0, 2)).toHaveTextContent('Lyon');
  });

  it('pastes a block from a spreadsheet, adding rows as needed', () => {
    const onRowsChange = vi.fn();
    renderWithTheme(<EditableGrid label="Items" columns={columns} defaultRows={rows} onRowsChange={onRowsChange} createRow={createRow} locale="en-US" />);
    act(() => cell(1, 0).focus());
    fireEvent.paste(screen.getByRole('grid'), { clipboardData: { getData: () => 'Pump\t3\tLyon\tyes\nFilter\t1,000\t1010\tno\n' } });
    const next = onRowsChange.mock.calls.at(-1)![0] as Item[];
    expect(next).toHaveLength(3);
    expect(next[1]).toMatchObject({ id: 'b', material: 'Pump', qty: 3, plant: '2020', urgent: true });
    expect(next[2]).toMatchObject({ material: 'Filter', qty: 1000, plant: '1010', urgent: false });
    expect(screen.getByText('Pasted 8 cells into 2 rows')).toBeInTheDocument();
  });

  it('adds, duplicates and deletes rows with buttons and shortcuts', async () => {
    const onRowsChange = vi.fn();
    const { user } = renderWithTheme(<EditableGrid label="Items" columns={columns} defaultRows={rows} onRowsChange={onRowsChange} createRow={createRow} allowDuplicate />);
    await user.click(screen.getByRole('button', { name: 'Add row' }));
    expect((onRowsChange.mock.calls.at(-1)![0] as Item[]).length).toBe(3);
    expect(cell(2, 0)).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Duplicate row 1' }));
    const dup = onRowsChange.mock.calls.at(-1)![0] as Item[];
    expect(dup[1]).toMatchObject({ material: 'Valve', qty: 2 });
    expect(dup[1].id).not.toBe('a');
    cell(0, 0).focus();
    await user.keyboard('{Control>}{Delete}{/Control}');
    expect((onRowsChange.mock.calls.at(-1)![0] as Item[]).map((r) => r.material)).toEqual(['Valve', 'Sensor', '']);
    expect(within(screen.getByRole('grid')).getAllByRole('row')).toHaveLength(4);
  });

  it('respects read-only columns and the read-only grid', async () => {
    const onRowsChange = vi.fn();
    const ro = [{ ...columns[0], editable: false }, ...columns.slice(1)];
    const { user, rerender } = renderWithTheme(<EditableGrid label="Items" columns={ro} defaultRows={rows} onRowsChange={onRowsChange} />);
    cell(0, 0).focus();
    await user.keyboard('x{Enter}{Delete}');
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(cell(0, 0)).toHaveAttribute('aria-readonly', 'true');
    rerender(<EditableGrid label="Items" columns={columns} defaultRows={rows} onRowsChange={onRowsChange} readOnly />);
    expect(screen.queryByRole('button', { name: /Delete row/ })).toBeNull();
    expect(onRowsChange).not.toHaveBeenCalled();
  });
});
