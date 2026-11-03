import { describe, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { AnalyticalCard } from './AnalyticalCard';

describe('AnalyticalCard', () => {
  it('renders the KPI header with trend text and indicators', async () => {
    const ref = createRef<HTMLElement>();
    const { container } = renderWithTheme(
      <AnalyticalCard ref={ref} title="Revenue" value="10.3" unit="M EUR" trend={{ direction: 'up', value: '+12%' }} indicators={[{ label: 'Target', value: '9.8' }]} footer="Updated now">
        <p>chart</p>
      </AnalyticalCard>,
    );
    expect(screen.getByRole('article', { name: 'Revenue' })).toBe(ref.current);
    expect(screen.getByText('Up')).toHaveClass('eui-visually-hidden');
    expect(screen.getByText('Target').tagName).toBe('DT');
    expect(screen.getByText('chart')).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });

  it('turns the header into a drill-down button and shows placeholders while loading', async () => {
    const onHeaderClick = vi.fn();
    const { user, container } = renderWithTheme(<AnalyticalCard title="Orders" value="12" onHeaderClick={onHeaderClick} loading><p>chart</p></AnalyticalCard>);
    await user.click(screen.getByRole('button', { name: 'Orders' }));
    expect(onHeaderClick).toHaveBeenCalled();
    expect(screen.queryByText('chart')).toBeNull();
    expect(container.querySelector('article')).toHaveAttribute('aria-busy', 'true');
  });
});
