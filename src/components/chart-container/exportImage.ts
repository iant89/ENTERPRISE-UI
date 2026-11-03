import type { ChartLegendItem } from '../chart-core/ChartFrame';

/** One chart to draw into an exported image. */
export interface ChartImageEntry {
  label: string;
  svg: SVGSVGElement;
  legend: ChartLegendItem[];
}

export interface ChartImageOptions {
  /** Heading drawn above the charts. */
  title?: string;
  /** Element whose theme (colors, font) the image uses: usually the container. */
  themeSource: Element;
  /** Pixel ratio of the bitmap. @default 2 */
  scale?: number;
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const PAD = 24;
/** Presentation properties copied from the live chart so CSS variables and classes survive serialization. */
const PROPS = ['fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'opacity', 'font-family', 'font-size', 'font-weight', 'font-variant-numeric', 'shape-rendering'];

/** Resolves a CSS color (including `var()`, `light-dark()` and `color-mix()`) to a concrete value in the element's theme. */
function resolveColor(context: Element, value: string): string {
  const probe = document.createElement('span');
  probe.style.color = value;
  probe.style.display = 'none';
  context.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return resolved || value;
}

let measureCanvas: HTMLCanvasElement | null = null;
function textWidth(text: string, font: string): number {
  try {
    measureCanvas ??= document.createElement('canvas');
    const ctx = measureCanvas.getContext('2d');
    if (ctx) {
      ctx.font = font;
      return ctx.measureText(text).width;
    }
  } catch {
    // jsdom and locked-down contexts have no canvas; fall through to an estimate.
  }
  return text.length * 7;
}

/** Copies computed presentation styles from `source` onto `target`, element by element. */
function inlineStyles(source: Element, target: Element) {
  const sources = [source, ...source.querySelectorAll('*')];
  const targets = [target, ...target.querySelectorAll('*')];
  sources.forEach((el, i) => {
    const out = targets[i] as SVGElement | undefined;
    if (!out) return;
    const cs = getComputedStyle(el);
    for (const prop of PROPS) {
      const value = cs.getPropertyValue(prop);
      if (value) out.setAttribute(prop, value);
    }
    out.removeAttribute('class');
  });
}

function el<K extends keyof SVGElementTagNameMap>(name: K, attrs: Record<string, string | number>, text?: string): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * Builds one standalone SVG with the title, every chart and its legend, using the colors and font
 * of the current theme. Exported for testing and for applications that want the SVG itself.
 */
export function composeChartSvg(entries: ChartImageEntry[], { title, themeSource }: ChartImageOptions): { svg: SVGSVGElement; width: number; height: number } {
  const cs = getComputedStyle(themeSource);
  const font = cs.fontFamily || 'Arial, sans-serif';
  const text = resolveColor(themeSource, 'var(--eui-color-text)');
  const secondary = resolveColor(themeSource, 'var(--eui-color-text-secondary)');
  const background = resolveColor(themeSource, 'var(--eui-color-surface)');

  const chartWidth = Math.max(...entries.map((e) => e.svg.getBoundingClientRect().width || Number(e.svg.getAttribute('width')) || 480), 240);
  const width = Math.ceil(chartWidth + PAD * 2);
  const root = el('svg', { xmlns: SVG_NS, 'font-family': font });
  const content: SVGElement[] = [];
  let y = PAD;

  if (title) {
    content.push(el('text', { x: PAD, y: y + 14, fill: text, 'font-size': 16, 'font-weight': 600 }, title));
    y += 32;
  }
  entries.forEach((entry, index) => {
    if (index > 0) y += 16;
    if (entries.length > 1 || !title) {
      content.push(el('text', { x: PAD, y: y + 11, fill: secondary, 'font-size': 13 }, entry.label));
      y += 22;
    }
    const clone = entry.svg.cloneNode(true) as SVGSVGElement;
    inlineStyles(entry.svg, clone);
    const w = Number(entry.svg.getAttribute('width')) || chartWidth;
    const h = Number(entry.svg.getAttribute('height')) || 240;
    clone.setAttribute('x', String(PAD));
    clone.setAttribute('y', String(y));
    clone.setAttribute('width', String(w));
    clone.setAttribute('height', String(h));
    clone.setAttribute('overflow', 'visible');
    clone.removeAttribute('aria-hidden');
    clone.removeAttribute('style');
    content.push(clone);
    y += h + 12;

    // Legend rows, wrapped to the chart width.
    if (entry.legend.length >= 2) {
      let x = PAD;
      const row = 20;
      entry.legend.forEach((item) => {
        const label = item.value ? `${item.label}  ${item.value}` : item.label;
        const itemWidth = 16 + textWidth(label, `13px ${font}`) + 18;
        if (x > PAD && x + itemWidth > PAD + chartWidth) {
          x = PAD;
          y += row;
        }
        const color = resolveColor(themeSource, item.color);
        content.push(
          item.dashed
            ? el('line', { x1: x, x2: x + 12, y1: y + 7, y2: y + 7, stroke: color, 'stroke-width': 2, 'stroke-dasharray': '3 2' })
            : el('rect', { x, y: y + 2, width: 10, height: 10, rx: 2, fill: color }),
        );
        content.push(el('text', { x: x + 16, y: y + 11, fill: text, 'font-size': 13 }, item.label));
        if (item.value) content.push(el('text', { x: x + 16 + textWidth(`${item.label}  `, `13px ${font}`), y: y + 11, fill: secondary, 'font-size': 13 }, item.value));
        x += itemWidth;
      });
      y += row;
    }
  });

  const height = Math.ceil(y + PAD);
  root.setAttribute('width', String(width));
  root.setAttribute('height', String(height));
  root.setAttribute('viewBox', `0 0 ${width} ${height}`);
  root.appendChild(el('rect', { width, height, fill: background }));
  content.forEach((node) => root.appendChild(node));
  return { svg: root, width, height };
}

/** Renders the charts to a PNG or JPEG blob. Resolves to `null` where canvas export is unavailable. */
export async function renderChartImage(entries: ChartImageEntry[], format: 'png' | 'jpeg', options: ChartImageOptions): Promise<Blob | null> {
  const { svg, width, height } = composeChartSvg(entries, options);
  const scale = options.scale ?? 2;
  const markup = new XMLSerializer().serializeToString(svg);
  const image = new Image();
  image.decoding = 'async';
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.scale(scale, scale);
  ctx.drawImage(image, 0, 0, width, height);
  return new Promise((resolve) => canvas.toBlob(resolve, format === 'png' ? 'image/png' : 'image/jpeg', 0.92));
}
