import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Mail, Plus, Trash2, X } from 'lucide-react';
import { recipientsApi, type NotificationRecipient } from '../agent/agentApi';
import { useNotification } from '../components/ui/notification';
import ConfirmDialog from '../components/ui/confirm-dialog';

export function Recipients() {
  const [recipients, setRecipients] = useState<NotificationRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NotificationRecipient | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchRecipients();
  }, []);

  const fetchRecipients = async () => {
    setLoading(true);
    try {
      const data = await recipientsApi.list();
      setRecipients(data);
    } catch (error) {
      showNotification('Failed to load recipients.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setName('');
    setEmail('');
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setName('');
    setEmail('');
  };

  const handleSave = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      showNotification('Enter a valid email address.', 'error');
      return;
    }

    setSaving(true);
    try {
      await recipientsApi.add({ email: trimmedEmail, name: name.trim() || undefined });
      await fetchRecipients();
      closeAddModal();
      showNotification('Recipient added successfully!', 'success');
    } catch (error: any) {
      const msg = error?.response?.data?.detail || 'Failed to add recipient.';
      showNotification(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await recipientsApi.remove(deleteTarget.id);
      setRecipients((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      showNotification('Recipient removed successfully!', 'success');
    } catch (error) {
      showNotification('Failed to remove recipient.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-[var(--text-secondary)]">
      <Mail size={32} className="mb-3 opacity-30" />
      <p className="text-sm">No recipients added yet.</p>
      <p className="text-xs mt-1">
        Work-order and incident emails won't be sent until you add at least one.
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-[var(--text-secondary)]">Loading recipients...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--primary-color)]">Notification Recipients</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Automated work-order and incident emails are sent to everyone in this list.
          </p>
        </div>
        <Button onClick={openAddModal} className="bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90 text-white">
          <Plus size={16} className="mr-2" /> Add Recipient
        </Button>
      </div>

      {/* List */}
      <Card className="bg-[var(--card-bg)] border-[var(--border-color)]">
        {recipients.length === 0 ? (
          <EmptyState />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="text-left py-3 px-4 text-xs font-medium text-[var(--text-secondary)]">Name</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[var(--text-secondary)]">Email</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-[var(--text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipients.map((r) => (
                <tr key={r.id} className="border-b border-[var(--border-color)] hover:bg-[var(--hover-bg)]">
                  <td className="py-2.5 px-4 text-sm text-[var(--text-primary)]">{r.name || '-'}</td>
                  <td className="py-2.5 px-4 text-sm text-[var(--text-primary)] flex items-center gap-2">
                    <Mail size={13} className="text-[var(--primary-color)]" />
                    {r.email}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteTarget(r)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeAddModal}>
          <Card
            className="bg-[var(--card-bg)] border-[var(--border-color)] p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-[var(--primary-color)]">Add Recipient</h3>
              <Button size="sm" variant="ghost" onClick={closeAddModal}>
                <X size={16} />
              </Button>
            </div>

            <div className="mb-4">
              <Label htmlFor="recipientName">Name (optional)</Label>
              <Input
                id="recipientName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5"
                placeholder="e.g., Maintenance Lead"
              />
            </div>

            <div className="mb-6">
              <Label htmlFor="recipientEmail">Email</Label>
              <Input
                id="recipientEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5"
                placeholder="e.g., name@company.com"
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90 text-white"
            >
              {saving ? 'Saving...' : 'Save Recipient'}
            </Button>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remove Recipient?"
        description={`${deleteTarget?.email ?? ''} will no longer receive automated emails.`}
        confirmText="Remove"
        cancelText="Cancel"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default Recipients;
