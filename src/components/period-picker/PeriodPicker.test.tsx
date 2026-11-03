import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { PeriodPicker, resolvePeriod } from './PeriodPicker';

const ymd = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

describe('PeriodPicker', () => {
  it('resolves quarters, fiscal periods and ISO weeks to dates', () => {
    expect([ymd(resolvePeriod('2026-Q2')!.start), ymd(resolvePeriod('2026-Q2')!.end)]).toEqual(['2026-4-1', '2026-6-30']);
    // Fiscal year 2026 starting in October: P01 is October 2025.
    expect(ymd(resolvePeriod('2026-P01', 10)!.start)).toBe('2025-10-1');
    expect(ymd(resolvePeriod('2026-P12', 10)!.end)).toBe('2026-9-30');
    // ISO week 1 of 2026 starts on Monday 29 December 2025.
    expect(ymd(resolvePeriod('2026-W01')!.start)).toBe('2025-12-29');
    expect(ymd(resolvePeriod('2024-02')!.end)).toBe('2024-2-29');
  });

  it('picks a month with year navigation and arrow keys', async () => {
    const onChange = vi.fn();
    const { user, container } = renderWithTheme(<PeriodPicker label="Posting period" defaultValue="2026-03" locale="en-US" onChange={onChange} />);
    const trigger = screen.getByRole('button', { name: 'Posting period March 2026' });
    await user.click(trigger);
    expect(screen.getByRole('button', { name: 'Mar, March 2026' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Next year' }));
    screen.getByRole('button', { name: 'Jan, January 2027' }).focus();
    await user.keyboard('{ArrowDown}{ArrowRight}{Enter}');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ value: '2027-05' }));
    expect(screen.getByRole('button', { name: 'Posting period May 2027' })).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });

  it('shows fiscal periods with their month', async () => {
    const { user } = renderWithTheme(<PeriodPicker label="Period" granularity="fiscalPeriod" fiscalYearStartMonth={4} defaultValue="2027-P01" locale="en-US" />);
    expect(screen.getByRole('button', { name: 'Period P01 FY 2027' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Period/ }));
    expect(screen.getByRole('button', { name: 'P01, April 2026' })).toHaveAttribute('aria-pressed', 'true');
  });
});
