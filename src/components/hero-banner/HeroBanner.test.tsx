import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../../../tests/utils';
import { HeroBanner } from './HeroBanner';

describe('HeroBanner', () => {
  it('renders a heading at the requested level with actions', () => {
    renderWithTheme(<HeroBanner title="Welcome" headingLevel={1} subtitle="Start here" actions={<button type="button">Go</button>} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Welcome' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
  });
  it('has no axe violations', async () => {
    const { container } = renderWithTheme(<HeroBanner title="Welcome" media={<span>art</span>} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
