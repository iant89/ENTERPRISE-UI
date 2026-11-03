import { useState } from 'react';
import { EditableGrid, type EditableGridError } from '@enterprise-ui/react';

export const title = 'Order items';
export const description = 'Arrow keys move, typing or Enter edits, Enter commits and moves down, Escape cancels. Copy cells from a spreadsheet and press Ctrl+V to paste a block (rows are added as needed). Ctrl+D duplicates and Ctrl+Delete deletes a row.';

interface Item { id: string; material: string; description: string; qty: number | null; uom: string; price: number | null; urgent: boolean }
let n = 4;

export default function EditableGridOrderItems() {
  const [rows, setRows] = useState<Item[]>([
    { id: '1', material: 'MAT-1001', description: 'Valve assembly', qty: 4, uom: 'PC', price: 120, urgent: false },
    { id: '2', material: 'MAT-2040', description: 'Pressure sensor', qty: 10, uom: 'PC', price: 48.5, urgent: true },
    { id: '3', material: 'MAT-3300', description: 'Hydraulic oil', qty: 0, uom: 'L', price: 6.2, urgent: false },
  ]);
  const [errors, setErrors] = useState<EditableGridError[]>([]);
  const total = rows.reduce((s, r) => s + (r.qty ?? 0) * (r.price ?? 0), 0);
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <EditableGrid
        label="Order items"
        rows={rows}
        onRowsChange={setRows}
        createRow={() => ({ id: String(n++), material: '', description: '', qty: null, uom: 'PC', price: null, urgent: false })}
        allowDuplicate
        locale="en-US"
        onValidationChange={setErrors}
        columns={[
          { key: 'material', header: 'Material', required: true, width: '8rem', validate: (v) => (typeof v === 'string' && v && !/^MAT-\d{4}$/.test(v) ? 'Use the format MAT-0000.' : undefined) },
          { key: 'description', header: 'Description', editable: (r) => !r.material.startsWith('MAT-3') },
          { key: 'qty', header: 'Quantity', type: 'number', decimals: 0, required: true, validate: (v) => (typeof v === 'number' && v < 1 ? 'Order at least 1.' : undefined) },
          { key: 'uom', header: 'Unit', type: 'select', options: [{ value: 'PC', label: 'Piece' }, { value: 'KG', label: 'Kilogram' }, { value: 'L', label: 'Liter' }] },
          { key: 'price', header: 'Unit price', type: 'number', decimals: 2 },
          { key: 'urgent', header: 'Urgent', type: 'checkbox' },
        ]}
      />
      <p style={{ margin: 0 }}>
        Total: {total.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })} · {errors.length} {errors.length === 1 ? 'problem' : 'problems'}
      </p>
    </div>
  );
}
