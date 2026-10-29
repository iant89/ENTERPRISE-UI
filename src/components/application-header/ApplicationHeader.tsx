import { useState, type HTMLAttributes, type ReactNode } from 'react';
import { Bell, HelpCircle, Menu as MenuIcon, PanelLeftClose, PanelLeftOpen, Search, Settings } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { useAppShell } from '../../layouts/app-shell/AppShellContext';
import { Avatar } from '../avatar';
import { Badge } from '../badge';
import { DropdownMenu } from '../dropdown-menu';
import { IconButton } from '../icon-button';
import type { MenuEntry } from '../menu';
import { Popover } from '../popover';
import styles from './ApplicationHeader.module.css';

export interface ApplicationHeaderUser {
  name: string;
  email?: string;
  role?: string;
  avatarSrc?: string;
}

export interface ApplicationHeaderProps extends HTMLAttributes<HTMLElement> {
  /** Product name. */
  productName: string;
  /** Secondary title, e.g. the current app or tenant. */
  secondaryTitle?: string;
  /** Logo element (SVG or img). */
  logo?: ReactNode;
  /** Makes the brand area a link home. */
  homeHref?: string;
  /** Global search slot — typically a SearchField. Collapses behind a button on small screens. */
  search?: ReactNode;
  /** Unread notification count. */
  notificationCount?: number;
  /** Notification panel content (shown in a popover). */
  notifications?: ReactNode;
  onNotificationsClick?: () => void;
  /** Help menu items. */
  helpItems?: MenuEntry[];
  onHelpAction?: (id: string) => void;
  onSettingsClick?: () => void;
  /** Signed-in user. */
  user?: ApplicationHeaderUser;
  /** User profile menu items. */
  userMenuItems?: MenuEntry[];
  onUserAction?: (id: string) => void;
  /** Additional actions before the standard ones. */
  actions?: ReactNode;
  /** Show the navigation toggle (when inside an AppShell with navigation). @default true */
  showNavToggle?: boolean;
}

/**
 * Top application bar (Fiori "shell bar"): branding, global search,
 * notifications, help, settings and the user menu. Toggles the AppShell
 * navigation.
 */
export function ApplicationHeader({
  productName, secondaryTitle, logo, homeHref, search, notificationCount, notifications, onNotificationsClick,
  helpItems, onHelpAction, onSettingsClick, user, userMenuItems, onUserAction, actions, showNavToggle = true, className, ...rest
}: ApplicationHeaderProps) {
  const shell = useAppShell();
  const [searchOpen, setSearchOpen] = useState(false);
  const notifLabel = notificationCount ? `Notifications, ${notificationCount} unread` : 'Notifications';

  const navToggle = showNavToggle && shell?.hasNavigation && (
    <IconButton
      icon={shell.isMobile ? <MenuIcon /> : shell.navCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
      label={shell.isMobile ? 'Open navigation' : shell.navCollapsed ? 'Expand navigation' : 'Collapse navigation'}
      aria-expanded={shell.isMobile ? shell.mobileNavOpen : !shell.navCollapsed}
      aria-controls={shell.isMobile ? undefined : shell.navId}
      neutral
      onClick={shell.toggleNav}
    />
  );

  const brandContent = (
    <>
      {logo && <span className={styles.logo} aria-hidden="true">{logo}</span>}
      <span className={styles.product}>{productName}</span>
      {secondaryTitle && <span className={styles.secondary}>{secondaryTitle}</span>}
    </>
  );

  const bellButton = <IconButton icon={<Bell />} label={notifLabel} neutral hideTitle={!!notifications} onClick={notifications ? undefined : onNotificationsClick} />;
  const bell = (
    <span className={styles.notification}>
      {notifications ? (
        <Popover title="Notifications" placement="bottom-end" width="22rem" padded={false} trigger={bellButton}>
          {notifications}
        </Popover>
      ) : (
        bellButton
      )}
      {!!notificationCount && <Badge className={styles.count} count={notificationCount} tone="error" aria-hidden="true" />}
    </span>
  );

  return (
    <header className={cx(styles.header, searchOpen && styles.searchOpen, className)} {...rest}>
      <div className={styles.start}>
        {navToggle}
        {homeHref ? (
          <a className={styles.brand} href={homeHref}>
            {brandContent}
          </a>
        ) : (
          <span className={styles.brand}>{brandContent}</span>
        )}
      </div>
      {search && <div className={styles.search} role="search">{search}</div>}
      <div className={styles.end}>
        {search && (
          <IconButton className={styles.searchToggle} icon={<Search />} label={searchOpen ? 'Close search' : 'Search'} aria-expanded={searchOpen} neutral onClick={() => setSearchOpen(!searchOpen)} />
        )}
        {actions}
        {(notificationCount !== undefined || notifications || onNotificationsClick) && bell}
        {helpItems && helpItems.length > 0 && (
          <span className={styles.hideMobile}>
            <DropdownMenu placement="bottom-end" items={helpItems} onAction={onHelpAction} trigger={<IconButton icon={<HelpCircle />} label="Help" neutral hideTitle />} />
          </span>
        )}
        {onSettingsClick && (
          <span className={styles.hideMobile}>
            <IconButton icon={<Settings />} label="Settings" neutral onClick={onSettingsClick} />
          </span>
        )}
        {user && (
          <DropdownMenu
            placement="bottom-end"
            aria-label="User menu"
            items={[
              { type: 'label', label: user.email ? `${user.name} · ${user.email}` : user.name },
              ...(userMenuItems ?? []),
            ]}
            onAction={onUserAction}
            trigger={
              <button type="button" className={styles.profile} aria-label={`User menu for ${user.name}`}>
                <Avatar name={user.name} src={user.avatarSrc} size="sm" decorative />
              </button>
            }
          />
        )}
      </div>
    </header>
  );
}
