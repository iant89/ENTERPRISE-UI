import { createContext, useContext } from 'react';

export type ThemeName =
  | 'light'
  | 'dark'
  | 'high-contrast'
  /** SAP Morning Horizon (sap_horizon). */
  | 'sap-horizon'
  /** SAP Evening Horizon (sap_horizon_dark). */
  | 'sap-horizon-dark'
  /** SAP Quartz Light (sap_fiori_3). */
  | 'sap-fiori-3'
  /** SAP Quartz Dark (sap_fiori_3_dark). */
  | 'sap-fiori-3-dark';

/** Every built-in theme with its display label, in switcher order. */
export const THEMES: ReadonlyArray<{ name: ThemeName; label: string; scheme: 'light' | 'dark' }> = [
  { name: 'light', label: 'Light', scheme: 'light' },
  { name: 'dark', label: 'Dark', scheme: 'dark' },
  { name: 'high-contrast', label: 'High contrast', scheme: 'dark' },
  { name: 'sap-horizon', label: 'Morning Horizon', scheme: 'light' },
  { name: 'sap-horizon-dark', label: 'Evening Horizon', scheme: 'dark' },
  { name: 'sap-fiori-3', label: 'Quartz Light', scheme: 'light' },
  { name: 'sap-fiori-3-dark', label: 'Quartz Dark', scheme: 'dark' },
];
export type ThemePreference = ThemeName | 'system';
export type Density = 'cozy' | 'compact';

export interface ThemeContextValue {
  /** The preference passed to the provider (may be `system`). */
  theme: ThemePreference;
  /** The theme actually applied. */
  resolvedTheme: ThemeName;
  density: Density;
  /** Element that floating UI (popovers, dialogs, toasts) portals into. */
  portalContainer: HTMLElement | null;
  /** Sends a message to the screen-reader live region. */
  announce: (message: string, politeness?: 'polite' | 'assertive') => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useThemeContext(): ThemeContextValue | null {
  return useContext(ThemeContext);
}
