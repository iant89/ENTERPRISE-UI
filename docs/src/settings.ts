import { useEffect, useState } from 'react';
import type { Density, ThemePreference } from '@enterprise-ui/react';

const read = <T extends string>(key: string, fallback: T): T => {
  try {
    return (localStorage.getItem(key) as T | null) ?? fallback;
  } catch {
    return fallback;
  }
};

/** Persists the reader's theme and density preference (per browser). */
export function useDocsSettings() {
  const [theme, setTheme] = useState<ThemePreference>(() => read('eui-docs-theme', 'light'));
  const [density, setDensity] = useState<Density>(() => read('eui-docs-density', 'cozy'));
  useEffect(() => {
    try {
      localStorage.setItem('eui-docs-theme', theme);
      localStorage.setItem('eui-docs-density', density);
    } catch {
      /* storage unavailable */
    }
  }, [theme, density]);
  return { theme, setTheme, density, setDensity };
}
