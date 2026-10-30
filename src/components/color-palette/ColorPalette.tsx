import { forwardRef, type ButtonHTMLAttributes, type CSSProperties } from 'react';
import { Check } from 'lucide-react';
import { useControllableState } from '../../hooks/useControllableState';
import { cx } from '../../utilities/cx';
import styles from './ColorPalette.module.css';

export interface ColorPaletteItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  /** CSS color of the swatch. */
  color: string;
  /** Accessible color name, not just the swatch color. */
  label: string;
  /** @default false */
  /** Whether it is selected. */
  selected?: boolean;
}
/** A labelled color swatch. */
export const ColorPaletteItem = forwardRef<HTMLButtonElement, ColorPaletteItemProps>(function ColorPaletteItem({ color, label, selected = false, className, style, ...rest }, ref) {
  return <button {...rest} ref={ref} type="button" aria-label={label} aria-pressed={selected} className={cx(styles.item, className)} style={{ ...style, '--swatch': color } as CSSProperties}>{selected && <Check aria-hidden="true" />}</button>;
});
export interface ColorOption { color: string; label: string; disabled?: boolean }
export interface ColorPaletteProps {
  /** Options must have unique color values. */
  colors: ColorOption[];
  /** Accessible name, used when there is no visible label. */
  'aria-label': string;
  /** The current value. Providing it makes the component controlled; update it from the change callback. */
  value?: string | null;
  /** The initial value when the component is uncontrolled. */
  defaultValue?: string | null;
  /** Called with the color the user selects. */
  onChange?: (color: string) => void;
}
/** A controlled or uncontrolled palette of labelled color buttons. */
export function ColorPalette({ colors, 'aria-label': label, value, defaultValue = null, onChange }: ColorPaletteProps) {
  const [selected, setSelected] = useControllableState<string | null>(value, defaultValue, (next) => { if (next !== null) onChange?.(next); });
  return <div role="group" aria-label={label} className={styles.palette}>{colors.map((item) => <ColorPaletteItem key={item.color} {...item} selected={selected === item.color} onClick={() => { setSelected(item.color); }} />)}</div>;
}
