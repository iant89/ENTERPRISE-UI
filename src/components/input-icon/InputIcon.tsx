import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import styles from './InputIcon.module.css';
export interface InputIconProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: ReactNode;
  /** Required accessible name for the icon action. */
  label: string;
}
/** Action button for an Input adornment. */
export const InputIcon = forwardRef<HTMLButtonElement, InputIconProps>(function InputIcon({ icon, label, className, type = 'button', ...rest }, ref) {
  return <button {...rest} ref={ref} type={type} aria-label={label} title={label} className={cx(styles.button, className)}><span aria-hidden="true">{icon}</span></button>;
});
