import { describe, expect, it } from 'vitest';
import { createRef } from 'react';
import { screen, within } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { StatusHistory, type StatusHistorySegment } from './StatusHistory';

const segments: StatusHistorySegment[] = [
  { id: '14:00', status: 'success', label: '14:00–14:15: Healthy' },
  { id: '14:15', status: 'warning', label: '14:15–14:30: Degraded (worst of 3 checks)' },
  { id: '14:30', status: null, label: '14:30–14:45: no checks' },
  { id: '14:45', status: 'error', label: '14:45–15:00: Offline' },
  { id: '15:00', status: 'disabled', label: '15:00–15:15: Disabled' },
];

describe('StatusHistory', () => {
  it('is a named list whose segments carry their status in text', async () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = renderWithTheme(<StatusHistory ref={ref} segments={segments} className="extra" data-testid="strip" />);
    const list = screen.getByRole('list', { name: 'Status over time, oldest first' });
    expect(ref.current).toBe(list);
    expect(list).toHaveClass('extra');
    const items = within(list).getAllByRole('listitem');
    expect(items.map((i) => i.getAttribute('aria-label'))).toEqual(segments.map((s) => s.label));
    expect(items.map((i) => i.getAttribute('title'))).toEqual(segments.map((s) => s.label));
    expect(items.map((i) => i.dataset.status)).toEqual(['success', 'warning', 'none', 'error', 'disabled']);
    expect(await axeViolations(container)).toEqual([]);
  });

  it('takes its own name and size', () => {
    renderWithTheme(<StatusHistory segments={segments.slice(0, 1)} aria-label="Gateway, last 24 hours" size="sm" />);
    expect(screen.getByRole('list', { name: 'Gateway, last 24 hours' })).toBeInTheDocument();
  });
});
