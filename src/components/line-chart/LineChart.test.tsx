import { describe, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { LineChart } from './LineChart';

const data = [
  { month: 'Jan', actual: 10, plan: 12 },
  { month: 'Feb', actual: null, plan: 14 },
  { month: 'Mar', actual: 18, plan: 15 },
];
const series = [{ key: 'actual', label: 'Actual' }, { key: 'plan', label: 'Plan' }];

describe('LineChart', () => {
  it('is a named, focusable chart that announces points from the keyboard', async () => {
    const { user } = renderWithTheme(<LineChart label="Revenue" data={data} categoryKey="month" series={series} />);
    const chart = screen.getByRole('group', { name: 'Revenue' });
    expect(chart).toHaveAttribute('aria-roledescription', 'chart');
    await user.tab();
    expect(chart).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(chart).toHaveTextContent('Jan: Actual 10, Plan 12');
    await user.keyboard('{ArrowRight}');
    expect(chart).toHaveTextContent('Feb: Actual –, Plan 14');
    await user.keyboard('{End}');
    expect(chart).toHaveTextContent('Mar: Actual 18, Plan 15');
  });

  it('always renders a data table and reveals it with the toggle', async () => {
    const { user } = renderWithTheme(<LineChart label="Revenue" data={data} categoryKey="month" categoryLabel="Month" series={series} formatValue={(v) => `${v} EUR`} />);
    const table = screen.getByRole('table', { name: 'Revenue' });
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['Month', 'Actual', 'Plan']);
    expect(screen.getByRole('rowheader', { name: 'Mar' }).parentElement).toHaveTextContent('Mar18 EUR15 EUR');
    expect(table.parentElement).toHaveClass('eui-visually-hidden');
    const toggle = screen.getByRole('button', { name: 'Show table' });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(table.parentElement).not.toHaveClass('eui-visually-hidden');
  });

  it('shows a legend for two or more series only, and direct end labels', () => {
    const { container, rerender } = renderWithTheme(<LineChart label="Revenue" data={data} categoryKey="month" series={series} />);
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Actual', 'Plan']);
    expect([...container.querySelectorAll('svg text')].map((t) => t.textContent)).toContain('Actual');
    rerender(<LineChart label="Revenue" data={data} categoryKey="month" series={[series[0]]} />);
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('assigns colors in fixed order and folds an eighth series into the neutral color', () => {
    const many = Array.from({ length: 8 }, (_, i) => ({ key: `s${i}`, label: `S${i}` }));
    const row = Object.fromEntries(many.map((s, i) => [s.key, i]));
    renderWithTheme(<LineChart label="Many" data={[{ c: 'a', ...row }, { c: 'b', ...row }]} categoryKey="c" series={many} directLabels={false} />);
    const swatches = screen.getAllByRole('listitem').map((li) => li.querySelector<HTMLElement>('[aria-hidden="true"]')!.style.color);
    expect(swatches[0]).toBe('var(--eui-color-chart-1)');
    expect(swatches[6]).toBe('var(--eui-color-chart-7)');
    expect(swatches[7]).toBe('var(--eui-color-chart-other)');
  });

  it('hides and shows series from the legend without repainting the others', async () => {
    const onHiddenSeriesChange = vi.fn();
    const { user, container } = renderWithTheme(<LineChart label="Revenue" data={data} categoryKey="month" series={series} onHiddenSeriesChange={onHiddenSeriesChange} />);
    const actual = screen.getByRole('button', { name: 'Actual' });
    const plan = screen.getByRole('button', { name: 'Plan' });
    expect(actual).toHaveAttribute('aria-pressed', 'true');
    await user.click(actual);
    expect(onHiddenSeriesChange).toHaveBeenLastCalledWith(['actual']);
    expect(actual).toHaveAttribute('aria-pressed', 'false');
    expect(container).toHaveTextContent('Actual hidden');
    // Only the Plan line is drawn, still in its own (second) color, and Plan cannot be hidden too.
    const lines = [...container.querySelectorAll('path[class*="line"]')].map((p) => (p.closest('g[style]') as HTMLElement).style.color);
    expect(new Set(lines)).toEqual(new Set(['var(--eui-color-chart-2)']));
    expect(plan).toBeDisabled();
    // Tooltip and announcements skip the hidden series; the data table keeps it.
    screen.getByRole('group', { name: 'Revenue' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('group', { name: 'Revenue' })).toHaveTextContent('Jan: Plan 12');
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['month', 'Actual', 'Plan']);
    await user.click(actual);
    expect(actual).toHaveAttribute('aria-pressed', 'true');
    expect(plan).toBeEnabled();
  });

  it('can turn the legend toggle off or control the hidden set', () => {
    const { rerender } = renderWithTheme(<LineChart label="Revenue" data={data} categoryKey="month" series={series} legendToggle={false} />);
    expect(screen.queryByRole('button', { name: 'Actual' })).toBeNull();
    rerender(<LineChart label="Revenue" data={data} categoryKey="month" series={series} hiddenSeries={['plan']} />);
    expect(screen.getByRole('button', { name: 'Plan' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders an empty state and a loading state', () => {
    const { rerender } = renderWithTheme(<LineChart label="Revenue" data={[]} categoryKey="month" series={series} />);
    expect(screen.getByRole('img', { name: 'Revenue: No data' })).toBeInTheDocument();
    rerender(<LineChart label="Revenue" data={data} categoryKey="month" series={series} loading labels={{ loading: 'Lädt' }} />);
    expect(screen.getByRole('status')).toHaveTextContent('Lädt');
    expect(screen.getByRole('figure')).toHaveAttribute('aria-busy', 'true');
  });

  it('breaks the line at missing values and hides the tooltip on Escape', async () => {
    const { container, user } = renderWithTheme(<LineChart label="Revenue" data={data} categoryKey="month" series={[series[0]]} />);
    // Jan and Mar are separate runs: two single-point markers, no connecting path.
    expect(container.querySelectorAll('path[class*="line"]')).toHaveLength(2);
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(container.querySelector('[class*="tooltip"]')).not.toBeNull();
    fireEvent.keyDown(screen.getByRole('group'), { key: 'Escape' });
    expect(container.querySelector('[class*="tooltip-"]')).toBeNull();
  });

  it('forwards the ref to the figure and passes axe', async () => {
    const ref = createRef<HTMLElement>();
    const { container } = renderWithTheme(<LineChart ref={ref} className="x" label="Revenue" data={data} categoryKey="month" series={series} />);
    expect(ref.current?.tagName).toBe('FIGURE');
    expect(ref.current).toHaveClass('x');
    expect(await axeViolations(container)).toEqual([]);
  });
});
