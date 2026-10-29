import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../../../tests/utils';
import { ComboBox } from './ComboBox';
import { MultiSelect } from '../multi-select';
import { TimePicker, parseTime } from '../time-picker';

const options = [
  { value: 'ber', label: 'Berlin' },
  { value: 'bar', label: 'Barcelona' },
  { value: 'lon', label: 'London' },
];

describe('ComboBox', () => {
  it('filters options as the user types and selects with Enter', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<ComboBox label="City" options={options} onChange={onChange} />);
    const input = screen.getByRole('combobox', { name: 'City' });
    await user.type(input, 'lond');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('lon');
    expect(input).toHaveValue('London');
  });

  it('reverts unmatched text on blur unless custom values are allowed', async () => {
    const { user } = renderWithTheme(<ComboBox label="City" options={options} defaultValue="ber" />);
    const input = screen.getByRole('combobox');
    await user.clear(input);
    await user.type(input, 'Paris');
    await user.tab();
    expect(input).toHaveValue('Berlin');
  });

  it('accepts custom values when allowed', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<ComboBox label="City" options={options} allowCustomValue onChange={onChange} />);
    await user.type(screen.getByRole('combobox'), 'Paris{Enter}');
    expect(onChange).toHaveBeenCalledWith('Paris');
  });

  it('has no axe violations when open', async () => {
    const { user } = renderWithTheme(<ComboBox label="City" options={options} />);
    await user.type(screen.getByRole('combobox'), 'b');
    expect(await axeViolations(document.body)).toEqual([]);
  });
});

describe('MultiSelect', () => {
  it('toggles options and removes the last token with Backspace', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<MultiSelect label="Cities" options={options} onChange={onChange} />);
    const input = screen.getByRole('combobox', { name: 'Cities' });
    await user.click(input);
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(['ber']);
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(['ber', 'bar']);
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');
    await user.keyboard('{Escape}{Backspace}');
    expect(onChange).toHaveBeenLastCalledWith(['ber']);
  });
});

describe('TimePicker', () => {
  it('parses flexible time input', () => {
    expect(parseTime('9')).toBe('09:00');
    expect(parseTime('930')).toBe('09:30');
    expect(parseTime('9:30 pm')).toBe('21:30');
    expect(parseTime('12am')).toBe('00:00');
    expect(parseTime('25:00')).toBeNull();
  });

  it('normalises typed times', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<TimePicker label="Start" onChange={onChange} />);
    await user.type(screen.getByRole('combobox'), '1415');
    await user.tab();
    expect(onChange).toHaveBeenCalledWith('14:15');
  });
});
