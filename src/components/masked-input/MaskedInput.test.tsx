import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { MaskedInput, applyMask } from './MaskedInput';

describe('MaskedInput', () => {
  it('inserts separators while typing and reports the raw value', async () => {
    const onChange = vi.fn();
    const { user, container } = renderWithTheme(<MaskedInput label="IBAN" mask="AA99 9999 9999 9999 9999 99" onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'IBAN' });
    await user.type(input, 'de8937040044');
    expect(input).toHaveValue('DE89 3704 0044');
    expect(onChange).toHaveBeenLastCalledWith('DE8937040044', { formatted: 'DE89 3704 0044', complete: false });
    expect(await axeViolations(container)).toEqual([]);
  });

  it('accepts pasted text with foreign separators and ignores invalid characters', () => {
    const onChange = vi.fn();
    renderWithTheme(<MaskedInput label="Phone" mask="+99 999 9999999" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Phone' }), { target: { value: '+49 (151) 234-5678x' } });
    expect(onChange).toHaveBeenLastCalledWith('491512345678', { formatted: '+49 151 2345678', complete: true });
    expect(applyMask('123', '99-9')).toBe('12-3');
  });
});
