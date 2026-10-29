import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CopyButton } from '../../src';
import { renderWithTheme } from '../utils';

describe('CopyButton', () => {
  it('copies and announces success or failure', async () => {
    const copy = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('denied'));
    const { user } = renderWithTheme(<CopyButton value="PO-1" copy={copy} />);
    await user.click(screen.getByRole('button', { name: 'Copy' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Copied.'));
    expect(copy).toHaveBeenCalledWith('PO-1');
    await user.click(screen.getByRole('button', { name: 'Copy' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Could not copy.'));
  });
});

it('announces translated success and failure without exposing clipboard errors', async () => {
  const copy = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('sensitive'));
  const onError = vi.fn();
  const { user } = renderWithTheme(<CopyButton value="PO-1" label="نسخ" copy={copy} onError={onError} messages={{ copied: 'تم النسخ', failed: 'تعذر النسخ' }} />);
  await user.click(screen.getByRole('button', { name: 'نسخ' }));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('تم النسخ'));
  await user.click(screen.getByRole('button', { name: 'نسخ' }));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('تعذر النسخ'));
  expect(onError).toHaveBeenCalledOnce();
  expect(screen.queryByText('sensitive')).not.toBeInTheDocument();
});
