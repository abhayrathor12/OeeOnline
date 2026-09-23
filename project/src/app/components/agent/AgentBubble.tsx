import { MessageSquareText } from 'lucide-react';
import { useAgent } from '../../agent/AgentContext';
import { AGENT_MACHINES } from '../../agent/machineConfig';

const RUNNING_STATUSES = new Set(['abnormal', 'investigating', 'open']);

export function AgentBubble() {
  const { activeMachineId, machineState, drawerOpen, reopenDrawer } = useAgent();

  if (drawerOpen || !activeMachineId) return null;
  const state = machineState[activeMachineId];
  if (!state || state.log.length === 0) return null;

  const machine = AGENT_MACHINES.find((m) => m.id === activeMachineId);
  const isRunning = RUNNING_STATUSES.has(state.status);

  return (
    <button
      onClick={reopenDrawer}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full pl-4 pr-5 py-3 shadow-lg text-white transition-transform hover:scale-105"
      style={{ background: 'var(--primary-color)' }}
    >
      <span className="relative flex items-center justify-center">
        <MessageSquareText size={18} />
        {isRunning && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[var(--warning-color)] animate-pulse" />
        )}
      </span>
      <span className="text-sm font-medium">
        {machine?.name} {isRunning ? '· investigating…' : '· view result'}
      </span>
    </button>
  );
}
