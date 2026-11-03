import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { CodeSnippet } from './CodeSnippet';

const code = Array.from({ length: 8 }, (_, i) => `line ${i + 1}`).join('\n');

describe('CodeSnippet', () => {
  it('collapses long code, numbers lines and is a focusable named region', async () => {
    const { user, container } = renderWithTheme(<CodeSnippet code={code} language="YAML" lineNumbers maxLines={3} />);
    const pre = screen.getByLabelText('YAML');
    expect(pre).toHaveAttribute('tabindex', '0');
    expect(pre.textContent).toBe('1line 1\n2line 2\n3line 3\n');
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Show 5 more lines' }));
    expect(pre.textContent).toContain('8line 8');
    expect(screen.getByRole('button', { name: 'Show less' })).toHaveAttribute('aria-expanded', 'true');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('renders inline values', () => {
    const { container } = renderWithTheme(<p>Key: <CodeSnippet variant="inline" code="sk-123" /></p>);
    expect(container.querySelector('code')).toHaveTextContent('sk-123');
  });
});
