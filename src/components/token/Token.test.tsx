import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../../../tests/utils';
import { Token } from './Token';
import { Tokenizer } from './Tokenizer';

describe('Token', () => {
  it('shows a labelled delete button only when deletable', async () => {
    const onDelete = vi.fn();
    const { user, rerender } = renderWithTheme(<Token text="Berlin" onDelete={onDelete} />);
    await user.click(screen.getByRole('button', { name: 'Remove Berlin' }));
    expect(onDelete).toHaveBeenCalled();
    rerender(<Token text="Berlin" onDelete={onDelete} readOnly />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('Tokenizer', () => {
  const tokens = [{ id: 'a', text: 'Alpha' }, { id: 'b', text: 'Beta' }];
  it('renders a labelled list and removes with Backspace', async () => {
    const onTokenDelete = vi.fn();
    const { user } = renderWithTheme(<Tokenizer aria-label="Recipients" tokens={tokens} onTokenDelete={onTokenDelete} />);
    expect(screen.getByRole('list', { name: 'Recipients' })).toBeInTheDocument();
    screen.getByText('Alpha').parentElement!.focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByText('Beta').parentElement).toHaveFocus();
    await user.keyboard('{Backspace}');
    expect(onTokenDelete).toHaveBeenCalledWith('b');
  });
  it('has no axe violations', async () => {
    const { container } = renderWithTheme(<Tokenizer aria-label="Recipients" tokens={tokens} onTokenDelete={() => {}} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
