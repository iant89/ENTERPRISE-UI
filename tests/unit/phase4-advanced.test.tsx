import { useState } from 'react';
import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuditTrail, DiffViewer, ObjectEditor, VirtualList, compareDiffValues } from '../../src';
import { axeViolations, renderWithTheme } from '../utils';

const items = Array.from({ length: 10000 }, (_, index) => ({ id: `id-${index}`, label: `Item ${index}` }));
function ListHarness({ virtualized = true }: { virtualized?: boolean }) {
  const [selected, setSelected] = useState<string[]>([]);
  return <VirtualList aria-label="Inventory" items={items} getItemId={(item) => item.id} renderItem={(item) => item.label} itemHeight={40} height={200} overscan={1} selectedIds={selected} onSelectionChange={setSelected} virtualized={virtualized} />;
}
describe('Phase 4 advanced components', () => {
  it('bounds rendered rows, maintains selection across scroll, and navigates with the keyboard', async () => {
    const { user } = renderWithTheme(<ListHarness />);
    const list = screen.getByRole('listbox', { name: 'Inventory' });
    expect(screen.getAllByRole('option')).toHaveLength(6);
    expect(await axeViolations(list)).toEqual([]);
    list.focus();
    await user.keyboard(' ');
    expect(screen.getByRole('option', { name: 'Item 0' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.scroll(list, { target: { scrollTop: 2000 } });
    expect(screen.queryByRole('option', { name: 'Item 0' })).not.toBeInTheDocument();
    fireEvent.scroll(list, { target: { scrollTop: 0 } });
    expect(screen.getByRole('option', { name: 'Item 0' })).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{End}');
    expect(screen.getByRole('option', { name: 'Item 9999' })).toBeInTheDocument();
    expect(list.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Item 9999' }).id);
  });
  it('supports an explicitly unvirtualized alternative', () => {
    renderWithTheme(<VirtualList aria-label="Small list" items={items.slice(0, 20)} getItemId={(x) => x.id} renderItem={(x) => x.label} itemHeight={40} height={80} virtualized={false} />);
    expect(screen.getAllByRole('option')).toHaveLength(20);
  });
  it('compares nested JSON without confusing missing fields with null', async () => {
    const changes = compareDiffValues({ 'a/b': { name: 'old' }, remove: null, list: [1, { z: 2, a: 3 }] }, { 'a/b': { name: 'new' }, add: null, list: [1, { a: 3, z: 2 }] });
    expect(changes).toEqual([{ path: '/a~1b/name', kind: 'modified', before: 'old', after: 'new' }, { path: '/add', kind: 'added', after: null }, { path: '/remove', kind: 'removed', before: null }]);
    const { container } = renderWithTheme(<DiffViewer changes={changes} />);
    expect(screen.getByText('Added')).toBeInTheDocument();
    expect(screen.getByText('Removed')).toBeInTheDocument();
    expect(await axeViolations(container)).toEqual([]);
  });
  it('composes a diff into audit records and editor drafts without inventing audit events', async () => {
    const filters = { actor: '', action: '', start: '', end: '' };
    const { user } = renderWithTheme(<><AuditTrail records={[{ id: '1', action: 'Updated', actor: 'Sam', timestamp: '2026-01-01', source: 'API', changes: [{ field: 'status', before: 'Draft', after: 'Done' }] }]} filters={filters} onFiltersChange={vi.fn()} renderChanges={(record) => <DiffViewer changes={record.changes.map((c) => ({ path: c.field, kind: 'modified', before: c.before, after: c.after }))} />} /><ObjectEditor initialValue={{ name: 'Old' }} isEqual={(a, b) => a.name === b.name} onSave={vi.fn()}>{({ baseline, value, onChange }) => <><label>Name<input value={value.name} onChange={(event) => onChange({ name: event.target.value })} /></label><DiffViewer title="Draft changes" changes={compareDiffValues(baseline, value)} /></>}</ObjectEditor></>);
    expect(within(screen.getByRole('region', { name: 'Changes' })).getByText('Draft')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await user.clear(screen.getByLabelText('Name')); await user.type(screen.getByLabelText('Name'), 'New');
    expect(within(screen.getByRole('region', { name: 'Draft changes' })).getByText('New')).toBeInTheDocument();
  });
});
