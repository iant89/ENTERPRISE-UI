import { forwardRef, type FormHTMLAttributes } from 'react';
import { cx } from '../../utilities/cx';
import styles from './Form.module.css';
export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {}
/** A native form container for fields and form groups. */
export const Form = forwardRef<HTMLFormElement, FormProps>(function Form({ className, ...rest }, ref) {
  return <form {...rest} ref={ref} className={cx(styles.form, className)} />;
});
