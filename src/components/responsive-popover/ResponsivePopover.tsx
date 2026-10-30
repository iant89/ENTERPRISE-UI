import { useRef, type ReactNode } from 'react';
import { cloneTrigger } from '../../utilities/cloneTrigger';
import { useControllableState } from '../../hooks/useControllableState';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { breakpoints } from '../../tokens';
import { Dialog } from '../dialog';
import { Popover, type PopoverProps } from '../popover';

export interface ResponsivePopoverProps extends PopoverProps {
  /** Title; required on phones where the content opens in a full-screen dialog. Falls back to `aria-label`. */
  title?: ReactNode;
  /** Force a presentation instead of following the viewport. */
  presentation?: 'auto' | 'popover' | 'dialog';
}

/** A Popover on larger screens that becomes a full-screen Dialog on phones. */
export function ResponsivePopover({ presentation = 'auto', trigger, children, title, footer, open, defaultOpen = false, onOpenChange, 'aria-label': ariaLabel, ...rest }: ResponsivePopoverProps) {
  const phone = useMediaQuery(`(max-width: ${breakpoints.sm - 0.02}px)`);
  const asDialog = presentation === 'dialog' || (presentation === 'auto' && phone);
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
  const triggerRef = useRef<HTMLElement>(null);
  if (!asDialog) {
    return <Popover trigger={trigger} title={title} aria-label={ariaLabel} footer={footer} open={isOpen} onOpenChange={setOpen} {...rest}>{children}</Popover>;
  }
  const close = () => { setOpen(false); triggerRef.current?.focus(); };
  return (
    <>
      {cloneTrigger(trigger, triggerRef, { onClick: () => setOpen(!isOpen), 'aria-haspopup': 'dialog', 'aria-expanded': isOpen })}
      <Dialog open={isOpen} onClose={close} title={title ?? ariaLabel ?? ''} footer={footer} size="full" className={rest.className}>
        {typeof children === 'function' ? children(close) : children}
      </Dialog>
    </>
  );
}
