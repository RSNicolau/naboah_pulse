"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Bell, X, MessageSquare, Ticket, Briefcase, MessageCircle, CheckCheck } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { toast } from '@/lib/toast';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type Notification = {
    id: string;
    type: 'message' | 'ticket' | 'deal' | 'conversation';
    icon: string;
    title: string;
    body: string;
    href: string;
    created_at: string;
    priority: string;
};

const TYPE_COLOR: Record<string, string> = {
    message:      'bg-primary/10 text-primary',
    ticket:       'bg-critical/10 text-critical',
    deal:         'bg-success/10 text-success',
    conversation: 'bg-ai/10 text-ai',
};

const TYPE_ICON: Record<string, React.ReactNode> = {
    message:      <MessageSquare size={14} />,
    ticket:       <Ticket size={14} />,
    deal:         <Briefcase size={14} />,
    conversation: <MessageCircle size={14} />,
};

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'agora';
    if (m < 60) return `${m}min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
}

type NotifPrefs = { message: boolean; ticket: boolean; deal: boolean; conversation: boolean };
const PREF_KEY = 'nb_notif_prefs';
const DEFAULT_PREFS: NotifPrefs = { message: true, ticket: true, deal: true, conversation: true };

function loadPrefs(): NotifPrefs {
    if (typeof window === 'undefined') return DEFAULT_PREFS;
    try { return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(PREF_KEY) ?? '{}') }; }
    catch { return DEFAULT_PREFS; }
}

export default function NotificationsPanel() {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<Notification[]>([]);
    const [readIds, setReadIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
    const panelRef = useRef<HTMLDivElement>(null);

    // Sync prefs from localStorage whenever panel opens
    useEffect(() => {
        if (open) setPrefs(loadPrefs());
    }, [open]);

    const visible = items.filter((n) => prefs[n.type as keyof NotifPrefs] !== false);
    const unread = visible.filter((n) => !readIds.has(n.id)).length;

    async function load() {
        setLoading(true);
        try {
            const data = await apiGet<Notification[]>('/notifications/');
            setItems(data);
        } catch (e) {
            toast.error('Erro ao carregar notificações');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();

        // Supabase Realtime — refresh on new messages or tickets
        const channel = supabase
            .channel('notifications-feed')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'message' }, () => load())
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket' }, () => load())
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversation' }, () => load())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    // Close on click outside
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    function markAllRead() {
        setReadIds(new Set(visible.map((n) => n.id)));
    }

    function markRead(id: string) {
        setReadIds((prev) => new Set(Array.from(prev).concat(id)));
    }

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <button
                onClick={() => setOpen((o) => !o)}
                className="relative text-text-3 hover:text-text-1 transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unread > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-critical border-2 border-bg-1 flex items-center justify-center text-[9px] font-black text-white">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {/* Panel */}
            {open && (
                <div className="absolute right-0 top-8 w-96 bg-bg-1 border border-stroke rounded-2xl shadow-2xl shadow-black/40 z-50 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-stroke">
                        <div className="flex items-center gap-2">
                            <Bell size={14} className="text-primary" />
                            <span className="text-sm font-black text-white uppercase tracking-widest">Notificações</span>
                            {unread > 0 && (
                                <span className="text-[9px] font-black px-1.5 py-0.5 bg-critical/10 text-critical border border-critical/20 rounded-full">
                                    {unread} novas
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {unread > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-[10px] text-text-3 hover:text-primary transition-colors flex items-center gap-1"
                                >
                                    <CheckCheck size={12} /> Marcar todas
                                </button>
                            )}
                            <button onClick={() => setOpen(false)} className="text-text-3 hover:text-white transition-colors ml-1">
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="overflow-y-auto max-h-[480px] custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col gap-0">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="px-5 py-4 border-b border-stroke/50 animate-pulse flex gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-surface-2 flex-shrink-0" />
                                        <div className="flex-1 flex flex-col gap-2">
                                            <div className="h-3 w-40 bg-surface-2 rounded" />
                                            <div className="h-2.5 w-56 bg-surface-2 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : visible.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
                                <Bell size={28} className="text-text-3" />
                                <p className="text-sm text-text-3">
                                    {items.length === 0 ? 'Sem notificações recentes' : 'Todos os tipos estão desativados nas preferências'}
                                </p>
                            </div>
                        ) : (
                            visible.map((n) => {
                                const isUnread = !readIds.has(n.id);
                                return (
                                    <Link
                                        key={n.id}
                                        href={n.href}
                                        onClick={() => { markRead(n.id); setOpen(false); }}
                                        className={`flex gap-3 px-5 py-4 border-b border-stroke/50 hover:bg-surface-1/50 transition-colors group ${isUnread ? 'bg-surface-1/20' : ''}`}
                                    >
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${TYPE_COLOR[n.type] ?? 'bg-surface-2 text-text-3'}`}>
                                            {TYPE_ICON[n.type] ?? <Bell size={14} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-0.5">
                                                <span className={`text-xs font-bold truncate ${isUnread ? 'text-white' : 'text-text-2'}`}>
                                                    {n.title}
                                                </span>
                                                <span className="text-[9px] text-text-3 flex-shrink-0">{timeAgo(n.created_at)}</span>
                                            </div>
                                            <p className="text-[11px] text-text-3 line-clamp-2">{n.body}</p>
                                        </div>
                                        {isUnread && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                        )}
                                    </Link>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {visible.length > 0 && (
                        <div className="px-5 py-3 border-t border-stroke">
                            <p className="text-[9px] text-text-3 text-center">Últimos 7 dias · {visible.length} eventos</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
