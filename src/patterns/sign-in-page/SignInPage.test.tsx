import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { SignInPage } from './SignInPage';

describe('SignInPage', () => {
  it('validates, submits credentials and shows a generic error', async () => {
    const onSubmit = vi.fn(async () => 'The user name or password is incorrect.');
    const { user, container } = renderWithTheme(<SignInPage productName="Procurement" onSubmit={onSubmit} forgotPasswordHref="/reset" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Sign in' })).toBeInTheDocument();
    const username = screen.getByRole('textbox', { name: /User name/ });
    expect(username).toHaveAttribute('autocomplete', 'username');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Enter your user name.')).toBeInTheDocument();
    await user.type(username, 'avery');
    await user.type(screen.getByLabelText(/^Password/, { selector: 'input' }), 'secret');
    await user.click(screen.getByRole('checkbox', { name: 'Keep me signed in' }));
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(onSubmit).toHaveBeenCalledWith({ username: 'avery', password: 'secret', remember: true });
    expect(await screen.findByRole('alert')).toHaveTextContent('The user name or password is incorrect.');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('offers single sign-on providers', async () => {
    const onProviderSignIn = vi.fn();
    const { user } = renderWithTheme(<SignInPage productName="Procurement" providers={[{ id: 'entra', label: 'Sign in with Microsoft' }]} onProviderSignIn={onProviderSignIn} ssoOnly />);
    expect(screen.queryByRole('textbox')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Sign in with Microsoft' }));
    expect(onProviderSignIn).toHaveBeenCalledWith('entra');
  });
});
