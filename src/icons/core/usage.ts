import type { IconDefinition } from './types';

/** Code snippets for using an icon, generated from its definition (for the docs and the Studio). */
export interface IconUsage {
  /** The identifier to use: the plain name for the default collection, otherwise the URI. */
  id: string;
  /** Human-readable name, from the metadata or the icon name. */
  label: string;
  /** `<Icon name="…" />` */
  icon: string;
  /** `<Icon name="…" label="…" />` for icons that carry meaning on their own. */
  labelledIcon: string;
  /** `<Button icon="…">Label</Button>` */
  button: string;
  /** `<IconButton icon="…" label="…" />` */
  iconButton: string;
}

const titleCase = (name: string) => name.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Builds usage snippets for a definition. Icons in `defaultCollection` use the short name (type-checked
 * by `IconName`); others use the full `collection://name` URI.
 */
export function iconUsage(definition: IconDefinition, defaultCollection = 'enterprise'): IconUsage {
  const id = definition.collection === defaultCollection ? definition.name : definition.uri;
  const label = definition.metadata.label ?? titleCase(definition.name);
  return {
    id,
    label,
    icon: `<Icon name="${id}" />`,
    labelledIcon: `<Icon name="${id}" label="${label}" />`,
    button: `<Button icon="${id}">${label}</Button>`,
    iconButton: `<IconButton icon="${id}" label="${label}" />`,
  };
}
