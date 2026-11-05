import { Button, DropdownMenu, IconButton, Select, THEMES, type MenuEntry, type ThemePreference } from '@enterprise-ui/react';
import { WorkspaceSwitch } from './WorkspaceSwitch';
import type { Breakpoint, Workspace } from './layout';
import styles from './CodeWorkspace.module.css';
import downloadSvg from '../../../../src/assets/icons/download.svg?raw';
import menu2Svg from '../../../../src/assets/icons/menu2.svg?raw';
import redoSvg from '../../../../src/assets/icons/redo.svg?raw';
import settingsSvg from '../../../../src/assets/icons/settings.svg?raw';
import undoSvg from '../../../../src/assets/icons/undo.svg?raw';
import { svgIcon } from '../../../../src/icons/svgIcon';

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
        {mobile && <DropdownMenu aria-label="Menu" trigger={<IconButton size="sm" variant="tertiary" icon={svgIcon(menu2Svg, 'menu2')} label="Menu" />} items={all} onAction={onAction} />}
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
            <IconButton size="sm" variant="tertiary" icon={svgIcon(undoSvg, 'undo')} label="Undo" disabled={!canUndo} onClick={() => onAction('undo')} />
            <IconButton size="sm" variant="tertiary" icon={svgIcon(redoSvg, 'redo')} label="Redo" disabled={!canRedo} onClick={() => onAction('redo')} />
            <IconButton size="sm" variant="tertiary" icon={svgIcon(downloadSvg, 'download')} label="Download project" onClick={() => onAction('download')} />
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
        <IconButton size="sm" variant="tertiary" icon={svgIcon(settingsSvg, 'settings')} label="Settings" onClick={() => onAction('settings')} />
      </div>
    </header>
  );
}
