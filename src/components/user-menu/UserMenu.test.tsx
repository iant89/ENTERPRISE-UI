import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '../../../tests/utils';
import { Button } from '../button';
import { UserMenu } from './UserMenu';

describe('UserMenu', () => {
  it('shows the account, switches accounts and signs out', async () => {
    const onAccountSwitch = vi.fn();
    const onSignOut = vi.fn();
    const onAction = vi.fn();
    const { user } = renderWithTheme(
      <UserMenu
        trigger={<Button>Alex</Button>}
        account={{ id: 'a', name: 'Alex Kim', email: 'alex@example.com' }}
        otherAccounts={[{ id: 'b', name: 'Alex (Admin)' }]}
        onAccountSwitch={onAccountSwitch}
        items={[{ id: 'settings', label: 'Settings' }]}
        onAction={onAction}
        onSignOut={onSignOut}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Alex' }));
    expect(await screen.findByRole('dialog', { name: 'User menu' })).toHaveTextContent('alex@example.com');
    await user.click(screen.getByRole('menuitem', { name: 'Settings' }));
    expect(onAction).toHaveBeenCalledWith('settings');
    await user.click(screen.getByRole('button', { name: 'Alex' }));
    await user.click(await screen.findByRole('button', { name: 'Switch to Alex (Admin)' }));
    expect(onAccountSwitch).toHaveBeenCalledWith('b');
    await user.click(screen.getByRole('button', { name: 'Alex' }));
    await user.click(await screen.findByRole('button', { name: 'Sign out' }));
    expect(onSignOut).toHaveBeenCalled();
  });
});
