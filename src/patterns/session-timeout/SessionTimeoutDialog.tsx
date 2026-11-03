import { useCallback, useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import { Button } from '../../components/button';
import { Dialog } from '../../components/dialog';
import styles from './SessionTimeoutDialog.module.css';

export interface UseIdleTimerOptions {
  /** Milliseconds without activity before `idle` becomes true. */
  timeout: number;
  /** Called once when the user becomes idle. */
  onIdle?: () => void;
  /** Activity events that reset the timer. @default pointer, key, wheel and touch events */
  events?: string[];
  /** Pauses the timer. @default true */
  enabled?: boolean;
}

/** Tracks user inactivity. Activity is throttled to once per second. */
export function useIdleTimer({ timeout, onIdle, events = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'], enabled = true }: UseIdleTimerOptions) {
  const [idle, setIdle] = useState(false);
  const lastActive = useRef(Date.now());
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const schedule = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setIdle(true);
      onIdleRef.current?.();
    }, timeout);
  }, [timeout]);

  const reset = useCallback(() => {
    lastActive.current = Date.now();
    setIdle(false);
    schedule();
  }, [schedule]);

  useEffect(() => {
    if (!enabled) {
      clearTimeout(timer.current);
      return;
    }
    schedule();
    let throttled = 0;
    const onActivity = () => {
      const now = Date.now();
      if (now - throttled < 1000) return;
      throttled = now;
      // Once idle, only an explicit reset (e.g. "Stay signed in") ends it.
      setIdle((wasIdle) => {
        if (!wasIdle) {
          lastActive.current = now;
          schedule();
        }
        return wasIdle;
      });
    };
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    return () => {
      clearTimeout(timer.current);
      events.forEach((e) => window.removeEventListener(e, onActivity));
    };
    // events is usually an inline array; its content is what matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, schedule, events.join()]);

  return { idle, reset, lastActive: lastActive.current };
}

export interface SessionTimeoutLabels {
  title: string;
  message: (time: string) => string;
  stay: string;
  signOut: string;
  /** Formats the remaining seconds, e.g. "1:45". */
  formatTime: (seconds: number) => string;
  /** Spoken countdown, announced every minute and at 30 and 10 seconds. */
  announcement: (seconds: number) => string;
}

export interface SessionTimeoutDialogProps {
  /** Inactivity before the warning appears, in milliseconds. */
  idleTimeout: number;
  /** Seconds the warning counts down before signing out. @default 120 */
  countdown?: number;
  /** Extends the session (call the server's keep-alive). The dialog closes and the timer restarts. */
  onStay?: () => void | Promise<void>;
  /** Signs the user out when they choose to or the countdown ends. */
  onSignOut: (reason: 'timeout' | 'user') => void;
  /** Turns the timer off, e.g. on public pages. @default true */
  enabled?: boolean;
  /** Overrides for the built-in strings. */
  labels?: Partial<SessionTimeoutLabels>;
}

const pad = (n: number) => String(n).padStart(2, '0');
const defaultLabels: SessionTimeoutLabels = {
  title: 'Your session is about to end',
  message: (time) => `For your security, you will be signed out in ${time} because you have been inactive. Unsaved changes may be lost.`,
  stay: 'Stay signed in',
  signOut: 'Sign out now',
  formatTime: (s) => `${Math.floor(s / 60)}:${pad(s % 60)}`,
  announcement: (s) => (s >= 60 ? `${Math.round(s / 60)} ${Math.round(s / 60) === 1 ? 'minute' : 'minutes'} left before sign-out` : `${s} seconds left before sign-out`),
};

/**
 * Warns before an inactive session ends and lets the user extend it (WCAG 2.2.1 Timing Adjustable).
 * The countdown is announced at intervals rather than every second.
 */
export function SessionTimeoutDialog({ idleTimeout, countdown = 120, onStay, onSignOut, enabled = true, labels: labelOverrides }: SessionTimeoutDialogProps) {
  const labels = { ...defaultLabels, ...labelOverrides };
  const { idle, reset } = useIdleTimer({ timeout: idleTimeout, enabled });
  const [remaining, setRemaining] = useState(countdown);
  const [busy, setBusy] = useState(false);
  const onSignOutRef = useRef(onSignOut);
  onSignOutRef.current = onSignOut;

  useEffect(() => {
    if (!idle) return;
    setRemaining(countdown);
    const deadline = Date.now() + countdown * 1000;
    // Computed from the deadline, so a throttled background tab still signs out on time.
    const id = setInterval(() => {
      const left = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        clearInterval(id);
        onSignOutRef.current('timeout');
      }
    }, 1000);
    return () => clearInterval(id);
  }, [idle, countdown]);

  const stay = async () => {
    setBusy(true);
    try {
      await onStay?.();
      reset();
    } finally {
      setBusy(false);
    }
  };

  const announce = remaining > 0 && (remaining % 60 === 0 || remaining === 30 || remaining === 10) ? labels.announcement(remaining) : null;
  const [spoken, setSpoken] = useState('');
  useEffect(() => {
    if (announce) setSpoken(announce);
  }, [announce]);

  return (
    <Dialog
      open={idle && enabled}
      onClose={() => void stay()}
      title={labels.title}
      role="alertdialog"
      tone="warning"
      size="sm"
      icon={<Clock />}
      closeOnOverlayClick={false}
      footer={
        <>
          <Button variant="tertiary" onClick={() => onSignOut('user')}>
            {labels.signOut}
          </Button>
          <Button variant="primary" loading={busy} onClick={() => void stay()}>
            {labels.stay}
          </Button>
        </>
      }
    >
      <p className={styles.message}>{labels.message(labels.formatTime(remaining))}</p>
      <p className={styles.timer} aria-hidden="true">
        {labels.formatTime(remaining)}
      </p>
      <span className="eui-visually-hidden" aria-live="polite">
        {spoken}
      </span>
    </Dialog>
  );
}
