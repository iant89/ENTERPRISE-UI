import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '../../../tests/utils';
import { Pagination, getPageRange } from './Pagination';
import { Breadcrumbs } from '../breadcrumbs';

describe('getPageRange', () => {
  it('returns all pages when few', () => expect(getPageRange(1, 5)).toEqual([1, 2, 3, 4, 5]));
  it('adds ellipses around the current page', () => expect(getPageRange(10, 20)).toEqual([1, 'ellipsis', 9, 10, 11, 'ellipsis', 20]));
  it('handles edges', () => {
    expect(getPageRange(1, 20)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 20]);
    expect(getPageRange(20, 20)).toEqual([1, 'ellipsis', 16, 17, 18, 19, 20]);
  });
});

describe('Pagination', () => {
  it('marks the current page and navigates', async () => {
    const onPageChange = vi.fn();
    const { user } = renderWithTheme(<Pagination page={2} totalItems={95} pageSize={10} onPageChange={onPageChange} />);
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('11–20 of 95')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
    await user.click(screen.getByRole('button', { name: 'Last page' }));
    expect(onPageChange).toHaveBeenCalledWith(10);
  });
});

describe('Breadcrumbs', () => {
  it('marks the current page and collapses long trails', () => {
    renderWithTheme(
      <Breadcrumbs
        maxItems={3}
        items={[{ label: 'Home', href: '#' }, { label: 'Sales', href: '#s' }, { label: 'Orders', href: '#o' }, { label: 'PO-1001' }]}
      />,
    );
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByText('PO-1001')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Show 2 more' })).toBeInTheDocument();
  });
});
