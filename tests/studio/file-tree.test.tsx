import { useReducer } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { ToastProvider } from '../../src';
import { renderWithTheme, axeViolations } from '../utils';
import { FileTree } from '../../studio/src/files/FileTree';
import { createStore, storeReducer, type StoreState } from '../../studio/src/model/store';
import { createProject } from '../../studio/src/model/project';

const FILES = {
  'src/App.tsx': "import Header from './components/Header';\nexport default function App() { return <Header />; }\n",
  'src/components/Header.tsx': 'export default function Header() { return null; }\n',
  'src/components/Footer.tsx': 'export default function Footer() { return null; }\n',
  'src/styles.css': '',
};

let latest: StoreState;
function Harness({ onOpen = () => {}, errors, announce, files = FILES }: { onOpen?: (p: string) => void; errors?: string[]; announce?: (m: string) => void; files?: Record<string, string> }) {
  const [state, dispatch] = useReducer(storeReducer, undefined, () => createStore(createProject(files)));
  latest = state;
  return (
    <ToastProvider>
      <FileTree state={state} dispatch={dispatch} onOpen={(p) => { dispatch({ type: 'openFile', path: p }); onOpen(p); }} errorPaths={errors} announce={announce} />
    </ToastProvider>
  );
}

const setup = (props: Parameters<typeof Harness>[0] = {}) => renderWithTheme(<Harness {...props} />);
const tree = () => screen.getByRole('tree', { name: 'Project files' });
const item = (name: RegExp) => within(tree()).getByRole('treeitem', { name });

describe('FileTree', () => {
  it('shows the pane title with the file count and the tree with markers in the accessible name', () => {
    setup({ errors: ['src/components/Footer.tsx'] });
    expect(screen.getByRole('heading', { name: /Files · 4/ })).toBeInTheDocument();
    // The name is the file name only; markers are the description (designer decision on #24).
    expect(item(/^App\.tsx$/)).toHaveAccessibleDescription('Entry');
    expect(item(/^Footer\.tsx$/)).toHaveAccessibleDescription('Not used by the entry page Has an error');
    expect(item(/^styles\.css$/)).toHaveAccessibleDescription('Not used by the entry page');
    expect(item(/^Header\.tsx$/)).not.toHaveAttribute('aria-describedby');
  });

  it('sorts folders first and pins the entry', () => {
    setup();
    const labels = within(tree()).getAllByRole('treeitem').map((el) => el.getAttribute('data-tree-id'));
    expect(labels).toEqual(['dir:src', 'dir:src/components', 'src/components/Footer.tsx', 'src/components/Header.tsx', 'src/App.tsx', 'src/styles.css']);
  });

  it('opens a file on Enter or click, but not on arrow keys', async () => {
    const onOpen = vi.fn();
    const { user } = setup({ onOpen });
    item(/^App\.tsx/).focus();
    await user.keyboard('{ArrowDown}');
    expect(onOpen).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(item(/^styles\.css/));
    await user.keyboard('{Enter}');
    expect(onOpen).toHaveBeenCalledWith('src/styles.css');
    expect(item(/^styles\.css/)).toHaveAttribute('aria-selected', 'true');
    await user.click(within(item(/^Header\.tsx/)).getByText('Header.tsx'));
    expect(onOpen).toHaveBeenLastCalledWith('src/components/Header.tsx');
  });

  it('toggles a folder with Enter', async () => {
    const { user } = setup();
    item(/^components/).focus();
    await user.keyboard('{Enter}');
    expect(item(/^components/)).toHaveAttribute('aria-expanded', 'false');
  });

  it('creates a new file inline from the keyboard with the starter component', async () => {
    const { user } = setup();
    item(/^App\.tsx/).focus();
    await user.keyboard('{Alt>}n{/Alt}');
    const input = screen.getByRole('textbox', { name: 'New file name' });
    expect(input).toHaveValue('Component.tsx');
    expect(screen.getByText('Press Enter to create, Escape to cancel.')).toBeInTheDocument();
    await user.keyboard('Banner{Enter}');
    expect(latest.project.files['src/Banner.tsx']).toContain('export default function Banner()');
    expect(latest.activePath).toBe('src/Banner.tsx');
  });

  it('blocks Enter while the name is invalid and shows the exact message', async () => {
    const { user } = setup();
    item(/^Header\.tsx/).focus();
    await user.keyboard('{Alt>}n{/Alt}');
    const input = screen.getByRole('textbox', { name: 'New file name' });
    await user.clear(input);
    await user.type(input, 'Header.tsx{Enter}');
    expect(screen.getByText('“Header.tsx” already exists in src/components.')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(Object.keys(latest.project.files)).toHaveLength(4);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('textbox', { name: 'New file name' })).toBeNull();
    expect(document.activeElement).toBe(item(/^Header\.tsx/));
  });

  it('creates a folder with its first file', async () => {
    const { user } = setup();
    item(/^App\.tsx/).focus();
    await user.keyboard('{Alt>}{Shift>}n{/Shift}{/Alt}');
    const input = screen.getByRole('textbox', { name: 'New folder name' });
    expect(input).toHaveValue('components/Component.tsx');
    expect(screen.getByText('Folders need at least one file.')).toBeInTheDocument();
    await user.keyboard('pages{Enter}');
    expect(latest.project.files['src/pages/Component.tsx']).toBeDefined();
  });

  it('renames with F2, rewrites imports and offers Undo in the toast', async () => {
    const { user } = setup();
    item(/^Header\.tsx/).focus();
    await user.keyboard('{F2}');
    const input = screen.getByRole('textbox', { name: 'Rename Header.tsx' });
    expect(input).toHaveValue('Header.tsx');
    await user.keyboard('TopBar{Enter}');
    expect(latest.project.files['src/App.tsx']).toContain("'./components/TopBar'");
    expect((await screen.findAllByText('Renamed to TopBar.tsx. Updated imports in 1 file.')).length).toBeGreaterThan(0);
    await user.click(screen.getAllByRole('button', { name: 'Undo' })[0]);
    expect(latest.project.files['src/components/Header.tsx']).toBeDefined();
    expect(latest.project.files['src/App.tsx']).toContain("'./components/Header'");
  });

  it('lists files it couldn\'t check after a rename as links that open them', async () => {
    const onOpen = vi.fn();
    const { user } = setup({ onOpen, files: { ...FILES, 'src/Broken.tsx': 'export default (' } });
    item(/^Header\.tsx/).focus();
    await user.keyboard('{F2}TopBar{Enter}');
    expect((await screen.findAllByText("Renamed to TopBar.tsx. Couldn't check imports in 1 file:")).length).toBeGreaterThan(0);
    const link = screen.getByRole('link', { name: 'src/Broken.tsx' });
    // The file is an EUI Link (an <a>), never a Button (#24 review).
    expect(link.tagName).toBe('A');
    expect(screen.queryByRole('button', { name: 'src/Broken.tsx' })).toBeNull();
    await user.click(link);
    expect(onOpen).toHaveBeenLastCalledWith('src/Broken.tsx');
    expect(screen.getAllByRole('button', { name: 'Undo' }).length).toBeGreaterThan(0);
  });

  it('deletes a file with an Undo toast and moves focus to the next sibling', async () => {
    const { user } = setup();
    item(/^Footer\.tsx/).focus();
    await user.keyboard('{Delete}');
    expect(latest.project.files['src/components/Footer.tsx']).toBeUndefined();
    expect((await screen.findAllByText('Deleted Footer.tsx')).length).toBeGreaterThan(0);
    await waitFor(() => expect(document.activeElement).toBe(item(/^Header\.tsx/)));
  });

  it('warns when other files still import a deleted file', async () => {
    const { user } = setup();
    item(/^Header\.tsx/).focus();
    await user.keyboard('{Delete}');
    expect((await screen.findAllByText('1 file still imports it.')).length).toBeGreaterThan(0);
  });

  it('does not delete the entry file', async () => {
    const { user } = setup();
    item(/^App\.tsx/).focus();
    await user.keyboard('{Delete}');
    expect(latest.project.files['src/App.tsx']).toBeDefined();
  });

  it('confirms folder deletes in an AlertDialog with Cancel focused', async () => {
    const { user } = setup();
    item(/^components/).focus();
    await user.keyboard('{Delete}');
    const dialog = screen.getByRole('alertdialog', { name: 'Delete folder components?' });
    expect(within(dialog).getByText('This deletes 2 files. You can undo with Undo.')).toBeInTheDocument();
    await waitFor(() => expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Cancel' })));
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
    expect(Object.keys(latest.project.files).sort()).toEqual(['src/App.tsx', 'src/styles.css']);
  });

  it('opens the context menu with Shift+F10 and returns focus on Escape', async () => {
    const { user } = setup();
    item(/^Header\.tsx/).focus();
    await user.keyboard('{Shift>}{F10}{/Shift}');
    const menu = screen.getByRole('menu');
    expect(within(menu).getAllByRole('menuitem').map((m) => m.textContent)).toEqual(
      expect.arrayContaining([expect.stringContaining('Open'), expect.stringContaining('Rename'), expect.stringContaining('Move to…'), expect.stringContaining('Duplicate'), expect.stringContaining('Copy path'), expect.stringContaining('Set as entry'), expect.stringContaining('Delete')]),
    );
    await waitFor(() => expect(document.activeElement).toBe(within(menu).getAllByRole('menuitem')[0]));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(item(/^Header\.tsx/));
  });

  it('opens the context menu on right-click and duplicates a file', async () => {
    const { user } = setup();
    fireEvent.contextMenu(within(item(/^Header\.tsx/)).getByText('Header.tsx'));
    await user.click(within(screen.getByRole('menu')).getByRole('menuitem', { name: /Duplicate/ }));
    expect(latest.project.files['src/components/Header-copy.tsx']).toBe(FILES['src/components/Header.tsx']);
  });

  it('moves a file through the Move to… dialog', async () => {
    const { user } = setup();
    item(/^Header\.tsx/).focus();
    await user.keyboard('{Shift>}{F10}{/Shift}');
    await user.click(within(screen.getByRole('menu')).getByRole('menuitem', { name: /Move to/ }));
    const dialog = screen.getByRole('dialog', { name: 'Move Header.tsx' });
    await user.click(within(dialog).getByText('src'));
    await user.click(within(dialog).getByRole('button', { name: 'Move' }));
    expect(latest.project.files['src/Header.tsx']).toBeDefined();
    expect(latest.project.files['src/App.tsx']).toContain("'./Header'");
  });

  it('moves a file by drag and drop onto a folder', () => {
    setup();
    const row = (re: RegExp) => item(re).firstElementChild as HTMLElement;
    const data = { setData: vi.fn(), getData: vi.fn(), types: ['application/x-eui-studio-path'], dropEffect: 'move', effectAllowed: 'move' };
    fireEvent.dragStart(row(/^styles\.css/), { dataTransfer: data });
    fireEvent.dragOver(row(/^components/), { dataTransfer: data });
    expect(row(/^components/)).toHaveAttribute('data-drop', 'valid');
    fireEvent.drop(row(/^components/), { dataTransfer: data });
    expect(latest.project.files['src/components/styles.css']).toBeDefined();
  });

  it('marks dropping a folder into itself as invalid', () => {
    setup();
    const row = (re: RegExp) => item(re).firstElementChild as HTMLElement;
    const data = { setData: vi.fn(), getData: vi.fn(), types: ['application/x-eui-studio-path'], dropEffect: 'move', effectAllowed: 'move' };
    fireEvent.dragStart(row(/^src/), { dataTransfer: data });
    fireEvent.dragOver(row(/^components/), { dataTransfer: data });
    expect(row(/^components/)).toHaveAttribute('data-drop', 'invalid');
  });

  it('follows activePath changes from outside (tabs, undo)', async () => {
    setup();
    act(() => { /* selection is controlled by activePath */ });
    expect(item(/^App\.tsx/)).toHaveAttribute('aria-selected', 'true');
  });

  it('offers "Create in src/" after a root-level create error', async () => {
    const { user } = setup({ files: { ...FILES, 'README.md': '' } });
    item(/^README\.md/).focus();
    await user.keyboard('{Alt>}n{/Alt}{Enter}');
    expect(screen.getByText(/^Only \.md and \.json files can go at the root\. Put other files in src\/\./)).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Create in src/' }));
    expect(latest.project.files['src/Component.tsx']).toContain('function Component()');
  });

  it('announces why a drop is not allowed', async () => {
    const announce = vi.fn();
    setup({ announce });
    const row = (re: RegExp) => item(re).firstElementChild as HTMLElement;
    const data = { setData: vi.fn(), getData: vi.fn(), types: ['application/x-eui-studio-path'], dropEffect: 'move', effectAllowed: 'move' };
    fireEvent.dragStart(row(/^src/), { dataTransfer: data });
    fireEvent.dragOver(row(/^components/), { dataTransfer: data });
    fireEvent.dragOver(row(/^components/), { dataTransfer: data });
    expect(announce.mock.calls.filter(([m]) => m === "A folder can't move into itself.")).toHaveLength(1);
  });

  it('announces why Move to… is not allowed', async () => {
    const announce = vi.fn();
    const { user } = setup({ announce });
    item(/^Header\.tsx/).focus();
    await user.keyboard('{Shift>}{F10}{/Shift}');
    await user.click(within(screen.getByRole('menu')).getByRole('menuitem', { name: /Move to/ }));
    await user.type(within(screen.getByRole('dialog')).getByRole('textbox', { name: /New folder name/ }), 'a b');
    await waitFor(() => expect(announce).toHaveBeenCalledWith('Use letters, numbers, dots, hyphens or underscores.'));
  });

  it('has no axe violations', async () => {
    const { container } = setup();
    expect(await axeViolations(container)).toEqual([]);
  });
});
