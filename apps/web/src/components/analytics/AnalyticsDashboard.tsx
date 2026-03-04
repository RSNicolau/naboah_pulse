"use client";

import React, { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { toast } from '@/lib/toast';
import {
    MessageSquare, Inbox, Zap, Users, ArrowRight, TrendingUp,
    DollarSign, Ticket, CheckCircle2, AlertTriangle, Bot,
    GitBranch, LifeBuoy, BarChart3, Clock,
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type KPIs = {
    total_conversations: number;
    open_conversations: number;
    total_messages: number;
    total_contacts: number;
    pipeline_value: number;
    open_deals: number;
    open_tickets: number;
    resolution_rate: number;
    high_churn_contacts: number;
};

type ChannelStat = { name: string; count: number };
type DayCount = { day: string; count: number };
type RecentConv = {
    id: string;
    contact_name: string;
    channel: string;
    status: string;
    priority: string;
    last_message: string;
    updated_at: string | null;
};
type SLAAlert = {
    id: string;
    subject: string;
    priority: string;
    overdue: boolean;
    due_in_hours: number;
};

type DashboardData = {
    kpis: KPIs;
    channels: ChannelStat[];
    daily_messages: DayCount[];
    recent_conversations: RecentConv[];
    sla_alerts: SLAAlert[];
};

const CHANNEL_COLORS: Record<string, string> = {
    WhatsApp: 'bg-success',
    Instagram: 'bg-primary',
    Email: 'bg-ai',
    Other: 'bg-text-3',
};

const STATUS_STYLES: Record<string, string> = {
    open: 'bg-success/10 text-success',
    pending: 'bg-warning/10 text-warning',
    closed: 'bg-surface-2 text-text-3',
};

const PRIORITY_STYLES: Record<string, string> = {
    urgent: 'bg-critical/10 text-critical',
    high: 'bg-warning/10 text-warning',
    medium: 'bg-primary/10 text-primary',
    low: 'bg-surface-2 text-text-3',
};

function timeAgo(iso: string | null): string {
    if (!iso) return '—';
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'agora';
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
}

function formatBRL(v: number): string {
    if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}k`;
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

const QUICK_LINKS = [
    { icon: Inbox,      label: 'Unified Inbox',   href: '/inbox',        color: 'text-primary',  bg: 'bg-primary/10',  border: 'border-primary/20' },
    { icon: GitBranch,  label: 'Sales CRM',        href: '/sales',        color: 'text-success',  bg: 'bg-success/10',  border: 'border-success/20' },
    { icon: LifeBuoy,   label: 'Helpdesk',         href: '/support',      color: 'text-warning',  bg: 'bg-warning/10',  border: 'border-warning/20' },
    { icon: Bot,        label: 'AI Squad',         href: '/agents/team',  color: 'text-ai',       bg: 'bg-ai/10',       border: 'border-ai/20' },
    { icon: BarChart3,  label: 'Reports',          href: '/analytics/reports', color: 'text-text-2', bg: 'bg-surface-2', border: 'border-stroke' },
    { icon: Users,      label: 'Contacts',         href: '/contacts',     color: 'text-ai-accent', bg: 'bg-ai-accent/10', border: 'border-ai-accent/20' },
];

export default function AnalyticsDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    async function load() {
        try {
            const d = await apiGet<DashboardData>('/analytics/dashboard');
            setData(d);
        } catch (e) {
            toast.error('Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        const channel = supabase
            .channel('overview-realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'message' }, load)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'conversation' }, load)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket' }, load)
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, []);

    const kpis = data?.kpis;
    const channels = data?.channels ?? [];
    const dailyMsgs = data?.daily_messages ?? [];
    const recentConvs = data?.recent_conversations ?? [];
    const slaAlerts = data?.sla_alerts ?? [];

    const maxDailyCount = Math.max(...dailyMsgs.map((d) => d.count), 1);
    const totalChannelCount = channels.reduce((s, c) => s + c.count, 0) || 1;

    const today = new Date();
    const hour = today.getHours();
    const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

    const kpiCards = [
        { label: 'Conversas',       value: kpis?.total_conversations,  icon: MessageSquare, color: 'text-primary',  bg: 'bg-primary/10',  border: 'border-primary/20' },
        { label: 'Abertas Agora',   value: kpis?.open_conversations,   icon: Inbox,         color: 'text-warning',  bg: 'bg-warning/10',  border: 'border-warning/20' },
        { label: 'Mensagens',       value: kpis?.total_messages,       icon: Zap,           color: 'text-ai',       bg: 'bg-ai/10',       border: 'border-ai/20' },
        { label: 'Contactos',       value: kpis?.total_contacts,       icon: Users,         color: 'text-success',  bg: 'bg-success/10',  border: 'border-success/20' },
        { label: 'Pipeline',        value: kpis ? formatBRL(kpis.pipeline_value) : '—', icon: DollarSign, color: 'text-ai', bg: 'bg-ai/10', border: 'border-ai/20' },
        { label: 'Deals Abertos',   value: kpis?.open_deals,           icon: TrendingUp,    color: 'text-primary',  bg: 'bg-primary/10',  border: 'border-primary/20' },
        { label: 'Tickets',         value: kpis?.open_tickets,         icon: Ticket,        color: 'text-warning',  bg: 'bg-warning/10',  border: 'border-warning/20' },
        { label: 'Taxa Resolução',  value: kpis ? `${kpis.resolution_rate}%` : '—', icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto w-full flex flex-col gap-8 pb-20">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-bold text-text-3 uppercase tracking-[0.3em]">
                        {today.toLocaleDateString('pt-PT', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                    <h1 className="text-2xl font-black text-white tracking-tight">
                        {greeting}, <span className="text-primary">Naboah Pulse</span>
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    {kpis && kpis.high_churn_contacts > 0 && (
                        <Link href="/contacts" className="flex items-center gap-2 px-3 py-1.5 bg-critical/10 border border-critical/20 rounded-xl">
                            <AlertTriangle size={13} className="text-critical" />
                            <span className="text-xs font-bold text-critical">{kpis.high_churn_contacts} contacto{kpis.high_churn_contacts !== 1 ? 's' : ''} em risco</span>
                        </Link>
                    )}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-xl">
                        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        <span className="text-xs font-bold text-success">Live Data</span>
                    </div>
                </div>
            </div>

            {/* 8 KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((card) => (
                    <div
                        key={card.label}
                        className={`bg-bg-1 border ${card.border} rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden hover:scale-[1.01] transition-transform`}
                    >
                        <div className={`w-9 h-9 rounded-xl ${card.bg} border ${card.border} flex items-center justify-center`}>
                            <card.icon className={`w-4 h-4 ${card.color}`} />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-text-3 uppercase tracking-widest mb-1">{card.label}</p>
                            {loading ? (
                                <div className="h-8 w-14 bg-surface-2 rounded animate-pulse" />
                            ) : (
                                <span className="text-2xl font-black text-white tracking-tight">{card.value ?? 0}</span>
                            )}
                        </div>
                        <div className={`absolute -bottom-4 -right-4 w-16 h-16 rounded-full ${card.bg} blur-2xl opacity-50`} />
                    </div>
                ))}
            </div>

            {/* SLA Alerts */}
            {(loading || slaAlerts.length > 0) && (
                <div className="bg-bg-1 border border-warning/30 rounded-2xl p-5 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <Clock size={14} className="text-warning" />
                        <h3 className="text-xs font-black text-warning uppercase tracking-widest">SLA em Risco</h3>
                    </div>
                    {loading ? (
                        <div className="flex flex-wrap gap-2">
                            {[0, 1, 2].map((i) => <div key={i} className="h-8 w-48 bg-surface-2 rounded-xl animate-pulse" />)}
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {slaAlerts.map((alert) => (
                                <Link
                                    key={alert.id}
                                    href="/support"
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all hover:opacity-80 ${
                                        alert.overdue
                                            ? 'bg-critical/10 border-critical/30 text-critical'
                                            : 'bg-warning/10 border-warning/30 text-warning'
                                    }`}
                                >
                                    <AlertTriangle size={11} />
                                    <span className="truncate max-w-[180px]">{alert.subject}</span>
                                    <span className="text-[9px] opacity-70 flex-shrink-0">
                                        {alert.overdue ? 'EXPIRADO' : `${alert.due_in_hours}h`}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Channel Distribution */}
                <div className="bg-bg-1 border border-stroke rounded-2xl p-6 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">Canais</h3>
                        <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest">por conversas</span>
                    </div>
                    {loading ? (
                        <div className="flex flex-col gap-5">
                            {[80, 50, 30].map((w, i) => (
                                <div key={i} className="flex flex-col gap-2">
                                    <div className="flex justify-between">
                                        <div className="h-3 w-20 bg-surface-2 rounded animate-pulse" />
                                        <div className="h-3 w-8 bg-surface-2 rounded animate-pulse" />
                                    </div>
                                    <div className="h-2 bg-surface-2 rounded-full animate-pulse" style={{ width: `${w}%` }} />
                                </div>
                            ))}
                        </div>
                    ) : channels.length === 0 ? (
                        <p className="text-text-3 text-sm text-center py-8">Sem dados de canal</p>
                    ) : (
                        <div className="flex flex-col gap-5">
                            {channels.map((ch) => {
                                const pct = Math.round((ch.count / totalChannelCount) * 100);
                                const colorClass = CHANNEL_COLORS[ch.name] ?? 'bg-primary';
                                return (
                                    <div key={ch.name} className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${colorClass}`} />
                                                <span className="text-xs font-bold text-text-1">{ch.name}</span>
                                            </div>
                                            <span className="text-xs font-black text-white">{pct}%</span>
                                        </div>
                                        <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                                            <div className={`h-full ${colorClass} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                                        </div>
                                        <p className="text-[10px] text-text-3">{ch.count} conversa{ch.count !== 1 ? 's' : ''}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Weekly Activity */}
                <div className="bg-bg-1 border border-stroke rounded-2xl p-6 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">Actividade Semanal</h3>
                        <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest">mensagens / dia</span>
                    </div>
                    <div className="flex items-end justify-between gap-2 h-40">
                        {loading
                            ? Array.from({ length: 7 }).map((_, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                                    <div className="w-full bg-surface-2 rounded-t-lg animate-pulse" style={{ height: `${30 + i * 8}%` }} />
                                    <div className="w-4 h-2 bg-surface-2 rounded animate-pulse" />
                                </div>
                            ))
                            : dailyMsgs.map((d, i) => {
                                const heightPct = Math.max((d.count / maxDailyCount) * 100, 4);
                                const isToday = i === dailyMsgs.length - 1;
                                return (
                                    <div key={d.day + i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                                        <div
                                            className={`w-full rounded-t-lg transition-all duration-500 relative ${isToday ? 'jarvis-gradient' : 'bg-surface-2 group-hover:bg-primary/40'}`}
                                            style={{ height: `${heightPct}%` }}
                                        >
                                            {d.count > 0 && (
                                                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-bg-1 border border-stroke px-2 py-0.5 rounded text-[9px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                    {d.count}
                                                </div>
                                            )}
                                        </div>
                                        <span className={`text-[9px] font-bold ${isToday ? 'text-primary' : 'text-text-3'}`}>{d.day}</span>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            </div>

            {/* Recent Conversations + Quick Links */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Recent Conversations */}
                <div className="lg:col-span-2 bg-bg-1 border border-stroke rounded-2xl flex flex-col">
                    <div className="p-5 flex items-center justify-between border-b border-stroke">
                        <h3 className="text-sm font-bold text-white">Conversas Recentes</h3>
                        <Link href="/inbox" className="flex items-center gap-1.5 text-[10px] font-bold text-text-3 hover:text-primary transition-colors uppercase tracking-widest">
                            Ver todas <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    {loading ? (
                        <div className="flex flex-col divide-y divide-stroke">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="p-4 flex items-center gap-4">
                                    <div className="w-9 h-9 rounded-full bg-surface-2 animate-pulse flex-shrink-0" />
                                    <div className="flex-1 flex flex-col gap-2">
                                        <div className="h-3 w-32 bg-surface-2 rounded animate-pulse" />
                                        <div className="h-2 w-48 bg-surface-2 rounded animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : recentConvs.length === 0 ? (
                        <div className="p-12 text-center text-text-3 text-sm">Sem conversas ainda</div>
                    ) : (
                        <div className="flex flex-col divide-y divide-stroke">
                            {recentConvs.map((conv) => (
                                <Link key={conv.id} href="/inbox" className="p-4 flex items-center gap-3 hover:bg-surface-1 transition-colors group">
                                    <div className="w-9 h-9 rounded-full bg-surface-2 flex items-center justify-center text-xs font-black text-text-2 flex-shrink-0">
                                        {(conv.contact_name ?? '?').slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-sm font-bold text-text-1 truncate">{conv.contact_name}</span>
                                            <span className="text-[9px] font-bold text-text-3 px-1.5 py-0.5 bg-surface-2 rounded flex-shrink-0">{conv.channel}</span>
                                        </div>
                                        <p className="text-xs text-text-3 truncate">{conv.last_message || '—'}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[conv.status] ?? 'bg-surface-2 text-text-3'}`}>
                                            {conv.status}
                                        </span>
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_STYLES[conv.priority] ?? 'bg-surface-2 text-text-3'}`}>
                                            {conv.priority}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-text-3 flex-shrink-0 ml-1">{timeAgo(conv.updated_at)}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Navigation */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-[10px] font-bold text-text-3 uppercase tracking-widest px-1">Acesso Rápido</h3>
                    {QUICK_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="bg-bg-1 border border-stroke rounded-xl p-4 flex items-center gap-3 hover:border-stroke/80 hover:bg-surface-1 transition-all group"
                        >
                            <div className={`w-8 h-8 rounded-lg ${link.bg} border ${link.border} flex items-center justify-center flex-shrink-0`}>
                                <link.icon className={`w-4 h-4 ${link.color}`} />
                            </div>
                            <span className="text-sm font-bold text-text-2 group-hover:text-white transition-colors">{link.label}</span>
                            <ArrowRight className="w-3 h-3 text-text-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
