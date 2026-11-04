import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { SearchPanel } from '../../studio/src/app/workspace/SearchPanel';
import { QuickOpen } from '../../studio/src/app/workspace/QuickOpen';
import { RewriteFeedback } from '../../studio/src/app/workspace/RewriteFeedback';
import { globToRegExp, pathFilter } from '../../studio/src/core/vfs/glob';
import { renderWithTheme, axeViolations } from '../utils';
import type { ChangeReport } from '../../studio/src/model/store';

const files = { 'src/App.tsx': 'import { Card } from "./Card";\nexport const App = () => <Card />;\n', 'src/Card.tsx': 'export function Card() { return null; }\n', 'README.md': 'Card docs\n' };

describe('glob', () => {
  it('matches ** and *', () => {
    expect(globToRegExp('src/**').test('src/a/b.tsx')).toBe(true);
    expect(globToRegExp('*.md').test('README.md')).toBe(true);
    expect(globToRegExp('*.md').test('src/a.tsx')).toBe(false);
    const f = pathFilter('src/**', '**/Card.tsx');
    expect(f('src/App.tsx')).toBe(true);
    expect(f('src/Card.tsx')).toBe(false);
    expect(f('README.md')).toBe(false);
    expect(pathFilter('', '')('anything')).toBe(true);
  });
});

describe('SearchPanel', () => {
  it('groups results, reports counts, opens a match, filters and flags bad regex', () => {
    const onOpen = vi.fn();
    render(<SearchPanel files={files} onOpen={onOpen} debounceMs={0} />);
    fireEvent.change(screen.getByPlaceholderText('Search'), { target: { value: 'Card' } });
    return screen.findByText(/results? in 3 files/).then(() => {
      fireEvent.click(screen.getByRole('button', { name: /export function Card\(\)/ }));
      expect(onOpen).toHaveBeenCalledWith('src/Card.tsx', 1, expect.any(Number));
      fireEvent.click(screen.getByRole('button', { name: /^App\.tsx/ }));
      expect(screen.getByRole('button', { name: /^App\.tsx/ })).toHaveAttribute('aria-expanded', 'false');
      fireEvent.change(screen.getByPlaceholderText(/Files to include/), { target: { value: 'src/**' } });
      return screen.findByText(/in 2 files/);
    }).then(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Use regular expression' }));
      fireEvent.change(screen.getByPlaceholderText('Search'), { target: { value: '(' } });
      expect(await screen.findByText(/invalid|unterminated|regular expression/i)).toBeTruthy();
    });
  });

  it('shows the no-results state', async () => {
    render(<SearchPanel files={files} onOpen={() => {}} debounceMs={0} />);
    fireEvent.change(screen.getByPlaceholderText('Search'), { target: { value: 'zzzz' } });
    expect((await screen.findAllByText(/No results/i)).length).toBeGreaterThan(0);
  });

  it('warns when capped', async () => {
    render(<SearchPanel files={files} onOpen={() => {}} debounceMs={0} maxResults={1} />);
    fireEvent.change(screen.getByPlaceholderText('Search'), { target: { value: 'Card' } });
    expect(await screen.findByText(/first 1/i)).toBeTruthy();
  });
});

describe('QuickOpen', () => {
  const paths = ['src/App.tsx', 'src/Card.tsx', 'src/Orders.tsx'];
  it('shows recent files with the current tag and removes one', () => {
    const onRemove = vi.fn();
    render(<QuickOpen paths={paths} recent={['src/Card.tsx', 'src/App.tsx']} current="src/Card.tsx" onOpen={() => {}} onRemoveRecent={onRemove} onClose={() => {}} />);
    expect(screen.getByRole('listbox', { name: 'Recently opened' })).toBeTruthy();
    expect(screen.getAllByRole('option')).toHaveLength(2);
    expect(screen.getByText('current')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Remove src/App.tsx from recently opened' }));
    expect(onRemove).toHaveBeenCalledWith('src/App.tsx');
  });
  it('fuzzy filters, navigates with arrows, opens with :line and closes on Escape', () => {
    const onOpen = vi.fn(); const onClose = vi.fn();
    render(<QuickOpen paths={paths} recent={[]} current="src/App.tsx" onOpen={onOpen} onRemoveRecent={() => {}} onClose={onClose} />);
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'ord:12' } });
    expect(screen.getAllByRole('option')[0]).toHaveTextContent('Orders.tsx');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onOpen).toHaveBeenCalledWith('src/Orders.tsx', 12);
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});

describe('RewriteFeedback', () => {
  const base: ChangeReport = { id: 1, verb: 'Renamed', from: 'src/Card.tsx', to: 'src/Tile.tsx', files: [{ path: 'src/App.tsx', count: 1 }], unresolved: [] };
  it('shows success with undo and changes, auto-dismissing', () => {
    vi.useFakeTimers();
    const onUndo = vi.fn(); const onOpen = vi.fn();
    render(<RewriteFeedback report={base} onUndo={onUndo} onOpen={onOpen} onOpenProblems={() => {}} />);
    expect(screen.getByText(/Updated imports in 1 file/i)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Show changes/ }));
    fireEvent.click(screen.getByText('src/App.tsx'));
    expect(onOpen).toHaveBeenCalledWith("src/App.tsx");
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onUndo).toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(8100); });
    expect(screen.queryByText(/Updated imports in 1 file/i)).toBeNull();
    vi.useRealTimers();
  });
  it('keeps a warning for unresolved imports', () => {
    vi.useFakeTimers();
    const onProblems = vi.fn(); const onOpen = vi.fn();
    render(<RewriteFeedback report={{ ...base, id: 2, unresolved: [{ file: 'src/Lazy.tsx', specifier: "'./' + x", line: 4, reason: 'dynamic' }] }} onUndo={() => {}} onOpen={onOpen} onOpenProblems={onProblems} />);
    act(() => { vi.advanceTimersByTime(20000); });
    fireEvent.click(screen.getByText(/src\/Lazy.tsx:4/));
    expect(onOpen).toHaveBeenCalledWith('src/Lazy.tsx', 4);
    fireEvent.click(screen.getByRole('button', { name: /Open in Problems/ }));
    expect(onProblems).toHaveBeenCalled();
    vi.useRealTimers();
  });
});

describe('C2 UI accessibility', () => {
  it('has no axe violations in search results, quick open and feedback', async () => {
    const { container } = renderWithTheme(
      <div>
        <SearchPanel files={files} onOpen={() => {}} debounceMs={0} />
        <QuickOpen paths={['src/App.tsx']} recent={['src/App.tsx']} current="src/App.tsx" onOpen={() => {}} onRemoveRecent={() => {}} onClose={() => {}} />
        <RewriteFeedback report={{ id: 3, verb: 'Moved', from: 'src/A.tsx', to: 'src/x/A.tsx', files: [], unresolved: [{ file: 'src/B.tsx', specifier: '@/A', line: 1, reason: 'alias' }] }} onUndo={() => {}} onOpen={() => {}} onOpenProblems={() => {}} />
      </div>,
    );
    fireEvent.change(screen.getByPlaceholderText('Search'), { target: { value: 'Card' } });
    await screen.findByText(/in 3 files/);
    expect(await axeViolations(container)).toEqual([]);
  });
});
