import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { safeHref, parseMarkdown, parseInline, Markdown } from '../../studio/src/docs/project-markdown/markdown';
import { planComponent, validateName } from '../../studio/src/components/generator/generate';
const BAD = ['javascript:alert(1)', 'java\tscript:alert(1)', 'java\nscript:alert(1)', 'java\rscript:x', '\u0001javascript:x', 'jav\u0000ascript:x', ' \u007fjavascript:x', 'JaVaScRiPt:x', 'java\u0085script:x', '%6Aavascript:x', 'data:text/html,x', 'vbscript:x', '//evil.com', '\\\\evil.com', '/\\evil.com', '\\/evil.com', '/\t/evil.com', '\t//evil.com'];
const GOOD = ['https://a.com/x', 'http://a', 'mailto:a@b', './Foo.md', '#props', 'docs/x.md', 'https://en.wikipedia.org/wiki/A_(b)'];
describe('C7 retest', () => {
  it('f1 safeHref unit', () => { for (const h of BAD) expect(safeHref(h), JSON.stringify(h)).toBeNull(); for (const h of GOOD) expect(safeHref(h), h).not.toBeNull(); });
  it('f1 render', () => {
    for (const h of BAD) { const md = `[x](${h.replace(/\n/g, '%0A')})`; const html = renderToStaticMarkup(<Markdown blocks={parseMarkdown(md).blocks} />); expect(html, JSON.stringify(h) + html).not.toMatch(/href=/); }
    // raw newline inside link target
    const html2 = renderToStaticMarkup(<Markdown blocks={parseMarkdown('[x](java\nscript:alert(1))').blocks} />);
    console.log('raw-newline', html2);
    expect(html2).not.toMatch(/href="java/);
    const html3 = renderToStaticMarkup(<Markdown blocks={parseMarkdown('<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>').blocks} />);
    expect(html3).not.toMatch(/<script|<img/);
  });
  it('f2', () => { const p = { files: { 'src/App.tsx': 'x' } } as any; for (const d of ['/etc', 'node_modules', 'src\\comp', 'src/node_modules', '../x']) { const r = planComponent(p, { name: 'Foo', destination: d, options: {} as any }); console.log('dest', d, JSON.stringify(r.ok ? Object.keys((r as any).files) : (r as any).errors)); expect(r.ok, d).toBe(false); } expect(planComponent(p, { name: 'Foo', destination: 'src', options: {} as any }).ok).toBe(true); });
  it('f3', () => { for (const n of ['App', 'ThemeProvider', 'Button', 'React']) { console.log('name', n, validateName(n)); expect(validateName(n), n).toBeTruthy(); } expect(validateName('QaCard')).toBeUndefined(); });
  it('f4', () => { const r = parseInline('[a](https://x/(y)) tail'); console.log(JSON.stringify(r)); expect((r[0] as any).href).toBe('https://x/(y)'); expect(JSON.stringify(parseInline('[a](https://x/a_(b)_(c))'))).toContain('a_(b)_(c)'); });
});
