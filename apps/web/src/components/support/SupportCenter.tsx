"use client";

import React, { useEffect, useState } from 'react';
import {
    LifeBuoy, Ticket, FileText, CheckCircle2, Clock, AlertCircle,
    Plus, Search, Filter, X, Loader2, ArrowRight, Bot,
} from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { toast } from '@/lib/toast';

type SupportTicket = {
    id: string;
    subject: string;
    description: string;
    priority: string;
    status: string;
    created_at: string;
    due_at: string | null;
};

type NewTicketForm = { subject: string; description: string; priority: string };

const PRIORITY_COLORS: Record<string, string> = {
    urgent: 'text-critical bg-critical/10 border-critical/20',
    high:   'text-warning  bg-warning/10  border-warning/20',
    medium: 'text-ai       bg-ai/10       border-ai/20',
    low:    'text-text-3   bg-surface-2   border-stroke',
};

const STATUS_DOT: Record<string, string> = {
    new:     'bg-primary',
    open:    'bg-warning',
    pending: 'bg-text-3',
    solved:  'bg-success',
    closed:  'bg-surface-2',
};

function slaLabel(due_at: string | null): { label: string; cls: string } {
    if (!due_at) return { label: 'Sem SLA', cls: 'bg-surface-2 text-text-3' };
    const diff = new Date(due_at).getTime() - Date.now();
    if (diff < 0) return { label: 'EXPIRADO', cls: 'bg-critical/10 text-critical' };
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const label = h > 0 ? `${h}h restantes` : `${m}min restantes`;
    const cls = h < 2 ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success';
    return { label, cls };
}

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'agora';
    if (m < 60) return `${m}m atrás`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h atrás`;
    return `${Math.floor(h / 24)}d atrás`;
}

const KB_ARTICLES = [
    'Como configurar o Pulse AI Bot?',
    'Guia de integração com WhatsApp',
    'Entendendo as métricas de BI',
    'Política de retenção de dados',
];

export default function SupportCenter() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [resolving, setResolving] = useState<string | null>(null);
    const [form, setForm] = useState<NewTicketForm>({ subject: '', description: '', priority: 'medium' });

    async function load() {
        setLoading(true);
        try {
            const data = await apiGet<SupportTicket[]>('/support/tickets');
            setTickets(data);
        } catch (e) { toast.error('Erro ao carregar tickets'); }
        finally { setLoading(false); }
    }

    useEffect(() => { load(); }, []);

    async function handleCreate() {
        if (!form.subject.trim() || !form.description.trim()) return;
        setSaving(true);
        try {
            const created = await apiPost<SupportTicket>('/support/tickets', {
                subject: form.subject.trim(),
                description: form.description.trim(),
                priority: form.priority,
            });
            setTickets((prev) => [created, ...prev]);
            setForm({ subject: '', description: '', priority: 'medium' });
            setShowModal(false);
        } catch (e) { toast.error('Erro ao criar ticket'); }
        finally { setSaving(false); }
    }

    async function handleResolve(id: string) {
        setResolving(id);
        setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status: 'solved' } : t));
        try {
            await apiPost(`/support/tickets/${id}/resolve`, {});
        } catch { load(); }
        finally { setResolving(null); }
    }

    const active    = tickets.filter((t) => !['solved', 'closed'].includes(t.status));
    const openCount = tickets.filter((t) => t.status === 'open').length;
    const newCount  = tickets.filter((t) => t.status === 'new').length;
    const solved    = tickets.filter((t) => t.status === 'solved').length;
    const slaRisk   = tickets.filter((t) =>
        t.due_at &&
        new Date(t.due_at).getTime() - Date.now() < 7_200_000 &&
        !['solved', 'closed'].includes(t.status),
    ).length;

    const filtered = active.filter((t) =>
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-y-auto custom-scrollbar">
            <div className="p-8 max-w-6xl mx-auto w-full flex flex-col gap-8 pb-20">

                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-ai-accent/10 border border-ai-accent/20 flex items-center justify-center shadow-lg shadow-ai-accent/10">
                                <LifeBuoy className="text-ai-accent w-6 h-6" />
                            </div>
                            Pulse Support: Helpdesk
                        </h2>
                        <p className="text-text-3 text-sm">Gerencie solicitações de suporte e mantenha sua base de conhecimento.</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="jarvis-gradient px-4 py-2 rounded-xl text-white text-xs font-bold shadow-lg shadow-primary/20 flex items-center gap-2 hover:opacity-90 transition-opacity"
                    >
                        <Plus size={16} /> NOVO TICKET
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-bg-1 border border-stroke p-4 rounded-2xl animate-pulse">
                                <div className="h-8 w-8 bg-surface-2 rounded-xl mb-3" />
                                <div className="h-3 w-20 bg-surface-2 rounded mb-2" />
                                <div className="h-6 w-12 bg-surface-2 rounded" />
                            </div>
                        ))
                    ) : (
                        [
                            { label: 'Tickets Abertos', value: openCount + newCount, icon: Ticket,       color: 'text-primary' },
                            { label: 'Aguardando',      value: tickets.filter(t => t.status === 'pending').length, icon: Clock, color: 'text-ai-accent' },
                            { label: 'SLA em Risco',    value: slaRisk,              icon: AlertCircle,  color: 'text-warning' },
                            { label: 'Resolvidos',      value: solved,               icon: CheckCircle2, color: 'text-success' },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-bg-1 border border-stroke p-4 rounded-2xl flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl bg-surface-1 flex items-center justify-center ${stat.color}`}>
                                    <stat.icon size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-text-3 uppercase">{stat.label}</span>
                                    <span className="text-xl font-bold text-white">{stat.value}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Ticket List */}
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        <div className="bg-bg-1 border border-stroke rounded-2xl overflow-hidden flex flex-col">
                            <div className="p-4 border-b border-stroke flex items-center justify-between bg-surface-1/30">
                                <div className="flex items-center gap-2">
                                    <Filter size={14} className="text-text-3" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                                        Tickets Ativos ({filtered.length})
                                    </span>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-3" size={12} />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Buscar ID ou Assunto..."
                                        className="bg-bg-0 border border-stroke rounded-lg pl-8 p-1.5 text-[10px] text-white w-48 focus:border-primary focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="divide-y divide-stroke">
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="p-4 animate-pulse flex gap-4">
                                            <div className="w-2 h-2 rounded-full bg-surface-2 mt-1.5 flex-shrink-0" />
                                            <div className="flex flex-col gap-2 flex-1">
                                                <div className="h-3 w-48 bg-surface-2 rounded" />
                                                <div className="h-2.5 w-32 bg-surface-2 rounded" />
                                            </div>
                                        </div>
                                    ))
                                ) : filtered.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <p className="text-xs text-text-3">
                                            {search ? 'Nenhum ticket encontrado.' : 'Nenhum ticket ativo. Tudo resolvido! 🎉'}
                                        </p>
                                    </div>
                                ) : (
                                    filtered.map((ticket) => {
                                        const sla = slaLabel(ticket.due_at);
                                        const isResolving = resolving === ticket.id;
                                        return (
                                            <div
                                                key={ticket.id}
                                                className="p-4 flex items-center justify-between hover:bg-surface-1/50 transition-colors group"
                                            >
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[ticket.status] ?? 'bg-surface-2'}`} />
                                                    <div className="flex flex-col gap-0.5 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-xs font-bold text-white group-hover:text-primary transition-colors truncate">
                                                                {ticket.subject}
                                                            </span>
                                                            <span className="text-[9px] font-bold text-text-3 bg-surface-2 px-1.5 rounded uppercase flex-shrink-0">
                                                                {ticket.id.split('_').slice(-2).join('-')}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-[10px] text-text-3">
                                                            <span className="flex items-center gap-1">
                                                                <Clock size={10} /> {timeAgo(ticket.created_at)}
                                                            </span>
                                                            <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase ${PRIORITY_COLORS[ticket.priority] ?? ''}`}>
                                                                {ticket.priority}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full hidden sm:block ${sla.cls}`}>
                                                        {sla.label}
                                                    </span>
                                                    <button
                                                        onClick={() => handleResolve(ticket.id)}
                                                        disabled={isResolving}
                                                        className="text-[9px] font-bold px-2 py-1 rounded-lg bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-colors disabled:opacity-50 flex items-center gap-1"
                                                    >
                                                        {isResolving
                                                            ? <Loader2 size={10} className="animate-spin" />
                                                            : <CheckCircle2 size={10} />}
                                                        Resolver
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-bg-1 border border-stroke rounded-2xl p-6 flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                    <FileText size={16} className="text-text-3" /> Base de Conhecimento
                                </h3>
                                <button className="text-primary hover:text-ai-accent transition-colors"><Plus size={16} /></button>
                            </div>
                            <div className="flex flex-col gap-3">
                                {KB_ARTICLES.map((article, i) => (
                                    <div key={i} className="flex items-center justify-between group cursor-pointer hover:translate-x-1 transition-all">
                                        <span className="text-[11px] text-text-2 group-hover:text-white">{article}</span>
                                        <ArrowRight size={12} className="text-text-3 opacity-0 group-hover:opacity-100 transition-all" />
                                    </div>
                                ))}
                            </div>
                            <button className="w-full py-2 bg-surface-1 border border-stroke rounded-xl text-[10px] font-bold text-white hover:bg-surface-2 transition-all uppercase tracking-widest">
                                Gerenciar Artigos
                            </button>
                        </div>

                        <div className="bg-ai-accent/5 border border-ai-accent/20 rounded-2xl p-6 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-ai-accent/20 flex items-center justify-center">
                                    <Bot size={18} className="text-ai-accent" />
                                </div>
                                <h4 className="text-xs font-bold text-white">Pulse AI Auto-resolve</h4>
                            </div>
                            <p className="text-[10px] text-text-3 leading-relaxed">
                                O Pulse AI resolveu <span className="text-white font-bold">{solved}</span> tickets automaticamente.{' '}
                                Taxa de satisfação: <span className="text-success font-bold">94%</span>.
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold text-success uppercase">● Status: Ativo</span>
                                <button className="text-[9px] font-bold text-ai-accent hover:underline">Configurar Filtros</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* New Ticket Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-bg-1 border border-stroke rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Ticket className="w-4 h-4 text-ai-accent" />
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Novo Ticket</h3>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-text-3 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Assunto *</label>
                                <input
                                    type="text"
                                    value={form.subject}
                                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                                    placeholder="Ex: Erro ao fazer login"
                                    className="bg-surface-1 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-text-3 focus:outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Descrição *</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                    placeholder="Descreva o problema em detalhe..."
                                    rows={4}
                                    className="bg-surface-1 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-text-3 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Prioridade</label>
                                <div className="flex gap-2">
                                    {['low', 'medium', 'high', 'urgent'].map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setForm((f) => ({ ...f, priority: p }))}
                                            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${
                                                form.priority === p
                                                    ? PRIORITY_COLORS[p]
                                                    : 'bg-surface-1 text-text-3 border-stroke hover:border-stroke/80'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-2.5 border border-stroke rounded-xl text-xs font-bold text-text-2 hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={saving || !form.subject.trim() || !form.description.trim()}
                                className="flex-1 py-2.5 jarvis-gradient text-white rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {saving && <Loader2 size={12} className="animate-spin" />}
                                Criar Ticket
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
