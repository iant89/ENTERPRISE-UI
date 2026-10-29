import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { VirtualTree, type TreeNode } from '../../src';
import { axeViolations, renderWithTheme } from '../utils';
const nodes: TreeNode[] = [{ id: 'root', label: 'Root', children: Array.from({ length: 1000 }, (_, i) => ({ id: `${i}`, label: `Node ${i}` })) }];
describe('VirtualTree', () => {
  it('expands, navigates and selects across a virtual window', async () => {
    const select = vi.fn(); const { user } = renderWithTheme(<VirtualTree aria-label="Hierarchy" nodes={nodes} itemHeight={40} height={160} onSelect={select} />);
    const tree = screen.getByRole('tree'); tree.focus();
    await user.keyboard('{ArrowRight}');
    expect(within(tree).getByRole('treeitem', { name: 'Root' })).toHaveAttribute('aria-expanded', 'true');
    expect(within(tree).getAllByRole('treeitem').length).toBeLessThan(12);
    await user.keyboard('{End}{Enter}');
    await waitFor(() => expect(within(tree).getByRole('treeitem', { name: 'Node 999' })).toBeInTheDocument());
    expect(select).toHaveBeenCalledWith('999', nodes[0].children![999]);
    expect(tree.getAttribute('aria-activedescendant')).toBe(within(tree).getByRole('treeitem', { name: 'Node 999' }).id);
    expect(await axeViolations(tree)).toEqual([]);
    await user.keyboard('{ArrowLeft}');
    expect(within(tree).getByRole('treeitem', { name: 'Root' })).toBeInTheDocument();
  });
  it('supports a full rendering alternative', () => {
    renderWithTheme(<VirtualTree aria-label="Hierarchy" nodes={nodes} defaultExpandedIds={['root']} itemHeight={40} virtualized={false} />);
    expect(screen.getAllByRole('treeitem')).toHaveLength(1001);
  });
});
