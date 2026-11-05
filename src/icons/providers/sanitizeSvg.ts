/**
 * Safe SVG handling: markup is parsed and rebuilt from an allowlist of shape elements and drawing
 * attributes. Scripts, foreign content, links, styles and event handlers are dropped, and nothing is
 * ever assigned to innerHTML.
 */

/** A sanitized SVG: its view box and a tree of allowed shapes. */
export interface SafeSvg {
  viewBox: string;
  nodes: SafeSvgNode[];
}

export interface SafeSvgNode {
  tag: string;
  /** React-style attribute names (`strokeWidth`). */
  attributes: Record<string, string>;
  children: SafeSvgNode[];
}

const TAGS = new Set(['g', 'path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon']);

/** Allowed attributes → React prop names. */
const ATTRIBUTES: Record<string, string> = {
  d: 'd', cx: 'cx', cy: 'cy', r: 'r', rx: 'rx', ry: 'ry', x: 'x', y: 'y', x1: 'x1', y1: 'y1', x2: 'x2', y2: 'y2',
  width: 'width', height: 'height', points: 'points', transform: 'transform', opacity: 'opacity',
  fill: 'fill', 'fill-rule': 'fillRule', 'fill-opacity': 'fillOpacity', 'clip-rule': 'clipRule',
  stroke: 'stroke', 'stroke-width': 'strokeWidth', 'stroke-linecap': 'strokeLinecap', 'stroke-linejoin': 'strokeLinejoin',
  'stroke-miterlimit': 'strokeMiterlimit', 'stroke-dasharray': 'strokeDasharray', 'stroke-dashoffset': 'strokeDashoffset', 'stroke-opacity': 'strokeOpacity',
};

/** Rejects values that could reference external resources or run code. */
const safeValue = (value: string) => !/url\s*\(|javascript:|expression\s*\(|[<>]/i.test(value);

const cache = new Map<string, SafeSvg>();

/** Parses and sanitizes SVG markup. Returns an empty drawing for anything that isn't an SVG. */
export function sanitizeSvg(markup: string): SafeSvg {
  const cached = cache.get(markup);
  if (cached) return cached;
  const result = typeof DOMParser !== 'undefined' ? withDomParser(markup) : withoutDomParser(markup);
  cache.set(markup, result);
  return result;
}

function withDomParser(markup: string): SafeSvg {
  const doc = new DOMParser().parseFromString(markup, 'image/svg+xml');
  const root = doc.documentElement;
  if (!root || root.nodeName.toLowerCase() !== 'svg' || doc.getElementsByTagName('parsererror').length) return { viewBox: '0 0 16 16', nodes: [] };
  const walk = (element: Element): SafeSvgNode[] => {
    const out: SafeSvgNode[] = [];
    for (const child of Array.from(element.children)) {
      const tag = child.localName.toLowerCase();
      if (!TAGS.has(tag)) continue;
      const attributes: Record<string, string> = {};
      for (const attr of Array.from(child.attributes)) {
        const prop = ATTRIBUTES[attr.name.toLowerCase()];
        if (prop && safeValue(attr.value)) attributes[prop] = attr.value;
      }
      out.push({ tag, attributes, children: tag === 'g' ? walk(child) : [] });
    }
    return out;
  };
  return { viewBox: viewBoxOf(root.getAttribute('viewBox'), root.getAttribute('width'), root.getAttribute('height')), nodes: walk(root) };
}

/** Server-side fallback without a DOM: keeps `<path d>` elements only. */
function withoutDomParser(markup: string): SafeSvg {
  if (!/^\s*<svg[\s>]/i.test(markup)) return { viewBox: '0 0 16 16', nodes: [] };
  const viewBox = /viewBox="([^"]+)"/i.exec(markup)?.[1];
  const nodes = [...markup.matchAll(/<path\b[^>]*\sd="([^"]+)"[^>]*>/gi)].filter((m) => safeValue(m[1])).map((m) => ({ tag: 'path', attributes: { d: m[1] }, children: [] }));
  return { viewBox: viewBoxOf(viewBox ?? null, null, null), nodes };
}

function viewBoxOf(viewBox: string | null, width: string | null, height: string | null): string {
  if (viewBox && /^[\d.\s,-]+$/.test(viewBox)) return viewBox.trim();
  const w = parseFloat(width ?? ''), h = parseFloat(height ?? '');
  return w > 0 && h > 0 ? `0 0 ${w} ${h}` : '0 0 24 24';
}
