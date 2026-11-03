import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { StatusHistory } from './StatusHistory';

const items = [
  { id: '1', label: 'Oct 27', status: 'success' as const },
  { id: '2', label: 'Oct 28', status: 'error' as const, description: 'Down 42 min' },
  { id: '3', label: 'Oct 29', status: 'warning' as const },
  { id: '4', label: 'Oct 30', status: 'success' as const },
];
const blocks = () => within(screen.getAllByRole('list')[0]).getAllByRole('listitem').map((li) => li.firstElementChild as HTMLElement);

describe('StatusHistory', () => {
  it('reads every block as text and summarises statuses in a legend', async () => {
    const { container } = renderWithTheme(<StatusHistory label="API uptime" title="API" summary="99.4% uptime" items={items} />);
    const region = screen.getByRole('region', { name: 'API uptime' });
    const [track, legend] = within(region).getAllByRole('list');
    expect(within(track).getAllByRole('listitem')[1]).toHaveTextContent('Oct 28: Outage. Down 42 min');
    expect(legend).toHaveTextContent('Operational 2Degraded 1Outage 1');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('is one tab stop with arrow, Home and End navigation and shows details for the focused block', async () => {
    const { user } = renderWithTheme(<><button>before</button><StatusHistory label="Uptime" items={items} /></>);
    await user.click(screen.getByText('before'));
    await user.tab();
    expect(blocks()[3]).toHaveFocus();
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(blocks()[1]).toHaveFocus();
    expect(screen.getByText((_, el) => el?.tagName === 'P' && el.textContent === 'Oct 28 · Outage · Down 42 min')).toBeInTheDocument();
    await user.keyboard('{Home}');
    expect(blocks()[0]).toHaveFocus();
    await user.keyboard('{End}');
    expect(blocks()[3]).toHaveFocus();
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it('renders buttons and reports activation when onSelect is set', async () => {
    const onSelect = vi.fn();
    const { user, container } = renderWithTheme(<StatusHistory label="Runs" items={items} onSelect={onSelect} />);
    screen.getByRole('button', { name: /Oct 30/ }).focus();
    await user.keyboard('{ArrowLeft}{Enter}');
    expect(onSelect).toHaveBeenCalledWith(items[2]);
    expect(await axeViolations(container)).toEqual([]);
  });
});
