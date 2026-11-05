import { describe, expect, it } from 'vitest';
import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../../../tests/utils';
import { Tag } from './Tag';

describe('Tag', () => {
  it('renders text with the chosen color scheme and set, and forwards the ref', () => {
    const ref = createRef<HTMLSpanElement>();
    renderWithTheme(<Tag ref={ref} colorScheme={7} set={2}>Trial</Tag>);
    const tag = screen.getByText('Trial').parentElement!;
    expect(ref.current).toBe(tag);
    expect(tag.style.getPropertyValue('--tag-color')).toBe('var(--eui-color-accent-7)');
    expect(tag.className).toMatch(/set2/);
  });
  it('has no axe violations in either set', async () => {
    const { container } = renderWithTheme(<><Tag colorScheme={8}>Test system</Tag><Tag colorScheme={10} set={2}>Production EU</Tag></>);
    expect(await axeViolations(container)).toEqual([]);
  });
});
