/**
 * Code Studio C5: plan and apply a Create Component operation (§6.2). Everything is validated and
 * the full file map built before any write; the write is one `applyEdits` step, which either
 * applies every file or throws, so a failure leaves the project and history unchanged.
 */
import type { FilePath, Project } from '../../model/project';
import { storeReducer, type StoreAction, type StoreState } from '../../model/store';
import { caseCollision, checkFilePath, checkFolderPath } from '../../core/vfs/paths';
import api from '../../../../docs/generated/api.json';
import { componentFiles, type ComponentOptions } from './templates';

export const DEFAULT_DESTINATION = 'src/components/';
export const NAME_PATTERN = /^[A-Z][A-Za-z0-9]*$/;
const RESERVED = new Set(('break case catch class const continue debugger default delete do else enum export extends false finally for function if import in '
  + 'instanceof new null return super switch this throw true try typeof var void while with yield let static implements interface package private '
  + 'protected public await arguments eval undefined NaN Infinity Object Array String Number Boolean Symbol Function Promise Error Map Set Date '
  + 'Math JSON RegExp React Fragment App').split(' '));

/**
 * Every @enterprise-ui/react export (ThemeProvider, Button, …) is reserved so imports never shadow it. Read from
 * api.json (already in the bundle; non-component exports listed by hand) rather than the library namespace, which would pull the whole library into the
 * initial chunk; a unit test checks it covers every PascalCase runtime export.
 */
const LIBRARY_EXPORTS = new Set([...Object.keys(api.components), ...Object.keys(api.hooks ?? {}), 'ObjectSaveError']);
/** The library exports one `<Name>Icon` component per SAP icon (700+), so every `…Icon` name is reserved. */
const ICON_EXPORT = /^[A-Z][A-Za-z0-9]*Icon$/;

/** Rejects (never rewrites) destinations outside the project tree. */
export function destinationError(raw: string): string | undefined {
  const d = raw.trim();
  if (d.includes('\\')) return 'Use forward slashes (/) in the destination.';
  if (d.startsWith('/') || /^[A-Za-z]:/.test(d)) return 'Use a project-relative destination, for example src/components/.';
  if (d.split('/').includes('node_modules')) return 'Components cannot be created under node_modules.';
  return undefined;
}

export interface ComponentInput { name: string; destination: string; options: ComponentOptions }
export interface PlanErrors { name?: string; destination?: string }
export type Plan = { ok: true; folder: FilePath; main: FilePath; files: Record<FilePath, string> } | { ok: false; errors: PlanErrors };

export function validateName(name: string): string | undefined {
  const n = name.trim();
  if (!n) return 'Enter a component name.';
  if (!NAME_PATTERN.test(n)) return 'Use PascalCase: start with a capital letter, letters and digits only (for example ExampleCard).';
  if (RESERVED.has(n) || LIBRARY_EXPORTS.has(n) || ICON_EXPORT.test(n)) return `"${n}" is a reserved name. Choose another.`;
  return undefined;
}

/** Validates name, destination and conflicts, then builds the whole file map. Never writes. */
export function planComponent(project: Pick<Project, 'files'>, input: ComponentInput): Plan {
  const errors: PlanErrors = {};
  const name = input.name.trim();
  const nameError = validateName(name);
  if (nameError) errors.name = nameError;
  const rawError = destinationError(input.destination);
  if (rawError) errors.destination = rawError;
  const dest = checkFolderPath(input.destination.trim().replace(/\/+$/, '') || DEFAULT_DESTINATION.slice(0, -1));
  if (!dest.ok && !errors.destination) errors.destination = dest.error.message;
  if (errors.name || errors.destination || !dest.ok) return { ok: false, errors };
  const folder = `${dest.path}/${name}`;
  const paths = Object.keys(project.files);
  if (paths.includes(dest.path)) return { ok: false, errors: { destination: `"${dest.path}" is a file.` } };
  // Decision 3a: an existing folder or file is a conflict on Name (no auto-suffix).
  if (paths.some((p) => p === folder || p.startsWith(`${folder}/`))) return { ok: false, errors: { name: `${folder}/ already exists. Choose another name.` } };
  const clash = caseCollision(paths, `${folder}/x`);
  if (clash) return { ok: false, errors: { name: `"${folder}" differs from "${clash}" only in letter case.` } };
  const files: Record<FilePath, string> = {};
  for (const [rel, text] of Object.entries(componentFiles(name, input.options))) {
    const r = checkFilePath(`${folder}/${rel}`);
    if (!r.ok) return { ok: false, errors: { name: r.error.message } };
    files[r.path] = text;
  }
  const main = Object.keys(files)[0];
  return { ok: true, folder, main, files };
}

export const createAction = (name: string, plan: Extract<Plan, { ok: true }>): StoreAction =>
  ({ type: 'applyEdits', files: plan.files, label: `Create component ${name}`, touched: plan.main, create: true, open: true });

/**
 * Applies a plan through the store reducer. On any failure (e.g. the file limit) returns the
 * original state and the error: no files, no undo step.
 */
export function applyComponent(state: StoreState, name: string, plan: Extract<Plan, { ok: true }>, reduce = storeReducer): { state: StoreState; error?: string } {
  try { return { state: reduce(state, createAction(name, plan)) }; } catch (e) { return { state, error: (e as Error).message }; }
}

/** Destination for an entry point: a folder as is; a file's folder; else the default. */
export function destinationFor(path: string | null | undefined, files: Record<string, string>): string {
  if (!path) return DEFAULT_DESTINATION;
  const folder = Object.hasOwn(files, path) ? path.slice(0, path.lastIndexOf('/') + 1) : `${path.replace(/\/+$/, '')}/`;
  return folder === '/' || !folder ? DEFAULT_DESTINATION : folder;
}

/** Decision 5a: the tab-row button uses the active file's folder only when it is under src/components. */
export const destinationFromActive = (active: string | null | undefined, files: Record<string, string>) =>
  active && active.startsWith('src/components/') ? destinationFor(active, files) : DEFAULT_DESTINATION;
