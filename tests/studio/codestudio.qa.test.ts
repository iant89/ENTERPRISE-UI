import { describe, it, expect } from 'vitest';
import { safeHref, parseMarkdown, parseInline } from '../../studio/src/docs/project-markdown/markdown';
import { planComponent, validateName } from '../../studio/src/components/generator/generate';
describe('qa probes', () => {
  it('safeHref', () => {
    for (const h of ['javascript:alert(1)',' JavaScript:alert(1)','java\tscript:x','data:text/html,x','//evil.com/x','\\\\evil.com','vbscript:x','./a.md','#x','https://a'])
      console.log(JSON.stringify(h), '=>', JSON.stringify(safeHref(h)));
  });
  it('raw html', () => { console.log(JSON.stringify(parseMarkdown('<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>').blocks)); });
  it('link with parens', () => { console.log(JSON.stringify(parseInline('[a](https://x/(y))'))); });
  it('names', () => { for (const n of ['Button','button','My-Comp','Ünicode','A','Constructor','__proto__','Object','React','App','ThemeProvider']) console.log(n, validateName(n)); });
  it('dest traversal', () => {
    const p = { files: { 'src/App.tsx': 'x' } } as any;
    for (const d of ['../x','src/../../x','/etc','src//c','src\\comp','node_modules','.']) console.log(d, JSON.stringify(planComponent(p,{name:'Foo',destination:d,options:{} as any}).ok));
  });
});
