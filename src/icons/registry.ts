/**
 * The library's shared icon registry, `icons`, with the built-in providers and the lazy
 * `enterprise` collection (also reachable as `sap-icon://`).
 */
import { IconRegistry } from './core/IconRegistry';
import { fontAwesomeIconProvider, fontIconProvider, materialIconProvider, svgIconProvider } from './providers/providers';

export const icons = new IconRegistry()
  .addProvider('svg', svgIconProvider)
  .addProvider('font', fontIconProvider)
  .addProvider('fontawesome', fontAwesomeIconProvider)
  .addProvider('material', materialIconProvider)
  .registerCollection({
    name: 'enterprise',
    label: 'Enterprise (SAP icons)',
    description: 'The SAP icon set from src/assets/icons, with aliases for common names.',
    provider: 'svg',
    schemes: ['sap-icon'],
    load: () => import('./collections/enterprise').then((m) => m.enterpriseCollection),
    loadMetadata: () => import('./collections/enterprise').then((m) => m.loadEnterpriseMetadata()),
  });
