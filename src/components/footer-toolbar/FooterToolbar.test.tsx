import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../../../tests/utils';
import { IconProvider } from '../../icons';
import { FooterToolbar, type FooterToolbarAction } from './FooterToolbar';

const actions: FooterToolbarAction[] = [
  { id: 'save', label: 'Save', variant: 'primary' },
  { id: 'cancel', label: 'Cancel' },
  { id: 'edit', label: 'Edit header', display: 'icon', icon: IconProvider.getIcon('edit') },
  { id: 'delete', label: 'Delete', variant: 'destructive' },
];

afterEach(() => vi.restoreAllMocks());

describe('FooterToolbar', () => {
  it('renders nothing when there are no actions, messages or draft indicator', () => {
    const { container } = renderWithTheme(<FooterToolbar />);
    expect(container.querySelector('[role="toolbar"]')).toBeNull();
  });

  it('renders when only a draft indicator or messages are present', () => {
    renderWithTheme(<FooterToolbar draftIndicator={<span>Draft saved</span>} />);
    expect(screen.getByRole('toolbar', { name: 'Page actions' })).toHaveTextContent('Draft saved');
  });

  it('renders text-only and icon-only buttons in the given order and forwards the ref', () => {
    const ref = createRef<HTMLDivElement>();
    renderWithTheme(<FooterToolbar ref={ref} actions={actions} />);
    const toolbar = screen.getByRole('toolbar');
    expect(ref.current).toBe(toolbar);
    const buttons = Array.from(toolbar.querySelectorAll(':scope > div:not([aria-hidden]) button'));
    expect(buttons.map((b) => b.getAttribute('aria-label') ?? b.textContent)).toEqual(['Save', 'Cancel', 'Edit header', 'Delete']);
    const save = screen.getByRole('button', { name: 'Save' });
    expect(save.querySelector('svg')).toBeNull();
    expect(screen.getByRole('button', { name: 'Edit header' })).not.toHaveTextContent('Edit header');
  });

  it('calls the action handler', async () => {
    const onClick = vi.fn();
    const { user } = renderWithTheme(<FooterToolbar actions={[{ id: 'save', label: 'Save', onClick }]} />);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('moves the least-used (last) actions into the overflow menu first', async () => {
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(80);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(300);
    const onDelete = vi.fn();
    const { user } = renderWithTheme(<FooterToolbar actions={actions.map((a) => (a.id === 'delete' ? { ...a, onClick: onDelete } : a))} />);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'More actions' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('moves focus between buttons with the arrow keys', async () => {
    const { user } = renderWithTheme(<FooterToolbar actions={actions.slice(0, 2)} />);
    screen.getByRole('button', { name: 'Save' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  });

  it('supports the fixed position', () => {
    renderWithTheme(<FooterToolbar position="fixed" actions={actions.slice(0, 1)} />);
    expect(screen.getByRole('toolbar').className).toMatch(/fixed/);
  });

  it('has no axe violations', async () => {
    const { container } = renderWithTheme(<FooterToolbar actions={actions} messages={<button type="button">2 messages</button>} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
