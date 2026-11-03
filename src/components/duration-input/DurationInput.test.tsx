import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '../../../tests/utils';
import { DurationInput, parseDuration } from './DurationInput';

describe('DurationInput', () => {
  it.each([
    ['2h 30m', 150],
    ['1.5h', 90],
    ['1:45', 105],
    ['90', 90],
    ['1d 2h', 1560],
    ['', null],
  ])('parses %s', (text, minutes) => expect(parseDuration(text)).toBe(minutes));

  it('rejects nonsense and uses working days when asked', () => {
    expect(parseDuration('2 apples')).toBeNaN();
    expect(parseDuration('1d', { hoursPerDay: 8 })).toBe(480);
  });

  it('commits minutes and shows a readable duration', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<DurationInput label="Effort" onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Effort' });
    await user.type(input, '2h15{Enter}');
    expect(screen.getByText(/Enter a duration/)).toBeInTheDocument();
    await user.clear(input);
    await user.type(input, '2h 15m');
    await user.tab();
    expect(onChange).toHaveBeenLastCalledWith(135);
    expect(input).toHaveValue('2 h 15 min');
  });
});
