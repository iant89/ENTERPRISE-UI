import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type Dispatch, type DragEvent as ReactDragEvent, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
import {
  AlertDialog, Badge, Button, Dialog, IconButton, Input, Link, Menu, OverflowMenu, Skeleton, Tooltip, Tree, VisuallyHidden, useAnnouncer, useToast,
  type MenuEntry,
} from '@enterprise-ui/react';
import {
  ChevronsDownUp, CircleAlert, Copy, FileCode, FileCode2, FileJson, FilePlus, FileText, FileType, FlaskConical, Folder, FolderInput, FolderOpen, FolderPlus,
  Pencil, Star, Trash2, Unlink, ClipboardCopy, FileOutput,
} from 'lucide-react';
import { basename, dirname, extname, type FilePath } from '../model/project';
import { storeReducer, type StoreAction, type StoreState } from '../model/store';
import {
  buildTreeNodes, copyName, deleteFocusTarget, fileKind, folderId, importersOf, isFolderId, MESSAGES, newFilePrefill, newFolderPrefill, pathOf, reachableFrom,
  removedFolders, rewrittenFiles, starterContent, targetFolder, unrewritable, validateEntry, walk, type FileIconName, type FileNode, type ValidateContext,
} from './fileTreeModel';
import styles from './FileTree.module.css';

/**
 * The Files pane (UX-4 / M3-08). It composes the EUI `Tree`; the context menu, inline create and
 * rename, and drag-to-move live here, wired through the `role="tree"` container with
 * `event.target.closest('[role=treeitem]')`, so the library stays unchanged.
 */

const ICONS: Record<FileIconName, ReactNode> = {
  FileCode: <FileCode />, FileCode2: <FileCode2 />, FlaskConical: <FlaskConical />, FileType: <FileType />, FileJson: <FileJson />, FileText: <FileText />,
};
const NEW_ID = '__new__';
const DRAG_TYPE = 'application/x-eui-studio-path';
const DEBOUNCE_MS = 150;
const HOVER_EXPAND_MS = 600;

export interface FileTreeProps {
  state: StoreState;
  dispatch: Dispatch<StoreAction>;
  /** Opens a file as the active tab (UX-10). Called on click or Enter. */
  onOpen: (path: FilePath) => void;
  /** Files with a preview or compile error (UX-9). */
  errorPaths?: Iterable<FilePath>;
  /** Shows the loading skeleton (opening a project). */
  loading?: boolean;
  /** Title id, so a surrounding `section` can be labelled by it. */
  titleId?: string;
  /** Collapse toggle for the pane title (rendered before the title). */
  collapseToggle?: ReactNode;
  /** Whether the pane body is collapsed. */
  collapsed?: boolean;
  bodyId?: string;
  /** Override for announcements (defaults to `useAnnouncer`). */
  announce?: (message: string) => void;
  /** Class for the `h2` (Studio's shared pane title style). */
  titleClassName?: string;
}

interface EditState {
  mode: 'create' | 'rename';
  kind: 'file' | 'folder';
  /** Folder the typed name is relative to. */
  folder: FilePath;
  /** The renamed item, or the parent folder for create. */
  self?: FilePath;
  value: string;
  select: [number, number];
  /** Row the input sits over. */
  anchorId: string;
  /** Row to focus on cancel. */
  returnId: string | null;
  label: string;
  helper: string;
}

interface MenuState { id: string | null; x: number; y: number }

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

type DescribedNode = FileNode & { describedBy?: string };
const markerId = (id: string, kind: string) => `ft-${id.replace(/[^A-Za-z0-9_-]/g, (c) => `_${c.charCodeAt(0).toString(16)}`)}-${kind}`;

export function FileTree({ state, dispatch, onOpen, errorPaths, loading, titleId = 'files-title', collapseToggle, collapsed, bodyId = 'files-body', titleClassName, announce: announceProp }: FileTreeProps) {
  const { project, activePath } = state;
  const { files, entry } = project;
  const toast = useToast();
  const themeAnnounce = useAnnouncer();
  const announce = announceProp ?? themeAnnounce;
  const bodyRef = useRef<HTMLDivElement>(null);
  const focusedId = useRef<string | null>(null);
  const keyActivation = useRef(false);
  const [expanded, setExpanded] = useState<string[]>(() => allFolders(files));
  const [edit, setEdit] = useState<EditState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editTop, setEditTop] = useState(0);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [moveId, setMoveId] = useState<string | null>(null);
  const [confirmFolder, setConfirmFolder] = useState<FilePath | null>(null);
  const pendingFocus = useRef<string | null>(null);
  const fileCount = Object.keys(files).length;
  const tsxCount = useMemo(() => Object.keys(files).filter((p) => extname(p) === '.tsx').length, [files]);
  const used = useMemo(() => reachableFrom(files, entry), [files, entry]);
  const errors = useMemo(() => new Set(errorPaths ?? []), [errorPaths]);

  const baseNodes = useMemo(() => buildTreeNodes(files, entry), [files, entry]);
  const nodes = useMemo(() => {
    const decorate = (list: FileNode[]): FileNode[] => list.map((n) => {
      if (n.folder) return { ...n, icon: expanded.includes(n.id) ? <FolderOpen /> : <Folder />, children: decorate(n.children ?? []) };
      const isEntry = n.path === entry;
      const unused = !used.has(n.path);
      const broken = errors.has(n.path);
      const trailing = (isEntry || unused || broken) ? (
        <span className={styles.marker}>
          {isEntry && <Badge id={markerId(n.id, 'entry')} tone="neutral" aria-hidden="true">Entry</Badge>}
          {unused && <span id={markerId(n.id, 'unused')} title="Not used by the entry page" aria-hidden="true"><Unlink className={styles.unused} /><VisuallyHidden>Not used by the entry page</VisuallyHidden></span>}
          {broken && <span id={markerId(n.id, 'error')} aria-hidden="true"><CircleAlert className={styles.errorIcon} /><VisuallyHidden>Has an error</VisuallyHidden></span>}
        </span>
      ) : undefined;
      const describedBy = [isEntry && markerId(n.id, 'entry'), unused && markerId(n.id, 'unused'), broken && markerId(n.id, 'error')].filter(Boolean).join(' ');
      return { ...n, icon: ICONS[fileKind(n.path)], trailing, describedBy };
    });
    let out = decorate(baseNodes);
    if (edit?.mode === 'create') out = insertPlaceholder(out, edit.folder);
    return out;
  }, [baseNodes, entry, used, errors, expanded, edit]);

  const nodeById = useMemo(() => {
    const map = new Map<string, FileNode>();
    walk(nodes, (n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  const rowEl = useCallback((id: string) => bodyRef.current?.querySelector<HTMLElement>(`[data-tree-id="${CSS.escape(id)}"]`) ?? null, []);
  const focusRow = useCallback((id: string | null) => {
    if (!id) return;
    const el = rowEl(id);
    if (el) { el.focus(); focusedId.current = id; } else pendingFocus.current = id;
  }, [rowEl]);

  // Selection follows activePath (tabs, undo, canvas): expand its folders and scroll it into view.
  useEffect(() => {
    setExpanded((prev) => { const next = ancestors(activePath, prev); return next.length === prev.length ? prev : next; });
    requestAnimationFrame(() => rowEl(activePath)?.scrollIntoView?.({ block: 'nearest' }));
  }, [activePath, rowEl]);

  useEffect(() => {
    if (pendingFocus.current && rowEl(pendingFocus.current)) { const id = pendingFocus.current; pendingFocus.current = null; focusRow(id); }
  });

  // Rows are rendered by the library Tree; from here, make them draggable and point
  // aria-describedby at the markers. The accessible name stays the file name only (§4.9, designer on #24).
  useEffect(() => {
    bodyRef.current?.querySelectorAll<HTMLElement>('[role="treeitem"]').forEach((li) => {
      const desc = (nodeById.get(li.dataset.treeId ?? '') as DescribedNode | undefined)?.describedBy;
      if (desc) li.setAttribute('aria-describedby', desc); else li.removeAttribute('aria-describedby');
      const row = li.firstElementChild as HTMLElement | null;
      if (row) row.draggable = !edit;
    });
  });

  // ------------------------------------------------------------ inline editor

  useLayoutEffect(() => {
    if (!edit) return;
    const row = rowEl(edit.anchorId)?.firstElementChild as HTMLElement | null;
    const body = bodyRef.current;
    if (row && body) setEditTop(row.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop);
  }, [edit, nodes, rowEl]);

  const ctxFor = useCallback((e: EditState): ValidateContext => (
    e.mode === 'create' ? { files, folder: e.folder, kind: 'file', mode: 'create' } : { files, folder: e.folder, kind: e.kind, mode: 'rename', self: e.self }
  ), [files]);

  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);
  const onEditChange = (value: string) => {
    if (!edit) return;
    const next = { ...edit, value };
    setEdit(next);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => setError(value.trim() ? validateEntry(value, ctxFor(next)).error : null), DEBOUNCE_MS);
  };

  const startCreate = useCallback((kind: 'file' | 'folder', from: string | null = focusedId.current) => {
    if (fileCount >= 200) { announce(MESSAGES.files); toast.show({ title: MESSAGES.files, tone: 'warning' }); return; }
    const folder = targetFolder(from);
    const prefill = kind === 'file' ? newFilePrefill() : newFolderPrefill();
    setExpanded((prev) => ancestors(`${folder}/x`, prev));
    setError(null);
    setMenu(null);
    setEdit({
      mode: 'create', kind, folder, value: prefill.value, select: prefill.select, anchorId: NEW_ID, returnId: from,
      label: kind === 'file' ? 'New file name' : 'New folder name',
      helper: kind === 'file' ? 'Press Enter to create, Escape to cancel.' : 'Folders need at least one file.',
    });
  }, [announce, fileCount, toast]);

  const startRename = useCallback((id: string) => {
    const path = pathOf(id);
    const name = basename(path);
    const ext = isFolderId(id) ? '' : extname(name);
    setError(null);
    setMenu(null);
    setEdit({
      mode: 'rename', kind: isFolderId(id) ? 'folder' : 'file', folder: dirname(path), self: path, value: name, select: [0, name.length - ext.length],
      anchorId: id, returnId: id, label: `Rename ${name}`, helper: 'Press Enter to rename, Escape to cancel.',
    });
  }, []);

  const cancelEdit = useCallback(() => {
    const back = edit?.returnId ?? null;
    setEdit(null);
    setError(null);
    (pendingFocus.current = back);
  }, [edit]);

  // ------------------------------------------------------------ operations

  const undoAction = useMemo(() => ({ label: 'Undo', onClick: () => dispatch({ type: 'undo' }) }), [dispatch]);

  const announceRemovedFolders = useCallback((before: Record<FilePath, string>, after: Record<FilePath, string>) => {
    for (const f of removedFolders(before, after)) announce(`Folder ${basename(f)} removed (empty).`);
  }, [announce]);

  /** Renames or moves a file/folder through the store and reports imports (§4.5, §4.6). */
  const move = useCallback((id: string, to: FilePath, verb: 'Renamed' | 'Moved') => {
    const from = pathOf(id);
    const folder = isFolderId(id);
    const movedPaths = Object.keys(files).filter((p) => (folder ? p.startsWith(`${from}/`) : p === from));
    const moves = new Map(movedPaths.map((p) => [p, folder ? to + p.slice(from.length) : to] as const));
    let next: StoreState;
    try {
      next = reduceOnce(state, folder ? { type: 'renameFolder', from, to } : { type: 'renameFile', from, to });
    } catch (e) {
      toast.show({ title: e instanceof Error ? e.message : String(e), tone: 'error' });
      return false;
    }
    dispatch(folder ? { type: 'renameFolder', from, to } : { type: 'renameFile', from, to });
    const rewritten = rewrittenFiles(files, next.project.files, moves).filter((p) => !moves.has(p) && ![...moves.values()].includes(p));
    const stale = unrewritable(files, movedPaths);
    const name = basename(to);
    const head = verb === 'Moved' ? `Moved ${name} to ${dirname(to) || 'the project root'}.` : `Renamed to ${name}.`;
    if (stale.length) {
      const shown = stale.slice(0, 3);
      toast.show({
        title: `${head} Imports in ${plural(stale.length, 'file')} couldn't be updated:`,
        description: (
          <span>
            {shown.map((p, i) => <span key={p}>{i ? ', ' : ''}<Button size="sm" variant="tertiary" onClick={() => onOpen(p)}>{p}</Button></span>)}
            {stale.length > 3 ? ` and ${stale.length - 3} more` : ''}
          </span>
        ),
        tone: 'warning', duration: 0, action: undoAction,
      });
      announce(`${head} Imports in ${plural(stale.length, 'file')} couldn't be updated: ${stale.join(', ')}.`);
    } else if (rewritten.length) {
      toast.show({ title: `${head} Updated imports in ${plural(rewritten.length, 'file')}.`, tone: 'success', action: undoAction });
    } else {
      announce(head);
      if (verb === 'Moved') toast.show({ title: head, tone: 'success', action: undoAction });
    }
    announceRemovedFolders(files, next.project.files);
    pendingFocus.current = folder ? folderId(to) : to;
    return true;
  }, [announce, announceRemovedFolders, dispatch, files, onOpen, state, toast, undoAction]);

  const commitEdit = useCallback((fromBlur = false) => {
    if (!edit) return;
    const result = validateEntry(edit.value, ctxFor(edit));
    if (result.error || !result.path) {
      if (fromBlur) { cancelEdit(); return; }
      setError(result.error);
      return;
    }
    const path = result.path;
    if (edit.mode === 'create') {
      try {
        dispatch({ type: 'createFile', path, text: starterContent(path) });
      } catch (e) { setError(e instanceof Error ? e.message : String(e)); return; }
      setEdit(null);
      setError(null);
      announce(`Created ${basename(path)}.`);
      onOpen(path);
      pendingFocus.current = path;
      return;
    }
    const id = edit.anchorId;
    setEdit(null);
    setError(null);
    if (path === edit.self) { (pendingFocus.current = id); return; }
    move(id, path, 'Renamed');
  }, [announce, cancelEdit, ctxFor, dispatch, edit, move, onOpen]);

  /** "Create in src/": retries a root-level create in src/ (designer on #24). */
  const retryInSrc = () => {
    if (!edit) return;
    const next = { ...edit, folder: 'src' };
    const result = validateEntry(next.value, ctxFor(next));
    if (result.error || !result.path) { setEdit(next); setError(result.error); return; }
    setEdit(next);
    try { dispatch({ type: 'createFile', path: result.path, text: starterContent(result.path) }); } catch (e) { setError((e as Error).message); return; }
    setEdit(null); setError(null);
    announce(`Created ${basename(result.path)} in src.`);
    onOpen(result.path);
    pendingFocus.current = result.path;
  };

  const deleteBlocked = useCallback((id: string): string | null => {
    if (isFolderId(id)) return Object.keys(files).some((p) => p === entry && p.startsWith(`${pathOf(id)}/`)) ? 'Set another entry file first.' : null;
    if (id === entry) return 'Set another entry file first.';
    if (extname(id) === '.tsx' && tsxCount <= 1) return "The project needs at least one .tsx file.";
    return null;
  }, [entry, files, tsxCount]);

  const requestDelete = useCallback((id: string) => {
    setMenu(null);
    const blocked = deleteBlocked(id);
    if (blocked) { announce(blocked); toast.show({ title: blocked, tone: 'warning' }); return; }
    if (isFolderId(id)) { setConfirmFolder(pathOf(id)); return; }
    const focusNext = deleteFocusTarget(nodes, id);
    const importers = importersOf(files, id);
    const next = reduceOnce(state, { type: 'deleteFile', path: id });
    dispatch({ type: 'deleteFile', path: id });
    toast.show({
      title: `Deleted ${basename(id)}`,
      description: importers.length ? `${plural(importers.length, 'file')} still ${importers.length === 1 ? 'imports' : 'import'} it.` : undefined,
      tone: 'neutral', action: undoAction,
    });
    announceRemovedFolders(files, next.project.files);
    pendingFocus.current = focusNext;
  }, [announce, announceRemovedFolders, deleteBlocked, dispatch, files, nodes, state, toast, undoAction]);

  const confirmFolderDelete = useCallback(() => {
    if (!confirmFolder) return;
    const id = folderId(confirmFolder);
    const focusNext = deleteFocusTarget(nodes, id);
    dispatch({ type: 'deleteFolder', path: confirmFolder });
    toast.show({ title: `Deleted folder ${basename(confirmFolder)}`, tone: 'neutral', action: undoAction });
    setConfirmFolder(null);
    pendingFocus.current = focusNext;
  }, [confirmFolder, dispatch, nodes, toast, undoAction]);

  // ------------------------------------------------------------ context menu

  const menuItems = useMemo((): MenuEntry[] => {
    if (!menu) return [];
    if (menu.id === null) {
      return [
        { id: 'new-file', label: 'New file…', icon: <FilePlus />, shortcut: 'Alt+N' },
        { id: 'new-folder', label: 'New folder…', icon: <FolderPlus />, shortcut: 'Alt+Shift+N' },
        { id: 'import', label: 'Import ZIP…', icon: <FolderInput />, disabled: true, description: 'Arrives with project import' },
      ];
    }
    const blocked = deleteBlocked(menu.id);
    const del: MenuEntry = { id: 'delete', label: 'Delete', icon: <Trash2 />, shortcut: 'Del', destructive: true, disabled: !!blocked, description: blocked ?? undefined };
    if (isFolderId(menu.id)) {
      return [
        { id: 'new-file', label: 'New file…', icon: <FilePlus /> },
        { id: 'new-folder', label: 'New folder…', icon: <FolderPlus /> },
        { id: 'rename', label: 'Rename', icon: <Pencil />, shortcut: 'F2' },
        { id: 'move', label: 'Move to…', icon: <FileOutput /> },
        { id: 'copy-path', label: 'Copy path', icon: <ClipboardCopy /> },
        { type: 'separator' },
        del,
      ];
    }
    const isTsx = extname(menu.id) === '.tsx';
    return [
      { id: 'open', label: 'Open', icon: <FileCode /> },
      { id: 'rename', label: 'Rename', icon: <Pencil />, shortcut: 'F2' },
      { id: 'move', label: 'Move to…', icon: <FileOutput /> },
      { id: 'duplicate', label: 'Duplicate', icon: <Copy /> },
      { id: 'copy-path', label: 'Copy path', icon: <ClipboardCopy /> },
      ...(isTsx ? [{ id: 'entry', label: 'Set as entry', icon: <Star />, disabled: menu.id === entry }] : []),
      { type: 'separator' },
      del,
    ];
  }, [deleteBlocked, entry, menu]);

  const closeMenu = useCallback((refocus = true) => {
    const id = menu?.id ?? null;
    setMenu(null);
    if (refocus) pendingFocus.current = id ?? bodyRef.current?.querySelector<HTMLElement>('[role="treeitem"][tabindex="0"]')?.dataset.treeId ?? null;
  }, [menu]);

  const onMenuAction = useCallback((action: string) => {
    const id = menu?.id ?? null;
    setMenu(null);
    switch (action) {
      case 'open': if (id) onOpen(id); (pendingFocus.current = id); break;
      case 'rename': if (id) startRename(id); break;
      case 'move': if (id) setMoveId(id); break;
      case 'duplicate': if (id) {
        const to = copyName(id, files);
        try { dispatch({ type: 'createFile', path: to, text: files[id] }); announce(`Duplicated as ${basename(to)}.`); pendingFocus.current = to; } catch (e) { toast.show({ title: String((e as Error).message), tone: 'error' }); }
      } break;
      case 'copy-path': if (id) { void navigator.clipboard?.writeText(pathOf(id)).catch(() => {}); announce(`Copied ${pathOf(id)}`); (pendingFocus.current = id); } break;
      case 'entry': if (id) { dispatch({ type: 'setEntry', path: id }); announce(`${basename(id)} is now the entry file.`); (pendingFocus.current = id); } break;
      case 'delete': if (id) requestDelete(id); break;
      case 'new-file': startCreate('file', id); break;
      case 'new-folder': startCreate('folder', id); break;
    }
  }, [announce, dispatch, files, menu, onOpen, requestDelete, startCreate, startRename, toast]);

  // ------------------------------------------------------------ events on the tree container

  const treeItemOf = (target: EventTarget | null) => (target as HTMLElement | null)?.closest?.<HTMLElement>('[role="treeitem"]') ?? null;

  const onKeyDownCapture = (event: ReactKeyboardEvent) => {
    keyActivation.current = event.key === 'Enter' || event.key === ' ';
    if (edit && (event.target as HTMLElement).tagName === 'INPUT') return;
    const item = treeItemOf(event.target);
    if (!item || item !== event.target) return;
    const id = item.dataset.treeId!;
    const isN = event.code === 'KeyN' || event.key.toLowerCase() === 'n';
    if (event.altKey && isN) { event.preventDefault(); event.stopPropagation(); startCreate(event.shiftKey ? 'folder' : 'file', id); return; }
    if (event.key === 'F2') { event.preventDefault(); event.stopPropagation(); startRename(id); return; }
    if (event.key === 'Delete') { event.preventDefault(); event.stopPropagation(); requestDelete(id); return; }
    if ((event.shiftKey && event.key === 'F10') || event.key === 'ContextMenu') {
      event.preventDefault(); event.stopPropagation();
      const rect = item.firstElementChild!.getBoundingClientRect();
      setMenu({ id, x: rect.left + 16, y: rect.bottom });
    }
  };

  const onContextMenu = (event: ReactMouseEvent) => {
    event.preventDefault();
    const item = treeItemOf(event.target);
    const id = item?.dataset.treeId ?? null;
    if (id === NEW_ID) return;
    if (item) item.focus();
    setMenu({ id, x: event.clientX, y: event.clientY });
  };

  const onFocusCapture = (event: React.FocusEvent) => {
    const item = treeItemOf(event.target);
    if (item && item === event.target) focusedId.current = item.dataset.treeId ?? null;
  };

  const onSelect = (id: string | null) => {
    if (!id || id === NEW_ID) return;
    const fromKey = keyActivation.current;
    keyActivation.current = false;
    if (isFolderId(id)) {
      // Clicks toggle in the Tree itself; Enter and Space only select, so toggle here (§4.2).
      if (fromKey) setExpanded((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));
      return;
    }
    onOpen(id);
  };

  const onDoubleClick = (event: ReactMouseEvent) => {
    const label = (event.target as HTMLElement).closest('[role="treeitem"] > div');
    const item = treeItemOf(event.target);
    if (label && item && item.dataset.treeId !== NEW_ID) startRename(item.dataset.treeId!);
  };

  // ------------------------------------------------------------ drag and drop (§4.6)

  const drag = useRef<{ id: string; over: HTMLElement | null; timer?: ReturnType<typeof setTimeout>; announced?: string } | null>(null);

  const dropTarget = (id: string, targetFolderPath: FilePath): { ok: boolean; reason?: string; to?: FilePath } => {
    const from = pathOf(id);
    const name = basename(from);
    if (isFolderId(id) && (targetFolderPath === from || targetFolderPath.startsWith(`${from}/`))) return { ok: false, reason: "A folder can't move into itself." };
    if (dirname(from) === targetFolderPath) return { ok: false, reason: `${name} is already in ${targetFolderPath || 'the project root'}.` };
    const result = validateEntry(name, { files, folder: targetFolderPath, kind: isFolderId(id) ? 'folder' : 'file', mode: 'move', self: from });
    if (result.error) return { ok: false, reason: result.error };
    return { ok: true, to: result.path! };
  };

  const clearOver = () => {
    const d = drag.current;
    if (d?.over) { delete d.over.dataset.drop; d.over.removeAttribute('title'); }
    if (d) { clearTimeout(d.timer); d.over = null; }
    if (bodyRef.current) delete bodyRef.current.dataset.drop;
  };

  const folderOfRow = (item: HTMLElement | null): FilePath | null => {
    const id = item?.dataset.treeId;
    if (!id || id === NEW_ID) return null;
    return isFolderId(id) ? pathOf(id) : null;
  };

  const onDragStart = (event: ReactDragEvent) => {
    const item = treeItemOf(event.target);
    const id = item?.dataset.treeId;
    if (!id || id === NEW_ID || edit) return;
    drag.current = { id, over: null };
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData(DRAG_TYPE, id);
    event.dataTransfer.setData('text/plain', pathOf(id));
  };

  const onDragOver = (event: ReactDragEvent) => {
    const types = Array.from(event.dataTransfer.types ?? []);
    if (!drag.current) {
      if (types.includes('Files')) { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; }
      return;
    }
    const item = treeItemOf(event.target);
    const row = (item?.firstElementChild as HTMLElement | null) ?? null;
    const folder = item ? folderOfRow(item) : 'src';
    if (drag.current.over !== row || !row) clearOver();
    if (folder === null) { event.dataTransfer.dropEffect = 'none'; return; }
    const target = dropTarget(drag.current.id, folder);
    if (row) {
      drag.current.over = row;
      row.dataset.drop = target.ok ? 'valid' : 'invalid';
      if (!target.ok && target.reason) {
        row.title = target.reason;
        if (drag.current.announced !== target.reason) { drag.current.announced = target.reason; announce(target.reason); }
      }
      const fid = item!.dataset.treeId!;
      if (target.ok && !expanded.includes(fid) && !drag.current.timer) {
        drag.current.timer = setTimeout(() => setExpanded((prev) => (prev.includes(fid) ? prev : [...prev, fid])), HOVER_EXPAND_MS);
      }
    } else if (target.ok && bodyRef.current) bodyRef.current.dataset.drop = 'valid';
    if (target.ok) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; } else event.dataTransfer.dropEffect = 'none';
  };

  const onDrop = (event: ReactDragEvent) => {
    event.preventDefault();
    const d = drag.current;
    clearOver();
    drag.current = null;
    if (!d) {
      if (Array.from(event.dataTransfer.types ?? []).includes('Files')) toast.show({ title: 'Drop a .zip to import a project.', tone: 'information' });
      return;
    }
    const item = treeItemOf(event.target);
    const folder = item ? folderOfRow(item) : 'src';
    if (folder === null) return;
    const target = dropTarget(d.id, folder);
    if (target.ok && target.to) move(d.id, target.to, 'Moved');
  };

  const onDragEnd = () => { clearOver(); drag.current = null; };

  // ------------------------------------------------------------ render

  const collapseAll = () => setExpanded([]);
  const editCtx = edit ? ctxFor(edit) : null;
  const shownError = edit && error && editCtx ? error : null;
  const errorId = 'files-edit-error';
  const helperId = 'files-edit-helper';

  return (
    <div className={styles.pane}>
      <div className={styles.titleRow}>
        {collapseToggle}
        <h2 id={titleId} className={titleClassName}>
          Files <span className={styles.count}>· {fileCount}</span>
        </h2>
        <span className={styles.actions}>
          <Tooltip content={fileCount >= 200 ? MESSAGES.files : 'New file (Alt+N)'}>
            <IconButton size="sm" variant="tertiary" icon={<FilePlus />} label="New file" hideTitle aria-disabled={fileCount >= 200 || undefined} onClick={() => startCreate('file')} />
          </Tooltip>
          <Tooltip content="New folder (Alt+Shift+N)">
            <IconButton size="sm" variant="tertiary" icon={<FolderPlus />} label="New folder" hideTitle onClick={() => startCreate('folder')} />
          </Tooltip>
          <Tooltip content="Collapse all">
            <IconButton size="sm" variant="tertiary" icon={<ChevronsDownUp />} label="Collapse all" hideTitle onClick={collapseAll} />
          </Tooltip>
          <OverflowMenu
            label="More file actions"
            items={[
              { id: 'export', label: 'Export ZIP…', disabled: true },
              { id: 'import', label: 'Import ZIP…', disabled: true },
              { id: 'settings', label: 'Project settings', disabled: true },
            ]}
          />
        </span>
      </div>
      <div
        ref={bodyRef}
        id={bodyId}
        className={styles.body}
        hidden={collapsed}
        onKeyDownCapture={onKeyDownCapture}
        onFocusCapture={onFocusCapture}
        onContextMenu={onContextMenu}
        onDoubleClick={onDoubleClick}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragLeave={(e) => { if (!bodyRef.current?.contains(e.relatedTarget as Node)) clearOver(); }}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
        onClick={() => { keyActivation.current = false; }}
      >
        {loading ? (
          <div className={styles.skeleton} aria-busy="true" aria-label="Loading files">
            {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} width={`${80 - i * 8}%`} />)}
          </div>
        ) : (
          <Tree
            aria-label="Project files"
            nodes={nodes}
            expandedIds={expanded}
            onExpandedChange={setExpanded}
            selectedId={activePath}
            onSelect={onSelect}
          />
        )}
        {edit && (
          <div className={styles.editor} style={{ insetBlockStart: editTop }}>
            <Input
              size="sm"
              aria-label={edit.label}
              value={edit.value}
              autoFocus
              aria-invalid={shownError ? true : undefined}
              aria-describedby={shownError ? errorId : helperId}
              status={shownError ? 'error' : undefined}
              onFocus={(e) => e.currentTarget.setSelectionRange(edit.select[0], edit.select[1])}
              onChange={(e) => onEditChange(e.currentTarget.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') { e.preventDefault(); clearTimeout(debounce.current); commitEdit(); }
                else if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
              }}
              onBlur={() => { if (edit) commitEdit(true); }}
            />
            {shownError
              ? (
                <span id={errorId} className={styles.error}>
                  {shownError}
                  {shownError === MESSAGES.root && (
                    <> <Link href="#" onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.preventDefault(); retryInSrc(); }}>Create in src/</Link></>
                  )}
                </span>
              )
              : <span id={helperId} className={styles.helper}>{edit.helper}</span>}
          </div>
        )}
      </div>
      {menu && (
        <ContextMenu x={menu.x} y={menu.y} items={menuItems} onAction={onMenuAction} onClose={closeMenu} label={menu.id ? `Actions for ${basename(pathOf(menu.id))}` : 'File actions'} />
      )}
      {moveId && (
        <MoveDialog
          id={moveId}
          files={files}
          announce={announce}
          onClose={() => { const id = moveId; setMoveId(null); (pendingFocus.current = id); }}
          onMove={(to) => { const id = moveId; setMoveId(null); move(id, to, 'Moved'); }}
        />
      )}
      <AlertDialog
        open={!!confirmFolder}
        tone="error"
        title={`Delete folder ${confirmFolder ? basename(confirmFolder) : ''}?`}
        confirmLabel="Delete"
        onCancel={() => { const id = confirmFolder; setConfirmFolder(null); if (id) (pendingFocus.current = folderId(id)); }}
        onConfirm={confirmFolderDelete}
      >
        {confirmFolder ? `This deletes ${plural(Object.keys(files).filter((p) => p.startsWith(`${confirmFolder}/`)).length, 'file')}. You can undo with Undo.` : ''}
      </AlertDialog>
      {nodeById.size === 0 && !loading && <VisuallyHidden>No files</VisuallyHidden>}
    </div>
  );
}

// ---------------------------------------------------------------- helpers

/** Applies an action to the current state to read its result before dispatching (the reducer is pure). */
const reduceOnce = (state: StoreState, action: StoreAction) => storeReducer(state, action);

function allFolders(files: Record<FilePath, string>): string[] {
  const set = new Set<string>();
  for (const f of Object.keys(files)) for (let d = dirname(f); d; d = dirname(d)) set.add(folderId(d));
  return [...set];
}

function ancestors(path: FilePath, prev: string[]): string[] {
  const set = new Set(prev);
  for (let d = dirname(path); d; d = dirname(d)) set.add(folderId(d));
  return set.size === prev.length ? prev : [...set];
}

function insertPlaceholder(nodes: FileNode[], folder: FilePath): FileNode[] {
  const placeholder: FileNode = { id: NEW_ID, label: '', path: '', folder: false };
  if (!folder) return [...nodes, placeholder];
  const visit = (list: FileNode[]): FileNode[] => list.map((n) => {
    if (!n.folder) return n;
    if (n.path === folder) return { ...n, children: [...(n.children ?? []), placeholder] };
    if (folder.startsWith(`${n.path}/`)) return { ...n, children: visit(n.children ?? []) };
    return n;
  });
  const found = { v: false };
  walk(nodes, (n) => { if (n.folder && n.path === folder) found.v = true; });
  // A target folder that doesn't exist yet (e.g. "src" in a root-only project) gets the row at the root.
  return found.v ? visit(nodes) : [...nodes, placeholder];
}


interface ContextMenuProps { x: number; y: number; items: MenuEntry[]; label: string; onAction: (id: string) => void; onClose: (refocus?: boolean) => void }

/** A `Menu` positioned at the pointer or the row. Escape and Tab close it and return focus. */
function ContextMenu({ x, y, items, label, onAction, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ x: Math.max(0, Math.min(x, window.innerWidth - r.width - 4)), y: Math.max(0, Math.min(y, window.innerHeight - r.height - 4)) });
  }, [x, y]);
  useEffect(() => {
    const down = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) onClose(false); };
    document.addEventListener('mousedown', down);
    return () => document.removeEventListener('mousedown', down);
  }, [onClose]);
  return (
    <div ref={ref} className={styles.contextMenu} style={{ insetInlineStart: pos.x, insetBlockStart: pos.y, left: pos.x, top: pos.y }}>
      <Menu items={items} aria-label={label} autoFocus="first" onAction={onAction} onClose={(reason) => { if (reason !== 'select') onClose(true); }} />
    </div>
  );
}

interface MoveDialogProps { id: string; files: Record<FilePath, string>; onClose: () => void; onMove: (to: FilePath) => void; announce: (message: string) => void }

/** Keyboard / single-pointer alternative to drag (WCAG 2.5.7, §4.6). */
function MoveDialog({ id, files, onClose, onMove, announce }: MoveDialogProps) {
  const from = pathOf(id);
  const name = basename(from);
  const folderNodes = useMemo(() => {
    const strip = (list: FileNode[]): FileNode[] => list.filter((n) => n.folder).map((n) => ({ ...n, icon: <Folder />, children: strip(n.children ?? []) }));
    return strip(buildTreeNodes(files, ''));
  }, [files]);
  const [target, setTarget] = useState<FilePath>(dirname(from) || 'src');
  const [sub, setSub] = useState('');
  const folder = sub.trim() ? `${target}/${sub.trim()}` : target;
  const validation = useMemo(() => {
    if (sub.trim() && validateEntry(sub, { files: {}, folder: target, kind: 'folder', mode: 'move' }).error) return validateEntry(sub, { files: {}, folder: target, kind: 'folder', mode: 'move' });
    if (isFolderId(id) && (folder === from || folder.startsWith(`${from}/`))) return { path: null, error: "A folder can't move into itself." };
    if (folder === dirname(from)) return { path: null, error: null, same: true };
    return validateEntry(name, { files, folder, kind: isFolderId(id) ? 'folder' : 'file', mode: 'move', self: from });
  }, [files, folder, from, id, name, sub, target]);
  const canMove = !validation.error && !!validation.path;
  useEffect(() => { if (validation.error) announce(validation.error); }, [announce, validation.error]);
  return (
    <Dialog
      open
      size="sm"
      title={`Move ${name}`}
      onClose={onClose}
      footer={(
        <>
          <Button variant="primary" disabled={!canMove} onClick={() => validation.path && onMove(validation.path)}>Move</Button>
          <Button variant="tertiary" onClick={onClose}>Cancel</Button>
        </>
      )}
    >
      <div className={styles.moveBody}>
        <Tree aria-label="Folders" nodes={folderNodes} defaultExpandedIds={[folderId('src')]} selectedId={folderId(target)} onSelect={(sel) => sel && setTarget(pathOf(sel))} />
        <Input label="New folder name" description="Optional. Creates a subfolder in the chosen folder." value={sub} onChange={(e) => setSub(e.currentTarget.value)} />
        {validation.error && <span className={styles.error} role="alert">{validation.error}</span>}
      </div>
    </Dialog>
  );
}
