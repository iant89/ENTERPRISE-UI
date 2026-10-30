import { forwardRef, type LabelHTMLAttributes } from 'react';
import { cx } from '../../utilities/cx';
import styles from './Label.module.css';
export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Displays a decorative required marker; also set required on the control. */
  required?: boolean;
}
/** Visible label for a form control. Connect it with htmlFor and the control id. */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label({ children, required = false, className, ...rest }, ref) {
  return <label {...rest} ref={ref} className={cx(styles.label, className)}>{children}{required && <span aria-hidden="true" className={styles.required}> *</span>}</label>;
});
