import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Plus, Trash2, X, Server, AlertTriangle, LayoutGrid, List, Eye, Pencil } from 'lucide-react';
import api from '../api';
import { useNotification } from "../components/ui/notification";
import ConfirmDialog from "../components/ui/confirm-dialog";
import { STATIC_CONFIG_MACHINES } from '../data/staticData';


const emptyForm = {
  name: '',
  runningRegister: '',
  productionRegister: '',
  scrapRegister: '',
  alarms: [],
};

export function Configuration() {
  const [machines, setMachines] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [viewMachine, setViewMachine] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const [confirmState, setConfirmState] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    fetchMachines();
  }, []);
  const openConfirm = (
    title: string,
    description: string,
    onConfirm: () => void
  ) => {
    setConfirmState({
      title,
      description,
      onConfirm,
    });
  };
  const fetchMachines = async () => {
    setLoading(true);
    setMachines(STATIC_CONFIG_MACHINES);
    setLoading(false);
  };

  const openAddModal = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowAddModal(true);
  };

  const openEditModal = (machine, e) => {
    e?.stopPropagation();
    const params = machine.parameters || {};
    const errors = machine.errors || [];

    setForm({
      name: machine.name || '',
      runningRegister: params.running_bit?.toString() || '',
      productionRegister: params.production_register?.toString() || '',
      scrapRegister: params.scrap_register?.toString() || '',
      alarms: errors.map(err => ({
        id: err.id,
        name: err.error_name || '',
        register: err.error_bit?.toString() || '',
      })),
    });

    setEditingId(machine.id);
    setShowViewModal(false);
    setShowAddModal(true);
  };

  const openViewModal = (machine) => {
    setViewMachine(machine);
    setShowViewModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setForm(emptyForm);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewMachine(null);
  };

  const addAlarmRow = () => {
    setForm(f => ({
      ...f,
      alarms: [...f.alarms, { id: Date.now(), name: '', register: '' }],
    }));
  };

  const updateAlarm = (idx, field, value) => {
    setForm(f => {
      const alarms = [...f.alarms];
      alarms[idx] = { ...alarms[idx], [field]: value };
      return { ...f, alarms };
    });
  };

  const removeAlarm = (idx) => {
    setForm(f => ({
      ...f,
      alarms: f.alarms.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;

    try {
      const payload = {
        name: form.name,
        is_active: true,
        parameters: {
          running_bit: form.runningRegister ? parseInt(form.runningRegister) : 0,
          production_register: form.productionRegister ? parseInt(form.productionRegister) : 0,
          scrap_register: form.scrapRegister ? parseInt(form.scrapRegister) : 0,
        },
        errors: form.alarms.map(a => ({
          id: typeof a.id === "number" ? a.id : undefined,
          error_name: a.name,
          error_bit: parseInt(a.register),
        })),
      };

      if (editingId) {
        await api.put(`/api/machines/${editingId}/`, payload);
      } else {
        await api.post('/api/machines/', payload);
      }

      fetchMachines();
      closeAddModal();

      showNotification(
        editingId ? "Machine updated successfully!" : "Machine added successfully!",
        "success"
      );

    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save configuration.");
    }
  };
  const deleteMachine = async () => {
    if (!deleteId) return;

    try {
      await api.delete(`/api/machines/${deleteId}/`);
      fetchMachines();
      showNotification("Machine deleted successfully!", "success");
    } catch (error) {
      showNotification("Failed to delete machine!", "error");
    } finally {
      setDeleteId(null);
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-[var(--text-secondary)]">
      <Server size={32} className="mb-3 opacity-30" />
      <p className="text-sm">No machines configured yet.</p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-[var(--text-secondary)]">Loading machines...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--primary-color)]">Machine Configuration</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-[var(--border-color)] rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 flex items-center gap-1.5 text-sm transition-colors ${viewMode === 'table' ? 'bg-[var(--primary-color)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'}`}
            >
              <List size={15} /> Table
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 flex items-center gap-1.5 text-sm transition-colors ${viewMode === 'grid' ? 'bg-[var(--primary-color)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'}`}
            >
              <LayoutGrid size={15} /> Grid
            </button>
          </div>
          <Button onClick={openAddModal} className="bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90 text-white">
            <Plus size={16} className="mr-2" /> Add Machine
          </Button>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <Card className="bg-[var(--card-bg)] border-[var(--border-color)] overflow-hidden">
          {machines.length === 0 ? <EmptyState /> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-color)]">
                    {['Machine Name', 'Running Register', 'Production Register', 'Scrap Register', 'Alarms', 'Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {machines.map(m => {
                    const p = m.parameters || {};
                    const alarmCount = m.errors?.length || 0;
                    return (
                      <tr key={m.id} className="border-b border-[var(--border-color)] hover:bg-[var(--hover-bg)] transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Server size={14} className="text-[var(--primary-color)]" />
                            <span className="text-sm font-medium text-[var(--text-primary)]">{m.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-[var(--text-primary)]">{p.running_bit ?? '-'}</td>
                        <td className="py-3 px-4 text-sm text-[var(--text-primary)]">{p.production_register ?? '-'}</td>
                        <td className="py-3 px-4 text-sm text-[var(--text-primary)]">{p.scrap_register ?? '-'}</td>
                        <td className="py-3 px-4 text-sm text-[var(--text-primary)]">{alarmCount}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" onClick={() => openViewModal(m)}>
                              <Eye size={15} />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={(e) => openEditModal(m, e)}>
                              <Pencil size={15} />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-[var(--error-color)] hover:bg-[var(--error-color)]/10" onClick={(e) => {
                              e.stopPropagation();

                              openConfirm(
                                "Delete Machine?",
                                "This machine and all its alarms will be permanently deleted.",
                                async () => {
                                  try {
                                    await api.delete(`/api/machines/${m.id}/`);
                                    fetchMachines();
                                    showNotification("Machine deleted successfully!", "success");
                                  } catch {
                                    showNotification("Failed to delete machine!", "error");
                                  }
                                }
                              );
                            }}

                            >
                              <Trash2 size={15} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        machines.length === 0 ? <EmptyState /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {machines.map(m => {
              const p = m.parameters || {};
              const alarmCount = m.errors?.length || 0;
              return (
                <Card key={m.id} className="bg-[var(--card-bg)] border-[var(--border-color)] p-5 hover:bg-[var(--hover-bg)] transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-[var(--primary-color)]/10">
                        <Server size={16} className="text-[var(--primary-color)]" />
                      </div>
                      <h3 className="text-sm font-semibold text-[var(--text-primary)]">{m.name}</h3>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded hover:bg-[var(--hover-bg)] text-[var(--text-secondary)] transition-colors" onClick={() => openViewModal(m)}>
                        <Eye size={14} />
                      </button>
                      <button className="p-1.5 rounded hover:bg-[var(--hover-bg)] text-[var(--text-secondary)] transition-colors" onClick={(e) => openEditModal(m, e)}>
                        <Pencil size={14} />
                      </button>
                      <button className="p-1.5 rounded hover:bg-[var(--error-color)]/10 text-[var(--error-color)] transition-colors" onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(m.id);
                      }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-[var(--text-secondary)]">Running Reg.</span>
                      <span className="text-xs font-medium text-[var(--text-primary)]">{p.running_bit ?? '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-[var(--text-secondary)]">Production Reg.</span>
                      <span className="text-xs font-medium text-[var(--text-primary)]">{p.production_register ?? '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-[var(--text-secondary)]">Scrap Reg.</span>
                      <span className="text-xs font-medium text-[var(--text-primary)]">{p.scrap_register ?? '-'}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[var(--border-color)]">
                      <span className="text-xs text-[var(--text-secondary)]">Alarms</span>
                      <span className="text-xs font-medium text-[var(--text-primary)]">{alarmCount}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      )}

      {/* VIEW DETAILS POPUP */}
      {showViewModal && viewMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeViewModal}>
          <Card className="bg-[var(--card-bg)] border-[var(--border-color)] p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--primary-color)]/10">
                  <Server size={18} className="text-[var(--primary-color)]" />
                </div>
                <h3 className="font-semibold text-[var(--primary-color)]">{viewMachine.name}</h3>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={(e) => openEditModal(viewMachine, e)}>
                  <Pencil size={13} className="mr-1" /> Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={closeViewModal}>
                  <X size={16} />
                </Button>
              </div>
            </div>



            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Running Register', val: viewMachine.parameters?.running_bit ?? '-' },
                { label: 'Production Register', val: viewMachine.parameters?.production_register ?? '-' },
                { label: 'Scrap Register', val: viewMachine.parameters?.scrap_register ?? '-' },
              ].map(({ label, val }) => (
                <div key={label} className="bg-[var(--hover-bg)] rounded-lg p-3">
                  <p className="text-xs text-[var(--text-secondary)] mb-1">{label}</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{val}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-3">
                Alarms ({viewMachine.errors?.length || 0})
              </p>
              {(!viewMachine.errors || viewMachine.errors.length === 0) ? (
                <p className="text-sm text-[var(--text-secondary)]">No alarms configured.</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border-color)]">
                      <th className="text-left py-2 px-3 text-xs font-medium text-[var(--text-secondary)]">Alarm Name</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-[var(--text-secondary)]">Register</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewMachine.errors.map(err => (
                      <tr key={err.id} className="border-b border-[var(--border-color)] hover:bg-[var(--hover-bg)]">
                        <td className="py-2.5 px-3 text-sm text-[var(--text-primary)] flex items-center gap-2">
                          <AlertTriangle size={13} className="text-yellow-500" />
                          {err.error_name}
                        </td>
                        <td className="py-2.5 px-3 text-sm text-[var(--text-primary)]">{err.error_bit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeAddModal}>
          <Card className="bg-[var(--card-bg)] border-[var(--border-color)] p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-[var(--primary-color)]">
                {editingId ? 'Edit Machine' : 'Machine Parameter Configuration'}
              </h3>
              <Button size="sm" variant="ghost" onClick={closeAddModal}>
                <X size={16} />
              </Button>
            </div>

            <div className="mb-4">
              <Label htmlFor="machineName">Machine Name</Label>
              <Input
                id="machineName"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="mt-1.5"
                placeholder="e.g., Machine 1"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div>
                <Label htmlFor="runningRegister">Running Register</Label>
                <Input
                  id="runningRegister"
                  value={form.runningRegister}
                  onChange={e => setForm(f => ({ ...f, runningRegister: e.target.value }))}
                  className="mt-1.5"
                  placeholder="e.g., 00001"
                />
              </div>
              <div>
                <Label htmlFor="productionRegister">Production Register</Label>
                <Input
                  id="productionRegister"
                  value={form.productionRegister}
                  onChange={e => setForm(f => ({ ...f, productionRegister: e.target.value }))}
                  className="mt-1.5"
                  placeholder="e.g., 40001"
                />
              </div>
              <div>
                <Label htmlFor="scrapRegister">Scrap Register</Label>
                <Input
                  id="scrapRegister"
                  value={form.scrapRegister}
                  onChange={e => setForm(f => ({ ...f, scrapRegister: e.target.value }))}
                  className="mt-1.5"
                  placeholder="e.g., 40002"
                />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <Label>Alarms</Label>
                <Button size="sm" variant="outline" onClick={addAlarmRow}>
                  <Plus size={14} className="mr-1" /> Add Alarm
                </Button>
              </div>
              {form.alarms.length === 0 && (
                <p className="text-xs text-[var(--text-secondary)] py-2">No alarms added yet.</p>
              )}
              <div className="space-y-2">
                {form.alarms.map((alarm, idx) => (
                  <div key={alarm.id || idx} className="flex gap-2 items-center">
                    <Input
                      value={alarm.name}
                      onChange={e => updateAlarm(idx, 'name', e.target.value)}
                      placeholder="Alarm name"
                    />
                    <Input
                      value={alarm.register}
                      onChange={e => updateAlarm(idx, 'register', e.target.value)}
                      placeholder="Alarm register"
                    />
                    <Button size="sm" variant="ghost" onClick={() =>
                      openConfirm(
                        "Delete Alarm?",
                        "This alarm configuration will be removed.",
                        () => {
                          removeAlarm(idx);
                          showNotification("Alarm removed successfully!", "success");
                        }
                      )
                    }
                      className="text-red-600 hover:bg-red-50 shrink-0">
                      <Trash2 size={15} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleSave} className="w-full bg-[#203f78] hover:bg-[#203f78]/90 text-white">
              Save Configuration
            </Button>
          </Card>

        </div>

      )}
      <ConfirmDialog
        open={confirmState !== null}
        title={confirmState?.title}
        description={confirmState?.description}
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

export default Configuration;