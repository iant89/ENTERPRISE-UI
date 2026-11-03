import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { SearchResultsPage } from './SearchResultsPage';

const types = [{ id: 'supplier', label: 'Suppliers' }, { id: 'order', label: 'Purchase orders' }];
const results = [
  { id: '1', type: 'supplier', title: 'Northwind Components', description: 'Valves and fittings, Hamburg', href: '#s1' },
  { id: '2', type: 'order', title: 'PO 4500017321', description: 'Valves for line 3', href: '#o1' },
];

describe('SearchResultsPage', () => {
  it('shows counts, facets and highlighted results', async () => {
    const onSearch = vi.fn();
    const { user, container } = renderWithTheme(<SearchResultsPage query="valves" onSearch={onSearch} results={results} types={types} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Search results for “valves”');
    expect(screen.getByRole('status')).toHaveTextContent('2 results');
    expect(container.querySelectorAll('mark')).toHaveLength(2);
    await user.click(screen.getByRole('checkbox', { name: /Purchase orders/ }));
    expect(screen.getAllByRole('listitem').filter((li) => li.closest('ol'))).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('1 result');
    const search = within(screen.getByRole('search')).getByRole('searchbox');
    await user.clear(search);
    await user.type(search, 'pumps{Enter}');
    expect(onSearch).toHaveBeenCalledWith('pumps');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('shows empty, error and paging states', async () => {
    const onRetry = vi.fn();
    const onLoadMore = vi.fn();
    const { user, rerender } = renderWithTheme(<SearchResultsPage query="xyz" onSearch={vi.fn()} results={[]} types={types} />);
    expect(screen.getByText('No results for “xyz”.')).toBeInTheDocument();
    rerender(<SearchResultsPage query="xyz" onSearch={vi.fn()} results={[]} types={types} error onRetry={onRetry} />);
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
    rerender(<SearchResultsPage query="valves" onSearch={vi.fn()} results={results} types={types} total={40} onLoadMore={onLoadMore} />);
    expect(screen.getByRole('status')).toHaveTextContent('Showing 2 of 40 results');
    await user.click(screen.getByRole('button', { name: 'Show more results' }));
    expect(onLoadMore).toHaveBeenCalled();
  });
});
