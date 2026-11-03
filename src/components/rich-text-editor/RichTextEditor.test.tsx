import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { RichTextEditor } from './RichTextEditor';
import { richTextToPlain, sanitizeRichText } from './sanitize';

describe('sanitizeRichText', () => {
  it('keeps allowed formatting and normalizes tags', () => {
    expect(sanitizeRichText('<div><b>Bold</b> and <i>italic</i></div><ul><li>One</li></ul>')).toBe('<p><strong>Bold</strong> and <em>italic</em></p><ul><li>One</li></ul>');
  });

  it('removes scripts, handlers, styles and unsafe links', () => {
    const out = sanitizeRichText(
      '<p onclick="steal()" style="color:red">Hi<script>alert(1)</script><img src=x onerror=alert(1)><iframe src="https://evil.test"></iframe></p>' +
        '<a href="javascript:alert(1)">js</a> <a href="data:text/html,x">data</a> <a href="/relative">rel</a> <a href="https://example.com" target="_blank" onmouseover="x()">ok</a>',
    );
    expect(out).toBe('<p>Hi</p>js data rel <a href="https://example.com" rel="noopener noreferrer">ok</a>');
    expect(out).not.toMatch(/script|onerror|onclick|style|iframe|javascript|data:/i);
  });

  it('converts to plain text with line breaks', () => {
    expect(richTextToPlain('<p>One</p><p>Two<br>Three</p>')).toBe('One\nTwo\nThree');
  });
});

describe('RichTextEditor', () => {
  it('is a labelled multiline textbox with a formatting toolbar', async () => {
    const { container } = renderWithTheme(<RichTextEditor label="Notes" defaultValue="<p>Hello <strong>team</strong></p>" />);
    const box = screen.getByRole('textbox', { name: 'Notes' });
    expect(box).toHaveAttribute('aria-multiline', 'true');
    expect(box.innerHTML).toBe('<p>Hello <strong>team</strong></p>');
    expect(screen.getByRole('toolbar', { name: 'Formatting' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'false');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('sanitizes pasted HTML and reports sanitized output', () => {
    const onChange = vi.fn();
    const exec = vi.fn((cmd: string, _ui: boolean, arg?: string) => {
      const box = screen.getByRole('textbox', { name: 'Notes' });
      if (cmd === 'insertHTML') box.innerHTML += arg ?? '';
      return true;
    });
    document.execCommand = exec as never;
    renderWithTheme(<RichTextEditor label="Notes" onChange={onChange} />);
    fireEvent.paste(screen.getByRole('textbox', { name: 'Notes' }), { clipboardData: { getData: (t: string) => (t === 'text/html' ? '<p>Quote <img src=x onerror=alert(1)><b>now</b></p>' : 'Quote now') } });
    expect(exec).toHaveBeenCalledWith('insertHTML', false, '<p>Quote <strong>now</strong></p>');
    expect(onChange).toHaveBeenLastCalledWith('<p>Quote <strong>now</strong></p>', 'Quote now');
  });

  it('validates link addresses and counts characters', async () => {
    const { user } = renderWithTheme(<RichTextEditor label="Notes" defaultValue="<p>12345</p>" maxLength={4} />);
    expect(screen.getByText('5 of 4 characters')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Link' }));
    const url = screen.getByRole('textbox', { name: 'Link address' });
    await user.clear(url);
    await user.type(url, 'javascript:alert(1){Enter}');
    expect(screen.getByText(/Enter an address starting with https/)).toBeInTheDocument();
    expect(url).toHaveAttribute('aria-invalid', 'true');
  });
});
