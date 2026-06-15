import React from "react";
import { Card } from "./card";
import { Button } from "./button";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
    open: boolean;
    title?: string;
    description?: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
}

export default function ConfirmDialog({
    open,
    title = "Are you sure?",
    description = "This action cannot be undone.",
    onConfirm,
    onCancel,
    confirmText = "Delete",
    cancelText = "Cancel",
}: ConfirmDialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card
                className="bg-[var(--card-bg)] border-[var(--border-color)] p-6 w-full max-w-md mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start gap-4 mb-4">
                    <div className="p-2 rounded-full bg-red-100">
                        <AlertTriangle size={20} className="text-red-600" />
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                            {title}
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                            {description}
                        </p>
                    </div>

                    <button onClick={onCancel} className="ml-auto">
                        <X size={16} />
                    </button>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onCancel}>
                        {cancelText}
                    </Button>
                    <Button
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
