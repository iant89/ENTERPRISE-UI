/**
 * Collections for icon fonts the app already uses. They are "open": any icon name is accepted and
 * drawn with the font's own classes, so nothing needs listing and the library adds no dependency.
 * Register them when your app loads the font:
 *
 *   icons.registerCollection(fontAwesomeCollection());   // fontawesome://pen
 *   icons.registerCollection(materialCollection());      // material://edit
 */
import type { IconCollectionRegistration } from '../core/types';

const VALID = /^[a-z0-9][a-z0-9_-]*$/;

export interface FontAwesomeCollectionOptions {
  /** Collection name and URI scheme. @default 'fontawesome' */
  name?: string;
  /** Style class: `fa-solid`, `fa-regular`, `fa-light` (Pro), `fa-brands`… @default 'fa-solid' */
  style?: string;
  /** Aliases: alias → Font Awesome icon name (for example `{ edit: 'pen' }`). */
  aliases?: Record<string, string>;
}

/** Font Awesome icons by name (`fontawesome://pen` → `<i class="fa-solid fa-pen">`). Requires the app's Font Awesome CSS. */
export function fontAwesomeCollection(options: FontAwesomeCollectionOptions = {}): IconCollectionRegistration {
  return {
    name: options.name ?? 'fontawesome',
    label: 'Font Awesome',
    provider: 'fontawesome',
    schemes: options.name ? [] : ['fa'],
    aliases: options.aliases,
    resolveIcon: (name) => (VALID.test(name) ? { source: { type: 'fontawesome', icon: name, style: options.style } } : undefined),
  };
}

export interface MaterialCollectionOptions {
  /** Collection name and URI scheme. @default 'material' */
  name?: string;
  /** Font class: `material-symbols-outlined`, `material-symbols-rounded`, `material-icons`… @default 'material-symbols-outlined' */
  className?: string;
  /** Aliases: alias → Material icon name. */
  aliases?: Record<string, string>;
}

/** Material Symbols / Icons by ligature (`material://arrow-back` → `arrow_back`). Requires the app's Material font. */
export function materialCollection(options: MaterialCollectionOptions = {}): IconCollectionRegistration {
  return {
    name: options.name ?? 'material',
    label: 'Material Symbols',
    provider: 'material',
    aliases: options.aliases,
    resolveIcon: (name) => (VALID.test(name) ? { source: { type: 'material', ligature: name.replace(/-/g, '_'), className: options.className } } : undefined),
  };
}
