import { useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Badge } from '../ui/badge';
import { X, CheckCircle2 } from 'lucide-react';
import { useAgent, type AgentLogEntry } from '../../agent/AgentContext';
import { AGENT_MACHINES } from '../../agent/machineConfig';
import type { InvestigationResult, WorkOrder } from '../../agent/agentApi';

const RUNNING_STATUSES = new Set(['abnormal', 'investigating', 'open']);

function SeverityDot({ severity }: { severity: string }) {
  const color =
    severity === 'CRITICAL'
      ? 'var(--error-color)'
      : severity === 'HIGH'
        ? 'var(--warning-color)'
        : 'var(--success-color)';
  return <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />;
}

function LogEntryView({ entry }: { entry: AgentLogEntry }) {
  if (entry.kind === 'thinking') {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-[10px] tracking-wide text-[var(--text-secondary)]">AGENT</span>
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <span className="w-3 h-3 rounded-full border-2 border-[var(--border-color)] border-t-[var(--primary-color)] animate-spin" />
          {entry.text}
        </div>
      </div>
    );
  }

  const tagLabel = entry.tag === 'agent' ? 'AGENT' : entry.tag === 'safety' ? 'SAFETY' : 'SYSTEM';
  const tagColor =
    entry.tag === 'agent'
      ? 'text-[var(--primary-color)]'
      : entry.tag === 'safety'
        ? 'text-[var(--error-color)]'
        : 'text-[var(--text-secondary)]';

  let body: React.ReactNode = entry.text;

  if (entry.kind === 'severity') {
    const data = entry.data as InvestigationResult;
    body = (
      <div className="flex items-center gap-2">
        <SeverityDot severity={data.severity} />
        <strong>{data.severity}</strong>
        <span className="text-[var(--text-secondary)]">· confidence {data.confidence}%</span>
      </div>
    );
  } else if (entry.kind === 'cause') {
    const data = entry.data as InvestigationResult;
    body = (
      <div>
        <strong>Probable cause:</strong> {data.probable_cause}
      </div>
    );
  } else if (entry.kind === 'recommendation') {
    const data = entry.data as InvestigationResult;
    body = (
      <div>
        <div className="text-[11px] text-[var(--text-secondary)] mb-1">RECOMMENDATION</div>
        <ol className="list-decimal pl-4 space-y-1">
          {data.recommendation.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>
    );
  } else if (entry.kind === 'docs') {
    const data = entry.data as InvestigationResult;
    const sources = [...new Set((data.retrieved_documents || []).map((d) => d.source))];
    body = (
      <div>
        <div className="text-[11px] text-[var(--text-secondary)] mb-1.5">REFERENCED SOP DOCUMENTS</div>
        <div className="flex flex-wrap gap-1.5">
          {sources.map((src) => (
            <span
              key={src}
              className="text-[10px] px-2 py-0.5 rounded border border-[var(--border-color)] text-[var(--text-secondary)]"
            >
              {src}
            </span>
          ))}
        </div>
      </div>
    );
  } else if (entry.kind === 'workorder') {
    const data = entry.data as WorkOrder;
    body = (
      <div>
        <div className="flex items-center gap-2 mb-1">
          <strong>{data.id}</strong>
          <Badge variant="outline">{data.priority}</Badge>
        </div>
        <div className="mb-1">{data.title}</div>
        <ol className="list-decimal pl-4 space-y-1">
          {(data.instructions || []).map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <span className={`text-[10px] tracking-wide ${tagColor}`}>{tagLabel}</span>
      <div className="rounded-md border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2.5 text-sm text-[var(--text-primary)]">
        {body}
      </div>
    </div>
  );
}

export function AgentDrawer() {
  const { machineState, activeMachineId, drawerOpen, closeDrawer, resolveMachine } = useAgent();
  const logRef = useRef<HTMLDivElement>(null);

  const machine = AGENT_MACHINES.find((m) => m.id === activeMachineId);
  const state = activeMachineId ? machineState[activeMachineId] : null;

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [state?.log]);

  if (!machine || !state) return null;

  const isRunning = RUNNING_STATUSES.has(state.status);
  // The work order only exists once the whole automated workflow -- severity,
  // cause, recommendation, approval -- has actually finished, so that's the
  // gate for letting someone mark the investigation complete.
  const canComplete = !!state.workOrder && !state.busy;

  return (
    <Sheet open={drawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-[var(--bg-primary)] border-[var(--border-color)] p-0 flex flex-col"
      >
        <SheetHeader className="px-4 py-3 border-b border-[var(--border-color)] flex-row items-center justify-between space-y-0">
          <div>
            <SheetTitle className="text-[var(--text-primary)] text-base">{machine.name}</SheetTitle>
            <div className="text-xs text-[var(--text-secondary)]">
              {machine.id} · investigation log (read-only)
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => activeMachineId && resolveMachine(activeMachineId)}
              disabled={!canComplete}
              title={
                canComplete
                  ? 'Mark the investigation complete and clear the machine error'
                  : 'Available once the work order is issued'
              }
              className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                canComplete
                  ? 'text-[var(--success-color)] hover:bg-[var(--hover-bg)]'
                  : 'text-[var(--text-secondary)] opacity-40 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 size={16} />
              Complete
            </button>
            <button
              onClick={closeDrawer}
              className="p-1.5 rounded-md hover:bg-[var(--hover-bg)] text-[var(--text-secondary)]"
              aria-label="Minimize"
              title="Minimize"
            >
              <X size={16} />
            </button>
          </div>
        </SheetHeader>

        <div ref={logRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5">
          {state.log.length === 0 && (
            <div className="text-xs text-[var(--text-secondary)]">
              No investigation has run for this machine yet.
            </div>
          )}
          {state.log.map((entry, i) => (
            <LogEntryView entry={entry} key={i} />
          ))}
          {isRunning && (
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <span className="w-3 h-3 rounded-full border-2 border-[var(--border-color)] border-t-[var(--primary-color)] animate-spin" />
              Pipeline in progress…
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
