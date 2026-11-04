import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../../../tests/utils';
import { RangeSlider } from './RangeSlider';

describe('RangeSlider', () => {
  it('renders two labelled thumbs in a group', () => {
    renderWithTheme(<RangeSlider label="Price" defaultValue={[10, 90]} />);
    expect(screen.getByRole('group', { name: 'Price' })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: 'Minimum' })).toHaveValue('10');
    expect(screen.getByRole('slider', { name: 'Maximum' })).toHaveValue('90');
  });
  it('prevents thumbs from crossing', () => {
    const onChange = vi.fn();
    renderWithTheme(<RangeSlider label="Price" defaultValue={[10, 50]} onChange={onChange} />);
    fireEvent.change(screen.getByRole('slider', { name: 'Minimum' }), { target: { value: '80' } });
    expect(onChange).toHaveBeenLastCalledWith([50, 50]);
  });
  it('draws tick marks and optional formatted labels', () => {
    const { container, rerender } = renderWithTheme(<RangeSlider label="Price" tickInterval={25} />);
    expect(container.querySelectorAll('[class*="tick"]:not([class*="tickLabel"])')).toHaveLength(5);
    expect(screen.queryByText('50')).not.toBeInTheDocument();
    rerender(<RangeSlider label="Price" tickInterval={25} showTickLabels formatValue={(v) => `${v} €`} />);
    expect(screen.getByText('0 €')).toBeInTheDocument();
    expect(screen.getByText('100 €')).toBeInTheDocument();
  });
  it('places both handles on one track and highlights the selected range', () => {
    const { container } = renderWithTheme(<RangeSlider label="Price" defaultValue={[25, 75]} />);
    const slider = container.querySelector<HTMLElement>('[style*="--range-start"]')!;
    expect(slider.style.getPropertyValue('--range-start')).toBe('25%');
    expect(slider.style.getPropertyValue('--range-end')).toBe('75%');
    expect(container.querySelectorAll('svg[data-icon="direction-arrows"]')).toHaveLength(2);
  });
  it('has no axe violations', async () => {
    const { container } = renderWithTheme(<RangeSlider label="Price" />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
