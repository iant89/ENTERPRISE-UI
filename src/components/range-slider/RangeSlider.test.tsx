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
  it('has no axe violations', async () => {
    const { container } = renderWithTheme(<RangeSlider label="Price" />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
