// Lightweight event-emitter toast system — no external deps

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
    id: number;
    message: string;
    type: ToastType;
}

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
let listeners: Listener[] = [];
let nextId = 0;

function notify() {
    const snapshot = [...toasts];
    listeners.forEach(l => l(snapshot));
}

function add(message: string, type: ToastType, duration = 4000) {
    const id = nextId++;
    toasts = [...toasts, { id, message, type }];
    notify();
    setTimeout(() => {
        toasts = toasts.filter(t => t.id !== id);
        notify();
    }, duration);
}

export const toast = {
    success: (message: string) => add(message, 'success'),
    error:   (message: string) => add(message, 'error'),
    info:    (message: string) => add(message, 'info'),
    warning: (message: string) => add(message, 'warning'),
};

export function subscribe(listener: Listener): () => void {
    listeners = [...listeners, listener];
    listener([...toasts]); // send current state immediately
    return () => {
        listeners = listeners.filter(l => l !== listener);
    };
}
