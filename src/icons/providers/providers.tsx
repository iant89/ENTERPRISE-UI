/**
 * Built-in rendering providers. Each one owns how a kind of source is drawn; the registry, the
 * resolver and the Icon component never branch on the provider type.
 */
import { createElement, type ReactElement, type ReactNode, type Ref } from 'react';
import { cx } from '../../utilities/cx';
import type { IconDefinition, IconRenderContext, IconRenderProvider } from '../core/types';
import { sanitizeSvg, type SafeSvg, type SafeSvgNode } from './sanitizeSvg';

/** Attributes every provider puts on its root element. */
function rootProps(definition: IconDefinition, context: IconRenderContext, extraClass?: string) {
  return {
    ...context.attributes,
    ...context.accessibility,
    'data-icon': definition.uri,
    className: cx('eui-icon', extraClass, definition.metadata.mirrorInRtl && 'eui-icon-rtl-flip', context.className),
  };
}

// ── SVG ─────────────────────────────────────────────────────────────────────

const nodeToElement = (node: SafeSvgNode, key: number): ReactElement =>
  createElement(node.tag, { key, ...node.attributes }, ...node.children.map(nodeToElement));

function svgElement(definition: IconDefinition, context: IconRenderContext, viewBox: string, children: ReactNode): ReactElement {
  const size = context.size ?? context.fallbackSize;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={size}
      height={size}
      fill="currentColor"
      focusable="false"
      style={context.style}
      ref={context.ref as Ref<SVGSVGElement> | undefined}
      {...rootProps(definition, context, 'eui-icon-svg')}
    >
      {context.title && <title>{context.title}</title>}
      {children}
    </svg>
  );
}

/** SVG files fetched by URL: fetched once per URL, sanitized and shared. */
const urlCache = new Map<string, SafeSvg>();
const urlRequests = new Map<string, Promise<void>>();

/**
 * Draws SVG icons from paths, trusted markup (sanitized) or URLs (fetched once and sanitized).
 * Renders a real `<svg>`, so icons follow `currentColor` and CSS sizing.
 */
export const svgIconProvider: IconRenderProvider = {
  canRender: (d) => d.source.type === 'svg-path' || d.source.type === 'svg-markup' || d.source.type === 'svg-url',
  isReady: (d) => d.source.type !== 'svg-url' || urlCache.has(d.source.url),
  load(d) {
    if (d.source.type !== 'svg-url') return Promise.resolve();
    const { url } = d.source;
    let request = urlRequests.get(url);
    if (!request) {
      request = fetch(url)
        .then((response) => (response.ok ? response.text() : Promise.reject(new Error(`HTTP ${response.status}`))))
        .then((text) => { urlCache.set(url, sanitizeSvg(text)); })
        .catch((error: unknown) => { urlCache.set(url, { viewBox: '0 0 16 16', nodes: [] }); throw error; });
      urlRequests.set(url, request);
    }
    return request;
  },
  render(definition, context) {
    const source = definition.source;
    if (source.type === 'svg-path') {
      const paths = typeof source.d === 'string' ? [source.d] : source.d;
      return svgElement(definition, context, source.viewBox ?? '0 0 16 16', paths.map((d, i) => <path key={i} d={d} />));
    }
    const safe = source.type === 'svg-markup' ? sanitizeSvg(source.markup) : source.type === 'svg-url' ? urlCache.get(source.url) : undefined;
    return svgElement(definition, context, safe?.viewBox ?? '0 0 16 16', safe?.nodes.map(nodeToElement));
  },
};

// ── Fonts ───────────────────────────────────────────────────────────────────

function fontElement(definition: IconDefinition, context: IconRenderContext, className: string | undefined, text: string | undefined, fontFamily?: string): ReactElement {
  const size = typeof context.size === 'number' ? `${context.size}px` : context.size;
  return (
    <span
      title={context.title}
      ref={context.ref as Ref<HTMLSpanElement> | undefined}
      style={{ ...(fontFamily ? { fontFamily } : null), ...(size ? { fontSize: size, inlineSize: size, blockSize: size } : null), ...context.style }}
      {...rootProps(definition, context, cx('eui-icon-font', className))}
    >
      {text}
    </span>
  );
}

/** Draws a glyph from an icon font (`{ type: 'glyph', glyph: '', fontFamily: 'SAP-icons' }`). The app loads the font. */
export const fontIconProvider: IconRenderProvider = {
  canRender: (d) => d.source.type === 'glyph',
  render(definition, context) {
    const source = definition.source as Extract<IconDefinition['source'], { type: 'glyph' }>;
    return fontElement(definition, context, source.className, source.glyph, source.fontFamily);
  },
};

/**
 * Draws Font Awesome icons with Font Awesome's own classes (`fa-solid fa-pen`). Uses whatever Font
 * Awesome setup the app already loads (Free or Pro); the library adds no dependency.
 */
export const fontAwesomeIconProvider: IconRenderProvider = {
  canRender: (d) => d.source.type === 'fontawesome',
  render(definition, context) {
    const source = definition.source as Extract<IconDefinition['source'], { type: 'fontawesome' }>;
    const style = source.style ?? 'fa-solid';
    return fontElement(definition, context, cx(style.startsWith('fa') ? style : `fa-${style}`, `fa-${source.icon}`), undefined);
  },
};

/**
 * Draws Material Symbols / Material Icons by ligature (`<span class="material-symbols-outlined">edit</span>`).
 * Uses the Material font the app already loads; the library adds no dependency.
 */
export const materialIconProvider: IconRenderProvider = {
  canRender: (d) => d.source.type === 'material',
  render(definition, context) {
    const source = definition.source as Extract<IconDefinition['source'], { type: 'material' }>;
    return fontElement(definition, context, source.className ?? 'material-symbols-outlined', source.ligature);
  },
};
