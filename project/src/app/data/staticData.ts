// Shared static demo data used across the OEE dashboard

export const STATIC_MACHINES = [
  { id: 1, machine_id: 1, machine_name: 'Machine 1', name: 'Machine 1', status: 'Running', production: 1245, oee: 87.2 },
  { id: 2, machine_id: 2, machine_name: 'Machine 2', name: 'Machine 2', status: 'Running', production: 1189, oee: 82.5 },
  { id: 3, machine_id: 3, machine_name: 'Machine 3', name: 'Machine 3', status: 'Idle', production: 956, oee: 71.3 },
  { id: 4, machine_id: 4, machine_name: 'Machine 4', name: 'Machine 4', status: 'Error', production: 423, oee: 45.8 },
  { id: 5, machine_id: 5, machine_name: 'Machine 5', name: 'Machine 5', status: 'Running', production: 1567, oee: 91.4 },
];

export const MACHINE_NAMES = STATIC_MACHINES.map(m => m.name);

export const ACTIVE_SHIFT = {
  name: 'Shift A',
  startTime: '06:00',
  endTime: '14:00',
  label: 'Shift A · 06:00 – 14:00',
};

export const STATIC_SHIFTS = [
  {
    id: 1,
    name: 'Shift A',
    startTime: '06:00',
    stopTime: '14:00',
    breaks: [
      { id: 1, name: 'Tea Break', startTime: '09:30', stopTime: '09:45' },
      { id: 2, name: 'Lunch', startTime: '12:00', stopTime: '12:30' },
    ],
  },
  {
    id: 2,
    name: 'Shift B',
    startTime: '14:00',
    stopTime: '22:00',
    breaks: [
      { id: 3, name: 'Tea Break', startTime: '17:00', stopTime: '17:15' },
      { id: 4, name: 'Dinner', startTime: '19:00', stopTime: '19:30' },
    ],
  },
  {
    id: 3,
    name: 'Shift C',
    startTime: '22:00',
    stopTime: '06:00',
    breaks: [
      { id: 5, name: 'Midnight Break', startTime: '01:00', stopTime: '01:15' },
    ],
  },
];

export const STATIC_CONFIG_MACHINES = [
  {
    id: 1,
    name: 'Machine 1',
    parameters: { running_bit: 10001, production_register: 40001, scrap_register: 40002 },
    errors: [
      { id: 1, error_name: 'Emergency Stop', error_bit: 10010 },
      { id: 2, error_name: 'Tool Break', error_bit: 10011 },
    ],
  },
  {
    id: 2,
    name: 'Machine 2',
    parameters: { running_bit: 10002, production_register: 40003, scrap_register: 40004 },
    errors: [
      { id: 3, error_name: 'Material Shortage', error_bit: 10012 },
    ],
  },
  {
    id: 3,
    name: 'Machine 3',
    parameters: { running_bit: 10003, production_register: 40005, scrap_register: 40006 },
    errors: [
      { id: 4, error_name: 'Over Temperature', error_bit: 10013 },
      { id: 5, error_name: 'Door Open', error_bit: 10014 },
      { id: 6, error_name: 'Low Pressure', error_bit: 10015 },
    ],
  },
  {
    id: 4,
    name: 'Machine 4',
    parameters: { running_bit: 10004, production_register: 40007, scrap_register: 40008 },
    errors: [
      { id: 7, error_name: 'Servo Fault', error_bit: 10016 },
    ],
  },
  {
    id: 5,
    name: 'Machine 5',
    parameters: { running_bit: 10005, production_register: 40009, scrap_register: 40010 },
    errors: [
      { id: 8, error_name: 'Spindle Overload', error_bit: 10017 },
      { id: 9, error_name: 'Coolant Low', error_bit: 10018 },
    ],
  },
];

export const STATIC_TARGETS = [
  { id: 1, shift: 1, shift_name: 'Shift A', machine: { id: 1, name: 'Machine 1' }, machine_id: 1, target_quantity: 800 },
  { id: 2, shift: 1, shift_name: 'Shift A', machine: { id: 2, name: 'Machine 2' }, machine_id: 2, target_quantity: 750 },
  { id: 3, shift: 2, shift_name: 'Shift B', machine: { id: 1, name: 'Machine 1' }, machine_id: 1, target_quantity: 700 },
  { id: 4, shift: 2, shift_name: 'Shift B', machine: { id: 3, name: 'Machine 3' }, machine_id: 3, target_quantity: 650 },
  { id: 5, shift: 3, shift_name: 'Shift C', machine: { id: 5, name: 'Machine 5' }, machine_id: 5, target_quantity: 900 },
  { id: 6, shift: 3, shift_name: 'Shift C', machine: { id: 4, name: 'Machine 4' }, machine_id: 4, target_quantity: 600 },
];

export interface AlarmReportRow {
  machine: string;
  alarm: string;
  occurrences: number;
  totalDuration: number;
  lastTriggered: string;
}

const BASE_ALARM_ROWS: AlarmReportRow[] = [
  { machine: 'Machine 1', alarm: 'Emergency Stop', occurrences: 3, totalDuration: 45, lastTriggered: '2026-06-08 11:23' },
  { machine: 'Machine 1', alarm: 'Tool Break', occurrences: 2, totalDuration: 28, lastTriggered: '2026-06-07 14:10' },
  { machine: 'Machine 2', alarm: 'Material Shortage', occurrences: 5, totalDuration: 82, lastTriggered: '2026-06-08 09:45' },
  { machine: 'Machine 3', alarm: 'Over Temperature', occurrences: 4, totalDuration: 56, lastTriggered: '2026-06-08 13:02' },
  { machine: 'Machine 3', alarm: 'Door Open', occurrences: 8, totalDuration: 24, lastTriggered: '2026-06-08 10:15' },
  { machine: 'Machine 4', alarm: 'Servo Fault', occurrences: 6, totalDuration: 120, lastTriggered: '2026-06-07 16:30' },
  { machine: 'Machine 5', alarm: 'Spindle Overload', occurrences: 2, totalDuration: 35, lastTriggered: '2026-06-08 08:50' },
  { machine: 'Machine 5', alarm: 'Coolant Low', occurrences: 3, totalDuration: 18, lastTriggered: '2026-06-06 22:40' },
];

export function getRangeMultiplier(rangeType: string, startDate?: string, endDate?: string): number {
  if (rangeType === 'last_month') return 4;
  if (rangeType === 'last_6_months') return 24;
  if (rangeType === 'custom' && startDate && endDate) {
    const days = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000));
    return Math.max(1, Math.round(days / 7));
  }
  return 1;
}

export function getAlarmReportData(multiplier: number, machineFilter: string): AlarmReportRow[] {
  const rows = machineFilter === 'All Machines'
    ? BASE_ALARM_ROWS
    : BASE_ALARM_ROWS.filter(r => r.machine === machineFilter);
  return rows.map(r => ({
    ...r,
    occurrences: Math.round(r.occurrences * multiplier),
    totalDuration: Math.round(r.totalDuration * multiplier),
  }));
}

export function getReportMachineRows(multiplier: number) {
  return STATIC_MACHINES.map(m => ({
    machine: m.name,
    production: Math.round(m.production * 2 * multiplier),
    scrap: Math.round(20 * multiplier + m.id * 3),
    downtime: Math.round(50 * multiplier + m.id * 12),
    oee: m.oee,
  }));
}

// ─── Per-machine shift detail (Dashboard + Machine Detail) ───────────────────

export interface MachineShiftData {
  kpi: { performance: number; quality: number; availability: number; oee: number };
  production: { time: string; production: number; scrap: number }[];
  downtimeTop3: { reason: string; duration: number; color: string }[];
  downtimeBreakdown: { reason: string; duration: number }[];
  shift: { target: number; actual: number; accepted: number; rejected: number };
}

const DOWNTIME_COLORS = ['#ef4444', '#f97316', '#eab308', '#6366f1', '#10b981'];

export const MACHINE_SHIFT_DATA: Record<string, MachineShiftData> = {
  'Machine 1': {
    kpi: { performance: 93.5, quality: 95.2, availability: 97.8, oee: 87.2 },
    production: [
      { time: '06:00', production: 38, scrap: 2 }, { time: '07:00', production: 45, scrap: 1 },
      { time: '08:00', production: 52, scrap: 3 }, { time: '09:00', production: 61, scrap: 2 },
      { time: '10:00', production: 58, scrap: 4 }, { time: '11:00', production: 72, scrap: 2 },
      { time: '12:00', production: 65, scrap: 3 }, { time: '13:00', production: 78, scrap: 1 },
      { time: '14:00', production: 82, scrap: 5 },
    ],
    downtimeTop3: [
      { reason: 'Tool Wear', duration: 20, color: DOWNTIME_COLORS[0] },
      { reason: 'Changeover', duration: 15, color: DOWNTIME_COLORS[1] },
      { reason: 'Quality Issue', duration: 10, color: DOWNTIME_COLORS[2] },
    ],
    downtimeBreakdown: [
      { reason: 'Tool Wear', duration: 20 },
      { reason: 'Changeover', duration: 15 },
      { reason: 'Quality Issue', duration: 10 },
    ],
    shift: { target: 800, actual: 551, accepted: 522, rejected: 29 },
  },
  'Machine 2': {
    kpi: { performance: 90.2, quality: 96.2, availability: 94.8, oee: 82.5 },
    production: [
      { time: '06:00', production: 42, scrap: 1 }, { time: '07:00', production: 50, scrap: 2 },
      { time: '08:00', production: 55, scrap: 1 }, { time: '09:00', production: 63, scrap: 3 },
      { time: '10:00', production: 70, scrap: 2 }, { time: '11:00', production: 68, scrap: 1 },
      { time: '12:00', production: 74, scrap: 2 }, { time: '13:00', production: 80, scrap: 2 },
      { time: '14:00', production: 77, scrap: 3 },
    ],
    downtimeTop3: [
      { reason: 'Machine Breakdown', duration: 40, color: DOWNTIME_COLORS[0] },
      { reason: 'Material Shortage', duration: 25, color: DOWNTIME_COLORS[1] },
      { reason: 'Quality Check', duration: 18, color: DOWNTIME_COLORS[2] },
    ],
    downtimeBreakdown: [
      { reason: 'Machine Breakdown', duration: 40 },
      { reason: 'Material Shortage', duration: 25 },
      { reason: 'Quality Check', duration: 18 },
    ],
    shift: { target: 750, actual: 579, accepted: 557, rejected: 22 },
  },
  'Machine 3': {
    kpi: { performance: 78.4, quality: 88.5, availability: 86.2, oee: 71.3 },
    production: [
      { time: '06:00', production: 30, scrap: 3 }, { time: '07:00', production: 35, scrap: 4 },
      { time: '08:00', production: 28, scrap: 5 }, { time: '09:00', production: 40, scrap: 3 },
      { time: '10:00', production: 45, scrap: 4 }, { time: '11:00', production: 38, scrap: 6 },
      { time: '12:00', production: 42, scrap: 3 }, { time: '13:00', production: 50, scrap: 4 },
      { time: '14:00', production: 44, scrap: 5 },
    ],
    downtimeTop3: [
      { reason: 'Over Temperature', duration: 30, color: DOWNTIME_COLORS[0] },
      { reason: 'Door Open', duration: 12, color: DOWNTIME_COLORS[1] },
      { reason: 'Maintenance', duration: 8, color: DOWNTIME_COLORS[2] },
    ],
    downtimeBreakdown: [
      { reason: 'Over Temperature', duration: 30 },
      { reason: 'Door Open', duration: 12 },
      { reason: 'Maintenance', duration: 8 },
    ],
    shift: { target: 700, actual: 352, accepted: 311, rejected: 41 },
  },
  'Machine 4': {
    kpi: { performance: 55.8, quality: 79.4, availability: 68.5, oee: 45.8 },
    production: [
      { time: '06:00', production: 20, scrap: 5 }, { time: '07:00', production: 15, scrap: 7 },
      { time: '08:00', production: 0, scrap: 0 }, { time: '09:00', production: 22, scrap: 6 },
      { time: '10:00', production: 18, scrap: 8 }, { time: '11:00', production: 0, scrap: 0 },
      { time: '12:00', production: 25, scrap: 5 }, { time: '13:00', production: 30, scrap: 4 },
      { time: '14:00', production: 12, scrap: 9 },
    ],
    downtimeTop3: [
      { reason: 'Servo Fault', duration: 55, color: DOWNTIME_COLORS[0] },
      { reason: 'Electrical Fault', duration: 22, color: DOWNTIME_COLORS[1] },
      { reason: 'Waiting Technician', duration: 15, color: DOWNTIME_COLORS[2] },
    ],
    downtimeBreakdown: [
      { reason: 'Servo Fault', duration: 55 },
      { reason: 'Electrical Fault', duration: 22 },
      { reason: 'Waiting Technician', duration: 15 },
    ],
    shift: { target: 600, actual: 142, accepted: 113, rejected: 29 },
  },
  'Machine 5': {
    kpi: { performance: 96.3, quality: 97.8, availability: 97.1, oee: 91.4 },
    production: [
      { time: '06:00', production: 60, scrap: 1 }, { time: '07:00', production: 68, scrap: 1 },
      { time: '08:00', production: 72, scrap: 2 }, { time: '09:00', production: 75, scrap: 1 },
      { time: '10:00', production: 80, scrap: 2 }, { time: '11:00', production: 85, scrap: 1 },
      { time: '12:00', production: 82, scrap: 1 }, { time: '13:00', production: 88, scrap: 2 },
      { time: '14:00', production: 91, scrap: 1 },
    ],
    downtimeTop3: [
      { reason: 'Changeover', duration: 18, color: DOWNTIME_COLORS[0] },
      { reason: 'Coolant Low', duration: 12, color: DOWNTIME_COLORS[1] },
      { reason: 'Tool Change', duration: 8, color: DOWNTIME_COLORS[2] },
    ],
    downtimeBreakdown: [
      { reason: 'Changeover', duration: 18 },
      { reason: 'Coolant Low', duration: 12 },
      { reason: 'Tool Change', duration: 8 },
    ],
    shift: { target: 900, actual: 701, accepted: 687, rejected: 14 },
  },
};

export function getMachineShiftData(name: string): MachineShiftData {
  return MACHINE_SHIFT_DATA[name] ?? MACHINE_SHIFT_DATA['Machine 1'];
}

export function getMachineShiftDataById(id: number): MachineShiftData {
  const machine = STATIC_MACHINES.find(m => m.machine_id === id);
  return getMachineShiftData(machine?.name ?? 'Machine 1');
}

export function formatDowntimeDuration(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
