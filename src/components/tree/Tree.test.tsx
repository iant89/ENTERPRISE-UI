import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../../../tests/utils';
import { Tree } from './Tree';
import { TreeTable } from '../tree-table';
import { List } from '../list';

const nodes = [
  { id: 'eu', label: 'Europe', children: [{ id: 'de', label: 'Germany' }, { id: 'fr', label: 'France' }] },
  { id: 'na', label: 'North America', children: [{ id: 'us', label: 'United States' }] },
  { id: 'apac', label: 'Asia Pacific' },
];

describe('Tree', () => {
  it('expands, collapses and navigates with arrow keys', async () => {
    const onSelect = vi.fn();
    const { user } = renderWithTheme(<Tree aria-label="Regions" nodes={nodes} onSelect={onSelect} />);
    const europe = screen.getByRole('treeitem', { name: /Europe/ });
    expect(europe).toHaveAttribute('aria-expanded', 'false');
    europe.focus();
    await user.keyboard('{ArrowRight}');
    expect(europe).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('treeitem', { name: 'Germany' })).toHaveFocus();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onSelect).toHaveBeenCalledWith('fr', expect.objectContaining({ label: 'France' }));
    await user.keyboard('{ArrowLeft}');
    expect(europe).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(europe).toHaveAttribute('aria-expanded', 'false');
    await user.keyboard('{End}');
    expect(screen.getByRole('treeitem', { name: 'Asia Pacific' })).toHaveFocus();
    await user.keyboard('n');
    expect(screen.getByRole('treeitem', { name: /North America/ })).toHaveFocus();
  });

  it('has no axe violations', async () => {
    const { container } = renderWithTheme(<Tree aria-label="Regions" nodes={nodes} defaultExpandedIds={['eu']} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('TreeTable', () => {
  const rows = [
    { id: '1', name: 'Plant Berlin', cost: 100, children: [{ id: '1.1', name: 'Line A', cost: 60 }] },
    { id: '2', name: 'Plant Lyon', cost: 80 },
  ];
  const columns = [
    { id: 'name', header: 'Name', accessor: 'name' as const },
    { id: 'cost', header: 'Cost', accessor: 'cost' as const, align: 'end' as const },
  ];

  it('is a treegrid with expandable rows', async () => {
    const { user } = renderWithTheme(<TreeTable aria-label="Cost centers" columns={columns} data={rows} getRowId={(r) => r.id} />);
    expect(screen.getByRole('treegrid', { name: 'Cost centers' })).toBeInTheDocument();
    const [, first] = screen.getAllByRole('row');
    expect(first).toHaveAttribute('aria-expanded', 'false');
    first.focus();
    await user.keyboard('{ArrowRight}');
    expect(first).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Line A')).toBeInTheDocument();
    await user.keyboard('{ArrowDown}');
    expect(screen.getAllByRole('row')[2]).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(first).toHaveFocus();
  });
});

describe('List', () => {
  const items = [
    { id: 'a', title: 'Alpha', description: 'First' },
    { id: 'b', title: 'Bravo' },
    { id: 'c', title: 'Charlie', disabled: true },
  ];

  it('supports single selection with arrow keys', async () => {
    const onSelectionChange = vi.fn();
    const { user } = renderWithTheme(<List aria-label="Letters" items={items} selectionMode="single" onSelectionChange={onSelectionChange} />);
    const options = screen.getAllByRole('option');
    options[0].focus();
    await user.keyboard('{ArrowDown}');
    expect(onSelectionChange).toHaveBeenLastCalledWith(['b']);
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('renders navigable items as buttons', async () => {
    const onItemClick = vi.fn();
    const { user } = renderWithTheme(<List aria-label="Letters" items={items} onItemClick={onItemClick} />);
    await user.click(screen.getByRole('button', { name: /Alpha/ }));
    expect(onItemClick).toHaveBeenCalledWith(items[0]);
  });
});
