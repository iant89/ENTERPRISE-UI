import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cx } from '../../utilities/cx';
import type { Tone } from '../../utilities/types';
import { useControllableState } from '../../hooks/useControllableState';
import { useId } from '../../hooks/useId';
import { useIsoLayoutEffect } from '../../hooks/useEventCallback';
import { Button } from '../../components/button';
import { IconButton } from '../../components/icon-button';
import { SegmentedButton } from '../../components/segmented-button';
import { toneColor, toneSubtle } from '../../components/chart-core/palette';
import { DAY, MINUTE, assignLanes, getRange, shiftDate, startOfDay, toDate, type PlanningView } from './time';
import styles from './PlanningCalendar.module.css';

export type { PlanningView } from './time';

export interface PlanningRow {
  id: string;
  /** Resource name, such as a person, machine, vehicle or room. */
  title: string;
  /** Secondary text, such as a role or location. */
  subtitle?: ReactNode;
  /** Avatar or icon shown before the title. */
  avatar?: ReactNode;
}

export interface PlanningAppointment {
  id: string;
  rowId: string;
  start: Date | string | number;
  end: Date | string | number;
  title: string;
  /** Extra text shown under the title and read with it. */
  description?: string;
  /** Status color. Explain it in `title` or `description` too. @default 'information' */
  tone?: Tone;
  /** Prevents moving and resizing this appointment. @default false */
  locked?: boolean;
}

export interface PlanningChange {
  appointment: PlanningAppointment;
  rowId: string;
  start: Date;
  end: Date;
}

export interface PlanningCalendarLabels {
  previous: string;
  next: string;
  today: string;
  views: Record<PlanningView, string>;
  resources: string;
  moveInstructions: string;
  pickedUp: (title: string) => string;
  position: (title: string, when: string, row: string) => string;
  dropped: (title: string, when: string, row: string) => string;
  cancelled: (title: string) => string;
  noAppointments: string;
}

export interface PlanningCalendarProps {
  rows: PlanningRow[];
  appointments: PlanningAppointment[];
  /** Accessible name, such as "Maintenance plan". */
  label: string;
  /** Date the view shows. Providing it makes it controlled. */
  date?: Date;
  /** @default today */
  defaultDate?: Date;
  onDateChange?: (date: Date) => void;
  /** Controlled view. */
  view?: PlanningView;
  /** @default 'week' */
  defaultView?: PlanningView;
  onViewChange?: (view: PlanningView) => void;
  /** Views offered in the toolbar. @default ['day', 'week', 'month'] */
  views?: PlanningView[];
  /** First hour shown in the day view. @default 6 */
  dayStartHour?: number;
  /** Hour the day view ends (exclusive). @default 20 */
  dayEndHour?: number;
  /** First day of the week, 0 = Sunday. @default 1 */
  weekStartsOn?: number;
  /** Minutes an appointment moves per arrow key or drag step. Defaults to 30 in the day view and a day otherwise. */
  snapMinutes?: number;
  /** BCP 47 locale for dates and times. Defaults to the browser locale. */
  locale?: string;
  /** Called when the user activates an appointment (click, Enter). */
  onAppointmentSelect?: (appointment: PlanningAppointment) => void;
  /**
   * Called when the user moves or resizes an appointment with the pointer or
   * keyboard. Update `appointments` to accept the change. Without it,
   * appointments cannot be moved.
   */
  onAppointmentChange?: (change: PlanningChange) => void;
  /** Rejects a change before it is made. Return a message to explain why, or `true` to allow it. */
  canChange?: (change: PlanningChange) => true | string;
  /** Current time, for the today marker and "Today". @default new Date() */
  now?: Date;
  /** Overrides for the built-in strings. */
  labels?: Partial<PlanningCalendarLabels>;
  className?: string;
}

const defaultLabels: PlanningCalendarLabels = {
  previous: 'Previous period',
  next: 'Next period',
  today: 'Today',
  views: { day: 'Day', week: 'Week', month: 'Month' },
  resources: 'Resource',
  moveInstructions: 'Press M to move. While moving: arrow keys move, Shift + Left or Right changes the end, Enter drops, Escape cancels.',
  pickedUp: (title) => `Moving ${title}. Arrow keys move, Shift + Left or Right changes the end, Enter drops, Escape cancels.`,
  position: (title, when, row) => `${title}: ${when}, ${row}.`,
  dropped: (title, when, row) => `Moved ${title} to ${when}, ${row}.`,
  cancelled: (title) => `Move of ${title} cancelled.`,
  noAppointments: 'No appointments',
};

interface Placed {
  appointment: PlanningAppointment;
  start: Date;
  end: Date;
  rowId: string;
}

interface Draft {
  id: string;
  rowId: string;
  start: Date;
  end: Date;
  source: 'keyboard' | 'pointer';
}

/**
 * Resource planning over time: rows of people, machines, vehicles or rooms,
 * with appointments as bars across hours (day) or days (week, month).
 * Overlapping appointments stack. Appointments can be moved and resized by
 * dragging, or with the keyboard: focus one, press M, then use the arrow keys.
 * The grid is one tab stop; arrow keys move between appointments.
 */
export function PlanningCalendar({
  rows, appointments, label, date, defaultDate, onDateChange, view, defaultView = 'week', onViewChange, views = ['day', 'week', 'month'],
  dayStartHour = 6, dayEndHour = 20, weekStartsOn = 1, snapMinutes, locale, onAppointmentSelect, onAppointmentChange, canChange, now: nowProp, labels: overrides, className,
}: PlanningCalendarProps) {
  const labels = { ...defaultLabels, ...overrides, views: { ...defaultLabels.views, ...overrides?.views } };
  const now = useMemo(() => nowProp ?? new Date(), [nowProp]);
  const [current, setDate] = useControllableState(date, defaultDate ?? now, onDateChange);
  const [currentView, setView] = useControllableState(view, defaultView, onViewChange);
  const id = useId(undefined, 'planning');
  const range = useMemo(() => getRange(currentView, current, { weekStartsOn, dayStartHour, dayEndHour, now }), [currentView, current, weekStartsOn, dayStartHour, dayEndHour, now]);
  const span = range.end.getTime() - range.start.getTime();
  const snap = (snapMinutes ?? (currentView === 'day' ? 30 : 1440)) * MINUTE;
  const editable = !!onAppointmentChange;

  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [message, setMessage] = useState('');
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const tracks = useRef(new Map<string, HTMLDivElement>());
  const suppressClick = useRef(false);

  const time = (d: Date) => d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  const dayLabel = (d: Date) => d.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' });
  const when = (start: Date, end: Date) => {
    const sameDay = startOfDay(start).getTime() === startOfDay(new Date(end.getTime() - 1)).getTime();
    const allDay = start.getHours() === 0 && start.getMinutes() === 0 && end.getHours() === 0 && end.getMinutes() === 0;
    if (allDay) return sameDay ? dayLabel(start) : `${dayLabel(start)} – ${dayLabel(new Date(end.getTime() - DAY))}`;
    return sameDay ? `${dayLabel(start)}, ${time(start)}–${time(end)}` : `${dayLabel(start)} ${time(start)} – ${dayLabel(end)} ${time(end)}`;
  };
  const rowTitle = (rowId: string) => rows.find((r) => r.id === rowId)?.title ?? rowId;

  // Appointments with the draft applied, grouped by row, limited to the visible range.
  const placed: Placed[] = appointments.map((a) => {
    const d = draft?.id === a.id ? draft : null;
    return { appointment: a, start: d ? d.start : toDate(a.start), end: d ? d.end : toDate(a.end), rowId: d ? d.rowId : a.rowId };
  });
  const visible = placed.filter((p) => p.end > range.start && p.start < range.end && p.end > p.start);
  const byRow = new Map(rows.map((r) => [r.id, assignLanes(visible.filter((p) => p.rowId === r.id))]));
  // Navigation order: by row, then by start.
  const order = rows.flatMap((r) => (byRow.get(r.id)?.lanes ?? []).map((l) => l.item).sort((a, b) => a.start.getTime() - b.start.getTime()));
  const tabStop = order.find((p) => p.appointment.id === focusedId)?.appointment.id ?? order[0]?.appointment.id;

  // Focus is applied after render, because moving to another row remounts the button.
  const pendingFocus = useRef<string | null>(null);
  const focus = (appointmentId: string) => {
    setFocusedId(appointmentId);
    pendingFocus.current = appointmentId;
    buttons.current.get(appointmentId)?.focus();
  };
  useIsoLayoutEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    const el = buttons.current.get(target);
    if (el && document.activeElement !== el) el.focus();
  });

  const check = (change: PlanningChange): true | string => (canChange ? canChange(change) : true);

  const commit = (p: Placed, next: { rowId: string; start: Date; end: Date }) => {
    const change: PlanningChange = { appointment: p.appointment, rowId: next.rowId, start: next.start, end: next.end };
    const allowed = check(change);
    setDraft(null);
    if (allowed !== true) {
      setMessage(allowed);
      return false;
    }
    const unchanged = next.rowId === p.appointment.rowId && next.start.getTime() === toDate(p.appointment.start).getTime() && next.end.getTime() === toDate(p.appointment.end).getTime();
    if (!unchanged) onAppointmentChange?.(change);
    setMessage(labels.dropped(p.appointment.title, when(next.start, next.end), rowTitle(next.rowId)));
    return true;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, p: Placed) => {
    const a = p.appointment;
    const moving = draft?.id === a.id && draft.source === 'keyboard';
    if (moving && draft) {
      const rowIndex = rows.findIndex((r) => r.id === draft.rowId);
      let next: Draft | null = null;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        const dir = event.key === 'ArrowRight' ? 1 : -1;
        if (event.shiftKey) {
          const end = new Date(draft.end.getTime() + dir * snap);
          if (end.getTime() - draft.start.getTime() >= snap) next = { ...draft, end };
        } else next = { ...draft, start: new Date(draft.start.getTime() + dir * snap), end: new Date(draft.end.getTime() + dir * snap) };
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        const target = rows[rowIndex + (event.key === 'ArrowDown' ? 1 : -1)];
        if (target) next = { ...draft, rowId: target.id };
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        commit(p, draft);
        focus(a.id);
        return;
      } else if (event.key === 'Escape') {
        event.preventDefault();
        setDraft(null);
        setMessage(labels.cancelled(a.title));
        return;
      } else if (event.key === 'Tab') {
        setDraft(null);
        setMessage(labels.cancelled(a.title));
        return;
      }
      if (next || event.key.startsWith('Arrow')) event.preventDefault();
      if (next) {
        setDraft(next);
        setMessage(labels.position(a.title, when(next.start, next.end), rowTitle(next.rowId)));
        focus(a.id);
      }
      return;
    }

    const inRow = order.filter((o) => o.rowId === p.rowId);
    const rowPos = inRow.findIndex((o) => o.appointment.id === a.id);
    let target: Placed | undefined;
    if (event.key === 'ArrowRight') target = inRow[rowPos + 1];
    else if (event.key === 'ArrowLeft') target = inRow[rowPos - 1];
    else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const step = event.key === 'ArrowDown' ? 1 : -1;
      const rowIdx = rows.findIndex((r) => r.id === p.rowId);
      for (let r = rowIdx + step; r >= 0 && r < rows.length && !target; r += step) {
        const candidates = order.filter((o) => o.rowId === rows[r].id);
        // Nearest appointment in time on the next row that has any.
        target = candidates.sort((x, y) => Math.abs(x.start.getTime() - p.start.getTime()) - Math.abs(y.start.getTime() - p.start.getTime()))[0];
      }
    } else if (event.key === 'Home') target = event.ctrlKey ? order[0] : inRow[0];
    else if (event.key === 'End') target = event.ctrlKey ? order[order.length - 1] : inRow[inRow.length - 1];
    else if ((event.key === 'm' || event.key === 'M') && editable && !a.locked && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      setDraft({ id: a.id, rowId: p.rowId, start: p.start, end: p.end, source: 'keyboard' });
      setMessage(labels.pickedUp(a.title));
      return;
    }
    if (target) {
      event.preventDefault();
      focus(target.appointment.id);
    } else if (event.key.startsWith('Arrow') || event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
    }
  };

  // Pointer drags are tracked on the window: the button remounts when it crosses
  // into another row, which would drop pointer capture on the element.
  const commitRef = useRef(commit);
  commitRef.current = commit;
  const onPointerDown = (event: PointerEvent<HTMLElement>, p: Placed, mode: 'move' | 'resize') => {
    if (!editable || p.appointment.locked || event.button !== 0) return;
    const track = tracks.current.get(p.rowId);
    if (!track) return;
    event.stopPropagation();
    const x = event.clientX;
    const y = event.clientY;
    const width = Math.max(track.getBoundingClientRect().width, 1);
    const origStart = toDate(p.appointment.start);
    const origEnd = toDate(p.appointment.end);
    let moved = false;
    let latest: Draft | null = null;
    const onMove = (e: globalThis.PointerEvent) => {
      const dx = e.clientX - x;
      if (!moved && Math.abs(dx) < 4 && Math.abs(e.clientY - y) < 4) return;
      moved = true;
      const delta = Math.round(((dx / width) * span) / snap) * snap;
      let rowId = p.appointment.rowId;
      if (mode === 'move') {
        const under = document.elementFromPoint?.(e.clientX, e.clientY)?.closest<HTMLElement>('[data-planning-row]');
        if (under?.dataset.planningRow) rowId = under.dataset.planningRow;
      }
      latest = mode === 'move'
        ? { id: p.appointment.id, rowId, start: new Date(origStart.getTime() + delta), end: new Date(origEnd.getTime() + delta), source: 'pointer' }
        : { id: p.appointment.id, rowId, start: origStart, end: new Date(Math.max(origStart.getTime() + snap, origEnd.getTime() + delta)), source: 'pointer' };
      setDraft(latest);
    };
    const stop = (e: globalThis.PointerEvent) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
      if (e.type === 'pointercancel' || !moved || !latest) {
        setDraft(null);
        return;
      }
      suppressClick.current = true;
      // A click may not follow if the button moved; clear the guard on the next tick.
      setTimeout(() => { suppressClick.current = false; }, 0);
      commitRef.current(p, latest);
      focus(p.appointment.id);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
  };

  const pct = (d: Date) => ((Math.min(Math.max(d.getTime(), range.start.getTime()), range.end.getTime()) - range.start.getTime()) / span) * 100;
  const nowPct = now >= range.start && now < range.end ? pct(now) : null;
  const heading =
    currentView === 'day'
      ? current.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : currentView === 'month'
        ? current.toLocaleDateString(locale, { year: 'numeric', month: 'long' })
        : `${range.start.toLocaleDateString(locale, { month: 'short', day: 'numeric' })} – ${new Date(range.end.getTime() - DAY).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  const columnLabel = (c: { start: Date }) =>
    currentView === 'day'
      ? c.start.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
      : currentView === 'week'
        ? c.start.toLocaleDateString(locale, { weekday: 'short', day: 'numeric' })
        : String(c.start.getDate());
  const minWidth = range.columns.length * (currentView === 'day' ? 4 : currentView === 'week' ? 5.5 : 2.25);

  return (
    <section className={cx(styles.root, className)} aria-label={label} style={{ '--_cols': range.columns.length, '--_timeline-min': `${minWidth}rem` } as CSSProperties}>
      <div className={styles.toolbar}>
        <div className={styles.nav}>
          <IconButton icon={<ChevronLeft />} label={labels.previous} variant="tertiary" onClick={() => setDate(shiftDate(currentView, current, -1))} />
          <Button size="sm" onClick={() => setDate(now)}>{labels.today}</Button>
          <IconButton icon={<ChevronRight />} label={labels.next} variant="tertiary" onClick={() => setDate(shiftDate(currentView, current, 1))} />
          <h2 id={`${id}-heading`} className={styles.heading} aria-live="polite">{heading}</h2>
        </div>
        {views.length > 1 && (
          <SegmentedButton
            size="sm"
            aria-label="View"
            items={views.map((v) => ({ value: v, label: labels.views[v] }))}
            value={[currentView]}
            onChange={(value) => value[0] && setView(value[0] as PlanningView)}
          />
        )}
      </div>
      <div className={styles.scroller}>
        <div role="grid" aria-labelledby={`${id}-heading`} aria-describedby={editable ? `${id}-help` : undefined} aria-rowcount={rows.length + 1} aria-colcount={2} className={styles.grid}>
          <div role="row" aria-rowindex={1} className={cx(styles.row, styles.headerRow)}>
            <div role="columnheader" className={styles.resourceHeader}>{labels.resources}</div>
            <div role="columnheader" className={styles.scale}>
              <span className="eui-visually-hidden">{heading}</span>
              {range.columns.map((c) => (
                <span key={c.start.getTime()} aria-hidden="true" className={cx(styles.tick, c.weekend && styles.weekend, c.today && styles.todayTick)}>
                  {columnLabel(c)}
                </span>
              ))}
            </div>
          </div>
          {rows.map((row, rowIndex) => {
            const { lanes, count } = byRow.get(row.id)!;
            return (
              <div key={row.id} role="row" aria-rowindex={rowIndex + 2} className={styles.row}>
                <div role="rowheader" className={styles.resource}>
                  {row.avatar && <span className={styles.avatar}>{row.avatar}</span>}
                  <span className={styles.resourceText}>
                    <span className={styles.resourceTitle}>{row.title}</span>
                    {row.subtitle && <span className={styles.resourceSubtitle}>{row.subtitle}</span>}
                  </span>
                </div>
                <div
                  role="gridcell"
                  data-planning-row={row.id}
                  ref={(el) => { if (el) tracks.current.set(row.id, el); else tracks.current.delete(row.id); }}
                  className={cx(styles.track, draft?.rowId === row.id && styles.dropTarget)}
                  style={{ '--_lanes': count } as CSSProperties}
                >
                  <div className={styles.columns} aria-hidden="true">
                    {range.columns.map((c) => <span key={c.start.getTime()} className={cx(styles.column, c.weekend && styles.weekend, c.today && styles.todayColumn)} />)}
                  </div>
                  {nowPct != null && <span className={styles.now} style={{ insetInlineStart: `${nowPct}%` }} aria-hidden="true" />}
                  {lanes.length === 0 && <span className="eui-visually-hidden">{labels.noAppointments}</span>}
                  {lanes.map(({ item: p, lane }) => {
                    const a = p.appointment;
                    const left = pct(p.start);
                    const width = Math.max(pct(p.end) - left, 0.5);
                    const isDraft = draft?.id === a.id;
                    const tone = a.tone ?? 'information';
                    return (
                      <button
                        key={a.id}
                        type="button"
                        ref={(el) => { if (el) buttons.current.set(a.id, el); else buttons.current.delete(a.id); }}
                        className={cx(styles.appointment, isDraft && styles.moving, a.locked && styles.locked, p.start < range.start && styles.clipStart, p.end > range.end && styles.clipEnd)}
                        style={{ insetInlineStart: `${left}%`, width: `${width}%`, top: `calc(${lane} * var(--_lane-h) + var(--eui-space-1))`, '--_tone': toneColor(tone), '--_tone-bg': toneSubtle(tone) } as CSSProperties}
                        tabIndex={a.id === tabStop ? 0 : -1}
                        aria-pressed={isDraft && draft?.source === 'keyboard' ? true : undefined}
                        onFocus={() => setFocusedId(a.id)}
                        onBlur={() => { if (draft?.id === a.id && draft.source === 'keyboard') { setDraft(null); setMessage(labels.cancelled(a.title)); } }}
                        onKeyDown={(event) => onKeyDown(event, p)}
                        onClick={() => {
                          if (suppressClick.current) { suppressClick.current = false; return; }
                          onAppointmentSelect?.(a);
                        }}
                        onPointerDown={(event) => onPointerDown(event, p, 'move')}
                      >
                        <span className={styles.apptTitle}>{a.title}</span>
                        <span className={styles.apptTime}>{when(p.start, p.end)}</span>
                        {a.description && <span className={styles.apptTime}>{a.description}</span>}
                        {a.locked && <span className="eui-visually-hidden">, locked</span>}
                        {editable && !a.locked && (
                          <span
                            className={styles.resize}
                            aria-hidden="true"
                            onPointerDown={(event) => onPointerDown(event, p, 'resize')}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {editable && <p id={`${id}-help`} className={styles.help}>{labels.moveInstructions}</p>}
      <div className="eui-visually-hidden" role="status" aria-live="polite">{message}</div>
    </section>
  );
}
