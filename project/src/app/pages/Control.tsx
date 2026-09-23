import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useAgent } from '../agent/AgentContext';
import { AGENT_MACHINES, STATUS_LABEL, type MachineStatus } from '../agent/machineConfig';

const badgeVariant = (status: MachineStatus): 'default' | 'destructive' | 'outline' | 'secondary' => {
  if (status === 'normal') return 'outline';
  if (status === 'approved_critical' || status === 'abnormal') return 'destructive';
  return 'secondary';
};

export function Control() {
  const { machineState, runAutoPipeline, resolveMachine, connectionError } = useAgent();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Operator Control</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Not shown in the sidebar — this page triggers the automated investigation pipeline and
          lets you bring a machine back into service once its work order is issued. The
          investigation panel opens here too and stays open, streaming each step live, in
          addition to showing up on every other connected screen (e.g. the dashboard on the PC).
        </p>
        {connectionError && (
          <p className="text-sm text-[var(--error-color)] mt-2">
            Agent backend unreachable — {connectionError}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {AGENT_MACHINES.map((m) => {
          const state = machineState[m.id];
          const disabled = state.busy || state.status !== 'normal';
          // Workflow is done (work order issued) once the investigation
          // reaches approved/approved_critical -- that's when the operator
          // can bring the machine back into service.
          const canStart =
            !state.busy && (state.status === 'approved' || state.status === 'approved_critical');
          return (
            <Card
              key={m.id}
              className="p-4 bg-[var(--card-bg)] border-[var(--border-color)] flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-[var(--text-secondary)]">{m.id}</p>
                  <h3 className="font-semibold text-[var(--text-primary)]">{m.name}</h3>
                </div>
                <Badge variant={badgeVariant(state.status)}>{STATUS_LABEL[state.status]}</Badge>
              </div>

              <Button
                variant={state.status === 'normal' ? 'default' : 'secondary'}
                disabled={disabled}
                onClick={() => runAutoPipeline(m.id)}
              >
                {state.busy && state.status === 'normal'
                  ? 'Triggering…'
                  : state.status === 'normal'
                    ? 'Trigger Abnormality'
                    : 'Pipeline running / complete'}
              </Button>

              {(canStart || (state.busy && (state.status === 'approved' || state.status === 'approved_critical'))) && (
                <Button variant="default" disabled={state.busy} onClick={() => resolveMachine(m.id)}>
                  {state.busy ? 'Starting…' : 'Start Machine (Clear Error)'}
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
