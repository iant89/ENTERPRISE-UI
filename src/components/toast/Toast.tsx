import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { Portal } from '../../utilities/Portal';
import { useAnnouncer } from '../../themes/ThemeProvider';
import type { Tone } from '../../utilities/types';
import { Button } from '../button';
import { IconButton } from '../icon-button';
import styles from './Toast.module.css';

export interface ToastOptions {
  title: ReactNode;
  description?: ReactNode;
  /** @default 'neutral' */
  tone?: Tone;
  /** Auto-dismiss delay in ms; `0` keeps it until dismissed. Errors default to 0. @default 5000 */
  duration?: number;
  /** Optional single action. */
  action?: { label: string; onClick: () => void };
  /** Supply an id to update or dedupe a toast. */
  id?: string;
}

interface ToastRecord extends ToastOptions {
  id: string;
}

export interface ToastApi {
  /** Shows a toast and returns its id. */
  show: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export interface ToastProviderProps {
  children: ReactNode;
  /** @default 'bottom-center' */
  position?: 'bottom-center' | 'bottom-end' | 'top-end';
  /** Maximum visible toasts. @default 4 */
  limit?: number;
}

const ICONS = { neutral: Info, information: Info, success: CheckCircle2, warning: AlertTriangle, error: XCircle } as const;

function ToastItem({ toast, onDismiss }: { toast: ToastRecord; onDismiss: (id: string) => void }) {
  const tone = toast.tone ?? 'neutral';
  const duration = toast.duration ?? (tone === 'error' ? 0 : 5000);
  // Hover and keyboard focus pause independently, so moving the pointer away does not dismiss a toast that still has focus.
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hovered || focused;
  const remaining = useRef(duration);
  const started = useRef(Date.now());

  useEffect(() => {
    if (!duration || paused) return;
    started.current = Date.now();
    const timer = setTimeout(() => onDismiss(toast.id), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - started.current;
    };
  }, [paused, duration, toast.id, onDismiss]);

  const Icon = ICONS[tone];
  return (
    <li
      className={cx(styles.toast, styles[tone])}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}
    >
      <span className={styles.icon} aria-hidden="true">
        <Icon />
      </span>
      <div className={styles.content}>
        <span className={styles.title}>{toast.title}</span>
        {toast.description && <span className={styles.description}>{toast.description}</span>}
        {toast.action && (
          <Button
            className={styles.action}
            size="sm"
            variant="tertiary"
            onClick={() => {
              toast.action?.onClick();
              onDismiss(toast.id);
            }}
          >
            {toast.action.label}
          </Button>
        )}
      </div>
      <IconButton className={styles.close} icon={<X />} label="Dismiss notification" size="sm" neutral onClick={() => onDismiss(toast.id)} />
    </li>
  );
}


/**
 * Hosts transient notifications, announced through the ThemeProvider live region. Toasts pause while hovered or focused;
 * errors stay until dismissed. Use {@link useToast} to show them.
 */
export function ToastProvider({ children, position = 'bottom-center', limit = 4 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const announce = useAnnouncer();
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => setToasts((all) => all.filter((t) => t.id !== id)), []);
  const show = useCallback(
    (options: ToastOptions) => {
      const id = options.id ?? `toast-${++counter.current}`;
      setToasts((all) => [...all.filter((t) => t.id !== id), { ...options, id }].slice(-limit));
      // Announce through the persistent live region; inserted live regions are unreliable.
      const text = [options.title, options.description].filter((part) => typeof part === 'string').join('. ');
      if (text) announce(text, options.tone === 'error' ? 'assertive' : 'polite');
      return id;
    },
    [limit, announce],
  );
  const dismissAll = useCallback(() => setToasts([]), []);
  const api = useMemo(() => ({ show, dismiss, dismissAll }), [show, dismiss, dismissAll]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toasts.length > 0 && (
        <Portal>
          <section aria-label="Notifications">
            <ol className={cx(styles.region, styles[position])}>
              {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
              ))}
            </ol>
          </section>
        </Portal>
      )}
    </ToastContext.Provider>
  );
}

/** Returns the toast API. Must be used inside a {@link ToastProvider}. */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a <ToastProvider>.');
  return ctx;
}
