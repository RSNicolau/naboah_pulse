"use client";

import React, { useEffect, useState } from 'react';
import { Share2, CheckCircle2, AlertCircle, RefreshCw, Wifi, Brain, Loader2 } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { toast } from '@/lib/toast';

type ChannelAccount = {
    id: string;
    channel_type: string;
    label: string;
    color: string;
    type: string;
    external_account_id: string;
    status: string;
    health_metrics: Record<string, unknown>;
    created_at: string;
};

const CHANNEL_ICONS: Record<string, string> = {
    whatsapp:  '💬',
    instagram: '📸',
    email:     '📧',
    facebook:  '👍',
    telegram:  '✈️',
};

const MOCK_UPCOMING = [
    { name: 'HubSpot CRM',   type: 'CRM',        color: '#FF7A59', icon: 'H', status: 'soon' },
    { name: 'Google Ads',    type: 'Ads',         color: '#4285F4', icon: 'G', status: 'soon' },
    { name: 'Salesforce',    type: 'CRM',         color: '#00A1E0', icon: 'S', status: 'soon' },
    { name: 'Make.com',      type: 'Automation',  color: '#6E14EF', icon: 'M', status: 'soon' },
];

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function IntegrationsGrid() {
    const [channels, setChannels] = useState<ChannelAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncingId, setSyncingId] = useState<string | null>(null);
    const [omniStatus, setOmniStatus] = useState<{ status: string; agents?: number; pending_tasks?: number } | null>(null);
    const [omniLoading, setOmniLoading] = useState(true);

    useEffect(() => {
        apiGet<ChannelAccount[]>('/integrations/channels')
            .then(setChannels)
            .catch(() => toast.error('Erro ao carregar integrações'))
            .finally(() => setLoading(false));
        apiGet<{ status: string; agents?: number; pending_tasks?: number }>('/omnimind/status')
            .then(setOmniStatus)
            .catch(() => setOmniStatus(null))
            .finally(() => setOmniLoading(false));
    }, []);

    const activeCount = channels.filter((c) => c.status === 'active').length;

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-y-auto custom-scrollbar">
            <div className="p-8 max-w-6xl mx-auto w-full flex flex-col gap-8 pb-20">

                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-ai/10 border border-ai/20 flex items-center justify-center shadow-lg shadow-ai/10">
                                <Share2 className="text-ai w-6 h-6" />
                            </div>
                            Integrations Hub
                        </h2>
                        <p className="text-text-3 text-sm">
                            {loading ? 'A carregar...' : `${activeCount} canal${activeCount !== 1 ? 'is' : ''} conectado${activeCount !== 1 ? 's' : ''} e operacional${activeCount !== 1 ? 'is' : ''}`}
                        </p>
                    </div>
                </div>

                {/* Active Channels */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-[10px] font-bold text-text-3 uppercase tracking-widest flex items-center gap-2">
                        <Wifi size={11} className="text-success" /> Canais Nativos Conectados
                    </h3>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="bg-bg-1 border border-stroke rounded-2xl p-5 animate-pulse">
                                    <div className="w-10 h-10 rounded-xl bg-surface-2 mb-4" />
                                    <div className="h-3 w-24 bg-surface-2 rounded mb-2" />
                                    <div className="h-2.5 w-16 bg-surface-2 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : channels.length === 0 ? (
                        <div className="bg-bg-1 border border-dashed border-stroke rounded-2xl p-10 flex flex-col items-center gap-3">
                            <AlertCircle size={28} className="text-text-3" />
                            <p className="text-sm text-text-3">Nenhum canal configurado. Execute o seed para adicionar canais.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {channels.map((ch) => {
                                const isActive = ch.status === 'active';
                                return (
                                    <div
                                        key={ch.id}
                                        className="bg-bg-1 border border-stroke rounded-2xl p-5 flex flex-col gap-4 hover:border-primary/30 transition-all group"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div
                                                className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-sm"
                                                style={{ backgroundColor: `${ch.color}20`, border: `1px solid ${ch.color}40` }}
                                            >
                                                {CHANNEL_ICONS[ch.channel_type] ?? '🔌'}
                                            </div>
                                            {isActive ? (
                                                <CheckCircle2 size={16} className="text-success" />
                                            ) : (
                                                <AlertCircle size={16} className="text-warning" />
                                            )}
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors mb-0.5">
                                                {ch.label}
                                            </h4>
                                            <p className="text-[10px] text-text-3">{ch.type}</p>
                                        </div>

                                        <div className="flex flex-col gap-1.5 text-[10px] text-text-3">
                                            <div className="flex items-center justify-between">
                                                <span>Conta</span>
                                                <span className="text-text-2 font-mono truncate max-w-[120px]">{ch.external_account_id}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span>Desde</span>
                                                <span className="text-text-2">{formatDate(ch.created_at)}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-stroke">
                                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                                isActive ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                                            }`}>
                                                {isActive ? 'Ativo' : ch.status}
                                            </span>
                                            <button
                                                disabled={syncingId === ch.id}
                                                onClick={async () => {
                                                    setSyncingId(ch.id);
                                                    try {
                                                        await apiPost('/integrations/channels/' + ch.id + '/sync', {});
                                                        toast.success('Sincronização iniciada');
                                                    } catch {
                                                        toast.error('Erro ao sincronizar');
                                                    } finally {
                                                        setSyncingId(null);
                                                    }
                                                }}
                                                className="text-[10px] text-text-3 hover:text-white transition-colors flex items-center gap-1 disabled:opacity-50"
                                            >
                                                <RefreshCw size={10} className={syncingId === ch.id ? 'animate-spin' : ''} /> {syncingId === ch.id ? 'A sincronizar...' : 'Sincronizar'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* AI & Intelligence */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-[10px] font-bold text-text-3 uppercase tracking-widest flex items-center gap-2">
                        <Brain size={11} className="text-primary" /> AI &amp; Intelligence
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-bg-1 border border-stroke rounded-2xl p-5 flex flex-col gap-4 hover:border-primary/30 transition-all group">
                            <div className="flex items-start justify-between">
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20 shadow-sm">
                                    <Brain size={22} className="text-primary" />
                                </div>
                                {omniLoading ? (
                                    <Loader2 size={16} className="animate-spin text-text-3" />
                                ) : omniStatus?.status === 'ok' ? (
                                    <CheckCircle2 size={16} className="text-success" />
                                ) : (
                                    <AlertCircle size={16} className="text-warning" />
                                )}
                            </div>

                            <div>
                                <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors mb-0.5">
                                    OmniMind AI
                                </h4>
                                <p className="text-[10px] text-text-3">Intelligence Layer</p>
                            </div>

                            <div className="flex flex-col gap-1.5 text-[10px] text-text-3">
                                <div className="flex items-center justify-between">
                                    <span>Agents</span>
                                    <span className="text-text-2 font-mono">{omniStatus?.agents ?? '—'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Pending Tasks</span>
                                    <span className="text-text-2 font-mono">{omniStatus?.pending_tasks ?? '—'}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-stroke">
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                    omniStatus?.status === 'ok'
                                        ? 'bg-success/10 text-success'
                                        : 'bg-warning/10 text-warning'
                                }`}>
                                    {omniStatus?.status === 'ok' ? 'Connected' : 'Offline'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upcoming integrations */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Em Breve</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {MOCK_UPCOMING.map((item) => (
                            <div
                                key={item.name}
                                className="bg-bg-1 border border-stroke/50 rounded-2xl p-4 flex flex-col gap-3 opacity-50 cursor-not-allowed"
                            >
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                                    style={{ backgroundColor: item.color }}
                                >
                                    {item.icon}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white mb-0.5">{item.name}</h4>
                                    <p className="text-[10px] text-text-3">{item.type}</p>
                                </div>
                                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-surface-2 text-text-3 self-start">
                                    Em breve
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
