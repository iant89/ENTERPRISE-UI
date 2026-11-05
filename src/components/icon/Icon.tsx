import { forwardRef, useSyncExternalStore, type CSSProperties, type HTMLAttributes, type Ref } from 'react';
import { cx } from '../../utilities/cx';
import { icons } from '../../icons/registry';
import type { IconId, IconRenderContext, IconSize, IconSizeToken } from '../../icons/core/types';

export interface IconProps extends Omit<HTMLAttributes<HTMLElement>, 'color' | 'title' | 'children'> {
  /**
   * The icon: a name in the default collection (`"edit"`, type-checked) or a URI such as
   * `"enterprise://edit"`, `"material://edit"` or `"fontawesome://pen"`.
   */
  name: IconId;
  /** Collection for a plain `name`. @default the registry's default collection (`enterprise`) */
  collection?: string;
  /**
   * `xs` 12, `sm` 14, `md` 16, `lg` 20, `xl` 24, `2xl` 32 px (design tokens), a number of pixels or any
   * CSS length. Without it, icons are 24px on their own and take the size a component gives them
   * (16px in buttons, inputs and menus).
   */
  size?: IconSize;
  /** Colour. Icons otherwise inherit the text colour (`currentColor`). */
  color?: string;
  /** Accessible name. Set it when the icon conveys information by itself; it is then announced as an image. */
  label?: string;
  /** Same as `label`. */
  'aria-label'?: string;
  /** Tooltip. A tooltip is not an accessible name: also set `label` if the icon conveys information. */
  title?: string;
  /** Hide from assistive technology even if a label is set. Icons without a label are always decorative. */
  decorative?: boolean;
  /** Dimmed, for icons inside disabled content. */
  disabled?: boolean;
}

const TOKEN_PX: Record<IconSizeToken, number> = { xs: 12, sm: 14, md: 16, lg: 20, xl: 24, '2xl': 32 };
const isToken = (size: IconSize): size is IconSizeToken => typeof size === 'string' && size in TOKEN_PX;

/** Re-renders when the registry changes (a lazy collection or asset finished loading, an icon was registered). */
function useRegistryVersion(): number {
  return useSyncExternalStore(icons.subscribe.bind(icons), () => icons.getVersion(), () => icons.getVersion());
}

/**
 * Shows an icon from the icon registry. The component only resolves the identifier and hands it to
 * the provider that owns the icon's source (SVG, icon font, Font Awesome, Material or a custom
 * provider), so the API stays the same whatever renders the icon.
 */
export const Icon = forwardRef<Element, IconProps>(function Icon(
  { name, collection, size, color, label, 'aria-label': ariaLabel, title, decorative = false, disabled = false, className, style, ...rest },
  ref,
) {
  useRegistryVersion();
  const resolution = icons.resolve(name, { collection });
  const accessibleName = label ?? ariaLabel;
  const token = size !== undefined && isToken(size) ? size : undefined;
  const context: IconRenderContext = {
    className: cx(token && `eui-icon-size-${token}`, disabled && 'eui-icon-disabled', className),
    size: token ? undefined : size,
    fallbackSize: token ? TOKEN_PX[token] : 24,
    style: color ? ({ ...style, color } as CSSProperties) : style,
    accessibility: accessibleName && !decorative ? { role: 'img', 'aria-label': accessibleName } : { 'aria-hidden': true },
    title,
    attributes: rest,
    ref,
  };
  if (resolution.status === 'resolved') return resolution.provider.render(resolution.definition, context);
  // Loading or unknown: keep the space (and the accessible name) so layouts don't jump.
  const px = typeof context.size === 'number' ? `${context.size}px` : context.size;
  return (
    <span
      ref={ref as Ref<HTMLSpanElement>}
      {...rest}
      {...context.accessibility}
      title={title}
      data-icon={resolution.requested}
      data-icon-status={resolution.status}
      className={cx('eui-icon', 'eui-icon-placeholder', context.className)}
      style={{ ...(px ? { inlineSize: px, blockSize: px } : null), ...context.style }}
    />
  );
});
