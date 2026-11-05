import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { MaskedInput, applyMask, parseMask } from './MaskedInput';

const field = (name: string) => screen.getByRole('textbox', { name }) as HTMLInputElement;

describe('MaskedInput', () => {
  it('looks empty until focused, then shows the mask with placeholder symbols', async () => {
    const { user } = renderWithTheme(<MaskedInput label="Phone" mask="(999) 999-999" />);
    const input = field('Phone');
    expect(input).toHaveValue('');
    await user.click(input);
    expect(input).toHaveValue('(___) ___-___');
    expect(input.selectionStart).toBe(1);
    await user.tab();
    expect(input).toHaveValue('');
  });

  it('replaces placeholder symbols while typing, skips fixed characters and reports the raw value', async () => {
    const onChange = vi.fn();
    const { user, container } = renderWithTheme(<MaskedInput label="IBAN" mask="AA99 9999 9999 9999 9999 99" onChange={onChange} />);
    const input = field('IBAN');
    await user.click(input);
    await user.keyboard('de8937040044');
    expect(input).toHaveValue('DE89 3704 0044 ____ ____ __');
    expect(onChange).toHaveBeenLastCalledWith('DE8937040044', { formatted: 'DE89 3704 0044', complete: false });
    expect(input.selectionStart).toBe(15);
    expect(await axeViolations(container)).toEqual([]);
  });

  it('rejects characters that do not match the position', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<MaskedInput label="Code" mask="aaa99" rules={{ a: /[a-z]/i }} letterCase="none" onChange={onChange} />);
    await user.click(field('Code'));
    await user.keyboard('1ab2c34');
    expect(field('Code')).toHaveValue('abc34');
    expect(onChange).toHaveBeenLastCalledWith('abc34', { formatted: 'abc34', complete: true });
  });

  it('keeps the other characters in place when one is deleted', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<MaskedInput label="Phone" mask="(999) 999-999" defaultValue="555333123" onChange={onChange} />);
    const input = field('Phone');
    await user.click(input);
    input.setSelectionRange(3, 3);
    await user.keyboard('{Backspace}');
    expect(input).toHaveValue('(5_5) 333-123');
    expect(onChange).toHaveBeenLastCalledWith('5_5333123', { formatted: '(5_5) 333-123', complete: false });
    expect(input.selectionStart).toBe(2);
  });

  it('backspace over a fixed character clears the position before it', async () => {
    const { user } = renderWithTheme(<MaskedInput label="Phone" mask="(999) 999-999" defaultValue="555333123" />);
    const input = field('Phone');
    await user.click(input);
    input.setSelectionRange(10, 10);
    await user.keyboard('{Backspace}');
    expect(input).toHaveValue('(555) 33_-123');
  });

  it('resets to placeholder symbols when everything is selected and deleted', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<MaskedInput label="Phone" mask="(999) 999-999" defaultValue="555333123" onChange={onChange} />);
    const input = field('Phone');
    await user.click(input);
    input.setSelectionRange(0, input.value.length);
    await user.keyboard('{Backspace}');
    expect(input).toHaveValue('(___) ___-___');
    expect(onChange).toHaveBeenLastCalledWith('', { formatted: '', complete: false });
  });

  it.each(['(555) 333 123456', '555-333-123456', '555 (333) 12 34 56', '  5553331234 56  '])('reformats pasted "%s"', async (pasted) => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<MaskedInput label="Number" mask="(999) 999 999999" onChange={onChange} />);
    const input = field('Number');
    await user.click(input);
    input.setSelectionRange(0, input.value.length);
    await user.paste(pasted);
    expect(input).toHaveValue('(555) 333 123456');
    expect(onChange).toHaveBeenLastCalledWith('555333123456', { formatted: '(555) 333 123456', complete: true });
  });

  it('accepts a custom placeholder symbol and escaped fixed characters', async () => {
    const { user } = renderWithTheme(<MaskedInput label="Product key" mask={'\\A\\9-****-****'} placeholderSymbol="#" />);
    const input = field('Product key');
    await user.click(input);
    expect(input).toHaveValue('A9-####-####');
    await user.keyboard('x1y2');
    expect(input).toHaveValue('A9-X1Y2-####');
  });

  it('accepts a full unformatted value with foreign separators', () => {
    const onChange = vi.fn();
    renderWithTheme(<MaskedInput label="Phone" mask="+99 999 9999999" onChange={onChange} />);
    fireEvent.change(field('Phone'), { target: { value: '+49 (151) 234-5678x' } });
    expect(onChange).toHaveBeenLastCalledWith('491512345678', { formatted: '+49 151 2345678', complete: true });
  });

  it('formats raw values with applyMask and parses escapes', () => {
    expect(applyMask('123', '99-9')).toBe('12-3');
    expect(parseMask('\\9a', { a: /x/ })).toEqual([{ literal: '9' }, { rule: /x/ }]);
  });
});
