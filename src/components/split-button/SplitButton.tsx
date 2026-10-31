import { forwardRef, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { ButtonGroup } from '../button-group';
import { Button, type ButtonSize } from '../button';
import { IconButton } from '../icon-button';
import { DropdownMenu } from '../dropdown-menu';
import type { MenuEntry } from '../menu';

export interface SplitButtonProps {
  /** Label of the default action. */
  children: ReactNode;
  /** Called when the default action is clicked. */
  onClick?: () => void;
  /** Alternative actions shown in the menu. */
  items: MenuEntry[];
  /** Called with the id of the chosen menu item. */
  onAction?: (id: string) => void;
  /** @default 'secondary' */
  /** Visual emphasis. */
  variant?: 'primary' | 'secondary';
  /** @default 'md' */
  /** Size of the split button. */
  size?: ButtonSize;
  /** Icon shown before the text. */
  icon?: ReactNode;
  /** @default false */
  /** Disables the split button. A disabled control cannot be focused or changed. */
  disabled?: boolean;
  /** Accessible name for the menu toggle. @default 'More options' */
  menuLabel?: string;
  /** Additional CSS class names for the root element. */
  className?: string;
}

/** A default action plus a menu of related alternatives. */
export const SplitButton = forwardRef<HTMLDivElement, SplitButtonProps>(function SplitButton(
  { children, onClick, items, onAction, variant = 'secondary', size = 'md', icon, disabled = false, menuLabel = 'More options', className },
  ref,
) {
  return (
    <ButtonGroup ref={ref} attached className={className}>
      <Button variant={variant} size={size} icon={icon} disabled={disabled} onClick={onClick}>
        {children}
      </Button>
      <DropdownMenu
        placement="bottom-end"
        items={items}
        onAction={onAction}
        trigger={<IconButton icon={<ChevronDown />} label={menuLabel} variant={variant} size={size} disabled={disabled} />}
      />
    </ButtonGroup>
  );
});
