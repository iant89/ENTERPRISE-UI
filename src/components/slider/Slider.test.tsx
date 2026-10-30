import { describe, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../../../tests/utils';
import { Slider } from './Slider';

describe('Slider', () => {
  it('renders a labelled range input and forwards refs', () => {
    const ref = createRef<HTMLInputElement>();
    renderWithTheme(<Slider ref={ref} label="Volume" defaultValue={30} />);
    const input = screen.getByRole('slider', { name: 'Volume' });
    expect(input).toHaveValue('30');
    expect(ref.current).toBe(input);
  });
  it('calls onChange with a number and announces formatted value', () => {
    const onChange = vi.fn();
    renderWithTheme(<Slider label="Discount" showValue formatValue={(v) => `${v}%`} defaultValue={10} onChange={onChange} />);
    fireEvent.change(screen.getByRole('slider'), { target: { value: '25' } });
    expect(onChange).toHaveBeenCalledWith(25);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '25%');
    expect(screen.getByText('25%')).toBeInTheDocument();
  });
  it('is controlled', () => {
    renderWithTheme(<Slider aria-label="Level" value={5} max={10} />);
    fireEvent.change(screen.getByRole('slider'), { target: { value: '7' } });
    expect(screen.getByRole('slider')).toHaveValue('5');
  });
  it('has no axe violations', async () => {
    const { container } = renderWithTheme(<Slider label="Volume" />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
