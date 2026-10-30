import type { MouseEvent, ReactNode } from 'react';

export interface MenuItemProps {
  /** Id passed to Menu `onAction`. */
  id: string;
  /** Visible label. */
  label: string;
  icon?: ReactNode;
  description?: string;
  /** Keyboard shortcut hint. Display only. */
  shortcut?: string;
  /** Trailing text when no shortcut is shown. */
  additionalText?: string;
  /** @default false */
  disabled?: boolean;
  /** Style as a destructive action. @default false */
  destructive?: boolean;
  /** When set, the item is a checkable menu item. */
  checked?: boolean;
  href?: string;
  target?: string;
  /** Override the accessible name. */
  accessibleName?: string;
  onSelect?: (event: MouseEvent<HTMLElement>) => void;
}
/** An action inside Menu. Keyboard behavior comes from the parent menu. */
export function MenuItem(_props: MenuItemProps): null {
  return null;
}

export interface MenuItemGroupProps {
  /** Visible group label. It is not an action. */
  headerText: string;
  children?: ReactNode;
}
/** Groups menu actions under a label. */
export function MenuItemGroup(_props: MenuItemGroupProps): null {
  return null;
}
