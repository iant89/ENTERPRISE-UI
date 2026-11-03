import { describe, expect, it, vi } from 'vitest';
import { act, renderHook, screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../tests/utils';
import { Input } from '../components/input';
import { NumberInput } from '../components/number-input';
import { Checkbox } from '../components/checkbox';
import { Button } from '../components/button';
import { FormErrorSummary } from '../components/form-error-summary';
import { useForm, validators } from './useForm';

function OrderForm({ onSubmit }: { onSubmit: (v: { supplier: string; quantity: number | null; email: string; urgent: boolean }) => unknown }) {
  const form = useForm({
    initialValues: { supplier: '', quantity: null as number | null, email: '', urgent: false },
    rules: {
      supplier: validators.required('Enter a supplier.'),
      quantity: [validators.required('Enter a quantity.'), validators.min(1, 'Order at least 1.')],
      email: validators.email(),
    },
    fieldLabels: { supplier: 'Supplier', quantity: 'Quantity', email: 'Email' },
    required: ['supplier', 'quantity'],
    onSubmit: onSubmit as never,
  });
  return (
    <form onSubmit={form.handleSubmit} noValidate>
      <FormErrorSummary errors={form.errorList} focusKey={form.submitCount} />
      <Input label="Supplier" {...form.field('supplier')} />
      <NumberInput label="Quantity" {...form.field('quantity')} />
      <Input label="Email" {...form.field('email')} />
      <Checkbox label="Urgent" checked={form.values.urgent} onChange={form.field('urgent').onChange} />
      <output>{form.dirty ? `dirty:${form.dirtyFields.join(',')}` : 'clean'}</output>
      <Button type="submit">Save</Button>
    </form>
  );
}

describe('useForm', () => {
  it('validates on submit, shows a focused error summary with links, and blocks onSubmit', async () => {
    const onSubmit = vi.fn();
    const { user, container } = renderWithTheme(<OrderForm onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    const summary = screen.getByRole('alert');
    expect(summary).toHaveFocus();
    expect(summary).toHaveTextContent('There are 2 problems');
    expect(screen.getByRole('link', { name: 'Supplier: Enter a supplier.' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Supplier' })).toHaveAttribute('aria-invalid', 'true');
    expect(onSubmit).not.toHaveBeenCalled();
    await user.click(screen.getByRole('link', { name: 'Quantity: Enter a quantity.' }));
    expect(screen.getByRole('spinbutton', { name: 'Quantity' })).toHaveFocus();
    expect(await axeViolations(container)).toEqual([]);
  });

  it('validates a field on blur, then on each change until it is fixed', async () => {
    const { user } = renderWithTheme(<OrderForm onSubmit={vi.fn()} />);
    const email = screen.getByRole('textbox', { name: 'Email' });
    await user.type(email, 'nope');
    expect(email).not.toHaveAttribute('aria-invalid');
    await user.tab();
    expect(email).toHaveAttribute('aria-invalid', 'true');
    await user.type(email, '@example.com');
    expect(email).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('accepts value callbacks and events, tracks dirty fields and submits valid values', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithTheme(<OrderForm onSubmit={onSubmit} />);
    await user.type(screen.getByRole('textbox', { name: 'Supplier' }), 'Northwind');
    await user.type(screen.getByRole('spinbutton', { name: 'Quantity' }), '5');
    await user.tab();
    await user.click(screen.getByRole('checkbox', { name: 'Urgent' }));
    expect(screen.getByText(/^dirty:/)).toHaveTextContent('dirty:supplier,quantity,urgent');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalledWith({ supplier: 'Northwind', quantity: 5, email: '', urgent: true });
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows server errors returned from onSubmit', async () => {
    const { user } = renderWithTheme(<OrderForm onSubmit={() => ({ supplier: 'Supplier is blocked for purchasing.' })} />);
    await user.type(screen.getByRole('textbox', { name: 'Supplier' }), 'Contoso');
    await user.type(screen.getByRole('spinbutton', { name: 'Quantity' }), '2');
    await user.tab();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Supplier: Supplier is blocked for purchasing.');
  });

  it('ignores stale async results and supports cross-field validation and reset', async () => {
    let resolveSlow!: (m: string | undefined) => void;
    const { result } = renderHook(() =>
      useForm({
        initialValues: { code: '', from: 5, to: 1 },
        rules: { code: (v) => (v === 'slow' ? new Promise<string | undefined>((r) => (resolveSlow = r)) : undefined) },
        validate: (v) => (v.to < v.from ? { to: 'End must be after start.' } : {}),
      }),
    );
    act(() => result.current.setValue('code', 'slow'));
    let slow!: Promise<unknown>;
    act(() => {
      slow = result.current.validateField('code');
    });
    act(() => result.current.setValue('code', 'fast'));
    await act(async () => {
      await result.current.validateField('code');
    });
    await act(async () => {
      resolveSlow('Taken');
      await slow;
    });
    expect(result.current.errors.code).toBeUndefined();
    await act(async () => {
      expect(await result.current.validateAll()).toBe(false);
    });
    expect(result.current.errors.to).toBe('End must be after start.');
    act(() => result.current.reset());
    expect(result.current.errors).toEqual({});
    expect(result.current.values.code).toBe('');
  });
});
