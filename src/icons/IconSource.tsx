import { isValidElement, type ReactNode } from 'react';
import { Icon } from '../components/icon/Icon';
import type { IconId } from './core/types';

/**
 * What icon-capable components accept in their `icon` props: an icon identifier
 * (`"enterprise://edit"`, `"edit"`, `"material://edit"`) or any element (`<Icon name="edit" />`, an SVG…).
 */
export type IconSource = IconId | Exclude<ReactNode, string>;

/**
 * Turns an `icon` prop into something to render: identifiers become `<Icon>` (resolved through the
 * registry), elements pass through. Components never need to know how the icon is drawn.
 */
export function renderIconSource(icon: IconSource | undefined, props?: { label?: string }): ReactNode {
  if (typeof icon === 'string') return <Icon name={icon as IconId} label={props?.label} />;
  return isValidElement(icon) || icon != null ? icon : null;
}
