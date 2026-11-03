import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { SignaturePad } from './SignaturePad';

describe('SignaturePad', () => {
  it('offers a typed alternative to drawing', async () => {
    const onChange = vi.fn();
    const { user, container } = renderWithTheme(<SignaturePad label="Approver signature" onChange={onChange} />);
    expect(screen.getByRole('group', { name: 'Approver signature' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Signature drawing area/ })).toBeInTheDocument();
    expect(screen.getByText('Not signed')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Type' }));
    await user.type(screen.getByRole('textbox', { name: 'Full name' }), 'Avery Lindqvist');
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ method: 'type', typedName: 'Avery Lindqvist' }));
    expect(screen.getByText('Signed')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByText('Not signed')).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });
});
