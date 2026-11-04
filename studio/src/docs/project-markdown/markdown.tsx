/**
 * Code Studio C7: a small safe Markdown subset for `*.docs.md` (§7.4). Parses to blocks and renders a
 * React element tree; there is no `dangerouslySetInnerHTML`, so raw HTML is plain text and scripts
 * never run. Links allow http(s) and relative targets only.
 */
import { Fragment, type ReactNode } from 'react';

export type Inline = { t: 'text'; v: string } | { t: 'code'; v: string } | { t: 'strong' | 'em'; c: Inline[] } | { t: 'link'; href: string | null; c: Inline[] };
export type Block =
  | { t: 'heading'; level: number; c: Inline[]; generated?: boolean }
  | { t: 'para'; c: Inline[]; generated?: boolean }
  | { t: 'list'; ordered: boolean; items: Inline[][]; generated?: boolean }
  | { t: 'table'; head: Inline[][]; rows: Inline[][][]; generated?: boolean }
  | { t: 'code'; lang: string; v: string; generated?: boolean };

/** http(s), mailto, `#anchor` and relative paths; everything else (javascript:, data:, vbscript:…) is dropped. */
export function safeHref(raw: string): string | null {
  const h = raw.trim();
  if (/^(https?:|mailto:)/i.test(h)) return h;
  if (/^[a-z][a-z0-9+.-]*:/i.test(h) || h.startsWith('//')) return null;
  return h;
}

export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  let buf = '';
  const flush = () => { if (buf) { out.push({ t: 'text', v: buf }); buf = ''; } };
  for (let i = 0; i < src.length;) {
    const rest = src.slice(i);
    let m: RegExpMatchArray | null;
    if ((m = /^`([^`]+)`/.exec(rest))) { flush(); out.push({ t: 'code', v: m[1] }); i += m[0].length; continue; }
    if ((m = /^\[([^\]]*)\]\(([^)\s]*)\)/.exec(rest))) { flush(); out.push({ t: 'link', href: safeHref(m[2]), c: parseInline(m[1]) }); i += m[0].length; continue; }
    if ((m = /^\*\*([^*]+)\*\*/.exec(rest))) { flush(); out.push({ t: 'strong', c: parseInline(m[1]) }); i += m[0].length; continue; }
    if ((m = /^[*_]([^*_]+)[*_]/.exec(rest))) { flush(); out.push({ t: 'em', c: parseInline(m[1]) }); i += m[0].length; continue; }
    buf += src[i++];
  }
  flush();
  return out;
}

const cells = (line: string) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => parseInline(c.trim()));

export const GEN_OPEN = '<!-- generated -->';
export const GEN_CLOSE = '<!-- /generated -->';

/** Front matter is stripped (returned separately). Content between generated markers is flagged. */
export function parseMarkdown(md: string): { meta: Record<string, string>; blocks: Block[] } {
  const meta: Record<string, string> = {};
  let text = md.replace(/\r\n/g, '\n');
  const fm = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (fm) { for (const l of fm[1].split('\n')) { const i = l.indexOf(':'); if (i > 0) meta[l.slice(0, i).trim()] = l.slice(i + 1).trim(); } text = text.slice(fm[0].length); }
  const lines = text.split('\n');
  const blocks: Block[] = [];
  let generated = false;
  const push = (b: Block) => blocks.push(generated ? { ...b, generated: true } : b);
  for (let i = 0; i < lines.length;) {
    const line = lines[i];
    const trimmed = line.trim();
    // Markers may stand alone or trail a heading ("## Props <!-- generated -->").
    if (trimmed === GEN_OPEN) { generated = true; i++; continue; }
    if (trimmed === GEN_CLOSE) { generated = false; i++; continue; }
    if (!trimmed) { i++; continue; }
    const fence = /^```(\w*)/.exec(trimmed);
    if (fence) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) body.push(lines[i++]);
      i++;
      push({ t: 'code', lang: fence[1], v: body.join('\n') });
      continue;
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (h) {
      let title = h[2];
      const opens = title.endsWith(GEN_OPEN);
      if (opens) title = title.slice(0, -GEN_OPEN.length).trim();
      push({ t: 'heading', level: h[1].length, c: parseInline(title) });
      if (opens) generated = true;
      i++;
      continue;
    }
    if (trimmed.startsWith('|') && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1] ?? '')) {
      const head = cells(trimmed);
      i += 2;
      const rows: Inline[][][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(cells(lines[i++]));
      push({ t: 'table', head, rows });
      continue;
    }
    const li = /^(\s*)([-*]|\d+\.)\s+/;
    if (li.test(line)) {
      const ordered = /\d/.test(li.exec(line)![2]);
      const items: Inline[][] = [];
      while (i < lines.length && li.test(lines[i])) items.push(parseInline(lines[i++].replace(li, '')));
      push({ t: 'list', ordered, items });
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|```|\|)/.test(lines[i].trim()) && !li.test(lines[i]) && ![GEN_OPEN, GEN_CLOSE].includes(lines[i].trim())) para.push(lines[i++].trim());
    if (para.length) push({ t: 'para', c: parseInline(para.join(' ')) });
    else i++;
  }
  return { meta, blocks };
}

export function renderInline(list: Inline[]): ReactNode {
  return list.map((n, i) => {
    switch (n.t) {
      case 'text': return <Fragment key={i}>{n.v}</Fragment>;
      case 'code': return <code key={i}>{n.v}</code>;
      case 'strong': return <strong key={i}>{renderInline(n.c)}</strong>;
      case 'em': return <em key={i}>{renderInline(n.c)}</em>;
      case 'link': return n.href
        ? <a key={i} href={n.href} target={/^https?:/.test(n.href) ? '_blank' : undefined} rel="noopener noreferrer">{renderInline(n.c)}</a>
        : <span key={i} data-unsafe-link="">{renderInline(n.c)}</span>;
    }
  });
}

export interface MarkdownProps { blocks: Block[]; className?: string; generatedClass?: string; renderCode?: (block: Extract<Block, { t: 'code' }>, index: number) => ReactNode; headingOffset?: number }

export function Markdown({ blocks, className, generatedClass, renderCode, headingOffset = 2 }: MarkdownProps) {
  return (
    <div className={className} data-testid="markdown">
      {blocks.map((b, i) => {
        const g = b.generated ? { className: generatedClass, 'data-generated': '' } : {};
        switch (b.t) {
          case 'heading': {
            const H = `h${Math.min(6, b.level + headingOffset)}` as 'h3';
            return <H key={i} {...g}>{renderInline(b.c)}</H>;
          }
          case 'para': return <p key={i} {...g}>{renderInline(b.c)}</p>;
          case 'list': {
            const L = b.ordered ? 'ol' : 'ul';
            return <L key={i} {...g}>{b.items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}</L>;
          }
          case 'table': return (
            <table key={i} {...g}>
              <thead><tr>{b.head.map((c, j) => <th key={j} scope="col">{renderInline(c)}</th>)}</tr></thead>
              <tbody>{b.rows.map((r, j) => <tr key={j}>{r.map((c, k) => <td key={k}>{renderInline(c)}</td>)}</tr>)}</tbody>
            </table>
          );
          case 'code': return renderCode?.(b, i) ?? <pre key={i} {...g}><code>{b.v}</code></pre>;
        }
      })}
    </div>
  );
}
