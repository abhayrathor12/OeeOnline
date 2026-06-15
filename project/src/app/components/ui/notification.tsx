import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

type NotificationType = "success" | "error" | "info" | "warning";

interface Notification {
    id: number;
    message: string;
    type: NotificationType;
}

interface NotificationContextType {
    showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error("useNotification must be used inside NotificationProvider");
    return context;
};

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = useCallback((message: string, type: NotificationType = "info") => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 3000);
    }, []);

    const removeNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case "success": return <CheckCircle size={18} />;
            case "error": return <XCircle size={18} />;
            case "warning": return <AlertTriangle size={18} />;
            default: return <Info size={18} />;
        }
    };

    const getColor = (type: NotificationType) => {
        switch (type) {
            case "success": return "bg-green-500";
            case "error": return "bg-red-500";
            case "warning": return "bg-yellow-500";
            default: return "bg-blue-500";
        }
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}

            <div className="fixed top-5 right-5 space-y-3 z-50">
                {notifications.map(n => (
                    <div
                        key={n.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-white shadow-lg ${getColor(n.type)} animate-slide-in`}
                    >
                        {getIcon(n.type)}
                        <span className="text-sm">{n.message}</span>
                        <button onClick={() => removeNotification(n.id)}>
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};