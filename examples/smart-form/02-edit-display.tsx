import { useState } from 'react';
import { Button, SmartForm } from '@enterprise-ui/react';
import { productRecords, productSchema, type ProductRecord } from '../metadata';

export const title = 'Display and edit an existing record';
export const description = 'The same form shows a record as formatted text in `display` mode and as controls in `edit` mode. Read-only fields (Product ID) stay text-like while editing. Remount with a new `key` to load another record.';

export default function SmartFormEditDisplay() {
  const [record, setRecord] = useState<ProductRecord>(productRecords[1]);
  const [editing, setEditing] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div>
        {!editing && <Button onClick={() => setEditing(true)}>Edit</Button>}
      </div>
      <SmartForm<ProductRecord>
        key={`${record.id}-${editing}`}
        schema={productSchema}
        aria-label="Product"
        mode={editing ? 'edit' : 'display'}
        defaultValues={record}
        fields={['id', 'name', 'category', 'price', 'stock', 'active', 'counted']}
        columns={3}
        actions={<Button variant="tertiary" onClick={() => setEditing(false)}>Cancel</Button>}
        onSubmit={(values) => {
          setRecord(values);
          setEditing(false);
        }}
      />
    </div>
  );
}
