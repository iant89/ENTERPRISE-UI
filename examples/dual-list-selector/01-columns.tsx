import { useState } from 'react';
import { DualListSelector } from '@enterprise-ui/react';

export const title = 'Choose and order table columns';
export const description = 'Check items, then move them across. With `reorderable`, chosen items can be moved up and down, which suits column choosers. Disabled options (here, a mandatory column) cannot move.';

const columns = [
  { value: 'id', label: 'Order ID', description: 'Mandatory', disabled: true },
  { value: 'customer', label: 'Customer' },
  { value: 'status', label: 'Status' },
  { value: 'amount', label: 'Net amount' },
  { value: 'currency', label: 'Currency' },
  { value: 'created', label: 'Created on' },
  { value: 'createdBy', label: 'Created by' },
  { value: 'delivery', label: 'Requested delivery' },
  { value: 'plant', label: 'Plant' },
  { value: 'salesOrg', label: 'Sales organization' },
  { value: 'incoterms', label: 'Incoterms' },
];

export default function DualListSelectorColumns() {
  const [value, setValue] = useState(['id', 'customer', 'status', 'amount']);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <DualListSelector aria-label="Visible columns" options={columns} value={value} onChange={setValue} reorderable />
      <p style={{ margin: 0 }}>Column order: {value.join(', ')}</p>
    </div>
  );
}
