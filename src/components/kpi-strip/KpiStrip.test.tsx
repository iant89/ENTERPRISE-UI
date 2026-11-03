import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { KpiStrip } from './KpiStrip';

const items = [
  { id: 'otd', label: 'On-time delivery', value: '94.1', unit: '%', tone: 'warning' as const, target: 'Target 96%', trend: { direction: 'down' as const, value: '−1.2 pts', label: 'vs last month' } },
  { id: 'open', label: 'Open orders', value: '1,284', sparkline: [3, 4, 6, 5, 7], trend: { direction: 'up' as const, value: '+8%', upIsGood: false } },
  { id: 'returns', label: 'Returns', value: '0.8', unit: '%' },
];

describe('KpiStrip', () => {
  it('lists each indicator with its value, unit, trend direction in text and target', async () => {
    const { container } = renderWithTheme(<KpiStrip label="Fulfilment KPIs" items={items} />);
    const strip = screen.getByRole('region', { name: 'Fulfilment KPIs' });
    const [otd, open] = within(strip).getAllByRole('listitem');
    expect(otd).toHaveTextContent('On-time delivery94.1%Down −1.2 ptsvs last monthTarget 96%');
    expect(open).toHaveTextContent('Up +8%');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('makes items with onClick into buttons named by their content', async () => {
    const onClick = vi.fn();
    const { user } = renderWithTheme(<KpiStrip label="KPIs" items={[{ ...items[2], onClick }]} />);
    await user.click(screen.getByRole('button', { name: /Returns/ }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('shows skeletons and aria-busy while loading', () => {
    renderWithTheme(<KpiStrip label="KPIs" items={items} loading />);
    expect(screen.getByRole('region', { name: 'KPIs' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('94.1')).not.toBeInTheDocument();
  });
});
