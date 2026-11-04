import type { ComponentType } from 'react';
import { createSapIcon, type SapIconProps } from './createSapIcon';
import { sapIconCatalog } from './sap-icon-catalog.generated';

/** Any component that renders an icon and accepts the SAP icon props. */
export type IconComponent = ComponentType<SapIconProps>;

/**
 * A reference to an icon: its name (`'bar-code'`), a UI5-style URI (`'sap-icon://bar-code'`),
 * or its font code point (`0xe08d`, `'&#xe08d;'`, `'U+E08D'`, `''`).
 */
export type IconRef = string | number;

/** An icon to register: a component, or the `d` attribute of a single 16×16 path. */
export type IconDefinition = IconComponent | string | { icon: IconComponent | string; code?: number };

const URI_PREFIX = 'sap-icon://';

/** Parses a code point from `0xe08d`, `'&#xe08d;'`, `'&#57485;'`, `'U+E08D'` or the glyph itself. */
function codePoint(ref: IconRef): number | undefined {
  if (typeof ref === 'number') return ref;
  const entity = /^&#(x[0-9a-f]+|\d+);?$/i.exec(ref.trim());
  if (entity) return entity[1][0].toLowerCase() === 'x' ? parseInt(entity[1].slice(1), 16) : parseInt(entity[1], 10);
  const unicode = /^(?:U\+|0x)([0-9a-f]{4,6})$/i.exec(ref.trim());
  if (unicode) return parseInt(unicode[1], 16);
  if ([...ref].length === 1) {
    const cp = ref.codePointAt(0)!;
    if (cp >= 0xe000 && cp <= 0xf8ff) return cp; // Private Use Area: an icon font glyph
  }
  return undefined;
}

/**
 * Looks up icon components by name or code point. `IconRegistry.sap()` holds the full SAP icon set;
 * `register` adds or overrides icons (for example product-specific glyphs). Use it with IconProvider
 * and `<Icon name="…" />`, or on its own.
 */
export class IconRegistry {
  private readonly icons = new Map<string, IconComponent>();
  private readonly codes = new Map<number, string>();
  private static sapDefault: IconRegistry | undefined;

  constructor(icons?: Record<string, IconDefinition>) {
    if (icons) this.registerAll(icons);
  }

  /** A shared, read-only-by-convention registry with every SAP icon. Use `extend()` to customise it. */
  static sap(): IconRegistry {
    if (!IconRegistry.sapDefault) IconRegistry.sapDefault = new IconRegistry(sapIconCatalog);
    return IconRegistry.sapDefault;
  }

  /** Adds or replaces an icon. A string is treated as a 16×16 SVG path. */
  register(name: string, definition: IconDefinition, code?: number): this {
    const key = IconRegistry.normalize(name);
    const def = typeof definition === 'object' && 'icon' in definition ? definition : { icon: definition, code };
    const icon = typeof def.icon === 'string' ? createSapIcon(key, def.icon) : def.icon;
    this.icons.set(key, icon);
    const cp = def.code ?? code;
    if (cp !== undefined && !this.codes.has(cp)) this.codes.set(cp, key);
    return this;
  }

  /** Adds or replaces several icons. */
  registerAll(icons: Record<string, IconDefinition>): this {
    for (const [name, def] of Object.entries(icons)) this.register(name, def);
    return this;
  }

  /** Removes an icon. Returns whether it existed. */
  unregister(name: string): boolean {
    const key = IconRegistry.normalize(name);
    for (const [cp, n] of this.codes) if (n === key) this.codes.delete(cp);
    return this.icons.delete(key);
  }

  /** The registered name an icon reference points to, if any. */
  resolveName(ref: IconRef): string | undefined {
    const cp = codePoint(ref);
    if (cp !== undefined) return this.codes.get(cp);
    const key = IconRegistry.normalize(String(ref));
    return this.icons.has(key) ? key : undefined;
  }

  /** The icon component for a name, URI or code point, or `undefined`. */
  get(ref: IconRef): IconComponent | undefined {
    const name = this.resolveName(ref);
    return name === undefined ? undefined : this.icons.get(name);
  }

  /** Whether an icon is registered for the reference. */
  has(ref: IconRef): boolean {
    return this.resolveName(ref) !== undefined;
  }

  /** The font code point of an icon, if known. */
  codeOf(ref: IconRef): number | undefined {
    const name = this.resolveName(ref);
    if (name === undefined) return undefined;
    for (const [cp, n] of this.codes) if (n === name) return cp;
    return undefined;
  }

  /** All registered names, sorted. */
  get names(): string[] {
    return [...this.icons.keys()].sort();
  }

  /** Number of registered icons. */
  get size(): number {
    return this.icons.size;
  }

  /** A copy that can be changed without affecting this registry, optionally with extra icons. */
  extend(icons?: Record<string, IconDefinition>): IconRegistry {
    const copy = new IconRegistry();
    for (const [name, icon] of this.icons) copy.icons.set(name, icon);
    for (const [cp, name] of this.codes) copy.codes.set(cp, name);
    if (icons) copy.registerAll(icons);
    return copy;
  }

  /** `'sap-icon://Bar-Code'` → `'bar-code'`. */
  private static normalize(name: string): string {
    const trimmed = name.trim();
    return (trimmed.startsWith(URI_PREFIX) ? trimmed.slice(URI_PREFIX.length) : trimmed).toLowerCase();
  }
}
