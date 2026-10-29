import { forwardRef, type CSSProperties, type FieldsetHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import styles from './FormGroup.module.css';

export interface FormGroupProps extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'title'> {
  /** Group heading, rendered as the fieldset legend. */
  title?: ReactNode;
  description?: ReactNode;
  /** Number of field columns on wide screens (collapses responsively). @default 1 */
  columns?: 1 | 2 | 3 | 4;
  children: ReactNode;
}

/**
 * Groups related fields under a heading and lays them out in a responsive
 * grid. Wrap a child in `<div className={FormGroup.spanClassName}>` to span all columns.
 */
const FormGroupBase = forwardRef<HTMLFieldSetElement, FormGroupProps>(function FormGroup(
  { title, description, columns = 1, className, style, children, ...rest },
  ref,
) {
  return (
    <fieldset ref={ref} className={cx(styles.group, className)} style={{ ...style, '--_columns': columns } as CSSProperties} {...rest}>
      {title && <legend className={styles.legend}>{title}</legend>}
      {description && <p className={styles.description}>{description}</p>}
      <div className={styles.fields}>{children}</div>
    </fieldset>
  );
});

export const FormGroup = Object.assign(FormGroupBase, { spanClassName: styles.span });
