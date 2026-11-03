import { useMemo, useState } from 'react';
import { Button, ImportWizard, MessageStrip, type ImportField, type ImportRecord } from '@enterprise-ui/react';

export const title = 'Product import';
export const description = 'Starts with a sample file (via `defaultFile`) that has a few deliberate problems: a missing name, a negative price and an unknown category. Columns are mapped automatically from their headings and `aliases`. The host rejects one SKU that already exists, which shows on the results screen.';

const sample = `Product name;Item number;Unit price;Category;Stock
Industrial valve;V-1042;129.90;Hydraulics;40
Pressure gauge;G-2210;48.50;Instruments;125
;F-0007;12.00;Filters;300
Flow meter;M-3301;-5;Instruments;12
Pipe clamp;C-0450;3.20;Fittings;2000
Hose coupling;H-1200;9.75;Plumbing;640
Check valve;V-1043;87.00;Hydraulics;55
`;

const categories = ['Hydraulics', 'Instruments', 'Filters', 'Fittings'];

const fields: ImportField[] = [
  { key: 'name', label: 'Name', required: true, aliases: ['Product name'] },
  { key: 'sku', label: 'SKU', required: true, aliases: ['Item number', 'Item no'], validate: (v) => (/^[A-Z]-\d{4}$/.test(String(v)) ? undefined : 'Use the format A-1234.') },
  {
    key: 'price', label: 'Price', required: true, aliases: ['Unit price'], description: 'In USD, for example 12.50',
    parse: (v) => {
      const n = Number(v.replace(',', '.'));
      if (Number.isNaN(n)) throw new Error('Enter a number.');
      return n;
    },
    validate: (v) => ((v as number) < 0 ? 'Price cannot be negative.' : undefined),
  },
  { key: 'category', label: 'Category', description: categories.join(', '), validate: (v) => (categories.includes(String(v)) ? undefined : `Unknown category. Use ${categories.join(', ')}.`) },
  { key: 'stock', label: 'Stock', parse: (v) => { const n = Number(v); if (!Number.isInteger(n)) throw new Error('Enter a whole number.'); return n; } },
];

export default function ProductImport() {
  const file = useMemo(() => new File([sample], 'products.csv', { type: 'text/csv' }), []);
  const [done, setDone] = useState<number | null>(null);
  if (done != null) {
    return (
      <MessageStrip tone="success" title={`${done} products added to the catalog.`} actions={<Button onClick={() => setDone(null)}>Start over</Button>}>
        In an application, the wizard would close and the product list would refresh.
      </MessageStrip>
    );
  }
  return (
    <ImportWizard
      entityName="products"
      fields={fields}
      defaultFile={file}
      maxRows={10_000}
      onImport={async (records: ImportRecord[]) => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        // Mock server: V-1043 already exists.
        const duplicate = records.filter((r) => r.values.sku === 'V-1043');
        return {
          imported: records.length - duplicate.length,
          failed: duplicate.map((r) => ({ row: r.row, field: 'sku', message: 'A product with this SKU already exists.' })),
        };
      }}
      onDone={(result) => setDone(result.imported)}
    />
  );
}
