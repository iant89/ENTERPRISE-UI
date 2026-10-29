import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../../../tests/utils';
import { Button } from '../button';
import { DropdownMenu } from './DropdownMenu';

const items = [
  { id: 'edit', label: 'Edit' },
  { id: 'copy', label: 'Copy', disabled: true },
  { type: 'separator' as const },
  { id: 'archive', label: 'Archive' },
  { id: 'delete', label: 'Delete', destructive: true },
];

describe('DropdownMenu', () => {
  it('opens from the keyboard and focuses the first item', async () => {
    const { user } = renderWithTheme(<DropdownMenu trigger={<Button>Actions</Button>} items={items} />);
    const trigger = screen.getByRole('button', { name: 'Actions' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    const menu = await screen.findByRole('menu');
    expect(menu).toHaveAccessibleName('Actions');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus());
  });

  it('skips disabled items, wraps, and supports type-ahead', async () => {
    const { user } = renderWithTheme(<DropdownMenu trigger={<Button>Actions</Button>} items={items} />);
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus());
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Archive' })).toHaveFocus();
    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
    await user.keyboard('a');
    expect(screen.getByRole('menuitem', { name: 'Archive' })).toHaveFocus();
  });

  it('activates an item with Enter, closes and restores focus', async () => {
    const onAction = vi.fn();
    const { user } = renderWithTheme(<DropdownMenu trigger={<Button>Actions</Button>} items={items} onAction={onAction} />);
    const trigger = screen.getByRole('button', { name: 'Actions' });
    await user.click(trigger);
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus());
    await user.keyboard('{Enter}');
    expect(onAction).toHaveBeenCalledWith('edit');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('closes with Escape', async () => {
    const { user } = renderWithTheme(<DropdownMenu trigger={<Button>Actions</Button>} items={items} />);
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await screen.findByRole('menu');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('has no axe violations when open', async () => {
    const { user } = renderWithTheme(<DropdownMenu trigger={<Button>Actions</Button>} items={items} />);
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await screen.findByRole('menu');
    expect(await axeViolations(document.body)).toEqual([]);
  });
});
