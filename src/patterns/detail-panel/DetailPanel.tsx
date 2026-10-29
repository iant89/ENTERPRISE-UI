import { useRef, type CSSProperties, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cx } from '../../utilities/cx';
import { Portal } from '../../utilities/Portal';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollLock } from '../../hooks/useScrollLock';
import { useId } from '../../hooks/useId';
import { IconButton } from '../../components/icon-button';
import styles from './DetailPanel.module.css';

export interface DetailPanelProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Actions in the header (next to the close button). */
  headerActions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  /** Panel width (CSS length). @default '28rem' */
  width?: string;
  /**
   * `overlay` slides in over the page as a modal side sheet; `inline` renders
   * in the layout flow (e.g. as the end column of a SplitView).
   * @default 'overlay'
   */
  mode?: 'overlay' | 'inline';
  className?: string;
}

/**
 * Side panel showing details of a selected object without leaving the page.
 * In overlay mode it is modal: focus is trapped and restored on close.
 */
export function DetailPanel({ open, onClose, title, subtitle, headerActions, footer, children, width = '28rem', mode = 'overlay', className }: DetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId(undefined, 'detail-title');
  const overlay = mode === 'overlay';
  useFocusTrap(panelRef, open && overlay);
  useScrollLock(open && overlay);
  if (!open) return null;

  const panel = (
    <div
      ref={panelRef}
      role={overlay ? 'dialog' : 'region'}
      aria-modal={overlay || undefined}
      aria-labelledby={titleId}
      tabIndex={-1}
      className={cx(styles.panel, !overlay && styles.inline, className)}
      style={{ '--_width': width } as CSSProperties}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onClose();
        }
      }}
    >
      <div className={styles.header}>
        <div className={styles.titles}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        <div className={styles.headerActions}>
          {headerActions}
          <IconButton icon={<X />} label="Close details" neutral onClick={onClose} />
        </div>
      </div>
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );

  if (!overlay) return panel;
  return (
    <Portal>
      <div className={styles.overlay} onClick={onClose} />
      {panel}
    </Portal>
  );
}
