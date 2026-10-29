import type { ReactNode } from 'react';
import { Breadcrumbs, type BreadcrumbsProps } from '../breadcrumbs';
import styles from './AppBreadcrumbBar.module.css';
export interface AppBreadcrumbBarProps extends BreadcrumbsProps { actions?: ReactNode }
/** Breadcrumb navigation with a responsive slot for contextual actions. */
export function AppBreadcrumbBar({ actions, ...props }: AppBreadcrumbBarProps) { return <div className={styles.bar}><Breadcrumbs {...props} />{actions && <div className={styles.actions}>{actions}</div>}</div>; }
