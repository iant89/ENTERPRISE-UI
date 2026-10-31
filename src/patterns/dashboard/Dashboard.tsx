import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { useId } from '../../hooks/useId';
import { Grid } from '../../layouts/grid';
import type { Responsive, Space } from '../../layouts/space';
import styles from './Dashboard.module.css';

export interface DashboardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Title of the dashboard. */
  title?: ReactNode;
  /** Short description shown below the title. */
  description?: ReactNode;
  /** Header actions (refresh, date range, …). */
  actions?: ReactNode;
  /** Filter area between header and widgets. */
  filters?: ReactNode;
  /** @default { base: 1, sm: 2, md: 4 } */
  /** Number of grid columns, either fixed or per breakpoint. */
  columns?: Responsive<number>;
  /** @default 4 */
  /** Spacing between children, as a spacing-scale step. */
  gap?: Space;
  /** Heading level of the title. @default 2 */
  headingLevel?: 2 | 3;
  /** Content rendered inside the dashboard. */
  children: ReactNode;
}

/** A responsive grid of KPI tiles, charts and cards with an optional header. */
export const Dashboard = forwardRef<HTMLElement, DashboardProps>(function Dashboard(
  { title, description, actions, filters, columns = { base: 1, sm: 2, md: 4 }, gap = 4, headingLevel = 2, className, children, ...rest },
  ref,
) {
  const titleId = useId(undefined, 'dashboard');
  const Heading = `h${headingLevel}` as const;
  return (
    <section ref={ref} className={cx(styles.dashboard, className)} aria-labelledby={title ? titleId : undefined} {...rest}>
      {(title || actions) && (
        <div className={styles.header}>
          <div>
            {title && (
              <Heading id={titleId} className={styles.title}>
                {title}
              </Heading>
            )}
            {description && <p className={styles.description}>{description}</p>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      {filters}
      <Grid columns={columns} gap={gap}>
        {children}
      </Grid>
    </section>
  );
});

export interface DashboardWidgetProps extends HTMLAttributes<HTMLDivElement> {
  /** Columns to span (capped to the available columns), or `full`. @default 1 */
  span?: 1 | 2 | 3 | 4 | 'full';
  /** Content rendered inside the dashboard widget. */
  children: ReactNode;
}

/** A grid cell in a Dashboard that can span several columns. */
export const DashboardWidget = forwardRef<HTMLDivElement, DashboardWidgetProps>(function DashboardWidget({ span = 1, className, style, ...rest }, ref) {
  return <div ref={ref} className={cx(styles.widget, span === 'full' && styles.full, className)} style={{ '--_span': span === 'full' ? undefined : span, ...style } as CSSProperties} {...rest} />;
});
