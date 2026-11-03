import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { axeViolations, renderWithTheme } from '../../../tests/utils';
import { PlanningCalendar, type PlanningAppointment, type PlanningCalendarProps } from './PlanningCalendar';
import { assignLanes, getRange } from './time';

// Wednesday 4 November 2026, 10:00 local time.
const now = new Date(2026, 10, 4, 10);
const at = (day: number, hour = 0) => new Date(2026, 10, day, hour);
const rows = [
  { id: 'crane', title: 'Crane 1', subtitle: 'Yard A' },
  { id: 'fork', title: 'Forklift 3' },
  { id: 'truck', title: 'Truck 7' },
];
const initial: PlanningAppointment[] = [
  { id: 'a', rowId: 'crane', start: at(3), end: at(5), title: 'Inspection' },
  { id: 'b', rowId: 'crane', start: at(6), end: at(7), title: 'Lift' },
  { id: 'c', rowId: 'fork', start: at(4), end: at(5), title: 'Service', tone: 'warning' },
  { id: 'd', rowId: 'truck', start: at(2), end: at(3), title: 'Delivery', locked: true },
];

function Harness(props: Partial<PlanningCalendarProps>) {
  const [appointments, setAppointments] = useState(initial);
  return (
    <PlanningCalendar
      label="Equipment plan"
      rows={rows}
      appointments={appointments}
      now={now}
      locale="en-US"
      onAppointmentChange={(c) => setAppointments((list) => list.map((a) => (a.id === c.appointment.id ? { ...a, rowId: c.rowId, start: c.start, end: c.end } : a)))}
      {...props}
    />
  );
}
const appt = (name: RegExp) => screen.getByRole('button', { name });

describe('time helpers', () => {
  it('builds week, month and day ranges', () => {
    const week = getRange('week', now, { weekStartsOn: 1, dayStartHour: 6, dayEndHour: 20, now });
    expect(week.start).toEqual(at(2));
    expect(week.columns).toHaveLength(7);
    expect(week.columns.find((c) => c.today)?.start).toEqual(at(4));
    expect(week.columns.filter((c) => c.weekend)).toHaveLength(2);
    expect(getRange('month', now, { weekStartsOn: 1, dayStartHour: 6, dayEndHour: 20, now }).columns).toHaveLength(30);
    const day = getRange('day', now, { weekStartsOn: 1, dayStartHour: 8, dayEndHour: 18, now });
    expect([day.start, day.end, day.columns.length]).toEqual([at(4, 8), at(4, 18), 10]);
  });

  it('stacks overlapping items into lanes', () => {
    const { lanes, count } = assignLanes([{ start: at(1), end: at(3) }, { start: at(2), end: at(4) }, { start: at(3), end: at(5) }]);
    expect(lanes.map((l) => l.lane)).toEqual([0, 1, 0]);
    expect(count).toBe(2);
  });
});

describe('PlanningCalendar', () => {
  it('renders resources as grid rows with appointments named by title, time and status', async () => {
    const { container } = renderWithTheme(<Harness />);
    const grid = screen.getByRole('grid', { name: 'Nov 2 – Nov 8, 2026' });
    const [, crane] = within(grid).getAllByRole('row');
    expect(within(crane).getByRole('rowheader')).toHaveTextContent('Crane 1Yard A');
    expect(within(crane).getAllByRole('button').map((b) => b.textContent)).toEqual(['InspectionTue, Nov 3 – Wed, Nov 4', 'LiftFri, Nov 6']);
    expect(appt(/Delivery/)).toHaveTextContent(', locked');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('is one tab stop and moves between appointments with the arrow keys', async () => {
    const { user } = renderWithTheme(<Harness />);
    await user.tab();
    await user.tab();
    await user.tab();
    await user.tab();
    // Previous, Today, Next, view switcher, then the grid.
    while (!document.activeElement?.closest('[role="grid"]')) await user.tab();
    expect(appt(/^Inspection/)).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(appt(/^Lift/)).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    // Nearest in time on the next row.
    expect(appt(/^Service/)).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(appt(/^Delivery/)).toHaveFocus();
    await user.keyboard('{Control>}{Home}{/Control}');
    expect(appt(/^Inspection/)).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('grid').contains(document.activeElement)).toBe(false);
  });

  it('moves and resizes an appointment with the keyboard and announces each step', async () => {
    const onAppointmentChange = vi.fn();
    const { user } = renderWithTheme(<Harness onAppointmentChange={onAppointmentChange} />);
    appt(/^Lift/).focus();
    await user.keyboard('m');
    expect(appt(/^Lift/)).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Moving Lift.');
    await user.keyboard('{ArrowRight}{ArrowDown}{Shift>}{ArrowRight}{/Shift}');
    expect(screen.getByRole('status')).toHaveTextContent('Lift: Sat, Nov 7 – Sun, Nov 8, Forklift 3.');
    await user.keyboard('{Enter}');
    expect(onAppointmentChange).toHaveBeenCalledWith({ appointment: initial[1], rowId: 'fork', start: at(7), end: at(9) });
    expect(screen.getByRole('status')).toHaveTextContent('Moved Lift to Sat, Nov 7 – Sun, Nov 8, Forklift 3.');
  });

  it('cancels a move with Escape and does not move locked appointments', async () => {
    const onAppointmentChange = vi.fn();
    const { user } = renderWithTheme(<Harness onAppointmentChange={onAppointmentChange} />);
    appt(/^Lift/).focus();
    await user.keyboard('m{ArrowLeft}{Escape}');
    expect(screen.getByRole('status')).toHaveTextContent('Move of Lift cancelled.');
    expect(appt(/^Lift/)).toHaveTextContent('Fri, Nov 6');
    appt(/^Delivery/).focus();
    await user.keyboard('m{ArrowRight}{Enter}');
    expect(onAppointmentChange).not.toHaveBeenCalled();
  });

  it('rejects changes with canChange and announces the reason', async () => {
    const onAppointmentChange = vi.fn();
    const { user } = renderWithTheme(<Harness onAppointmentChange={onAppointmentChange} canChange={(c) => (c.rowId === 'truck' ? 'Trucks cannot lift.' : true)} />);
    appt(/^Service/).focus();
    await user.keyboard('m{ArrowDown}{Enter}');
    expect(onAppointmentChange).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('Trucks cannot lift.');
  });

  it('switches periods and views from the toolbar', async () => {
    const onSelect = vi.fn();
    const { user } = renderWithTheme(<Harness onAppointmentSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: 'Next period' }));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Nov 9 – Nov 15, 2026');
    expect(screen.queryByRole('button', { name: /Inspection/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Today' }));
    await user.click(screen.getByRole('button', { name: 'Day' }));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Wednesday, November 4, 2026');
    await user.click(appt(/^Inspection/));
    expect(onSelect).toHaveBeenCalledWith(initial[0]);
    await user.click(screen.getByRole('button', { name: 'Month' }));
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('November 2026');
  });
});
