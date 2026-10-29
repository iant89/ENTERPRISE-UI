import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ActivityFeed, ApprovalWorkflow, AuditTrail, ObjectEditor, ObjectSaveError, type ObjectFieldErrors } from '../../src';
import { axeViolations, renderWithTheme } from '../utils';

const emptyFilters = { actor: '', action: '', start: '', end: '' };

describe('enterprise workflows', () => {
  it('requires rejection reasons, confirms, and preserves input on backend errors', async () => {
    const onDecision = vi.fn().mockRejectedValueOnce(new Error('Not authorized')).mockResolvedValueOnce(undefined);
    const { user } = renderWithTheme(<ApprovalWorkflow status="pending" approver="Lee" history={[]} allowedDecisions={['reject']} onDecision={onDecision} />);
    await user.click(screen.getByRole('button', { name: 'Reject' }));
    expect(screen.getByRole('alert')).toHaveTextContent('reason');
    await user.type(screen.getByLabelText('Comment or rejection reason'), 'Incomplete');
    await user.click(screen.getByRole('button', { name: 'Reject' }));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Not authorized');
    expect(screen.getByLabelText('Comment or rejection reason')).toHaveValue('Incomplete');
    await user.click(screen.getByRole('button', { name: 'Reject' }));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onDecision).toHaveBeenCalledTimes(2);
    expect(onDecision.mock.calls[1].slice(0, 2)).toEqual(['reject', 'Incomplete']);
  });

  it('shows ordered activity, controlled filters, and incremental loading', async () => {
    const onTypeFilterChange = vi.fn(); const onLoadMore = vi.fn();
    const { user, container } = renderWithTheme(<ActivityFeed events={[
      { id: 'a', actor: 'Sam', timestamp: '2026-01-01T00:00:00Z', type: 'comment', description: 'Earlier' },
      { id: 'b', actor: 'Lee', timestamp: '2026-02-01T00:00:00Z', type: 'status', description: 'Later', group: 'Order' },
    ]} types={[{ value: 'status', label: 'Status' }]} onTypeFilterChange={onTypeFilterChange} hasMore onLoadMore={onLoadMore} />);
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Later');
    await user.selectOptions(screen.getByLabelText('Event type'), 'status');
    expect(onTypeFilterChange).toHaveBeenCalledWith('status');
    await user.click(screen.getByRole('button', { name: 'Load more activity' }));
    expect(onLoadMore).toHaveBeenCalledOnce();
    expect(await axeViolations(container)).toEqual([]);
  });

  it('renders audit details as authoritative before/after data and delegates filtering', async () => {
    const change = vi.fn();
    const { user, container } = renderWithTheme(<AuditTrail records={[{ id: '1', actor: 'Lee', timestamp: '2026-01-01T00:00:00Z', action: 'Update', source: 'API', changes: [{ field: 'Price', before: '3', after: '4' }] }]} filters={emptyFilters} onFiltersChange={change} />);
    expect(screen.getByText('Authoritative audit records')).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Changed fields for Update' })).toHaveTextContent('Price');
    await user.type(screen.getByLabelText('Actor'), 'L');
    expect(change).toHaveBeenCalledWith({ ...emptyFilters, actor: 'L' });
    expect(await axeViolations(container)).toEqual([]);
  });

  it('validates, keeps drafts through conflicts, and confirms navigation', async () => {
    const onSave = vi.fn().mockRejectedValueOnce(new ObjectSaveError('Conflict', { name: 'Outdated' }, true)).mockResolvedValueOnce({ value: { name: 'Updated' }, version: 'v2' });
    const navigate = vi.fn();
    const { user } = renderWithTheme(<ObjectEditor initialValue={{ name: 'Original' }} initialVersion="v1" isEqual={(a, b) => a.name === b.name} onSave={onSave} onNavigate={navigate}
      validate={(value): ObjectFieldErrors => value.name ? {} : { name: 'Required' }}>
      {({ value, onChange, mode, errors, requestNavigation }) => <><label>Name<input value={value.name} readOnly={mode === 'view'} onChange={(event) => onChange({ name: event.target.value })} /></label>
        {errors.name && <span>{errors.name}</span>}<button onClick={requestNavigation}>Leave</button></>}
    </ObjectEditor>);
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.clear(screen.getByLabelText('Name'));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText('Name'), 'Updated');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Outdated')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('Updated');
    expect(screen.getByRole('alert')).toHaveTextContent('record changed');
    await user.click(screen.getByRole('button', { name: 'Leave' }));
    expect(navigate).not.toHaveBeenCalled();
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(screen.getByLabelText('Name')).toHaveValue('Updated');
  });

  it('guards browser unload while dirty and removes the guard after reset', async () => {
    const { user } = renderWithTheme(<ObjectEditor initialValue="a" isEqual={(a, b) => a === b} onSave={async (value) => ({ value })}>
      {({ value, onChange }) => <label>Value<input value={value} onChange={(event) => onChange(event.target.value)} /></label>}
    </ObjectEditor>);
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.type(screen.getByLabelText('Value'), 'b');
    const event = new Event('beforeunload', { cancelable: true });
    fireEvent(window, event);
    expect(event.defaultPrevented).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    const next = new Event('beforeunload', { cancelable: true });
    fireEvent(window, next);
    expect(next.defaultPrevented).toBe(false);
  });
  it('allows explicit conflict resolution without discarding the merged draft', async () => {
    const save = vi.fn().mockRejectedValueOnce(new ObjectSaveError('Version mismatch', {}, true)).mockResolvedValueOnce({ value: 'merged', version: 'v3' });
    const { user } = renderWithTheme(<ObjectEditor initialValue="original" initialVersion="v1" isEqual={(a, b) => a === b} onSave={save}>
      {({ value, onChange, conflict, resolveConflict }) => <><label>Value<input value={value} onChange={(event) => onChange(event.target.value)} /></label>
        {conflict && <button onClick={() => resolveConflict('remote', 'v2', value)}>Use resolved version</button>}</>}
    </ObjectEditor>);
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.clear(screen.getByLabelText('Value')); await user.type(screen.getByLabelText('Value'), 'merged');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await user.click(await screen.findByRole('button', { name: 'Use resolved version' }));
    expect(screen.getByLabelText('Value')).toHaveValue('merged');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(save.mock.calls[1][1]).toBe('v2');
  });

  it('does not display empty states in place of errors', () => {
    renderWithTheme(<><ActivityFeed events={[]} error="Activity unavailable" /><AuditTrail records={[]} filters={emptyFilters} onFiltersChange={() => {}} error="Audit unavailable" /></>);
    expect(screen.getAllByRole('alert')).toHaveLength(2);
    expect(screen.queryByText('No activity.')).not.toBeInTheDocument();
    expect(screen.queryByText('No audit records.')).not.toBeInTheDocument();
  });

  it('groups adjacent related activity while keeping chronological order', () => {
    const { container } = renderWithTheme(<ActivityFeed events={[
      { id: '1', type: 'comment', actor: 'Lee', timestamp: '2026-01-03T00:00:00Z', description: 'First', group: 'Order 1' },
      { id: '2', type: 'status', actor: 'Lee', timestamp: '2026-01-02T00:00:00Z', description: 'Second', group: 'Order 1' },
      { id: '3', type: 'status', actor: 'Lee', timestamp: '2026-01-01T00:00:00Z', description: 'Third' },
    ]} />);
    expect(screen.getAllByText('Order 1')).toHaveLength(1);
    const topLevel = container.querySelector('ol')!;
    expect(topLevel.children).toHaveLength(2);
    expect(topLevel.children[0]).toHaveTextContent('First');
    expect(topLevel.children[0]).toHaveTextContent('Second');
    expect(topLevel.children[1]).toHaveTextContent('Third');
  });

  it('preserves date-only approval deadlines across time zones', () => {
    renderWithTheme(<ApprovalWorkflow status="pending" approver="Lee" history={[]} dueDate="2026-11-06" locale="en-US" timeZone="America/Los_Angeles" onDecision={async () => {}} />);
    expect(screen.getByText('Nov 6, 2026')).toBeInTheDocument();
  });

  it('allows a router to supply a specific continuation and cancels safely', async () => {
    const proceed = vi.fn();
    const { user } = renderWithTheme(<ObjectEditor initialValue="a" isEqual={(a, b) => a === b} onSave={async (value) => ({ value })}>
      {({ value, onChange, requestNavigationTo }) => <><label>Value<input value={value} onChange={(event) => onChange(event.target.value)} /></label>
        <button onClick={() => requestNavigationTo(proceed)}>Navigate</button></>}
    </ObjectEditor>);
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.type(screen.getByLabelText('Value'), 'b');
    await user.click(screen.getByRole('button', { name: 'Navigate' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancel' }));
    expect(proceed).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Navigate' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Confirm' }));
    expect(proceed).toHaveBeenCalledOnce();
  });

});
