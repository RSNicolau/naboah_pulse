"use client";

import React, { useEffect, useState } from 'react';
import { BarChart3, Download, MessageSquare, TrendingUp, Users, CheckCircle2, Loader2, DollarSign, Ticket } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { toast } from '@/lib/toast';

type Reports = {
    summary: {
        total_conversations: number;
        total_messages: number;
        total_contacts: number;
        resolution_rate: string;
        avg_messages_per_conversation: number;
        pipeline_value: number;
        open_deals: number;
        open_tickets: number;
    };
    by_status: { status: string; count: number }[];
    by_channel: { channel: string; count: number }[];
    by_priority: { priority: string; count: number }[];
    daily_messages: { date: string; count: number }[];
};

const CHANNEL_COLORS: Record<string, string> = {
    Whatsapp: 'bg-success',
    Instagram: 'bg-primary',
    Email: 'bg-ai',
    Other: 'bg-text-3',
};

const STATUS_COLORS: Record<string, string> = {
    open: 'bg-warning',
    pending: 'bg-text-3',
    closed: 'bg-success',
};

const PRIORITY_COLORS: Record<string, string> = {
    urgent: 'bg-critical',
    high: 'bg-warning',
    medium: 'bg-ai',
    low: 'bg-text-3',
};

function formatBRL(v: number): string {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

function shortDate(iso: string): string {
    const d = new Date(iso);
    return `${d.getDate()}/${d.getMonth() + 1}`;
}

export default function ReportingDashboard() {
    const [data, setData] = useState<Reports | null>(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        setExporting(true);
        try {
            const exportData = await apiGet('/reports/export');
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pulse-report-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('Relatório exportado com sucesso');
        } catch {
            toast.error('Erro ao exportar relatório');
        } finally {
            setExporting(false);
        }
    };

    useEffect(() => {
        apiGet<Reports>('/analytics/reports').then(setData).catch(() => toast.error('Erro ao carregar relatórios')).finally(() => setLoading(false));
    }, []);

    const maxDaily = data ? Math.max(...data.daily_messages.map((d) => d.count), 1) : 1;
    const totalByChannel = data ? data.by_channel.reduce((a, c) => a + c.count, 0) : 1;
    const totalByStatus  = data ? data.by_status.reduce((a, c) => a + c.count, 0) : 1;

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-y-auto custom-scrollbar">
            <div className="p-8 max-w-7xl mx-auto w-full flex flex-col gap-8 pb-20">

                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-ai/10 border border-ai/20 flex items-center justify-center">
                                <BarChart3 className="text-ai w-6 h-6" />
                            </div>
                            Pulse BI & Reports
                        </h2>
                        <p className="text-text-3 text-sm">Insights reais conectados ao banco de dados da plataforma.</p>
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={exporting || loading}
                        className="jarvis-gradient px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-lg shadow-primary/20 flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        <Download size={14} className={exporting ? 'animate-bounce' : ''} />
                        {exporting ? 'Exportando...' : 'Exportar Dados'}
                    </button>
                </div>

                {/* KPI Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {loading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="bg-bg-1 border border-stroke p-5 rounded-2xl animate-pulse">
                                <div className="h-8 w-8 bg-surface-2 rounded-xl mb-3" />
                                <div className="h-3 w-20 bg-surface-2 rounded mb-2" />
                                <div className="h-7 w-16 bg-surface-2 rounded" />
                            </div>
                        ))
                    ) : data ? (
                        [
                            { label: 'Total Conversas',   value: data.summary.total_conversations,  icon: MessageSquare, color: 'text-primary', border: 'border-primary/20' },
                            { label: 'Total Mensagens',   value: data.summary.total_messages,       icon: TrendingUp,    color: 'text-ai',      border: 'border-ai/20' },
                            { label: 'Contactos',         value: data.summary.total_contacts,       icon: Users,         color: 'text-warning', border: 'border-warning/20' },
                            { label: 'Taxa Resolução',    value: data.summary.resolution_rate,      icon: CheckCircle2,  color: 'text-success', border: 'border-success/20' },
                            { label: 'Msgs/Conversa',     value: data.summary.avg_messages_per_conversation, icon: MessageSquare, color: 'text-text-2', border: 'border-stroke' },
                            { label: 'Pipeline',          value: formatBRL(data.summary.pipeline_value), icon: DollarSign, color: 'text-ai', border: 'border-ai/20' },
                            { label: 'Deals Abertos',     value: data.summary.open_deals,           icon: TrendingUp,    color: 'text-primary', border: 'border-primary/20' },
                            { label: 'Tickets Abertos',   value: data.summary.open_tickets,         icon: Ticket,        color: 'text-warning', border: 'border-warning/20' },
                        ].map((kpi) => (
                            <div key={kpi.label} className={`bg-bg-1 border ${kpi.border} p-5 rounded-2xl flex items-center gap-3`}>
                                <div className={`w-9 h-9 rounded-xl bg-surface-1 flex items-center justify-center flex-shrink-0 ${kpi.color}`}>
                                    <kpi.icon size={18} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-bold text-text-3 uppercase tracking-widest truncate">{kpi.label}</p>
                                    <p className="text-xl font-black text-white">{kpi.value}</p>
                                </div>
                            </div>
                        ))
                    ) : null}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Daily Messages — last 30 days bar chart */}
                    <div className="lg:col-span-2 bg-bg-1 border border-stroke rounded-2xl p-6 flex flex-col gap-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Mensagens nos Últimos 30 Dias</h3>
                        {loading ? (
                            <div className="h-48 animate-pulse bg-surface-2 rounded-xl" />
                        ) : data ? (
                            <div className="flex items-end gap-1 h-48">
                                {data.daily_messages.map((day, i) => {
                                    const pct = Math.round((day.count / maxDaily) * 100);
                                    const isToday = i === data.daily_messages.length - 1;
                                    return (
                                        <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                                            <div
                                                className={`w-full rounded-t-sm transition-all ${isToday ? 'jarvis-gradient' : 'bg-surface-2 group-hover:bg-primary/40'}`}
                                                style={{ height: `${Math.max(pct, 2)}%` }}
                                            />
                                            {(i % 5 === 0 || isToday) && (
                                                <span className="text-[8px] text-text-3 font-bold">{shortDate(day.date)}</span>
                                            )}
                                            {day.count > 0 && (
                                                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-bg-0 border border-stroke px-1.5 py-0.5 rounded text-[9px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                    {day.count}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : null}
                    </div>

                    {/* Channel Distribution */}
                    <div className="bg-bg-1 border border-stroke rounded-2xl p-6 flex flex-col gap-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Por Canal</h3>
                        {loading ? (
                            <div className="flex flex-col gap-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="h-2.5 w-full bg-surface-2 rounded mb-1.5" />
                                        <div className="h-1.5 w-full bg-surface-2 rounded-full" />
                                    </div>
                                ))}
                            </div>
                        ) : data ? (
                            <div className="flex flex-col gap-4">
                                {data.by_channel.map((ch) => {
                                    const pct = Math.round(ch.count / totalByChannel * 100);
                                    const bar = CHANNEL_COLORS[ch.channel] ?? 'bg-text-3';
                                    return (
                                        <div key={ch.channel} className="flex flex-col gap-1.5">
                                            <div className="flex justify-between text-[11px] font-bold">
                                                <span className="text-text-2">{ch.channel}</span>
                                                <span className="text-white">{pct}% <span className="text-text-3 font-normal">({ch.count})</span></span>
                                            </div>
                                            <div className="h-1.5 w-full bg-bg-0 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Status Breakdown */}
                    <div className="bg-bg-1 border border-stroke rounded-2xl p-6 flex flex-col gap-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Status das Conversas</h3>
                        {loading ? (
                            <div className="h-32 animate-pulse bg-surface-2 rounded-xl" />
                        ) : data ? (
                            <div className="flex flex-col gap-3">
                                {data.by_status.map((s) => {
                                    const pct = Math.round(s.count / totalByStatus * 100);
                                    return (
                                        <div key={s.status} className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_COLORS[s.status] ?? 'bg-text-3'}`} />
                                            <div className="flex-1">
                                                <div className="flex justify-between text-[11px] font-bold mb-1">
                                                    <span className="text-text-2 capitalize">{s.status}</span>
                                                    <span className="text-white">{s.count}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-bg-0 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${STATUS_COLORS[s.status] ?? 'bg-text-3'}`} style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : null}
                    </div>

                    {/* Priority Breakdown */}
                    <div className="bg-bg-1 border border-stroke rounded-2xl p-6 flex flex-col gap-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Prioridade das Conversas</h3>
                        {loading ? (
                            <div className="h-32 animate-pulse bg-surface-2 rounded-xl" />
                        ) : data ? (
                            <div className="flex flex-col gap-3">
                                {data.by_priority.map((p) => {
                                    const total = data.by_priority.reduce((a, x) => a + x.count, 0);
                                    const pct = Math.round(p.count / Math.max(total, 1) * 100);
                                    return (
                                        <div key={p.priority} className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_COLORS[p.priority] ?? 'bg-text-3'}`} />
                                            <div className="flex-1">
                                                <div className="flex justify-between text-[11px] font-bold mb-1">
                                                    <span className="text-text-2 capitalize">{p.priority}</span>
                                                    <span className="text-white">{p.count}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-bg-0 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${PRIORITY_COLORS[p.priority] ?? 'bg-text-3'}`} style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
