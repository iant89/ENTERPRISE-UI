import { useState } from 'react';
import { SmartField, Switch, type FieldDefinition } from '@enterprise-ui/react';

export const title = 'Every data type';
export const description = 'The field renderer maps each data type to a control: string → Input, number → NumberInput, boolean → Switch or Checkbox, date → DatePicker, datetime → DateTimePicker, enum → Select, multi → MultiInput and currency → AmountInput. Display mode shows the formatted value instead.';

const fields: FieldDefinition[] = [
  { name: 'name', type: 'string', label: 'Name', required: true, defaultValue: 'Dock Station D5' },
  { name: 'stock', type: 'number', label: 'Stock', defaultValue: 31, format: { unit: 'pcs' }, validation: [{ type: 'min', value: 0 }] },
  { name: 'active', type: 'boolean', label: 'Sellable', defaultValue: true },
  { name: 'terms', type: 'boolean', label: 'Accept the supplier terms', booleanControl: 'checkbox', required: true },
  { name: 'released', type: 'date', label: 'Released', defaultValue: '2026-03-15' },
  { name: 'counted', type: 'datetime', label: 'Last stock count', defaultValue: '2026-10-28T09:30' },
  { name: 'category', type: 'enum', label: 'Category', defaultValue: 'acc', options: [{ value: 'acc', label: 'Accessories' }, { value: 'net', label: 'Networking' }] },
  { name: 'tags', type: 'multi', label: 'Tags', defaultValue: ['b2b'], description: 'Press Enter after each tag.' },
  { name: 'price', type: 'currency', label: 'Price', currency: 'EUR', defaultValue: 229 },
];

export default function SmartFieldTypes() {
  const [display, setDisplay] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 420 }}>
      <Switch label="Display mode" checked={display} onChange={setDisplay} />
      {fields.map((field) => (
        <SmartField key={field.name} field={field} mode={display ? 'display' : 'edit'} />
      ))}
    </div>
  );
}
