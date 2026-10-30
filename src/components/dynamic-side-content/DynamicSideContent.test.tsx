import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '../../../tests/utils';
import { DynamicSideContent } from './DynamicSideContent';

describe('DynamicSideContent', () => {
  it('renders main content and a labelled side region', () => {
    renderWithTheme(<DynamicSideContent sideContent="Tips">Main</DynamicSideContent>);
    expect(screen.getByText('Main')).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Additional information' })).toHaveTextContent('Tips');
  });
  it('can hide the side content', () => {
    renderWithTheme(<DynamicSideContent sideContent="Tips" hideSideContent>Main</DynamicSideContent>);
    expect(screen.queryByRole('complementary')).toBeNull();
  });
});
