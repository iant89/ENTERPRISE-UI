import { act, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AvatarGroup, type AvatarGroupItem } from '../../src';
import { renderWithTheme } from '../utils';

const items: AvatarGroupItem[] = [{ id: 'a', name: 'Ada' }, { id: 'g', name: 'Grace' }, { id: 'k', name: 'Katherine' }, { id: 'a2', name: 'Alan' }];
afterEach(() => vi.restoreAllMocks());

describe('AvatarGroup', () => {
  it('activates the whole group using a native button', async () => {
    const press = vi.fn();
    const { user } = renderWithTheme(<AvatarGroup items={items} aria-label="Team" onGroupPress={press} />);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(press).toHaveBeenCalledWith(items);
  });
  it('supports roving keyboard focus and individual activation', async () => {
    const press = vi.fn();
    const { user } = renderWithTheme(<AvatarGroup items={items} mode="individual" aria-label="Team" onItemPress={press} />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Ada' })).toHaveFocus();
    await user.keyboard('{ArrowRight}{End}{Enter}');
    expect(screen.getByRole('button', { name: 'Alan' })).toHaveFocus();
    expect(press).toHaveBeenCalledWith(items[3]);
    await user.keyboard('{Home}');
    expect(screen.getByRole('button', { name: 'Ada' })).toHaveFocus();
  });
  it('recalculates overflow on resize and passes the hidden items', async () => {
    let width = 92;
    let resize = () => {};
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({ width } as DOMRect));
    vi.stubGlobal('ResizeObserver', class { constructor(callback: () => void) { resize = callback; } observe() {} disconnect() {} });
    try {
      const overflow = vi.fn();
      const { user } = renderWithTheme(<AvatarGroup items={items} mode="individual" aria-label="Team" onItemPress={() => {}} onOverflowPress={overflow} overflowLabel={(count) => `${count} hidden people`} />);
      expect(screen.getByRole('button', { name: 'Ada' })).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: '3 hidden people' }));
      expect(overflow).toHaveBeenCalledWith(items.slice(1));
      width = 250;
      act(() => resize());
      expect(screen.queryByRole('button', { name: '3 hidden people' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Alan' })).toBeInTheDocument();
    } finally { vi.unstubAllGlobals(); }
  });
  it('exposes noninteractive avatars and hidden count without a fake button', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: 92 } as DOMRect);
    renderWithTheme(<AvatarGroup items={items} mode="individual" aria-label="Team" />);
    expect(screen.getByRole('img', { name: 'Ada' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '3 more' })).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
