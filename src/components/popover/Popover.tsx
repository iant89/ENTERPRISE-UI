import { useRef, type CSSProperties, type ReactElement, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { cloneTrigger } from '../../utilities/cloneTrigger';
import { Portal } from '../../utilities/Portal';
import { focusElement, getFocusableElements } from '../../utilities/focus';
import type { Placement } from '../../utilities/types';
import { useControllableState } from '../../hooks/useControllableState';
import { useClickOutside } from '../../hooks/useDismiss';
import { useId } from '../../hooks/useId';
import { usePosition } from '../../hooks/usePosition';
import { useIsoLayoutEffect } from '../../hooks/useEventCallback';
import { IconButton } from '../icon-button';
import floating from './Floating.module.css';
import styles from './Popover.module.css';

export interface PopoverProps {
  /** The element that toggles the popover. Must accept a ref and `onClick`. */
  trigger: ReactElement;
  /** Popover content, or a render function receiving `close`. */
  children: ReactNode | ((close: () => void) => ReactNode);
  /** Heading shown at the top; also used as the accessible name. */
  title?: ReactNode;
  /** Accessible name when no `title` is shown. */
  'aria-label'?: string;
  /** Footer content, typically actions. */
  footer?: ReactNode;
  /** @default 'bottom-start' */
  placement?: Placement;
  /** Controlled open state. */
  open?: boolean;
  /** @default false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Show a close button in the header. @default true when `title` is set */
  showClose?: boolean;
  /** Fixed width (CSS length). */
  width?: CSSProperties['width'];
  /** Pad the content area. @default true */
  padded?: boolean;
  className?: string;
}

/**
 * Non-modal dialog anchored to a trigger. Focus moves into the popover on
 * open and returns to the trigger on close (Escape, outside click).
 */
export function Popover({
  trigger,
  children,
  title,
  'aria-label': ariaLabel,
  footer,
  placement = 'bottom-start',
  open,
  defaultOpen = false,
  onOpenChange,
  showClose,
  width,
  padded = true,
  className,
}: PopoverProps) {
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
  const triggerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const id = useId(undefined, 'popover');
  const titleId = `${id}-title`;
  const { style } = usePosition({ open: isOpen, anchorRef: triggerRef, floatingRef: panelRef, placement, offset: 6 });

  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) focusElement(triggerRef.current);
  };

  useClickOutside([triggerRef, panelRef], () => close(false), isOpen);

  useIsoLayoutEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      focusElement(getFocusableElements(panel).find((el) => !el.dataset.euiPopoverClose) ?? panel);
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  const content = typeof children === 'function' ? children(() => close()) : children;

  return (
    <>
      {cloneTrigger(trigger, triggerRef, {
        'aria-haspopup': 'dialog',
        'aria-expanded': isOpen,
        'aria-controls': isOpen ? id : undefined,
        onClick: () => setOpen(!isOpen),
        onKeyDown: (event: React.KeyboardEvent) => {
          if (event.key === 'Escape' && isOpen) {
            event.preventDefault();
            event.stopPropagation();
            close();
          }
        },
      })}
      {isOpen && (
        <Portal>
          <div
            ref={panelRef}
            id={id}
            role="dialog"
            aria-labelledby={title ? titleId : undefined}
            aria-label={title ? undefined : ariaLabel}
            tabIndex={-1}
            className={cx(floating.floating, styles.popover, className)}
            style={{ ...style, width }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.stopPropagation();
                close();
              }
            }}
          >
            {title && (
              <div className={styles.header}>
                <h2 id={titleId} className={styles.title}>
                  {title}
                </h2>
                {(showClose ?? true) && (
                  <IconButton icon={<X />} label="Close" size="sm" onClick={() => close()} data-eui-popover-close="true" />
                )}
              </div>
            )}
            <div className={padded ? styles.body : undefined}>{content}</div>
            {footer && <div className={styles.footer}>{footer}</div>}
          </div>
        </Portal>
      )}
    </>
  );
}
