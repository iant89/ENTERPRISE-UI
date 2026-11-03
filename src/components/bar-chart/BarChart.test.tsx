import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { BarChart } from './BarChart';

const data = [
  { region: 'EMEA', online: 40, partner: 30 },
  { region: 'APJ', online: 20, partner: -5 },
];
const series = [{ key: 'online', label: 'Online' }, { key: 'partner', label: 'Partner' }];

describe('BarChart', () => {
  it('draws one bar per category and series when grouped', () => {
    const { container } = renderWithTheme(<BarChart label="Orders" data={data} categoryKey="region" series={series} />);
    expect(container.querySelectorAll('path[class*="bar"]')).toHaveLength(4);
  });

  it('adds a localized total when stacked', async () => {
    const { user } = renderWithTheme(<BarChart label="Orders" data={data} categoryKey="region" series={series} stacked labels={{ total: 'Summe' }} />);
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['region', 'Online', 'Partner', 'Summe']);
    expect(screen.getByRole('rowheader', { name: 'APJ' }).parentElement).toHaveTextContent('APJ20-515');
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('group')).toHaveTextContent('EMEA: Online 40, Partner 30, Summe 70');
  });

  it('re-stacks without a hidden series while the table keeps the full total', async () => {
    const { user, container } = renderWithTheme(<BarChart label="Orders" data={data} categoryKey="region" series={series} stacked />);
    await user.click(screen.getByRole('button', { name: 'Partner' }));
    expect(container.querySelectorAll('path[class*="bar"]')).toHaveLength(2);
    expect([...container.querySelectorAll('path[class*="bar"]')].every((p) => p.getAttribute('fill') === 'var(--eui-color-chart-1)')).toBe(true);
    expect(screen.getByRole('rowheader', { name: 'EMEA' }).parentElement).toHaveTextContent('EMEA403070');
  });

  it('supports horizontal layout with value labels and reference lines in the legend', async () => {
    const { container } = renderWithTheme(
      <BarChart label="Spend" data={data} categoryKey="region" series={[series[0]]} layout="horizontal" valueLabels referenceLines={[{ value: 30, label: 'Target' }]} />,
    );
    const texts = [...container.querySelectorAll('svg text')].map((t) => t.textContent);
    expect(texts).toEqual(expect.arrayContaining(['EMEA', 'APJ', '40', '20', 'Target']));
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Online', 'Target']);
    expect(await axeViolations(container)).toEqual([]);
  });
});
