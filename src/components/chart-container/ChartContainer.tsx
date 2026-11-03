import { forwardRef, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import { useMergedRefs } from '../../utilities/refs';
import { useId } from '../../hooks/useId';
import { ChartToolsContext } from '../chart-core/ChartToolsContext';
import { ChartToolbar, defaultToolbarLabels, useChartToolsState, type ChartToolbarLabels, type ChartToolOptions, type ChartToolsStateProps } from './chartTools';
import styles from './ChartContainer.module.css';

export interface ChartContainerProps extends ChartToolsStateProps, Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Title shown before the toolbar. */
  title?: ReactNode;
  /** Secondary line under the title. */
  subtitle?: ReactNode;
  /** Heading level of the title. @default 3 */
  headingLevel?: 2 | 3 | 4 | 5;
  /** Which tools to show; each defaults to `true`. */
  tools?: ChartToolOptions;
  /** Extra toolbar content, e.g. a measure selector. */
  actions?: ReactNode;
  /** One or more charts (LineChart, BarChart, DonutChart). They follow the toolbar's view and legend settings. */
  children: ReactNode;
  /** Overrides for the built-in strings. */
  labels?: Partial<ChartToolbarLabels>;
}

/**
 * A toolbar frame for charts: switch between chart and table, toggle the legend, download PNG or
 * JPEG images and CSV data, and expand to full screen with the charts filling it (Fiori ChartContainer).
 */
export const ChartContainer = forwardRef<HTMLElement, ChartContainerProps>(function ChartContainer(
  {
    title, subtitle, headingLevel = 3, tools = {}, actions, children, labels: labelOverrides,
    view, defaultView, onViewChange, showLegend, defaultShowLegend, onShowLegendChange, onDownload, onExportImage, downloadFileName,
    className, ...rest
  },
  ref,
) {
  const labels = { ...defaultToolbarLabels, ...labelOverrides };
  const rootRef = useRef<HTMLElement>(null);
  const merged = useMergedRefs(ref, rootRef);
  const titleId = useId(undefined, 'chart-container');
  const state = useChartToolsState(
    { view, defaultView, onViewChange, showLegend, defaultShowLegend, onShowLegendChange, onDownload, onExportImage, downloadFileName },
    rootRef,
    typeof title === 'string' ? title : '',
  );
  const Heading = `h${headingLevel}` as const;
  return (
    <section ref={merged} className={cx(styles.container, state.inPageFullscreen && styles.expanded, state.fullscreen && styles.fullscreen, className)} aria-labelledby={title ? titleId : undefined} {...rest}>
      <div className={styles.header}>
        {(title || subtitle) && (
          <div className={styles.titles}>
            {title && (
              <Heading id={titleId} className={styles.title}>
                {title}
              </Heading>
            )}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
        )}
        {actions}
        <ChartToolbar state={state} tools={tools} labels={labels} />
      </div>
      <ChartToolsContext.Provider value={state.context}>
        <div className={styles.body}>{children}</div>
      </ChartToolsContext.Provider>
    </section>
  );
});
