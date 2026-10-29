import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../../../tests/utils';
import { Calendar } from './Calendar';
import { DatePicker } from '../date-picker';
import { parseISODate, toISODate, addMonths } from '../../utilities/date';

describe('date utilities', () => {
  it('parses and formats ISO dates', () => {
    expect(toISODate(parseISODate('2026-02-28')!)).toBe('2026-02-28');
    expect(parseISODate('2026-02-30')).toBeNull();
    expect(toISODate(addMonths(new Date(2026, 0, 31), 1))).toBe('2026-02-28');
  });
});

describe('Calendar', () => {
  it('navigates with the keyboard and selects with Enter', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<Calendar defaultValue={new Date(2026, 9, 15)} onChange={onChange} locale="en-US" />);
    expect(screen.getByRole('grid', { name: 'October 2026' })).toBeInTheDocument();
    screen.getByRole('button', { name: /October 15, 2026/ }).focus();
    await user.keyboard('{ArrowRight}{ArrowDown}');
    expect(screen.getByRole('button', { name: /October 23, 2026/ })).toHaveFocus();
    await user.keyboard('{PageDown}');
    expect(screen.getByRole('grid', { name: 'November 2026' })).toBeInTheDocument();
    await user.keyboard('{Enter}');
    expect(toISODate(onChange.mock.calls[0][0])).toBe('2026-11-23');
  });

  it('disables dates outside min/max', () => {
    renderWithTheme(<Calendar defaultValue={new Date(2026, 9, 15)} min={new Date(2026, 9, 10)} locale="en-US" />);
    expect(screen.getByRole('button', { name: /October 9, 2026/ })).toBeDisabled();
  });

  it('has no axe violations', async () => {
    const { container } = renderWithTheme(<Calendar defaultValue={new Date(2026, 9, 15)} locale="en-US" />);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('DatePicker', () => {
  it('accepts typed dates and reports invalid input', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<DatePicker label="Delivery date" onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Delivery date' });
    await user.type(input, '2026-12-01');
    await user.tab();
    expect(toISODate(onChange.mock.calls[0][0])).toBe('2026-12-01');
    await user.clear(input);
    await user.type(input, 'tomorrow');
    await user.tab();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('picks a date from the calendar popup', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<DatePicker label="Delivery date" defaultValue={new Date(2026, 9, 15)} onChange={onChange} locale="en-US" />);
    await user.click(screen.getByRole('button', { name: 'Choose date' }));
    expect(screen.getByRole('dialog', { name: 'Choose date' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: /October 15, 2026/ })).toHaveFocus());
    await user.keyboard('{ArrowRight}{Enter}');
    expect(toISODate(onChange.mock.calls[0][0])).toBe('2026-10-16');
    expect(screen.getByRole('textbox')).toHaveValue('2026-10-16');
  });
});
