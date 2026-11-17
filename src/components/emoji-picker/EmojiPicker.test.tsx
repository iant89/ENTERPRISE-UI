import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { Dialog } from '../dialog';
import { EmojiPicker } from './EmojiPicker';
import { insertTextAtCursor } from './emojiGroups';

describe('EmojiPicker', () => {
  it('opens a grid of named emoji and reports the chosen one, staying open', async () => {
    const onSelect = vi.fn();
    const { user, baseElement } = renderWithTheme(<EmojiPicker onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: 'Insert emoji' }));
    const status = screen.getByRole('region', { name: 'Status' });
    await user.click(within(status).getByRole('button', { name: 'warning' }));
    expect(onSelect).toHaveBeenCalledWith('⚠️');
    expect(screen.getByRole('button', { name: 'party celebration' })).toBeInTheDocument();
    expect(await axeViolations(baseElement)).toEqual([]);
  });

  it('searches by name and says when nothing matches', async () => {
    const { user } = renderWithTheme(<EmojiPicker onSelect={() => {}} />);
    await user.click(screen.getByRole('button', { name: 'Insert emoji' }));
    await user.type(screen.getByRole('searchbox', { name: 'Search emoji' }), 'clock');
    expect(screen.getByRole('button', { name: 'alarm clock' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'warning' })).toBeNull();
    await user.type(screen.getByRole('searchbox', { name: 'Search emoji' }), 'zzz');
    expect(screen.getByRole('status')).toHaveTextContent('No emoji match “clockzzz”.');
  });

  it('moves between emoji with the arrow keys, Home and End', async () => {
    const groups = [{ name: 'Few', emoji: [{ emoji: '🅰️', name: 'a' }, { emoji: '🅱️', name: 'b' }, { emoji: '🆎', name: 'ab' }] }];
    const { user } = renderWithTheme(<EmojiPicker onSelect={() => {}} groups={groups} columns={2} />);
    await user.click(screen.getByRole('button', { name: 'Insert emoji' }));
    await vi.waitFor(() => expect(screen.getByRole('searchbox')).toHaveFocus()); // the popover focuses its first field
    screen.getByRole('button', { name: 'a' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'b' })).toHaveFocus();
    await user.keyboard('{ArrowLeft}{ArrowDown}');
    expect(screen.getByRole('button', { name: 'ab' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('button', { name: 'a' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('button', { name: 'ab' })).toHaveFocus();
  });

  it('closes on select when asked, and Escape closes only the picker inside a dialog', async () => {
    const onClose = vi.fn();
    const { user } = renderWithTheme(
      <Dialog open onClose={onClose} title="Announcement">
        <EmojiPicker onSelect={() => {}} closeOnSelect label="Add emoji" />
      </Dialog>,
    );
    await user.click(screen.getByRole('button', { name: 'Add emoji' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('button', { name: 'warning' })).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Add emoji' }));
    await user.click(screen.getByRole('button', { name: 'rocket launch release' }));
    expect(screen.queryByRole('button', { name: 'warning' })).toBeNull();
  });

  it('inserts text at the caret or over the selection', () => {
    const field = document.createElement('textarea');
    field.value = 'Hello world';
    field.setSelectionRange(6, 6);
    expect(insertTextAtCursor(field, field.value, '👋 ')).toEqual({ value: 'Hello 👋 world', caret: 9 });
    field.setSelectionRange(0, 5);
    expect(insertTextAtCursor(field, field.value, 'Hi')).toEqual({ value: 'Hi world', caret: 2 });
    expect(insertTextAtCursor(null, 'End', '!')).toEqual({ value: 'End!', caret: 4 });
  });
});
