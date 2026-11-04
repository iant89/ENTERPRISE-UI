import { useEffect, useState } from 'react';
import { Button, Link, MessageStrip } from '@enterprise-ui/react';
import type { ChangeReport } from '../../model/store';
import styles from './CodeWorkspace.module.css';

export const SUCCESS_MS = 8000;

export interface RewriteFeedbackProps {
  report: ChangeReport | undefined;
  onUndo: () => void;
  onOpen: (path: string, line?: number) => void;
  onOpenProblems: () => void;
}

const REASON = { unresolved: 'did not resolve', dynamic: 'dynamic', alias: 'alias' } as const;
const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`;

/** Rename/move feedback (C2 mockup 05): success strip (auto-dismisses after 8 s) and a warning strip that stays. */
export function RewriteFeedback({ report, onUndo, onOpen, onOpenProblems }: RewriteFeedbackProps) {
  const [shown, setShown] = useState<{ success: number | null; warning: number | null }>({ success: null, warning: null });
  const [details, setDetails] = useState(false);
  useEffect(() => {
    if (!report) return;
    setShown({ success: report.id, warning: report.unresolved.length ? report.id : null });
    setDetails(false);
    const t = setTimeout(() => setShown((s) => (s.success === report.id ? { ...s, success: null } : s)), SUCCESS_MS);
    return () => clearTimeout(t);
  }, [report]);
  if (!report) return null;
  const name = report.to.slice(report.to.lastIndexOf('/') + 1);
  const where = report.verb === 'Moved' ? ` to ${report.to.slice(0, report.to.lastIndexOf('/') + 1) || 'the project root'}` : ` to ${name}`;
  const fromName = report.from.slice(report.from.lastIndexOf('/') + 1);
  return (
    <div className={styles.feedback} role="region" aria-label="File changes" aria-live="polite">
      {shown.success === report.id && (
        <MessageStrip
          tone="success"
          dismissible
          onDismiss={() => setShown((s) => ({ ...s, success: null }))}
          title={`${report.verb} ${fromName}${where}`}
          actions={<><Button size="sm" variant="tertiary" onClick={() => { setShown({ success: null, warning: null }); onUndo(); }}>Undo</Button>
            {report.files.length > 0 && <Button size="sm" variant="tertiary" aria-expanded={details} onClick={() => setDetails((d) => !d)}>{details ? 'Hide changes' : 'Show changes'}</Button>}</>}
        >
          {report.files.length ? `Updated imports in ${plural(report.files.length, 'file')}.` : 'No imports needed updating.'}
          {details && (
            <ul className={styles.feedbackList}>
              {report.files.map((f) => <li key={f.path}><Link href="#" onClick={(e) => { e.preventDefault(); onOpen(f.path); }}>{f.path}</Link> · {plural(f.count, 'import')}</li>)}
            </ul>
          )}
        </MessageStrip>
      )}
      {shown.warning === report.id && (
        <MessageStrip
          tone="warning"
          dismissible
          onDismiss={() => setShown((s) => ({ ...s, warning: null }))}
          title={`${plural(report.unresolved.length, 'import')} could not be updated`}
          actions={<Button size="sm" variant="tertiary" onClick={onOpenProblems}>Open in Problems</Button>}
        >
          These use paths Studio can't resolve safely. Fix them by hand:
          <ul className={styles.feedbackList}>
            {report.unresolved.map((u, i) => (
              <li key={i}>
                <Link href="#" onClick={(e) => { e.preventDefault(); onOpen(u.file, u.line); }}>{u.file}{u.line ? `:${u.line}` : ''}</Link>
                {' — '}<code>{u.specifier}</code> ({REASON[u.reason ?? 'unresolved']})
              </li>
            ))}
          </ul>
        </MessageStrip>
      )}
    </div>
  );
}
