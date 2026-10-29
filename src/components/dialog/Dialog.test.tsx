import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../../../tests/utils';
import { Button } from '../button';
import { Input } from '../input';
import { Dialog } from './Dialog';
import { AlertDialog } from '../alert-dialog';

function Harness({ onClose }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open</Button>
      <Dialog
        open={open}
        title="Edit supplier"
        onClose={() => {
          onClose?.();
          setOpen(false);
        }}
        footer={<Button variant="primary">Save</Button>}
      >
        <Input label="Name" />
      </Dialog>
    </>
  );
}

describe('Dialog', () => {
  it('is a labelled modal dialog that moves focus inside', async () => {
    const { user } = renderWithTheme(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit supplier' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
  });

  it('traps Tab focus', async () => {
    const { user } = renderWithTheme(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const dialog = screen.getByRole('dialog');
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    for (let i = 0; i < 5; i++) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
    await user.tab({ shift: true });
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('closes on Escape and restores focus to the trigger', async () => {
    const onClose = vi.fn();
    const { user } = renderWithTheme(<Harness onClose={onClose} />);
    const trigger = screen.getByRole('button', { name: 'Open' });
    await user.click(trigger);
    await waitFor(() => expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true));
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('has no axe violations', async () => {
    const { user } = renderWithTheme(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(await axeViolations(document.body)).toEqual([]);
  });
});

describe('AlertDialog', () => {
  it('uses role="alertdialog", focuses Cancel and confirms', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    renderWithTheme(
      <AlertDialog open title="Delete order?" tone="error" confirmLabel="Delete" onConfirm={onConfirm} onCancel={onCancel}>
        This cannot be undone.
      </AlertDialog>,
    );
    const dialog = screen.getByRole('alertdialog', { name: 'Delete order?' });
    expect(dialog).toHaveAccessibleDescription('This cannot be undone.');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus());
    screen.getByRole('button', { name: 'Delete' }).click();
    await waitFor(() => expect(onConfirm).toHaveBeenCalled());
  });
});
