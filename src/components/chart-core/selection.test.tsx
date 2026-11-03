import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithTheme } from '../../../tests/utils';
import { BarChart } from '../bar-chart';
import { DonutChart } from '../donut-chart';

const data = [{ r: 'EMEA', v: 1 }, { r: 'APJ', v: 2 }];

describe('chart selection', () => {
  it('selects the active point with Enter and announces that points are selectable', async () => {
    const onSelect = vi.fn();
    const { user } = renderWithTheme(<BarChart label="Orders" data={data} categoryKey="r" series={[{ key: 'v', label: 'V' }]} onSelect={onSelect} />);
    expect(screen.getByRole('group')).toHaveAccessibleDescription(/Press Enter to select the point/);
    await user.tab();
    await user.keyboard('{ArrowRight}{ArrowRight}{Enter}');
    expect(onSelect).toHaveBeenCalledWith({ index: 1, category: 'APJ' });
  });

  it('selects the hovered point on click and dims unselected categories', () => {
    const onSelect = vi.fn();
    const { container } = renderWithTheme(<DonutChart label="Mix" data={[{ label: 'A', value: 1 }, { label: 'B', value: 3 }]} onSelect={onSelect} selectedCategory="B" />);
    const segments = container.querySelectorAll('path');
    expect(segments[0].getAttribute('class')).toMatch(/dimmed/);
    expect(segments[1].getAttribute('class')).not.toMatch(/dimmed/);
    fireEvent.pointerEnter(segments[0]);
    fireEvent.click(segments[0]);
    expect(onSelect).toHaveBeenCalledWith({ index: 0, category: 'A' });
  });

  it('honours an explicit view prop without a container', () => {
    renderWithTheme(<BarChart label="Orders" data={data} categoryKey="r" series={[{ key: 'v', label: 'V' }]} view="table" />);
    expect(screen.queryByRole('group')).toBeNull();
    expect(screen.getByRole('table', { name: 'Orders' }).parentElement).not.toHaveClass('eui-visually-hidden');
  });
});
