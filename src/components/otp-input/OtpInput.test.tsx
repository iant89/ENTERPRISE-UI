import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { OtpInput } from './OtpInput';

describe('OtpInput', () => {
  it('advances while typing, goes back with Backspace and completes', async () => {
    const onComplete = vi.fn();
    const { user, container } = renderWithTheme(<OtpInput label="Verification code" length={4} onComplete={onComplete} />);
    expect(screen.getByRole('group', { name: 'Verification code' })).toBeInTheDocument();
    const boxes = screen.getAllByRole('textbox');
    expect(boxes[0]).toHaveAttribute('autocomplete', 'one-time-code');
    await user.click(boxes[0]);
    await user.keyboard('12');
    expect(boxes[2]).toHaveFocus();
    await user.keyboard('{Backspace}');
    expect(boxes[1]).toHaveFocus();
    expect(boxes[1]).toHaveValue('');
    await user.keyboard('a234');
    expect(onComplete).toHaveBeenCalledWith('1234');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('fills every box from a paste', () => {
    const onChange = vi.fn();
    renderWithTheme(<OtpInput label="Code" onChange={onChange} />);
    fireEvent.paste(screen.getAllByRole('textbox')[0], { clipboardData: { getData: () => '987 654' } });
    expect(onChange).toHaveBeenLastCalledWith('987654');
    expect(screen.getAllByRole('textbox').map((b) => (b as HTMLInputElement).value).join('')).toBe('987654');
  });
});
