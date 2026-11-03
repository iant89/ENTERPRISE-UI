import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { ProportionBar } from './ProportionBar';

const segments = [{ label: 'On time', value: 3, tone: 'success' as const }, { label: 'Late', value: 1, tone: 'error' as const }];

describe('ProportionBar', () => {
  it('lists value and share in the legend', async () => {
    const { container } = renderWithTheme(<ProportionBar label="Deliveries" segments={segments} />);
    expect(screen.getByRole('group', { name: 'Deliveries' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['On time3 · 75%', 'Late1 · 25%']);
    expect(await axeViolations(container)).toEqual([]);
  });

  it('becomes a summarized image without the legend and shows a remainder for a larger total', () => {
    const { container } = renderWithTheme(<ProportionBar label="Quota" segments={segments} total={8} showLegend={false} />);
    expect(screen.getByRole('img')).toHaveAccessibleName('Quota: On time 3 (38%), Late 1 (13%)');
    expect(container.querySelector('[class*="remainder"]')).not.toBeNull();
  });
});
