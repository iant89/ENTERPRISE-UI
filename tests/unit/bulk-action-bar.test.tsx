import { act, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BulkActionBar, type BulkAction, type BulkActionResult } from '../../src/patterns/bulk-action-bar';
import { renderWithTheme } from '../utils';
import { ThemeProvider } from '../../src/themes';

const rowText = (text: string) => (_: string, element: Element | null) => element?.tagName === 'LI' && element.textContent === text;

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => { resolve = res; });
  return { promise, resolve };
}

describe('BulkActionBar', () => {
  it('confirms destructive actions, retries only failures, and supports undo', async () => {
    const execute = vi.fn().mockResolvedValueOnce({ succeeded: ['a'], failed: [{ id: 'b', message: 'Conflict' }] }).mockResolvedValueOnce({ succeeded: ['b'], failed: [] });
    const undo = vi.fn().mockResolvedValue(undefined);
    const onResult = vi.fn(); const onUndo = vi.fn();
    const { user } = renderWithTheme(<BulkActionBar selectedIds={['a', 'b']} actions={[{ id: 'delete', label: 'Archive', destructive: true, execute, undo }]} onResult={onResult} onUndo={onUndo} />);
    await user.click(screen.getByRole('button', { name: 'Archive' }));
    expect(execute).not.toHaveBeenCalled();
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(await screen.findByText(rowText('b: Conflict'))).toBeInTheDocument();
    expect(onResult).toHaveBeenCalledWith('delete', { succeeded: ['a'], failed: [{ id: 'b', message: 'Conflict' }] });
    await user.click(screen.getByRole('button', { name: 'Retry failed' }));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    await screen.findByText('2 succeeded; 0 failed.');
    expect(execute.mock.calls[1][0]).toEqual(['b']);
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(undo.mock.calls[0][0]).toEqual(['a', 'b']);
    expect(onUndo).toHaveBeenCalledWith('delete', ['a', 'b']);
  });

  it('reports missing results and catches failures for retry', async () => {
    const execute = vi.fn().mockResolvedValueOnce({ succeeded: ['a', 'not-selected'], failed: [] }).mockRejectedValueOnce(new Error('offline'));
    const { user } = renderWithTheme(<BulkActionBar selectedIds={['a', 'b']} actions={[{ id: 'update', label: 'Update', execute }]} />);
    await user.click(screen.getByRole('button', { name: 'Update' }));
    expect(await screen.findByText(rowText('b: No result was returned for this record.'))).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry failed' })).not.toBeInTheDocument();
    expect(screen.getByText('Verify unknown operation outcomes before retrying.')).toBeInTheDocument();
  });

  it('prevents concurrent execution and aborts on unmount', async () => {
    const task = deferred<BulkActionResult>();
    const execute = vi.fn((_ids: string[], _signal: AbortSignal) => task.promise);
    const { user, unmount } = renderWithTheme(<BulkActionBar selectedIds={['a']} actions={[{ id: 'update', label: 'Update', execute }]} />);
    await user.click(screen.getByRole('button', { name: 'Update' }));
    expect(screen.getByRole('button', { name: 'Update' })).toBeDisabled();
    expect(execute).toHaveBeenCalledTimes(1);
    const signal = execute.mock.calls[0][1];
    unmount(); expect(signal.aborted).toBe(true);
    await act(async () => task.resolve({ succeeded: ['a'], failed: [] }));
  });

  it('keeps unauthorized actions disabled', async () => {
    const execute = vi.fn();
    const action: BulkAction = { id: 'delete', label: 'Delete', disabled: true, execute };
    const { user } = renderWithTheme(<BulkActionBar selectedIds={['a']} actions={[action]} />);
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(execute).not.toHaveBeenCalled();
  });
  it('retries only confirmed failures while preserving unknown outcomes', async () => {
    const execute = vi.fn().mockResolvedValueOnce({ succeeded: [], failed: [{ id: 'a', message: 'locked' }] }).mockResolvedValueOnce({ succeeded: ['a'], failed: [] });
    const { user } = renderWithTheme(<BulkActionBar selectedIds={['a', 'b']} actions={[{ id: 'update', label: 'Update', execute }]} />);
    await user.click(screen.getByRole('button', { name: 'Update' }));
    expect(await screen.findByText(rowText('b: No result was returned for this record.'))).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry failed' }));
    expect(execute.mock.calls[1][0]).toEqual(['a']);
    expect(await screen.findByText('1 succeeded; 1 not confirmed.')).toBeInTheDocument();
    expect(screen.getByText(rowText('b: No result was returned for this record.'))).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry failed' })).not.toBeInTheDocument();
  });

  it('requires explicit idempotency to retry a rejected request', async () => {
    const execute = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ succeeded: ['a'], failed: [] });
    const { user } = renderWithTheme(<BulkActionBar selectedIds={['a']} actions={[{ id: 'update', label: 'Update', execute, retryOnError: true }]} />);
    await user.click(screen.getByRole('button', { name: 'Update' }));
    expect(await screen.findByText(rowText('a: Outcome unknown: offline'))).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry failed' }));
    expect(await screen.findByText('1 succeeded; 0 failed.')).toBeInTheDocument();
  });

  it('does not repeat undo with an unknown outcome by default', async () => {
    const action: BulkAction = { id: 'update', label: 'Update', execute: async () => ({ succeeded: ['a'], failed: [] }), undo: async () => { throw new Error('offline'); } };
    const { user } = renderWithTheme(<BulkActionBar selectedIds={['a']} actions={[action]} />);
    await user.click(screen.getByRole('button', { name: 'Update' }));
    await user.click(await screen.findByRole('button', { name: 'Undo' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Undo outcome unknown');
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
  });

  it('treats contradictory success and failure as unknown', async () => {
    const execute = vi.fn().mockResolvedValue({ succeeded: ['a'], failed: [{ id: 'a', message: 'failed' }] });
    const { user } = renderWithTheme(<BulkActionBar selectedIds={['a']} actions={[{ id: 'update', label: 'Update', execute }]} />);
    await user.click(screen.getByRole('button', { name: 'Update' }));
    expect(await screen.findByText(rowText('a: The backend returned conflicting results.'))).toBeInTheDocument();
    expect(screen.getByText('0 succeeded; 1 not confirmed.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry failed' })).not.toBeInTheDocument();
  });

  it('rechecks permissions and selection before executing a confirmation', async () => {
    const execute = vi.fn();
    const action: BulkAction = { id: 'delete', label: 'Delete', destructive: true, execute };
    const { rerender } = render(<ThemeProvider><BulkActionBar selectedIds={['a']} actions={[action]} /></ThemeProvider>);
    const user = (await import('@testing-library/user-event')).default.setup();
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    rerender(<ThemeProvider><BulkActionBar selectedIds={[]} actions={[action]} /></ThemeProvider>);
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Confirm' }));
    expect(execute).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('selection changed');
  });

  it('rechecks idempotency before confirming a retry of unknown results', async () => {
    const execute = vi.fn().mockRejectedValue(new Error('offline'));
    const action: BulkAction = { id: 'update', label: 'Update', destructive: true, retryOnError: true, execute };
    const { rerender } = render(<ThemeProvider><BulkActionBar selectedIds={['a']} actions={[action]} /></ThemeProvider>);
    const user = (await import('@testing-library/user-event')).default.setup();
    await user.click(screen.getByRole('button', { name: 'Update' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Confirm' }));
    await user.click(await screen.findByRole('button', { name: 'Retry failed' }));
    rerender(<ThemeProvider><BulkActionBar selectedIds={['a']} actions={[{ ...action, retryOnError: false }]} /></ThemeProvider>);
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Confirm' }));
    expect(execute).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('alert')).toHaveTextContent('action or selection changed');
  });

});

it('localizes confirmation and unknown outcomes without enabling unsafe retries', async () => {
  const execute = vi.fn().mockResolvedValue({ succeeded: ['PO-1'], failed: [] });
  const onResult = vi.fn();
  const { user } = renderWithTheme(<BulkActionBar selectedIds={['PO-1', 'PO-2']} dir="rtl" lang="ar" aria-label="إجراءات مجمعة" onResult={onResult}
    messages={{ selected: (count) => `${count} محدد`, confirmTitle: (action) => `تأكيد ${action}`, confirmBody: (action, count) => `${action}: ${count} سجلات؟`, confirm: 'تأكيد', cancel: 'إلغاء', summary: (success, failed, unknown) => `${success} نجح، ${failed} ${unknown ? 'غير مؤكد' : 'فشل'}`, missingResult: 'لم ترد نتيجة', verifyUnknown: 'تحقق قبل إعادة المحاولة', retryFailed: 'إعادة المحاولة' }}
    actions={[{ id: 'archive', label: 'أرشفة', destructive: true, execute }]} />);
  await user.click(screen.getByRole('button', { name: 'أرشفة' }));
  const dialog = screen.getByRole('alertdialog', { name: 'تأكيد أرشفة' });
  expect(dialog.closest('[dir="rtl"]')).toHaveAttribute('lang', 'ar');
  await waitFor(() => expect(within(dialog).getByRole('button', { name: 'إلغاء' })).toHaveFocus());
  expect(dialog).toHaveTextContent('أرشفة: 2 سجلات؟');
  await user.click(within(dialog).getByRole('button', { name: 'تأكيد' }));
  expect(await screen.findByText('1 نجح، 1 غير مؤكد')).toBeInTheDocument();
  expect(screen.getByText(rowText('PO-2: لم ترد نتيجة'))).toBeInTheDocument();
  expect(screen.getByText('تحقق قبل إعادة المحاولة')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'إعادة المحاولة' })).not.toBeInTheDocument();
  expect(onResult).toHaveBeenCalledWith('archive', { succeeded: ['PO-1'], failed: [{ id: 'PO-2', message: 'لم ترد نتيجة', outcomeUnknown: true }] });
});
