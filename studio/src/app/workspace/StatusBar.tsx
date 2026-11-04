import { MessageErrorIcon, Warning2Icon } from '@enterprise-ui/react';
import styles from './CodeWorkspace.module.css';

export interface StatusBarProps {
  file: string;
  line: number;
  column: number;
  saveState: string;
  theme: string;
  errors: number;
  warnings: number;
  previewState: 'live' | 'stale' | 'paused';
}

/** File, cursor position, save state and theme (spec §3). */
export function StatusBar({ file, line, column, saveState, theme, errors, warnings, previewState }: StatusBarProps) {
  return (
    <footer className={styles.statusBar} aria-label="Status bar">
      <span className={styles.statusCounts}><MessageErrorIcon aria-hidden="true" />{errors}<Warning2Icon aria-hidden="true" />{warnings}<span className={styles.srOnly}> errors and warnings</span></span>
      <span>{file}</span>
      <span>Ln {line}, Col {column}</span>
      <span className={styles.statusGrow}>{/\.tsx?$/.test(file) ? 'TypeScript JSX' : file.split('.').pop()?.toUpperCase()}</span>
      <span>Preview {previewState}</span>
      <span>Theme: {theme}</span>
      <span role="status" aria-live="polite">{saveState}</span>
    </footer>
  );
}
