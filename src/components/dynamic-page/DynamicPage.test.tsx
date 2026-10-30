import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../../../tests/utils';
import { DynamicPage } from './DynamicPage';

describe('DynamicPage', () => {
  it('collapses and expands the header', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<DynamicPage title="PO 4500" snappedSubtitle="Open" headerContent={<p>Facts</p>} onHeaderExpandedChange={onChange}>Body</DynamicPage>);
    expect(screen.getByRole('heading', { level: 1, name: 'PO 4500' })).toBeInTheDocument();
    const toggle = screen.getByRole('button', { name: 'Collapse header' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await user.click(toggle);
    expect(onChange).toHaveBeenCalledWith(false);
    expect(screen.getByText('Facts').parentElement).not.toBeVisible();
    expect(screen.getByText('Open')).toBeInTheDocument();
  });
  it('pins the header', async () => {
    const { user } = renderWithTheme(<DynamicPage title="T" headerContent="x" />);
    await user.click(screen.getByRole('button', { name: 'Pin header' }));
    expect(screen.getByRole('button', { name: 'Unpin header' })).toHaveAttribute('aria-pressed', 'true');
  });
  it('has no axe violations', async () => {
    const { container } = renderWithTheme(<DynamicPage title="T" headerContent="x" footer={<button type="button">Save</button>}>Body</DynamicPage>);
    expect(await axeViolations(container, { ignoreStructure: true })).toEqual([]);
  });
});
