/**
 * Code Studio C3: one Monaco model per VFS file, keyed by a `file:///<path>` URI, so the TypeScript
 * worker sees every file (cross-file go to definition, references and rename).
 *
 * - Store → model: changed files are applied as a minimal edit (common prefix/suffix kept), so the
 *   cursor and Monaco's own undo survive; such edits are flagged so editors do not echo them back.
 * - Model → store: editors forward user edits with `editFile` (see CodeEditor).
 * - Renames and moves (C2 ops) re-key view state to the new path; deleted files' models are disposed.
 * - View state (cursor, scroll, folding) is kept per group and path across tab switches; closing a
 *   tab forgets it. Models stay alive while their file exists, because the TS worker needs them.
 *
 * Written against a tiny slice of the Monaco API so it can be unit-tested without a browser.
 */

export interface TextModelLike {
  getValue(): string;
  setValue(text: string): void;
  isDisposed(): boolean;
  dispose(): void;
  getPositionAt(offset: number): { lineNumber: number; column: number };
  pushEditOperations(before: null | unknown[], edits: { range: RangeLike; text: string }[], cursor: () => null): unknown;
  pushStackElement(): void;
  uri: { toString(): string };
}
export interface RangeLike { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number }
export interface MonacoLike {
  Uri: { parse(value: string): unknown };
  editor: {
    getModel(uri: unknown): TextModelLike | null;
    createModel(text: string, language: string, uri: unknown): TextModelLike;
  };
}

export const uriFor = (path: string) => `file:///${path}`;
export const pathOfUri = (uri: string) => decodeURIComponent(uri.replace(/^file:\/\/\//, ''));

export function languageFor(path: string): string {
  const ext = path.slice(path.lastIndexOf('.') + 1).toLowerCase();
  if (ext === 'ts' || ext === 'tsx') return 'typescript';
  if (ext === 'js' || ext === 'jsx') return 'javascript';
  if (ext === 'css') return 'css';
  if (ext === 'json') return 'json';
  if (ext === 'md') return 'markdown';
  return 'plaintext';
}

/** The smallest single edit that turns `from` into `to`, as offsets into `from`. */
export function minimalEdit(from: string, to: string): { start: number; end: number; text: string } | null {
  if (from === to) return null;
  let start = 0;
  const max = Math.min(from.length, to.length);
  while (start < max && from.charCodeAt(start) === to.charCodeAt(start)) start++;
  let end = 0;
  while (end < max - start && from.charCodeAt(from.length - 1 - end) === to.charCodeAt(to.length - 1 - end)) end++;
  return { start, end: from.length - end, text: to.slice(start, to.length - end) };
}

export class ModelRegistry {
  private readonly models = new Map<string, TextModelLike>();
  private readonly views = new Map<string, unknown>();
  private applying = 0;
  private lastMoves = -1;

  constructor(private readonly monaco: MonacoLike) {}

  /** True while the registry itself is writing to a model (editors must not echo these as user edits). */
  isApplying() { return this.applying > 0; }

  /** The model for `path`, created from `text` when it does not exist yet. */
  ensure(path: string, text: string): TextModelLike {
    const known = this.models.get(path);
    if (known && !known.isDisposed()) return known;
    const uri = this.monaco.Uri.parse(uriFor(path));
    const existing = this.monaco.editor.getModel(uri);
    const model = existing && !existing.isDisposed() ? existing : this.monaco.editor.createModel(text, languageFor(path), uri);
    if (model.getValue() !== text) this.write(model, text);
    this.models.set(path, model);
    return model;
  }

  get(path: string): TextModelLike | undefined {
    const m = this.models.get(path);
    return m && !m.isDisposed() ? m : undefined;
  }

  paths() { return [...this.models.keys()]; }

  /**
   * Brings the models in line with the VFS. `moves` (from the store's last rename/move report, with
   * its id so it is applied once) re-key view state before the old models are disposed.
   */
  sync(files: Readonly<Record<string, string>>, moves?: { id: number; moves: readonly (readonly [string, string])[] }) {
    if (moves && moves.id !== this.lastMoves) {
      this.lastMoves = moves.id;
      for (const [from, to] of moves.moves) this.rename(from, to);
    }
    for (const [path, model] of this.models) {
      if (!Object.hasOwn(files, path)) { this.models.delete(path); this.dropViews(path); if (!model.isDisposed()) model.dispose(); }
    }
    for (const [path, text] of Object.entries(files)) {
      const model = this.get(path);
      if (!model) this.ensure(path, text);
      else if (model.getValue() !== text) this.write(model, text);
    }
  }

  /** Moves view state from `from` to `to` in every group (the model itself is re-created by `sync`). */
  rename(from: string, to: string) {
    for (const key of [...this.views.keys()]) {
      const [group, path] = splitKey(key);
      if (path === from) { this.views.set(viewKey(group, to), this.views.get(key)); this.views.delete(key); }
    }
  }

  saveViewState(group: number, path: string, state: unknown) { if (state) this.views.set(viewKey(group, path), state); }
  viewState(group: number, path: string) { return this.views.get(viewKey(group, path)); }
  /** A tab was closed: forget its view state in that group. */
  forget(group: number, path: string) { this.views.delete(viewKey(group, path)); }

  dispose() {
    for (const m of this.models.values()) if (!m.isDisposed()) m.dispose();
    this.models.clear();
    this.views.clear();
  }

  private dropViews(path: string) {
    for (const key of [...this.views.keys()]) if (splitKey(key)[1] === path) this.views.delete(key);
  }

  private write(model: TextModelLike, text: string) {
    const edit = minimalEdit(model.getValue(), text);
    if (!edit) return;
    const a = model.getPositionAt(edit.start);
    const b = model.getPositionAt(edit.end);
    this.applying++;
    try {
      model.pushStackElement();
      model.pushEditOperations([], [{ range: { startLineNumber: a.lineNumber, startColumn: a.column, endLineNumber: b.lineNumber, endColumn: b.column }, text: edit.text }], () => null);
      model.pushStackElement();
    } finally {
      this.applying--;
    }
  }
}

const viewKey = (group: number, path: string) => `${group}\n${path}`;
const splitKey = (key: string): [number, string] => { const i = key.indexOf('\n'); return [Number(key.slice(0, i)), key.slice(i + 1)]; };

let shared: ModelRegistry | null = null;
/** The page-wide registry (Monaco models are global, so both editor groups share it). */
export function sharedRegistry(monaco: MonacoLike): ModelRegistry {
  shared ??= new ModelRegistry(monaco);
  return shared;
}
