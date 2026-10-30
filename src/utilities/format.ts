/** Returns up to two initials for a person or object name. */
export function getInitials(name: string): string {
  // Array.from splits by code point, so names that start with an emoji or astral character are not cut in half.
  const parts = name.trim().split(/\s+/).filter(Boolean).map((part) => Array.from(part));
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).join('').toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Deterministic small hash, used to pick accent colors. */
export function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
