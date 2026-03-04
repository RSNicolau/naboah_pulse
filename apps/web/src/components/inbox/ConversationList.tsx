"use client";

import React, { useEffect, useState } from 'react';
import { Instagram, Mail, MessageSquare, Phone, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { apiGet } from '@/lib/api';
import { toast } from '@/lib/toast';
import { supabase } from '@/lib/supabase';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface ConversationSummary {
    id: string;
    contact_name: string;
    contact_id: string;
    contact_phone: string | null;
    channel: string;
    status: string;
    priority: string;
    intent: string | null;
    last_message: string;
    updated_at: string;
}

interface Props {
    selectedId: string | null;
    onSelect: (id: string, conv: ConversationSummary) => void;
}

function ChannelIcon({ channel }: { channel: string }) {
    if (channel === 'instagram') return <Instagram size={14} className="text-primary" />;
    if (channel === 'whatsapp') return <MessageSquare size={14} className="text-secondary" />;
    if (channel === 'email') return <Mail size={14} className="text-ai" />;
    return <Phone size={14} className="text-text-3" />;
}

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
}

const PRIORITY_COLORS: Record<string, string> = {
    urgent: 'bg-critical/10 text-critical border-critical/20',
    high:   'bg-warning/10 text-warning border-warning/20',
    medium: 'bg-ai/10 text-ai border-ai/20',
    low:    'bg-surface-2 text-text-3 border-stroke',
};

const STATUS_FILTERS = [
    { key: 'open',     label: 'Abertas' },
    { key: 'all',      label: 'Todas' },
    { key: 'resolved', label: 'Resolvidas' },
    { key: 'pending',  label: 'Pendentes' },
];

const CHANNEL_FILTERS = [
    { key: 'all',       label: 'Todos',  icon: null },
    { key: 'whatsapp',  label: 'WA',     icon: <MessageSquare size={10} /> },
    { key: 'instagram', label: 'IG',     icon: <Instagram size={10} /> },
    { key: 'email',     label: 'Email',  icon: <Mail size={10} /> },
];

export default function ConversationList({ selectedId, onSelect }: Props) {
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('open');
    const [channelFilter, setChannelFilter] = useState<string>('all');

    function reload() {
        apiGet<ConversationSummary[]>('/conversations')
            .then((data) => {
                setConversations(data);
                if (data.length > 0 && !selectedId) {
                    const first = data.find(c => c.status !== 'resolved') ?? data[0];
                    onSelect(first.id, first);
                }
            })
            .catch(() => toast.error('Erro ao carregar conversas'))
            .finally(() => setLoading(false));
    }

    useEffect(() => { reload(); }, []);

    // Supabase Realtime: refresh list on new/updated conversations
    useEffect(() => {
        const channel = supabase
            .channel('conversation-list')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'conversation' }, () => {
                apiGet<ConversationSummary[]>('/conversations')
                    .then(setConversations)
                    .catch(() => toast.error('Erro ao atualizar conversas'));
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, []);

    const filtered = conversations.filter((c) => {
        if (statusFilter !== 'all' && c.status !== statusFilter) return false;
        if (channelFilter !== 'all' && c.channel !== channelFilter) return false;
        return true;
    });

    return (
        <div className="flex flex-col h-full bg-bg-1 border-r border-stroke w-80 flex-shrink-0">
            {/* Header */}
            <div className="p-4 border-b border-stroke flex items-center justify-between">
                <h2 className="font-bold text-lg text-white">Inbox</h2>
                <span className="text-[10px] font-bold text-text-3 bg-surface-2 px-2 py-1 rounded-lg">
                    {filtered.length}
                </span>
            </div>

            {/* Status filter tabs */}
            <div className="flex gap-1 p-2 border-b border-stroke overflow-x-auto">
                {STATUS_FILTERS.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setStatusFilter(key)}
                        className={cn(
                            'flex-shrink-0 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all',
                            statusFilter === key
                                ? 'bg-primary/15 text-primary border border-primary/30'
                                : 'text-text-3 hover:text-text-1 hover:bg-surface-1'
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Channel filter */}
            <div className="flex gap-1 px-2 py-1.5 border-b border-stroke/50">
                {CHANNEL_FILTERS.map(({ key, label, icon }) => (
                    <button
                        key={key}
                        onClick={() => setChannelFilter(key)}
                        className={cn(
                            'flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all',
                            channelFilter === key
                                ? 'bg-surface-2 text-white border border-stroke'
                                : 'text-text-3 hover:text-text-1'
                        )}
                    >
                        {icon} {label}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading && (
                    <div className="flex items-center justify-center h-32">
                        <Loader2 size={16} className="animate-spin text-primary" />
                    </div>
                )}
                {!loading && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-2 h-32 px-4 text-center">
                        <MessageSquare size={20} className="text-text-3" />
                        <p className="text-xs text-text-3">
                            {conversations.length === 0
                                ? 'Sem conversas'
                                : 'Sem resultados para este filtro'}
                        </p>
                    </div>
                )}
                {filtered.map((conv) => (
                    <div
                        key={conv.id}
                        onClick={() => onSelect(conv.id, conv)}
                        className={cn(
                            "p-4 border-b border-stroke/50 cursor-pointer transition-colors group relative",
                            conv.id === selectedId ? "bg-surface-2/50" : "hover:bg-surface-1"
                        )}
                    >
                        {conv.id === selectedId && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 jarvis-gradient" />
                        )}
                        <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-surface-1 flex items-center justify-center border border-stroke flex-shrink-0">
                                    <ChannelIcon channel={conv.channel} />
                                </div>
                                <span className="text-sm font-bold text-text-1 group-hover:text-white truncate max-w-[130px]">
                                    {conv.contact_name}
                                </span>
                            </div>
                            <span className="text-[10px] text-text-3 flex-shrink-0">
                                {timeAgo(conv.updated_at)}
                            </span>
                        </div>
                        <p className="text-xs text-text-3 truncate ml-10 line-clamp-1">
                            {conv.last_message || '—'}
                        </p>
                        <div className="flex gap-1.5 mt-2 ml-10 flex-wrap">
                            <span className={cn(
                                'text-[9px] px-1.5 py-0.5 rounded-full border',
                                PRIORITY_COLORS[conv.priority] ?? PRIORITY_COLORS.medium
                            )}>
                                {conv.priority}
                            </span>
                            <span className={cn(
                                'text-[9px] px-1.5 py-0.5 rounded-full uppercase',
                                conv.status === 'resolved'
                                    ? 'bg-success/10 text-success'
                                    : 'bg-surface-2 text-text-3'
                            )}>
                                {conv.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
