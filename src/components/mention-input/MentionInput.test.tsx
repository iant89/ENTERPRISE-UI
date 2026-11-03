import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { MentionInput, findMentions } from './MentionInput';

const people = [
  { id: 'u1', name: 'Avery Lindqvist', description: 'Buyer' },
  { id: 'u2', name: 'Kai Moreno', description: 'Controller' },
  { id: 'u3', name: 'Priya Natarajan', description: 'Plant manager' },
];

describe('MentionInput', () => {
  it('suggests people after @ and inserts the chosen one with the keyboard', async () => {
    const onChange = vi.fn();
    const { user, container } = renderWithTheme(<MentionInput label="Comment" people={people} onChange={onChange} />);
    const box = screen.getByRole('textbox', { name: 'Comment' });
    await user.type(box, 'Please check @');
    expect(screen.getByRole('listbox', { name: 'People' })).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(box.getAttribute('aria-activedescendant')).toMatch(/u3$/);
    await user.type(box, 'na');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Priya NatarajanPlant manager']);
    expect(await axeViolations(container)).toEqual([]);
    await user.keyboard('{Enter}');
    expect(box).toHaveValue('Please check @Priya Natarajan ');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(onChange).toHaveBeenLastCalledWith('Please check @Priya Natarajan ', [people[2]]);
  });

  it('ignores @ inside words and closes with Escape', async () => {
    const { user } = renderWithTheme(<MentionInput label="Comment" people={people} />);
    const box = screen.getByRole('textbox', { name: 'Comment' });
    await user.type(box, 'mail me at name@k');
    expect(screen.queryByRole('listbox')).toBeNull();
    await user.type(box, ' @k');
    expect(screen.getByRole('listbox', { name: 'People' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(findMentions('Thanks @Kai Moreno!', people)).toEqual([people[1]]);
  });
});
