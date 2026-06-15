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
