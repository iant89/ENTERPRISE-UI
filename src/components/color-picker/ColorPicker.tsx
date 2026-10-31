import { forwardRef, type InputHTMLAttributes } from 'react';
import styles from './ColorPicker.module.css';

export interface ColorPickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue' | 'onChange'> {
  /** Six-digit hexadecimal color, e.g. #0a6ed1. */
  value?: string;
  /** The initial value when the component is uncontrolled. */
  defaultValue?: string;
  /** Called when the browser color picker changes. */
  onChange?: (color: string) => void;
}
/** Native color input; the browser supplies the picker interface. */
export const ColorPicker = forwardRef<HTMLInputElement, ColorPickerProps>(function ColorPicker({ value, defaultValue, onChange, className, ...rest }, ref) {
  return <input {...rest} ref={ref} type="color" value={value} defaultValue={defaultValue} onChange={(event) => onChange?.(event.currentTarget.value)} className={[styles.picker, className].filter(Boolean).join(' ')} />;
});
