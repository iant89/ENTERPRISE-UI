import { useEffect, useRef, type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { breakpoints } from '../../tokens';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { Button } from '../../components/button';
import { SplitView } from '../../layouts/split-view';
import styles from './MasterDetail.module.css';

export interface MasterDetailProps {
  /** The list of objects (master). */
  master: ReactNode;
  /** Details of the selected object. */
  detail: ReactNode;
  /** On phones only one pane shows: the detail when this is true. */
  showDetail?: boolean;
  /** Called by the phone back button to return to the master list. */
  onBack?: () => void;
  /** @default 360 */
  masterWidth?: number;
  /** Allow resizing the master pane. @default true */
  resizable?: boolean;
  /** @default 'List' */
  masterLabel?: string;
  /** @default 'Details' */
  detailLabel?: string;
  /** Label for the back button on phones. @default 'Back to list' */
  backLabel?: string;
  /** Pane-switching breakpoint (px). @default 1024 */
  collapseBelow?: number;
  /** @default true */
  bordered?: boolean;
  className?: string;
}

/**
 * Master–detail (list–detail) layout. Side by side on wide screens; on
 * smaller screens one pane at a time with a back button.
 */
export function MasterDetail({
  master, detail, showDetail = false, onBack, masterWidth = 360, resizable = true, masterLabel = 'List', detailLabel = 'Details',
  backLabel = 'Back to list', collapseBelow = breakpoints.md, bordered = true, className,
}: MasterDetailProps) {
  const narrow = useMediaQuery(`(max-width: ${collapseBelow - 1}px)`);
  const pane = useRef<HTMLElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  const previous = useRef({ narrow, showDetail });
  useEffect(() => {
    const before = previous.current;
    previous.current = { narrow, showDetail };
    if (!narrow || !before.narrow || before.showDetail === showDetail) return;
    if (showDetail) (back.current ?? pane.current)?.focus();
    else {
      const selected = pane.current?.querySelector<HTMLElement>('[role="option"][aria-selected="true"], [aria-current="page"]');
      const fallback = pane.current?.querySelector<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]');
      const selectedCanFocus = selected && (selected.hasAttribute('tabindex') || selected.matches('a[href], button, input, select, textarea'));
      (selectedCanFocus ? selected : fallback ?? pane.current)?.focus();
    }
  }, [narrow, showDetail]);

  if (narrow) {
    return (
      <div className={`${styles.root} ${className ?? ''}`}>
        {showDetail ? (
          <section ref={pane} tabIndex={-1} className={styles.pane} aria-label={detailLabel}>
            {onBack && (
              <div className={styles.backBar}>
                <Button ref={back} variant="tertiary" icon={<ArrowLeft />} onClick={onBack}>
                  {backLabel}
                </Button>
              </div>
            )}
            <div className={styles.paneBody}>{detail}</div>
          </section>
        ) : (
          <section ref={pane} tabIndex={-1} className={styles.pane} aria-label={masterLabel}>
            <div className={styles.paneBody}>{master}</div>
          </section>
        )}
      </div>
    );
  }

  return (
    <SplitView
      className={className}
      start={master}
      end={detail}
      startSize={masterWidth}
      resizable={resizable}
      minStartSize={240}
      maxStartSize={640}
      collapseBelow={0}
      bordered={bordered}
      startLabel={masterLabel}
      endLabel={detailLabel}
    />
  );
}
