import type { IconRegistration } from '../../core/types';

/**
 * Reads one icon file from src/assets/icons: a single 16×16 path, `data-code` (hex code point) and
 * `data-rtl="flip"`. Kept separate from the collection so single-icon users don't load the whole set.
 */
export function definitionFromSvg(name: string, svg: string): Omit<IconRegistration, 'collection'> {
  const hex = /data-code="([0-9a-f]+)"/i.exec(svg)?.[1];
  return {
    name,
    source: { type: 'svg-path', d: / d="([^"]+)"/.exec(svg)?.[1] ?? '' },
    metadata: { codePoint: hex ? parseInt(hex, 16) : undefined, mirrorInRtl: /data-rtl="flip"/.test(svg) },
  };
}
