import { useRef, type ReactNode } from 'react';
import { breakpoints } from '../../tokens';
import { useControllableState } from '../../hooks/useControllableState';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { cloneTrigger } from '../../utilities/cloneTrigger';
import { Dialog } from '../dialog';
import { Popover, type PopoverProps } from './Popover';

export interface ResponsivePopoverProps extends PopoverProps {
  /** Viewports at or below this width use a modal dialog. @default 599 */
  dialogBelow?: number;
}

/**
 * Popover on wider viewports and a modal dialog on narrow ones.
 * The application owns the content; this only changes the presentation.
 */
export function ResponsivePopover({ dialogBelow = breakpoints.sm - 1, open, defaultOpen = false, onOpenChange, ...rest }: ResponsivePopoverProps) {
  const phone = useMediaQuery(`(max-width: ${Math.max(0, dialogBelow)}px)`);
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange);
  if (!phone) return <Popover {...rest} open={isOpen} onOpenChange={setOpen} />;
  return <ResponsivePopoverDialog {...rest} open={isOpen} onOpenChange={setOpen} />;
}

function ResponsivePopoverDialog({
  trigger, children, title, 'aria-label': ariaLabel, footer, showClose, className, open, onOpenChange,
}: PopoverProps) {
  const triggerRef = useRef<HTMLElement>(null);
  const content: ReactNode = typeof children === 'function' ? children(() => onOpenChange?.(false)) : children;
  return (
    <>
      {cloneTrigger(trigger, triggerRef, {
        'aria-haspopup': 'dialog',
        'aria-expanded': open,
        onClick: () => onOpenChange?.(!open),
      })}
      <Dialog
        open={!!open}
        title={title ?? ariaLabel ?? 'Dialog'}
        footer={footer}
        showClose={showClose ?? true}
        className={className}
        size="sm"
        onClose={() => onOpenChange?.(false)}
      >
        {content}
      </Dialog>
    </>
  );
}
