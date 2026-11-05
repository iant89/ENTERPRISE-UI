/**
 * Icon system types. The core (registry, resolver, definitions) is framework-free: it never
 * touches the DOM or React. Only providers know how an icon is drawn.
 */
import type { CSSProperties, ReactElement, Ref } from 'react';
import type { SapIconName } from '../icon-names.generated';

/**
 * Names of icons added at runtime. Augment it so `<Icon name>` and `icon` props type-check them:
 * `declare module '@enterprise-ui/react' { interface CustomIconNames { 'truck': true } }`.
 */
export interface CustomIconNames {}

/** A plain icon name in the default (`enterprise`) collection, autocompleted and type-checked. */
export type IconName = SapIconName | Extract<keyof CustomIconNames, string>;

/** `collection://name`, for example `enterprise://edit`, `material://edit` or `fontawesome://pen`. */
export type IconUri = `${string}://${string}`;

/** Anything that identifies an icon: a name in the default collection or a `collection://name` URI. */
export type IconId = IconName | IconUri;

/** Semantic sizes, mapped to the `--eui-icon-size-*` design tokens. */
export type IconSizeToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/** A semantic size, a number of pixels, or any CSS length (`'24px'`, `'1em'`). */
export type IconSize = IconSizeToken | number | (string & {});

/** Where an icon's artwork comes from. Each provider understands one or more source types. */
export type IconAssetSource =
  /** One or more SVG path `d` attributes in a view box (default 16×16). */
  | { type: 'svg-path'; d: string | readonly string[]; viewBox?: string }
  /** Trusted SVG markup. It is sanitized (shapes only: no scripts, links, styles or event handlers) before rendering. */
  | { type: 'svg-markup'; markup: string }
  /** An SVG file fetched once, sanitized and cached. */
  | { type: 'svg-url'; url: string }
  /** A glyph in an icon font. */
  | { type: 'glyph'; glyph: string; fontFamily?: string; className?: string }
  /** A Font Awesome icon (`pen` → `fa-pen`), rendered with the app's Font Awesome CSS. */
  | { type: 'fontawesome'; icon: string; style?: string }
  /** A Material Symbols/Icons ligature, rendered with the app's Material font. */
  | { type: 'material'; ligature: string; className?: string }
  /** Data for a custom provider. */
  | { type: 'custom'; data: unknown };

/** Descriptive data used for search, the docs and the Studio Icon Explorer. */
export interface IconMetadata {
  /** Grouping such as `action`, `navigation` or `status`. */
  category?: string;
  /** Extra search terms. */
  keywords?: readonly string[];
  /** Icon font code point, for `&#xe08d;` style look-ups. */
  codePoint?: number;
  /** Points in a reading direction, so it is mirrored in right-to-left layouts. */
  mirrorInRtl?: boolean;
  /** Human-readable name. */
  label?: string;
}

/** A normalized, read-only icon definition. Enough for a provider to draw the icon; no DOM. */
export interface IconDefinition {
  readonly collection: string;
  readonly name: string;
  /** `collection://name`. */
  readonly uri: IconUri;
  /** Name of the provider that draws it. */
  readonly provider: string;
  readonly source: IconAssetSource;
  /** Other names (in the same collection) that resolve to this icon. */
  readonly aliases: readonly string[];
  readonly metadata: Readonly<IconMetadata>;
}

/** Input for `icons.register`. Missing fields are filled from the collection. */
export interface IconRegistration {
  /** @default the default collection */
  collection?: string;
  name: string;
  /** @default the collection's provider */
  provider?: string;
  /**
   * The artwork. A string is shorthand: SVG markup (`'<svg…'`), an SVG path (`'M…'`) or an SVG URL
   * (anything else) for SVG providers; the glyph, icon or ligature name for the others.
   */
  source: string | IconAssetSource;
  aliases?: readonly string[];
  metadata?: IconMetadata;
}

/** Input for `icons.registerCollection`. */
export interface IconCollectionRegistration {
  /** Collection name, used as the URI scheme (`material` → `material://edit`). */
  name: string;
  /** Default provider for its icons. @default 'svg' */
  provider?: string;
  label?: string;
  description?: string;
  /** Icons in the collection. Leave out with `load` for a lazy collection. */
  icons?: readonly Omit<IconRegistration, 'collection'>[];
  /** Aliases within the collection: alias → icon name. */
  aliases?: Readonly<Record<string, string>>;
  /** Other URI schemes for this collection (for example `sap-icon` for `enterprise`). */
  schemes?: readonly string[];
  /**
   * Open collections (such as Material or Font Awesome, which have thousands of icons) create a
   * definition for any name on demand. Return `undefined` for names that don't exist.
   */
  resolveIcon?: (name: string) => Omit<IconRegistration, 'collection' | 'name'> | undefined;
  /** Lazy collection: loads `icons` and `aliases` on first use. */
  load?: () => Promise<Pick<IconCollectionRegistration, 'icons' | 'aliases'>>;
  /** Loads extra metadata (categories, keywords) on request, for search UIs. */
  loadMetadata?: () => Promise<Readonly<Record<string, IconMetadata>>>;
}

/** Read-only information about a registered collection. */
export interface IconCollectionInfo {
  readonly name: string;
  readonly provider: string;
  readonly label: string;
  readonly description?: string;
  readonly schemes: readonly string[];
  /** Number of registered icons (open collections can draw more). */
  readonly size: number;
  readonly open: boolean;
  readonly loaded: boolean;
}

/** Everything a provider needs to draw one icon. Built by the Icon component. */
export interface IconRenderContext {
  /** Class names to apply to the root element (size, mirroring, disabled and the caller's classes). */
  className: string;
  /** Width and height for custom sizes; semantic sizes are handled by `className`. */
  size?: string | number;
  /** Pixel size matching a semantic size, for renderers that need attributes (SVG `width`/`height`); the CSS class takes precedence. */
  fallbackSize?: number;
  style?: CSSProperties;
  /** `role`, `aria-label` or `aria-hidden`, already decided by the component. */
  accessibility: { role?: 'img'; 'aria-label'?: string; 'aria-hidden'?: true };
  /** Tooltip text. */
  title?: string;
  /** Other attributes to forward to the root element (`id`, `data-*`, event handlers…). */
  attributes: Readonly<Record<string, unknown>>;
  ref?: Ref<Element>;
}

/**
 * Draws icons from one kind of source. Providers are independent of the registry: they receive a
 * definition and a render context and return a React element.
 */
export interface IconRenderProvider {
  /** Whether this provider can draw the definition. */
  canRender(definition: IconDefinition): boolean;
  /** Draws the icon. Must be synchronous; use `load` / `isReady` for assets that need fetching. */
  render(definition: IconDefinition, context: IconRenderContext): ReactElement;
  /** For asynchronous assets: whether the icon can be drawn now. @default always ready */
  isReady?(definition: IconDefinition): boolean;
  /** Starts loading an asset. The registry re-renders icons when it settles. */
  load?(definition: IconDefinition): Promise<void>;
}

/** The outcome of resolving an icon identifier. */
export type IconResolution =
  | { status: 'resolved'; definition: IconDefinition; provider: IconRenderProvider; requested: string }
  /** A lazy collection or asset is loading; it will resolve shortly. */
  | { status: 'pending'; requested: string }
  /** No such icon (and no fallback). */
  | { status: 'missing'; requested: string; reason: string };
