import { describe, expect, it } from 'vitest';
import { renderWithTheme } from '../../../tests/utils';
import { BarChart } from '../bar-chart';
import { composeChartSvg } from './exportImage';

describe('composeChartSvg', () => {
  it('builds one standalone SVG with title, chart labels, inlined styles and legends', () => {
    const { container } = renderWithTheme(
      <div>
        <BarChart label="Orders" data={[{ r: 'EMEA', a: 1, b: 2 }]} categoryKey="r" series={[{ key: 'a', label: 'Online' }, { key: 'b', label: 'Partner' }]} />
        <BarChart label="Returns" data={[{ r: 'EMEA', a: 1 }]} categoryKey="r" series={[{ key: 'a', label: 'Returns' }]} />
      </div>,
    );
    const svgs = [...container.querySelectorAll('figure svg')] as SVGSVGElement[];
    const { svg, width, height } = composeChartSvg(
      [
        { label: 'Orders', svg: svgs[0], legend: [{ key: 'a', label: 'Online', color: 'var(--eui-color-chart-1)' }, { key: 'b', label: 'Partner', color: 'var(--eui-color-chart-2)' }] },
        { label: 'Returns', svg: svgs[1], legend: [] },
      ],
      { title: 'Sales', themeSource: container },
    );
    const texts = [...svg.querySelectorAll(':scope > text')].map((t) => t.textContent);
    expect(texts).toEqual(['Sales', 'Orders', 'Online', 'Partner', 'Returns']);
    expect(svg.getAttribute('viewBox')).toBe(`0 0 ${width} ${height}`);
    // Two embedded charts, without CSS classes (styles are inlined instead).
    const charts = svg.querySelectorAll(':scope > svg');
    expect(charts).toHaveLength(2);
    expect(charts[0].querySelector('[class]')).toBeNull();
    expect(charts[0].getAttribute('y')).not.toBe(charts[1].getAttribute('y'));
    // A background rect makes JPEG output opaque.
    expect(svg.firstElementChild?.tagName).toBe('rect');
  });
});
