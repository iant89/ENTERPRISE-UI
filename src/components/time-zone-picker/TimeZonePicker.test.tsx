import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '../../../tests/utils';
import { TimeZonePicker, timeZoneOffset } from './TimeZonePicker';

describe('TimeZonePicker', () => {
  it('computes offsets including daylight saving time', () => {
    expect(timeZoneOffset('Europe/Berlin', new Date('2026-01-15T12:00:00Z'))).toBe(60);
    expect(timeZoneOffset('Europe/Berlin', new Date('2026-07-15T12:00:00Z'))).toBe(120);
    expect(timeZoneOffset('Asia/Kolkata', new Date('2026-07-15T12:00:00Z'))).toBe(330);
  });

  it('lists zones by offset and finds them by city', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<TimeZonePicker label="Time zone" zones={['Asia/Tokyo', 'Europe/Berlin', 'America/New_York']} referenceDate={new Date('2026-01-15T12:00:00Z')} locale="en-US" onChange={onChange} />);
    const input = screen.getByRole('combobox', { name: 'Time zone' });
    await user.click(input);
    await user.keyboard('{ArrowDown}');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      '(UTC−05:00) New York — Eastern Standard Time',
      '(UTC+01:00) Berlin — Central European Standard Time',
      '(UTC+09:00) Tokyo — Japan Standard Time',
    ]);
    await user.type(input, 'tokyo');
    await user.click(screen.getByRole('option', { name: /Tokyo/ }));
    expect(onChange).toHaveBeenCalledWith('Asia/Tokyo');
  });
});
