import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { RankedBarList } from './RankedBarList';

const items = [
  { id: 'a', label: 'Contoso', value: 120 },
  { id: 'b', label: 'Fabrikam', value: 340 },
  { id: 'c', label: 'Northwind', value: 90 },
  { id: 'd', label: 'Litware', value: 50 },
];
const rows = () => within(screen.getByRole('list')).getAllByRole('listitem').map((li) => li.textContent);

describe('RankedBarList', () => {
  it('ranks by value, prints values and shares as text, and collapses past the limit', async () => {
    const { user, container } = renderWithTheme(<RankedBarList label="Spend by supplier" items={items} limit={2} showShare showRank formatValue={(v) => `$${v}K`} />);
    expect(rows()).toEqual(['1.Fabrikam$340K56.7% of total', '2.Contoso$120K20% of total']);
    const toggle = screen.getByRole('button', { name: 'Show all 4' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(rows()).toHaveLength(4);
    expect(screen.getByRole('button', { name: 'Show fewer' })).toHaveAttribute('aria-expanded', 'true');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('keeps the given order with sort="none" and reports selection', async () => {
    const onSelect = vi.fn();
    const { user, container } = renderWithTheme(<RankedBarList label="Spend" items={items} sort="none" limit={0} onSelect={onSelect} selectedId="c" />);
    expect(screen.getAllByRole('button').map((b) => b.textContent?.replace(/[\d,]+$/, ''))).toEqual(['Contoso', 'Fabrikam', 'Northwind', 'Litware']);
    expect(screen.getByRole('button', { name: /Northwind/ })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: /Litware/ }));
    expect(onSelect).toHaveBeenCalledWith(items[3]);
    expect(await axeViolations(container)).toEqual([]);
  });

  it('shows an empty message', () => {
    renderWithTheme(<RankedBarList label="Spend" items={[]} />);
    expect(screen.getByText('No data.')).toBeInTheDocument();
  });
});
