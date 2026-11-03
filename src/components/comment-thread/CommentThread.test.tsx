import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { CommentThread } from './CommentThread';

const people = [{ id: 'u2', name: 'Kai Moreno' }];
const comments = [
  { id: 'c1', author: { id: 'u2', name: 'Kai Moreno' }, createdAt: Date.now() - 3_600_000, body: 'Price looks high, can we renegotiate?', replies: [{ id: 'c2', author: { id: 'u1', name: 'Avery Lindqvist' }, createdAt: Date.now() - 600_000, body: 'Asked the supplier @Kai Moreno', edited: true }] },
];

describe('CommentThread', () => {
  it('lists comments with replies, mentions and own-comment actions', async () => {
    const onDelete = vi.fn();
    const { container } = renderWithTheme(<CommentThread label="Comments" comments={comments} currentUserId="u1" people={people} onDelete={onDelete} onEdit={vi.fn()} onPost={vi.fn()} locale="en" />);
    expect(screen.getByRole('region', { name: 'Comments' })).toBeInTheDocument();
    const reply = screen.getByRole('article', { name: /Avery Lindqvist/ });
    expect(within(reply).getByText('@Kai Moreno').tagName).toBe('STRONG');
    expect(within(reply).getByText('(edited)')).toBeInTheDocument();
    expect(within(reply).getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(within(screen.getByRole('article', { name: /Kai Moreno, 1 hour ago/ })).queryByRole('button', { name: 'Delete' })).toBeNull();
    expect(await axeViolations(container)).toEqual([]);
  });

  it('posts replies with focus moved into the composer', async () => {
    const onPost = vi.fn();
    const { user } = renderWithTheme(<CommentThread label="Comments" comments={comments} onPost={onPost} people={people} />);
    await user.click(screen.getByRole('button', { name: 'Reply' }));
    const box = screen.getByRole('textbox', { name: 'Reply to Kai Moreno' });
    expect(box).toHaveFocus();
    await user.type(box, 'Agreed');
    await user.keyboard('{Control>}{Enter}{/Control}');
    expect(onPost).toHaveBeenCalledWith('Agreed', 'c1', []);
    expect(screen.queryByRole('textbox', { name: 'Reply to Kai Moreno' })).toBeNull();
  });
});
