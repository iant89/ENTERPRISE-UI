import { useMemo, useState, type FormEvent } from 'react';
import { Button, Checkbox, Dialog, Input, Select, SlimArrowDownIcon, SlimArrowRightIcon } from '@enterprise-ui/react';
import { DEFAULT_OPTIONS, fileNames, type ComponentOptions, type ExportStyle, type Language, type Styling } from './templates';
import { DEFAULT_DESTINATION, planComponent, type Plan } from './generate';
import styles from './CreateComponentDialog.module.css';

/** Decision 1a: Advanced starts expanded, then its state is a Studio-level preference (not per project). */
export const ADVANCED_KEY = 'eui-studio:create-component-advanced';
const loadAdvanced = () => { try { return localStorage.getItem(ADVANCED_KEY) !== 'closed'; } catch { return true; } };
const saveAdvanced = (open: boolean) => { try { localStorage.setItem(ADVANCED_KEY, open ? 'open' : 'closed'); } catch { /* private mode */ } };

/** Every folder in the project (from file paths), with `/` suffix, sorted; the default and `initial` always included. */
export function folderOptions(files: Record<string, string>, initial: string): string[] {
  const set = new Set<string>([DEFAULT_DESTINATION, initial]);
  for (const p of Object.keys(files)) {
    const segs = p.split('/').slice(0, -1);
    for (let i = 1; i <= segs.length; i++) set.add(`${segs.slice(0, i).join('/')}/`);
  }
  return [...set].sort();
}

export interface CreateComponentDialogProps {
  files: Record<string, string>;
  /** Prefilled destination from the entry point. */
  destination?: string;
  onClose: () => void;
  /** Called with a valid plan; returns an error message if applying failed (nothing is written then). */
  onCreate: (name: string, plan: Extract<Plan, { ok: true }>) => string | undefined;
}

/** C5 Create component dialog (mockup 01, §6.1). Focus trap, Esc and focus return come from the library Dialog. */
export function CreateComponentDialog({ files, destination = DEFAULT_DESTINATION, onClose, onCreate }: CreateComponentDialogProps) {
  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);
  const [dest, setDest] = useState(destination);
  const [opts, setOpts] = useState<ComponentOptions>(DEFAULT_OPTIONS);
  const [advanced, setAdvanced] = useState(loadAdvanced);
  const [applyError, setApplyError] = useState<string>();
  const folders = useMemo(() => folderOptions(files, destination), [files, destination]);
  const plan = useMemo(() => planComponent({ files }, { name, destination: dest, options: opts }), [files, name, dest, opts]);
  const shownName = name.trim() || 'ExampleCard';
  const names = fileNames(shownName, opts);
  const nameError = !plan.ok && (touched || name) ? plan.errors.name : undefined;
  const destError = !plan.ok ? plan.errors.destination : undefined;
  const set = <K extends keyof ComponentOptions>(k: K, v: ComponentOptions[K]) => setOpts((o) => ({ ...o, [k]: v }));
  const toggleAdvanced = () => { saveAdvanced(!advanced); setAdvanced(!advanced); };
  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    setTouched(true);
    if (!plan.ok) return;
    const err = onCreate(name.trim(), plan);
    if (err) setApplyError(err);
  };
  const x = opts.language === 'ts' ? '.tsx' : '.jsx';
  const folderShown = `${dest.replace(/\/+$/, '')}/${shownName}/`;
  return (
    <Dialog
      open
      size="md"
      title="Create component"
      onClose={onClose}
      footer={(
        <>
          <Button variant="tertiary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" form="create-component-form" disabled={!plan.ok}>{`Create ${names.length} files`}</Button>
        </>
      )}
    >
      <form id="create-component-form" className={styles.form} onSubmit={submit} noValidate>
        <Input label="Component name" required autoFocus value={name} placeholder="ExampleCard" description="PascalCase. Used for the folder, file and export."
          error={nameError} onChange={(e) => { setName(e.currentTarget.value); setApplyError(undefined); }} />
        <Select label="Destination folder" value={dest} onChange={(v) => v && setDest(v)} error={destError}
          options={folders.map((f) => ({ value: f, label: f }))} />
        <fieldset className={styles.group}>
          <legend className={styles.legend}>Generate</legend>
          <Checkbox label={`Test file (${shownName}.test${x})`} checked={opts.tests} onChange={(c) => set('tests', c)} />
          <Checkbox label={`Documentation (${shownName}.docs.md)`} checked={opts.docs} onChange={(c) => set('docs', c)} />
          <Checkbox label={`Index file (index.${opts.language === 'ts' ? 'ts' : 'js'})`} checked={opts.index} onChange={(c) => set('index', c)} />
          <Checkbox label={`Example (${shownName}.example${x})`} checked={opts.example} onChange={(c) => set('example', c)} />
        </fieldset>
        <button type="button" className={styles.disclosure} aria-expanded={advanced} aria-controls="create-component-advanced" onClick={toggleAdvanced}>
          {advanced ? <SlimArrowDownIcon aria-hidden="true" /> : <SlimArrowRightIcon aria-hidden="true" />}Advanced options
        </button>
        <div id="create-component-advanced" className={styles.advanced} hidden={!advanced}>
          <Select<Language> label="Language" value={opts.language} onChange={(v) => v && set('language', v)}
            options={[{ value: 'ts', label: 'TypeScript' }, { value: 'js', label: 'JavaScript' }]} />
          <Select<ExportStyle> label="Export style" value={opts.exportStyle} onChange={(v) => v && set('exportStyle', v)}
            options={[{ value: 'named', label: 'Named export' }, { value: 'default', label: 'Default export' }]} />
          <Select<Styling> label="Styling" value={opts.styling} onChange={(v) => v && set('styling', v)}
            options={[{ value: 'css', label: 'CSS file' }, { value: 'none', label: 'None' }]} />
        </div>
        <div className={styles.preview} aria-live="polite" data-testid="create-component-preview">
          <span className={styles.previewLabel}>Will create (one undo step):</span>
          <code>{folderShown} {names.join(' · ')}</code>
        </div>
        {applyError && <p className={styles.error} role="alert">{applyError}</p>}
      </form>
    </Dialog>
  );
}
