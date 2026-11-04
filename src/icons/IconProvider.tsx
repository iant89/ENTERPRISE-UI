import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { IconRegistry, type IconComponent, type IconDefinition, type IconRef } from './IconRegistry';

const IconRegistryContext = createContext<IconRegistry | null>(null);

export interface IconProviderProps {
  /** Registry to use. Defaults to the parent provider's registry, or the full SAP icon set at the top level. */
  registry?: IconRegistry;
  /** Icons to add or override for this subtree (a component or a 16×16 SVG path per name). */
  icons?: Record<string, IconDefinition>;
  children?: ReactNode;
}

/**
 * Makes an IconRegistry available to `<Icon name="…" />` and `useIcon`. Without props it provides
 * every SAP icon. Nest providers to add or override icons for part of the app.
 *
 * Note: the default SAP registry includes all 700+ icons in the bundle. Import icon components
 * directly (`BellIcon`) where bundle size matters.
 */
export function IconProvider({ registry, icons, children }: IconProviderProps) {
  const parent = useContext(IconRegistryContext);
  const value = useMemo(() => {
    const base = registry ?? parent ?? IconRegistry.sap();
    return icons ? base.extend(icons) : base;
  }, [registry, parent, icons]);
  return <IconRegistryContext.Provider value={value}>{children}</IconRegistryContext.Provider>;
}

/** The nearest IconProvider's registry, or `null` outside a provider. */
export function useIconRegistry(): IconRegistry | null {
  return useContext(IconRegistryContext);
}

/** Resolves an icon by name, `sap-icon://` URI or code point from the nearest IconProvider. */
export function useIcon(ref: IconRef | undefined): IconComponent | undefined {
  const registry = useContext(IconRegistryContext);
  return ref === undefined || !registry ? undefined : registry.get(ref);
}
