import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { cx } from '../../utilities/cx';
import styles from './EmptyState.module.css';

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Headline that states what is empty. */
  title: ReactNode;
  /** Explains why it is empty and what the user can do next. */
  description?: ReactNode;
  /** Icon or illustration. @default Inbox icon */
  icon?: ReactNode;
  /** Actions that help the user move forward (e.g. Create, Clear filters). */
  actions?: ReactNode;
  /** @default 'md' */
  /** Size of the empty state. */
  size?: 'sm' | 'md';
  /** Heading level for the title. @default 2 */
  headingLevel?: 2 | 3 | 4;
}

/** Explains why there is no content and what the user can do next. */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { title, description, icon, actions, size = 'md', headingLevel = 2, className, ...rest },
  ref,
) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div ref={ref} className={cx(styles.empty, size === 'sm' && styles.sm, className)} {...rest}>
      <div className={styles.illustration} aria-hidden="true">
        {icon ?? <Inbox />}
      </div>
      <Heading className={styles.title}>{title}</Heading>
      {description && <p className={styles.description}>{description}</p>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
});
