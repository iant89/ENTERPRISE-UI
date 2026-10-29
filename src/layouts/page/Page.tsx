import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { IconButton } from '../../components/icon-button';
import { Breadcrumbs, type BreadcrumbItem } from '../../components/breadcrumbs';
import styles from './Page.module.css';

export interface PageProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Page heading (rendered as the page's `<h1>`). */
  title: ReactNode;
  /** Contextual description below the title. */
  subtitle?: ReactNode;
  /** Breadcrumb trail (items or a custom element). */
  breadcrumbs?: BreadcrumbItem[] | ReactNode;
  /** Content next to the title, e.g. a StatusIndicator. */
  titleAddon?: ReactNode;
  /** Leading visual, e.g. an Avatar for object pages. */
  avatar?: ReactNode;
  /** Primary page actions, right-aligned. */
  actions?: ReactNode;
  /** Header content below the title (key facts, KPIs). */
  headerContent?: ReactNode;
  /** Filter bar or toolbar area at the bottom of the header. */
  toolbar?: ReactNode;
  /** Shows a back button before the title. */
  onBack?: () => void;
  /** Constrain content width (`contained`) or use the full width. @default 'full' */
  width?: 'full' | 'contained';
  /** Remove content padding. @default false */
  flush?: boolean;
  children?: ReactNode;
}

/**
 * Page layout: header with breadcrumbs, title, subtitle, actions, header
 * content and a toolbar/filter area, followed by a responsive content region.
 */
export const Page = forwardRef<HTMLDivElement, PageProps>(function Page(
  { title, subtitle, breadcrumbs, titleAddon, avatar, actions, headerContent, toolbar, onBack, width = 'full', flush = false, className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx(styles.page, width === 'contained' && styles.contained, flush && styles.flush, className)} {...rest}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          {breadcrumbs && (Array.isArray(breadcrumbs) ? <Breadcrumbs items={breadcrumbs} /> : breadcrumbs)}
          <div className={styles.titleRow}>
            <div className={styles.titleBlock}>
              {onBack && <IconButton icon={<ArrowLeft />} label="Back" onClick={onBack} />}
              {avatar}
              <div className={styles.titleText}>
                <h1 className={styles.title}>
                  {title}
                  {titleAddon}
                </h1>
                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
              </div>
            </div>
            {actions && <div className={styles.actions}>{actions}</div>}
          </div>
          {headerContent && <div className={styles.headerContent}>{headerContent}</div>}
          {toolbar && <div className={styles.toolbar}>{toolbar}</div>}
        </div>
      </header>
      <div className={styles.content}>{children}</div>
    </div>
  );
});
