import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import styles from './ObjectIdentifier.module.css';

export interface ObjectIdentifierProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'title' | 'onClick'> {
  /** Object name, e.g. a product or order title. */
  title: ReactNode;
  /** Secondary identifier, e.g. an ID or category. */
  text?: ReactNode;
  /** Render the title as a link to the object. */
  href?: string;
  /** Render the title as a button that opens the object. */
  onClick?: () => void;
}

/** Identifies a business object by name and ID — typically in the first table column. */
export const ObjectIdentifier = forwardRef<HTMLSpanElement, ObjectIdentifierProps>(function ObjectIdentifier(
  { title, text, href, onClick, className, ...rest },
  ref,
) {
  return (
    <span ref={ref} className={cx(styles.root, className)} {...rest}>
      {href ? (
        <a className={styles.link} href={href}>
          {title}
        </a>
      ) : onClick ? (
        <button type="button" className={styles.link} onClick={onClick}>
          {title}
        </button>
      ) : (
        <span className={styles.title}>{title}</span>
      )}
      {text && <span className={styles.text}>{text}</span>}
    </span>
  );
});
