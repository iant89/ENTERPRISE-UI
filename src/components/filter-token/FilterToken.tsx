import styles from './FilterToken.module.css';

export interface FilterTokenProps {
  name: string;
  value: string;
  onRemove: () => void;
  /** Override for localized accessible text. */
  removeLabel?: string;
  disabled?: boolean;
}

/** A removable applied filter. The application owns the filter value and removal. */
export function FilterToken({ name, value, onRemove, removeLabel, disabled }: FilterTokenProps) {
  return <span className={styles.token}><span className={styles.text}><strong>{name}:</strong> {value}</span><button type="button" aria-label={removeLabel ?? `Remove filter ${name}: ${value}`} disabled={disabled} onClick={onRemove}>×</button></span>;
}
