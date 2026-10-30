import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utilities/cx';
import styles from './CalendarLegend.module.css';

export type CalendarLegendTone = 'neutral' | 'information' | 'success' | 'warning' | 'error';
export interface CalendarLegendItemProps extends Omit<HTMLAttributes<HTMLLIElement>, 'children'> {
  /** Text describing the calendar date type. */
  text: string;
  /** @default 'neutral' */
  tone?: CalendarLegendTone;
}
/** A labelled visual key for dates; color is never the only label. */
export const CalendarLegendItem = forwardRef<HTMLLIElement, CalendarLegendItemProps>(function CalendarLegendItem({ text, tone = 'neutral', className, ...rest }, ref) {
  return <li {...rest} ref={ref} className={cx(styles.item, className)}><span aria-hidden="true" className={cx(styles.swatch, styles[tone])} /><span>{text}</span></li>;
});

export interface CalendarLegendProps extends Omit<HTMLAttributes<HTMLUListElement>, 'children'> {
  /** Legend entries, normally CalendarLegendItem elements. */
  children: ReactNode;
  /** Accessible name of the legend. */
  'aria-label': string;
}
/** A list of labels explaining calendar markings. */
export const CalendarLegend = forwardRef<HTMLUListElement, CalendarLegendProps>(function CalendarLegend({ children, className, ...rest }, ref) {
  return <ul {...rest} ref={ref} className={cx(styles.legend, className)}>{children}</ul>;
});
