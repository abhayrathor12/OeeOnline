import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useNotification } from "../components/ui/notification";
import ConfirmDialog from "../components/ui/confirm-dialog";
import {
  Plus,
  Trash2,
  X,
  Clock,
  LayoutGrid,
  List,
  Eye,
  Pencil,
  Coffee,
  ChevronDown,
  HelpCircle,
} from 'lucide-react';
import api from '../api';
import { STATIC_SHIFTS } from '../data/staticData';

const emptyForm = { name: '', startTime: '', stopTime: '', breaks: [] };

function getDuration(start: string, stop: string) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = stop.split(':').map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  return `${mins}m`;
}

export function Shifts() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [viewShift, setViewShift] = useState<any>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [confirmState, setConfirmState] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  const { showNotification } = useNotification();

  useEffect(() => {
    fetchShifts();
  }, []);

  useEffect(() => {
    if (!showHelp) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#help-popover') && !target.closest('#help-trigger')) {
        setShowHelp(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showHelp]);

  const openConfirm = (title: string, description: string, onConfirm: () => void) => {
    setConfirmState({ title, description, onConfirm });
  };

  const formatShifts = (data: any[]) =>
    data.map((s: any) => ({
      id: s.id,
      name: s.name?.startsWith('Shift ') ? s.name : `Shift ${s.name}`,
      startTime: s.startTime ?? s.start_time,
      stopTime: s.stopTime ?? s.end_time,
      breaks: (s.breaks || []).map((b: any) => ({
        id: b.id,
        name: b.name,
        startTime: b.startTime ?? b.start_time,
        stopTime: b.stopTime ?? b.end_time,
      })),
    }));

  const fetchShifts = async () => {
    setShifts(formatShifts(STATIC_SHIFTS));
  };

  const openConfigModal = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowConfigModal(true);
  };

  const openEditModal = (shift: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setForm({
      name: shift.name.replace('Shift ', ''),
      startTime: shift.startTime,
      stopTime: shift.stopTime,
      breaks: shift.breaks.map((b: any) => ({ ...b })),
    });
    setEditingId(shift.id);
    setShowViewModal(false);
    setShowConfigModal(true);
  };

  const openViewModal = (shift: any) => {
    setViewShift(shift);
    setShowViewModal(true);
  };

  const closeConfigModal = () => {
    setShowConfigModal(false);
    setForm(emptyForm);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewShift(null);
  };

  const addBreakRow = () => {
    setForm((f) => ({
      ...f,
      breaks: [...f.breaks, { id: Date.now(), name: '', startTime: '', stopTime: '' }],
    }));
  };

  const updateBreak = (idx: number, field: string, value: string) => {
    setForm((f) => {
      const breaks = [...f.breaks];
      breaks[idx] = { ...breaks[idx], [field]: value };
      return { ...f, breaks };
    });
  };

  const removeBreak = (idx: number) => {
    setForm((f) => ({
      ...f,
      breaks: f.breaks.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showNotification("Shift name is required", "error");
      return;
    }
    if (!form.startTime || !form.stopTime) {
      showNotification("Start and stop times are required", "error");
      return;
    }

    const payload = {
      name: form.name.replace('Shift ', ''),
      start_time: form.startTime,
      end_time: form.stopTime,
      is_active: true,
      breaks: form.breaks.map((b: any) => ({
        ...(b.id && typeof b.id === 'number' ? { id: b.id } : {}),
        name: b.name,
        start_time: b.startTime,
        end_time: b.stopTime,
      })),
    };

    try {
      if (editingId) {
        await api.put(`/api/shifts/${editingId}/`, payload);
        showNotification("Shift updated successfully!", "success");
      } else {
        await api.post('/api/shifts/', payload);
        showNotification("Shift created successfully!", "success");
      }
      fetchShifts();
      closeConfigModal();
    } catch (err: any) {
      const message =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        "Something went wrong while saving the shift.";
      showNotification(message, "error");
    }
  };

  const deleteShift = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    openConfirm(
      "Delete Shift?",
      "This shift will be permanently deleted. This action cannot be undone.",
      async () => {
        try {
          await api.delete(`/api/shifts/${id}/`);
          fetchShifts();
          showNotification("Shift deleted successfully!", "success");
          if (viewShift?.id === id) closeViewModal();
        } catch (err) {
          console.error("Delete failed:", err);
          showNotification("Failed to delete shift", "error");
        }
      }
    );
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-[var(--text-secondary)]">
      <Clock size={32} className="mb-3 opacity-30" />
      <p className="text-sm">No shifts configured yet.</p>
    </div>
  );

  const isMaxShifts = shifts.length >= 3;

  return (
    <div className="space-y-4 sm:space-y-6 px-0">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Title + Help */}
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-semibold text-[var(--primary-color)]">Shift Management</h2>

          <div className="relative flex items-center">
            <button
              id="help-trigger"
              onClick={() => setShowHelp((v) => !v)}
              className="flex items-center justify-center w-5 h-5 rounded-full text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 transition-colors cursor-pointer"
              aria-label="Shift configuration instructions"
            >
              <HelpCircle size={16} />
            </button>

            {showHelp && (
              <div
                id="help-popover"
                className="absolute left-0 top-7 z-50 w-64 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-lg p-4"
              >
                <div className="absolute -top-2 left-3 w-3 h-3 rotate-45 border-l border-t border-[var(--border-color)] bg-[var(--card-bg)]" />

                <p className="text-[10px] font-bold text-[var(--primary-color)] uppercase tracking-widest mb-3">
                  How to configure shifts
                </p>

                <div className="space-y-2.5 mb-3">
                  {[
                    { num: '1', text: 'Maximum of ', highlight: '3 shifts', rest: ' allowed.' },
                    { num: '2', text: 'Must cover exactly ', highlight: '24 hours', rest: ' with no gaps.' },
                    { num: '3', text: 'Each shift can have multiple ', highlight: 'breaks', rest: ' inside it.' },
                  ].map(({ num, text, highlight, rest }) => (
                    <div key={num} className="flex items-start gap-2">
                      <span className="shrink-0 w-4 h-4 rounded-full bg-[var(--primary-color)] text-white flex items-center justify-center font-bold text-[9px] mt-0.5">{num}</span>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {text}<span className="font-semibold text-[var(--text-primary)]">{highlight}</span>{rest}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg bg-[var(--hover-bg)] p-3">
                  <p className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Example</p>
                  <div className="space-y-1.5">
                    {[
                      { label: 'Shift A', time: '06:00 – 14:00', color: 'bg-blue-500' },
                      { label: 'Shift B', time: '14:00 – 22:00', color: 'bg-violet-500' },
                      { label: 'Shift C', time: '22:00 – 06:00', color: 'bg-emerald-500' },
                    ].map(({ label, time, color }) => (
                      <div key={label} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
                          <span className="text-xs font-medium text-[var(--text-primary)]">{label}</span>
                        </div>
                        <span className="text-xs text-[var(--text-secondary)] tabular-nums">{time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          {/* View toggle */}
          <div className="flex items-center border border-[var(--border-color)] rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 sm:px-3 py-1.5 flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm transition-colors ${viewMode === 'table'
                ? 'bg-[var(--primary-color)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'
                }`}
            >
              <List size={14} />
              <span className="hidden xs:inline sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 sm:px-3 py-1.5 flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm transition-colors ${viewMode === 'grid'
                ? 'bg-[var(--primary-color)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'
                }`}
            >
              <LayoutGrid size={14} />
              <span className="hidden xs:inline sm:inline">Grid</span>
            </button>
          </div>

          {/* Configure button with tooltip */}
          <div className="relative group">
            <Button
              onClick={openConfigModal}
              disabled={isMaxShifts}
              className={`bg-[var(--primary-color)] text-white text-xs sm:text-sm px-3 sm:px-4 ${isMaxShifts ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--primary-color)]/90'
                }`}
            >
              <Plus size={15} className="mr-1 sm:mr-2" />
              <span className="whitespace-nowrap">Configure Shift</span>
            </Button>
            {isMaxShifts && (
              <div className="pointer-events-none absolute top-full right-0 mt-2 hidden group-hover:flex items-center whitespace-nowrap rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] shadow-lg px-3 py-2 text-xs text-[var(--text-secondary)]">
                <Clock size={12} className="mr-1.5 text-[var(--primary-color)] shrink-0" />
                All 3 shifts are already configured
                <span className="absolute -top-1.5 right-4 w-3 h-3 rotate-45 border-l border-t border-[var(--border-color)] bg-[var(--card-bg)]" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <Card className="bg-[var(--card-bg)] border-[var(--border-color)] overflow-hidden">
          {shifts.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Desktop table — hidden on very small screens */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border-color)]">
                      {['Shift', 'Start Time', 'Stop Time', 'Duration', 'Breaks', 'Actions'].map((h) => (
                        <th key={h} className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {shifts.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-[var(--border-color)] hover:bg-[var(--hover-bg)] transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-[var(--primary-color)]" />
                            <span className="text-sm font-medium text-[var(--text-primary)]">{s.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-[var(--text-primary)]">{s.startTime}</td>
                        <td className="py-3 px-4 text-sm text-[var(--text-primary)]">{s.stopTime}</td>
                        <td className="py-3 px-4 text-sm text-[var(--text-primary)]">{getDuration(s.startTime, s.stopTime)}</td>
                        <td className="py-3 px-4 text-sm text-[var(--text-primary)]">{s.breaks.length}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" className="text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]" onClick={() => openViewModal(s)}>
                              <Eye size={15} />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]" onClick={(e) => openEditModal(s, e)}>
                              <Pencil size={15} />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-[var(--error-color)] hover:bg-[var(--error-color)]/10" onClick={(e) => deleteShift(s.id, e)}>
                              <Trash2 size={15} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards — shown only on small screens */}
              <div className="sm:hidden divide-y divide-[var(--border-color)]">
                {shifts.map((s) => (
                  <div key={s.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-[var(--primary-color)]/10">
                          <Clock size={14} className="text-[var(--primary-color)]" />
                        </div>
                        <span className="text-sm font-semibold text-[var(--text-primary)]">{s.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-md hover:bg-[var(--hover-bg)] text-[var(--text-secondary)] transition-colors" onClick={() => openViewModal(s)}>
                          <Eye size={14} />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-[var(--hover-bg)] text-[var(--text-secondary)] transition-colors" onClick={(e) => openEditModal(s, e)}>
                          <Pencil size={14} />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-[var(--error-color)]/10 text-[var(--error-color)] transition-colors" onClick={(e) => deleteShift(s.id, e)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Start', val: s.startTime },
                        { label: 'Stop', val: s.stopTime },
                        { label: 'Duration', val: getDuration(s.startTime, s.stopTime) },
                      ].map(({ label, val }) => (
                        <div key={label} className="bg-[var(--hover-bg)] rounded-lg p-2 text-center">
                          <p className="text-[10px] text-[var(--text-secondary)] mb-0.5">{label}</p>
                          <p className="text-xs font-semibold text-[var(--text-primary)] tabular-nums">{val}</p>
                        </div>
                      ))}
                    </div>
                    {s.breaks.length > 0 && (
                      <p className="mt-2 text-xs text-[var(--text-secondary)]">
                        {s.breaks.length} break{s.breaks.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        shifts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {shifts.map((s) => (
              <Card key={s.id} className="bg-[var(--card-bg)] border-[var(--border-color)] p-4 sm:p-5 hover:bg-[var(--hover-bg)] transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-[var(--primary-color)]/10">
                      <Clock size={16} className="text-[var(--primary-color)]" />
                    </div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">{s.name}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded hover:bg-[var(--hover-bg)] text-[var(--text-secondary)] transition-colors" onClick={() => openViewModal(s)}>
                      <Eye size={14} />
                    </button>
                    <button className="p-1.5 rounded hover:bg-[var(--hover-bg)] text-[var(--text-secondary)] transition-colors" onClick={(e) => openEditModal(s, e)}>
                      <Pencil size={14} />
                    </button>
                    <button className="p-1.5 rounded hover:bg-[var(--error-color)]/10 text-[var(--error-color)] transition-colors" onClick={(e) => deleteShift(s.id, e)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Start Time', val: s.startTime },
                    { label: 'Stop Time', val: s.stopTime },
                    { label: 'Duration', val: getDuration(s.startTime, s.stopTime) },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-xs text-[var(--text-secondary)]">{label}</span>
                      <span className="text-xs font-medium text-[var(--text-primary)]">{val}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-[var(--border-color)]">
                    <span className="text-xs text-[var(--text-secondary)]">Breaks</span>
                    <span className="text-xs font-medium text-[var(--text-primary)]">{s.breaks.length}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* VIEW DETAILS MODAL */}
      {showViewModal && viewShift && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4" onClick={closeViewModal}>
          <Card
            className="bg-[var(--card-bg)] border-[var(--border-color)] p-4 sm:p-6 w-full sm:max-w-lg mx-0 sm:mx-4 max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-xl rounded-b-none sm:rounded-b-xl"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle for mobile bottom sheet */}
            <div className="flex justify-center mb-3 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-[var(--border-color)]" />
            </div>

            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--primary-color)]/10">
                  <Clock size={18} className="text-[var(--primary-color)]" />
                </div>
                <h3 className="font-semibold text-[var(--primary-color)]">{viewShift.name}</h3>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--hover-bg)]"
                  onClick={(e) => openEditModal(viewShift, e)}
                >
                  <Pencil size={13} className="mr-1" /> Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={closeViewModal} className="text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]">
                  <X size={16} />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
              {[
                { label: 'Start Time', val: viewShift.startTime },
                { label: 'Stop Time', val: viewShift.stopTime },
                { label: 'Duration', val: getDuration(viewShift.startTime, viewShift.stopTime) },
              ].map(({ label, val }) => (
                <div key={label} className="bg-[var(--hover-bg)] rounded-lg p-2.5 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-[var(--text-secondary)] mb-1">{label}</p>
                  <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] tabular-nums">{val}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">
                Breaks ({viewShift.breaks.length})
              </p>
              {viewShift.breaks.length === 0 ? (
                <p className="text-sm text-[var(--text-secondary)]">No breaks configured.</p>
              ) : (
                <>
                  {/* Desktop breaks table */}
                  <div className="hidden sm:block">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[var(--border-color)]">
                          {['Break Name', 'Start', 'Stop', 'Duration'].map((h) => (
                            <th key={h} className="text-left py-2 px-3 text-xs font-medium text-[var(--text-secondary)]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {viewShift.breaks.map((b: any) => (
                          <tr key={b.id} className="border-b border-[var(--border-color)] hover:bg-[var(--hover-bg)] transition-colors">
                            <td className="py-2.5 px-3 text-sm text-[var(--text-primary)]">
                              <span className="flex items-center gap-2">
                                <Coffee size={13} className="text-[var(--text-secondary)]" />
                                {b.name}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-sm text-[var(--text-primary)]">{b.startTime}</td>
                            <td className="py-2.5 px-3 text-sm text-[var(--text-primary)]">{b.stopTime}</td>
                            <td className="py-2.5 px-3 text-sm text-[var(--text-primary)]">{getDuration(b.startTime, b.stopTime)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile breaks list */}
                  <div className="sm:hidden space-y-2">
                    {viewShift.breaks.map((b: any) => (
                      <div key={b.id} className="bg-[var(--hover-bg)] rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Coffee size={13} className="text-[var(--text-secondary)]" />
                          <span className="text-sm font-medium text-[var(--text-primary)]">{b.name}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: 'Start', val: b.startTime },
                            { label: 'Stop', val: b.stopTime },
                            { label: 'Duration', val: getDuration(b.startTime, b.stopTime) },
                          ].map(({ label, val }) => (
                            <div key={label}>
                              <p className="text-[10px] text-[var(--text-secondary)]">{label}</p>
                              <p className="text-xs font-semibold text-[var(--text-primary)] tabular-nums">{val}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* CONFIGURE / EDIT MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4" onClick={closeConfigModal}>
          <Card
            className="bg-[var(--card-bg)] border-[var(--border-color)] p-4 sm:p-6 w-full sm:max-w-lg mx-0 sm:mx-4 max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-xl rounded-b-none sm:rounded-b-xl"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle for mobile */}
            <div className="flex justify-center mb-3 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-[var(--border-color)]" />
            </div>

            <div className="flex items-center justify-between mb-5 sm:mb-6">
              <h3 className="font-semibold text-[var(--primary-color)]">
                {editingId ? 'Edit Shift' : 'Configure Shift'}
              </h3>
              <Button size="sm" variant="ghost" onClick={closeConfigModal} className="text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]">
                <X size={16} />
              </Button>
            </div>

            <div className="mb-4">
              <Label htmlFor="shiftSelect" className="text-[var(--text-primary)]">Shift</Label>
              <div className="relative mt-1.5">
                <select
                  id="shiftSelect"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full appearance-none bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-md px-3 py-2 pr-9 text-sm outline-none focus:border-[var(--primary-color)] cursor-pointer"
                >
                  <option value="" disabled>Select shift</option>
                  <option value="A">Shift A</option>
                  <option value="B">Shift B</option>
                  <option value="C">Shift C</option>
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5 sm:mb-6">
              <div>
                <Label htmlFor="startTime" className="text-[var(--text-primary)]">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                  className="mt-1.5 bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-primary)] w-full"
                />
              </div>
              <div>
                <Label htmlFor="stopTime" className="text-[var(--text-primary)]">Stop Time</Label>
                <Input
                  id="stopTime"
                  type="time"
                  value={form.stopTime}
                  onChange={(e) => setForm((f) => ({ ...f, stopTime: e.target.value }))}
                  className="mt-1.5 bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-primary)] w-full"
                />
              </div>
            </div>

            <div className="mb-5 sm:mb-6">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-[var(--text-primary)]">Breaks</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addBreakRow}
                  className="border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--hover-bg)]"
                >
                  <Plus size={14} className="mr-1" /> Add Break
                </Button>
              </div>

              {form.breaks.length === 0 && (
                <p className="text-xs text-[var(--text-secondary)] py-2">No breaks added yet.</p>
              )}

              <div className="space-y-2">
                {form.breaks.map((brk: any, idx: number) => (
                  <div key={brk.id || idx} className="bg-[var(--hover-bg)] rounded-lg p-3">
                    <div className="mb-2">
                      <Input
                        value={brk.name}
                        onChange={(e) => updateBreak(idx, 'name', e.target.value)}
                        className="bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-primary)] w-full"
                        placeholder="Break name (e.g., Lunch Break)"
                      />
                    </div>
                    {/* On mobile: stack time inputs vertically; on sm+: side by side */}
                    <div className="flex flex-col xs:flex-row sm:flex-row gap-2 items-stretch xs:items-center sm:items-center">
                      <Input
                        type="time"
                        value={brk.startTime}
                        onChange={(e) => updateBreak(idx, 'startTime', e.target.value)}
                        className="bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-primary)] flex-1 w-full"
                      />
                      <Input
                        type="time"
                        value={brk.stopTime}
                        onChange={(e) => updateBreak(idx, 'stopTime', e.target.value)}
                        className="bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-primary)] flex-1 w-full"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeBreak(idx)}
                        className="text-[var(--error-color)] hover:bg-[var(--error-color)]/10 shrink-0 self-end xs:self-auto sm:self-auto"
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSave}
              className="w-full bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90 text-white"
            >
              {editingId ? 'Save Changes' : 'Create Shift'}
            </Button>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={confirmState !== null}
        title={confirmState?.title ?? ''}
        description={confirmState?.description ?? ''}
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => setConfirmState(null)}
        onConfirm={() => {
          confirmState?.onConfirm();
          setConfirmState(null);
        }}
      />
    </div>
  );
}

export default Shifts;
