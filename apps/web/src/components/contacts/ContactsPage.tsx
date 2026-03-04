"use client";

import React, { useEffect, useState } from 'react';
import {
    BookUser, Search, Phone, Mail, MessageSquare, Instagram, Heart,
    TrendingDown, Loader2, X, ArrowRight, DollarSign, MessageCircle,
} from 'lucide-react';
import { apiGet } from '@/lib/api';
import { toast } from '@/lib/toast';

type Contact = {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    health_score: number | null;
    churn_risk_level: string;
    created_at: string | null;
    conversation_count: number;
    channels: string[];
    deal_count: number;
    deal_value: number;
};

type ContactDetail = {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    health_score: number | null;
    churn_risk_level: string;
    created_at: string | null;
    conversations: {
        id: string; channel: string; status: string; priority: string;
        last_message: string | null; updated_at: string | null;
    }[];
    deals: { id: string; title: string; value: number; stage_id: string; status: string }[];
};

const CHANNEL_ICONS: Record<string, React.ElementType> = {
    whatsapp: MessageSquare,
    instagram: Instagram,
    email: Mail,
};

const CHANNEL_COLORS: Record<string, string> = {
    whatsapp: 'text-success',
    instagram: 'text-primary',
    email: 'text-ai',
};

const RISK_CONFIG: Record<string, { label: string; cls: string }> = {
    low:    { label: 'Low Risk',  cls: 'text-success bg-success/10 border-success/20' },
    medium: { label: 'Med Risk',  cls: 'text-warning bg-warning/10 border-warning/20' },
    high:   { label: 'High Risk', cls: 'text-critical bg-critical/10 border-critical/20' },
};

const STATUS_STAGE: Record<string, string> = {
    stg_1: 'Lead',
    stg_2: 'Apresentação',
    stg_3: 'Negociação',
    stg_4: 'Fechamento',
};

function healthColor(score: number | null): string {
    if (!score) return 'bg-text-3';
    if (score >= 80) return 'bg-success';
    if (score >= 50) return 'bg-warning';
    return 'bg-critical';
}

function initials(name: string): string {
    return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function timeAgo(iso: string | null): string {
    if (!iso) return '—';
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
}

function formatBRL(v: number): string {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<ContactDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        apiGet<Contact[]>('/contacts').then(setContacts).catch(() => toast.error('Erro ao carregar contactos')).finally(() => setLoading(false));
    }, []);

    async function openContact(id: string) {
        setDetailLoading(true);
        setSelected(null);
        try {
            const detail = await apiGet<ContactDetail>(`/contacts/${id}`);
            setSelected(detail);
        } catch (e) { toast.error('Erro ao abrir contacto'); }
        finally { setDetailLoading(false); }
    }

    const filtered = contacts.filter((c) => {
        const q = search.toLowerCase();
        return (
            c.name.toLowerCase().includes(q) ||
            (c.email || '').toLowerCase().includes(q) ||
            (c.phone || '').toLowerCase().includes(q)
        );
    });

    const highRisk  = contacts.filter((c) => c.churn_risk_level === 'high').length;
    const totalPipe = contacts.reduce((a, c) => a + c.deal_value, 0);
    const avgHealth = contacts.length
        ? Math.round(contacts.reduce((a, c) => a + (c.health_score || 0), 0) / contacts.length)
        : 0;

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-stroke flex items-center justify-between flex-wrap gap-4 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <BookUser className="text-primary w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white">Contacts</h1>
                        <p className="text-text-3 text-xs">CRM de contactos e histórico de interações.</p>
                    </div>
                </div>

                {/* Stats */}
                {!loading && (
                    <div className="flex gap-3">
                        <div className="bg-bg-1 border border-stroke px-4 py-2 rounded-xl text-center">
                            <div className="text-lg font-black text-white">{contacts.length}</div>
                            <div className="text-[9px] font-bold text-text-3 uppercase tracking-widest">Total</div>
                        </div>
                        <div className="bg-bg-1 border border-critical/20 px-4 py-2 rounded-xl text-center">
                            <div className="text-lg font-black text-critical">{highRisk}</div>
                            <div className="text-[9px] font-bold text-text-3 uppercase tracking-widest">Alto Risco</div>
                        </div>
                        <div className="bg-bg-1 border border-success/20 px-4 py-2 rounded-xl text-center">
                            <div className="text-lg font-black text-success">{avgHealth}%</div>
                            <div className="text-[9px] font-bold text-text-3 uppercase tracking-widest">Saúde Média</div>
                        </div>
                        <div className="bg-bg-1 border border-ai/20 px-4 py-2 rounded-xl text-center">
                            <div className="text-sm font-black text-ai">{formatBRL(totalPipe)}</div>
                            <div className="text-[9px] font-bold text-text-3 uppercase tracking-widest">Pipeline</div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Contact List */}
                <div className={`flex flex-col ${selected || detailLoading ? 'w-96 flex-shrink-0' : 'flex-1'} border-r border-stroke overflow-hidden transition-all`}>
                    {/* Search */}
                    <div className="p-4 border-b border-stroke flex-shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3" size={14} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar por nome, email ou telefone..."
                                className="w-full bg-surface-1 border border-stroke rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-text-3 focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="p-4 border-b border-stroke/50 animate-pulse flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-surface-2 flex-shrink-0" />
                                    <div className="flex flex-col gap-2 flex-1">
                                        <div className="h-3.5 w-32 bg-surface-2 rounded" />
                                        <div className="h-2.5 w-48 bg-surface-2 rounded" />
                                        <div className="h-1.5 w-full bg-surface-2 rounded-full" />
                                    </div>
                                </div>
                            ))
                        ) : filtered.length === 0 ? (
                            <div className="flex items-center justify-center h-32">
                                <p className="text-xs text-text-3">Nenhum contacto encontrado.</p>
                            </div>
                        ) : (
                            filtered.map((contact) => {
                                const risk = RISK_CONFIG[contact.churn_risk_level] ?? RISK_CONFIG.low;
                                const isSelected = selected?.id === contact.id;
                                return (
                                    <div
                                        key={contact.id}
                                        onClick={() => openContact(contact.id)}
                                        className={`p-4 border-b border-stroke/50 cursor-pointer transition-colors group relative ${
                                            isSelected ? 'bg-surface-2/50' : 'hover:bg-surface-1'
                                        }`}
                                    >
                                        {isSelected && <div className="absolute left-0 top-0 bottom-0 w-0.5 jarvis-gradient" />}
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-black flex-shrink-0">
                                                {initials(contact.name)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">
                                                        {contact.name}
                                                    </span>
                                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border flex-shrink-0 ${risk.cls}`}>
                                                        {risk.label}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-text-3 truncate mt-0.5">{contact.email || contact.phone || '—'}</p>

                                                {/* Health bar */}
                                                <div className="mt-2 flex items-center gap-2">
                                                    <div className="flex-1 h-1 bg-bg-0 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${healthColor(contact.health_score)}`}
                                                            style={{ width: `${contact.health_score ?? 0}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[9px] text-text-3 font-bold flex-shrink-0">{contact.health_score ?? 0}%</span>
                                                </div>

                                                <div className="mt-2 flex items-center gap-3">
                                                    <div className="flex items-center gap-1">
                                                        {contact.channels.slice(0, 3).map((ch) => {
                                                            const Icon = CHANNEL_ICONS[ch];
                                                            return Icon ? (
                                                                <Icon key={ch} size={11} className={CHANNEL_COLORS[ch] ?? 'text-text-3'} />
                                                            ) : null;
                                                        })}
                                                    </div>
                                                    <span className="text-[9px] text-text-3">
                                                        {contact.conversation_count} conv · {contact.deal_count} deal
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Detail Panel */}
                {(selected || detailLoading) && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {detailLoading ? (
                            <div className="flex items-center justify-center h-40">
                                <Loader2 size={20} className="animate-spin text-primary" />
                            </div>
                        ) : selected ? (
                            <div className="p-6 flex flex-col gap-6 max-w-2xl">
                                {/* Contact header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl font-black">
                                            {initials(selected.name)}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-white">{selected.name}</h2>
                                            <div className="flex flex-col gap-1 mt-1">
                                                {selected.email && (
                                                    <span className="text-xs text-text-3 flex items-center gap-1.5">
                                                        <Mail size={11} /> {selected.email}
                                                    </span>
                                                )}
                                                {selected.phone && (
                                                    <span className="text-xs text-text-3 flex items-center gap-1.5">
                                                        <Phone size={11} /> {selected.phone}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelected(null)} className="text-text-3 hover:text-white transition-colors mt-1">
                                        <X size={18} />
                                    </button>
                                </div>

                                {/* Health + Risk */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-bg-1 border border-stroke rounded-2xl p-4 flex flex-col gap-3">
                                        <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest flex items-center gap-1.5">
                                            <Heart size={11} className="text-success" /> Health Score
                                        </span>
                                        <div className="flex items-end gap-2">
                                            <span className="text-3xl font-black text-white">{selected.health_score ?? 0}</span>
                                            <span className="text-text-3 mb-0.5 text-sm">/ 100</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-bg-0 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${healthColor(selected.health_score)}`}
                                                style={{ width: `${selected.health_score ?? 0}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-bg-1 border border-stroke rounded-2xl p-4 flex flex-col gap-3">
                                        <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest flex items-center gap-1.5">
                                            <TrendingDown size={11} className="text-warning" /> Churn Risk
                                        </span>
                                        <div className={`text-2xl font-black capitalize ${
                                            selected.churn_risk_level === 'high' ? 'text-critical' :
                                            selected.churn_risk_level === 'medium' ? 'text-warning' : 'text-success'
                                        }`}>
                                            {selected.churn_risk_level}
                                        </div>
                                        <span className="text-[10px] text-text-3">
                                            Membro desde {selected.created_at ? new Date(selected.created_at).toLocaleDateString('pt-PT') : '—'}
                                        </span>
                                    </div>
                                </div>

                                {/* Deals */}
                                {selected.deals.length > 0 && (
                                    <div className="flex flex-col gap-3">
                                        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                            <DollarSign size={14} className="text-ai" /> Deals ({selected.deals.length})
                                        </h3>
                                        <div className="flex flex-col gap-2">
                                            {selected.deals.map((deal) => (
                                                <div key={deal.id} className="bg-bg-1 border border-stroke rounded-xl p-3 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs font-bold text-white">{deal.title}</p>
                                                        <p className="text-[10px] text-text-3">{STATUS_STAGE[deal.stage_id] ?? deal.stage_id}</p>
                                                    </div>
                                                    <span className="text-sm font-black text-ai">{formatBRL(deal.value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Conversations */}
                                {selected.conversations.length > 0 && (
                                    <div className="flex flex-col gap-3">
                                        <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                            <MessageCircle size={14} className="text-primary" /> Conversas ({selected.conversations.length})
                                        </h3>
                                        <div className="flex flex-col gap-2">
                                            {selected.conversations.map((conv) => {
                                                const Icon = CHANNEL_ICONS[conv.channel] ?? MessageSquare;
                                                const iconColor = CHANNEL_COLORS[conv.channel] ?? 'text-text-3';
                                                return (
                                                    <div key={conv.id} className="bg-bg-1 border border-stroke rounded-xl p-3 hover:border-primary/30 transition-colors group cursor-pointer">
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <div className="flex items-center gap-2">
                                                                <Icon size={12} className={iconColor} />
                                                                <span className="text-[10px] font-bold text-text-2 capitalize">{conv.channel}</span>
                                                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                                                                    conv.status === 'open' ? 'bg-warning/10 text-warning' :
                                                                    conv.status === 'closed' ? 'bg-surface-2 text-text-3' :
                                                                    'bg-primary/10 text-primary'
                                                                }`}>{conv.status}</span>
                                                            </div>
                                                            <span className="text-[9px] text-text-3">{timeAgo(conv.updated_at)}</span>
                                                        </div>
                                                        {conv.last_message && (
                                                            <p className="text-xs text-text-3 truncate">{conv.last_message}</p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
}
