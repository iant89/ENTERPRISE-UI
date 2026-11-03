import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { DonutChart } from './DonutChart';

describe('DonutChart', () => {
  it('shows value and share in the legend and announces segments', async () => {
    const { user } = renderWithTheme(<DonutChart label="Spend" data={[{ label: 'IT', value: 75 }, { label: 'Travel', value: 25 }]} />);
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['IT75 · 75%', 'Travel25 · 25%']);
    await user.tab();
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(screen.getByRole('group')).toHaveTextContent('Travel: 25 (25%)');
  });

  it('folds segments beyond maxSegments into a localized Other', () => {
    const data = ['A', 'B', 'C', 'D', 'E'].map((label, i) => ({ label, value: 50 - i * 10 }));
    renderWithTheme(<DonutChart label="Parts" data={data} maxSegments={3} labels={{ other: 'Sonstige' }} />);
    expect(screen.getAllByRole('listitem').map((li) => li.firstChild?.nextSibling?.textContent)).toEqual(['A', 'B', 'Sonstige']);
    expect(screen.getByRole('rowheader', { name: 'Sonstige' }).parentElement).toHaveTextContent('Sonstige6040%');
  });

  it('treats an all-zero dataset as empty and passes axe', async () => {
    const { container, rerender } = renderWithTheme(<DonutChart label="Parts" data={[{ label: 'A', value: 0 }]} />);
    expect(screen.getByRole('img', { name: 'Parts: No data' })).toBeInTheDocument();
    rerender(<DonutChart label="Parts" data={[{ label: 'A', value: 1 }, { label: 'B', value: 2 }]} variant="pie" />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
