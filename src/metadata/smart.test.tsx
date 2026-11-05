import { describe, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import { screen, within } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../tests/utils';
import {
  MetadataProvider,
  SmartChart,
  SmartField,
  SmartFilterBar,
  SmartForm,
  SmartTable,
  defineSchema,
  filterRecords,
  resolveFields,
  type FieldControlRenderer,
  type FilterValues,
  type InferRecord,
} from './index';

const schema = defineSchema({
  label: 'Products',
  key: 'id',
  titleField: 'name',
  fields: [
    { name: 'id', type: 'string', label: 'ID', hidden: true },
    { name: 'name', type: 'string', label: 'Name', required: true },
    { name: 'stock', type: 'number', label: 'Stock', validation: [{ type: 'min', value: 0 }] },
    { name: 'price', type: 'currency', label: 'Price', currency: 'EUR' },
    { name: 'active', type: 'boolean', label: 'Active', defaultValue: true },
    { name: 'released', type: 'date', label: 'Released' },
    { name: 'updated', type: 'datetime', label: 'Updated', readOnly: true, filterable: false },
    { name: 'category', type: 'enum', label: 'Category', options: [{ value: 'hw', label: 'Hardware' }, { value: 'sw', label: 'Software' }] },
    { name: 'tags', type: 'multi', label: 'Tags', filterable: false },
  ],
});
type Product = InferRecord<typeof schema>;

const products: Product[] = [
  { id: 'p1', name: 'Laptop', stock: 4, price: 1200, active: true, released: '2026-03-01', updated: '2026-03-02T09:30', category: 'hw', tags: ['portable'] },
  { id: 'p2', name: 'Editor', stock: 0, price: 49.9, active: false, released: '2025-11-12', updated: null, category: 'sw', tags: [] },
  { id: 'p3', name: 'Dock', stock: 12, price: 199, active: true, released: '2026-01-20', updated: null, category: 'hw', tags: [] },
];
const field = (name: string) => schema.fields.find((f) => f.name === name)!;

describe('FieldRenderer via SmartField', () => {
  it('renders the control that matches each data type', () => {
    renderWithTheme(
      <>
        {resolveFields(schema).map((f) => (
          <SmartField key={f.name} field={f} />
        ))}
      </>,
    );
    expect(screen.getByRole('textbox', { name: /Name/ })).toBeRequired();
    expect(screen.getByRole('spinbutton', { name: 'Stock' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Price' })).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Active' })).toBeChecked();
    expect(screen.getByRole('textbox', { name: 'Released' })).toBeInTheDocument();
    expect(screen.getByLabelText('Updated')).toHaveAttribute('readonly');
    expect(screen.getByRole('combobox', { name: /^Category/ })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Tags' })).toBeInTheDocument();
  });

  it('validates its own rules after blur and shows formatted values in display mode', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<SmartField field={field('name')} onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: /Name/ });
    await user.click(input);
    await user.tab();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Enter Name.')).toBeInTheDocument();
    await user.type(input, 'X');
    expect(onChange).toHaveBeenLastCalledWith('X');
    expect(screen.queryByText('Enter Name.')).not.toBeInTheDocument();
  });

  it('formats display mode values from the metadata', () => {
    renderWithTheme(
      <MetadataProvider locale="en-US">
        <SmartField field={field('price')} mode="display" value={1200} />
        <SmartField field={field('active')} mode="display" value={false} />
        <SmartField field={field('category')} mode="display" value="sw" />
      </MetadataProvider>,
    );
    expect(screen.getByText('€1,200.00')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('Software')).toBeInTheDocument();
  });

  it('forwards refs and accepts custom renderers from the provider', () => {
    const ref = createRef<HTMLDivElement>();
    const custom: FieldControlRenderer = ({ field: f, value }) => <output aria-label={f.label}>custom {String(value)}</output>;
    renderWithTheme(
      <MetadataProvider renderers={{ enum: custom }}>
        <SmartField ref={ref} className="x" field={field('category')} value="hw" />
      </MetadataProvider>,
    );
    expect(ref.current).toHaveClass('x');
    expect(screen.getByText('custom hw')).toBeInTheDocument();
  });
});

describe('SmartForm', () => {
  it('generates fields, blocks invalid submits with an error summary and submits valid values', async () => {
    const onSubmit = vi.fn();
    const { user, container } = renderWithTheme(<SmartForm schema={schema} aria-label="Product" defaultValues={{ stock: -1 }} onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).not.toHaveBeenCalled();
    const summary = screen.getByRole('alert');
    expect(within(summary).getByRole('link', { name: /Enter Name/ })).toBeInTheDocument();
    expect(within(summary).getByRole('link', { name: /Stock must be 0 or more/ })).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: /Name/ }), 'Mouse');
    const stock = screen.getByRole('spinbutton', { name: 'Stock' });
    await user.clear(stock);
    await user.type(stock, '3');
    await user.tab();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Mouse', stock: 3, active: true, tags: [] }));
    expect(await axeViolations(container)).toEqual([]);
  });

  it('shows server errors returned from onSubmit and resets to the defaults', async () => {
    const { user } = renderWithTheme(<SmartForm schema={schema} aria-label="Product" fields={['name']} defaultValues={{ name: 'Taken' }} onSubmit={() => ({ name: 'This name is taken.' })} />);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findAllByText('This name is taken.')).not.toHaveLength(0);
    const reset = screen.getByRole('button', { name: 'Reset' });
    expect(reset).toBeDisabled();
    await user.type(screen.getByRole('textbox', { name: /Name/ }), '!');
    await user.click(reset);
    expect(screen.getByRole('textbox', { name: /Name/ })).toHaveValue('Taken');
  });

  it('renders groups and a read-only display mode without actions', () => {
    renderWithTheme(
      <SmartForm
        schema={schema}
        aria-label="Product"
        mode="display"
        defaultValues={products[0]}
        groups={[{ title: 'General', fields: ['name', 'category'] }, { title: 'Stock', fields: ['stock', 'price'] }]}
      />,
    );
    expect(screen.getByRole('group', { name: 'General' })).toHaveTextContent('Hardware');
    expect(screen.getByRole('group', { name: 'Stock' })).toHaveTextContent('4');
    expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
  });

  it('reports value changes and localizes button texts', async () => {
    const onValuesChange = vi.fn();
    const { user } = renderWithTheme(
      <MetadataProvider messages={{ submit: 'Speichern', reset: 'Zurücksetzen' }}>
        <SmartForm schema={schema} aria-label="Product" fields={['name', 'active']} onValuesChange={onValuesChange} />
      </MetadataProvider>,
    );
    await user.click(screen.getByRole('switch', { name: 'Active' }));
    expect(onValuesChange).toHaveBeenLastCalledWith(expect.objectContaining({ active: false }));
    expect(screen.getByRole('button', { name: 'Speichern' })).toBeInTheDocument();
  });
});

describe('SmartFilterBar', () => {
  it('builds filters per type, counts them and applies them with Go', async () => {
    const onGo = vi.fn();
    const { user, container } = renderWithTheme(<SmartFilterBar schema={schema} onGo={onGo} />);
    expect(screen.getByRole('searchbox', { name: 'Search Products' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Updated')).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Price' })).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'lap');
    await user.type(screen.getByRole('spinbutton', { name: 'Stock From' }), '1');
    await user.tab();
    expect(screen.getByRole('button', { name: /Hide filters \(2\)/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Go' }));
    const [filters, search] = onGo.mock.lastCall as [FilterValues, string];
    expect(filters).toEqual({ name: 'lap', stock: { from: 1, to: null } });
    expect(search).toBe('');
    expect(filterRecords(schema, products, filters).map((p) => p.id)).toEqual(['p1']);

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('reports every change in live mode', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<SmartFilterBar schema={schema} fields={['active']} liveMode onChange={onChange} searchable={false} />);
    expect(screen.queryByRole('button', { name: 'Go' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: /^Active/ }));
    await user.click(screen.getByRole('option', { name: 'No' }));
    expect(onChange).toHaveBeenLastCalledWith({ active: false });
  });
});

describe('SmartTable', () => {
  it('derives headers, formatted cells, row headers and type-aware sorting', async () => {
    const { user, container } = renderWithTheme(
      <MetadataProvider locale="en-US">
        <SmartTable schema={schema} data={products} fields={['name', 'price', 'active', 'released', 'category']} />
      </MetadataProvider>,
    );
    const table = screen.getByRole('table', { name: 'Products' });
    expect(within(table).getByRole('rowheader', { name: 'Laptop' })).toBeInTheDocument();
    expect(within(table).getByText('€1,200.00')).toBeInTheDocument();
    expect(within(table).getByText('Mar 1, 2026')).toBeInTheDocument();
    expect(within(table).getAllByText('Hardware')).toHaveLength(2);

    await user.click(within(table).getByRole('button', { name: /Price/ }));
    const names = () => within(table).getAllByRole('rowheader').map((c) => c.textContent);
    expect(names()).toEqual(['Editor', 'Dock', 'Laptop']);
    expect(await axeViolations(container)).toEqual([]);
  });

  it('applies column overrides and extra columns', () => {
    renderWithTheme(
      <SmartTable
        schema={schema}
        data={products}
        fields={['name']}
        columnOverrides={{ name: { cell: (p) => p.name.toUpperCase() } }}
        extraColumns={[{ id: 'actions', header: 'Actions', cell: (p) => <button type="button">Edit {p.name}</button> }]}
      />,
    );
    expect(screen.getByText('LAPTOP')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Dock' })).toBeInTheDocument();
  });
});

describe('SmartChart', () => {
  it('aggregates records into a labelled chart with a data table', async () => {
    const { container } = renderWithTheme(
      <MetadataProvider locale="en-US">
        <SmartChart schema={schema} data={products} dimension="category" measures={['price']} />
      </MetadataProvider>,
    );
    const chart = screen.getByRole('group', { name: 'Price by Category' });
    expect(chart).toBeInTheDocument();
    const table = within(container).getByRole('table', { hidden: true });
    expect(table).toHaveTextContent('Hardware');
    expect(table).toHaveTextContent('€1,399.00');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('draws donut and line variants and counts records', () => {
    renderWithTheme(
      <>
        <SmartChart schema={schema} data={products} dimension="active" aggregation="count" chartType="donut" />
        <SmartChart schema={schema} data={products} dimension="released" measures={['stock']} chartType="line" dateGranularity="year" label="Stock by year" />
      </>,
    );
    expect(screen.getByRole('group', { name: 'Count by Active' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Stock by year' })).toBeInTheDocument();
  });
});
