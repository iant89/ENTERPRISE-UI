import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '../../../tests/utils';
import { DynamicDateRange, resolveDynamicDateRange } from './DynamicDateRange';

const now = new Date(2026, 9, 30);

describe('resolveDynamicDateRange', () => {
  it('resolves relative periods', () => {
    expect(resolveDynamicDateRange('today', now)).toEqual({ start: '2026-10-30', end: '2026-10-30' });
    expect(resolveDynamicDateRange('last7Days', now)).toEqual({ start: '2026-10-24', end: '2026-10-30' });
    expect(resolveDynamicDateRange('lastMonth', now)).toEqual({ start: '2026-09-01', end: '2026-09-30' });
    expect(resolveDynamicDateRange('thisWeek', now, 1).start).toBe('2026-10-26');
  });
});

describe('DynamicDateRange', () => {
  it('emits the option and resolved range', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<DynamicDateRange label="Period" today={() => now} options={['today', 'yesterday', 'custom']} onChange={onChange} />);
    await user.click(screen.getByRole('combobox', { name: /Period/ }));
    await user.click(await screen.findByRole('option', { name: 'Yesterday' }));
    expect(onChange).toHaveBeenCalledWith({ option: 'yesterday', range: { start: '2026-10-29', end: '2026-10-29' } });
  });
  it('shows a range picker for custom', () => {
    renderWithTheme(<DynamicDateRange label="Period" today={() => now} defaultValue={{ option: 'custom', range: { start: '2026-10-01', end: '2026-10-05' } }} />);
    expect(screen.getAllByText('Custom range').length).toBeGreaterThan(0);
  });
});
