/**
 * Allowlist HTML sanitizer for the rich text editor. Everything not listed is removed (its text is
 * kept); attributes are dropped except a link's `href`, which must be http(s) or mailto.
 */
const BLOCK_RENAME: Record<string, string> = { DIV: 'p', H1: 'p', H2: 'p', H3: 'p', H4: 'p', H5: 'p', H6: 'p', B: 'strong', I: 'em' };
const ALLOWED = new Set(['P', 'BR', 'STRONG', 'EM', 'U', 'UL', 'OL', 'LI', 'A']);
const DROP_WITH_CONTENT = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'TEMPLATE', 'NOSCRIPT', 'SVG', 'MATH', 'HEAD', 'TITLE', 'META', 'LINK']);

export function safeHref(href: string | null): string | null {
  if (!href) return null;
  const trimmed = href.trim();
  try {
    const url = new URL(trimmed, 'https://placeholder.invalid');
    if (!['http:', 'https:', 'mailto:'].includes(url.protocol)) return null;
    // Relative links are not meaningful in stored rich text.
    if (url.host === 'placeholder.invalid') return null;
    return trimmed;
  } catch {
    return null;
  }
}

function clean(node: Node, doc: Document): Node[] {
  if (node.nodeType === Node.TEXT_NODE) return [doc.createTextNode(node.textContent ?? '')];
  if (node.nodeType !== Node.ELEMENT_NODE) return [];
  const el = node as Element;
  const tag = el.tagName.toUpperCase();
  if (DROP_WITH_CONTENT.has(tag)) return [];
  const children = [...el.childNodes].flatMap((c) => clean(c, doc));
  const name = BLOCK_RENAME[tag] ?? tag.toLowerCase();
  if (!ALLOWED.has(name.toUpperCase())) return children;
  const out = doc.createElement(name);
  if (name === 'a') {
    const href = safeHref(el.getAttribute('href'));
    if (!href) return children;
    out.setAttribute('href', href);
    out.setAttribute('rel', 'noopener noreferrer');
  }
  children.forEach((c) => out.appendChild(c));
  return [out];
}

/** Returns sanitized HTML using only p, br, strong, em, u, ul, ol, li and safe links. */
export function sanitizeRichText(html: string): string {
  if (typeof DOMParser === 'undefined') return html.replace(/<[^>]*>/g, '');
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  const out = doc.createElement('div');
  [...doc.body.childNodes].flatMap((n) => clean(n, doc)).forEach((n) => out.appendChild(n));
  return out.innerHTML;
}

/** Plain text of rich text HTML (for character counts and previews). */
export function richTextToPlain(html: string): string {
  if (typeof DOMParser === 'undefined') return html.replace(/<[^>]*>/g, '');
  const doc = new DOMParser().parseFromString(`<body>${html.replace(/<\/(p|li)>/g, '</$1>\n').replace(/<br\s*\/?>/g, '\n')}</body>`, 'text/html');
  return (doc.body.textContent ?? '').replace(/\n+$/, '');
}
