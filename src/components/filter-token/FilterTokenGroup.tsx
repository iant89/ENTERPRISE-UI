import { Button } from '../button';
import { FilterToken } from './FilterToken';
import styles from './FilterToken.module.css';

export interface FilterTokenItem { id: string; name: string; value: string }
export interface FilterTokenGroupProps {
  tokens: FilterTokenItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
  label?: string;
  clearLabel?: string;
}

/** A controlled collection of applied filters with individual and bulk removal. */
export function FilterTokenGroup({ tokens, onRemove, onClear, label = 'Active filters', clearLabel = 'Clear all filters' }: FilterTokenGroupProps) {
  if (!tokens.length) return null;
  return <section aria-label={label} className={styles.group}>
    {tokens.map((token) => <FilterToken key={token.id} name={token.name} value={token.value} onRemove={() => onRemove(token.id)} />)}
    <Button size="sm" variant="tertiary" onClick={onClear}>{clearLabel}</Button>
  </section>;
}
