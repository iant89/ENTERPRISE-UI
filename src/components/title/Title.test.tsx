import { describe, expect, it } from 'vitest';
import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '../../../tests/utils';
import { Title } from './Title';

describe('Title', () => {
  it('renders the requested heading level and forwards refs', () => {
    const ref = createRef<HTMLHeadingElement>();
    renderWithTheme(<Title ref={ref} level={3}>Orders</Title>);
    expect(screen.getByRole('heading', { level: 3, name: 'Orders' })).toBe(ref.current);
  });
  it('decouples visual size from level', () => {
    renderWithTheme(<Title level={1} size="sm" className="extra">Small h1</Title>);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.className).toMatch(/size-sm/);
    expect(heading).toHaveClass('extra');
  });
});
