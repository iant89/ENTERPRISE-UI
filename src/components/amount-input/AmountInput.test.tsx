import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { AmountInput } from './AmountInput';
import { QuantityInput } from './QuantityInput';

describe('AmountInput', () => {
  it('parses the user locale, rounds to the currency and shows grouping', async () => {
    const onChange = vi.fn();
    const { user, container } = renderWithTheme(<AmountInput label="Net amount" locale="de-DE" onChange={onChange} currencies={['EUR', 'JPY']} />);
    const input = screen.getByRole('textbox', { name: 'Net amount' });
    await user.type(input, '1234,567');
    await user.tab();
    expect(onChange).toHaveBeenLastCalledWith(1234.57);
    expect(input).toHaveValue('1.234,57');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Currency' }), 'JPY');
    expect(input).toHaveValue('1.235');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('reports ambiguous or out-of-range input instead of guessing', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<AmountInput label="Amount" locale="de-DE" min={0} max={100} onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Amount' });
    await user.type(input, '1.5');
    await user.tab();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Enter a valid amount.')).toBeInTheDocument();
    await user.clear(input);
    await user.type(input, '500');
    await user.tab();
    expect(screen.getByText('Enter an amount from 0 to 100.')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
    await user.clear(input);
    await user.type(input, '50{Enter}');
    expect(onChange).toHaveBeenCalledWith(50);
    expect(input).not.toHaveAttribute('aria-invalid', 'true');
  });
});

describe('QuantityInput', () => {
  it('uses the decimals of the selected unit', async () => {
    const onChange = vi.fn();
    const onUnitChange = vi.fn();
    const { user } = renderWithTheme(
      <QuantityInput label="Quantity" locale="en-US" units={[{ code: 'PC', label: 'Piece', decimals: 0 }, { code: 'KG', label: 'Kilogram', decimals: 3 }]} onChange={onChange} onUnitChange={onUnitChange} />,
    );
    const input = screen.getByRole('textbox', { name: 'Quantity' });
    await user.type(input, '2.6');
    await user.tab();
    expect(onChange).toHaveBeenLastCalledWith(3);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Unit of measure' }), 'KG');
    expect(onUnitChange).toHaveBeenCalledWith('KG');
    await user.clear(input);
    await user.type(input, '1,250.5');
    await user.tab();
    expect(onChange).toHaveBeenLastCalledWith(1250.5);
    expect(input).toHaveValue('1,250.500');
  });

  it('rejects negative quantities by default and shows a single unit as text', async () => {
    const { user } = renderWithTheme(<QuantityInput label="Qty" units={[{ code: 'M', decimals: 2 }]} />);
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.getByText('M')).toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'Qty' }), '-1');
    await user.tab();
    expect(screen.getByText('Enter 0 or more.')).toBeInTheDocument();
  });
});
