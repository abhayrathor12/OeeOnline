import React, { useState } from 'react';
import { Activity, Package, TrendingUp, Clock, Zap, CheckCircle, AlertCircle, Target, ChevronDown } from 'lucide-react';
import { Card } from '../components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '../components/ui/badge';
import { STATIC_MACHINES, ACTIVE_SHIFT } from '../data/staticData';

// ─── Static Data ───────────────────────────────────────────────────────────────

const machines = STATIC_MACHINES.map(m => ({
  id: m.id,
  name: m.name,
  status: m.status,
  production: m.production,
  oee: m.oee,
}));

const machineData: Record<string, {
  kpi: { performance: number; quality: number; availability: number; oee: number };
  production: { time: string; production: number; scrap: number }[];
  downtime: { reason: string; duration: number; color: string }[];
  shift: { target: number; actual: number; accepted: number; rejected: number };
}> = {
  'Machine 1': {
    kpi: { performance: 92.1, quality: 94.7, availability: 89.3, oee: 75.6 },
    production: [
      { time: '06:00', production: 38, scrap: 2 }, { time: '07:00', production: 45, scrap: 1 },
      { time: '08:00', production: 52, scrap: 3 }, { time: '09:00', production: 61, scrap: 2 },
      { time: '10:00', production: 58, scrap: 4 }, { time: '11:00', production: 72, scrap: 2 },
      { time: '12:00', production: 65, scrap: 3 }, { time: '13:00', production: 78, scrap: 1 },
      { time: '14:00', production: 82, scrap: 5 },
    ],
    downtime: [
      { reason: 'Material Shortage', duration: 145, color: '#ef4444' },
      { reason: 'Machine Breakdown', duration: 98, color: '#f97316' },
      { reason: 'Changeover', duration: 67, color: '#eab308' },
    ],
    shift: { target: 800, actual: 551, accepted: 522, rejected: 29 },
  },
  'Machine 2': {
    kpi: { performance: 88.4, quality: 96.2, availability: 91.0, oee: 82.5 },
    production: [
      { time: '06:00', production: 42, scrap: 1 }, { time: '07:00', production: 50, scrap: 2 },
      { time: '08:00', production: 55, scrap: 1 }, { time: '09:00', production: 63, scrap: 3 },
      { time: '10:00', production: 70, scrap: 2 }, { time: '11:00', production: 68, scrap: 1 },
      { time: '12:00', production: 74, scrap: 2 }, { time: '13:00', production: 80, scrap: 2 },
      { time: '14:00', production: 77, scrap: 3 },
    ],
    downtime: [
      { reason: 'Changeover', duration: 110, color: '#ef4444' },
      { reason: 'Quality Check', duration: 75, color: '#f97316' },
      { reason: 'Operator Break', duration: 40, color: '#eab308' },
    ],
    shift: { target: 750, actual: 579, accepted: 557, rejected: 22 },
  },
  'Machine 3': {
    kpi: { performance: 74.2, quality: 88.5, availability: 76.1, oee: 71.3 },
    production: [
      { time: '06:00', production: 30, scrap: 3 }, { time: '07:00', production: 35, scrap: 4 },
      { time: '08:00', production: 28, scrap: 5 }, { time: '09:00', production: 40, scrap: 3 },
      { time: '10:00', production: 45, scrap: 4 }, { time: '11:00', production: 38, scrap: 6 },
      { time: '12:00', production: 42, scrap: 3 }, { time: '13:00', production: 50, scrap: 4 },
      { time: '14:00', production: 44, scrap: 5 },
    ],
    downtime: [
      { reason: 'Machine Breakdown', duration: 200, color: '#ef4444' },
      { reason: 'Material Shortage', duration: 130, color: '#f97316' },
      { reason: 'Maintenance', duration: 90, color: '#eab308' },
    ],
    shift: { target: 700, actual: 352, accepted: 311, rejected: 41 },
  },
  'Machine 4': {
    kpi: { performance: 52.3, quality: 79.4, availability: 61.8, oee: 45.8 },
    production: [
      { time: '06:00', production: 20, scrap: 5 }, { time: '07:00', production: 15, scrap: 7 },
      { time: '08:00', production: 0, scrap: 0 }, { time: '09:00', production: 22, scrap: 6 },
      { time: '10:00', production: 18, scrap: 8 }, { time: '11:00', production: 0, scrap: 0 },
      { time: '12:00', production: 25, scrap: 5 }, { time: '13:00', production: 30, scrap: 4 },
      { time: '14:00', production: 12, scrap: 9 },
    ],
    downtime: [
      { reason: 'Machine Breakdown', duration: 320, color: '#ef4444' },
      { reason: 'Electrical Fault', duration: 180, color: '#f97316' },
      { reason: 'Waiting Technician', duration: 95, color: '#eab308' },
    ],
    shift: { target: 600, actual: 142, accepted: 113, rejected: 29 },
  },
  'Machine 5': {
    kpi: { performance: 96.3, quality: 97.8, availability: 93.5, oee: 91.4 },
    production: [
      { time: '06:00', production: 60, scrap: 1 }, { time: '07:00', production: 68, scrap: 1 },
      { time: '08:00', production: 72, scrap: 2 }, { time: '09:00', production: 75, scrap: 1 },
      { time: '10:00', production: 80, scrap: 2 }, { time: '11:00', production: 85, scrap: 1 },
      { time: '12:00', production: 82, scrap: 1 }, { time: '13:00', production: 88, scrap: 2 },
      { time: '14:00', production: 91, scrap: 1 },
    ],
    downtime: [
      { reason: 'Planned Maintenance', duration: 60, color: '#ef4444' },
      { reason: 'Tool Change', duration: 35, color: '#f97316' },
      { reason: 'Quality Inspection', duration: 20, color: '#eab308' },
    ],
    shift: { target: 900, actual: 701, accepted: 687, rejected: 14 },
  },
};

const kpiConfig = [
  { key: 'performance' as const, label: 'Performance', color: '#6366f1', trackColor: '#6366f120', icon: Zap },
  { key: 'quality' as const, label: 'Quality', color: '#10b981', trackColor: '#10b98120', icon: CheckCircle },
  { key: 'availability' as const, label: 'Availability', color: '#3b82f6', trackColor: '#3b82f620', icon: Clock },
  { key: 'oee' as const, label: 'OEE', color: '#f59e0b', trackColor: '#f59e0b20', icon: Activity },
];

// ─── Gauge Chart ───────────────────────────────────────────────────────────────

function GaugeChart({ value, color, trackColor, size = 140 }: {
  value: number; color: string; trackColor: string; size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2 + 8;
  const r = size * 0.38;
  const startAngle = -210;
  const totalArc = 240;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const arc = (startDeg: number, endDeg: number) => {
    const s = { x: cx + r * Math.cos(toRad(startDeg)), y: cy + r * Math.sin(toRad(startDeg)) };
    const e = { x: cx + r * Math.cos(toRad(endDeg)), y: cy + r * Math.sin(toRad(endDeg)) };
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${endDeg - startDeg > 180 ? 1 : 0} 1 ${e.x} ${e.y}`;
  };

  const valueAngle = startAngle + (value / 100) * totalArc;
  const nx = cx + r * 0.78 * Math.cos(toRad(valueAngle));
  const ny = cy + r * 0.78 * Math.sin(toRad(valueAngle));

  return (
    <svg width={size} height={size * 0.78} viewBox={`0 0 ${size} ${size * 0.78}`}>
      <path d={arc(startAngle, startAngle + totalArc)} fill="none" stroke={trackColor} strokeWidth={11} strokeLinecap="round" />
      <path d={arc(startAngle, valueAngle)} fill="none" stroke={color} strokeWidth={11} strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeOpacity={0.9} />
      <circle cx={cx} cy={cy} r={5} fill={color} />
      <circle cx={cx} cy={cy} r={2.5} fill="var(--card-bg, #1e1e2e)" />
    </svg>
  );
}

// ─── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({ label, value, color, trackColor, icon: Icon }: {
  label: string; value: number; color: string; trackColor: string; icon: React.ElementType;
}) {
  return (
    <Card
      className="p-3 sm:p-5 flex flex-col items-center bg-[var(--card-bg)] border-[var(--border-color)]"
      style={{ borderTop: `3px solid ${color}` }}
    >
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">{label}</span>
        <div className="p-1.5 rounded-md" style={{ background: trackColor }}>
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      <div className="w-full flex justify-center">
        {/* Responsive gauge: smaller on mobile */}
        <div className="hidden sm:block">
          <GaugeChart value={value} color={color} trackColor={trackColor} size={140} />
        </div>
        <div className="block sm:hidden">
          <GaugeChart value={value} color={color} trackColor={trackColor} size={100} />
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-bold mt-[-6px]" style={{ color }}>{value}%</p>
    </Card>
  );
}

// ─── Shift Summary Card ────────────────────────────────────────────────────────

function ShiftSummaryCard({ label, value, sub, color, icon: Icon, percent }: {
  label: string; value: string | number; sub: string; color: string;
  icon: React.ElementType; percent?: number;
}) {
  return (
    <Card className="p-3 sm:p-5 bg-[var(--card-bg)] border-[var(--border-color)] flex flex-col gap-1.5 sm:gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm text-[var(--text-secondary)]">{label}</span>
        <div className="p-1.5 sm:p-2 rounded-lg" style={{ background: `${color}18` }}>
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      <p className="text-xl sm:text-3xl font-bold text-[var(--text-primary)]">{value}</p>
      {percent !== undefined && (
        <div className="h-1.5 rounded-full bg-[var(--hover-bg)] overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(percent, 100)}%`, background: color }} />
        </div>
      )}
      <p className="text-xs text-[var(--text-secondary)] leading-tight">{sub}</p>
    </Card>
  );
}

// ─── Machine Dropdown ──────────────────────────────────────────────────────────

function MachineDropdown({ selected, onSelect }: { selected: string; onSelect: (n: string) => void }) {
  const [open, setOpen] = useState(false);
  const machine = machines.find(m => m.name === selected)!;
  const dot = (s: string) => s === 'Running' ? '#10b981' : s === 'Error' ? '#ef4444' : '#f59e0b';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] hover:bg-[var(--hover-bg)] transition-colors w-full sm:w-auto"
      >
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dot(machine.status) }} />
        <span className="text-sm font-semibold text-[var(--text-primary)]">{selected}</span>
        <span className="text-xs text-[var(--text-secondary)] ml-1 hidden sm:inline">· {ACTIVE_SHIFT.label}</span>
        <ChevronDown
          size={14}
          className="text-[var(--text-secondary)] ml-auto sm:ml-1"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 w-full sm:w-56 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] shadow-xl overflow-hidden">
          {machines.map(m => (
            <button
              key={m.id}
              onClick={() => { onSelect(m.name); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--hover-bg)] transition-colors text-left"
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dot(m.status) }} />
              <span className="text-sm text-[var(--text-primary)] flex-1">{m.name}</span>
              <span className="text-xs text-[var(--text-secondary)]">{m.status}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────

export function Dashboard() {
  const [selectedMachine, setSelectedMachine] = useState('Machine 1');
  const { kpi, production: prodData, downtime, shift } = machineData[selectedMachine];

  const remaining = shift.target - shift.actual;
  const actualPct = Math.round((shift.actual / shift.target) * 100);
  const acceptedPct = Math.round((shift.accepted / shift.actual) * 100);
  const rejectedPct = Math.round((shift.rejected / shift.actual) * 100);

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* ── Header + Machine Selector ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-[var(--text-primary)]">Machine Dashboard</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Live production overview · {ACTIVE_SHIFT.label}</p>
        </div>
        <MachineDropdown selected={selectedMachine} onSelect={setSelectedMachine} />
      </div>

      {/* ── Row 1 : KPI Gauges ── */}
      {/* 2-col on mobile, 4-col on lg+ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {kpiConfig.map(cfg => (
          <KpiCard
            key={cfg.key}
            label={cfg.label}
            value={kpi[cfg.key]}
            color={cfg.color}
            trackColor={cfg.trackColor}
            icon={cfg.icon}
          />
        ))}
      </div>

      {/* ── Row 2 : Chart + Downtime ── */}
      {/* Stacked on mobile, 3-col on lg+ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">

        <Card className="lg:col-span-2 p-4 sm:p-6 bg-[var(--card-bg)] border-[var(--border-color)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-[var(--primary-color)]">Production vs Scrap</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{selectedMachine} · {ACTIVE_SHIFT.label}</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 rounded bg-[var(--success-color)]" />Production</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-0.5 rounded bg-[var(--error-color)]" />Scrap</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={prodData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="time" stroke="var(--text-secondary)" tick={{ fontSize: 10 }} />
              <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 10 }} width={30} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: 12 }} />
              <Line type="monotone" dataKey="production" stroke="var(--success-color)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="scrap" stroke="var(--error-color)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4 sm:p-6 bg-[var(--card-bg)] border-[var(--border-color)]">
          <div className="mb-4">
            <h3 className="font-semibold text-sm sm:text-base text-[var(--primary-color)]">Top 3 Downtime Reasons</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{selectedMachine} · {ACTIVE_SHIFT.label}</p>
          </div>
          <div className="space-y-4 sm:space-y-5">
            {downtime.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    <span className="text-xs sm:text-sm text-[var(--text-primary)] truncate">{item.reason}</span>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] ml-2 flex-shrink-0">{item.duration} min</span>
                </div>
                <div className="h-2 bg-[var(--hover-bg)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(item.duration / downtime[0].duration) * 100}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 sm:mt-6 pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
            <span className="text-xs sm:text-sm text-[var(--text-secondary)]">Total downtime</span>
            <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">{downtime.reduce((a, d) => a + d.duration, 0)} min</span>
          </div>
        </Card>
      </div>

      {/* ── Row 3 : Shift Summary ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target size={15} className="text-[var(--text-secondary)]" />
          <h3 className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
            {ACTIVE_SHIFT.label} · Summary — {selectedMachine}
          </h3>
        </div>
        {/* 2-col on mobile, 3-col on md, 5-col on xl */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-5">
          <ShiftSummaryCard label="Shift Target" value={shift.target.toLocaleString()} sub="Units planned for shift" color="#6366f1" icon={Target} />
          <ShiftSummaryCard label="Actual Production" value={shift.actual.toLocaleString()} sub={`${actualPct}% of target achieved`} color="#10b981" icon={Package} percent={actualPct} />
          <ShiftSummaryCard label="Accepted" value={shift.accepted.toLocaleString()} sub={`${acceptedPct}% acceptance rate`} color="#3b82f6" icon={CheckCircle} percent={acceptedPct} />
          <ShiftSummaryCard label="Rejected" value={shift.rejected.toLocaleString()} sub={`${rejectedPct}% rejection rate`} color="#ef4444" icon={AlertCircle} percent={rejectedPct} />
          {/* span full width on mobile when 5th item in 2-col grid */}
          <div className="col-span-2 md:col-span-1">
            <ShiftSummaryCard label="Remaining Target" value={remaining.toLocaleString()} sub={`${100 - actualPct}% still needed`} color="#f59e0b" icon={TrendingUp} percent={100 - actualPct} />
          </div>
        </div>
      </div>

      {/* ── Row 4 : Live Machine Status Table ── */}
      <Card className="p-4 sm:p-6 bg-[var(--card-bg)] border-[var(--border-color)]">
        <h3 className="font-semibold text-sm sm:text-base text-[var(--primary-color)] mb-4">Live Machine Status</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                {['Machine Name', 'Status', 'Production Today', 'OEE %'].map(h => (
                  <th key={h} className="text-left py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium text-[var(--text-secondary)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {machines.map(machine => (
                <tr
                  key={machine.id}
                  onClick={() => setSelectedMachine(machine.name)}
                  className="border-b border-[var(--border-color)] hover:bg-[var(--hover-bg)] transition-colors cursor-pointer"
                  style={machine.name === selectedMachine ? { background: 'var(--hover-bg)' } : {}}
                >
                  <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium text-[var(--text-primary)]">
                    {machine.name}
                    {machine.name === selectedMachine && (
                      <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded hidden sm:inline" style={{ background: '#6366f120', color: '#6366f1' }}>
                        selected
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 sm:py-3 px-3 sm:px-4">
                    <Badge
                      variant="outline"
                      className={`text-xs
                        ${machine.status === 'Running' ? 'bg-[var(--success-color)]/10 text-[var(--success-color)] border-[var(--success-color)]/20' : ''}
                        ${machine.status === 'Error' ? 'bg-[var(--error-color)]/10   text-[var(--error-color)]   border-[var(--error-color)]/20' : ''}
                        ${machine.status === 'Idle' ? 'bg-[var(--warning-color)]/10 text-[var(--warning-color)] border-[var(--warning-color)]/20' : ''}
                      `}
                    >
                      {machine.status}
                    </Badge>
                  </td>
                  <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm text-[var(--text-primary)]">{machine.production.toLocaleString()}</td>
                  <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-[var(--text-primary)]">{machine.oee}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}