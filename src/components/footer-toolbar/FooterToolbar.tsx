import { forwardRef, useLayoutEffect, useRef, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { OverflowIcon } from '../../icons';
import { cx } from '../../utilities/cx';
import { getNavigationIndex } from '../../utilities/keyboard';
import { Button, type ButtonVariant } from '../button';
import { DropdownMenu } from '../dropdown-menu';
import { IconButton } from '../icon-button';
import styles from './FooterToolbar.module.css';

export interface FooterToolbarAction {
  /** Unique ID. */
  id: string;
  /** Button text, or the accessible name and tooltip when `display` is `'icon'`. */
  label: string;
  /** Icon, used only when `display` is `'icon'`. A button never combines icon and text. */
  icon?: ReactNode;
  /** Show the action as a text button or an icon-only button. @default 'text' */
  display?: 'text' | 'icon';
  /** Called when the action is chosen, in the toolbar or the overflow menu. */
  onClick?: () => void;
  /** Visual emphasis. Use `'primary'` for the one finalizing action, such as Save. @default 'tertiary' */
  variant?: ButtonVariant;
  /** Disables the action. */
  disabled?: boolean;
}

export interface FooterToolbarLabels {
  /** Accessible name of the toolbar. */
  toolbar: string;
  /** Accessible name and tooltip of the overflow button. */
  more: string;
}

export interface FooterToolbarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Closing or finalizing actions for the whole page, sorted from most to least frequently used.
   * They are right-aligned; when space runs out the least-used (last) actions move into the overflow menu first.
   */
  actions?: FooterToolbarAction[];
  /** Message handling, typically a MessagePopover trigger. Shown at the start of the toolbar. */
  messages?: ReactNode;
  /** Draft status, typically a DraftIndicator. Shown at the start of the toolbar. */
  draftIndicator?: ReactNode;
  /**
   * `sticky` floats at the bottom of the scrolling container (the page content in an AppShell);
   * `fixed` floats at the bottom of the viewport. Either way the toolbar never scrolls away.
   * @default 'sticky'
   */
  position?: 'sticky' | 'fixed';
  /** Text overrides. */
  labels?: Partial<FooterToolbarLabels>;
}

const defaultLabels: FooterToolbarLabels = { toolbar: 'Page actions', more: 'More actions' };
const GAP = 8;

/**
 * Floating footer bar for page-level closing and finalizing actions (Fiori footer toolbar).
 * It renders only when there are actions, messages or a draft indicator, and it never scrolls away.
 */
export const FooterToolbar = forwardRef<HTMLDivElement, FooterToolbarProps>(function FooterToolbar(
  { actions = [], messages, draftIndicator, position = 'sticky', labels, className, onKeyDown, ...rest },
  ref,
) {
  const text = { ...defaultLabels, ...labels };
  const actionsRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(actions.length);
  const key = actions.map((a) => `${a.id}:${a.label}:${a.display ?? 'text'}`).join('|');

  useLayoutEffect(() => {
    const container = actionsRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;
    const compute = () => {
      const widths = Array.from(measure.querySelectorAll<HTMLElement>('[data-action-id]')).map((el) => el.offsetWidth + GAP);
      const available = container.clientWidth;
      const total = widths.reduce((sum, w) => sum + w, 0);
      if (available === 0 || total <= available) {
        setVisibleCount(actions.length);
        return;
      }
      // Keep actions in order (most used first); the trailing, least-used ones overflow first.
      let used = (measure.querySelector<HTMLElement>('[data-overflow]')?.offsetWidth ?? 36) + GAP;
      let count = 0;
      while (count < widths.length && used + widths[count] <= available) used += widths[count++];
      setVisibleCount(count);
    };
    compute();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(compute);
    observer.observe(container);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (actions.length === 0 && messages == null && draftIndicator == null) return null;

  const renderAction = (action: FooterToolbarAction, measuring = false) => {
    const common = { 'data-action-id': action.id, variant: action.variant ?? 'tertiary', disabled: action.disabled, onClick: measuring ? undefined : action.onClick, tabIndex: measuring ? -1 : undefined } as const;
    return action.display === 'icon' && action.icon ? (
      <IconButton key={action.id} {...common} icon={action.icon} label={action.label} />
    ) : (
      <Button key={action.id} {...common}>{action.label}</Button>
    );
  };

  const visible = actions.slice(0, Math.min(visibleCount, actions.length));
  const overflow = actions.slice(visible.length);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
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
    <div
      ref={ref}
      role="toolbar"
      aria-label={text.toolbar}
      className={cx(styles.root, position === 'fixed' && styles.fixed, className)}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {(messages != null || draftIndicator != null) && (
        <div className={styles.start}>
          {messages}
          {draftIndicator}
        </div>
      )}
      <div ref={actionsRef} className={styles.actions}>
        {visible.map((a) => renderAction(a))}
        {overflow.length > 0 && (
          <DropdownMenu
            placement="top-end"
            aria-label={text.more}
            items={overflow.map((a) => ({ id: a.id, label: a.label, disabled: a.disabled, destructive: a.variant === 'destructive', onSelect: a.onClick }))}
            trigger={<IconButton icon={<OverflowIcon />} label={text.more} />}
          />
        )}
      </div>
      <div ref={measureRef} className={styles.measure} aria-hidden="true" inert>
        {actions.map((a) => renderAction(a, true))}
        <span data-overflow="">
          <IconButton icon={<OverflowIcon />} label={text.more} tabIndex={-1} />
        </span>
      </div>
    </div>
  );
});
