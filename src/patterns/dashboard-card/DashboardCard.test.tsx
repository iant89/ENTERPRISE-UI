import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { BarChart } from '../../components/bar-chart';
import { DashboardCard } from './DashboardCard';

const chart = <BarChart label="OEE" data={[{ p: 'A', v: 1 }]} categoryKey="p" series={[{ key: 'v', label: 'V' }]} />;

describe('DashboardCard', () => {
  it('renders content with freshness, stale warning and chart tools', async () => {
    const { container } = renderWithTheme(
      <DashboardCard title="OEE" lastUpdated={Date.now() - 2 * 3_600_000} staleAfter={3_600_000} locale="en" chartTools onRefresh={() => {}}>
        {chart}
      </DashboardCard>,
    );
    expect(screen.getByRole('article', { name: 'OEE' })).toBeInTheDocument();
    expect(screen.getByText('Updated 2 hours ago')).toBeInTheDocument();
    expect(screen.getByText('Out of date')).toBeInTheDocument();
    expect(screen.getByRole('toolbar', { name: 'Chart tools' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'OEE' })).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });

  it('shows the error state with retry and announces it', async () => {
    const onRetry = vi.fn();
    const { user, container, rerender } = renderWithTheme(<DashboardCard title="OEE">{chart}</DashboardCard>);
    rerender(<DashboardCard title="OEE" status="error" error="Timeout" onRetry={onRetry}>{chart}</DashboardCard>);
    expect(screen.queryByRole('group')).toBeNull();
    expect(screen.getAllByText('Timeout')).toHaveLength(2);
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent('Timeout');
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalled();
    expect(screen.queryByRole('toolbar')).toBeNull();
  });

  it('has loading, empty and forbidden placeholders and keeps content while refreshing', () => {
    const { rerender } = renderWithTheme(<DashboardCard title="OEE" status="loading">{chart}</DashboardCard>);
    expect(screen.getByRole('article')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Loading')).toBeInTheDocument();
    rerender(<DashboardCard title="OEE" status="empty" labels={{ empty: 'Keine Daten' }}>{chart}</DashboardCard>);
    expect(screen.getByText('Keine Daten')).toBeInTheDocument();
    rerender(<DashboardCard title="OEE" status="forbidden">{chart}</DashboardCard>);
    expect(screen.getByText('You do not have access to this data.')).toBeInTheDocument();
    rerender(<DashboardCard title="OEE" refreshing onRefresh={() => {}}>{chart}</DashboardCard>);
    expect(screen.getByRole('group', { name: 'OEE' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh' })).toHaveAttribute('aria-busy', 'true');
  });
});
