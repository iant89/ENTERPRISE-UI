import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { CloudOff, FileQuestion, Lock, ServerCrash, Wrench } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { CopyButton } from '../../components/copy-button';
import styles from './ErrorPage.module.css';

export type ErrorPageVariant = 'notFound' | 'forbidden' | 'serverError' | 'maintenance' | 'offline';

export interface ErrorPageText {
  code?: string;
  title: string;
  description: string;
}

export interface ErrorPageLabels {
  variants: Record<ErrorPageVariant, ErrorPageText>;
  reference: string;
  copyReference: string;
}

export interface ErrorPageProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Which situation the page explains. */
  variant: ErrorPageVariant;
  /** Replaces the default heading. */
  title?: ReactNode;
  /** Replaces the default explanation. */
  description?: ReactNode;
  /** Buttons or links, e.g. "Go to home page" and "Contact support". */
  actions?: ReactNode;
  /** Support reference (correlation or request id) shown with a copy button. */
  reference?: string;
  /** Extra content, e.g. expected end of maintenance or a list of what the user can do. */
  children?: ReactNode;
  /** Renders a `main` landmark (when the page stands alone). @default true */
  standalone?: boolean;
  /** Overrides for the built-in strings. */
  labels?: Partial<Omit<ErrorPageLabels, 'variants'>> & { variants?: Partial<Record<ErrorPageVariant, Partial<ErrorPageText>>> };
}

const defaultVariants: Record<ErrorPageVariant, ErrorPageText> = {
  notFound: { code: '404', title: 'Page not found', description: 'The page may have moved, or the link may be wrong. Check the address or go back to the home page.' },
  forbidden: { code: '403', title: 'You do not have access', description: 'Your account is not authorized for this page. Ask your administrator for access if you need it.' },
  serverError: { code: '500', title: 'Something went wrong', description: 'The system could not complete your request. Try again in a few minutes. If it keeps happening, contact support with the reference below.' },
  maintenance: { title: 'Down for maintenance', description: 'The system is being updated and will be back shortly. Your saved work is not affected.' },
  offline: { title: 'You are offline', description: 'Check your network connection. The page reloads when you are back online.' },
};

const ICONS = { notFound: FileQuestion, forbidden: Lock, serverError: ServerCrash, maintenance: Wrench, offline: CloudOff } as const;

/** A full-page explanation for 404, 403, 500, maintenance and offline states, with next steps and a support reference. */
export const ErrorPage = forwardRef<HTMLElement, ErrorPageProps>(function ErrorPage(
  { variant, title, description, actions, reference, children, standalone = true, labels: labelOverrides, className, ...rest },
  ref,
) {
  const text = { ...defaultVariants[variant], ...labelOverrides?.variants?.[variant] };
  const referenceLabel = labelOverrides?.reference ?? 'Reference';
  const copyLabel = labelOverrides?.copyReference ?? 'Copy reference';
  const Icon = ICONS[variant];
  const Root = standalone ? 'main' : 'section';
  return (
    <Root ref={ref as never} className={cx(styles.page, className)} {...rest}>
      <div className={styles.content}>
        <span className={cx(styles.icon, styles[variant])} aria-hidden="true">
          <Icon />
        </span>
        {text.code && (
          <p className={styles.code} aria-hidden="true">
            {text.code}
          </p>
        )}
        <h1 className={styles.title}>
          {title ?? text.title}
          {text.code && <span className="eui-visually-hidden"> (error {text.code})</span>}
        </h1>
        <p className={styles.description}>{description ?? text.description}</p>
        {children}
        {actions && <div className={styles.actions}>{actions}</div>}
        {reference && (
          <p className={styles.reference}>
            <span>{referenceLabel}:</span> <code>{reference}</code>
            <CopyButton value={reference} label={copyLabel} />
          </p>
        )}
      </div>
    </Root>
  );
});
