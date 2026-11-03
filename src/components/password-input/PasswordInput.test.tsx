import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { PasswordInput, defaultPasswordScore } from './PasswordInput';

describe('PasswordInput', () => {
  it('toggles visibility with a pressed-state button', async () => {
    const { user, container } = renderWithTheme(<PasswordInput label="Password" />);
    const input = screen.getByLabelText('Password', { selector: 'input' });
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('autocomplete', 'current-password');
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute('aria-pressed', 'true');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('shows strength and a live requirement checklist for new passwords', async () => {
    const { user } = renderWithTheme(
      <PasswordInput label="New password" purpose="new" requirements={[{ label: 'At least 12 characters', test: (p) => p.length >= 12 }, { label: 'A number', test: (p) => /\d/.test(p) }]} />,
    );
    const input = screen.getByLabelText('New password', { selector: 'input' });
    expect(input).toHaveAttribute('autocomplete', 'new-password');
    await user.type(input, 'short');
    expect(screen.getByText(/Password strength: Weak/)).toBeInTheDocument();
    expect(screen.getByText('A number').parentElement).toHaveTextContent('A number: not met');
    await user.type(input, 'Horse7Battery!');
    expect(screen.getByText(/Password strength: Strong/)).toBeInTheDocument();
    expect(screen.getByText('A number').parentElement).toHaveTextContent('A number: met');
    expect(input).toHaveAccessibleDescription(/Password strength: Strong/);
    expect(defaultPasswordScore('aaaaaaaaaaaaaaaa')).toBeLessThan(2);
  });
});
