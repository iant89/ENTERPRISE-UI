import { useState } from 'react';
import {
  AmountInput, Bar, Button, DraftIndicator, EditableGrid, FormErrorSummary, Input, MessagePopover, PeriodPicker, Stack, ValueHelpInput,
  useAutosave, useForm, validators, type EditableGridError,
} from '@enterprise-ui/react';

export const title = 'Purchase requisition';
export const description = 'Submit the empty form: the error summary takes focus and links to each field, and the message popover lists field and line-item errors. Values autosave as a draft; the supplier "Contoso" is rejected by a simulated server check.';

interface Supplier { id: string; name: string; city: string }
interface Line { id: string; material: string; qty: number | null; price: number | null }
const suppliers: Supplier[] = [
  { id: '100045', name: 'Northwind Components', city: 'Hamburg' },
  { id: '100046', name: 'Contoso Industrial', city: 'Lyon' },
  { id: '100047', name: 'Fabrikam Metals', city: 'Munich' },
];
let next = 3;

export default function Requisition() {
  const [lines, setLines] = useState<Line[]>([{ id: 'l1', material: 'Valve assembly', qty: 4, price: 120 }, { id: 'l2', material: '', qty: null, price: null }]);
  const [lineErrors, setLineErrors] = useState<EditableGridError[]>([]);
  const [saved, setSaved] = useState('');
  const form = useForm({
    initialValues: { title: '', supplier: [] as Supplier[], budget: null as number | null, period: null as string | null },
    rules: {
      title: [validators.required('Enter a title.'), validators.maxLength(60)],
      supplier: validators.required('Select a supplier.'),
      budget: [validators.required('Enter a budget.'), validators.min(1, 'The budget must be positive.')],
      period: validators.required('Select a posting period.'),
    },
    fieldLabels: { title: 'Title', supplier: 'Supplier', budget: 'Budget', period: 'Posting period' },
    required: ['title', 'supplier', 'budget', 'period'],
    onSubmit: async (values) => {
      await new Promise((r) => setTimeout(r, 300));
      if (values.supplier[0]?.name.startsWith('Contoso')) return { supplier: 'Contoso is blocked for purchasing in your company code.' };
      setSaved(`Submitted "${values.title}" with ${lines.length} items.`);
    },
  });
  const draft = useAutosave({ ...form.values, lines }, { save: () => new Promise((r) => setTimeout(r, 400)) });
  const messages = [
    ...form.errorList.map((e) => ({ id: e.name, type: 'error' as const, title: e.message, subtitle: e.label, targetId: e.id })),
    ...lineErrors.map((e) => ({ id: `${e.rowId}-${e.key}`, type: 'error' as const, title: e.message, subtitle: `Item ${e.rowIndex + 1}, ${e.column}` })),
  ];

  return (
    <form onSubmit={form.handleSubmit} noValidate>
      <Stack gap={4}>
        <FormErrorSummary errors={form.errorList} focusKey={form.submitCount} />
        <Input label="Title" {...form.field('title')} />
        <ValueHelpInput
          label="Supplier"
          title="Select supplier"
          items={suppliers}
          columns={[{ key: 'id', header: 'Supplier' }, { key: 'name', header: 'Name' }, { key: 'city', header: 'City' }]}
          getKey={(s) => s.id}
          getLabel={(s) => `${s.name} (${s.id})`}
          {...form.field('supplier')}
        />
        <Stack direction="horizontal" gap={4} wrap>
          <AmountInput label="Budget" currencies={['EUR', 'USD', 'GBP']} {...form.field('budget')} />
          <PeriodPicker label="Posting period" {...form.field('period')} onChange={(p) => form.setValue('period', p?.value ?? null)} />
        </Stack>
        <EditableGrid
          label="Items"
          rows={lines}
          onRowsChange={setLines}
          createRow={() => ({ id: `l${next++}`, material: '', qty: null, price: null })}
          columns={[
            { key: 'material', header: 'Material', required: true },
            { key: 'qty', header: 'Quantity', type: 'number', decimals: 0, required: true, validate: (v) => (typeof v === 'number' && v < 1 ? 'Order at least 1.' : undefined) },
            { key: 'price', header: 'Unit price (EUR)', type: 'number', decimals: 2 },
          ]}
          showAllErrors={form.submitCount > 0}
          onValidationChange={setLineErrors}
        />
        <Bar
          startContent={<DraftIndicator status={draft.status} lastSaved={draft.lastSaved} />}
          endContent={
            <>
              <MessagePopover messages={messages} />
              <Button type="submit" variant="primary" loading={form.isSubmitting}>
                Submit
              </Button>
            </>
          }
        />
        {saved && <p role="status">{saved}</p>}
      </Stack>
    </form>
  );
}
