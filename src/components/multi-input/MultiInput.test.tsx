import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../../../tests/utils';
import { MultiInput } from './MultiInput';

describe('MultiInput', () => {
  it('commits text as tokens with Enter and comma, without duplicates', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<MultiInput label="Tags" onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Tags' });
    await user.type(input, 'alpha{Enter}beta,alpha{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(['alpha', 'beta']);
    expect(screen.getByRole('list', { name: 'Selected values' })).toBeInTheDocument();
    expect(input).toHaveValue('');
  });
  it('removes the last token with Backspace on empty input and via delete button', async () => {
    const { user } = renderWithTheme(<MultiInput label="Tags" defaultValue={['a', 'b', 'c']} />);
    await user.click(screen.getByRole('textbox'));
    await user.keyboard('{Backspace}');
    expect(screen.queryByText('c')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Remove a' }));
    expect(screen.queryByText('a')).toBeNull();
  });
  it('rejects values the parser refuses', async () => {
    const { user } = renderWithTheme(<MultiInput label="Emails" parseValue={(t) => (t.includes('@') ? t : null)} />);
    await user.type(screen.getByRole('textbox'), 'nope{Enter}');
    expect(screen.queryByRole('list')).toBeNull();
  });
  it('has no axe violations', async () => {
    const { container } = renderWithTheme(<MultiInput label="Tags" defaultValue={['x']} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
