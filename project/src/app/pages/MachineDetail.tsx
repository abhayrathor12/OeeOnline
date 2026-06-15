import React from 'react';
import { useParams } from 'react-router';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, AlertTriangle, Activity } from 'lucide-react';
import { STATIC_MACHINES } from '../data/staticData';

const hourlyProduction = [
  { hour: '06:00', production: 142 },
  { hour: '07:00', production: 156 },
  { hour: '08:00', production: 168 },
  { hour: '09:00', production: 145 },
  { hour: '10:00', production: 172 },
  { hour: '11:00', production: 158 },
  { hour: '12:00', production: 134 },
  { hour: '13:00', production: 162 },
  { hour: '14:00', production: 175 },
  { hour: '15:00', production: 169 },
  { hour: '16:00', production: 154 },
  { hour: '17:00', production: 148 },
];

const downtimeBreakdown = [
  { reason: 'Material Shortage', duration: 45 },
  { reason: 'Tool Change', duration: 28 },
  { reason: 'Maintenance', duration: 35 },
  { reason: 'Setup', duration: 52 },
  { reason: 'Other', duration: 15 },
];

export function MachineDetail() {
  const { id } = useParams();
  const machine = STATIC_MACHINES.find(m => m.machine_id === Number(id)) ?? STATIC_MACHINES[0];
  const performance = Math.min(99, machine.oee + 7.3).toFixed(1);
  const availability = Math.min(99, machine.oee + 5.6).toFixed(1);
  const quality = Math.min(99.9, machine.oee + 11.8).toFixed(1);
  const scrap = Math.round(machine.production * 0.01);

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
        </div>
        <div className="flex gap-4">
          <Card className="px-6 py-4 bg-[var(--card-bg)] border-[var(--border-color)]">
            <div className="flex items-center gap-3">
              <Package className="text-[var(--success-color)]" size={24} />
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Production</p>
                <p className="text-xl font-semibold text-[var(--text-primary)]">{machine.production.toLocaleString()}</p>
              </div>
            </div>
          </Card>
          <Card className="px-6 py-4 bg-[var(--card-bg)] border-[var(--border-color)]">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-[var(--error-color)]" size={24} />
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Scrap</p>
                <p className="text-xl font-semibold text-[var(--text-primary)]">{scrap}</p>
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
            <p className="text-3xl font-semibold text-white">{machine.oee}%</p>
          </div>
        </Card>

        {/* Performance */}
        <Card className="p-6 bg-[var(--card-bg)] border-[var(--border-color)]">
          <p className="text-sm text-[var(--text-secondary)] mb-2">Performance</p>
          <p className="text-3xl font-semibold text-[var(--text-primary)] mb-2">{performance}%</p>
          <p className="text-xs text-[var(--text-secondary)]">Actual vs Ideal Cycle Time</p>
          <div className="mt-4 h-2 bg-[var(--hover-bg)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--success-color)]" style={{ width: `${performance}%` }} />
          </div>
        </Card>

        {/* Availability */}
        <Card className="p-6 bg-[var(--card-bg)] border-[var(--border-color)]">
          <p className="text-sm text-[var(--text-secondary)] mb-2">Availability</p>
          <p className="text-3xl font-semibold text-[var(--text-primary)] mb-2">{availability}%</p>
          <p className="text-xs text-[var(--text-secondary)]">Run Time vs Planned Time</p>
          <div className="mt-4 h-2 bg-[var(--hover-bg)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--success-color)]" style={{ width: `${availability}%` }} />
          </div>
        </Card>

        {/* Quality */}
        <Card className="p-6 bg-[var(--card-bg)] border-[var(--border-color)]">
          <p className="text-sm text-[var(--text-secondary)] mb-2">Quality</p>
          <p className="text-3xl font-semibold text-[var(--text-primary)] mb-2">{quality}%</p>
          <p className="text-xs text-[var(--text-secondary)]">Good Parts vs Total Parts</p>
          <div className="mt-4 h-2 bg-[var(--hover-bg)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--success-color)]" style={{ width: `${quality}%` }} />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Hourly Production */}
        <Card className="p-6 bg-[var(--card-bg)] border-[var(--border-color)]">
          <h3 className="font-semibold text-[var(--primary-color)] mb-4">Hourly Production</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyProduction}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="hour" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)'
                }}
              />
              <Line type="monotone" dataKey="production" stroke="var(--primary-color)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Downtime Breakdown */}
        <Card className="p-6 bg-[var(--card-bg)] border-[var(--border-color)]">
          <h3 className="font-semibold text-[var(--primary-color)] mb-4">Downtime Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={downtimeBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="reason" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)'
                }}
              />
              <Bar dataKey="duration" fill="var(--warning-color)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
