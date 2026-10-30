import { describe, expect, it, vi } from 'vitest';
import { createRef } from 'react';
import { screen } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../../../tests/utils';
import { AIButton } from './AIButton';

const states = [{ name: 'generate', label: 'Generate' }, { name: 'generating', label: 'Stop generating', busy: true }, { name: 'revise', label: 'Revise' }];

describe('AIButton', () => {
  it('renders the current state label and forwards refs', async () => {
    const ref = createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    const { user } = renderWithTheme(<AIButton ref={ref} states={states} state="generate" onClick={onClick} />);
    await user.click(screen.getByRole('button', { name: 'Generate' }));
    expect(onClick).toHaveBeenCalled();
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
  it('announces busy states', () => {
    renderWithTheme(<AIButton states={states} state="generating" />);
    expect(screen.getByRole('button', { name: 'Stop generating' })).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Stop generating');
  });
  it('has no axe violations', async () => {
    const { container } = renderWithTheme(<AIButton states={states} state="revise" />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
