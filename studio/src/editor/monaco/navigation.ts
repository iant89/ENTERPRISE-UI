/**
 * Code Studio C3: cross-file navigation on top of Monaco's TypeScript worker. Loaded with Monaco.
 * - F12 / Alt+F12 / Shift+F12 use Monaco's own commands; when they target another file, the editor
 *   opener below hands the location to Studio, which opens it in the current group.
 * - References for the bottom panel and rename edits are computed here from the worker.
 */
import { getTypeScriptWorker } from 'monaco-editor/languages/features/typescript/register.js';
import { monaco } from '../monaco';
import { groupReferences, isIdentifier, offsetAt, planRename, type RenamePlan, type Span } from '../navigationModel';
import type { ReferenceSet } from '../../panels/bottom/ReferencesPanel';
import { pathOfUri, uriFor } from './models';

type OpenHandler = (path: string, line: number, column: number, source: unknown) => void;
let openHandler: OpenHandler | null = null;
let registered = false;

/** Studio's handler for "open this location" requests coming from Monaco (F12 to another file). */
export function setOpenHandler(handler: OpenHandler | null) {
  openHandler = handler;
  if (registered) return;
  registered = true;
  monaco.editor.registerEditorOpener({
    openCodeEditor(source, resource, selectionOrPosition) {
      if (!openHandler || resource.scheme !== 'file') return false;
      const sel = selectionOrPosition as { startLineNumber?: number; startColumn?: number; lineNumber?: number; column?: number } | undefined;
      openHandler(pathOfUri(resource.toString()), sel?.startLineNumber ?? sel?.lineNumber ?? 1, sel?.startColumn ?? sel?.column ?? 1, source);
      return true;
    },
  });
}

async function workerFor(path: string) {
  const uri = monaco.Uri.parse(uriFor(path));
  const get = await getTypeScriptWorker();
  return { worker: await get(uri), fileName: uri.toString() };
}

const toSpan = (e: { fileName: string; textSpan: { start: number; length: number }; prefixText?: string; suffixText?: string }): Span => ({
  path: pathOfUri(e.fileName), start: e.textSpan.start, length: e.textSpan.length, prefixText: e.prefixText, suffixText: e.suffixText,
});

const wordAt = (text: string, offset: number) => {
  let a = offset;
  let b = offset;
  while (a > 0 && /[\w$]/.test(text[a - 1])) a--;
  while (b < text.length && /[\w$]/.test(text[b])) b++;
  return text.slice(a, b);
};

/** References to the symbol at a position, grouped by file (VFS files only). */
export async function findReferences(files: Readonly<Record<string, string>>, path: string, line: number, column: number): Promise<ReferenceSet | null> {
  const text = files[path];
  if (text === undefined) return null;
  const offset = offsetAt(text, line, column);
  const { worker, fileName } = await workerFor(path);
  const entries = (await worker.getReferencesAtPosition(fileName, offset)) ?? [];
  if (!entries.length) return null;
  return groupReferences(files, wordAt(text, offset), entries.map(toSpan));
}

export type RenameResult = { ok: true; oldName: string; plan: RenamePlan } | { ok: false; message: string };

/** The symbol at a position, if TypeScript can rename it. */
export async function renameTarget(files: Readonly<Record<string, string>>, path: string, line: number, column: number): Promise<{ ok: true; name: string } | { ok: false; message: string }> {
  const text = files[path];
  if (text === undefined) return { ok: false, message: 'This file is not in the project.' };
  const { worker, fileName } = await workerFor(path);
  const info = await worker.getRenameInfo(fileName, offsetAt(text, line, column), { allowRenameOfImportPath: false });
  if (!info?.canRename) return { ok: false, message: info?.localizedErrorMessage ?? 'You cannot rename this element.' };
  return { ok: true, name: info.displayName ?? wordAt(text, offsetAt(text, line, column)) };
}

/** Every edit for renaming the symbol at a position to `newName`, across the project's files. */
export async function computeRename(files: Readonly<Record<string, string>>, path: string, line: number, column: number, newName: string): Promise<RenameResult> {
  if (!isIdentifier(newName)) return { ok: false, message: `"${newName}" is not a valid name.` };
  const target = await renameTarget(files, path, line, column);
  if (!target.ok) return target;
  const text = files[path];
  const { worker, fileName } = await workerFor(path);
  const locations = (await worker.findRenameLocations(fileName, offsetAt(text, line, column), false, false, false)) ?? [];
  const spans = locations.map(toSpan).filter((s) => files[s.path] !== undefined);
  if (!spans.length) return { ok: false, message: 'Nothing to rename here.' };
  return { ok: true, oldName: target.name, plan: planRename(files, spans, newName) };
}
