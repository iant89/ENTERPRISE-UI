import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '../../../tests/utils';
import { UserSettingsDialog } from './UserSettingsDialog';

const views = [
  { id: 'appearance', label: 'Appearance', content: <p>Theme options</p> },
  { id: 'notifications', label: 'Notifications', content: <p>Email options</p> },
  { id: 'about', label: 'About', content: <p>Version 1</p>, fixed: true },
];

describe('UserSettingsDialog', () => {
  it('switches views from the category navigation', async () => {
    const onClose = vi.fn();
    const { user } = renderWithTheme(<UserSettingsDialog open onClose={onClose} views={views} />);
    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByText('Theme options')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Notifications' }));
    expect(screen.getByRole('region', { name: 'Notifications' })).toHaveTextContent('Email options');
    expect(screen.getByRole('button', { name: 'Notifications' })).toHaveAttribute('aria-current', 'true');
    await user.click(screen.getAllByRole('button', { name: 'Close' }).at(-1)!);
    expect(onClose).toHaveBeenCalled();
  });
});
