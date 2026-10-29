import { useEffect, useMemo, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { breakpoints } from '../../tokens';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useControllableState } from '../../hooks/useControllableState';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollLock } from '../../hooks/useScrollLock';
import { useId } from '../../hooks/useId';
import { IconButton } from '../../components/icon-button';
import { AppShellContext, type AppShellContextValue } from './AppShellContext';
import styles from './AppShell.module.css';

export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  /** The application header, usually an ApplicationHeader. */
  header?: ReactNode;
  /** Side navigation, usually a SideNavigation. */
  navigation?: ReactNode;
  /** Optional footer below the main area. */
  footer?: ReactNode;
  /** Controlled collapsed (icon-only) navigation state. */
  navCollapsed?: boolean;
  /** Defaults to collapsed on tablets and expanded on desktops. */
  defaultNavCollapsed?: boolean;
  onNavCollapsedChange?: (collapsed: boolean) => void;
  /** Fill the viewport and scroll the main area (instead of the page). @default true */
  fullHeight?: boolean;
  /** Label for the skip link. @default 'Skip to main content' */
  skipLinkLabel?: string;
  /** Title shown in the mobile navigation drawer. @default 'Navigation' */
  drawerTitle?: string;
  /** Id for the `<main>` element. @default 'main-content' */
  mainId?: string;
  children: ReactNode;
}

/**
 * Responsive application frame: header, side navigation and main content.
 * On phones the navigation becomes a modal drawer; on tablets it starts
 * collapsed to icons. Includes a skip link to the main content.
 */
export function AppShell({
  header, navigation, footer, navCollapsed, defaultNavCollapsed, onNavCollapsedChange, fullHeight = true,
  skipLinkLabel = 'Skip to main content', drawerTitle = 'Navigation', mainId = 'main-content', className, children, ...rest
}: AppShellProps) {
  const isMobile = useMediaQuery(`(max-width: ${breakpoints.sm - 1}px)`);
  const isTablet = useMediaQuery(`(max-width: ${breakpoints.md - 1}px)`);
  const [collapsed, setCollapsed] = useControllableState(navCollapsed, defaultNavCollapsed ?? isTablet, onNavCollapsedChange);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const navId = useId(undefined, 'shell-nav');
  const drawerOpen = isMobile && mobileNavOpen;

  useFocusTrap(drawerRef, drawerOpen);
  useScrollLock(drawerOpen);
  useEffect(() => {
    if (!isMobile) setMobileNavOpen(false);
  }, [isMobile]);

  const value = useMemo<AppShellContextValue>(
    () => ({
      navCollapsed: isMobile ? false : collapsed,
      setNavCollapsed: setCollapsed,
      isMobile,
      mobileNavOpen,
      setMobileNavOpen,
      toggleNav: () => (isMobile ? setMobileNavOpen((o) => !o) : setCollapsed(!collapsed)),
      hasNavigation: navigation != null,
      navId,
    }),
    [collapsed, isMobile, mobileNavOpen, navigation, navId, setCollapsed],
  );

  return (
    <AppShellContext.Provider value={value}>
      <div className={cx(styles.shell, fullHeight && styles.fullHeight, className)} {...rest}>
        <a className={styles.skipLink} href={`#${mainId}`} onClick={(event) => {
          event.preventDefault();
          document.getElementById(mainId)?.focus();
        }}>
          {skipLinkLabel}
        </a>
        {header && <div className={styles.header}>{header}</div>}
        <div className={styles.body}>
          {navigation && !isMobile && (
            <div id={navId} className={cx(styles.nav, collapsed && styles.navCollapsed)}>
              {navigation}
            </div>
          )}
          <main id={mainId} tabIndex={-1} className={styles.main}>
            {children}
            {footer && <div className={styles.footer}>{footer}</div>}
          </main>
        </div>
        {navigation && drawerOpen && (
          <>
            <div className={styles.drawerOverlay} onClick={() => setMobileNavOpen(false)} />
            <div
              ref={drawerRef}
              id={navId}
              role="dialog"
              aria-modal="true"
              aria-label={drawerTitle}
              tabIndex={-1}
              className={styles.drawer}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.stopPropagation();
                  setMobileNavOpen(false);
                }
              }}
            >
              <div className={styles.drawerHeader}>
                <span>{drawerTitle}</span>
                <IconButton icon={<X />} label="Close navigation" neutral onClick={() => setMobileNavOpen(false)} />
              </div>
              {navigation}
            </div>
          </>
        )}
      </div>
    </AppShellContext.Provider>
  );
}
