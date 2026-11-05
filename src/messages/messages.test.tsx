import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, screen, waitFor, within } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../tests/utils';
import { Input } from '../components/input';
import { ToastProvider } from '../components/toast';
import { useForm, validators } from '../hooks/useForm';
import {
  ManagedMessagePopover,
  ManagedMessageStrips,
  ManagedMessageView,
  MessageManagerProvider,
  MessageToastBridge,
  MessageView,
  createMessageStore,
  messagesFromApiError,
  messagesFromResponse,
  trackOperation,
  useFieldMessage,
  useFormMessages,
  type AppMessage,
} from './index';

afterEach(() => vi.useRealTimers());

describe('MessageStore', () => {
  it('adds, replaces, filters, orders, marks read and removes messages', () => {
    const store = createMessageStore();
    const listener = vi.fn();
    store.subscribe(listener);
    store.add({ id: 'a', type: 'information', title: 'Info', timestamp: 1 });
    store.add({ id: 'b', type: 'error', title: 'Error', scope: 'component', target: 'table', timestamp: 2 });
    store.add({ id: 'c', type: 'warning', title: 'Warn', scope: 'field', target: 'qty', source: 'validation', timestamp: 3 });
    expect(store.get().map((m) => m.id)).toEqual(['b', 'c', 'a']);
    expect(store.get({ scope: ['field', 'component'] }).map((m) => m.id)).toEqual(['b', 'c']);
    expect(store.get({ type: 'warning', source: 'validation' })).toHaveLength(1);
    store.add({ id: 'a', type: 'success', title: 'Replaced' });
    expect(store.get({ type: 'success' })[0].title).toBe('Replaced');
    store.markRead({ scope: 'global' });
    expect(store.get().find((m) => m.id === 'a')!.read).toBe(true);
    store.clear({ scope: 'field' });
    store.remove('b');
    expect(store.get().map((m) => m.id)).toEqual(['a']);
    expect(listener).toHaveBeenCalledTimes(7);
  });

  it('expires messages and replaces a group atomically without churn', () => {
    vi.useFakeTimers();
    const store = createMessageStore();
    store.notify('success', 'Saved', { expiresIn: 1000 });
    expect(store.get()).toHaveLength(1);
    vi.advanceTimersByTime(1000);
    expect(store.get()).toHaveLength(0);

    store.replaceGroup('form', 'validation', [{ id: 'f:name', type: 'error', title: 'Enter a name.' }]);
    const before = store.getSnapshot();
    store.replaceGroup('form', 'validation', [{ id: 'f:name', type: 'error', title: 'Enter a name.' }]);
    expect(store.getSnapshot()).toBe(before);
    store.replaceGroup('form', 'validation', []);
    expect(store.get()).toEqual([]);
  });
});

describe('message sources', () => {
  it('parses OData errors with field targets and severities', () => {
    const messages = messagesFromApiError(
      {
        error: {
          code: 'SY/530',
          message: 'The order could not be saved.',
          details: [
            { code: 'MM/042', message: 'Quantity exceeds the stock.', target: 'Quantity', '@Common.numericSeverity': 4 },
            { code: 'MM/007', message: 'Delivery date is a holiday.', target: 'DeliveryDate', severity: 'warning' },
          ],
        },
      },
      { group: 'order', fieldTarget: (t) => (t === 'Quantity' ? 'order-qty' : undefined) },
    );
    expect(messages).toEqual([
      expect.objectContaining({ type: 'error', title: 'The order could not be saved.', code: 'SY/530', scope: 'global', source: 'api', group: 'order' }),
      expect.objectContaining({ type: 'error', scope: 'field', target: 'order-qty', subtitle: 'Quantity' }),
      expect.objectContaining({ type: 'warning', scope: 'global', subtitle: 'DeliveryDate' }),
    ]);
    expect(messagesFromApiError({ error: { message: { lang: 'en', value: 'V2 text' } } })[0].title).toBe('V2 text');
  });

  it('parses problem details, plain errors and ignores aborts', async () => {
    const problem = messagesFromApiError({ title: 'Invalid order', status: 422, detail: 'Check the fields.', 'invalid-params': [{ name: 'qty', reason: 'Must be positive.' }] }, { fieldTarget: (n) => `f-${n}` });
    expect(problem[0]).toMatchObject({ title: 'Invalid order', description: 'Check the fields.', technicalDetails: 'HTTP 422' });
    expect(problem[1]).toMatchObject({ scope: 'field', target: 'f-qty', title: 'Must be positive.' });
    expect(messagesFromApiError({ errors: { email: ['Email is taken.'] } })[1]).toMatchObject({ title: 'Email is taken.', subtitle: 'email' });
    expect(messagesFromApiError(new Error('Network down'))[0].title).toBe('Network down');
    expect(messagesFromApiError(new DOMException('aborted', 'AbortError'))).toEqual([]);
    const response = new Response('<html>oops</html>', { status: 503, statusText: 'Service Unavailable' });
    expect((await messagesFromResponse(response))[0].title).toBe('The request failed (503 Service Unavailable).');
  });

  it('tracks background operations from pending to success or failure', async () => {
    const store = createMessageStore();
    let resolve!: (v: number) => void;
    const running = trackOperation(store, new Promise<number>((r) => (resolve = r)), { id: 'export', pending: 'Exporting…', success: (n) => `Exported ${n} orders.` });
    expect(store.get()[0]).toMatchObject({ id: 'export', type: 'information', source: 'background', toast: false });
    resolve(12);
    await expect(running).resolves.toBe(12);
    expect(store.get()[0]).toMatchObject({ id: 'export', type: 'success', title: 'Exported 12 orders.', toast: true });

    await expect(trackOperation(store, () => Promise.reject(new Error('Disk full')), { id: 'export', pending: 'Exporting…', error: 'Export failed' })).rejects.toThrow('Disk full');
    expect(store.get()[0]).toMatchObject({ id: 'export', type: 'error', title: 'Export failed', description: 'Disk full' });
  });
});

function OrderForm() {
  const form = useForm({ initialValues: { qty: '' }, rules: { qty: validators.required('Enter a quantity.') }, fieldLabels: { qty: 'Quantity' } });
  useFormMessages(form, { group: 'order' });
  return (
    <form onSubmit={form.handleSubmit} aria-label="Order">
      <Input label="Quantity" {...form.field('qty')} />
      <button type="submit">Submit</button>
      <ManagedMessagePopover />
    </form>
  );
}

describe('message consumers', () => {
  it('publishes form validation to the popover, which focuses the field', async () => {
    const store = createMessageStore();
    const { user, unmount } = renderWithTheme(
      <MessageManagerProvider store={store}>
        <OrderForm />
      </MessageManagerProvider>,
    );
    expect(screen.queryByRole('button', { name: /error/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(store.get()).toEqual([expect.objectContaining({ scope: 'field', source: 'validation', group: 'order', subtitle: 'Quantity', title: 'Enter a quantity.' })]);
    await user.click(screen.getByRole('button', { name: '1 error' }));
    expect(store.get()[0].read).toBe(true);
    await user.click(screen.getByRole('button', { name: /Enter a quantity/ }));
    await waitFor(() => expect(screen.getByRole('textbox', { name: /Quantity/ })).toHaveFocus());
    await user.type(screen.getByRole('textbox', { name: /Quantity/ }), '3');
    await waitFor(() => expect(store.get()).toEqual([]));
    store.add({ type: 'error', title: 'Kept', scope: 'field', target: 'x', group: 'order', source: 'validation' });
    unmount();
    expect(store.get()).toEqual([]);
  });

  it('feeds server field messages back into controls', () => {
    const store = createMessageStore();
    store.add({ type: 'warning', title: 'Unusually large quantity.', scope: 'field', target: 'qty' });
    function Field() {
      const { error, status, statusMessage } = useFieldMessage('qty');
      return <Input id="qty" label="Quantity" error={error} status={status} statusMessage={statusMessage} />;
    }
    renderWithTheme(
      <MessageManagerProvider store={store}>
        <Field />
      </MessageManagerProvider>,
    );
    expect(screen.getByText('Unusually large quantity.')).toBeInTheDocument();
    act(() => store.add({ type: 'error', title: 'Quantity exceeds the stock.', scope: 'field', target: 'qty' }));
    expect(screen.getByRole('textbox', { name: /Quantity/ })).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows global and component strips that remove their message when dismissed', async () => {
    const store = createMessageStore();
    store.notify('error', 'The service is unavailable.', { description: 'Changes will be saved when it is back.' });
    store.add({ type: 'warning', title: 'Prices are from yesterday.', scope: 'component', target: 'prices' });
    for (let i = 0; i < 3; i++) store.notify('information', `Note ${i}`);
    const { user, container } = renderWithTheme(
      <MessageManagerProvider store={store}>
        <ManagedMessageStrips max={2} />
        <ManagedMessageStrips filter={{ scope: 'component', target: 'prices' }} data-testid="prices" />
      </MessageManagerProvider>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('The service is unavailable.Changes will be saved when it is back.');
    expect(screen.getByText('2 more messages')).toBeInTheDocument();
    expect(screen.getByTestId('prices')).toHaveTextContent('Prices are from yesterday.');
    await user.click(within(screen.getByRole('alert')).getByRole('button', { name: 'Dismiss message' }));
    expect(store.get({ type: 'error' })).toEqual([]);
    expect(await axeViolations(container)).toEqual([]);
  });

  it('lists messages in a MessageView with filters, details, navigation and removal', async () => {
    const store = createMessageStore();
    store.add({ type: 'error', title: 'Enter a supplier.', scope: 'field', target: 'supplier', subtitle: 'Supplier', source: 'validation' });
    store.add({ type: 'warning', title: 'Order is above the budget.', source: 'api', code: 'BU/1', technicalDetails: 'HTTP 409 · req 7f3a' });
    store.notify('success', 'Draft saved.');
    const { user, container } = renderWithTheme(
      <MessageManagerProvider store={store}>
        <input id="supplier" aria-label="Supplier" />
        <ManagedMessageView markAsRead={false} />
      </MessageManagerProvider>,
    );
    const view = screen.getByRole('region', { name: 'Messages' });
    const items = () => within(view).getAllByRole('listitem');
    expect(items().map((li) => li.textContent?.split('Validation')[0].split('Server')[0].split('Application')[0])).toEqual(['Errors: Enter a supplier.Supplier', 'Warnings: Order is above the budget.', 'Success: Draft saved.']);
    expect(within(view).getByText('Technical details')).toBeInTheDocument();
    await user.click(within(view).getByRole('button', { name: 'Warnings (1)' }));
    expect(items()).toHaveLength(1);
    await user.click(within(view).getByRole('button', { name: 'All (3)' }));
    await user.click(within(view).getByRole('button', { name: 'Errors: Enter a supplier.' }));
    expect(screen.getByRole('textbox', { name: 'Supplier' })).toHaveFocus();
    await user.click(within(view).getByRole('button', { name: 'Remove message: Draft saved.' }));
    expect(store.get()).toHaveLength(2);
    expect(await axeViolations(container)).toEqual([]);
    await user.click(within(view).getByRole('button', { name: 'Clear all' }));
    expect(within(view).getByText('No messages')).toBeInTheDocument();
  });

  it('renders a standalone MessageView with localized labels', () => {
    const messages: AppMessage[] = [{ id: '1', type: 'information', title: 'Hallo', scope: 'global', source: 'event', timestamp: 0, read: true }];
    renderWithTheme(<MessageView messages={messages} showDetails={false} labels={{ title: 'Meldungen', types: { error: 'Fehler', warning: 'Warnungen', information: 'Info', success: 'Erfolg' } }} />);
    expect(screen.getByRole('region', { name: 'Meldungen' })).toHaveTextContent('Info: Hallo');
  });

  it('bridges new event and background messages to toasts', async () => {
    const store = createMessageStore();
    store.notify('information', 'Existing message');
    renderWithTheme(
      <MessageManagerProvider store={store}>
        <ToastProvider>
          <MessageToastBridge />
        </ToastProvider>
      </MessageManagerProvider>,
    );
    expect(screen.queryByText('Existing message')).not.toBeInTheDocument();
    act(() => void store.add({ type: 'error', title: 'Field error', scope: 'field', target: 'x' }));
    expect(screen.queryByText('Field error')).not.toBeInTheDocument();
    let finish!: () => void;
    let running!: Promise<void>;
    act(() => void (running = trackOperation(store, new Promise<void>((r) => (finish = r)), { id: 'sync', pending: 'Syncing…', success: 'Synced.' })));
    expect(screen.queryByText('Syncing…')).not.toBeInTheDocument();
    await act(async () => {
      finish();
      await running;
    });
    expect(screen.getByText('Synced.')).toBeInTheDocument();
    act(() => store.remove('sync'));
    expect(screen.queryByText('Synced.')).not.toBeInTheDocument();
  });
});
