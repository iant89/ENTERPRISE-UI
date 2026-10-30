import { createContext, forwardRef, useCallback, useContext, useEffect, useMemo, useState, type ButtonHTMLAttributes, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { getNavigationIndex } from '../../utilities/keyboard';
import { useControllableState } from '../../hooks/useControllableState';
import { useId } from '../../hooks/useId';
import styles from './Tabs.module.css';

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  baseId: string;
  activation: 'automatic' | 'manual';
  variant: 'line' | 'contained';
  /** Values of mounted TabPanels, so tabs only reference panels that exist. */
  panels: Set<string>;
  registerPanel: (value: string) => () => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);
const useTabs = () => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tab components must be used inside <Tabs>.');
  return ctx;
};
const tabId = (base: string, value: string) => `${base}-tab-${value}`;
const panelId = (base: string, value: string) => `${base}-panel-${value}`;

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Controlled selected tab value. */
  value?: string;
  /** Value of the tab selected initially when the selection is uncontrolled. */
  defaultValue?: string;
  /** Called with the value of the tab the user selects. */
  onValueChange?: (value: string) => void;
  /**
   * `automatic` selects a tab as it receives focus; `manual` requires
   * Enter/Space (use when panels are expensive to render).
   * @default 'automatic'
   */
  activation?: 'automatic' | 'manual';
  /** `contained` places tabs on a surface bar (object pages). @default 'line' */
  variant?: 'line' | 'contained';
  /** Content rendered inside the tabs. */
  children: ReactNode;
}

/** Organises content into panels, one visible at a time. */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { value, defaultValue = '', onValueChange, activation = 'automatic', variant = 'line', className, children, ...rest },
  ref,
) {
  const [current, setCurrent] = useControllableState(value, defaultValue, onValueChange);
  const baseId = useId(undefined, 'tabs');
  const [panels, setPanels] = useState<Set<string>>(() => new Set());
  const registerPanel = useCallback((panel: string) => {
    setPanels((prev) => new Set(prev).add(panel));
    return () =>
      setPanels((prev) => {
        const next = new Set(prev);
        next.delete(panel);
        return next;
      });
  }, []);
  const ctx = useMemo(
    () => ({ value: current, setValue: setCurrent, baseId, activation, variant, panels, registerPanel }),
    [current, setCurrent, baseId, activation, variant, panels, registerPanel],
  );
  return (
    <TabsContext.Provider value={ctx}>
      <div ref={ref} className={cx(styles.tabs, className)} {...rest}>
        {children}
      </div>
    </TabsContext.Provider>
  );
});

export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  /** Accessible name for the tab list. */
  'aria-label'?: string;
  /** Content rendered inside the tab list. */
  children: ReactNode;
}

/** Container for Tab buttons (`role="tablist"`). Arrow keys, Home and End move between tabs. */
export const TabList = forwardRef<HTMLDivElement, TabListProps>(function TabList({ className, children, onKeyDown, ...rest }, ref) {
  const { activation, variant } = useTabs();
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
    const current = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (current < 0) return;
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const next = getNavigationIndex(event.key, current, tabs.length, { orientation: 'horizontal', isDisabled: (i) => tabs[i].disabled, rtl });
    if (next === null) return;
    event.preventDefault();
    tabs[next].focus();
    if (activation === 'automatic') tabs[next].click();
  };
  return (
    <div ref={ref} role="tablist" aria-orientation="horizontal" className={cx(styles.list, variant === 'contained' && styles.contained, className)} onKeyDown={handleKeyDown} {...rest}>
      {children}
    </div>
  );
});

export interface TabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  /** Unique value that identifies the tab and links it to its panel. */
  value: string;
  /** Icon shown before the text. */
  icon?: ReactNode;
  /** Item count shown after the label, e.g. `(12)`. */
  count?: number;
  /** Content rendered inside the tab. */
  children: ReactNode;
}

/** A single tab. Selected tab is in the tab order; the others are reached with arrow keys. */
export const Tab = forwardRef<HTMLButtonElement, TabProps>(function Tab({ value, icon, count, className, children, onClick, ...rest }, ref) {
  const ctx = useTabs();
  const selected = ctx.value === value;
  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={tabId(ctx.baseId, value)}
      aria-selected={selected}
      aria-controls={ctx.panels.has(value) ? panelId(ctx.baseId, value) : undefined}
      tabIndex={selected ? 0 : -1}
      className={cx(styles.tab, className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) ctx.setValue(value);
      }}
      {...rest}
    >
      {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
      <span>{children}</span>
      {count !== undefined && <span className={styles.count}>({count})</span>}
    </button>
  );
});

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Value of the tab this panel belongs to. */
  value: string;
  /** Keep the panel mounted when hidden (preserves state). @default false */
  keepMounted?: boolean;
  /** Remove the top padding. @default false */
  flush?: boolean;
  /** Content rendered inside the tab panel. */
  children: ReactNode;
}

/** Content associated with a Tab. */
export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(function TabPanel({ value, keepMounted = false, flush = false, className, children, ...rest }, ref) {
  const ctx = useTabs();
  const selected = ctx.value === value;
  const mounted = selected || keepMounted;
  const { registerPanel } = ctx;
  useEffect(() => (mounted ? registerPanel(value) : undefined), [mounted, value, registerPanel]);
  if (!mounted) return null;
  return (
    <div
      ref={ref}
      role="tabpanel"
      id={panelId(ctx.baseId, value)}
      aria-labelledby={tabId(ctx.baseId, value)}
      hidden={!selected}
      tabIndex={0}
      className={cx(styles.panel, flush && styles.flush, className)}
      {...rest}
    >
      {children}
    </div>
  );
});
