import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { TreeSelect } from './TreeSelect';

const nodes = [
  { id: 'c1', label: 'Contoso AG', children: [{ id: 'p1', label: 'Plant Hamburg', children: [{ id: 'cc1', label: 'Assembly' }, { id: 'cc2', label: 'Quality' }] }] },
  { id: 'c2', label: 'Fabrikam SA', children: [{ id: 'p2', label: 'Plant Lyon' }] },
];

describe('TreeSelect', () => {
  it('filters the hierarchy, selects a node and shows its path', async () => {
    const onChange = vi.fn();
    const { user, container } = renderWithTheme(<TreeSelect label="Cost center" nodes={nodes} onChange={onChange} leavesOnly />);
    const trigger = screen.getByRole('button', { name: 'Cost center Select' });
    await user.click(trigger);
    await user.type(screen.getByRole('searchbox', { name: 'Filter' }), 'qual');
    expect(screen.getAllByRole('treeitem').map((t) => t.getAttribute('aria-level'))).toEqual(['1', '2', '3']);
    await user.click(screen.getByText('Quality'));
    expect(onChange).toHaveBeenCalledWith('cc2', expect.objectContaining({ label: 'Quality' }), ['Contoso AG', 'Plant Hamburg', 'Quality']);
    expect(screen.getByRole('button', { name: 'Cost center Contoso AG › Plant Hamburg › Quality' })).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });

  it('only expands parents when leavesOnly is set', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<TreeSelect label="Org unit" nodes={nodes} onChange={onChange} leavesOnly />);
    await user.click(screen.getByRole('button', { name: /Org unit/ }));
    await user.click(screen.getByText('Fabrikam SA'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
