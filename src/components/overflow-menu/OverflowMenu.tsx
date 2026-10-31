import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, type DropdownMenuProps } from '../dropdown-menu';
import { IconButton } from '../icon-button';
export interface OverflowMenuProps extends Omit<DropdownMenuProps, 'trigger'> {
  /** Accessible name and tooltip of the overflow button. @default 'More actions' */
  label?: string;
}
/** Standard compact trigger for a DropdownMenu of secondary actions. */
export function OverflowMenu({ label = 'More actions', ...props }: OverflowMenuProps) {
  return <DropdownMenu {...props} aria-label={props['aria-label'] ?? label} trigger={<IconButton icon={<MoreHorizontal />} label={label} />} />;
}
