import { Button, DropdownMenu, IconButton, Select, THEMES, type MenuEntry, type ThemePreference } from '@enterprise-ui/react';
import { Download, Menu as MenuIcon, Redo2, Settings, Undo2 } from 'lucide-react';
import { WorkspaceSwitch } from './WorkspaceSwitch';
import type { Breakpoint, Workspace } from './layout';
import styles from './CodeWorkspace.module.css';

export type MenuName = 'Project' | 'File' | 'Edit' | 'View' | 'Run' | 'Tools';
export type MenuItems = Record<MenuName, MenuEntry[]>;

export interface MenuBarProps {
  breakpoint: Breakpoint;
  workspace: Workspace;
  onWorkspace: (w: Workspace) => void;
  menus: MenuItems;
  onAction: (id: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  saveState: string;
  theme: ThemePreference;
  setTheme: (t: ThemePreference) => void;
}

const NAMES: MenuName[] = ['Project', 'File', 'Edit', 'View', 'Run', 'Tools'];

/** Project File Edit View Run Tools, the centred workspace switch, and Studio theme + Settings. */
export function MenuBar({ breakpoint, workspace, onWorkspace, menus, onAction, canUndo, canRedo, saveState, theme, setTheme }: MenuBarProps) {
  const mobile = breakpoint === 'mobile';
  const all: MenuEntry[] = NAMES.flatMap((n, i) => [...(i ? [{ type: 'separator' as const }] : []), { type: 'label' as const, label: n }, ...menus[n]]);
  return (
    <header className={styles.menuBar}>
      <div className={styles.menuStart}>
        {mobile && <DropdownMenu aria-label="Menu" trigger={<IconButton size="sm" variant="tertiary" icon={<MenuIcon />} label="Menu" />} items={all} onAction={onAction} />}
        <span className={styles.product}>Enterprise UI Studio</span>
        {!mobile && (
          <nav aria-label="Main menu" className={styles.menus}>
            {NAMES.map((n) => (
              <DropdownMenu key={n} aria-label={n} trigger={<Button size="sm" variant="tertiary">{n}</Button>} items={menus[n]} onAction={onAction} />
            ))}
          </nav>
        )}
      </div>
      <div className={styles.menuCenter}><WorkspaceSwitch value={workspace} onChange={onWorkspace} short={mobile} /></div>
      <div className={styles.menuEnd}>
        {!mobile && (
          <>
            <IconButton size="sm" variant="tertiary" icon={<Undo2 />} label="Undo" disabled={!canUndo} onClick={() => onAction('undo')} />
            <IconButton size="sm" variant="tertiary" icon={<Redo2 />} label="Redo" disabled={!canRedo} onClick={() => onAction('redo')} />
            <IconButton size="sm" variant="tertiary" icon={<Download />} label="Download project" onClick={() => onAction('download')} />
            <span className={styles.saveState}>{saveState}</span>
            <Select
              size="sm"
              label="Studio theme"
              hideLabel
              value={theme}
              onChange={(v) => v && setTheme(v as ThemePreference)}
              options={[{ value: 'system', label: 'System theme' }, ...THEMES.map((t) => ({ value: t.name, label: t.label }))]}
            />
          </>
        )}
        <IconButton size="sm" variant="tertiary" icon={<Settings />} label="Settings" onClick={() => onAction('settings')} />
      </div>
    </header>
  );
}
