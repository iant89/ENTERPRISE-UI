import { forwardRef } from 'react';
import { IconProvider, type IconName } from '../../icons/IconProvider';
import type { SvgIconProps } from '../../icons/svgIcon';

export interface IconProps extends Omit<SvgIconProps, 'ref'> {
  /** The icon to show. Autocompleted and type-checked; see the Icons page for every name. */
  name: IconName;
  /**
   * Accessible name. Set it for informative icons (the icon is then announced as an image);
   * omit it for decorative icons, which are hidden from assistive technology.
   */
  label?: string;
}

/**
 * An icon from the SAP icon set, rendered as a bare `<svg>`: `<Icon name="bell" />`.
 * Use IconButton for actions. Including Icon (or IconProvider) bundles the whole icon set.
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon({ name, label, ...rest }, ref) {
  return IconProvider.getIcon(name, { ...rest, ...(label ? { 'aria-label': label } : {}), ref });
});
