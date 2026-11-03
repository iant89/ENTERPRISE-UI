import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { KanbanBoard } from './KanbanBoard';

const columns = [{ id: 'todo', title: 'To do' }, { id: 'doing', title: 'Doing', limit: 1 }, { id: 'done', title: 'Done' }];
const items = [
  { id: 'a', columnId: 'todo', name: 'Alpha' },
  { id: 'b', columnId: 'todo', name: 'Bravo' },
  { id: 'c', columnId: 'doing', name: 'Charlie' },
];
const board = (extra = {}) => <KanbanBoard label="Board" columns={columns} defaultItems={items} getItemLabel={(i) => i.name} renderItem={(i) => i.name} {...extra} />;
const column = (name: string) => screen.getByRole('region', { name });
const names = (name: string) => within(column(name)).queryAllByRole('listitem').map((li) => li.textContent);

describe('KanbanBoard', () => {
  it('moves a card across columns with the keyboard and commits on drop', async () => {
    const onMove = vi.fn();
    const { user } = renderWithTheme(board({ onMove }));
    const handle = screen.getByRole('button', { name: 'Move Alpha' });
    handle.focus();
    await user.keyboard(' ');
    expect(handle).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('region', { name: 'Board' })).toHaveTextContent('Picked up Alpha in To do, position 1 of 2.');
    // Moving across columns keeps the row position (here, the top).
    await user.keyboard('{ArrowRight}');
    expect(names('Doing')).toEqual(['Alpha', 'Charlie']);
    expect(screen.getByRole('button', { name: 'Move Alpha' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(names('Doing')).toEqual(['Charlie', 'Alpha']);
    expect(screen.getByRole('button', { name: 'Move Alpha' })).toHaveFocus();
    expect(onMove).not.toHaveBeenCalled();
    await user.keyboard(' ');
    expect(onMove).toHaveBeenCalledWith(expect.objectContaining({ fromColumnId: 'todo', toColumnId: 'doing', index: 1 }));
    expect(screen.getByRole('region', { name: 'Board' })).toHaveTextContent('Dropped Alpha in Doing, position 2 of 2.');
    expect(within(column('Doing')).getByText(/Over limit/)).toBeInTheDocument();
  });

  it('cancels with Escape and restores the original position', async () => {
    const onItemsChange = vi.fn();
    const { user } = renderWithTheme(board({ onItemsChange }));
    screen.getByRole('button', { name: 'Move Bravo' }).focus();
    await user.keyboard(' {ArrowUp}');
    expect(names('To do')).toEqual(['Bravo', 'Alpha']);
    await user.keyboard('{Escape}');
    expect(names('To do')).toEqual(['Alpha', 'Bravo']);
    expect(onItemsChange).not.toHaveBeenCalled();
    expect(screen.getByRole('region', { name: 'Board' })).toHaveTextContent('Move of Bravo cancelled.');
  });

  it('skips columns that canMove forbids', async () => {
    const { user } = renderWithTheme(board({ canMove: (_: unknown, to: string) => to !== 'doing' }));
    screen.getByRole('button', { name: 'Move Alpha' }).focus();
    await user.keyboard(' {ArrowRight} ');
    expect(names('Done')).toEqual(['Alpha']);
    expect(names('Doing')).toEqual(['Charlie']);
  });

  it('labels columns, shows counts and an empty state, and passes axe', async () => {
    const { container } = renderWithTheme(board());
    expect(within(column('To do')).getByText('2')).toBeInTheDocument();
    expect(within(column('Doing')).getByText('1 / 1')).toBeInTheDocument();
    expect(within(column('Done')).getByText('No items')).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });
});
