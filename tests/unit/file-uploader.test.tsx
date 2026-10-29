import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FileUploader, type UploadContext } from '../../src';
import { axeViolations, renderWithTheme } from '../utils';

describe('FileUploader', () => {
  it('validates files and processes a sequential queue with retry and partial success', async () => {
    let resolveFirst!: () => void; let context!: UploadContext;
    const upload = vi.fn().mockImplementationOnce((_file: File, options: UploadContext) => { context = options; return new Promise<void>((resolve) => { resolveFirst = resolve; }); }).mockRejectedValueOnce(new Error('Network failed')).mockResolvedValue(undefined);
    const { user, container } = renderWithTheme(<FileUploader retrySafe upload={upload} accept={['.txt']} maxFileSize={10} />);
    const files = [new File(['a'], 'one.txt', { type: 'text/plain' }), new File(['b'], 'two.txt'), new File(['c'], 'bad.png'), new File(['12345678901'], 'large.txt')];
    fireEvent.change(screen.getByLabelText('Upload files', { selector: 'input' }), { target: { files } });
    await waitFor(() => expect(upload).toHaveBeenCalledTimes(1));
    expect(screen.getByText('File type is not accepted.')).toBeInTheDocument();
    expect(screen.getByText('File exceeds the size limit.')).toBeInTheDocument();
    act(() => context.onProgress(0.5));
    expect(screen.getByRole('progressbar', { name: 'Upload progress for one.txt' })).toHaveValue(0.5);
    await act(async () => resolveFirst());
    await waitFor(() => expect(upload).toHaveBeenCalledTimes(2));
    await screen.findByText('Network failed');
    expect(screen.getByRole('status')).toHaveTextContent('1 uploaded, 3 failed, 4 total');
    await user.click(screen.getByRole('button', { name: 'Retry two.txt' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('2 uploaded, 2 failed'));
    expect(upload).toHaveBeenCalledTimes(3);
    expect(await axeViolations(container)).toEqual([]);
  });
  it('aborts cancellations and ignores late completion and progress', async () => {
    let resolve!: () => void; let context!: UploadContext;
    const upload = vi.fn((_file: File, options: UploadContext) => { context = options; return new Promise<void>((done) => { resolve = done; }); });
    const { user } = renderWithTheme(<FileUploader retrySafe upload={upload} />);
    fireEvent.change(screen.getByLabelText('Upload files', { selector: 'input' }), { target: { files: [new File(['x'], 'x.txt')] } });
    await waitFor(() => expect(upload).toHaveBeenCalledTimes(1));
    await user.click(screen.getByRole('button', { name: 'Cancel x.txt' }));
    expect(context.signal.aborted).toBe(true);
    await act(async () => { context.onProgress(1); resolve(); });
    const entry = screen.getByText('x.txt').closest('li')!;
    expect(within(entry).getByRole('button', { name: 'Retry x.txt' })).toBeInTheDocument();
    expect(entry).toHaveTextContent('cancelled');
  });
});
