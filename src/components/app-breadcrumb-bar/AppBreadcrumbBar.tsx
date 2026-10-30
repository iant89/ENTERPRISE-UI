import { forwardRef, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { Breadcrumbs, type BreadcrumbsProps } from '../breadcrumbs';
import styles from './AppBreadcrumbBar.module.css';
export interface AppBreadcrumbBarProps extends BreadcrumbsProps { actions?: ReactNode; /** Class for the outer bar. */ barClassName?: string }
/** Breadcrumb navigation with a responsive slot for contextual actions. The ref targets the outer bar. */
export const AppBreadcrumbBar = forwardRef<HTMLDivElement, AppBreadcrumbBarProps>(function AppBreadcrumbBar({ actions, barClassName, ...props }, ref) {
  return <div ref={ref} className={cx(styles.bar, barClassName)}><Breadcrumbs {...props} />{actions && <div className={styles.actions}>{actions}</div>}</div>;
});
