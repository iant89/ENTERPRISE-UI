import { useState, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { Dialog } from '../dialog';
import { Button } from '../button';
import styles from './UserSettingsDialog.module.css';

export interface UserSettingsView {
  id: string;
  label: string;
  icon?: ReactNode;
  /** View content. */
  content: ReactNode;
  /** Group the view in the fixed (bottom) section, e.g. "About". @default false */
  fixed?: boolean;
}

export interface UserSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  /** @default 'Settings' */
  title?: string;
  views: UserSettingsView[];
  selectedViewId?: string;
  onSelectedViewChange?: (id: string) => void;
  /** Footer actions, e.g. Save/Cancel. Defaults to a Close button. */
  footer?: ReactNode;
  /** Localized navigation name. @default 'Settings categories' */
  navigationLabel?: string;
  closeLabel?: string;
}

/** A settings dialog with a category list and a content area per category. */
export function UserSettingsDialog({ open, onClose, title = 'Settings', views, selectedViewId, onSelectedViewChange, footer, navigationLabel = 'Settings categories', closeLabel = 'Close' }: UserSettingsDialogProps) {
  const [internal, setInternal] = useState(views[0]?.id);
  const selected = selectedViewId ?? internal;
  const select = (id: string) => { if (selectedViewId === undefined) setInternal(id); onSelectedViewChange?.(id); };
  const current = views.find((v) => v.id === selected) ?? views[0];
  const renderNav = (list: UserSettingsView[]) => list.map((view) => (
    <li key={view.id}>
      <button type="button" className={cx(styles.navItem, view.id === current?.id && styles.selected)} aria-current={view.id === current?.id ? 'true' : undefined} onClick={() => select(view.id)}>
        {view.icon && <span className={styles.icon} aria-hidden="true">{view.icon}</span>}{view.label}
      </button>
    </li>
  ));
  return (
    <Dialog open={open} onClose={onClose} title={title} size="lg" footer={footer ?? <Button onClick={onClose}>{closeLabel}</Button>}>
      <div className={styles.layout}>
        <nav aria-label={navigationLabel} className={styles.nav}>
          <ul>{renderNav(views.filter((v) => !v.fixed))}</ul>
          {views.some((v) => v.fixed) && <ul className={styles.fixed}>{renderNav(views.filter((v) => v.fixed))}</ul>}
        </nav>
        {current && <section className={styles.content} aria-label={current.label}><h3 className={styles.viewTitle}>{current.label}</h3>{current.content}</section>}
      </div>
    </Dialog>
  );
}
