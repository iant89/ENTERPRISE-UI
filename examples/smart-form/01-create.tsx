import { useState } from 'react';
import { SmartForm } from '@enterprise-ui/react';
import { productSchema, type ProductRecord } from '../metadata';

export const title = 'Create form with sections';
export const description = 'Fields, labels, required markers, defaults and validation come from the schema. Save validates every field and focuses the error summary; values returned from `onSubmit` become field errors (try the name “ProBook 14”).';

export default function SmartFormCreate() {
  const [saved, setSaved] = useState<ProductRecord | null>(null);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <SmartForm<ProductRecord>
        schema={productSchema}
        aria-label="New product"
        groups={[
          { title: 'General', fields: ['name', 'category', 'supplier', 'tags'] },
          { title: 'Sales', fields: ['price', 'stock', 'active', 'released'] },
        ]}
        onSubmit={async (values) => {
          await new Promise((resolve) => setTimeout(resolve, 400));
          if (values.name === 'ProBook 14') return { name: 'A product with this name already exists.' };
          setSaved(values);
        }}
      />
      {saved && <p role="status">Saved {saved.name}.</p>}
    </div>
  );
}
