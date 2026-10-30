import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../utilities/cx';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { ThemeContext, useThemeContext, type Density, type ThemeName, type ThemePreference, type ThemeContextValue } from './ThemeContext';
import styles from './ThemeProvider.module.css';

export interface ThemeProviderProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Color theme. `system` follows the operating system's light/dark and
   * increased-contrast preferences.
   * @default 'light'
   */
  theme?: ThemePreference;
  /**
   * Density: `cozy` is touch friendly, `compact` fits more data on screen.
   * @default 'cozy'
   */
  density?: Density;
  /** Forces reduced motion regardless of the OS preference. */
  reducedMotion?: boolean;
  /**
   * Leaves the background transparent instead of painting the theme's
   * application background.
   * @default false
   */
  transparent?: boolean;
  children?: ReactNode;
}

/**
 * Applies a theme and density to its subtree, hosts the overlay layer used by
 * popovers and dialogs, and provides a screen-reader live region.
 */
export function ThemeProvider({
  theme = 'light',
  density = 'cozy',
  reducedMotion,
  transparent = false,
  className,
  children,
  ...rest
}: ThemeProviderProps) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const prefersContrast = useMediaQuery('(prefers-contrast: more)');
  const resolvedTheme: ThemeName =
    theme === 'system' ? (prefersContrast ? 'high-contrast' : prefersDark ? 'dark' : 'light') : theme;

  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [messages, setMessages] = useState<{ polite: string; assertive: string }>({ polite: '', assertive: '' });
  type Politeness = 'polite' | 'assertive';
  // One pending frame and one clear timer per politeness level, so an assertive message is not wiped by a later polite one.
  const frames = useRef<Partial<Record<Politeness, number>>>({});
  const clearTimers = useRef<Partial<Record<Politeness, ReturnType<typeof setTimeout>>>>({});

  const announce = useCallback((message: string, politeness: Politeness = 'polite') => {
    // Clear the region first so that repeating the same message is announced again.
    setMessages((m) => ({ ...m, [politeness]: '' }));
    const frame = frames.current[politeness];
    if (frame !== undefined) cancelAnimationFrame(frame);
    frames.current[politeness] = requestAnimationFrame(() => {
      frames.current[politeness] = undefined;
      setMessages((m) => ({ ...m, [politeness]: message }));
    });
    clearTimeout(clearTimers.current[politeness]);
    clearTimers.current[politeness] = setTimeout(() => setMessages((m) => ({ ...m, [politeness]: '' })), 7000);
  }, []);

  useEffect(() => () => {
    for (const frame of Object.values(frames.current)) if (frame !== undefined) cancelAnimationFrame(frame);
    for (const timer of Object.values(clearTimers.current)) clearTimeout(timer);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, density, portalContainer, announce }),
    [theme, resolvedTheme, density, portalContainer, announce],
  );

  return (
    <ThemeContext.Provider value={value}>
      <div
        data-eui-theme={resolvedTheme}
        data-eui-density={density}
        data-eui-motion={reducedMotion ? 'reduced' : undefined}
        className={cx(styles.root, transparent && styles.transparent, className)}
        {...rest}
      >
        {children}
        <div className="eui-visually-hidden" aria-live="polite" aria-atomic="true">
          {messages.polite}
        </div>
        <div className="eui-visually-hidden" aria-live="assertive" aria-atomic="true">
          {messages.assertive}
        </div>
        <div ref={setPortalContainer} className={styles.layer} data-eui-portal="" />
      </div>
    </ThemeContext.Provider>
  );
}

/** Reads the active theme, density and announcer. */
export function useTheme(): ThemeContextValue {
  const ctx = useThemeContext();
  return (
    ctx ?? {
      theme: 'light',
      resolvedTheme: 'light',
      density: 'cozy',
      portalContainer: null,
      announce: () => {},
    }
  );
}

/** Returns a function that announces a message to screen readers. */
export function useAnnouncer(): ThemeContextValue['announce'] {
  return useTheme().announce;
}
