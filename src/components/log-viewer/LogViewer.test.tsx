import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { LogViewer } from './LogViewer';

const lines = ['12:00:01 INFO Import started', '12:00:02 WARN Row 14: unknown unit, defaulted to PC', '12:00:03 ERROR Row 20: supplier 999 not found', '12:00:04 DEBUG cache hit', '12:00:05 INFO Import finished'];

describe('LogViewer', () => {
  it('detects levels, searches with highlighting and filters by level', async () => {
    const { user, container } = renderWithTheme(<LogViewer label="Import log" lines={lines} />);
    const log = screen.getByRole('log', { name: 'Import log' });
    expect(log).toHaveAttribute('aria-live', 'off');
    expect(log.querySelector('[class*="error"]')).toHaveTextContent('supplier 999');
    await user.type(screen.getByRole('searchbox', { name: 'Search log' }), 'row');
    expect(screen.getByText('2 of 5 lines')).toBeInTheDocument();
    expect(log.querySelectorAll('mark')).toHaveLength(2);
    await user.clear(screen.getByRole('searchbox', { name: 'Search log' }));
    await user.click(screen.getByRole('button', { name: 'Debug' }));
    await user.click(screen.getByRole('button', { name: 'Info' }));
    expect(screen.getByText('2 of 5 lines')).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });

  it('windows long logs', () => {
    const many = Array.from({ length: 5000 }, (_, i) => `INFO line ${i}`);
    renderWithTheme(<LogViewer label="Big" lines={many} follow={false} />);
    const rendered = screen.getByRole('log').querySelectorAll('[class*="line"]').length;
    expect(rendered).toBeLessThan(100);
    expect(screen.getByText('5,000 lines')).toBeInTheDocument();
  });
});
