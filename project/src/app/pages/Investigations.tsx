import { useEffect, useState } from 'react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import { agentApi, type IncidentSummary } from '../agent/agentApi';
import { AGENT_BY_ID } from '../agent/machineConfig';

const severityVariant = (s: string): 'default' | 'destructive' | 'outline' | 'secondary' => {
  if (s === 'CRITICAL') return 'destructive';
  if (s === 'HIGH') return 'destructive';
  if (s === 'MEDIUM') return 'secondary';
  return 'outline';
};

export function Investigations() {
  const [incidents, setIncidents] = useState<IncidentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    agentApi
      .listIncidents()
      .then((data) => {
        setIncidents(data);
        setError(null);
      })
      .catch((err) => setError(err.message || 'Could not load investigations'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Investigations</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Past AI investigations and the work orders they created.
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border border-[var(--border-color)] hover:bg-[var(--hover-bg)] text-[var(--text-secondary)]"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <p className="text-sm text-[var(--error-color)]">Could not reach agent backend — {error}</p>
      )}

      <Card className="bg-[var(--card-bg)] border-[var(--border-color)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[var(--border-color)]">
              <TableHead className="w-8" />
              <TableHead>Incident</TableHead>
              <TableHead>Machine</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Probable Cause</TableHead>
              <TableHead>Work Order</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incidents.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-[var(--text-secondary)] py-8">
                  No investigations yet. Trigger one from the Control page.
                </TableCell>
              </TableRow>
            )}
            {incidents.map((inc) => {
              const machineName = AGENT_BY_ID[inc.machine_id]?.name ?? inc.machine_type;
              const isOpen = expandedId === inc.id;
              return (
                <>
                  <TableRow
                    key={inc.id}
                    className="border-[var(--border-color)] cursor-pointer hover:bg-[var(--hover-bg)]"
                    onClick={() => setExpandedId(isOpen ? null : inc.id)}
                  >
                    <TableCell>
                      {isOpen ? (
                        <ChevronDown size={14} className="text-[var(--text-secondary)]" />
                      ) : (
                        <ChevronRight size={14} className="text-[var(--text-secondary)]" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-[var(--text-primary)]">{inc.id}</TableCell>
                    <TableCell className="text-[var(--text-primary)]">
                      {machineName} <span className="text-[var(--text-secondary)]">({inc.machine_id})</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={severityVariant(inc.severity)}>{inc.severity}</Badge>
                    </TableCell>
                    <TableCell className="text-[var(--text-primary)]">{inc.status}</TableCell>
                    <TableCell className="max-w-xs truncate text-[var(--text-primary)]">
                      {inc.probable_cause || '—'}
                    </TableCell>
                    <TableCell>
                      {inc.work_orders.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {inc.work_orders.map((w) => (
                            <Badge key={w.id} variant="outline">
                              {w.id} · {w.priority}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[var(--text-secondary)]">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-[var(--text-secondary)] whitespace-nowrap">
                      {new Date(inc.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                  {isOpen && (
                    <TableRow className="border-[var(--border-color)]">
                      <TableCell colSpan={8} className="bg-[var(--bg-secondary)]">
                        <div className="py-2 space-y-2 text-sm">
                          <div>
                            <strong className="text-[var(--text-primary)]">Confidence:</strong>{' '}
                            <span className="text-[var(--text-secondary)]">
                              {inc.confidence != null ? `${inc.confidence}%` : '—'}
                            </span>
                          </div>
                          <div>
                            <strong className="text-[var(--text-primary)]">Approved by:</strong>{' '}
                            <span className="text-[var(--text-secondary)]">
                              {inc.approved_by || 'not yet approved'}
                            </span>
                          </div>
                          {inc.recommendation && inc.recommendation.length > 0 && (
                            <div>
                              <strong className="text-[var(--text-primary)]">Recommendation:</strong>
                              <ol className="list-decimal pl-5 mt-1 space-y-0.5 text-[var(--text-secondary)]">
                                {inc.recommendation.map((step, i) => (
                                  <li key={i}>{step}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
