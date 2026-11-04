import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Markdown, parseInline, parseMarkdown, safeHref } from '../../studio/src/docs/project-markdown/markdown';

const md = `---
title: X
---

# X

## Overview

A **bold** and *em* para with \`code\` and a [link](https://example.com) and [rel](./a.md).

- one
- two

1. first

| Prop | Description |
| --- | --- |
| \`a\` | Alpha |

\`\`\`tsx
<X a="1" />
\`\`\`

## Props <!-- generated -->
Generated para.
<!-- /generated -->
`;

describe('markdown', () => {
  it('parses every construct, strips front matter, flags generated blocks', () => {
    const { meta, blocks } = parseMarkdown(md);
    expect(meta.title).toBe('X');
    expect(blocks.map((b) => b.t)).toEqual(['heading', 'heading', 'para', 'list', 'list', 'table', 'code', 'heading', 'para']);
    expect(blocks.at(-1)!.generated).toBe(true);
    expect(blocks.at(-2)!.generated).toBeUndefined();
    const { container } = render(<Markdown blocks={blocks} />);
    expect(container.querySelector('strong')!.textContent).toBe('bold');
    expect(container.querySelector('em')!.textContent).toBe('em');
    expect(container.querySelectorAll('li')).toHaveLength(3);
    expect(container.querySelector('ol')).toBeTruthy();
    expect(container.querySelector('th')!.textContent).toBe('Prop');
    expect(container.querySelector('pre code')!.textContent).toBe('<X a="1" />');
    const a = container.querySelector('a[href="https://example.com"]')!;
    expect(a.getAttribute('rel')).toBe('noopener noreferrer');
    expect(a.getAttribute('target')).toBe('_blank');
    expect(container.querySelector('a[href="./a.md"]')).toBeTruthy();
    expect(container.querySelector('[data-generated]')!.textContent).toBe('Generated para.');
  });
  it('XSS: raw HTML is text, unsafe links are inert', () => {
    const evil = '<script>window.__x = 1</script>\n\n<img src=x onerror="window.__x=2">\n\n[click](javascript:alert(1)) [d](data:text/html,hi) [v](VBScript:x) [p](//evil.com)';
    const { container } = render(<Markdown blocks={parseMarkdown(evil).blocks} />);
    expect(container.querySelector('script, img')).toBeNull();
    expect(container.textContent).toContain('<script>window.__x = 1</script>');
    expect(container.querySelectorAll('a')).toHaveLength(0);
    expect(container.querySelectorAll('[data-unsafe-link]')).toHaveLength(4);
    expect((window as unknown as { __x?: number }).__x).toBeUndefined();
    expect(safeHref(' JavaScript:alert(1)')).toBeNull();
    expect(parseInline('[a](https://x.y)')[0]).toMatchObject({ t: 'link', href: 'https://x.y' });
  });
});
