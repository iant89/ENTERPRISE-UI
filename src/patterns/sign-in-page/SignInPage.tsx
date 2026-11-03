import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { useForm, validators } from '../../hooks/useForm';
import { Button } from '../../components/button';
import { Checkbox } from '../../components/checkbox';
import { Input } from '../../components/input';
import { PasswordInput } from '../../components/password-input';
import styles from './SignInPage.module.css';

export interface SignInCredentials {
  username: string;
  password: string;
  remember: boolean;
}

export interface SignInProvider {
  id: string;
  /** Button text, e.g. "Sign in with Microsoft". */
  label: string;
  icon?: ReactNode;
}

export interface SignInPageLabels {
  title: string;
  username: string;
  password: string;
  remember: string;
  submit: string;
  forgotPassword: string;
  or: string;
  usernameRequired: string;
  passwordRequired: string;
}

export interface SignInPageProps extends Omit<HTMLAttributes<HTMLElement>, 'onSubmit' | 'title'> {
  /** Product name shown above the form. */
  productName: ReactNode;
  /** Logo next to the product name. */
  logo?: ReactNode;
  /** Signs in. Reject or return an error message to show it (keep it generic, e.g. "The user name or password is incorrect."). */
  onSubmit?: (credentials: SignInCredentials) => Promise<string | void> | string | void;
  /** Single sign-on options shown above the form. @default [] */
  providers?: SignInProvider[];
  /** Called when a provider button is pressed (redirect to the identity provider). */
  onProviderSignIn?: (id: string) => void;
  /** Link target of "Forgot password?". */
  forgotPasswordHref?: string;
  /** `email` or `text` for the user name field. @default 'text' */
  usernameType?: 'text' | 'email';
  /** Hides the user name and password form (single sign-on only). @default false */
  ssoOnly?: boolean;
  /** Error shown above the form, e.g. after an expired session. */
  error?: ReactNode;
  /** Information shown above the form, e.g. "You have been signed out." */
  notice?: ReactNode;
  /** Content of the side panel on wide screens (image, product message). */
  aside?: ReactNode;
  /** Footer content, e.g. legal links and copyright. */
  footer?: ReactNode;
  /** Renders a `main` landmark (when the page stands alone). @default true */
  standalone?: boolean;
  /** Overrides for the built-in strings. */
  labels?: Partial<SignInPageLabels>;
}

const defaultLabels: SignInPageLabels = {
  title: 'Sign in',
  username: 'User name',
  password: 'Password',
  remember: 'Keep me signed in',
  submit: 'Sign in',
  forgotPassword: 'Forgot password?',
  or: 'or',
  usernameRequired: 'Enter your user name.',
  passwordRequired: 'Enter your password.',
};

/**
 * The sign-in page: product branding, optional single sign-on buttons, user name and password with
 * password-manager friendly autocomplete, and a generic error message. Authentication stays on the server.
 */
export const SignInPage = forwardRef<HTMLElement, SignInPageProps>(function SignInPage(
  { productName, logo, onSubmit, providers = [], onProviderSignIn, forgotPasswordHref, usernameType = 'text', ssoOnly = false, error, notice, aside, footer, standalone = true, labels: labelOverrides, className, ...rest },
  ref,
) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const Root = standalone ? 'main' : 'section';
  const form = useForm({
    initialValues: { username: '', password: '', remember: false },
    rules: { username: validators.required(labels.usernameRequired), password: validators.required(labels.passwordRequired) },
    required: ['username', 'password'],
    onSubmit: async (values) => {
      try {
        const message = await onSubmit?.(values);
        if (typeof message === 'string' && message) return { password: message };
      } catch (e) {
        return { password: e instanceof Error ? e.message : String(e) };
      }
      return undefined;
    },
  });
  const formError = form.submitCount > 0 && form.values.username && form.values.password ? form.errors.password : undefined;

  return (
    <Root ref={ref as never} className={cx(styles.page, aside ? styles.withAside : undefined, className)} {...rest}>
      <div className={styles.panel}>
        <div className={styles.card}>
          <div className={styles.brand}>
            {logo && <span className={styles.logo}>{logo}</span>}
            <span className={styles.product}>{productName}</span>
          </div>
          <h1 className={styles.title}>{labels.title}</h1>
          {notice && <p className={styles.notice}>{notice}</p>}
          {(error || formError) && (
            <p className={styles.error} role="alert">
              <AlertCircle aria-hidden="true" />
              {formError ?? error}
            </p>
          )}
          {providers.length > 0 && (
            <div className={styles.providers}>
              {providers.map((p) => (
                <Button key={p.id} variant="secondary" icon={p.icon} onClick={() => onProviderSignIn?.(p.id)} className={styles.provider}>
                  {p.label}
                </Button>
              ))}
            </div>
          )}
          {providers.length > 0 && !ssoOnly && (
            <p className={styles.divider}>
              <span>{labels.or}</span>
            </p>
          )}
          {!ssoOnly && (
            <form className={styles.form} onSubmit={form.handleSubmit} noValidate>
              <Input
                label={labels.username}
                type={usernameType}
                autoComplete={usernameType === 'email' ? 'email' : 'username'}
                autoCapitalize="none"
                spellCheck={false}
                {...form.field('username')}
              />
              <PasswordInput
                label={labels.password}
                {...form.field('password')}
                // The submit error is shown above the form; the field only shows its own required message.
                error={form.values.password ? undefined : form.field('password').error}
              />
              <div className={styles.row}>
                <Checkbox label={labels.remember} checked={form.values.remember} onChange={(c) => form.setValue('remember', c)} />
                {forgotPasswordHref && (
                  <a className={styles.link} href={forgotPasswordHref}>
                    {labels.forgotPassword}
                  </a>
                )}
              </div>
              <Button type="submit" variant="primary" loading={form.isSubmitting} className={styles.submit}>
                {labels.submit}
              </Button>
            </form>
          )}
        </div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
      {aside && <aside className={styles.aside}>{aside}</aside>}
    </Root>
  );
});
