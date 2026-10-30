import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { parseISODate } from '../../utilities/date';

export type SpecialCalendarDateType = 'none' | 'information' | 'success' | 'warning' | 'error';

export interface CalendarDateProps {
  /** Selected day as `YYYY-MM-DD`. Invalid dates are ignored. */
  value: string;
}
/** Marks a day as selected inside Calendar. The application owns the selection. */
export function CalendarDate(_props: CalendarDateProps): null {
  return null;
}

export interface CalendarDateRangeProps {
  /** First day of the inclusive range, as `YYYY-MM-DD`. */
  startValue: string;
  /** Last day of the inclusive range, as `YYYY-MM-DD`. */
  endValue: string;
}
/**
 * Marks an inclusive range inside Calendar. A reversed range is swapped.
 * Days announce that they belong to the range.
 */
export function CalendarDateRange(_props: CalendarDateRangeProps): null {
  return null;
}

export interface SpecialCalendarDateProps {
  /** Day to mark, as `YYYY-MM-DD`. */
  value: string;
  /** Visual tone. Meaning must also be given in `label`. @default 'none' */
  type?: SpecialCalendarDateType;
  /** Text added to the day's accessible name. */
  label?: string;
}
/** Marks one calendar day with a tone and a text label. Color is not the only cue. */
export function SpecialCalendarDate(_props: SpecialCalendarDateProps): null {
  return null;
}

export interface CalendarMarkers {
  selected: Date[];
  ranges: { start: Date; end: Date }[];
  special: { date: Date; type: SpecialCalendarDateType; label?: string }[];
}

/** Reads calendar marker elements. Unknown children are ignored. */
export function readCalendarMarkers(children: ReactNode): CalendarMarkers {
  const markers: CalendarMarkers = { selected: [], ranges: [], special: [] };
  const visit = (nodes: ReactNode) => {
    Children.forEach(nodes, (node) => {
      if (!isValidElement(node)) return;
      if (node.type === Fragment) {
        visit((node.props as { children?: ReactNode }).children);
        return;
      }
      if (node.type === CalendarDate) {
        const date = parseISODate(String((node.props as CalendarDateProps).value ?? ''));
        if (date) markers.selected.push(date);
      } else if (node.type === CalendarDateRange) {
        const props = node.props as CalendarDateRangeProps;
        const start = parseISODate(String(props.startValue ?? ''));
        const end = parseISODate(String(props.endValue ?? ''));
        if (start && end) markers.ranges.push(start.getTime() <= end.getTime() ? { start, end } : { start: end, end: start });
      } else if (node.type === SpecialCalendarDate) {
        const props = node.props as SpecialCalendarDateProps;
        const date = parseISODate(String(props.value ?? ''));
        if (date) markers.special.push({ date, type: props.type ?? 'none', label: props.label });
      }
    });
  };
  visit(children);
  return markers;
}
