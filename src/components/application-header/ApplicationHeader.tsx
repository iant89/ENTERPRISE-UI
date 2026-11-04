import { useEffect, useLayoutEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import {
  AiIcon, BellIcon, CloseCommandFieldIcon, GridIcon, Menu2Icon, NavBackIcon, OpenCommandFieldIcon, OverflowIcon, SearchIcon, SettingsIcon, SysHelpIcon,
} from '../../icons';
import { cx } from '../../utilities/cx';
import { useAppShell } from '../../layouts/app-shell/AppShellContext';
import { Avatar } from '../avatar';
import { Badge } from '../badge';
import { DropdownMenu } from '../dropdown-menu';
import { IconButton } from '../icon-button';
import type { MenuEntry } from '../menu';
import { Popover } from '../popover';
import { ProductSwitch, type ProductSwitchItem } from '../product-switch';
import styles from './ApplicationHeader.module.css';

export interface ApplicationHeaderUser {
  name: string;
  email?: string;
  role?: string;
  avatarSrc?: string;
}

/** An element in the additional context area, such as a system Tag or a context selector. */
export interface ShellBarContextItem {
  /** Unique ID, reported by `onContextVisibilityChange` when the item is hidden. */
  id: string;
  /** The element to show. */
  content: ReactNode;
  /** Higher-priority items stay visible longer as space decreases. @default 0 */
  priority?: number;
  /** Container: after the branding (`start`) or before the shell actions (`end`). @default 'start' */
  align?: 'start' | 'end';
}

/** A product-defined shell action. Moves into the overflow menu when space runs out. */
export interface ShellBarAction {
  id: string;
  /** Accessible name, tooltip and overflow menu text. */
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  /** Counter badge, for example unread items. */
  count?: number;
}

export interface ApplicationHeaderLabels {
  openNavigation: string;
  expandNavigation: string;
  collapseNavigation: string;
  back: string;
  search: string;
  closeSearch: string;
  assistant: string;
  notifications: (count?: number) => string;
  help: string;
  productSwitch: string;
  more: (badges: number) => string;
  userMenu: (name: string) => string;
  settings: string;
}

const defaultLabels: ApplicationHeaderLabels = {
  openNavigation: 'Open navigation',
  expandNavigation: 'Expand navigation',
  collapseNavigation: 'Collapse navigation',
  back: 'Back',
  search: 'Search',
  closeSearch: 'Close search',
  assistant: 'AI assistant',
  notifications: (count) => (count ? `Notifications, ${count} unread` : 'Notifications'),
  help: 'Help',
  productSwitch: 'Products',
  more: (badges) => (badges ? `More, ${badges} with new items` : 'More'),
  userMenu: (name) => `User menu for ${name}`,
  settings: 'Settings',
};

export interface ApplicationHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Product identifier, shown next to the logo. Hidden first among the branding when space is short. */
  productName: string;
  /** Secondary title, e.g. the current app or tenant. */
  secondaryTitle?: string;
  /** Logo element (SVG or img). */
  logo?: ReactNode;
  /** Makes the branding a link to the product home page. */
  homeHref?: string;
  /**
   * Shows a Back button. Prefer the browser's Back button: pass this only when it can't be relied on,
   * and only while there is back history in the product (not on first launch or a deep link).
   */
  onBack?: () => void;
  /** Additional context area: product-wide elements such as system tags, in a start and an end container. */
  context?: ShellBarContextItem[];
  /** Called with the IDs of context items hidden for lack of space, so the app can show a compact version. */
  onContextVisibilityChange?: (hiddenIds: string[]) => void;
  /** Global search, typically a SearchField. Expanded when there is room, otherwise behind a Search button. */
  search?: ReactNode;
  /** Shows the AI assistant button and is called when it is activated. */
  onAssistantClick?: () => void;
  /** Unread notification count. */
  notificationCount?: number;
  /** Notification panel content (shown in a popover). */
  notifications?: ReactNode;
  /** Called when the user activates the notifications button. The button is shown only when this or `notifications` is set. */
  onNotificationsClick?: () => void;
  /** Product-defined actions. Add only frequently used ones; they move into the overflow menu when space runs out. */
  additionalActions?: ShellBarAction[];
  /** Custom content before the shell actions. It never moves into the overflow menu; prefer `additionalActions`. */
  actions?: ReactNode;
  /** Help menu items. Help is always shown: provide these or `onHelpClick`. */
  helpItems?: MenuEntry[];
  /** Called with the ID of the help menu entry the user chose. */
  onHelpAction?: (id: string) => void;
  /** Called when Help is activated and there are no `helpItems`. */
  onHelpClick?: () => void;
  /** Adds a Settings entry at the top of the user menu. */
  onSettingsClick?: () => void;
  /** Signed-in user. The profile (user menu) is always shown. */
  user: ApplicationHeaderUser;
  /** User profile menu items. */
  userMenuItems?: MenuEntry[];
  /** Called with the ID of the user menu entry the user chose. */
  onUserAction?: (id: string) => void;
  /** Products to switch to. Shows the product switch button. */
  productSwitchItems?: ProductSwitchItem[];
  /** Called when a product switch item is chosen. */
  onProductSwitchItemClick?: (item: ProductSwitchItem) => void;
  /** Show the navigation toggle (when inside an AppShell with navigation). @default true */
  showNavToggle?: boolean;
  /** Text overrides. */
  labels?: Partial<ApplicationHeaderLabels>;
}

const GAP = 8;
const SEARCH_MIN = 240;
const SETTINGS_ID = '__eui-settings';
const HELP_PREFIX = '__eui-help:';

/** Collapse steps, applied in order as the header gets narrower (Fiori shell bar responsiveness). */
interface Layout {
  searchCollapsed: boolean;
  actionsInOverflow: boolean;
  hiddenContext: Set<string>;
  brandTextHidden: boolean;
  searchInOverflow: boolean;
}
const FULL: Layout = { searchCollapsed: false, actionsInOverflow: false, hiddenContext: new Set(), brandTextHidden: false, searchInOverflow: false };

/**
 * Top application bar (Fiori shell bar): branding, additional context, global search, AI assistant,
 * notifications, product actions, help, product switch and the user menu. As space decreases it
 * collapses search, moves actions into an overflow menu, hides context items by priority and then
 * the product name. Toggles the AppShell navigation.
 */
export function ApplicationHeader({
  productName, secondaryTitle, logo, homeHref, onBack, context = [], onContextVisibilityChange, search, onAssistantClick,
  notificationCount, notifications, onNotificationsClick, additionalActions = [], actions, helpItems, onHelpAction, onHelpClick,
  onSettingsClick, user, userMenuItems, onUserAction, productSwitchItems, onProductSwitchItemClick, showNavToggle = true, labels,
  className, ...rest
}: ApplicationHeaderProps) {
  const text = { ...defaultLabels, ...labels };
  const shell = useAppShell();
  const headerRef = useRef<HTMLElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [available, setAvailable] = useState(0);
  const [layout, setLayout] = useState<Layout>(FULL);

  const hasNav = showNavToggle && !!shell?.hasNavigation;
  const hasNotifications = notificationCount !== undefined || notifications != null || !!onNotificationsClick;
  const overflowables = (onAssistantClick ? 1 : 0) + additionalActions.length + 1; // + Help
  const byPriority = [...context].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => setAvailable(header.clientWidth));
    observer.observe(header);
    setAvailable(header.clientWidth);
    return () => observer.disconnect();
  }, []);

  // Pick the first collapse step whose content fits. Widths come from a hidden measuring layer, whose
  // content can change with any prop, so this runs after every render; setLayout only updates when
  // the chosen step changes, which cannot loop because the step does not affect the measured widths.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const measure = measureRef.current;
    const header = headerRef.current;
    if (!measure || !header || available === 0) { setLayout((l) => (l === FULL ? l : FULL)); return; }
    const widths = new Map<string, number>();
    measure.querySelectorAll<HTMLElement>('[data-measure]').forEach((el) => widths.set(el.dataset.measure!, el.offsetWidth));
    const w = (key: string) => widths.get(key) ?? 0;
    const icon = w('icon') || 36;
    const style = getComputedStyle(header);
    const padding = (parseFloat(style.paddingInlineStart) || 0) + (parseFloat(style.paddingInlineEnd) || 0);
    const contextWidth = (ids: Set<string>) => context.filter((c) => !ids.has(c.id)).reduce((sum, c) => sum + w(`ctx:${c.id}`) + GAP, 0);
    const base = padding + w('logo') + GAP * 2 + w('actions') + GAP
      + (icon + GAP) * ((hasNav ? 1 : 0) + (onBack ? 1 : 0) + (hasNotifications ? 1 : 0) + (productSwitchItems?.length ? 1 : 0) + 1);
    const required = (l: Layout) => base
      + (l.brandTextHidden ? 0 : w('brandText') + GAP)
      + contextWidth(l.hiddenContext)
      + (search ? (l.searchInOverflow ? 0 : l.searchCollapsed ? icon + GAP : SEARCH_MIN + GAP) : 0)
      + (l.actionsInOverflow ? icon + GAP : overflowables * (icon + GAP));

    const steps: Layout[] = [FULL];
    let step: Layout = FULL;
    const push = (change: Partial<Layout>) => { step = { ...step, ...change }; steps.push(step); };
    if (search) push({ searchCollapsed: true });
    push({ actionsInOverflow: true });
    // Context items hide from lowest to highest priority; the top one stays until search has moved into the overflow.
    const top = byPriority[byPriority.length - 1];
    for (const item of byPriority.slice(0, -1)) push({ hiddenContext: new Set([...step.hiddenContext, item.id]) });
    push({ brandTextHidden: true });
    if (search) push({ searchInOverflow: true });
    if (top) push({ hiddenContext: new Set([...step.hiddenContext, top.id]) });
    const next = steps.find((s) => required(s) <= available) ?? steps[steps.length - 1];
    setLayout((prev) => (sameLayout(prev, next) ? prev : next));
  });

  const hiddenKey = [...layout.hiddenContext].sort().join(',');
  const visibilityCallback = useRef(onContextVisibilityChange);
  visibilityCallback.current = onContextVisibilityChange;
  const firstReport = useRef(true);
  useEffect(() => {
    if (firstReport.current && !hiddenKey) { firstReport.current = false; return; }
    firstReport.current = false;
    visibilityCallback.current?.(hiddenKey ? hiddenKey.split(',') : []);
  }, [hiddenKey]);

  useEffect(() => { if (!search || (!layout.searchCollapsed && !layout.searchInOverflow)) setSearchOpen(false); }, [search, layout.searchCollapsed, layout.searchInOverflow]);

  const navToggle = hasNav && shell && (
    <IconButton
      icon={shell.isMobile ? <Menu2Icon /> : shell.navCollapsed ? <OpenCommandFieldIcon /> : <CloseCommandFieldIcon />}
      label={shell.isMobile ? text.openNavigation : shell.navCollapsed ? text.expandNavigation : text.collapseNavigation}
      aria-expanded={shell.isMobile ? shell.mobileNavOpen : !shell.navCollapsed}
      aria-controls={shell.isMobile ? undefined : shell.navId}
      neutral
      onClick={shell.toggleNav}
    />
  );

  const brandText = (
    <>
      <span className={styles.product}>{productName}</span>
      {secondaryTitle && <span className={styles.secondary}>{secondaryTitle}</span>}
    </>
  );
  const brandContent = (
    <>
      {logo && <span className={styles.logo} aria-hidden="true">{logo}</span>}
      {layout.brandTextHidden ? <span className={styles.visuallyHidden}>{productName}</span> : brandText}
    </>
  );

  const bellButton = <IconButton icon={<BellIcon />} label={text.notifications(notificationCount)} neutral hideTitle={!!notifications} onClick={notifications ? undefined : onNotificationsClick} />;
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

  const helpButton = helpItems && helpItems.length > 0 ? (
    <DropdownMenu placement="bottom-end" items={helpItems} onAction={onHelpAction} trigger={<IconButton icon={<SysHelpIcon />} label={text.help} neutral hideTitle />} />
  ) : (
    <IconButton icon={<SysHelpIcon />} label={text.help} neutral onClick={onHelpClick} />
  );

  const withCount = (action: ShellBarAction) => (
    <span key={action.id} className={styles.notification}>
      <IconButton icon={action.icon} label={action.count ? `${action.label}, ${action.count}` : action.label} neutral onClick={action.onClick} />
      {!!action.count && <Badge className={styles.count} count={action.count} tone="error" aria-hidden="true" />}
    </span>
  );

  // Overflow menu: search (last resort), assistant, product actions and help, in bar order.
  const overflowItems: MenuEntry[] = [];
  const overflowHandlers = new Map<string, () => void>();
  const addOverflow = (id: string, label: string, icon: ReactNode, run?: () => void) => {
    overflowItems.push({ id, label, icon });
    if (run) overflowHandlers.set(id, run);
  };
  if (search && layout.searchInOverflow) addOverflow('__eui-search', text.search, <SearchIcon />, () => setSearchOpen(true));
  let overflowBadges = 0;
  let overflowCount = 0;
  if (layout.actionsInOverflow) {
    if (onAssistantClick) addOverflow('__eui-assistant', text.assistant, <AiIcon />, onAssistantClick);
    for (const a of additionalActions) {
      if (a.count) { overflowBadges++; overflowCount = a.count; }
      addOverflow(`__eui-action:${a.id}`, a.count ? `${a.label} (${a.count})` : a.label, a.icon, a.onClick);
    }
    if (helpItems && helpItems.length > 0) {
      overflowItems.push({ type: 'label', label: text.help });
      for (const entry of helpItems) {
        if ('type' in entry && entry.type) overflowItems.push(entry);
        else if ('id' in entry) {
          const id = `${HELP_PREFIX}${entry.id}`;
          overflowItems.push({ ...entry, id });
          overflowHandlers.set(id, () => onHelpAction?.(entry.id));
        }
      }
    } else addOverflow('__eui-help', text.help, <SysHelpIcon />, onHelpClick);
  }
  const overflow = overflowItems.length > 0 && (
    <span className={styles.notification}>
      <DropdownMenu
        placement="bottom-end"
        aria-label={text.more(0)}
        items={overflowItems}
        onAction={(id) => overflowHandlers.get(id)?.()}
        trigger={<IconButton icon={<OverflowIcon />} label={text.more(overflowBadges)} neutral hideTitle />}
      />
      {overflowBadges === 1 && <Badge className={styles.count} count={overflowCount} tone="error" aria-hidden="true" />}
      {overflowBadges > 1 && <Badge className={styles.dotBadge} dot tone="error" aria-hidden="true" />}
    </span>
  );

  const contextItems = (align: 'start' | 'end') => {
    const items = context.filter((c) => (c.align ?? 'start') === align);
    if (items.length === 0) return null;
    return (
      <div className={cx(styles.context, align === 'end' && styles.contextEnd)}>
        {items.map((c) => <div key={c.id} className={cx(styles.contextItem, layout.hiddenContext.has(c.id) && styles.hidden)}>{c.content}</div>)}
      </div>
    );
  };

  const searchExpanded = !!search && !layout.searchCollapsed && !layout.searchInOverflow;

  return (
    <header
      ref={headerRef}
      className={cx(styles.header, searchOpen && styles.searchOpen, className)}
      {...rest}
    >
      <div className={styles.start}>
        {navToggle}
        {onBack && <IconButton icon={<NavBackIcon />} label={text.back} neutral onClick={onBack} />}
        {homeHref ? (
          <a className={styles.brand} href={homeHref} aria-label={layout.brandTextHidden ? productName : undefined}>
            {brandContent}
          </a>
        ) : (
          <span className={styles.brand}>{brandContent}</span>
        )}
        {contextItems('start')}
      </div>
      {search && (
        <div className={cx(styles.search, !searchExpanded && styles.searchFloating, !searchExpanded && !searchOpen && styles.hidden)} role="search">
          {search}
        </div>
      )}
      <div className={styles.end}>
        {contextItems('end')}
        {actions}
        {search && layout.searchCollapsed && !layout.searchInOverflow && (
          <IconButton icon={<SearchIcon />} label={searchOpen ? text.closeSearch : text.search} aria-expanded={searchOpen} neutral onClick={() => setSearchOpen(!searchOpen)} />
        )}
        {search && layout.searchInOverflow && searchOpen && (
          <IconButton icon={<SearchIcon />} label={text.closeSearch} aria-expanded neutral onClick={() => setSearchOpen(false)} />
        )}
        {!layout.actionsInOverflow && onAssistantClick && <IconButton icon={<AiIcon />} label={text.assistant} neutral onClick={onAssistantClick} />}
        {hasNotifications && bell}
        {!layout.actionsInOverflow && additionalActions.map(withCount)}
        {!layout.actionsInOverflow && helpButton}
        {overflow}
        {productSwitchItems && productSwitchItems.length > 0 && (
          <Popover
            placement="bottom-end"
            aria-label={text.productSwitch}
            width="28rem"
            trigger={<IconButton icon={<GridIcon />} label={text.productSwitch} neutral hideTitle />}
          >
            {(close) => <ProductSwitch items={productSwitchItems} aria-label={text.productSwitch} onItemClick={(item) => { onProductSwitchItemClick?.(item); close(); }} />}
          </Popover>
        )}
        <DropdownMenu
          placement="bottom-end"
          aria-label={text.userMenu(user.name)}
          items={[
            { type: 'label', label: user.email ? `${user.name} · ${user.email}` : user.name },
            ...(onSettingsClick ? [{ id: SETTINGS_ID, label: text.settings, icon: <SettingsIcon /> }, { type: 'separator' as const }] : []),
            ...(userMenuItems ?? []),
          ]}
          onAction={(id) => (id === SETTINGS_ID ? onSettingsClick?.() : onUserAction?.(id))}
          trigger={
            <button type="button" className={styles.profile} aria-label={text.userMenu(user.name)}>
              <Avatar name={user.name} src={user.avatarSrc} size="sm" decorative />
            </button>
          }
        />
      </div>
      <div ref={measureRef} className={styles.measure} aria-hidden="true" inert>
        <span data-measure="icon"><IconButton icon={<SearchIcon />} label={text.search} tabIndex={-1} /></span>
        {logo && <span data-measure="logo" className={styles.logo}>{logo}</span>}
        <span data-measure="brandText" className={styles.brand}>{brandText}</span>
        {actions != null && <span data-measure="actions" className={styles.end}>{actions}</span>}
        {context.map((c) => <span key={c.id} data-measure={`ctx:${c.id}`} className={styles.contextItem}>{c.content}</span>)}
      </div>
    </header>
  );
}

function sameLayout(a: Layout, b: Layout) {
  return a.searchCollapsed === b.searchCollapsed && a.actionsInOverflow === b.actionsInOverflow && a.brandTextHidden === b.brandTextHidden
    && a.searchInOverflow === b.searchInOverflow && a.hiddenContext.size === b.hiddenContext.size && [...a.hiddenContext].every((id) => b.hiddenContext.has(id));
}
