import React from 'react';
import { Link } from 'react-router';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { STATIC_MACHINES } from '../data/staticData';

export function MachineList() {
  const machines = STATIC_MACHINES;

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-[var(--card-bg)] border-[var(--border-color)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">Machine Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">Production Today</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">OEE Today</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {machines.map((machine) => (
                <tr
                  key={machine.machine_id}
                  className="border-b border-[var(--border-color)] hover:bg-[var(--hover-bg)] transition-colors"
                >
                  <td className="py-3 px-4 text-sm font-medium text-[var(--text-primary)]">
                    {machine.machine_name}
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      variant="outline"
                      className={`
                        ${machine.status === 'Running' ? 'bg-[var(--success-color)]/10 text-[var(--success-color)] border-[var(--success-color)]/20' : ''}
                        ${machine.status === 'Error' ? 'bg-[var(--error-color)]/10 text-[var(--error-color)] border-[var(--error-color)]/20' : ''}
                        ${machine.status === 'Idle' ? 'bg-[var(--warning-color)]/10 text-[var(--warning-color)] border-[var(--warning-color)]/20' : ''}
                      `}
                    >
                      {machine.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-[var(--text-primary)]">
                    {machine.production.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-[var(--text-primary)]">
                    {machine.oee.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4">
                    <Link to={`/machines/${machine.machine_id}`}>
                      <Button
                        size="sm"
                        className="bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90 text-white"
                      >
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
