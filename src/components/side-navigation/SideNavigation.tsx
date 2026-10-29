import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useState,
  type HTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { ChevronDown } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { useAppShell } from '../../layouts/app-shell/AppShellContext';
import { Badge } from '../badge';
import { DropdownMenu } from '../dropdown-menu';
import { Tooltip } from '../tooltip';
import styles from './SideNavigation.module.css';

interface SideNavContextValue {
  activeId?: string;
  collapsed: boolean;
  onNavigate?: (id: string, event: MouseEvent) => void;
}

const SideNavContext = createContext<SideNavContextValue>({ collapsed: false });

export interface SideNavigationProps extends HTMLAttributes<HTMLElement> {
  /** Id of the current page's NavigationItem. */
  activeId?: string;
  /** Called when an item is chosen. Call `event.preventDefault()` to handle routing yourself. */
  onNavigate?: (id: string, event: MouseEvent) => void;
  /** Icon-only mode. Defaults to the AppShell state. */
  collapsed?: boolean;
  /** Items pinned to the bottom (e.g. Settings, Help). */
  footer?: ReactNode;
  /** @default 'Main navigation' */
  'aria-label'?: string;
  children: ReactNode;
}

/**
 * Vertical application navigation with icons, nested expandable items,
 * section groups, active-route indication and an icon-only collapsed mode.
 * Compose it from NavigationItem and NavigationGroup.
 */
export function SideNavigation({ activeId, onNavigate, collapsed, footer, className, children, 'aria-label': ariaLabel = 'Main navigation', ...rest }: SideNavigationProps) {
  const shell = useAppShell();
  const isCollapsed = collapsed ?? shell?.navCollapsed ?? false;
  const navigate = (id: string, event: MouseEvent) => {
    onNavigate?.(id, event);
    if (shell?.isMobile) shell.setMobileNavOpen(false);
  };
  return (
    <SideNavContext.Provider value={{ activeId, collapsed: isCollapsed, onNavigate: navigate }}>
      <nav aria-label={ariaLabel} className={cx(styles.nav, isCollapsed && styles.collapsed, className)} {...rest}>
        <ul className={cx(styles.list, styles.main)}>{children}</ul>
        {footer && <ul className={cx(styles.list, styles.footer)}>{footer}</ul>}
      </nav>
    </SideNavContext.Provider>
  );
}

export interface NavigationGroupProps {
  /** Section heading. */
  label: string;
  children: ReactNode;
}

/** A labelled section of navigation items. */
export function NavigationGroup({ label, children }: NavigationGroupProps) {
  const id = `navgroup-${label.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <li className={styles.group}>
      <div id={id} className={styles.groupLabel}>
        {label}
      </div>
      <ul className={styles.list} aria-labelledby={id}>
        {children}
      </ul>
    </li>
  );
}

export interface NavigationItemProps {
  /** Unique id, compared with `activeId`. */
  id: string;
  label: string;
  icon?: ReactNode;
  /** Link target. Items without `href` render as buttons. */
  href?: string;
  /** Count shown as a badge (a dot in collapsed mode). */
  badge?: number;
  /** Nested NavigationItems make this item an expandable section. */
  children?: ReactNode;
  /** Initial expanded state for sections. Defaults to expanded when it contains the active item. */
  defaultExpanded?: boolean;
}

const childItems = (children: ReactNode) =>
  Children.toArray(children).filter((c): c is ReactElement<NavigationItemProps> => isValidElement(c)).map((c) => c.props);

const containsId = (children: ReactNode, id?: string): boolean =>
  !!id && childItems(children).some((c) => c.id === id || containsId(c.children, id));

/** A navigation link, or an expandable section when it has children. */
export function NavigationItem({ id, label, icon, href, badge, children, defaultExpanded }: NavigationItemProps) {
  const { activeId, collapsed, onNavigate } = useContext(SideNavContext);
  const hasChildren = childItems(children).length > 0;
  const containsActive = hasChildren && containsId(children, activeId);
  const [expanded, setExpanded] = useState(defaultExpanded ?? containsActive);
  const isActive = activeId === id;

  const inner = (
    <>
      {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
      <span className={styles.label}>{label}</span>
      {badge !== undefined && badge > 0 && (
        <>
          <Badge className={styles.badge} count={badge} tone="information" aria-hidden="true" />
          <span className="eui-visually-hidden">, {badge} new</span>
        </>
      )}
      {badge !== undefined && badge > 0 && <span className={styles.dotBadge} aria-hidden="true" />}
      {hasChildren && <span className={styles.chevron} aria-hidden="true"><ChevronDown /></span>}
    </>
  );

  const withTooltip = (el: ReactElement) => (collapsed ? <Tooltip content={label} placement="right">{el}</Tooltip> : el);

  if (hasChildren) {
    if (collapsed) {
      const items = childItems(children).map((c) => ({ id: c.id, label: c.label, href: c.href, icon: c.icon }));
      return (
        <li className={cx(containsActive && styles.containsActive)}>
          <DropdownMenu
            placement="right-start"
            aria-label={label}
            items={items}
            onAction={(childId) => onNavigate?.(childId, { preventDefault() {} } as MouseEvent)}
            trigger={
              <button type="button" className={styles.item} aria-label={label} title={label}>
                {inner}
              </button>
            }
          />
        </li>
      );
    }
    return (
      <li className={cx(expanded && styles.expanded, containsActive && !expanded && styles.containsActive)}>
        <button type="button" className={styles.item} aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          {inner}
        </button>
        {expanded && <ul className={styles.sublist}>{children}</ul>}
      </li>
    );
  }

  const common = {
    className: styles.item,
    'aria-current': isActive ? ('page' as const) : undefined,
    'aria-label': collapsed ? label : undefined,
    onClick: (event: MouseEvent) => onNavigate?.(id, event),
  };
  return <li>{withTooltip(href ? <a href={href} {...common}>{inner}</a> : <button type="button" {...common}>{inner}</button>)}</li>;
}
