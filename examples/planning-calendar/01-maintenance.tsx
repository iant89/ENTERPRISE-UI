import { useState } from 'react';
import { Avatar, PlanningCalendar, type PlanningAppointment } from '@enterprise-ui/react';

export const title = 'Maintenance plan';
export const description = 'Drag an order to reschedule it or to move it to another machine, or drag its end to change the length. With the keyboard: Tab into the plan, use the arrow keys to pick an order, press M, move it with the arrow keys (Shift + Left or Right changes the end) and press Enter. `canChange` stops work on a machine that is out of service; locked orders cannot move.';

const today = new Date();
const day = (offset: number, hour = 0) => {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour);
  return d;
};
// Start of the current week (Monday).
const monday = (today.getDay() + 6) % 7;
const w = (weekday: number, hour = 0) => day(weekday - monday, hour);

const rows = [
  { id: 'press', title: 'Press line 1', subtitle: 'Plant Nord', avatar: <Avatar name="Press line" size="sm" /> },
  { id: 'cnc', title: 'CNC mill 4', subtitle: 'Plant Nord', avatar: <Avatar name="CNC mill" size="sm" /> },
  { id: 'robot', title: 'Welding robot 2', subtitle: 'Plant Süd', avatar: <Avatar name="Welding robot" size="sm" /> },
  { id: 'crane', title: 'Gantry crane', subtitle: 'Out of service', avatar: <Avatar name="Gantry crane" size="sm" /> },
];

const initial: PlanningAppointment[] = [
  { id: 'm1', rowId: 'press', start: w(0), end: w(2), title: 'Hydraulic overhaul', description: 'MO-4471' },
  { id: 'm2', rowId: 'press', start: w(1), end: w(2), title: 'Safety inspection', tone: 'warning', description: 'Due by Wednesday' },
  { id: 'm3', rowId: 'cnc', start: w(2), end: w(3), title: 'Spindle replacement', description: 'MO-4480' },
  { id: 'm4', rowId: 'robot', start: w(3), end: w(5), title: 'Calibration', tone: 'success', description: 'Vendor on site' },
  { id: 'm5', rowId: 'crane', start: w(0), end: w(7), title: 'Out of service', tone: 'error', locked: true, description: 'Waiting for parts' },
  { id: 'm6', rowId: 'cnc', start: w(4), end: w(5), title: 'Coolant change' },
];

export default function MaintenancePlan() {
  const [appointments, setAppointments] = useState(initial);
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <PlanningCalendar
        label="Maintenance plan"
        rows={rows}
        appointments={appointments}
        defaultView="week"
        onAppointmentSelect={(a) => setSelected(`${a.title}${a.description ? ` (${a.description})` : ''}`)}
        canChange={(c) => (c.rowId === 'crane' ? 'The gantry crane is out of service.' : true)}
        onAppointmentChange={(c) =>
          setAppointments((list) => list.map((a) => (a.id === c.appointment.id ? { ...a, rowId: c.rowId, start: c.start, end: c.end } : a)))
        }
      />
      {selected && <p style={{ margin: 0 }}>Selected: {selected}</p>}
    </div>
  );
}
