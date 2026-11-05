import styles from './CodeWorkspace.module.css';
import messageErrorSvg from '../../../../src/assets/icons/message-error.svg?raw';
import warning2Svg from '../../../../src/assets/icons/warning2.svg?raw';
import { svgIcon } from '../../../../src/icons/svgIcon';

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
      <span className={styles.statusCounts}>{svgIcon(messageErrorSvg, 'message-error', { 'aria-hidden': "true" })}{errors}{svgIcon(warning2Svg, 'warning2', { 'aria-hidden': "true" })}{warnings}<span className={styles.srOnly}> errors and warnings</span></span>
      <span>{file}</span>
      <span>Ln {line}, Col {column}</span>
      <span className={styles.statusGrow}>{/\.tsx?$/.test(file) ? 'TypeScript JSX' : file.split('.').pop()?.toUpperCase()}</span>
      <span>Preview {previewState}</span>
      <span>Theme: {theme}</span>
      <span role="status" aria-live="polite">{saveState}</span>
    </footer>
  );
}
