import type { ReactElement, SVGProps } from 'react';
import { cx } from '../utilities/cx';

/**
 * SVG files from `src/assets/icons`, bundled as text. Each is one 16×16 path with `fill="currentColor"`;
 * `data-code` holds its icon font code point (hex) and `data-rtl="flip"` marks icons mirrored in
 * right-to-left layouts. (`SAP-icons.json` beside them has the search tags and groups; the library
 * doesn't load it, to keep bundles small.)
 */
const svgFiles = import.meta.glob<string>('../assets/icons/*.svg', { query: '?raw', import: 'default', eager: true });

export interface SvgIconProps extends Omit<SVGProps<SVGSVGElement>, 'ref' | 'children'> {
  /** Width and height. CSS that sizes the `svg` (for example inside a Button) takes precedence. @default 24 */
  size?: number | string;
  /** Fill colour. @default 'currentColor' */
  color?: string;
  /** Accessible name. When set, the icon is announced as an image; otherwise it is hidden from assistive technology. */
  title?: string;
}

/**
 * A reference to an icon: its name (`'bar-code'`), a UI5-style URI (`'sap-icon://bar-code'`),
 * or its font code point (`0xe08d`, `'&#xe08d;'`, `'U+E08D'`).
 */
export type IconRef = string | number;

interface IconEntry { path: string; code?: number; flipInRtl: boolean }

const URI_PREFIX = 'sap-icon://';
const FALLBACK = 'fallback';

/** Parses a code point from `0xe08d`, `'&#xe08d;'`, `'&#57485;'`, `'U+E08D'` or the glyph itself. */
function codePoint(ref: IconRef): number | undefined {
  if (typeof ref === 'number') return ref;
  const text = ref.trim();
  const entity = /^&#(x[0-9a-f]+|\d+);?$/i.exec(text);
  if (entity) return entity[1][0].toLowerCase() === 'x' ? parseInt(entity[1].slice(1), 16) : parseInt(entity[1], 10);
  const unicode = /^(?:U\+|0x)([0-9a-f]{4,6})$/i.exec(text);
  if (unicode) return parseInt(unicode[1], 16);
  if ([...text].length === 1) {
    const cp = text.codePointAt(0)!;
    if (cp >= 0xe000 && cp <= 0xf8ff) return cp; // Private Use Area: an icon font glyph
  }
  return undefined;
}

const normalize = (name: string) => {
  const trimmed = name.trim();
  return (trimmed.startsWith(URI_PREFIX) ? trimmed.slice(URI_PREFIX.length) : trimmed).toLowerCase();
};

/**
 * The icon set: SVG files in `src/assets/icons` (the SAP icons), plus any icons added with
 * `registerIcon`. Call `IconProvider.getIcon('bell')` for an icon element and
 * `IconProvider.getIconNames()` for every available name.
 */
export class IconProvider {
  private static entries: Map<string, IconEntry> | undefined;
  private static codes = new Map<number, string>();

  /** Reads the SVG files once, on first use. */
  private static load(): Map<string, IconEntry> {
    if (IconProvider.entries) return IconProvider.entries;
    const entries = new Map<string, IconEntry>();
    for (const [file, svg] of Object.entries(svgFiles)) {
      const name = /([^/]+)\.svg$/.exec(file)![1].toLowerCase();
      const path = / d="([^"]+)"/.exec(svg)?.[1];
      if (!path) continue;
      const hex = /data-code="([0-9a-f]+)"/i.exec(svg)?.[1];
      const code = hex ? parseInt(hex, 16) : undefined;
      entries.set(name, { path, code, flipInRtl: /data-rtl="flip"/.test(svg) });
      // Several names can share a code point (for example status-positive and status-completed): the first wins.
      if (code !== undefined && (!IconProvider.codes.has(code) || name < IconProvider.codes.get(code)!)) IconProvider.codes.set(code, name);
    }
    IconProvider.entries = entries;
    return entries;
  }

  /** The icon name a reference points to, or `undefined` when there is no such icon. */
  static resolveName(ref: IconRef): string | undefined {
    const entries = IconProvider.load();
    const cp = codePoint(ref);
    if (cp !== undefined) return IconProvider.codes.get(cp);
    const name = normalize(String(ref));
    return entries.has(name) ? name : undefined;
  }

  /**
   * Returns the icon as an `<svg>` element. Use it wherever an icon is expected:
   * `icon={IconProvider.getIcon('add')}`. An unknown name returns the `fallback` icon; check with
   * `hasIcon` first if that matters.
   */
  static getIcon(ref: IconRef, props: SvgIconProps = {}): ReactElement {
    const name = IconProvider.resolveName(ref) ?? FALLBACK;
    const { path, flipInRtl } = IconProvider.load().get(name) ?? { path: '', flipInRtl: false };
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

  /** Every available icon name (including alternative names), sorted alphabetically. */
  static getIconNames(): string[] {
    return [...IconProvider.load().keys()].sort();
  }

  /** Whether an icon exists for the reference. */
  static hasIcon(ref: IconRef): boolean {
    return IconProvider.resolveName(ref) !== undefined;
  }

  /** The icon font code point of an icon (for example `0xe08d` for `bar-code`), if known. */
  static getCodePoint(ref: IconRef): number | undefined {
    const name = IconProvider.resolveName(ref);
    return name === undefined ? undefined : IconProvider.load().get(name)!.code;
  }

  /**
   * Adds or replaces an icon, for example a product-specific glyph. `path` is the `d` attribute of a
   * single path in a 16×16 view box.
   */
  static registerIcon(name: string, path: string, options: { code?: number; flipInRtl?: boolean } = {}): void {
    const key = normalize(name);
    IconProvider.load().set(key, { path, code: options.code, flipInRtl: options.flipInRtl ?? false });
    if (options.code !== undefined) IconProvider.codes.set(options.code, key);
  }
}
