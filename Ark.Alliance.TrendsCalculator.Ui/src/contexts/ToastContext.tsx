/**
 * @fileoverview Toast Notification Context
 * @module contexts/ToastContext
 * 
 * Provides global toast notification functionality for displaying
 * user feedback messages (success, error, warning, info).
 * 
 * @description
 * This context manages a queue of toast notifications with automatic
 * dismissal based on configurable duration. Supports stacking multiple
 * toasts and manual dismissal.
 * 
 * @example
 * ```tsx
 * // In provider
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * 
 * // In component
 * const { showToast } = useToast();
 * showToast('Operation successful!', NotificationType.SUCCESS);
 * ```
 * 
 * @author Armand Richelet-Kleinberg
 * @since 2025-12-28
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { NotificationType } from '@share/trends';

/**
 * Toast notification model
 * 
 * @interface Toast
 * @property {string} id - Unique identifier for the toast
 * @property {string} message - Notification message to display
 * @property {NotificationType} type - Notification type determining visual style
 * @property {number} [duration=3000] - Auto-dismiss duration in milliseconds (0 = no auto-dismiss)
 */
interface Toast {
    /** Unique toast identifier */
    id: string;
    /** Message to display */
    message: string;
    /** Notification type (success, error, warning, info) */
    type: NotificationType;
    /** Auto-dismiss duration in ms (0 = no auto-dismiss) */
    duration?: number;
}

/**
 * Toast context interface
 * 
 * @interface ToastContextType
 * @property {Toast[]} toasts - Array of current active toasts
 * @property {Function} showToast - Display a new toast notification
 * @property {Function} removeToast - Manually dismiss a toast by ID
 */
interface ToastContextType {
    /** Array of currently active toasts */
    toasts: Toast[];
    /** Display a new toast notification */
    showToast: (message: string, type: NotificationType, duration?: number) => void;
    /** Manually remove a toast by ID */
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: Toast['type'], duration = 3000) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        const toast: Toast = { id, message, type, duration };

        setToasts(prev => [...prev, toast]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}
