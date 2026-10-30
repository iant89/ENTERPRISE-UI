import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '../../../tests/utils';
import { FlexibleColumnLayout, getColumnWidths } from './FlexibleColumnLayout';

describe('getColumnWidths', () => {
  it('collapses columns on smaller screens', () => {
    expect(getColumnWidths('ThreeColumnsMidExpanded', 'xl')).toEqual([25, 50, 25]);
    expect(getColumnWidths('ThreeColumnsMidExpanded', 'md')).toEqual([0, 67, 33]);
    expect(getColumnWidths('TwoColumnsMidExpanded', 'sm')).toEqual([0, 100, 0]);
  });
});

describe('FlexibleColumnLayout', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('renders labelled columns for the layout on desktop', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: true, media: query, addEventListener() {}, removeEventListener() {} }));
    renderWithTheme(<FlexibleColumnLayout layout="TwoColumnsStartExpanded" startColumn="List" midColumn="Detail" endColumn="More" />);
    expect(screen.getAllByRole('region').map((r) => r.getAttribute('aria-label'))).toEqual(['List', 'Details']);
  });
  it('shows only the last column on phones', () => {
    renderWithTheme(<FlexibleColumnLayout layout="TwoColumnsStartExpanded" startColumn="List" midColumn="Detail" />);
    expect(screen.getAllByRole('region').map((r) => r.getAttribute('aria-label'))).toEqual(['Details']);
  });
});
