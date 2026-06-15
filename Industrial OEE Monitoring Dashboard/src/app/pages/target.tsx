import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Plus, Trash2, X, Target, LayoutGrid, List, Eye, Pencil, HelpCircle } from 'lucide-react';
import api from '../api';
import { useNotification } from "../components/ui/notification";
import ConfirmDialog from "../components/ui/confirm-dialog";
import { STATIC_TARGETS, STATIC_MACHINES, STATIC_SHIFTS } from '../data/staticData';

const emptyForm = {
    shift: '',
    machineId: '',
    target: '',
};

export function Targets() {
    const [targets, setTargets] = useState([]);
    const [machines, setMachines] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [viewTarget, setViewTarget] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [loading, setLoading] = useState(true);
    const [showHelp, setShowHelp] = useState(false);
    const { showNotification } = useNotification();
    const [confirmState, setConfirmState] = useState<{
        title: string;
        description: string;
        onConfirm: () => void;
    } | null>(null);

    useEffect(() => {
        fetchTargets();
        fetchMachines();
        fetchShifts();
    }, []);

    // Close help popover when clicking outside
    useEffect(() => {
        if (!showHelp) return;
        const handler = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('#help-popover-target') && !target.closest('#help-trigger-target')) {
                setShowHelp(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showHelp]);

    const openConfirm = (title: string, description: string, onConfirm: () => void) => {
        setConfirmState({ title, description, onConfirm });
    };

    const fetchTargets = async () => {
        setLoading(true);
        setTargets(STATIC_TARGETS);
        setLoading(false);
    };

    const fetchMachines = async () => {
        setMachines(STATIC_MACHINES);
    };

    const fetchShifts = async () => {
        setShifts(STATIC_SHIFTS);
    };

    const openAddModal = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowAddModal(true);
    };

    const openEditModal = (target: any, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setForm({
            shift: target.shift?.toString() || '',
            machineId: target.machine?.id?.toString() || target.machine_id?.toString() || target.machine?.toString() || '',
            target: target.target_quantity?.toString() || target.target?.toString() || '',
        });
        setEditingId(target.id);
        setShowViewModal(false);
        setShowAddModal(true);
    };

    const openViewModal = (target: any) => {
        setViewTarget(target);
        setShowViewModal(true);
    };

    const closeAddModal = () => {
        setShowAddModal(false);
        setForm(emptyForm);
    };

    const closeViewModal = () => {
        setShowViewModal(false);
        setViewTarget(null);
    };

    const getMachineName = (target: any) => {
        if (target.machine?.name) return target.machine.name;
        const found = machines.find(m => m.id === (target.machine_id || target.machine));
        return found?.name || '-';
    };

    const handleSave = async () => {
        if (!form.shift || !form.machineId || !form.target) return;

        try {
            const payload = {
                shift: parseInt(form.shift),
                machine: parseInt(form.machineId),
                target_quantity: parseInt(form.target),
            };

            if (editingId) {
                await api.put(`/api/targets/${editingId}/`, payload);
            } else {
                await api.post('/api/targets/', payload);
            }

            fetchTargets();
            closeAddModal();
            showNotification(
                editingId ? "Target updated successfully!" : "Target added successfully!",
                "success"
            );
        } catch (error) {
            console.error("Save failed:", error);
            showNotification("Failed to save target.", "error");
        }
    };

    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center py-16 text-[var(--text-secondary)]">
            <Target size={32} className="mb-3 opacity-30" />
            <p className="text-sm">No targets configured yet.</p>
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <p className="text-[var(--text-secondary)]">Loading targets...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-[var(--primary-color)]">Target Configuration</h2>

                    {/* Help icon + popover */}
                    <div className="relative flex items-center">
                        <button
                            id="help-trigger-target"
                            onClick={() => setShowHelp((v) => !v)}
                            className="flex items-center justify-center w-5 h-5 rounded-full text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 transition-colors cursor-pointer"
                            aria-label="Target configuration instructions"
                        >
                            <HelpCircle size={16} />
                        </button>

                        {showHelp && (
                            <div
                                id="help-popover-target"
                                className="absolute left-0 top-7 z-50 w-64 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-lg p-4"
                            >
                                {/* Arrow */}
                                <div className="absolute -top-2 left-3 w-3 h-3 rotate-45 border-l border-t border-[var(--border-color)] bg-[var(--card-bg)]" />

                                <p className="text-[10px] font-bold text-[var(--primary-color)] uppercase tracking-widest mb-3">
                                    How to configure targets
                                </p>

                                <div className="space-y-2.5 mb-3">
                                    {[
                                        { num: '1', text: 'Select a ', highlight: 'shift', rest: ' (A, B, or C) for the target.' },
                                        { num: '2', text: 'Choose the ', highlight: 'machine', rest: ' you want to set a target for.' },
                                        { num: '3', text: 'Enter the ', highlight: 'target quantity', rest: ' to be produced in that shift.' },
                                    ].map(({ num, text, highlight, rest }) => (
                                        <div key={num} className="flex items-start gap-2">
                                            <span className="shrink-0 w-4 h-4 rounded-full bg-[var(--primary-color)] text-white flex items-center justify-center font-bold text-[9px] mt-0.5">{num}</span>
                                            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                                {text}<span className="font-semibold text-[var(--text-primary)]">{highlight}</span>{rest}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Example */}
                                <div className="rounded-lg bg-[var(--hover-bg)] p-3">
                                    <p className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Example</p>
                                    <div className="space-y-1.5">
                                        {[
                                            { shift: 'Shift A', machine: 'Machine 1', target: '500', color: 'bg-blue-500' },
                                            { shift: 'Shift B', machine: 'Machine 2', target: '450', color: 'bg-violet-500' },
                                            { shift: 'Shift C', machine: 'Machine 1', target: '400', color: 'bg-emerald-500' },
                                        ].map(({ shift, machine, target, color }) => (
                                            <div key={shift + machine} className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
                                                    <span className="text-xs font-medium text-[var(--text-primary)]">{shift} · {machine}</span>
                                                </div>
                                                <span className="text-xs text-[var(--text-secondary)] tabular-nums">{target} units</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
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
                        <Plus size={16} className="mr-2" /> Add Target
                    </Button>
                </div>
            </div>

            {/* TABLE VIEW */}
            {viewMode === 'table' && (
                <Card className="bg-[var(--card-bg)] border-[var(--border-color)] overflow-hidden">
                    {targets.length === 0 ? <EmptyState /> : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[var(--border-color)]">
                                        {['Shift', 'Machine', 'Target', 'Actions'].map(h => (
                                            <th key={h} className="text-left py-3 px-4 text-sm font-medium text-[var(--text-secondary)]">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {targets.map(t => (
                                        <tr key={t.id} className="border-b border-[var(--border-color)] hover:bg-[var(--hover-bg)] transition-colors">
                                            <td className="py-3 px-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--primary-color)]/10 text-[var(--primary-color)]">
                                                    {t.shift_name || t.shift?.name || t.shift}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Target size={14} className="text-[var(--primary-color)]" />
                                                    <span className="text-sm font-medium text-[var(--text-primary)]">{getMachineName(t)}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-[var(--text-primary)] font-semibold">
                                                {t.target_quantity ?? t.target ?? '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-1">
                                                    <Button size="sm" variant="ghost" onClick={() => openViewModal(t)}>
                                                        <Eye size={15} />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={(e) => openEditModal(t, e)}>
                                                        <Pencil size={15} />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-[var(--error-color)] hover:bg-[var(--error-color)]/10"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openConfirm(
                                                                "Delete Target?",
                                                                "This target configuration will be permanently deleted.",
                                                                async () => {
                                                                    try {
                                                                        await api.delete(`/api/targets/${t.id}/`);
                                                                        fetchTargets();
                                                                        showNotification("Target deleted successfully!", "success");
                                                                    } catch {
                                                                        showNotification("Failed to delete target!", "error");
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
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            )}

            {/* GRID VIEW — compact cards */}
            {viewMode === 'grid' && (
                targets.length === 0 ? <EmptyState /> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {targets.map(t => (
                            <Card key={t.id} className="bg-[var(--card-bg)] border-[var(--border-color)] px-4 py-3 hover:bg-[var(--hover-bg)] transition-colors">
                                {/* Top: icon + name + actions */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="p-1.5 rounded-md bg-[var(--primary-color)]/10 shrink-0">
                                            <Target size={13} className="text-[var(--primary-color)]" />
                                        </div>
                                        <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
                                            {getMachineName(t)}
                                        </span>
                                    </div>
                                    <div className="flex gap-0.5 shrink-0 ml-2">
                                        <button
                                            className="p-1 rounded hover:bg-[var(--hover-bg)] text-[var(--text-secondary)] transition-colors"
                                            onClick={() => openViewModal(t)}
                                        >
                                            <Eye size={13} />
                                        </button>
                                        <button
                                            className="p-1 rounded hover:bg-[var(--hover-bg)] text-[var(--text-secondary)] transition-colors"
                                            onClick={(e) => openEditModal(t, e)}
                                        >
                                            <Pencil size={13} />
                                        </button>
                                        <button
                                            className="p-1 rounded hover:bg-[var(--error-color)]/10 text-[var(--error-color)] transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openConfirm(
                                                    "Delete Target?",
                                                    "This target configuration will be permanently deleted.",
                                                    async () => {
                                                        try {
                                                            await api.delete(`/api/targets/${t.id}/`);
                                                            fetchTargets();
                                                            showNotification("Target deleted successfully!", "success");
                                                        } catch {
                                                            showNotification("Failed to delete target!", "error");
                                                        }
                                                    }
                                                );
                                            }}
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>

                                {/* Bottom: shift badge + target value */}
                                <div className="flex items-center justify-between border-t border-[var(--border-color)] mt-2.5 pt-2">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--primary-color)]/10 text-[var(--primary-color)]">
                                        {t.shift_name || t.shift?.name || t.shift}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs text-[var(--text-secondary)]">Target</span>
                                        <span className="text-sm font-bold text-[var(--primary-color)]">
                                            {t.target_quantity ?? t.target ?? '-'}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )
            )}

            {/* VIEW DETAILS MODAL */}
            {showViewModal && viewTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeViewModal}>
                    <Card
                        className="bg-[var(--card-bg)] border-[var(--border-color)] p-6 w-full max-w-md mx-4"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-[var(--primary-color)]/10">
                                    <Target size={18} className="text-[var(--primary-color)]" />
                                </div>
                                <h3 className="font-semibold text-[var(--primary-color)]">Target Details</h3>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={(e) => openEditModal(viewTarget, e)}>
                                    <Pencil size={13} className="mr-1" /> Edit
                                </Button>
                                <Button size="sm" variant="ghost" onClick={closeViewModal}>
                                    <X size={16} />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: 'Shift', val: viewTarget.shift_name || viewTarget.shift?.name || viewTarget.shift || '-' },
                                { label: 'Machine', val: getMachineName(viewTarget) },
                                { label: 'Target', val: viewTarget.target_quantity ?? viewTarget.target ?? '-' },
                            ].map(({ label, val }) => (
                                <div key={label} className="bg-[var(--hover-bg)] rounded-lg p-3">
                                    <p className="text-xs text-[var(--text-secondary)] mb-1">{label}</p>
                                    <p className="text-sm font-semibold text-[var(--text-primary)]">{val}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {/* ADD / EDIT MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeAddModal}>
                    <Card
                        className="bg-[var(--card-bg)] border-[var(--border-color)] p-6 w-full max-w-md mx-4"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-[var(--primary-color)]">
                                {editingId ? 'Edit Target' : 'Configure Target'}
                            </h3>
                            <Button size="sm" variant="ghost" onClick={closeAddModal}>
                                <X size={16} />
                            </Button>
                        </div>

                        <div className="mb-4">
                            <Label htmlFor="shift">Shift</Label>
                            <select
                                id="shift"
                                value={form.shift}
                                onChange={e => setForm(f => ({ ...f, shift: e.target.value }))}
                                className="mt-1.5 w-full rounded-md border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-primary)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/40"
                            >
                                <option value="" disabled>Select a shift</option>
                                {shifts.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <Label htmlFor="machine">Machine</Label>
                            <select
                                id="machine"
                                value={form.machineId}
                                onChange={e => setForm(f => ({ ...f, machineId: e.target.value }))}
                                className="mt-1.5 w-full rounded-md border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-primary)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/40"
                            >
                                <option value="" disabled>Select a machine</option>
                                {machines.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-6">
                            <Label htmlFor="target">Target</Label>
                            <Input
                                id="target"
                                type="number"
                                min={0}
                                value={form.target}
                                onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
                                className="mt-1.5"
                                placeholder="e.g., 500"
                            />
                        </div>

                        <Button
                            onClick={handleSave}
                            disabled={!form.shift || !form.machineId || !form.target}
                            className="w-full bg-[#203f78] hover:bg-[#203f78]/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Save Target
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

export default Targets;