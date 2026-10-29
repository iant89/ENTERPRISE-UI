import { createContext, useContext } from 'react';

export interface AppShellContextValue {
  /** Side navigation shows icons only. */
  navCollapsed: boolean;
  setNavCollapsed: (collapsed: boolean) => void;
  /** Phone layout: navigation renders as an overlay drawer. */
  isMobile: boolean;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  /** Toggles the drawer on phones and collapsed mode elsewhere. */
  toggleNav: () => void;
  hasNavigation: boolean;
  navId: string;
}

export const AppShellContext = createContext<AppShellContextValue | null>(null);

/** Access the surrounding AppShell (navigation state). Returns null outside a shell. */
export const useAppShell = () => useContext(AppShellContext);
