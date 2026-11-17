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

  it('opens on a click of the text with openOnClick, and only from the arrow without it', async () => {
    const { user, rerender } = renderWithTheme(<ComboBox label="City" options={options} />);
    const input = screen.getByRole('combobox', { name: 'City' });
    await user.click(input);
    expect(screen.queryByRole('listbox')).toBeNull();
    rerender(<ComboBox label="City" options={options} openOnClick />);
    const again = screen.getByRole('combobox', { name: 'City' });
    await user.click(again);
    expect(screen.getAllByRole('option')).toHaveLength(3);
    // Editable: a second click places the caret and keeps the list open.
    await user.click(again);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('editable={false} is select-like: no typing; click toggles, Space and Enter open, letters jump', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<ComboBox label="City" options={options} defaultValue="ber" editable={false} openOnClick clearable={false} onChange={onChange} />);
    const input = screen.getByRole('combobox', { name: 'City' });
    expect(input).toHaveAttribute('readonly');
    expect(input).toHaveAttribute('aria-autocomplete', 'none');
    await user.click(input);
    expect(screen.getAllByRole('option')).toHaveLength(3); // never filtered by the current label
    await user.click(input);
    expect(screen.queryByRole('listbox')).toBeNull();

    // Typing changes nothing; a letter jumps to the next match, closed or open.
    await user.keyboard('l');
    expect(onChange).toHaveBeenLastCalledWith('lon');
    expect(input).toHaveValue('London');
    await user.keyboard('b');
    expect(onChange).toHaveBeenLastCalledWith('ber');
    await user.keyboard('b');
    expect(onChange).toHaveBeenLastCalledWith('bar');

    await user.keyboard(' ');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await user.keyboard('{Enter}');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.keyboard('l{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('lon');
    expect(screen.queryByRole('listbox')).toBeNull();

    // Escape on a closed select-like box without a clear button keeps the value.
    await user.keyboard('{Escape}');
    expect(input).toHaveValue('London');
    expect(await axeViolations(document.body)).toEqual([]);
  });

  it('letters skip leading symbols and emoji in labels', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(
      <ComboBox label="Type" editable={false} defaultValue="a" onChange={onChange}
        options={[{ value: 'a', label: '📢  Announcement' }, { value: 'r', label: '🚀  New feature' }, { value: 'm', label: '🛠️  Maintenance' }]} />,
    );
    await user.click(screen.getByRole('combobox'));
    await user.keyboard('m');
    expect(onChange).toHaveBeenLastCalledWith('m');
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
