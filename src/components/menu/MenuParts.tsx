import type { MouseEvent, ReactNode } from 'react';

export interface MenuItemProps {
  /** Id passed to Menu `onAction`. */
  id: string;
  /** Visible label. */
  label: string;
  /** Icon shown before the text. */
  icon?: ReactNode;
  /** Secondary text shown below the main text. */
  description?: string;
  /** Keyboard shortcut hint. Display only. */
  shortcut?: string;
  /** Trailing text when no shortcut is shown. */
  additionalText?: string;
  /** @default false */
  /** Disables the menu item. A disabled control cannot be focused or changed. */
  disabled?: boolean;
  /** Style as a destructive action. @default false */
  destructive?: boolean;
  /** When set, the item is a checkable menu item. */
  checked?: boolean;
  /** URL to navigate to. The item renders as a link. */
  href?: string;
  /** Where to open the link, as with the HTML `target` attribute. */
  target?: string;
  /** Override the accessible name. */
  accessibleName?: string;
  /** Called when the user activates the item. */
  onSelect?: (event: MouseEvent<HTMLElement>) => void;
}
/** An action inside Menu. Keyboard behavior comes from the parent menu. */
export function MenuItem(_props: MenuItemProps): null {
  return null;
}

export interface MenuItemGroupProps {
  /** Visible group label. It is not an action. */
  headerText: string;
  /** Content rendered inside the menu item group. */
  children?: ReactNode;
}
/** Groups menu actions under a label. */
export function MenuItemGroup(_props: MenuItemGroupProps): null {
  return null;
}
