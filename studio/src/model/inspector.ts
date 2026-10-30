import type { AttrValue } from './jsx';

/** Editor widget for a property, inferred from its TypeScript type. */
export type Widget =
  | { kind: 'boolean' }
  | { kind: 'select'; options: string[]; numeric: boolean }
  | { kind: 'number' }
  | { kind: 'text' }
  | { kind: 'code' };

const strip = (type: string) => type.replace(/\s*\|\s*(undefined|null)\b/g, '').trim();

export function widgetFor(type: string): Widget {
  const t = strip(type);
  if (t === 'boolean' || t === 'true | false' || t === 'false | true') return { kind: 'boolean' };
  if (t === 'number') return { kind: 'number' };
  if (t === 'string' || t === 'ReactNode' || t === 'string | number' || t === 'number | string') return { kind: 'text' };
  const parts = t.split('|').map((p) => p.trim());
  if (parts.length > 1 && parts.every((p) => /^"[^"]*"$/.test(p))) return { kind: 'select', options: parts.map((p) => p.slice(1, -1)), numeric: false };
  if (parts.length > 1 && parts.every((p) => /^-?\d+(\.\d+)?$/.test(p))) return { kind: 'select', options: parts, numeric: true };
  return { kind: 'code' };
}

/** Value shown in a widget for the current attribute, or `undefined` when it is not set. */
export function displayValue(value: AttrValue | undefined): string | number | boolean | undefined {
  if (!value) return undefined;
  if (value.kind === 'expression') return value.text;
  return value.value;
}

export interface PropMeta {
  name: string;
  type: string;
  description?: string;
  default?: string;
  required?: boolean;
}

/** Splits props into the inspector tabs, matching the docs' Properties / Events / States grouping. */
export function groupInspectorProps(props: PropMeta[]) {
  const events = props.filter((p) => /^on[A-Z]/.test(p.name));
  const states = props.filter((p) => !events.includes(p) && /^(disabled|readOnly|loading|busy|invalid|required|selected|checked|open|expanded|active|pressed|error|status)$/.test(p.name));
  const properties = props.filter((p) => !events.includes(p) && !states.includes(p) && p.name !== 'children' && p.name !== 'className' && p.name !== 'style');
  return { properties, events, states };
}
