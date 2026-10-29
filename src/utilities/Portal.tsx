import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useThemeContext } from '../themes/ThemeContext';

export interface PortalProps {
  children: ReactNode;
  /** Explicit target. Defaults to the nearest ThemeProvider's layer, then `document.body`. */
  container?: HTMLElement | null;
}

/**
 * Renders children into the active theme's overlay layer so floating UI
 * inherits theme tokens and escapes overflow/stacking contexts.
 */
export function Portal({ children, container }: PortalProps) {
  const theme = useThemeContext();
  // Render immediately on the client so floating UI can be measured in the same commit.
  const [mounted, setMounted] = useState(() => typeof document !== 'undefined');
  useEffect(() => setMounted(true), []);
  if (!mounted || typeof document === 'undefined') return null;
  // Inside a ThemeProvider, wait for its overlay layer instead of rendering into
  // <body> first (which would remount the content once the layer exists).
  if (!container && theme && !theme.portalContainer) return null;
  const target = container ?? theme?.portalContainer ?? document.body;
  return createPortal(children, target);
}
