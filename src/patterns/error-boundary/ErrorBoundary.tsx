import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '../../components/button';
import { EmptyState } from '../empty-state';

export interface ErrorBoundaryLabels {
  /** Heading of the default fallback. */
  title: string;
  /** Text under the heading of the default fallback. */
  description: string;
  /** The button that renders the children again. */
  retry: string;
  /** Heading of the default fallback when the code of a lazily loaded part could not be loaded (see `isChunkLoadError`). */
  updatedTitle: string;
  /** Text of the default fallback for a load failure. */
  updatedDescription: string;
  /** The button that reloads the page. */
  reload: string;
}

const defaultLabels: ErrorBoundaryLabels = {
  title: 'This part could not be displayed',
  description: 'The rest of the application still works. Try again, or go somewhere else. If it keeps happening, reload the page.',
  retry: 'Try again',
  updatedTitle: 'Reload to continue',
  updatedDescription: 'A newer version of the application is available. Reload the page to open this part.',
  reload: 'Reload page',
};

export interface ErrorBoundaryFallbackProps {
  /** The error that was thrown while rendering. */
  error: Error;
  /** Clears the error and renders the children again. */
  reset: () => void;
}

export interface ErrorBoundaryProps {
  /** The content to protect. */
  children: ReactNode;
  /**
   * What to show instead of the content after it threw: an element, or a function of
   * the error and a `reset` callback. By default an EmptyState with Try again and
   * Reload page (or only Reload, when the error is a failed lazy load).
   */
  fallback?: ReactNode | ((props: ErrorBoundaryFallbackProps) => ReactNode);
  /**
   * Clears the error when it changes, for example the current route, so moving to
   * another page leaves the error behind.
   */
  resetKey?: unknown;
  /** Called with the error and React's component stack, for logging or reporting. */
  onError?: (error: Error, info: ErrorInfo) => void;
  /** Called after the error was cleared by `reset` or a new `resetKey`. */
  onReset?: () => void;
  /** Overrides the default fallback's strings. */
  labels?: Partial<ErrorBoundaryLabels>;
  /** Heading level of the default fallback. @default 2 */
  headingLevel?: 2 | 3 | 4;
}

interface State {
  error: Error | null;
}

/**
 * The class behind ErrorBoundary: React catches render errors only in class components.
 */
class Boundary extends Component<ErrorBoundaryProps, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  override componentDidUpdate(prev: ErrorBoundaryProps) {
    if (this.state.error && !Object.is(prev.resetKey, this.props.resetKey)) this.reset();
  }

  /** Clears the error and renders the children again. */
  reset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  override render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    const { fallback, headingLevel = 2 } = this.props;
    if (typeof fallback === 'function') return fallback({ error, reset: this.reset });
    if (fallback !== undefined) return fallback;
    const text = { ...defaultLabels, ...this.props.labels };
    const reload = () => window.location.reload();
    if (isChunkLoadError(error)) {
      return (
        <EmptyState
          role="alert"
          icon="refresh"
          headingLevel={headingLevel}
          title={text.updatedTitle}
          description={text.updatedDescription}
          actions={<Button variant="primary" onClick={reload}>{text.reload}</Button>}
        />
      );
    }
    return (
      <EmptyState
        role="alert"
        icon="error"
        headingLevel={headingLevel}
        title={text.title}
        description={text.description}
        actions={
          <>
            <Button onClick={this.reset}>{text.retry}</Button>
            <Button variant="tertiary" onClick={reload}>{text.reload}</Button>
          </>
        }
      />
    );
  }
}

/**
 * Whether an error means the code of a lazily loaded module could not be fetched,
 * typically because the application was updated while the page was open and the old
 * file is gone. Only a reload helps then. Chrome, Firefox and Safari word it differently.
 */
export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /dynamically imported module|module script failed|Importing a module script|error loading dynamically imported|Unable to preload|Loading chunk [\w-]+ failed/i.test(message);
}

/**
 * Keeps an error thrown while rendering one part of the page (a route, a panel, a
 * card) from taking down the whole application: the part shows a fallback while
 * the shell, navigation and the other parts keep working. Errors in event handlers
 * and async code are not caught (React's rule); show those with a message instead.
 */
export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <Boundary {...props} />;
}
