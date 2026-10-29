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

describe('localized notifications', () => {
  it('localizes visible and accessible text, dates and actions without changing identifiers', async () => {
    const onRead = vi.fn(); const onDismiss = vi.fn();
    const { user, container, rerender } = renderWithTheme(<NotificationCenter dir="rtl" lang="ar" notifications={[{ id: '42', title: 'طلب PO-42', timestamp: '2026-01-15T12:00:00Z', read: false }]} onMarkRead={onRead} onDismiss={onDismiss} formatTimestamp={() => '١٥ يناير'} messages={{ title: 'الإشعارات', unreadCount: (count) => `العدد ${count}`, unread: 'جديد', markRead: 'قراءة', dismiss: 'إزالة', markReadLabel: (title) => `قراءة ${title}`, dismissLabel: (title) => `إزالة ${title}`, empty: 'لا توجد إشعارات' }} />);
    expect(screen.getByRole('region', { name: 'الإشعارات' })).toHaveAttribute('dir', 'rtl');
    expect(screen.getByText('العدد 1')).toBeInTheDocument();
    expect(screen.getByText('١٥ يناير')).toHaveAttribute('datetime', '2026-01-15T12:00:00Z');
    await user.click(screen.getByRole('button', { name: 'قراءة طلب PO-42' }));
    await user.click(screen.getByRole('button', { name: 'إزالة طلب PO-42' }));
    expect(onRead).toHaveBeenCalledWith('42'); expect(onDismiss).toHaveBeenCalledWith('42');
    expect(await axeViolations(container)).toEqual([]);
    rerender(<NotificationCenter notifications={[]} messages={{ empty: 'لا توجد إشعارات' }} />);
    expect(screen.getByText('لا توجد إشعارات')).toBeInTheDocument();
  });
});

describe('localized inline editing', () => {
  it('uses translated labels, validation and save errors and restores focus on cancel', async () => {
    const messages = { edit: 'تعديل', editLabel: (label: string) => `تعديل ${label}`, save: 'حفظ', cancel: 'إلغاء', validationFailed: 'فشل التحقق', saveFailed: 'تعذر الحفظ', emptyValue: 'فارغ' };
    const save = vi.fn().mockRejectedValue(undefined);
    const validate = vi.fn().mockImplementationOnce(() => { throw new Error(); }).mockReturnValue(undefined);
    const { user } = renderWithTheme(<InlineEdit label="الوصف" value="PO-42" onSave={save} validate={validate} messages={messages} />);
    const edit = screen.getByRole('button', { name: 'تعديل الوصف' });
    await user.click(edit);
    expect(screen.getByLabelText('الوصف')).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'حفظ' }));
    expect(screen.getByRole('alert')).toHaveTextContent('فشل التحقق');
    await user.click(screen.getByRole('button', { name: 'حفظ' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('تعذر الحفظ');
    await user.click(screen.getByRole('button', { name: 'إلغاء' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'تعديل الوصف' })).toHaveFocus());
  });
});
