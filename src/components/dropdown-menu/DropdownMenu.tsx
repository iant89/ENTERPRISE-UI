import { useRef, useState, type KeyboardEvent, type ReactElement } from 'react';
import { cx } from '../../utilities/cx';
import { cloneTrigger } from '../../utilities/cloneTrigger';
import { Portal } from '../../utilities/Portal';
import { focusElement } from '../../utilities/focus';
import type { Placement } from '../../utilities/types';
import { useControllableState } from '../../hooks/useControllableState';
import { useClickOutside } from '../../hooks/useDismiss';
import { useId } from '../../hooks/useId';
import { usePosition } from '../../hooks/usePosition';
import { Menu, type MenuEntry } from '../menu';
import floating from '../popover/Floating.module.css';

export interface DropdownMenuProps {
  /** Element that opens the menu (usually a Button or IconButton). */
  trigger: ReactElement;
  items: MenuEntry[];
  /** Called with the id of the chosen item. */
  onAction?: (id: string) => void;
  /** @default 'bottom-start' */
  placement?: Placement;
  open?: boolean;
  /** @default false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Accessible name for the menu. Defaults to being labelled by the trigger. */
  'aria-label'?: string;
  className?: string;
  /** Direction and language of the portaled menu. */
  dir?: 'ltr' | 'rtl' | 'auto';
  lang?: string;
}

/**
 * A button that opens a menu of actions. Opens with click, Enter, Space or
 * the arrow keys; closes with Escape, Tab or an outside click.
 */
export function DropdownMenu({
  trigger,
  items,
  onAction,
  placement = 'bottom-start',
  open,
  defaultOpen = false,
  onOpenChange,
  'aria-label': ariaLabel,
  className,
  dir,
  lang,
}: DropdownMenuProps) {
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
  const [focusTarget, setFocusTarget] = useState<'first' | 'last'>('first');
  const triggerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const id = useId(undefined, 'menu');
  const triggerId = (trigger.props as { id?: string }).id ?? `${id}-trigger`;
  const { style } = usePosition({ open: isOpen, anchorRef: triggerRef, floatingRef: menuRef, placement });

  useClickOutside([triggerRef, menuRef], () => setOpen(false), isOpen);

  const openWith = (target: 'first' | 'last') => {
    setFocusTarget(target);
    setOpen(true);
  };

  return (
    <>
      {cloneTrigger(trigger, triggerRef, {
        id: triggerId,
        'aria-haspopup': 'menu',
        'aria-expanded': isOpen,
        'aria-controls': isOpen ? id : undefined,
        onClick: () => (isOpen ? setOpen(false) : openWith('first')),
        onKeyDown: (event: KeyboardEvent) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            openWith('first');
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            openWith('last');
          } else if (event.key === 'Escape' && isOpen) {
            event.preventDefault();
            setOpen(false);
          }
        },
      })}
      {isOpen && (
        <Portal>
          <Menu
            ref={menuRef}
            dir={dir}
            lang={lang}
            id={id}
            items={items}
            autoFocus={focusTarget}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabel ? undefined : triggerId}
            className={cx(floating.floating, className)}
            style={style}
            onAction={onAction}
            onClose={(reason) => {
              setOpen(false);
              if (reason !== 'tab') focusElement(triggerRef.current);
            }}
          />
        </Portal>
      )}
    </>
  );
}
