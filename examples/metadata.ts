import { defineSchema, type InferRecord } from '@enterprise-ui/react';
import { categoryOptions, products, supplierOptions } from './data';

/** Shared metadata for the Smart component examples: one schema drives forms, filters, tables and charts. */
export const productSchema = defineSchema({
  name: 'Product',
  label: 'Products',
  key: 'id',
  titleField: 'name',
  fields: [
    { name: 'id', type: 'string', label: 'Product ID', readOnly: true, filterable: false },
    { name: 'name', type: 'string', label: 'Product name', required: true, validation: [{ type: 'maxLength', value: 40 }] },
    { name: 'category', type: 'enum', label: 'Category', required: true, options: categoryOptions },
    { name: 'supplier', type: 'enum', label: 'Supplier', options: supplierOptions },
    { name: 'price', type: 'currency', label: 'Price', required: true, currency: 'EUR', currencies: ['EUR', 'USD', 'GBP'], validation: [{ type: 'min', value: 0 }] },
    { name: 'stock', type: 'number', label: 'Stock', format: { unit: 'pcs' }, validation: [{ type: 'min', value: 0, message: 'Stock cannot be negative.' }] },
    { name: 'active', type: 'boolean', label: 'Sellable', defaultValue: true, format: { trueLabel: 'Sellable', falseLabel: 'Discontinued' } },
    { name: 'released', type: 'date', label: 'Released', validation: [{ type: 'min', value: '2020-01-01' }] },
    { name: 'counted', type: 'datetime', label: 'Last stock count', filterable: false, sortable: false },
    { name: 'tags', type: 'multi', label: 'Tags', options: [{ value: 'bestseller', label: 'bestseller' }, { value: 'b2b', label: 'b2b' }, { value: 'eco', label: 'eco' }], filterable: false, validation: [{ type: 'maxLength', value: 3 }] },
  ],
});

export type ProductRecord = InferRecord<typeof productSchema>;

const tagSets = [['bestseller'], [], ['b2b'], ['b2b', 'eco'], [], ['eco']];

export const productRecords: ProductRecord[] = products.map((p, i) => ({
  id: p.id,
  name: p.name,
  category: p.category,
  supplier: p.supplier,
  price: p.price,
  stock: p.stock,
  active: p.status !== 'Discontinued',
  released: `${2021 + (i % 5)}-${String((i % 12) + 1).padStart(2, '0')}-15`,
  counted: i % 4 === 0 ? null : `${p.updated}T${String(8 + (i % 9)).padStart(2, '0')}:30`,
  tags: tagSets[i % tagSets.length],
}));
