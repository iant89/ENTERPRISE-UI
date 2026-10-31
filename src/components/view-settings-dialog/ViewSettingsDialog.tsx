import { useEffect, useState } from 'react';
import { Dialog } from '../dialog';
import { Button } from '../button';
import { RadioGroup } from '../radio-group';
import { Checkbox } from '../checkbox';
import { Tabs, TabList, Tab, TabPanel } from '../tabs';
import styles from './ViewSettingsDialog.module.css';

export interface ViewSettingsSortItem { id: string; label: string }
export interface ViewSettingsGroupItem { id: string; label: string }
export interface ViewSettingsFilterOption { id: string; label: string }
export interface ViewSettingsFilterItem { id: string; label: string; options: ViewSettingsFilterOption[] }

export interface ViewSettings {
  sortBy?: string;
  sortDescending: boolean;
  groupBy?: string;
  groupDescending: boolean;
  /** Selected option ids per filter id. */
  filters: Record<string, string[]>;
}

export interface ViewSettingsDialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the user closes the dialog. */
  onClose: () => void;
  /** Called with the confirmed settings. The application applies them to its data. */
  onConfirm: (settings: ViewSettings) => void;
  /** Current sort, group and filter settings. */
  settings: ViewSettings;
  /** Fields the user can sort by. */
  sortItems?: ViewSettingsSortItem[];
  /** Fields the user can group by. */
  groupItems?: ViewSettingsGroupItem[];
  /** Fields and values the user can filter by. */
  filterItems?: ViewSettingsFilterItem[];
  /** @default 'View settings' */
  /** Title of the dialog. */
  title?: string;
  /** Localized labels. */
  labels?: Partial<typeof defaultLabels>;
}

const defaultLabels = {
  sort: 'Sort', group: 'Group', filter: 'Filter', sortBy: 'Sort by', groupBy: 'Group by', order: 'Order',
  ascending: 'Ascending', descending: 'Descending', none: 'None', ok: 'OK', cancel: 'Cancel', reset: 'Reset',
};

/** Sort, group and filter settings for a table or list, confirmed or cancelled as a whole. */
export function ViewSettingsDialog({ open, onClose, onConfirm, settings, sortItems = [], groupItems = [], filterItems = [], title = 'View settings', labels }: ViewSettingsDialogProps) {
  const text = { ...defaultLabels, ...labels };
  const [draft, setDraft] = useState(settings);
  useEffect(() => { if (open) setDraft(settings); }, [open, settings]);
  const order = (descending: boolean, onChange: (d: boolean) => void, label: string) => (
    <RadioGroup label={label} orientation="horizontal" value={descending ? 'desc' : 'asc'} onChange={(v) => onChange(v === 'desc')} options={[{ value: 'asc', label: text.ascending }, { value: 'desc', label: text.descending }]} />
  );
  const tabs = [sortItems.length && 'sort', groupItems.length && 'group', filterItems.length && 'filter'].filter(Boolean) as ('sort' | 'group' | 'filter')[];
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      size="md"
      footer={<>
        <Button onClick={() => setDraft({ sortDescending: false, groupDescending: false, filters: {} })}>{text.reset}</Button>
        <Button variant="primary" onClick={() => { onConfirm(draft); onClose(); }}>{text.ok}</Button>
        <Button onClick={onClose}>{text.cancel}</Button>
      </>}
    >
      <Tabs defaultValue={tabs[0]}>
        <TabList aria-label={title}>
          {tabs.map((t) => <Tab key={t} value={t}>{text[t]}</Tab>)}
        </TabList>
        {sortItems.length > 0 && (
          <TabPanel value="sort">
            <div className={styles.panel}>
              {order(draft.sortDescending, (d) => setDraft({ ...draft, sortDescending: d }), text.order)}
              <RadioGroup label={text.sortBy} value={draft.sortBy ?? null} onChange={(v) => setDraft({ ...draft, sortBy: v })} options={sortItems.map((s) => ({ value: s.id, label: s.label }))} />
            </div>
          </TabPanel>
        )}
        {groupItems.length > 0 && (
          <TabPanel value="group">
            <div className={styles.panel}>
              {order(draft.groupDescending, (d) => setDraft({ ...draft, groupDescending: d }), text.order)}
              <RadioGroup label={text.groupBy} value={draft.groupBy ?? '__none'} onChange={(v) => setDraft({ ...draft, groupBy: v === '__none' ? undefined : v })} options={[{ value: '__none', label: text.none }, ...groupItems.map((g) => ({ value: g.id, label: g.label }))]} />
            </div>
          </TabPanel>
        )}
        {filterItems.length > 0 && (
          <TabPanel value="filter">
            <div className={styles.panel}>
              {filterItems.map((f) => (
                <fieldset key={f.id} className={styles.fieldset}>
                  <legend className={styles.legend}>{f.label}</legend>
                  {f.options.map((o) => {
                    const selected = draft.filters[f.id] ?? [];
                    return <Checkbox key={o.id} label={o.label} checked={selected.includes(o.id)} onChange={(checked) => setDraft({ ...draft, filters: { ...draft.filters, [f.id]: checked ? [...selected, o.id] : selected.filter((x) => x !== o.id) } })} />;
                  })}
                </fieldset>
              ))}
            </div>
          </TabPanel>
        )}
      </Tabs>
    </Dialog>
  );
}
