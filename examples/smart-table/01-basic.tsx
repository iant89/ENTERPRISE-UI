import { Button, SmartTable } from '@enterprise-ui/react';
import { productRecords, productSchema, type ProductRecord } from '../metadata';

export const title = 'Table from metadata';
export const description = 'Headers come from labels and cells are formatted by type: currency amounts, dates, option labels and Yes/No (or the field’s own true/false labels). Numbers are end-aligned and sort numerically; enums sort in option order. Use `columnOverrides` and `extraColumns` for custom cells and actions.';

export default function SmartTableBasic() {
  return (
    <SmartTable<ProductRecord>
      schema={productSchema}
      data={productRecords.slice(0, 8)}
      fields={['name', 'category', 'price', 'stock', 'active', 'released', 'tags']}
      defaultSort={{ columnId: 'price', direction: 'descending' }}
      extraColumns={[{ id: 'actions', header: 'Actions', headerText: 'Actions', cell: (row) => <Button size="sm" variant="tertiary" aria-label={`Edit ${row.name}`}>Edit</Button> }]}
    />
  );
}
