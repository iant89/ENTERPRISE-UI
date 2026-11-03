import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { ImportWizard, autoMapColumns, type ImportField } from './ImportWizard';
import { detectDelimiter, parseDelimited } from './csv';

const fields: ImportField[] = [
  { key: 'name', label: 'Name', required: true, aliases: ['Product name'] },
  { key: 'sku', label: 'SKU', required: true },
  {
    key: 'price', label: 'Price',
    parse: (v) => { const n = Number(v); if (Number.isNaN(n)) throw new Error('Enter a number.'); return n; },
    validate: (v) => ((v as number) < 0 ? 'Price cannot be negative.' : undefined),
  },
];

const csv = (text: string, name = 'products.csv') => new File([text], name, { type: 'text/csv' });
const next = () => screen.getByRole('button', { name: 'Next' });

describe('parseDelimited', () => {
  it('parses quotes, escaped quotes, embedded line breaks, CRLF and a BOM', () => {
    expect(parseDelimited('﻿a,b\r\n"x, y","say ""hi"""\r\n"multi\nline",z\r\n\r\n')).toEqual([
      ['a', 'b'],
      ['x, y', 'say "hi"'],
      ['multi\nline', 'z'],
    ]);
  });

  it('detects semicolon and tab delimiters and pads short rows', () => {
    expect(detectDelimiter('a;b;c\n1;2;3')).toBe(';');
    expect(detectDelimiter('a\tb\n1\t2')).toBe('\t');
    expect(parseDelimited('a;b;c\n1')).toEqual([['a', 'b', 'c'], ['1', '', '']]);
  });
});

describe('autoMapColumns', () => {
  it('matches key, label and aliases ignoring case and punctuation, using each column once', () => {
    expect(autoMapColumns(fields, ['PRODUCT_NAME', 'sku', 'Sku', 'Notes'])).toEqual({ name: 0, sku: 1, price: null });
  });
});

describe('ImportWizard', () => {
  it('walks through upload, mapping, review and import, skipping invalid rows', async () => {
    const onImport = vi.fn().mockResolvedValue({ failed: [{ row: 2, field: 'sku', message: 'Already exists.' }] });
    const onDone = vi.fn();
    const { user, container } = renderWithTheme(
      <ImportWizard entityName="products" fields={fields} onImport={onImport} onDone={onDone} />,
    );
    expect(await axeViolations(container)).toEqual([]);

    await user.click(next());
    expect(screen.getByRole('alert')).toHaveTextContent('Choose a file to import.');

    await user.upload(screen.getByLabelText('Choose file'), csv('Product name;SKU;Price;Notes\nValve;V-1;10\n;V-2;5\nGauge;V-3;-1\n'));
    expect(await screen.findByText(/products\.csv/)).toHaveTextContent('3 data rows');
    await user.click(next());

    expect(screen.getByRole('heading', { name: 'Map columns' })).toHaveFocus();
    expect(screen.getByRole('combobox', { name: 'Column for Name' })).toHaveTextContent('Product name');
    expect(screen.getByText('Not imported: Notes.')).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
    await user.click(next());

    expect(screen.getByText('1 of 3 rows ready to import.')).toBeInTheDocument();
    const table = screen.getByRole('table', { name: 'Rows to import' });
    expect(within(table).getByText('Name is required.')).toBeInTheDocument();
    expect(within(table).getByText('Price cannot be negative.')).toBeInTheDocument();
    // Only rows with errors are shown at first.
    expect(within(table).queryByText('Valve')).not.toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);

    await user.click(next());
    expect(screen.getByRole('alert')).toHaveTextContent('2 rows have errors.');
    await user.click(screen.getByLabelText('Skip 2 rows with errors and import the rest'));
    await user.click(next());

    await user.click(screen.getByRole('button', { name: 'Import 1 product' }));
    expect(onImport).toHaveBeenCalledWith([{ row: 2, values: { name: 'Valve', sku: 'V-1', price: 10 } }]);

    expect(await screen.findByRole('heading', { name: 'Import finished' })).toHaveFocus();
    expect(screen.getByText('Imported 1 product.')).toBeInTheDocument();
    expect(screen.getByText(/1 row was rejected\. 2 rows with errors were skipped\./)).toBeInTheDocument();
    expect(within(screen.getByRole('table', { name: 'Rejected rows' })).getByText('Already exists.')).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(onDone).toHaveBeenCalledWith({ imported: 1, failed: [{ row: 2, field: 'sku', message: 'Already exists.' }] });

    await user.click(screen.getByRole('button', { name: 'Import another file' }));
    expect(screen.getByRole('heading', { name: 'Upload file' })).toBeInTheDocument();
  });

  it('requires every required field to be mapped and each column to be used once', async () => {
    const { user } = renderWithTheme(<ImportWizard fields={fields} onImport={vi.fn()} defaultFile={csv('Title,Code\nA,B\n')} />);
    expect(await screen.findByText(/1 data row/)).toBeInTheDocument();
    await user.click(next());
    await user.click(next());
    expect(screen.getByRole('alert')).toHaveTextContent('Map a column to Name, SKU.');

    await user.click(screen.getByRole('combobox', { name: 'Column for Name' }));
    await user.click(screen.getByRole('option', { name: 'Title' }));
    await user.click(screen.getByRole('combobox', { name: 'Column for SKU' }));
    await user.click(screen.getByRole('option', { name: 'Title' }));
    await user.click(next());
    expect(screen.getByRole('alert')).toHaveTextContent('The column Title is mapped to more than one field.');
  });

  it('treats the first row as data when the heading option is cleared', async () => {
    const { user } = renderWithTheme(<ImportWizard fields={fields} onImport={vi.fn()} defaultFile={csv('Valve,V-1\nGauge,V-2\n')} />);
    expect(await screen.findByText(/1 data row/)).toBeInTheDocument();
    await user.click(screen.getByLabelText('First row contains column names'));
    expect(screen.getByText(/2 data rows/)).toBeInTheDocument();
    await user.click(next());
    expect(screen.getByRole('combobox', { name: 'Column for Name' })).toHaveTextContent('Do not import');
  });

  it('rejects unsupported, oversized and over-long files', async () => {
    const { user, rerender } = renderWithTheme(<ImportWizard fields={fields} onImport={vi.fn()} maxFileSize={20} />);
    // The picker filters by `accept`; a dropped file is checked by the wizard.
    const drop = screen.getByText('Drop a file here, or').parentElement!;
    fireEvent.drop(drop, { dataTransfer: { files: [csv('a', 'photo.png')] } });
    expect(await screen.findByText(/photo\.png is not a supported file type/)).toBeInTheDocument();
    await user.upload(screen.getByLabelText('Choose file'), csv('name,sku\n' + 'x,y\n'.repeat(10)));
    expect(screen.getByText('products.csv is larger than 20 bytes.')).toBeInTheDocument();

    rerender(<ImportWizard fields={fields} onImport={vi.fn()} maxRows={1} />);
    await user.upload(screen.getByLabelText('Choose file'), csv('name,sku\nA,1\nB,2\n'));
    expect(await screen.findByText('products.csv has more than 1 row. Split it into smaller files.')).toBeInTheDocument();
  });

  it('keeps the user on the last step when onImport throws', async () => {
    const onImport = vi.fn().mockRejectedValue(new Error('Server unavailable.'));
    const { user } = renderWithTheme(<ImportWizard fields={fields} onImport={onImport} defaultFile={csv('name,sku\nA,1\n')} />);
    expect(await screen.findByText(/1 data row/)).toBeInTheDocument();
    await user.click(next());
    await user.click(next());
    await user.click(next());
    await user.click(screen.getByRole('button', { name: 'Import 1 record' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Server unavailable.');
    expect(screen.getByRole('heading', { name: 'Import' })).toBeInTheDocument();
  });
});
