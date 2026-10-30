import { describe, expect, it } from 'vitest';
import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '../../../tests/utils';
import { Text } from './Text';

describe('Text', () => {
  it('renders the requested element and forwards refs', () => {
    const ref = createRef<HTMLElement>();
    renderWithTheme(<Text ref={ref} as="p">Hello</Text>);
    expect(ref.current?.tagName).toBe('P');
    expect(screen.getByText('Hello')).toBe(ref.current);
  });
  it('clamps lines and shows an empty indicator', () => {
    renderWithTheme(<><Text maxLines={2}>Long</Text><Text emptyIndicator="—">{''}</Text></>);
    expect(screen.getByText('Long').className).toMatch(/clamp/);
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
