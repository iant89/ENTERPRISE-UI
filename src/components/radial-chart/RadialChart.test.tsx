import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { RadialChart } from './RadialChart';

describe('RadialChart', () => {
  it('is a meter with value text', async () => {
    const { container } = renderWithTheme(<RadialChart value={7} max={12} label="Audits" formatValue={(v, m) => `${v} of ${m}`} />);
    const meter = screen.getByRole('meter', { name: 'Audits' });
    expect(meter).toHaveAttribute('aria-valuenow', '7');
    expect(meter).toHaveAttribute('aria-valuemax', '12');
    expect(meter).toHaveAttribute('aria-valuetext', '7 of 12');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('defaults to a percentage and clamps out-of-range values', () => {
    renderWithTheme(<RadialChart value={130} label="Usage" showLabel />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuetext', '130%');
  });
});
