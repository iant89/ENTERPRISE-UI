import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../../../tests/utils';
import { SegmentedButton } from './SegmentedButton';

const items = [{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }];

describe('SegmentedButton', () => {
  it('selects a single item', async () => {
    const onChange = vi.fn();
    const { user } = renderWithTheme(<SegmentedButton aria-label="Range" items={items} defaultValue={['day']} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Week' }));
    expect(onChange).toHaveBeenCalledWith(['week']);
    expect(screen.getByRole('button', { name: 'Week' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Day' })).toHaveAttribute('aria-pressed', 'false');
  });
  it('supports multiple selection', async () => {
    const { user } = renderWithTheme(<SegmentedButton aria-label="Days" selectionMode="multiple" items={items} />);
    await user.click(screen.getByRole('button', { name: 'Day' }));
    await user.click(screen.getByRole('button', { name: 'Month' }));
    expect(screen.getAllByRole('button', { pressed: true })).toHaveLength(2);
  });
  it('moves focus with arrow keys', async () => {
    const { user } = renderWithTheme(<SegmentedButton aria-label="Range" items={items} />);
    screen.getByRole('button', { name: 'Day' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Week' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('button', { name: 'Month' })).toHaveFocus();
  });
  it('has no axe violations', async () => {
    const { container } = renderWithTheme(<SegmentedButton aria-label="Range" items={items} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
