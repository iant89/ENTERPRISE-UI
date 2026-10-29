import { basename } from 'node:path';

/**
 * Stable, readable class names for CSS Modules: `eui-Button-root`.
 * Deterministic output keeps visual-regression snapshots and consumer
 * overrides stable between releases.
 */
export function cssModuleClassName(local: string, filename: string): string {
  const file = basename(filename).replace(/\.module\.css(\?.*)?$/, '');
  return `eui-${file}-${local}`;
}
