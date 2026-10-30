import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../../../tests/utils';
import { MediaGallery } from './MediaGallery';

const items = [{ id: 'a', src: 'a.png', alt: 'Front' }, { id: 'b', src: 'b.png', alt: 'Back' }];

describe('MediaGallery', () => {
  it('selects thumbnails and moves focus with arrows', async () => {
    const onSelectionChange = vi.fn();
    const { user } = renderWithTheme(<MediaGallery aria-label="Product images" items={items} onSelectionChange={onSelectionChange} />);
    const group = screen.getByRole('group', { name: 'Product images' });
    const [front, back] = within(group).getAllByRole('button');
    front.focus();
    await user.keyboard('{ArrowRight}');
    expect(back).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onSelectionChange).toHaveBeenCalledWith('b');
    expect(back).toHaveAttribute('aria-pressed', 'true');
  });
  it('has no axe violations', async () => {
    const { container } = renderWithTheme(<MediaGallery aria-label="Images" items={items} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
