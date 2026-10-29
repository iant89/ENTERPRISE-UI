import { createContext, useContext } from 'react';

export type ThemeName = 'light' | 'dark' | 'high-contrast';
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
