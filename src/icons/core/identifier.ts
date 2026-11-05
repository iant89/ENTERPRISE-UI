/** Parsing of icon identifiers. Pure functions, no state. */

/** A parsed identifier: a name (with an optional explicit collection) or an icon-font code point. */
export type ParsedIconId =
  | { kind: 'name'; collection: string | undefined; name: string }
  | { kind: 'codePoint'; codePoint: number };

const SCHEME = /^([a-z][a-z0-9+.-]*):\/\/(.+)$/i;

/** Parses `edit`, `enterprise://edit`, `material://edit`, `0xe08d`, `&#xe08d;`, `U+E08D` or a font glyph. */
export function parseIconId(id: string | number): ParsedIconId | undefined {
  if (typeof id === 'number') return Number.isFinite(id) ? { kind: 'codePoint', codePoint: id } : undefined;
  const text = id.trim();
  if (!text) return undefined;
  const entity = /^&#(x[0-9a-f]+|\d+);?$/i.exec(text);
  if (entity) return { kind: 'codePoint', codePoint: entity[1][0].toLowerCase() === 'x' ? parseInt(entity[1].slice(1), 16) : parseInt(entity[1], 10) };
  const hex = /^(?:U\+|0x)([0-9a-f]{4,6})$/i.exec(text);
  if (hex) return { kind: 'codePoint', codePoint: parseInt(hex[1], 16) };
  if ([...text].length === 1) {
    const cp = text.codePointAt(0)!;
    // A single Private Use Area character is an icon-font glyph.
    if (cp >= 0xe000 && cp <= 0xf8ff) return { kind: 'codePoint', codePoint: cp };
  }
  const uri = SCHEME.exec(text);
  if (uri) return { kind: 'name', collection: uri[1].toLowerCase(), name: normalizeName(uri[2]) };
  return { kind: 'name', collection: undefined, name: normalizeName(text) };
}

/** Icon names are case-insensitive and trimmed. */
export const normalizeName = (name: string) => name.trim().toLowerCase();

/** Builds `collection://name`. */
export const toUri = (collection: string, name: string) => `${collection}://${name}` as const;
