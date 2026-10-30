import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { breakpoints } from '../../tokens';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { ResizablePanel } from '../resizable-panel';
import styles from './SplitView.module.css';

export interface SplitViewProps extends HTMLAttributes<HTMLDivElement> {
  /** First pane (left / top). */
  start: ReactNode;
  /** Second pane (right / bottom). */
  end: ReactNode;
  /** @default 'horizontal' */
  /** Layout direction. */
  orientation?: 'horizontal' | 'vertical';
  /** Size of the start pane in px (or any CSS length when not resizable). @default 320 */
  startSize?: number | string;
  /** Let the user resize the start pane. @default false */
  resizable?: boolean;
  /** @default 200 */
  /** Smallest size of the start pane, in pixels. */
  minStartSize?: number;
  /** @default 640 */
  /** Largest size of the start pane, in pixels. */
  maxStartSize?: number;
  /** Called with the new start size when it changes. */
  onStartSizeChange?: (size: number) => void;
  /** Stack panes vertically below this width (px); `0` never stacks. @default 600 */
  collapseBelow?: number;
  /** @default false */
  /** Draws a border around the component. */
  bordered?: boolean;
  /** Accessible labels for the panes (rendered as regions). */
  startLabel?: string;
  /** Accessible name of the end pane. */
  endLabel?: string;
}

/** Two panes side by side (or stacked), optionally resizable. */
export const SplitView = forwardRef<HTMLDivElement, SplitViewProps>(function SplitView(
  {
    start, end, orientation = 'horizontal', startSize = 320, resizable = false, minStartSize = 200, maxStartSize = 640,
    onStartSizeChange, collapseBelow = breakpoints.sm, bordered = false, startLabel, endLabel, className, ...rest
  },
  ref,
) {
  const stacked = useMediaQuery(`(max-width: ${Math.max(collapseBelow - 1, 0)}px)`) && collapseBelow > 0;
  const horizontal = orientation === 'horizontal';
  const sizeStyle: CSSProperties = horizontal ? { width: startSize } : { height: startSize };
  // Labelled panes are focusable regions so keyboard users can scroll them.
  const regionProps = (label?: string) => (label ? { role: 'region', 'aria-label': label, tabIndex: 0 } : {});

  return (
    <div ref={ref} className={cx(styles.split, !horizontal && styles.vertical, stacked && styles.stacked, bordered && styles.bordered, className)} {...rest}>
      {resizable && typeof startSize === 'number' && !stacked ? (
        <ResizablePanel
          className={styles.start}
          handle={horizontal ? 'end' : 'bottom'}
          defaultSize={startSize}
          minSize={minStartSize}
          maxSize={maxStartSize}
          onResize={onStartSizeChange}
          handleLabel={`Resize ${startLabel ?? 'panes'}`}
          focusableContent={!!startLabel}
          {...(startLabel ? { role: 'region', 'aria-label': startLabel } : {})}
        >
          {start}
        </ResizablePanel>
      ) : (
        <div className={styles.start} style={stacked ? undefined : sizeStyle} {...regionProps(startLabel)}>
          {start}
        </div>
      )}
      <div className={styles.end} {...regionProps(endLabel)}>
        {end}
      </div>
    </div>
  );
});
