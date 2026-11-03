import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { BulletChart } from './BulletChart';

const ranges = [{ to: 50, tone: 'error' as const, label: 'Below plan' }, { to: 100, tone: 'success' as const, label: 'On plan' }];

describe('BulletChart', () => {
  it('describes actual, target, forecast and range in text', async () => {
    const { container } = renderWithTheme(<BulletChart label="Revenue" value={40} target={80} forecast={60} max={100} ranges={ranges} />);
    expect(screen.getByRole('img')).toHaveAccessibleName('Revenue: actual 40, target 80, forecast 60, Below plan');
    const bars = container.querySelectorAll<HTMLElement>('[class*="bar"]');
    expect(bars[bars.length - 1].style.width).toBe('40%');
    expect(bars[bars.length - 1].style.color).toBe('var(--eui-color-error)');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('clamps values to the scale and lets tone override the range', () => {
    const { container } = renderWithTheme(<BulletChart label="Margin" value={140} max={100} tone="information" hideLabel />);
    const bar = container.querySelector<HTMLElement>('[class*="bar"]')!;
    expect(bar.style.width).toBe('100%');
    expect(bar.style.color).toBe('var(--eui-color-info)');
    expect(screen.queryByText('Margin')).toBeNull();
  });
});
