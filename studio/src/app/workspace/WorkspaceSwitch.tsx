import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { GridIcon, SourceCodeIcon } from '@enterprise-ui/react';
import type { Workspace } from './layout';
import styles from './CodeWorkspace.module.css';

const ITEMS: { value: Workspace; label: string; short: string; icon: ReactNode }[] = [
  { value: 'design', label: 'Design Studio', short: 'Design', icon: <GridIcon aria-hidden="true" /> },
  { value: 'code', label: 'Code Studio', short: 'Code', icon: <SourceCodeIcon aria-hidden="true" /> },
];

/** Decision 1: the centred Design / Code switch. A radiogroup with roving focus and arrow keys. */
export function WorkspaceSwitch({ value, onChange, short = false }: { value: Workspace; onChange: (w: Workspace) => void; short?: boolean }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (event: KeyboardEvent) => {
    const i = ITEMS.findIndex((it) => it.value === value);
    const delta = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (i + delta + ITEMS.length) % ITEMS.length;
    onChange(ITEMS[next].value);
    refs.current[next]?.focus();
  };
  return (
    <div role="radiogroup" aria-label="Workspace" className={styles.switch} onKeyDown={onKey}>
      {ITEMS.map((it, i) => (
        <button
          key={it.value}
          ref={(el) => { refs.current[i] = el; }}
          type="button"
          role="radio"
          aria-checked={value === it.value}
          aria-label={it.label}
          tabIndex={value === it.value ? 0 : -1}
          className={styles.switchItem}
          onClick={() => onChange(it.value)}
        >
          {it.icon}<span>{short ? it.short : it.label}</span>
        </button>
      ))}
    </div>
  );
}
