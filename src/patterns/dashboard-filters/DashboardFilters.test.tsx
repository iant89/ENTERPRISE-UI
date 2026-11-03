import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { BarChart } from '../../components/bar-chart';
import { DashboardFilterBar, DashboardFilterProvider, useDashboardFilters } from './DashboardFilters';

function Widgets() {
  const f = useDashboardFilters();
  return (
    <>
      <BarChart
        label="Orders"
        data={[{ r: 'EMEA', v: 1 }, { r: 'APJ', v: 2 }]}
        categoryKey="r"
        series={[{ key: 'v', label: 'V' }]}
        selectedCategory={f.valueOf('region')}
        onSelect={({ category }) => f.toggleFilter({ id: 'region', name: 'Region', value: category })}
      />
      <button type="button" onClick={() => f.drillDown({ level: 'region', name: 'Region', value: 'EMEA' })}>drill emea</button>
      <button type="button" onClick={() => f.drillDown({ level: 'country', name: 'Country', value: 'Germany' })}>drill de</button>
      <output>{f.valueOf('region') ?? 'none'}</output>
    </>
  );
}

describe('Dashboard filters', () => {
  it('applies, toggles and removes a cross-filter from a chart, with announcements', async () => {
    const onChange = vi.fn();
    const { user, container } = renderWithTheme(
      <DashboardFilterProvider onChange={onChange}>
        <DashboardFilterBar emptyText="No filters" />
        <Widgets />
      </DashboardFilterProvider>,
    );
    expect(screen.getByText('No filters')).toBeInTheDocument();
    screen.getByRole('group', { name: 'Orders' }).focus();
    await user.keyboard('{ArrowRight}{Enter}');
    expect(screen.getByText('EMEA', { selector: 'output' })).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith({ filters: [{ id: 'region', name: 'Region', value: 'EMEA' }], drillPath: [] });
    expect(container).toHaveTextContent('Filtered by Region: EMEA');
    expect(screen.getByRole('region', { name: 'Dashboard filters' })).toHaveTextContent('Region');
    // Selecting the same point again clears the filter.
    await user.keyboard('{Enter}');
    expect(screen.getByText('none', { selector: 'output' })).toBeInTheDocument();
    expect(container).toHaveTextContent('Filter removed');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('shows the drill path and returns to a level', async () => {
    const { user } = renderWithTheme(
      <DashboardFilterProvider>
        <DashboardFilterBar rootLabel="All regions" />
        <Widgets />
      </DashboardFilterProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'drill emea' }));
    await user.click(screen.getByRole('button', { name: 'drill de' }));
    const nav = screen.getByRole('navigation', { name: 'Drill-down path' });
    expect(nav).toHaveTextContent('All regionsEMEAGermany');
    expect(screen.getByText('Germany')).toHaveAttribute('aria-current', 'location');
    await user.click(screen.getByRole('button', { name: 'EMEA' }));
    expect(nav).toHaveTextContent('All regionsEMEA');
    await user.click(screen.getByRole('button', { name: 'All regions' }));
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('can be controlled and throws a clear error outside a provider', () => {
    render(
      <DashboardFilterProvider value={{ filters: [{ id: 'region', name: 'Region', value: 'APJ' }], drillPath: [] }}>
        <Widgets />
      </DashboardFilterProvider>,
    );
    expect(screen.getByText('APJ', { selector: 'output' })).toBeInTheDocument();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Widgets />)).toThrow('useDashboardFilters must be used inside a DashboardFilterProvider.');
    spy.mockRestore();
  });
});
