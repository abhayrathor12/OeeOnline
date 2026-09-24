// Client for the manufacturing_ai_agent FastAPI backend. Deliberately
// separate from src/app/api.ts, which talks to the OEE backend -- these
// are two different servers.
import axios from 'axios';

const AGENT_API_BASE_URL = 'https://oeerepo-production.up.railway.app/';
// const AGENT_API_BASE_URL = 'http://localhost:8000';

// Same host/port as the REST API, just over ws(s):// instead of http(s)://.
// This is what AgentContext connects to so every open tab -- on any page,
// any device -- gets investigation events pushed to it live instead of
// finding out via polling.
// export const AGENT_WS_URL = AGENT_API_BASE_URL.replace(/^http/i, 'ws') + '/ws/agent';
export const AGENT_WS_URL =
AGENT_API_BASE_URL.replace(/^https/i, 'wss').replace(/\/$/, '') + '/ws/agent';

const agentApiClient = axios.create({
  baseURL: AGENT_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export interface LiveReading {
  [key: string]: any;
  plc_alarms?: string[];
}

export interface InvestigationResult {
  incident_id: string;
  machine_id: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  probable_cause: string;
  recommendation: string[];
  retrieved_documents?: { source: string; heading?: string; text?: string }[];
  evidence?: {
    machine_data?: {
      sensor_classification?: Record<string, { value: any; status: string }>;
    };
  };
}

export interface WorkOrder {
  id: string;
  incident_id: string;
  machine_id: string;
  priority: string;
  title: string;
  status: string;
  instructions: string[];
  created_at?: string;
}

export interface IncidentSummary {
  id: string;
  machine_id: string;
  machine_type: string;
  severity: string;
  status: string;
  probable_cause: string | null;
  confidence: number | null;
  recommendation: string[] | null;
  retrieved_documents?: { source: string; heading?: string; text?: string }[];
  evidence?: {
    machine_data?: {
      sensor_classification?: Record<string, { value: any; status: string }>;
    };
  };
  approved_by: string | null;
  created_at: string;
  work_orders: { id: string; priority: string; status: string; title: string }[];
}

export const agentApi = {
  getLive: (machineId: string) =>
    agentApiClient.get<LiveReading>(`/api/machines/${machineId}/live`).then((r) => r.data),

  simulateAbnormal: (machineId: string) =>
    agentApiClient
      .post<LiveReading>(`/api/machines/${machineId}/simulate/abnormal`)
      .then((r) => r.data),

  // Jumps the machine's live reading back to its normal/recovery baseline --
  // used by "Start Machine" / "Complete" to clear an error.
  simulateRecovery: (machineId: string) =>
    agentApiClient
      .post<LiveReading>(`/api/machines/${machineId}/simulate/recovery`)
      .then((r) => r.data),

  investigate: (machineId: string) =>
    agentApiClient
      .post<InvestigationResult>('/api/agent/investigate', { machine_id: machineId })
      .then((r) => r.data),

  approveIncident: (incidentId: string, approvedBy: string) =>
    agentApiClient
      .post<{ incident_id: string; status: string; work_order_id: string; work_order_priority: string }>(
        `/api/incidents/${incidentId}/approve`,
        { approved_by: approvedBy },
      )
      .then((r) => r.data),

  getWorkOrder: (workOrderId: string) =>
    agentApiClient.get<WorkOrder>(`/api/work-orders/${workOrderId}`).then((r) => r.data),

  listIncidents: () => agentApiClient.get<IncidentSummary[]>('/api/incidents').then((r) => r.data),

  listWorkOrders: () => agentApiClient.get<WorkOrder[]>('/api/work-orders').then((r) => r.data),

  // Confirms the machine has recovered so the incident can be closed out
  // and the error cleared everywhere it's shown.
  verifyIncident: (
    incidentId: string,
    reading: LiveReading,
    finalRootCause?: string,
    correctiveAction?: string,
  ) =>
    agentApiClient
      .post(`/api/incidents/${incidentId}/verify`, {
        reading,
        final_root_cause: finalRootCause,
        corrective_action: correctiveAction,
      })
      .then((r) => r.data),

  sendEmail: (params: {
    // Optional one-off override. Normally omitted -- when it's left out,
    // the backend sends to every saved recipient (see Recipients page /
    // recipientsApi below) instead of a single fixed address.
    toEmail?: string;
    subject: string;
    body: string;
    incidentId?: string;
    workOrderId?: string;
    // Which machine this relates to -- lets the backend broadcast the
    // "Email sent..." confirmation to every connected tab's chat log for
    // that machine (see email_sent/email_failed in AgentContext.tsx),
    // instead of it only ever being visible on whichever device made this
    // call.
    machineId?: string;
  }) =>
    agentApiClient
      .post('/api/notify/email', {
        to_email: params.toEmail,
        subject: params.subject,
        body: params.body,
        incident_id: params.incidentId,
        work_order_id: params.workOrderId,
        machine_id: params.machineId,
      })
      .then((r) => r.data),
};

export interface NotificationRecipient {
  id: number;
  name: string | null;
  email: string;
  created_at: string;
}

// Recipients that automated work-order/incident emails go out to (see the
// Recipients page). Replaces the old single hard-coded NOTIFY_TO_EMAIL.
export const recipientsApi = {
  list: () =>
    agentApiClient.get<NotificationRecipient[]>('/api/recipients').then((r) => r.data),

  add: (params: { email: string; name?: string }) =>
    agentApiClient
      .post<NotificationRecipient>('/api/recipients', params)
      .then((r) => r.data),

  remove: (id: number) =>
    agentApiClient.delete(`/api/recipients/${id}`).then((r) => r.data),
};
