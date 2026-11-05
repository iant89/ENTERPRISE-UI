import type { ReactElement } from 'react';
import type { SapIconName } from './icon-names.generated';
import { parseSvg, renderIcon, type ParsedSvg, type SvgIconProps } from './svgIcon';

/**
 * SVG files from `src/assets/icons`, bundled as text. Each is one 16×16 path with `fill="currentColor"`;
 * `data-code` holds its icon font code point (hex) and `data-rtl="flip"` marks icons mirrored in
 * right-to-left layouts. (`SAP-icons.json` beside them has the search tags and groups; the library
 * doesn't load it, to keep bundles small.)
 */
const svgFiles = import.meta.glob<string>('../assets/icons/*.svg', { query: '?raw', import: 'default', eager: true });

/**
 * Names of icons you add with `IconProvider.registerIcon`. Augment it so `<Icon name>` accepts them:
 * `declare module '@enterprise-ui/react' { interface CustomIconNames { 'company-logo': true } }`.
 */
export interface CustomIconNames {}

/** Name of an available icon: every SVG in `src/assets/icons`, plus any `CustomIconNames`. */
export type IconName = SapIconName | Extract<keyof CustomIconNames, string>;

/**
 * A reference to an icon: its name (`'bar-code'`), a UI5-style URI (`'sap-icon://bar-code'`),
 * or its font code point (`0xe08d`, `'&#xe08d;'`, `'U+E08D'`).
 */
// `string & {}` keeps editor autocompletion for IconName while accepting any string.
export type IconRef = IconName | (string & {}) | number;

type IconEntry = ParsedSvg;

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
      const entry = parseSvg(svg, name);
      if (!entry.path) continue;
      const { code } = entry;
      entries.set(name, entry);
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
    return renderIcon(IconProvider.load().get(name) ?? { name, path: '', flipInRtl: false }, props);
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
    IconProvider.load().set(key, { name: key, path, code: options.code, flipInRtl: options.flipInRtl ?? false });
    if (options.code !== undefined) IconProvider.codes.set(options.code, key);
  }
}
