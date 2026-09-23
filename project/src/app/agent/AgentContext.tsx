import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  agentApi,
  AGENT_WS_URL,
  type IncidentSummary,
  type InvestigationResult,
  type LiveReading,
  type WorkOrder,
} from './agentApi';
import {
  AGENT_MACHINES,
  AGENT_BY_ID,
  AGENT_BY_OEE_ID,
  AUTO_APPROVER_NAME,
  ERROR_STATUSES,
  type MachineStatus,
} from './machineConfig';

// Shape of the JSON messages broadcast over AGENT_WS_URL -- one per line,
// see app/ws_manager.py + the manager.broadcast_from_thread(...) calls in
// the backend's app/agent.py for where each of these comes from.
type AgentWsMessage =
  | { type: 'investigation_started'; machine_id: string; incident_id: string }
  | {
      type: 'agent_step';
      machine_id: string;
      incident_id: string;
      event_type: string;
      message: string;
    }
  | {
      type: 'investigation_result';
      machine_id: string;
      incident_id: string;
      severity: InvestigationResult['severity'];
      confidence: number;
      probable_cause: string;
      recommendation: string[];
      retrieved_documents?: InvestigationResult['retrieved_documents'];
      evidence?: InvestigationResult['evidence'];
      status: string;
    }
  | {
      type: 'incident_approved';
      machine_id: string;
      incident_id: string;
      status: string;
      approved_by: string;
      work_order: WorkOrder;
    }
  | { type: 'incident_rejected'; machine_id: string; incident_id: string; status: string }
  | {
      type: 'incident_verified';
      machine_id: string;
      incident_id: string;
      status: string;
      verification_result: string | null;
    }
  | {
      type: 'email_sent';
      machine_id: string;
      incident_id?: string;
      work_order_id?: string;
      to_email: string;
    }
  | {
      type: 'email_failed';
      machine_id: string;
      incident_id?: string;
      work_order_id?: string;
      to_email: string;
      error?: string;
    };

export interface AgentLogEntry {
  tag: 'system' | 'agent' | 'safety';
  kind?: 'thinking' | 'severity' | 'cause' | 'recommendation' | 'docs' | 'workorder';
  text?: string;
  data?: InvestigationResult | WorkOrder;
}

export interface AgentMachineState {
  reading: LiveReading | null;
  status: MachineStatus;
  severity: string | null;
  sensorClassification: Record<string, { value: any; status: string }> | null;
  incidentId: string | null;
  workOrder: WorkOrder | null;
  log: AgentLogEntry[];
  busy: boolean;
}

const emptyMachineState = (): AgentMachineState => ({
  reading: null,
  status: 'normal',
  severity: null,
  sensorClassification: null,
  incidentId: null,
  workOrder: null,
  log: [],
  busy: false,
});

interface AgentContextValue {
  machineState: Record<string, AgentMachineState>;
  activeMachineId: string | null;
  drawerOpen: boolean;
  connectionError: string | null;
  runAutoPipeline: (agentMachineId: string) => Promise<void>;
  openDrawer: (agentMachineId: string) => void;
  closeDrawer: () => void;
  reopenDrawer: () => void;
  isMachineIdInError: (agentMachineId: string) => boolean;
  isOeeMachineInError: (oeeId: number) => boolean;
  // Clears an investigated machine's error once its work order is done --
  // resets the reading to normal, closes out the incident, and clears the
  // panel/bubble on every device (see the cross-device sync effect below).
  resolveMachine: (agentMachineId: string) => Promise<void>;
}

// Turns a backend Incident (as returned by GET /api/incidents) into the same
// log shape runAutoPipeline builds, so a device that DIDN'T trigger the
// pipeline (e.g. the PC, while a phone triggered it from /control) can catch
// up and render the full investigation the moment it notices it.
function logFromIncident(
  incident: IncidentSummary,
  workOrder: WorkOrder | null,
): AgentLogEntry[] {
  const resultLike: InvestigationResult = {
    incident_id: incident.id,
    machine_id: incident.machine_id,
    severity: (incident.severity as InvestigationResult['severity']) || 'LOW',
    confidence: incident.confidence ?? 0,
    probable_cause: incident.probable_cause ?? '',
    recommendation: incident.recommendation ?? [],
    retrieved_documents: incident.retrieved_documents ?? [],
    evidence: incident.evidence,
  };

  const log: AgentLogEntry[] = [
    { tag: 'system', text: 'Abnormal reading detected. Handing off to the investigation agent.' },
    { tag: 'agent', kind: 'severity', data: resultLike },
    { tag: 'agent', kind: 'cause', data: resultLike },
  ];

  if (resultLike.recommendation.length > 0) {
    log.push({ tag: 'agent', kind: 'recommendation', data: resultLike });
  }
  if (resultLike.retrieved_documents && resultLike.retrieved_documents.length > 0) {
    log.push({ tag: 'agent', kind: 'docs', data: resultLike });
  }
  if (incident.severity === 'CRITICAL') {
    log.push({
      tag: 'safety',
      text:
        'CRITICAL alarm — per Safety Procedure this is also escalated to the Safety Team directly for independent review. The automated workflow below still proceeds per site configuration.',
    });
  }
  if (incident.approved_by) {
    log.push({ tag: 'system', text: `Automatically approved by ${incident.approved_by}.` });
    if (workOrder) {
      log.push({ tag: 'system', kind: 'workorder', data: workOrder });
    }
  }

  return log;
}

function statusFromIncident(incident: IncidentSummary): MachineStatus {
  if (incident.status === 'APPROVED') {
    return incident.severity === 'CRITICAL' ? 'approved_critical' : 'approved';
  }
  // OPEN or MONITORING -- still an active, unresolved incident.
  return 'open';
}

const AgentContext = createContext<AgentContextValue | null>(null);

export function useAgent() {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error('useAgent must be used inside <AgentProvider>');
  return ctx;
}

// Convenience hook for pages that just need to know "is this OEE machine
// (by its numeric id) currently in an error/investigation state" -- used
// to overlay a live error indicator anywhere a motor is shown.
export function useIsMachineInError(oeeId: number | undefined | null): boolean {
  const { isOeeMachineInError } = useAgent();
  if (oeeId === undefined || oeeId === null) return false;
  return isOeeMachineInError(oeeId);
}

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [machineState, setMachineState] = useState<Record<string, AgentMachineState>>(() =>
    Object.fromEntries(AGENT_MACHINES.map((m) => [m.id, emptyMachineState()])),
  );
  const [activeMachineId, setActiveMachineId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const syncPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Refs mirroring current state -- read inside the cross-device sync loop
  // below without having to rebuild the interval every time state changes.
  const machineStateRef = useRef(machineState);
  const activeMachineIdRef = useRef(activeMachineId);
  const workOrderCache = useRef<Record<string, WorkOrder>>({});
  // Timestamp (per machine) of the last time we locally learned an
  // investigation had started -- either by triggering it ourselves or by
  // receiving the 'investigation_started' broadcast. Used as a short grace
  // window in the cross-device sync poll below: a poll that lands in the
  // first couple of seconds after that, and finds no incident yet, is far
  // more likely to be racing an in-flight backend commit than reporting a
  // genuinely cleared incident -- so we don't let it wipe local state.
  const investigationStartedAt = useRef<Record<string, number>>({});
  const SYNC_GRACE_MS = 8000;

  const patchMachine = useCallback((id: string, patch: Partial<AgentMachineState>) => {
    setMachineState((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }, []);

  useEffect(() => {
    machineStateRef.current = machineState;
  }, [machineState]);

  useEffect(() => {
    activeMachineIdRef.current = activeMachineId;
  }, [activeMachineId]);

  const pushLog = useCallback((id: string, entry: AgentLogEntry) => {
    setMachineState((prev) => ({
      ...prev,
      [id]: { ...prev[id], log: [...prev[id].log, entry] },
    }));
  }, []);

  // Live WebSocket channel to the agent backend. This is what makes the
  // investigation chat open on every connected tab/device the instant an
  // abnormality is triggered anywhere (not just wherever "Trigger
  // Abnormality" was clicked), and stream in part-by-part as the backend's
  // LangChain agent actually works through it -- no polling, no refresh.
  // The 6s poll further below is kept purely as a fallback for a tab whose
  // socket happens to be reconnecting when a step arrives.
  const wsRef = useRef<WebSocket | null>(null);
  const wsReconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAgentWsMessage = useCallback(
    (raw: MessageEvent) => {
      let msg: AgentWsMessage;
      try {
        msg = JSON.parse(raw.data);
      } catch {
        return;
      }
      const id = msg.machine_id;
      if (!id || !AGENT_BY_ID[id]) return;

      switch (msg.type) {
        case 'investigation_started': {
          investigationStartedAt.current[id] = Date.now();
          setMachineState((prev) => ({
            ...prev,
            [id]: {
              ...emptyMachineState(),
              reading: prev[id]?.reading ?? null,
              status: 'investigating',
              incidentId: msg.incident_id,
              log: [
                {
                  tag: 'system',
                  text: 'Abnormal reading detected. Handing off to the investigation agent.',
                },
              ],
            },
          }));
          // Open on every device that's currently looking at the app,
          // including the operator Control page -- but never steal focus
          // from an investigation this device is already looking at.
          if (activeMachineIdRef.current === null) {
            setActiveMachineId(id);
            setDrawerOpen(true);
          }
          break;
        }

        case 'agent_step': {
          pushLog(id, { tag: 'agent', text: msg.message });
          break;
        }

        case 'investigation_result': {
          const resultLike: InvestigationResult = {
            incident_id: msg.incident_id,
            machine_id: id,
            severity: msg.severity,
            confidence: msg.confidence,
            probable_cause: msg.probable_cause,
            recommendation: msg.recommendation || [],
            retrieved_documents: msg.retrieved_documents || [],
            evidence: msg.evidence,
          };
          setMachineState((prev) => ({
            ...prev,
            [id]: {
              ...prev[id],
              incidentId: msg.incident_id,
              severity: msg.severity,
              sensorClassification:
                msg.evidence?.machine_data?.sensor_classification || null,
              status: 'open',
            },
          }));
          pushLog(id, { tag: 'agent', kind: 'severity', data: resultLike });
          pushLog(id, { tag: 'agent', kind: 'cause', data: resultLike });
          if (resultLike.recommendation.length > 0) {
            pushLog(id, { tag: 'agent', kind: 'recommendation', data: resultLike });
          }
          if (resultLike.retrieved_documents && resultLike.retrieved_documents.length > 0) {
            pushLog(id, { tag: 'agent', kind: 'docs', data: resultLike });
          }
          if (msg.severity === 'CRITICAL') {
            pushLog(id, {
              tag: 'safety',
              text:
                'CRITICAL alarm — per Safety Procedure this is also escalated to the Safety Team directly for independent review. The automated workflow below still proceeds per site configuration.',
            });
          }
          break;
        }

        case 'incident_approved': {
          setMachineState((prev) => {
            const cur = prev[id];
            if (!cur) return prev;
            return {
              ...prev,
              [id]: {
                ...cur,
                status: cur.severity === 'CRITICAL' ? 'approved_critical' : 'approved',
                workOrder: msg.work_order,
              },
            };
          });
          pushLog(id, { tag: 'system', text: `Automatically approved by ${msg.approved_by}.` });
          pushLog(id, { tag: 'system', kind: 'workorder', data: msg.work_order });
          break;
        }

        case 'incident_rejected': {
          patchMachine(id, emptyMachineState());
          if (activeMachineIdRef.current === id) {
            setDrawerOpen(false);
            setActiveMachineId(null);
          }
          break;
        }

        case 'incident_verified': {
          // MONITORING (partial recovery) leaves the panel as-is; only a
          // final RESOLVED/REJECTED clears the error everywhere.
          if (msg.status === 'RESOLVED') {
            patchMachine(id, emptyMachineState());
            if (activeMachineIdRef.current === id) {
              setDrawerOpen(false);
              setActiveMachineId(null);
            }
          }
          break;
        }

        case 'email_sent': {
          pushLog(id, { tag: 'system', text: `Email sent automatically to ${msg.to_email}.` });
          break;
        }

        case 'email_failed': {
          pushLog(id, {
            tag: 'system',
            text: `Email failed to send: ${msg.error || 'unknown error'}`,
          });
          break;
        }

        default:
          break;
      }
    },
    [patchMachine, pushLog],
  );

  useEffect(() => {
    let cancelled = false;

    function connect() {
      if (cancelled) return;
      const socket = new WebSocket(AGENT_WS_URL);
      wsRef.current = socket;
      socket.onmessage = handleAgentWsMessage;
      socket.onclose = () => {
        if (cancelled) return;
        // Retry shortly -- the periodic incident poll below still covers
        // this tab in the meantime.
        wsReconnectTimer.current = setTimeout(connect, 3000);
      };
      socket.onerror = () => {
        socket.close();
      };
    }

    connect();
    return () => {
      cancelled = true;
      if (wsReconnectTimer.current) clearTimeout(wsReconnectTimer.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [handleAgentWsMessage]);

  // Fallback safety net: if a machine's local status shows an active
  // investigation ('investigating'/'open'/etc.) but nothing ever set
  // activeMachineId/drawerOpen for it (e.g. a message was missed), this
  // periodically catches it and opens the drawer -- on every page,
  // including /control, so the operator who triggered it never gets stuck
  // without a visible panel.
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeMachineIdRef.current !== null) return;
      const active = AGENT_MACHINES.find(
        (m) => (machineStateRef.current[m.id]?.status ?? 'normal') !== 'normal',
      );
      if (active) {
        setActiveMachineId(active.id);
        setDrawerOpen(true);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Initial seed + light polling of live readings for machines still normal
  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      try {
        await Promise.all(
          AGENT_MACHINES.map(async (m) => {
            const live = await agentApi.getLive(m.id);
            if (!cancelled) patchMachine(m.id, { reading: live });
          }),
        );
        setConnectionError(null);
      } catch (err: any) {
        if (!cancelled) setConnectionError(err.message || 'Could not reach agent backend');
      }
    }
    loadAll();
    return () => {
      cancelled = true;
    };
  }, [patchMachine]);

  useEffect(() => {
    pollRef.current = setInterval(() => {
      AGENT_MACHINES.forEach((m) => {
        setMachineState((prev) => {
          if (prev[m.id].status !== 'normal') return prev;
          agentApi
            .getLive(m.id)
            .then((live) => patchMachine(m.id, { reading: live }))
            .catch(() => {});
          return prev;
        });
      });
    }, 15000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [patchMachine]);

  // Cross-device sync: incidents live in the agent backend's database, not
  // just in this browser tab's memory. This polls that shared source of
  // truth so that a device which did NOT trigger the pipeline (e.g. the
  // main PC dashboard, while a phone triggered it from /control) discovers
  // an in-progress or completed investigation on its own and opens its
  // panel for it -- and, symmetrically, clears its panel if the incident
  // was resolved from a different device.
  useEffect(() => {
    let cancelled = false;

    async function syncFromBackend() {
      let incidents: IncidentSummary[];
      try {
        incidents = await agentApi.listIncidents();
      } catch {
        return; // agent backend unreachable -- next tick will retry
      }
      if (cancelled) return;

      const latestByMachine: Record<string, IncidentSummary> = {};
      for (const inc of incidents) {
        const existing = latestByMachine[inc.machine_id];
        if (!existing || new Date(inc.created_at).getTime() > new Date(existing.created_at).getTime()) {
          latestByMachine[inc.machine_id] = inc;
        }
      }

      for (const m of AGENT_MACHINES) {
        const inc = latestByMachine[m.id];
        const cur = machineStateRef.current[m.id];
        if (!cur || cur.busy) continue; // don't fight a pipeline running locally

        const remoteActive = !!inc && ['OPEN', 'APPROVED', 'MONITORING'].includes(inc.status);
        const remoteCleared = !inc || ['RESOLVED', 'REJECTED'].includes(inc.status);

        if (remoteActive && cur.status === 'normal') {
          // Newly discovered here -- some other device started this.
          let workOrder: WorkOrder | null = null;
          const woSummary = inc!.work_orders && inc!.work_orders[0];
          if (woSummary) {
            workOrder = workOrderCache.current[woSummary.id] || null;
            if (!workOrder) {
              try {
                workOrder = await agentApi.getWorkOrder(woSummary.id);
                workOrderCache.current[woSummary.id] = workOrder;
              } catch {
                workOrder = null;
              }
            }
          }
          if (cancelled) return;

          patchMachine(m.id, {
            status: statusFromIncident(inc!),
            severity: inc!.severity,
            incidentId: inc!.id,
            sensorClassification: inc!.evidence?.machine_data?.sensor_classification || null,
            workOrder,
            log: logFromIncident(inc!, workOrder),
          });

          // Only auto-open if this device isn't already focused on something
          // else -- never steals focus from an investigation already open.
          if (activeMachineIdRef.current === null) {
            setActiveMachineId(m.id);
            setDrawerOpen(true);
          }
        } else if (remoteCleared && cur.status !== 'normal' && cur.incidentId) {
          // Give a just-started investigation a brief grace window: a poll
          // landing right after 'investigation_started' could still race an
          // in-flight backend commit and see "no incident yet" -- that's
          // not the same as "cleared". Skip the reset in that case; the
          // next poll (or a WS message) will pick up the real state.
          const startedAt = investigationStartedAt.current[m.id];
          if (startedAt && Date.now() - startedAt < SYNC_GRACE_MS) {
            continue;
          }
          // Cleared from another device (or this one) -- reset here too.
          patchMachine(m.id, emptyMachineState());
          if (activeMachineIdRef.current === m.id) {
            setDrawerOpen(false);
            setActiveMachineId(null);
          }
        }
      }
    }

    syncFromBackend();
    syncPollRef.current = setInterval(syncFromBackend, 6000);
    return () => {
      cancelled = true;
      if (syncPollRef.current) clearInterval(syncPollRef.current);
    };
  }, [patchMachine]);

  // Drives the pipeline by calling the backend APIs in sequence. Every step
  // (investigation started, each tool call, the final assessment, the
  // approval, the work order) arrives as a live broadcast over the
  // WebSocket above and is applied identically on every connected device.
  // We ALSO open the drawer locally and immediately here, rather than
  // waiting for that first WS message to round-trip back -- this is what
  // makes the panel pop open the instant "Trigger Abnormality" is clicked
  // (including on /control) and keeps it open/focused on this investigation
  // for the rest of the pipeline, instead of flashing briefly and only
  // reappearing once everything finishes.
  const runAutoPipeline = useCallback(
    async (id: string) => {
      investigationStartedAt.current[id] = Date.now();
      patchMachine(id, { busy: true });
      setActiveMachineId(id);
      setDrawerOpen(true);

      let live: LiveReading;
      try {
        live = await agentApi.simulateAbnormal(id);
        patchMachine(id, { reading: live, busy: false });
      } catch (err: any) {
        pushLog(id, { tag: 'system', text: `Could not simulate abnormality: ${err.message}` });
        patchMachine(id, { busy: false });
        return;
      }

      let result: InvestigationResult;
      try {
        // Blocks until the whole investigation finishes, but the backend
        // streams every step of it out over the WebSocket while this is
        // in flight -- see handleAgentWsMessage above.
        result = await agentApi.investigate(id);
      } catch (err: any) {
        pushLog(id, { tag: 'system', text: `Investigation failed: ${err.message}` });
        patchMachine(id, { status: 'abnormal' });
        return;
      }

      let workOrder: WorkOrder;
      try {
        const res = await agentApi.approveIncident(result.incident_id, AUTO_APPROVER_NAME);
        workOrder = await agentApi.getWorkOrder(res.work_order_id);
      } catch (err: any) {
        pushLog(id, { tag: 'system', text: `Auto-approval failed: ${err.message}` });
        return;
      }

      try {
        const machineName = AGENT_MACHINES.find((m) => m.id === id)?.name ?? id;
        // Deliberately not pushing a local log line for this -- the backend
        // broadcasts 'email_sent'/'email_failed' over the WS to every
        // connected tab (including this one) once the send actually
        // completes (see handleAgentWsMessage above). Pushing here too
        // would double it up on this device once that broadcast arrives.
        await agentApi.sendEmail({
          // No toEmail here on purpose -- the backend now sends this to
          // every recipient saved on the Recipients page instead of one
          // fixed address (see routers/notify.py).
          subject: `Work Order ${workOrder.id} — ${machineName} (${workOrder.priority})`,
          body:
            `Work order ${workOrder.id} was automatically created and approved for ${id}.\n\n` +
            `Priority: ${workOrder.priority}\n` +
            `Title: ${workOrder.title}\n\n` +
            `Instructions:\n${(workOrder.instructions || [])
              .map((s, i) => `${i + 1}. ${s}`)
              .join('\n')}\n\n` +
            `— Sent automatically from the OEE Dashboard`,
          incidentId: result.incident_id,
          workOrderId: workOrder.id,
          machineId: id,
        });
      } catch {
        // Swallow here too -- if the request never even reached the
        // backend (e.g. this device is offline), there's no machine_id'd
        // broadcast to fall back on, but that's a rare edge case and not
        // worth a locally-visible-only log line that reintroduces the
        // asymmetry this fix removes.
      }
    },
    [patchMachine, pushLog],
  );

  const openDrawer = useCallback((id: string) => {
    setActiveMachineId(id);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const reopenDrawer = useCallback(() => setDrawerOpen(true), []);

  // "Start Machine" / "Complete" -- jumps the reading back to normal,
  // verifies the incident closed, then resets the panel everywhere.
  const resolveMachine = useCallback(
    async (id: string) => {
      const state = machineStateRef.current[id];
      if (!state?.incidentId) return;

      patchMachine(id, { busy: true });
      try {
        const newReading = await agentApi.simulateRecovery(id);
        await agentApi.verifyIncident(
          state.incidentId,
          newReading,
          undefined,
          'Cleared from operator control after work order completion.',
        );
      } catch (err: any) {
        pushLog(id, { tag: 'system', text: `Could not start the machine: ${err.message}` });
        patchMachine(id, { busy: false });
        return;
      }

      patchMachine(id, emptyMachineState());
      if (activeMachineIdRef.current === id) {
        setDrawerOpen(false);
        setActiveMachineId(null);
      }
    },
    [patchMachine, pushLog],
  );

  const isMachineIdInError = useCallback(
    (id: string) => ERROR_STATUSES.has(machineState[id]?.status ?? 'normal'),
    [machineState],
  );

  const isOeeMachineInError = useCallback(
    (oeeId: number) => {
      const agentMachine = AGENT_BY_OEE_ID[oeeId];
      if (!agentMachine) return false;
      return ERROR_STATUSES.has(machineState[agentMachine.id]?.status ?? 'normal');
    },
    [machineState],
  );

  const value: AgentContextValue = {
    machineState,
    activeMachineId,
    drawerOpen,
    connectionError,
    runAutoPipeline,
    openDrawer,
    closeDrawer,
    reopenDrawer,
    isMachineIdInError,
    isOeeMachineInError,
    resolveMachine,
  };

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>;
}
