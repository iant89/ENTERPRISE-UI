export type ClassValue = string | number | bigint | boolean | null | undefined | ClassValue[];

/** Joins truthy class names. A tiny, dependency-free `clsx`. */
export function cx(...values: ClassValue[]): string {
  let out = '';
  for (const value of values) {
    if (!value || value === true) continue;
    const next = Array.isArray(value) ? cx(...value) : String(value);
    if (next) out = out ? `${out} ${next}` : next;
  }
  return out;
}
