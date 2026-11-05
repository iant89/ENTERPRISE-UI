import { useState } from 'react';
import {
  Button,
  Input,
  ManagedMessagePopover,
  ManagedMessageStrips,
  ManagedMessageView,
  MessageManagerProvider,
  MessageToastBridge,
  ToastProvider,
  createMessageStore,
  messagesFromApiError,
  trackOperation,
  useFieldMessage,
  useForm,
  useFormMessages,
  useMessageStore,
  validators,
} from '@enterprise-ui/react';

export const title = 'Every source, every consumer';
export const description = 'Validation errors (`useFormMessages`), a parsed OData error (`messagesFromApiError`), an application event (`store.notify`) and a background export (`trackOperation`) all go into one store. Strips show global messages, the footer popover lists what needs fixing, toasts report events and the MessageView keeps the history.';

function OrderForm() {
  const store = useMessageStore();
  const form = useForm({
    initialValues: { supplier: '', quantity: '' },
    rules: { supplier: validators.required('Enter a supplier.'), quantity: validators.required('Enter a quantity.') },
    fieldLabels: { supplier: 'Supplier', quantity: 'Quantity' },
    required: ['supplier', 'quantity'],
  });
  useFormMessages(form, { group: 'order' });
  // Server-side field messages land on the control as its value state.
  const serverQuantity = useFieldMessage('order-quantity');
  const fieldTarget = (target: string) => ({ Quantity: 'order-quantity', Supplier: 'order-supplier' })[target];

  const failSave = () => {
    store.clear({ group: 'order-save' });
    store.addAll(
      messagesFromApiError(
        { error: { code: 'SY/530', message: 'The order could not be saved.', details: [{ code: 'MM/042', message: 'Quantity exceeds the available stock (40).', target: 'Quantity', severity: 'error' }] } },
        { group: 'order-save', fieldTarget },
      ),
    );
  };

  return (
    <form onSubmit={form.handleSubmit} noValidate aria-label="Purchase order" style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(12rem, 1fr))' }}>
        <Input label="Supplier" {...form.field('supplier')} id="order-supplier" />
        <Input
          label="Quantity"
          {...form.field('quantity')}
          id="order-quantity"
          error={form.field('quantity').error ?? serverQuantity.error}
          status={serverQuantity.status}
          statusMessage={serverQuantity.statusMessage}
        />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <ManagedMessagePopover />
        <span style={{ flex: 1 }} />
        <Button type="submit" variant="primary">Validate</Button>
        <Button onClick={failSave}>Save (server error)</Button>
        <Button onClick={() => store.notify('warning', 'Prices were updated by another user.', { description: 'Reload to see the latest prices.' })}>Raise event</Button>
        <Button
          onClick={() =>
            void trackOperation(store, () => new Promise<number>((resolve) => setTimeout(() => resolve(240), 1200)), { id: 'export', pending: 'Exporting orders…', success: (n) => `Exported ${n} orders.`, successExpiresIn: 8000 })
          }
        >
          Run export
        </Button>
      </div>
    </form>
  );
}

export default function MessageManagerSources() {
  const [store] = useState(createMessageStore);
  return (
    <MessageManagerProvider store={store}>
      <ToastProvider>
        <MessageToastBridge />
        <div style={{ display: 'grid', gap: 16 }}>
          <ManagedMessageStrips filter={{ scope: 'global', type: ['error', 'warning'] }} announce={false} />
          <OrderForm />
          <ManagedMessageView aria-label="Message history" />
        </div>
      </ToastProvider>
    </MessageManagerProvider>
  );
}
