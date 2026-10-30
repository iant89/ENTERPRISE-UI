import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../../../tests/utils';
import { PromptInput } from './PromptInput';

describe('PromptInput', () => {
  it('submits on Enter, keeps newlines on Shift+Enter and clears', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithTheme(<PromptInput label="Ask" onSubmit={onSubmit} />);
    const box = screen.getByRole('textbox', { name: 'Ask' });
    await user.type(box, 'Hello{Shift>}{Enter}{/Shift}world{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('Hello\nworld');
    expect(box).toHaveValue('');
  });
  it('disables send for empty prompts and shows stop while generating', async () => {
    const onStop = vi.fn();
    const { user, rerender } = renderWithTheme(<PromptInput label="Ask" />);
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
    rerender(<PromptInput label="Ask" generating onStop={onStop} />);
    await user.click(screen.getByRole('button', { name: 'Stop generating' }));
    expect(onStop).toHaveBeenCalled();
  });
  it('fills suggestions', async () => {
    const { user } = renderWithTheme(<PromptInput label="Ask" suggestions={['Summarize']} />);
    await user.click(screen.getByRole('button', { name: 'Summarize' }));
    expect(screen.getByRole('textbox')).toHaveValue('Summarize');
  });
  it('has no axe violations', async () => {
    const { container } = renderWithTheme(<PromptInput label="Ask" suggestions={['A']} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
