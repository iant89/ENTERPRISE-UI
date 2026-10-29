import { useState } from 'react';
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AppBreadcrumbBar, InlineEdit, NotificationCenter, OverflowMenu, PermissionGate } from '../../src';
import { axeViolations, renderWithTheme } from '../utils';

describe('Phase 4 supporting components', () => {
  it('validates and preserves a draft after a failed save', async () => {
    const save = vi.fn().mockRejectedValueOnce(new Error('Offline')).mockResolvedValue(undefined);
    const { user, container } = renderWithTheme(<InlineEdit label="Name" value="Old" validate={(value) => value ? undefined : 'Required'} onSave={save} />);
    await user.click(screen.getByRole('button', { name: 'Edit Name' }));
    const input = screen.getByLabelText('Name'); expect(input).toHaveFocus();
    await user.clear(input); await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Required'); expect(save).not.toHaveBeenCalled();
    await user.type(input, 'New'); await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Offline'); expect(input).toHaveValue('New');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Edit Name' })).toBeInTheDocument());
    expect(await axeViolations(container)).toEqual([]);
  });
  it('provides a keyboard-accessible overflow menu', async () => {
    const onAction = vi.fn(); const { user } = renderWithTheme(<OverflowMenu items={[{ id: 'archive', label: 'Archive' }]} onAction={onAction} />);
    await user.click(screen.getByRole('button', { name: 'More actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Archive' }));
    expect(onAction).toHaveBeenCalledWith('archive');
  });
  it('exposes controlled notification actions', async () => {
    function Example() { const [read, setRead] = useState(false); return <NotificationCenter notifications={[{ id: '1', title: 'Order', read }]} onMarkRead={() => setRead(true)} />; }
    const { user, container } = renderWithTheme(<Example />);
    await user.click(screen.getByRole('button', { name: 'Mark as read: Order' }));
    expect(screen.getByText('0 unread')).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });
  it('composes breadcrumbs and gates presentation', () => {
    renderWithTheme(<><AppBreadcrumbBar items={[{ label: 'Home', href: '/' }, { label: 'Order' }]} actions={<button>Share</button>} /><PermissionGate allowed={false} fallback={<span>Not available</span>}><button>Delete</button></PermissionGate></>);
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    expect(screen.getByText('Not available')).toBeInTheDocument();
  });
});
