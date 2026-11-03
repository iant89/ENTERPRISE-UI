import { describe, expect, it } from 'vitest';
import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '../../../tests/utils';
import { Sparkline } from './Sparkline';

describe('Sparkline', () => {
  it('summarizes the series when labelled', () => {
    renderWithTheme(<Sparkline values={[4, null, 2, 9]} label="Stock" />);
    expect(screen.getByRole('img')).toHaveAccessibleName('Stock: 3 values from 4 to 9, low 2, high 9');
  });

  it('is decorative without a label and forwards its ref', () => {
    const ref = createRef<SVGSVGElement>();
    const { container } = renderWithTheme(<Sparkline ref={ref} values={[1, 2]} variant="bar" />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(ref.current?.tagName.toLowerCase()).toBe('svg');
    expect(container.querySelectorAll('rect')).toHaveLength(2);
  });

  it('localizes the summary', () => {
    renderWithTheme(<Sparkline values={[1, 3]} label="Umsatz" labels={{ summary: ({ label, last }) => `${label}, zuletzt ${last}` }} />);
    expect(screen.getByRole('img')).toHaveAccessibleName('Umsatz, zuletzt 3');
  });
});
