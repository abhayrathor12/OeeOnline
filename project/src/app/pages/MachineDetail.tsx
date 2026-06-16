import React from 'react';
import { useParams } from 'react-router';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, AlertTriangle, Activity } from 'lucide-react';
import { STATIC_MACHINES, ACTIVE_SHIFT, getMachineShiftDataById } from '../data/staticData';

export function MachineDetail() {
  const { id } = useParams();
  const machine = STATIC_MACHINES.find(m => m.machine_id === Number(id)) ?? STATIC_MACHINES[0];
  const { kpi, production, downtimeBreakdown, shift } = getMachineShiftDataById(Number(id));

  const statusClass =
    machine.status === 'Running'
      ? 'bg-[var(--success-color)]/10 text-[var(--success-color)] border-[var(--success-color)]/20'
      : machine.status === 'Error'
        ? 'bg-[var(--error-color)]/10 text-[var(--error-color)] border-[var(--error-color)]/20'
        : 'bg-[var(--warning-color)]/10 text-[var(--warning-color)] border-[var(--warning-color)]/20';

  return (
    <div className="space-y-6">
      {/* Machine Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold text-[var(--text-primary)]">{machine.machine_name}</h2>
          <Badge variant="outline" className={statusClass}>
            {machine.status}
          </Badge>
          <span className="text-xs text-[var(--text-secondary)]">{ACTIVE_SHIFT.label}</span>
        </div>
        <div className="flex gap-4">
          <Card className="px-6 py-4 bg-[var(--card-bg)] border-[var(--border-color)]">
            <div className="flex items-center gap-3">
              <Package className="text-[var(--success-color)]" size={24} />
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Shift Production</p>
                <p className="text-xl font-semibold text-[var(--text-primary)]">{shift.actual.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          <Card className="px-6 py-4 bg-[var(--card-bg)] border-[var(--border-color)]">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-[var(--error-color)]" size={24} />
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Scrap</p>
                <p className="text-xl font-semibold text-[var(--text-primary)]">{shift.rejected}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* OEE Breakdown */}
      <div className="grid grid-cols-4 gap-6">
        {/* Overall OEE */}
        <Card className="p-6 col-span-1 bg-[var(--primary-color)] border-[var(--primary-color)]">
          <div className="text-center">
            <Activity className="mx-auto mb-3 text-white" size={32} />
            <p className="text-sm text-white/80 mb-1">Overall OEE</p>
            <p className="text-3xl font-semibold text-white">{kpi.oee}%</p>
          </div>
        </Card>

        {/* Performance */}
        <Card className="p-6 bg-[var(--card-bg)] border-[var(--border-color)]">
          <p className="text-sm text-[var(--text-secondary)] mb-2">Performance</p>
          <p className="text-3xl font-semibold text-[var(--text-primary)] mb-2">{kpi.performance}%</p>
          <p className="text-xs text-[var(--text-secondary)]">Actual vs Ideal Cycle Time</p>
          <div className="mt-4 h-2 bg-[var(--hover-bg)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--success-color)]" style={{ width: `${kpi.performance}%` }} />
          </div>
        </Card>

        {/* Availability */}
        <Card className="p-6 bg-[var(--card-bg)] border-[var(--border-color)]">
          <p className="text-sm text-[var(--text-secondary)] mb-2">Availability</p>
          <p className="text-3xl font-semibold text-[var(--text-primary)] mb-2">{kpi.availability}%</p>
          <p className="text-xs text-[var(--text-secondary)]">Run Time vs Planned Time</p>
          <div className="mt-4 h-2 bg-[var(--hover-bg)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--success-color)]" style={{ width: `${kpi.availability}%` }} />
          </div>
        </Card>

        {/* Quality */}
        <Card className="p-6 bg-[var(--card-bg)] border-[var(--border-color)]">
          <p className="text-sm text-[var(--text-secondary)] mb-2">Quality</p>
          <p className="text-3xl font-semibold text-[var(--text-primary)] mb-2">{kpi.quality}%</p>
          <p className="text-xs text-[var(--text-secondary)]">Good Parts vs Total Parts</p>
          <div className="mt-4 h-2 bg-[var(--hover-bg)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--success-color)]" style={{ width: `${kpi.quality}%` }} />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Hourly Production */}
        <Card className="p-6 bg-[var(--card-bg)] border-[var(--border-color)]">
          <h3 className="font-semibold text-[var(--primary-color)] mb-1">Production vs Scrap</h3>
          <p className="text-xs text-[var(--text-secondary)] mb-4">{machine.machine_name} · {ACTIVE_SHIFT.label}</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={production}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="time" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                }}
              />
              <Line type="monotone" dataKey="production" stroke="var(--success-color)" strokeWidth={2} name="Production" />
              <Line type="monotone" dataKey="scrap" stroke="var(--error-color)" strokeWidth={2} name="Scrap" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Downtime Breakdown */}
        <Card className="p-6 bg-[var(--card-bg)] border-[var(--border-color)]">
          <h3 className="font-semibold text-[var(--primary-color)] mb-1">Downtime Breakdown</h3>
          <p className="text-xs text-[var(--text-secondary)] mb-4">{machine.machine_name} · {ACTIVE_SHIFT.label}</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={downtimeBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="reason" stroke="var(--text-secondary)" tick={{ fontSize: 11 }} />
              <YAxis stroke="var(--text-secondary)" tickFormatter={(v) => `${v}m`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                }}
                formatter={(value: number) => [`${value} min`, 'Duration']}
              />
              <Bar dataKey="duration" fill="var(--warning-color)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
