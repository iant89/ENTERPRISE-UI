import { Avatar, Button, UserMenu } from '@enterprise-ui/react';

export const title = 'User menu';
export const description = 'Account details, account switching and personal actions.';

export default function UserMenuBasic() {
  return (
    <UserMenu
      trigger={<Button icon={<Avatar name="Alex Kim" size="xs" decorative />}>Alex Kim</Button>}
      account={{ id: 'alex', name: 'Alex Kim', email: 'alex.kim@example.com', description: 'Procurement lead' }}
      otherAccounts={[{ id: 'alex-admin', name: 'Alex Kim (Admin)', email: 'admin@example.com' }]}
      items={[{ id: 'settings', label: 'Settings' }, { id: 'help', label: 'Help' }]}
      onManageAccount={() => {}}
      onSignOut={() => {}}
    />
  );
}
