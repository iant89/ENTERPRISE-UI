import type { ReactElement, Ref, SVGProps } from 'react';
import { cx } from '../utilities/cx';

export interface SvgIconProps extends Omit<SVGProps<SVGSVGElement>, 'ref' | 'children'> {
  /** Width and height. CSS that sizes the `svg` (for example inside a Button) takes precedence. @default 24 */
  size?: number | string;
  /** Fill colour. @default 'currentColor' */
  color?: string;
  /** Tooltip and accessible name. When set (or with `aria-label`), the icon is announced as an image; otherwise it is hidden from assistive technology. */
  title?: string;
  /** Ref to the `svg` element. */
  ref?: Ref<SVGSVGElement>;
}

/** The parts of an icon SVG file the library uses. */
export interface ParsedSvg {
  name: string;
  path: string;
  code?: number;
  flipInRtl: boolean;
}

const cache = new Map<string, ParsedSvg>();

/**
 * Reads an icon SVG file from `src/assets/icons`: one 16×16 path, `data-code` (hex code point)
 * and `data-rtl="flip"`. The file name is passed separately because raw imports don't carry it.
 */
export function parseSvg(svg: string, name: string): ParsedSvg {
  const cached = cache.get(svg);
  if (cached) return cached;
  const hex = /data-code="([0-9a-f]+)"/i.exec(svg)?.[1];
  const parsed = { name, path: / d="([^"]+)"/.exec(svg)?.[1] ?? '', code: hex ? parseInt(hex, 16) : undefined, flipInRtl: /data-rtl="flip"/.test(svg) };
  cache.set(svg, parsed);
  return parsed;
}

/** Renders a parsed icon as a bare `<svg>`. */
export function renderIcon({ name, path, flipInRtl }: ParsedSvg, props: SvgIconProps = {}): ReactElement {
  const { size = 24, color = 'currentColor', title, className, ...rest } = props;
  const labelled = Boolean(title || rest['aria-label'] || rest['aria-labelledby']);
  return (
    <svg
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
}

/**
 * Internal: renders one icon from a directly imported SVG file, so only the icons a component
 * uses end up in the bundle. `import barCode from '../../assets/icons/bar-code.svg?raw'` then
 * `svgIcon(barCode, 'bar-code', { size: 16 })`.
 */
export function svgIcon(svg: string, name: string, props?: SvgIconProps): ReactElement {
  return renderIcon(parseSvg(svg, name), props);
}
