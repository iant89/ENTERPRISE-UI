/** The icon system: registry, resolver, providers, collections and types. `<Icon>` lives in components/icon. */
export { icons } from './registry';
export { IconRegistry, type RegisterOptions, type SearchOptions } from './core/IconRegistry';
export type { ResolveOptions } from './core/IconResolver';
export { parseIconId, type ParsedIconId } from './core/identifier';
export { iconUsage, type IconUsage } from './core/usage';
export { svgIconProvider, fontIconProvider, fontAwesomeIconProvider, materialIconProvider } from './providers/providers';
export { fontAwesomeCollection, materialCollection, type FontAwesomeCollectionOptions, type MaterialCollectionOptions } from './collections/fontCollections';
export { renderIconSource, type IconSource } from './IconSource';
export type {
  CustomIconNames, IconAssetSource, IconCollectionInfo, IconCollectionRegistration, IconDefinition, IconId, IconMetadata, IconName,
  IconRegistration, IconRenderContext, IconRenderProvider, IconResolution, IconSize, IconSizeToken, IconUri,
} from './core/types';
export type { SapIconName } from './icon-names.generated';
