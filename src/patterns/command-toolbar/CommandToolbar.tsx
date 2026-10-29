import { useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { getNavigationIndex } from '../../utilities/keyboard';
import { Button, type ButtonVariant } from '../../components/button';
import { DropdownMenu } from '../../components/dropdown-menu';
import { IconButton } from '../../components/icon-button';
import styles from './CommandToolbar.module.css';

export interface CommandAction {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  /** @default 'tertiary' */
  variant?: ButtonVariant;
  disabled?: boolean;
  /** Show only the icon in the toolbar (the label remains the accessible name). */
  iconOnly?: boolean;
  /**
   * `always` never overflows; `high` overflows after `low`.
   * @default 'high'
   */
  priority?: 'always' | 'high' | 'low';
}

export interface CommandToolbarProps {
  /** Toolbar heading, e.g. "Products (24)". */
  title?: ReactNode;
  /** Content after the title (e.g. a SearchField). */
  start?: ReactNode;
  actions: CommandAction[];
  /** Accessible name. Defaults to the title text. */
  'aria-label'?: string;
  /** Surface background and bottom border. @default false */
  bordered?: boolean;
  className?: string;
}

const PRIORITY = { always: 0, high: 1, low: 2 } as const;

/**
 * Action toolbar that moves actions into a "More" menu when space runs out
 * (Fiori overflow toolbar). Arrow keys move between toolbar buttons.
 */
export function CommandToolbar({ title, start, actions, 'aria-label': ariaLabel, bordered = false, className }: CommandToolbarProps) {
  const actionsRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(() => new Set(actions.map((a) => a.id)));
  const key = actions.map((a) => `${a.id}:${a.label}:${a.iconOnly}`).join('|');

  useLayoutEffect(() => {
    const container = actionsRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;
    const compute = () => {
      const widths = new Map<string, number>();
      measure.querySelectorAll<HTMLElement>('[data-action-id]').forEach((el) => widths.set(el.dataset.actionId!, el.offsetWidth));
      const overflowWidth = (measure.querySelector<HTMLElement>('[data-overflow]')?.offsetWidth ?? 36) + 8;
      const available = container.clientWidth;
      const total = actions.reduce((sum, a) => sum + (widths.get(a.id) ?? 0) + 8, 0);
      if (total <= available || available === 0) {
        setVisibleIds(new Set(actions.map((a) => a.id)));
        return;
      }
      const ordered = [...actions].sort((a, b) => PRIORITY[a.priority ?? 'high'] - PRIORITY[b.priority ?? 'high']);
      let used = overflowWidth;
      const next = new Set<string>();
      for (const action of ordered) {
        const w = (widths.get(action.id) ?? 0) + 8;
        if (action.priority === 'always' || used + w <= available) {
          next.add(action.id);
          used += w;
        }
      }
      setVisibleIds(next);
    };
    compute();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(compute);
    observer.observe(container);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const renderAction = (action: CommandAction, measuring = false) =>
    action.iconOnly && action.icon ? (
      <IconButton key={action.id} data-action-id={action.id} icon={action.icon} label={action.label} variant={action.variant ?? 'tertiary'} disabled={action.disabled} onClick={action.onClick} tabIndex={measuring ? -1 : undefined} />
    ) : (
      <Button key={action.id} data-action-id={action.id} icon={action.icon} variant={action.variant ?? 'tertiary'} disabled={action.disabled} onClick={action.onClick} tabIndex={measuring ? -1 : undefined}>
        {action.label}
      </Button>
    );

  const overflow = actions.filter((a) => !visibleIds.has(a.id));

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>(`.${styles.actions} button:not(:disabled)`));
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0) return;
    const next = getNavigationIndex(event.key, index, buttons.length, { orientation: 'horizontal' });
    if (next !== null) {
      event.preventDefault();
      buttons[next].focus();
    }
  };

  return (
    <div role="toolbar" aria-label={ariaLabel ?? (typeof title === 'string' ? title : 'Actions')} className={cx(styles.toolbar, bordered && styles.bordered, className)} onKeyDown={onKeyDown}>
      {(title || start) && (
        <div className={styles.start}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {start}
        </div>
      )}
      <div ref={actionsRef} className={styles.actions}>
        {actions.filter((a) => visibleIds.has(a.id)).map((a) => renderAction(a))}
        {overflow.length > 0 && (
          <DropdownMenu
            placement="bottom-end"
            aria-label="More actions"
            items={overflow.map((a) => ({ id: a.id, label: a.label, icon: a.icon, disabled: a.disabled, destructive: a.variant === 'destructive', onSelect: a.onClick }))}
            trigger={<IconButton icon={<MoreHorizontal />} label="More actions" />}
          />
        )}
      </div>
      <div ref={measureRef} className={styles.measure} aria-hidden="true" inert>
        {actions.map((a) => renderAction(a, true))}
        <span data-overflow="">
          <IconButton icon={<MoreHorizontal />} label="More" tabIndex={-1} />
        </span>
      </div>
    </div>
  );
}
