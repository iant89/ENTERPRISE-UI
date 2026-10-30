import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import styles from './FlexibleColumnLayout.module.css';

export type FlexibleColumnLayoutMode =
  | 'OneColumn'
  | 'TwoColumnsStartExpanded'
  | 'TwoColumnsMidExpanded'
  | 'ThreeColumnsMidExpanded'
  | 'ThreeColumnsEndExpanded'
  | 'MidColumnFullScreen'
  | 'EndColumnFullScreen';

export interface FlexibleColumnLayoutProps extends HTMLAttributes<HTMLDivElement> {
  startColumn: ReactNode;
  midColumn?: ReactNode;
  endColumn?: ReactNode;
  /** Application-controlled layout (list → detail → detail-detail). @default 'OneColumn' */
  layout?: FlexibleColumnLayoutMode;
  /** Localized column region names. */
  labels?: { start: string; mid: string; end: string };
}

type Widths = [number, number, number];
const widths: Record<FlexibleColumnLayoutMode, Widths> = {
  OneColumn: [100, 0, 0],
  TwoColumnsStartExpanded: [67, 33, 0],
  TwoColumnsMidExpanded: [33, 67, 0],
  ThreeColumnsMidExpanded: [25, 50, 25],
  ThreeColumnsEndExpanded: [25, 25, 50],
  MidColumnFullScreen: [0, 100, 0],
  EndColumnFullScreen: [0, 0, 100],
};

/** Returns visible column percentages for a layout at a breakpoint (phones show one column, tablets at most two). */
export function getColumnWidths(layout: FlexibleColumnLayoutMode, breakpoint: 'sm' | 'md' | 'lg' | 'xl'): Widths {
  const w = widths[layout];
  const last = w[2] ? 2 : w[1] ? 1 : 0;
  if (breakpoint === 'sm') return [0, 1, 2].map((i) => (i === last ? 100 : 0)) as Widths;
  if (breakpoint === 'md' && w[0] && w[1] && w[2]) return [0, layout === 'ThreeColumnsEndExpanded' ? 33 : 67, layout === 'ThreeColumnsEndExpanded' ? 67 : 33];
  return w;
}

/** List–detail–detail layout with up to three columns, adapting to screen size. */
export const FlexibleColumnLayout = forwardRef<HTMLDivElement, FlexibleColumnLayoutProps>(function FlexibleColumnLayout(
  { startColumn, midColumn, endColumn, layout = 'OneColumn', labels = { start: 'List', mid: 'Details', end: 'Further details' }, className, ...rest },
  ref,
) {
  const bp = useBreakpoint();
  const [a, b, c] = getColumnWidths(layout, bp);
  const columns: [number, ReactNode, string][] = [[a, startColumn, labels.start], [b, midColumn, labels.mid], [c, endColumn, labels.end]];
  return (
    <div ref={ref} className={cx(styles.root, className)} {...rest}>
      {columns.map(([width, content, label], i) =>
        width > 0 && content != null ? (
          <section key={i} aria-label={label} className={styles.column} style={{ flexBasis: `${width}%` }}>{content}</section>
        ) : null,
      )}
    </div>
  );
});
