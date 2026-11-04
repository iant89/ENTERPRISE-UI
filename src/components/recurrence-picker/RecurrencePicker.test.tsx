import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { RecurrencePicker, describeRecurrence, toRRule, type Recurrence } from './RecurrencePicker';

describe('RecurrencePicker', () => {
  it('builds RRULEs and summaries', () => {
    const r: Recurrence = { frequency: 'weekly', interval: 2, weekdays: [2, 0], monthDay: 1, end: { type: 'until', date: '2026-12-31' } };
    expect(toRRule(r)).toBe('FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE;UNTIL=20261231');
    expect(describeRecurrence(r, { locale: 'en-US' })).toBe('Every 2 weeks · Mon, Wed · ends Dec 31, 2026');
    expect(toRRule({ ...r, frequency: 'monthly', interval: 1, monthDay: 15, end: { type: 'count', count: 6 } })).toBe('FREQ=MONTHLY;BYMONTHDAY=15;COUNT=6');
    expect(toRRule({ ...r, frequency: 'none' })).toBe('');
  });

  it('edits weekdays and the end, reporting the rule', async () => {
    const onChange = vi.fn();
    const { user, container } = renderWithTheme(<RecurrencePicker locale="en-US" onChange={onChange} />);
    expect(screen.getByRole('group', { name: 'Repeat' })).toHaveAccessibleDescription('Summary: Weekly · Mon');
    await user.click(screen.getByRole('button', { name: 'Fri', description: 'Friday' }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ weekdays: [0, 4] }), { rrule: 'FREQ=WEEKLY;BYDAY=MO,FR', summary: 'Weekly · Mon, Fri' });
    await user.click(screen.getByRole('radio', { name: 'After' }));
    expect(onChange.mock.lastCall![1].rrule).toBe('FREQ=WEEKLY;BYDAY=MO,FR;COUNT=10');
    expect(await axeViolations(container)).toEqual([]);
  });
});
