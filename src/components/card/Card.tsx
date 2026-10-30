import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import styles from './Card.module.css';

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'onClick'> {
  /** Custom header, for example CardHeader. Replaces the built-in header. */
  header?: ReactNode;
  /** Card heading. */
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Leading visual in the header, e.g. an Avatar or icon. */
  avatar?: ReactNode;
  /** Actions in the header, e.g. IconButtons or a DropdownMenu. */
  headerActions?: ReactNode;
  /** Footer content, typically buttons. */
  footer?: ReactNode;
  /** Heading level for `title`. @default 3 */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Draw a divider under the header. @default false */
  headerDivider?: boolean;
  /** Remove body padding (for tables or lists that fill the card). @default false */
  noPadding?: boolean;
  /** No shadow, stronger border. @default false */
  flat?: boolean;
  /** Highlight as selected. @default false */
  selected?: boolean;
  /** Make the whole card a single click target (title becomes a button). */
  onClick?: () => void;
  /** Accessible name for the card region. Defaults to the title. */
  'aria-label'?: string;
}

/** Container that groups related content and actions about a single subject. */
export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { header, title, subtitle, avatar, headerActions, footer, headingLevel = 3, headerDivider = false, noPadding = false, flat = false, selected = false, onClick, className, children, ...rest },
  ref,
) {
  const Heading = `h${headingLevel}` as const;
  const hasHeader = title || subtitle || avatar || headerActions;
  return (
    <article ref={ref} className={cx(styles.card, flat && styles.flat, selected && styles.selected, onClick && styles.interactive, className)} {...rest}>
      {header ?? (hasHeader && (
        <header className={cx(styles.header, headerDivider && styles.headerDivider)}>
          {avatar}
          <div className={styles.headerText}>
            {title && (
              <Heading className={styles.title}>
                {onClick ? (
                  <button type="button" className={styles.cover} onClick={onClick}>
                    {title}
                  </button>
                ) : (
                  title
                )}
              </Heading>
            )}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {headerActions && <div className={styles.actions}>{headerActions}</div>}
        </header>
      ))}
      {children != null && <div className={cx(styles.body, noPadding && styles.noPadding)}>{children}</div>}
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </article>
  );
});
