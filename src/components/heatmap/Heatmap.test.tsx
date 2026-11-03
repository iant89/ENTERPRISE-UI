import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { Heatmap } from './Heatmap';

const props = { label: 'Load', rows: ['Mon', 'Tue'], columns: ['AM', 'PM', 'Night'], values: [[10, 50, null], [30, 90, 5]] };

describe('Heatmap', () => {
  it('exposes a grid whose cells carry their value as text', async () => {
    const { container } = renderWithTheme(<Heatmap {...props} />);
    expect(screen.getByRole('grid', { name: 'Load' })).toBeInTheDocument();
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(6);
    expect(cells[2]).toHaveTextContent('No data');
    expect(cells[4]).toHaveTextContent('90');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('moves a roving focus with the arrow keys and activates cells', async () => {
    const onCellClick = vi.fn();
    const { user } = renderWithTheme(<Heatmap {...props} onCellClick={onCellClick} />);
    await user.tab();
    const cells = screen.getAllByRole('gridcell');
    expect(cells[0]).toHaveFocus();
    await user.keyboard('{ArrowRight}{ArrowDown}');
    expect(cells[4]).toHaveFocus();
    expect(cells.filter((c) => c.tabIndex === 0)).toEqual([cells[4]]);
    await user.keyboard('{End}');
    expect(cells[5]).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onCellClick).toHaveBeenCalledWith({ row: 1, column: 2, value: 5 });
    await user.keyboard('{Control>}{Home}{/Control}');
    expect(cells[0]).toHaveFocus();
  });
});
