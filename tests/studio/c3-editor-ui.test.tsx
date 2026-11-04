import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { renderWithTheme, axeViolations } from '../utils';
import { EditorTabs } from '../../studio/src/app/workspace/EditorTabs';
import { ReferencesPanel, type ReferenceSet } from '../../studio/src/panels/bottom/ReferencesPanel';
import { BottomPanel } from '../../studio/src/panels/bottom/BottomPanel';
import { RenameSymbolFeedback, type SymbolRename } from '../../studio/src/app/workspace/RenameSymbolFeedback';

// A minimal Monaco for CodeEditor: records the options it is given.
const editors: { options: Record<string, unknown>[]; model: unknown }[] = [];
vi.mock('../../studio/src/editor/monaco', () => {
  const models = new Map<string, unknown>();
  const monaco = {
    Uri: { parse: (v: string) => ({ toString: () => v, scheme: 'file' }) },
    KeyCode: { F2: 60, F12: 70, KeyF: 36 }, KeyMod: { Shift: 1024, Alt: 512 },
    editor: {
      getModel: (u: { toString(): string }) => models.get(u.toString()) ?? null,
      createModel: (text: string, _l: string, u: { toString(): string }) => {
        let value = text;
        const m = { uri: u, getValue: () => value, setValue: (t: string) => { value = t; }, isDisposed: () => false, dispose: () => undefined, getPositionAt: () => ({ lineNumber: 1, column: 1 }), pushEditOperations: () => null, pushStackElement: () => undefined };
        models.set(u.toString(), m);
        return m;
      },
      create: (_host: HTMLElement, options: Record<string, unknown>) => {
        const rec = { options: [options], model: null as unknown };
        editors.push(rec);
        return {
          updateOptions: (o: Record<string, unknown>) => rec.options.push(o),
          setModel: (m: unknown) => { rec.model = m; }, getModel: () => rec.model, saveViewState: () => null, restoreViewState: () => undefined,
          onDidChangeModelContent: () => undefined, onDidChangeCursorPosition: () => undefined, onDidFocusEditorText: () => undefined, onKeyDown: () => undefined, onDidDispose: () => undefined,
          addAction: () => undefined, dispose: () => undefined, focus: () => undefined,
        };
      },
    },
  };
  return { monaco, applyTheme: () => undefined };
});
vi.mock('../../studio/src/editor/monaco/navigation', () => ({ setOpenHandler: () => undefined, findReferences: async () => null, renameTarget: async () => ({ ok: false, message: '' }), computeRename: async () => ({ ok: false, message: '' }) }));

const TABS = ['src/App.tsx', 'src/Card.tsx', 'src/Page.tsx', 'src/Nav.tsx'];

describe('EditorTabs (C3)', () => {
  it('overflow "+N" menu lists hidden tabs and "Close all tabs in group"', () => {
    const onSelect = vi.fn(); const onCloseAll = vi.fn();
    renderWithTheme(<EditorTabs tabs={TABS} active="src/App.tsx" dirty={new Set(['src/Nav.tsx'])} onSelect={onSelect} onClose={() => {}} maxVisible={2} onCloseAll={onCloseAll} />);
    fireEvent.click(screen.getByRole('button', { name: '2 more open files' }));
    const menu = screen.getByRole('menu', { name: 'More open files' });
    const items = within(menu).getAllByRole('menuitem');
    expect(items.map((i) => i.textContent)).toEqual(['Page.tsx', 'Nav.tsx', 'Close all tabs in group']);
    expect(document.activeElement).toBe(items[0]);
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(items[1]);
    fireEvent.click(items[2]);
    expect(onCloseAll).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '2 more open files' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Page.tsx' }));
    expect(onSelect).toHaveBeenCalledWith('src/Page.tsx');
  });

  it('Ctrl+Shift+PgUp/PgDn moves a tab, across groups at the ends; middle-click closes', () => {
    const onMove = vi.fn(); const onClose = vi.fn();
    renderWithTheme(<EditorTabs tabs={TABS} active="src/Card.tsx" dirty={new Set()} onSelect={() => {}} onClose={onClose} onMove={onMove} group={0} groupCount={2} />);
    expect(screen.getByRole('list', { name: 'Open files, group 1' })).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('button', { name: 'Card.tsx' }), { key: 'PageDown', ctrlKey: true, shiftKey: true });
    expect(onMove).toHaveBeenLastCalledWith('src/Card.tsx', 0, 0, 2);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Nav.tsx' }), { key: 'PageDown', ctrlKey: true, shiftKey: true });
    expect(onMove).toHaveBeenLastCalledWith('src/Nav.tsx', 0, 1, 0);
    fireEvent(screen.getByRole('button', { name: 'Page.tsx' }).parentElement!, new MouseEvent('auxclick', { bubbles: true, button: 1 }));
    expect(onClose).toHaveBeenCalledWith('src/Page.tsx');
  });

  it('split and group actions; the unfocused group\'s active tab is neutral; no axe violations', async () => {
    const onSplit = vi.fn(); const onCloseOthers = vi.fn();
    const { container } = renderWithTheme(<EditorTabs tabs={TABS} active="src/Card.tsx" dirty={new Set()} onSelect={() => {}} onClose={() => {}} onSplit={onSplit} onCloseAll={() => {}} onCloseOthers={onCloseOthers} group={1} groupCount={2} focused={false} onMove={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Split editor right' }));
    expect(onSplit).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Group 2 actions' }));
    expect(within(screen.getByRole('menu', { name: 'Group 2 actions' })).getAllByRole('menuitem').map((i) => i.textContent)).toEqual(['Close other tabs', 'Move tab to group 1', 'Close all tabs in group']);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Close other tabs' }));
    expect(onCloseOthers).toHaveBeenCalledWith('src/Card.tsx');
    expect(screen.getByRole('button', { name: 'Card.tsx' }).parentElement!.className).toMatch(/activeTabNeutral/);
    expect(await axeViolations(container)).toEqual([]);
  });
});

const REFS: ReferenceSet = {
  symbol: 'Card',
  groups: [
    { path: 'src/Card.tsx', items: [{ line: 1, column: 17, endColumn: 21, preview: 'export function Card() {' }] },
    { path: 'src/Page.tsx', items: [{ line: 1, column: 10, endColumn: 14, preview: "import { Card } from './Card';" }, { line: 4, column: 11, endColumn: 15, preview: '  return <Card />;' }] },
  ],
};

describe('References tab (C3 decision 5a)', () => {
  it('lists pinned references by file; arrows move, Enter opens', async () => {
    const onOpen = vi.fn();
    const { container } = renderWithTheme(<ReferencesPanel references={REFS} onOpen={onOpen} onClear={() => {}} />);
    expect(screen.getByRole('status')).toHaveTextContent('3 references to Card in 2 files');
    const buttons = within(screen.getByRole('list', { name: 'References to Card' })).getAllByRole('button');
    buttons[0].focus();
    fireEvent.keyDown(buttons[0], { key: 'ArrowDown' });
    fireEvent.keyDown(buttons[1], { key: 'End' });
    expect(document.activeElement).toBe(buttons[2]);
    fireEvent.click(buttons[2]); // Enter on a button clicks it
    expect(onOpen).toHaveBeenCalledWith('src/Page.tsx', 4, 11);
    expect(container.querySelector('mark')?.textContent).toBe('Card');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('is a bottom-panel tab with a count, and has an empty state', () => {
    const { rerender } = renderWithTheme(<BottomPanel tab="references" onTab={() => {}} problems={[]} onGoTo={() => {}} onCollapse={() => {}} references={REFS} />);
    expect(screen.getByRole('tab', { name: 'References (3)' })).toHaveAttribute('aria-selected', 'true');
    rerender(<BottomPanel tab="references" onTab={() => {}} problems={[]} onGoTo={() => {}} onCollapse={() => {}} references={null} />);
    expect(screen.getByText(/No pinned references/)).toBeInTheDocument();
  });
});

describe('Rename symbol strip (C3 decisions 6a, 7a)', () => {
  const done: SymbolRename = { id: 1, mode: 'done', oldName: 'Card', newName: 'Tile', edits: [{ path: 'src/Card.tsx', count: 1 }, { path: 'src/Page.tsx', count: 2 }], fileToRename: 'src/Card.tsx' };
  it('lists edits per file with links, Undo and "Also rename the file?"', () => {
    const onUndo = vi.fn(); const onOpen = vi.fn(); const onRenameFile = vi.fn();
    renderWithTheme(<RenameSymbolFeedback result={done} onApply={() => {}} onCancel={() => {}} onUndo={onUndo} onOpen={onOpen} onRenameFile={onRenameFile} onDismiss={() => {}} />);
    expect(screen.getByText('3 edits in 2 files.', { exact: false })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: 'src/Page.tsx' }));
    expect(onOpen).toHaveBeenCalledWith('src/Page.tsx');
    fireEvent.click(screen.getByRole('link', { name: 'Also rename the file?' }));
    expect(onRenameFile).toHaveBeenCalledWith('src/Card.tsx');
    expect(screen.getByText(/Card\.tsx → Tile\.tsx/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onUndo).toHaveBeenCalled();
  });
  it('Shift+Enter preview asks before applying', () => {
    const onApply = vi.fn(); const onCancel = vi.fn();
    renderWithTheme(<RenameSymbolFeedback result={{ ...done, mode: 'preview', fileToRename: null }} onApply={onApply} onCancel={onCancel} onUndo={() => {}} onOpen={() => {}} onRenameFile={() => {}} onDismiss={() => {}} />);
    expect(screen.getByText('Rename Card to Tile?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onApply).toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();
  });
});

describe('CodeEditor accessible name (C3 fix)', () => {
  it('follows the active file instead of keeping the first label', async () => {
    const { CodeEditor } = await import('../../studio/src/editor/CodeEditor');
    const files = { 'src/App.tsx': 'a', 'src/Header.tsx': 'b' };
    const { rerender } = render(<CodeEditor files={files} path="src/App.tsx" theme="light" label="Code editor, src/App.tsx" />);
    await waitFor(() => expect(editors).toHaveLength(1));
    expect(editors[0].options[0].ariaLabel).toBe('Code editor, src/App.tsx');
    await act(async () => { rerender(<CodeEditor files={files} path="src/Header.tsx" theme="light" label="Code editor, src/Header.tsx, group 1" />); });
    expect(editors[0].options.at(-1)).toEqual({ ariaLabel: 'Code editor, src/Header.tsx, group 1' });
    expect((editors[0].model as { uri: { toString(): string } }).uri.toString()).toBe('file:///src/Header.tsx');
  });
});
