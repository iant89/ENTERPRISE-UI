import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../../../tests/utils';
import { UploadCollection, formatFileSize } from './UploadCollection';

const items = [
  { id: '1', fileName: 'invoice.pdf', size: 2048 },
  { id: '2', fileName: 'photo.png', status: 'uploading' as const, progress: 40 },
  { id: '3', fileName: 'big.zip', status: 'error' as const, message: 'Too large' },
];

describe('UploadCollection', () => {
  it('lists files with status, progress and delete actions', async () => {
    const onItemDelete = vi.fn();
    const { user } = renderWithTheme(<UploadCollection title="Attachments" items={items} onItemDelete={onItemDelete} />);
    expect(screen.getByRole('region', { name: 'Attachments (3)' })).toBeInTheDocument();
    expect(screen.getByText(/Uploaded · 2.0 KB/)).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Upload progress for photo.png' })).toBeInTheDocument();
    expect(screen.getByText(/Upload failed · Too large/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete invoice.pdf' }));
    expect(onItemDelete).toHaveBeenCalledWith('1');
  });
  it('reports dropped files', () => {
    const onFilesSelected = vi.fn();
    renderWithTheme(<UploadCollection title="Files" items={[]} onFilesSelected={onFilesSelected} />);
    const file = new File(['x'], 'a.txt');
    fireEvent.drop(screen.getByRole('region'), { dataTransfer: { files: [file] } });
    expect(onFilesSelected).toHaveBeenCalledWith([file]);
  });
  it('formats sizes', () => {
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });
  it('has no axe violations', async () => {
    const { container } = renderWithTheme(<UploadCollection title="Files" items={items} onItemDelete={() => {}} onFilesSelected={() => {}} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
