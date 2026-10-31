import styles from './FilterToken.module.css';

export interface FilterTokenProps {
  /** Name of the filtered field. */
  name: string;
  /** Filter value shown after the field name. */
  value: string;
  /** Called when the user removes the filter. */
  onRemove: () => void;
  /** Override for localized accessible text. */
  removeLabel?: string;
  /** Disables the filter token. A disabled control cannot be focused or changed. */
  disabled?: boolean;
}

/** A removable applied filter. The application owns the filter value and removal. */
export function FilterToken({ name, value, onRemove, removeLabel, disabled }: FilterTokenProps) {
  return <span className={styles.token}><span className={styles.text}><strong>{name}:</strong> {value}</span><button type="button" aria-label={removeLabel ?? `Remove filter ${name}: ${value}`} disabled={disabled} onClick={onRemove}>×</button></span>;
}
