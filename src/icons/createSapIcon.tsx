import { forwardRef, type SVGProps } from 'react';
import { cx } from '../utilities/cx';

export interface SapIconProps extends Omit<SVGProps<SVGSVGElement>, 'ref' | 'children'> {
  /** Width and height. CSS that sizes the `svg` (for example inside a Button) takes precedence. @default 24 */
  size?: number | string;
  /** Fill colour. @default 'currentColor' */
  color?: string;
  /** Accessible name. When set, the icon is announced as an image; otherwise it is hidden from assistive technology. */
  title?: string;
}

/** Builds an icon component from a single 16×16 SAP icon path. Used by the generated icon module. */
export function createSapIcon(name: string, path: string, flipInRtl = false) {
  const Component = forwardRef<SVGSVGElement, SapIconProps>(function SapIcon(
    { size = 24, color = 'currentColor', title, className, ...rest },
    ref,
  ) {
    const labelled = Boolean(title || rest['aria-label'] || rest['aria-labelledby']);
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        width={size}
        height={size}
        fill={color}
        role={labelled ? 'img' : undefined}
        aria-hidden={labelled ? undefined : true}
        focusable="false"
        data-icon={name}
        className={cx('eui-icon', flipInRtl && 'eui-icon-rtl-flip', className)}
        {...rest}
      >
        {title && <title>{title}</title>}
        <path d={path} />
      </svg>
    );
  });
  Component.displayName = `SapIcon(${name})`;
  return Component;
}

/** Any icon component from the SAP icon set. */
export type SapIconComponent = ReturnType<typeof createSapIcon>;
