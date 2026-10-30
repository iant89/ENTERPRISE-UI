import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar, AvatarBadge } from '../../src';
import { renderWithTheme } from '../utils';

describe('AvatarBadge', () => {
  it('adds a meaningful badge description to the avatar and hides the icon', () => {
    renderWithTheme(<Avatar name="Ada" presence="online" badgeLabel="Verified" badge={<AvatarBadge tone="success" icon={<svg data-testid="icon" />} />} />);
    expect(screen.getByRole('img', { name: 'Ada (online, Verified)' })).toBeInTheDocument();
    expect(screen.getByTestId('icon').closest('[aria-hidden="true"]')).toBeInTheDocument();
  });
  it('treats a badge without a label as decorative and keeps it out of tab order', async () => {
    const { user } = renderWithTheme(<><Avatar name="Ada" badge={<AvatarBadge icon={<span>star</span>} />} /><button>Next</button></>);
    expect(screen.getByRole('img', { name: 'Ada' })).toBeInTheDocument();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus();
  });
  it('updates the accessible name and supports decorative avatars', () => {
    const { rerender } = renderWithTheme(<Avatar name="Ada" badgeLabel="Verified" badge={<AvatarBadge icon="✓" />} />);
    expect(screen.getByRole('img', { name: 'Ada (Verified)' })).toBeInTheDocument();
    rerender(<Avatar name="Ada" badgeLabel="Pending" badge={<AvatarBadge tone="warning" icon="!" />} />);
    expect(screen.getByRole('img', { name: 'Ada (Pending)' })).toBeInTheDocument();
    rerender(<Avatar name="Ada" decorative badgeLabel="Pending" badge={<AvatarBadge icon="!" />} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
