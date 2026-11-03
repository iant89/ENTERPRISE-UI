import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { BarChart } from '../bar-chart';
import { LineChart } from '../line-chart';
import { ChartContainer } from './ChartContainer';
import { tablesToCsv } from './chartTools';

const bars = [{ r: 'EMEA', a: 1, b: 2 }, { r: 'APJ', a: 3, b: 4 }];
const series = [{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }];
const ui = (props = {}) => (
  <ChartContainer title="Sales" {...props}>
    <BarChart label="Orders" data={bars} categoryKey="r" categoryLabel="Region" series={series} />
    <LineChart label="Trend" data={bars} categoryKey="r" series={[series[0]]} />
  </ChartContainer>
);

describe('ChartContainer', () => {
  it('switches every chart inside to its table and back', async () => {
    const { user, container } = renderWithTheme(ui());
    expect(screen.getAllByRole('group', { name: /Orders|Trend/ })).toHaveLength(2);
    // The container replaces the per-chart table toggles.
    expect(screen.queryByRole('button', { name: 'Show table' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Table view' }));
    expect(screen.queryByRole('group', { name: 'Orders' })).toBeNull();
    const table = screen.getByRole('table', { name: 'Orders' });
    expect(table.parentElement).not.toHaveClass('eui-visually-hidden');
    expect(screen.getByRole('button', { name: 'Table view' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Chart view' }));
    expect(screen.getByRole('group', { name: 'Orders' })).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });

  it('toggles legends', async () => {
    const { user } = renderWithTheme(ui());
    const legendItems = () => screen.queryAllByRole('listitem').filter((li) => li.textContent === 'A' || li.textContent === 'B');
    expect(legendItems()).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: 'Show legend' }));
    expect(screen.getByRole('button', { name: 'Show legend' })).toHaveAttribute('aria-pressed', 'false');
    expect(legendItems()).toHaveLength(0);
  });

  it('downloads all registered charts as CSV from the download menu', async () => {
    const onDownload = vi.fn();
    const { user } = renderWithTheme(ui({ onDownload }));
    await user.click(screen.getByRole('button', { name: 'Download' }));
    expect(screen.getAllByRole('menuitem').map((m) => m.textContent)).toEqual(['PNG image', 'JPEG image', 'CSV data']);
    await user.click(screen.getByRole('menuitem', { name: 'CSV data' }));
    const [csv, name] = onDownload.mock.calls[0];
    expect(name).toBe('sales');
    expect(csv).toContain('Orders\r\nRegion,A,B\r\nEMEA,1,2\r\nAPJ,3,4');
    expect(csv).toContain('Trend\r\nr,A\r\nEMEA,1');
  });

  it('disables image formats in table view and can limit the formats', async () => {
    const { user, rerender } = renderWithTheme(ui({ defaultView: 'table' }));
    await user.click(screen.getByRole('button', { name: 'Download' }));
    expect(screen.getByRole('menuitem', { name: 'PNG image' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('menuitem', { name: 'CSV data' })).not.toHaveAttribute('aria-disabled', 'true');
    await user.keyboard('{Escape}');
    rerender(ui({ tools: { download: ['csv'] } }));
    await user.click(screen.getByRole('button', { name: 'Download' }));
    expect(screen.getAllByRole('menuitem').map((m) => m.textContent)).toEqual(['CSV data']);
  });

  it('expands in-page when the Fullscreen API is unavailable and Escape restores it', async () => {
    const { user } = renderWithTheme(ui());
    const region = screen.getByRole('region', { name: 'Sales' });
    await user.click(screen.getByRole('button', { name: 'Enter full screen' }));
    expect(region.className).toMatch(/expanded/);
    await user.keyboard('{Escape}');
    expect(region.className).not.toMatch(/expanded/);
    expect(within(region).getByRole('button', { name: 'Enter full screen' })).toBeInTheDocument();
  });

  it('quotes CSV cells and neutralizes formulas', () => {
    expect(tablesToCsv([{ label: 'x', table: { headers: ['Name', 'Value'], rows: [['=SUM(A1)', '-5'], ['a,"b"', '-x']] } }])).toBe(
      `Name,Value\r\n'=SUM(A1),-5\r\n"a,""b""",'-x`,
    );
  });
});
