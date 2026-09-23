// Config for the manufacturing_ai_agent integration: the 5 demo machines,
// their sensor display config, and the mapping between this OEE app's
// numeric machine ids (1-5, see src/app/data/staticData.ts) and the
// agent backend's machine ids (M-101..M-105).

export interface SensorConfig {
  key: string;
  label: string;
  unit: string;
}

export interface AgentMachine {
  id: string; // agent-side id, e.g. "M-101"
  oeeId: number; // this app's numeric machine id, e.g. 1
  name: string;
  sensors: SensorConfig[];
}

export const AGENT_MACHINES: AgentMachine[] = [
  {
    id: 'M-101',
    oeeId: 1,
    name: 'CNC Lathe',
    sensors: [
      { key: 'spindle_temperature_c', label: 'SPINDLE TEMP', unit: '°C' },
      { key: 'vibration_mm_s', label: 'VIBRATION', unit: 'mm/s' },
      { key: 'spindle_load_pct', label: 'SPINDLE LOAD', unit: '%' },
      { key: 'coolant_flow_lpm', label: 'COOLANT FLOW', unit: 'L/min' },
    ],
  },
  {
    id: 'M-102',
    oeeId: 2,
    name: 'CNC Milling Machine',
    sensors: [
      { key: 'temperature_c', label: 'TEMP', unit: '°C' },
      { key: 'vibration_mm_s', label: 'VIBRATION', unit: 'mm/s' },
      { key: 'spindle_load_pct', label: 'SPINDLE LOAD', unit: '%' },
      { key: 'coolant_temperature_c', label: 'COOLANT TEMP', unit: '°C' },
    ],
  },
  {
    id: 'M-103',
    oeeId: 3,
    name: 'Robotic Welding Cell',
    sensors: [
      { key: 'joint3_servo_temperature_c', label: 'JOINT-3 SERVO TEMP', unit: '°C' },
      { key: 'joint_vibration_mm_s', label: 'JOINT VIBRATION', unit: 'mm/s' },
      { key: 'wire_feed_tension_n', label: 'WIRE FEED TENSION', unit: 'N' },
      { key: 'shielding_gas_flow_lpm', label: 'SHIELD GAS FLOW', unit: 'L/min' },
    ],
  },
  {
    id: 'M-104',
    oeeId: 4,
    name: 'Injection Molding Machine',
    sensors: [
      { key: 'barrel_zone2_temperature_c', label: 'BARREL ZONE-2 TEMP', unit: '°C' },
      { key: 'hydraulic_pressure_bar', label: 'HYDRAULIC PRESSURE', unit: 'bar' },
      { key: 'cycle_time_variance_pct', label: 'CYCLE TIME VAR.', unit: '%' },
      { key: 'screw_vibration_mm_s', label: 'SCREW VIBRATION', unit: 'mm/s' },
    ],
  },
  {
    id: 'M-105',
    oeeId: 5,
    name: 'Hydraulic Stamping Press',
    sensors: [
      { key: 'hydraulic_oil_temperature_c', label: 'OIL TEMP', unit: '°C' },
      { key: 'ram_vibration_mm_s', label: 'RAM VIBRATION', unit: 'mm/s' },
      { key: 'hydraulic_pressure_bar', label: 'HYDRAULIC PRESSURE', unit: 'bar' },
      { key: 'die_alignment_deviation_mm', label: 'DIE ALIGNMENT DEV.', unit: 'mm' },
    ],
  },
];

export const AGENT_BY_OEE_ID: Record<number, AgentMachine> = Object.fromEntries(
  AGENT_MACHINES.map((m) => [m.oeeId, m]),
);
export const AGENT_BY_ID: Record<string, AgentMachine> = Object.fromEntries(
  AGENT_MACHINES.map((m) => [m.id, m]),
);

export type MachineStatus =
  | 'normal'
  | 'abnormal'
  | 'investigating'
  | 'open'
  | 'approved'
  | 'approved_critical';

// Any status other than 'normal' means the machine should be shown as
// in error/attention-needed everywhere it's displayed in the OEE app.
export const ERROR_STATUSES = new Set<MachineStatus>([
  'abnormal',
  'investigating',
  'open',
  'approved',
  'approved_critical',
]);

export const STATUS_LABEL: Record<MachineStatus, string> = {
  normal: 'Normal',
  abnormal: 'Abnormal',
  investigating: 'Investigating',
  open: 'Auto-Approving…',
  approved: 'Work Order Open',
  approved_critical: 'Critical — Escalated & Open',
};

// No longer used to address the automated emails -- see the Recipients
// page / recipientsApi in agentApi.ts, which now drive who gets emailed.
// Left here in case VITE_NOTIFY_TO_EMAIL is still referenced elsewhere.
export const NOTIFY_TO_EMAIL =
  import.meta.env.VITE_NOTIFY_TO_EMAIL || 'maintenance-lead@example.com';
export const AUTO_APPROVER_NAME =
  import.meta.env.VITE_AUTO_APPROVER_NAME || 'Automated Approval Workflow';
