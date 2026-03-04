"use client";

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle } from 'lucide-react';
import { subscribe, ToastItem } from '@/lib/toast';

const ICONS = {
    success: <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-success" />,
    error:   <XCircle     size={15} className="shrink-0 mt-0.5 text-critical" />,
    info:    <Info        size={15} className="shrink-0 mt-0.5 text-primary" />,
    warning: <AlertTriangle size={15} className="shrink-0 mt-0.5 text-warning" />,
};

const STYLES = {
    success: 'bg-green-950/90 border-green-800/60 text-green-200',
    error:   'bg-red-950/90  border-red-800/60   text-red-200',
    info:    'bg-bg-1        border-primary/30    text-text-1',
    warning: 'bg-yellow-950/90 border-yellow-700/60 text-yellow-200',
};

export default function Toaster() {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    useEffect(() => subscribe(setToasts), []);

    if (!toasts.length) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[300] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
            {toasts.map(t => (
                <div
                    key={t.id}
                    className={`flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-2xl text-sm font-medium backdrop-blur-sm pointer-events-auto
                        ${STYLES[t.type]}`}
                >
                    {ICONS[t.type]}
                    <span className="leading-snug">{t.message}</span>
                </div>
            ))}
        </div>
    );
}
