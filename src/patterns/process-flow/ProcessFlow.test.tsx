import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { ProcessFlow } from './ProcessFlow';

const lanes = [
  { id: 'order', title: 'Order', nodes: [{ id: 'o1', title: 'SO 1', status: 'done' as const, statusText: 'Confirmed' }] },
  { id: 'delivery', title: 'Delivery', nodes: [{ id: 'd1', title: 'DL 1', status: 'done' as const, statusText: 'Shipped' }, { id: 'd2', title: 'DL 2', status: 'warning' as const, statusText: 'Partial' }] },
  { id: 'invoice', title: 'Invoice', nodes: [] },
];

describe('ProcessFlow', () => {
  it('derives each lane status from its most severe document', async () => {
    const { container } = renderWithTheme(<ProcessFlow label="Document flow" lanes={lanes} />);
    const stages = screen.getAllByRole('listitem').filter((li) => li.parentElement?.tagName === 'OL');
    expect(stages.map((s) => s.querySelector('[class*="laneTitle"]')?.textContent)).toEqual(['Order, Completed', 'Delivery, Needs attention', 'Invoice, Not started']);
    expect(screen.getByText('Partial')).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });

  it('makes documents selectable and marks the current one', async () => {
    const onNodeSelect = vi.fn();
    const { user } = renderWithTheme(<ProcessFlow label="Flow" lanes={lanes} onNodeSelect={onNodeSelect} selectedNodeId="d2" labels={{ status: { warning: 'Achtung' } }} />);
    await user.click(screen.getByRole('button', { name: /DL 1/ }));
    expect(onNodeSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'd1' }), expect.objectContaining({ id: 'delivery' }));
    expect(screen.getByRole('button', { name: /DL 2/ })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByText(/Delivery/).textContent).toBe('Delivery, Achtung');
  });
});
