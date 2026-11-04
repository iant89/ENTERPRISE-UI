/**
 * Code Studio C3: what the rest of Studio may ask of a code editor. CodeEditor implements it with
 * Monaco; nothing outside studio/src/editor talks to Monaco directly.
 */

/** A 1-based range, as editors and the Problems list count lines and columns. */
export interface EditorRange { startLine: number; startColumn: number; endLine: number; endColumn: number }

export type FormatResult = { ok: true; changed: boolean } | { ok: false; message: string };

export interface EditorAdapter {
  /** The group (0 = left, 1 = right) this editor belongs to. */
  readonly group: number;
  /** The file whose model is shown, or null before the editor is ready. */
  activePath(): string | null;
  /** Shows `path`'s model (created from the VFS on demand), restoring its cursor, scroll and folding. */
  open(path: string): void;
  getSelection(): EditorRange | null;
  setSelection(range: EditorRange): void;
  /** Scrolls a range (or a line) into the centre, selects its start and focuses the editor. */
  reveal(range: EditorRange | { line: number; column?: number }): void;
  /** Kept from C1: `reveal({ line })`. */
  revealLine(line: number): void;
  focus(): void;
  /** Formats the active model with Prettier (format.ts). A failure leaves the file untouched. */
  format(): Promise<FormatResult>;
  /** The editor's accessible name (follows the active file; see `editorLabel`). */
  setLabel(label: string): void;
  dispose(): void;
}

/** Events an adapter reports to Studio. */
export interface EditorEvents {
  /** The user edited `path` (store `editFile`). Never fired for changes that came from the store. */
  onChange?: (text: string, path: string) => void;
  onCursor?: (position: { line: number; column: number }) => void;
  onFocus?: () => void;
}

/** The accessible name for an editor showing `path` in `group` (0-based), e.g. "Code editor, src/App.tsx, group 1". */
export const editorLabel = (path: string, group = 0, groups = 1) => (groups > 1 ? `Code editor, ${path}, group ${group + 1}` : `Code editor, ${path}`);

export const pointRange = (line: number, column = 1): EditorRange => ({ startLine: line, startColumn: column, endLine: line, endColumn: column });
