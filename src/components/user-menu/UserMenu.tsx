import { type ReactElement, type ReactNode } from 'react';
import { Avatar } from '../avatar';
import { Button } from '../button';
import { Menu, type MenuEntry } from '../menu';
import { Popover } from '../popover';
import styles from './UserMenu.module.css';

export interface UserMenuAccount {
  id: string;
  name: string;
  email?: string;
  description?: string;
  avatarSrc?: string;
}

export interface UserMenuProps {
  /** Element that opens the menu, typically an avatar button. */
  trigger: ReactElement;
  /** The signed-in account. */
  account: UserMenuAccount;
  /** Other accounts the user can switch to. */
  otherAccounts?: UserMenuAccount[];
  /** Called with the ID of the account the user switches to. */
  onAccountSwitch?: (id: string) => void;
  /** Menu entries (settings, help…). */
  items?: MenuEntry[];
  /** Called with the ID of the action the user chose. */
  onAction?: (id: string) => void;
  /** Show and handle "Manage account". */
  onManageAccount?: () => void;
  /** Show and handle "Sign out". */
  onSignOut?: () => void;
  /** Extra content under the account header. */
  children?: ReactNode;
  /** Whether it is open. Providing it makes the open state controlled. */
  open?: boolean;
  /** Whether it is open initially when the open state is uncontrolled. */
  defaultOpen?: boolean;
  /** Called with the new open state when the user opens or closes it. */
  onOpenChange?: (open: boolean) => void;
  /** Localized text. */
  labels?: { menu: string; manageAccount: string; signOut: string; otherAccounts: string; switchTo: (name: string) => string };
}

const defaultLabels = { menu: 'User menu', manageAccount: 'Manage account', signOut: 'Sign out', otherAccounts: 'Other accounts', switchTo: (name: string) => `Switch to ${name}` };

/** The signed-in user's account, account switching and personal actions in a popover. */
export function UserMenu({ trigger, account, otherAccounts = [], onAccountSwitch, items = [], onAction, onManageAccount, onSignOut, children, open, defaultOpen, onOpenChange, labels }: UserMenuProps) {
  const text = { ...defaultLabels, ...labels };
  return (
    <Popover trigger={trigger} aria-label={text.menu} placement="bottom-end" open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} width="20rem">
      {(close) => (
        <div className={styles.root}>
          <div className={styles.account}>
            <Avatar name={account.name} src={account.avatarSrc} size="lg" decorative />
            <div className={styles.identity}>
              <strong>{account.name}</strong>
              {account.email && <span className={styles.secondary}>{account.email}</span>}
              {account.description && <span className={styles.secondary}>{account.description}</span>}
            </div>
            {onManageAccount && <Button size="sm" onClick={() => { close(); onManageAccount(); }}>{text.manageAccount}</Button>}
          </div>
          {children}
          {otherAccounts.length > 0 && (
            <section aria-label={text.otherAccounts} className={styles.section}>
              <h3 className={styles.heading}>{text.otherAccounts}</h3>
              <ul className={styles.accounts}>
                {otherAccounts.map((a) => (
                  <li key={a.id}>
                    <button type="button" className={styles.accountButton} aria-label={text.switchTo(a.name)} onClick={() => { close(); onAccountSwitch?.(a.id); }}>
                      <Avatar name={a.name} src={a.avatarSrc} size="sm" decorative />
                      <span>{a.name}{a.email && <span className={styles.secondary}> · {a.email}</span>}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {items.length > 0 && <Menu aria-label={text.menu} items={items} onAction={(id) => { close(); onAction?.(id); }} autoFocus={false} />}
          {onSignOut && <div className={styles.footer}><Button fullWidth onClick={() => { close(); onSignOut(); }}>{text.signOut}</Button></div>}
        </div>
      )}
    </Popover>
  );
}
