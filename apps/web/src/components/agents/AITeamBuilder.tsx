"use client";
import React, { useEffect, useState } from 'react';
import {
    Bot, Zap, Shield, Cpu, Sparkles, Plus, Database, MessageSquareShare,
    ArrowRightLeft, Loader2, Play, Pause, CheckCircle2, X,
} from 'lucide-react';
import { apiGet, apiPost, apiPatch } from '@/lib/api';
import { toast } from '@/lib/toast';

type Agent = {
    id: string;
    name: string;
    role: string;
    status: string;
    intelligence_level: string;
    skills_json: string[];
};

type Performance = {
    total_agents: number;
    active_agents: number;
    idle_agents: number;
    paused_agents: number;
    handoffs_today: number;
    resolution_rate_ai: string;
    avg_collaboration_time: string;
};

const SKILL_LABELS: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    inbox_reply:           { label: 'Responder Inbox',      icon: MessageSquareShare, color: 'text-primary' },
    ticket_resolve:        { label: 'Resolver Tickets',     icon: CheckCircle2,       color: 'text-success' },
    kb_read:               { label: 'Base Conhecimento',    icon: Database,           color: 'text-ai' },
    sentiment_analysis:    { label: 'Análise Sentimento',   icon: Sparkles,           color: 'text-warning' },
    threat_blocking:       { label: 'Bloquear Ameaças',     icon: Shield,             color: 'text-critical' },
    reputation_monitoring: { label: 'Monitorar Reputação',  icon: Shield,             color: 'text-warning' },
    compliance_audit:      { label: 'Auditoria',            icon: Shield,             color: 'text-text-2' },
    crm_write:             { label: 'Acesso ao CRM',        icon: Database,           color: 'text-primary' },
    deal_scoring:          { label: 'Score de Deals',       icon: Zap,                color: 'text-success' },
    outreach:              { label: 'Outreach',             icon: ArrowRightLeft,     color: 'text-warning' },
    lead_qualify:          { label: 'Qualif. Leads',        icon: Zap,                color: 'text-ai' },
    campaign_create:       { label: 'Criar Campanhas',      icon: Zap,                color: 'text-warning' },
    analytics_read:        { label: 'Analytics',            icon: Cpu,                color: 'text-ai' },
    ab_testing:            { label: 'Testes A/B',           icon: ArrowRightLeft,     color: 'text-primary' },
};

const STATUS_STYLE: Record<string, { dot: string; label: string }> = {
    acting:   { dot: 'bg-success', label: 'Ativo' },
    thinking: { dot: 'bg-ai',      label: 'Pensando' },
    idle:     { dot: 'bg-text-3',  label: 'Idle' },
    paused:   { dot: 'bg-warning', label: 'Pausado' },
};

const INTEL_LABEL: Record<string, string> = {
    genius:   'Gênio',
    high:     'Alto',
    standard: 'Padrão',
};

const DEPARTMENTS = ['support', 'sales', 'security', 'marketing'];
const INTEL_LEVELS = ['standard', 'high', 'genius'];

export default function AITeamBuilder() {
    const [agents, setAgents]         = useState<Agent[]>([]);
    const [perf, setPerf]             = useState<Performance | null>(null);
    const [loading, setLoading]       = useState(true);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [showForm, setShowForm]     = useState(false);
    const [creating, setCreating]     = useState(false);
    const [form, setForm]             = useState({ name: '', role: '', intelligence_level: 'standard', department: 'support' });

    async function load() {
        try {
            const [squad, performance] = await Promise.all([
                apiGet<Agent[]>('/agents/team/squad'),
                apiGet<Performance>('/agents/team/performance'),
            ]);
            setAgents(squad);
            setPerf(performance);
        } catch {
            toast.error('Erro ao carregar squad');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function handleToggle(agentId: string) {
        if (togglingId) return;
        setTogglingId(agentId);
        // optimistic
        setAgents(prev => prev.map(a => {
            if (a.id !== agentId) return a;
            return { ...a, status: (a.status === 'acting' || a.status === 'thinking') ? 'paused' : 'acting' };
        }));
        try {
            const res = await apiPatch<{ status: string }>(`/agents/team/${agentId}/status`, {});
            setAgents(prev => prev.map(a => a.id === agentId ? { ...a, status: res.status } : a));
            load(); // refresh perf counts
        } catch {
            toast.error('Erro ao atualizar status');
            load();
        } finally {
            setTogglingId(null);
        }
    }

    async function handleCreate() {
        if (!form.name.trim() || !form.role.trim()) return;
        setCreating(true);
        try {
            const agent = await apiPost<Agent>('/agents/team/agents', {
                name:               form.name.trim(),
                role:               form.role.trim(),
                intelligence_level: form.intelligence_level,
                department:         form.department,
                skills:             [],
            });
            setAgents(prev => [...prev, agent]);
            setShowForm(false);
            setForm({ name: '', role: '', intelligence_level: 'standard', department: 'support' });
            toast.success(`Agente "${agent.name}" criado`);
            load();
        } catch {
            toast.error('Erro ao criar agente');
        } finally {
            setCreating(false);
        }
    }

    return (
        <div className="bg-bg-1 border border-stroke rounded-[2.5rem] p-10 flex flex-col gap-10 shadow-2xl relative overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl shadow-primary/20">
                        <Cpu size={30} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase">Configurador de Squad IA</h2>
                        <p className="text-text-3 text-sm font-medium">Defina papéis, permissões e fluxos de colaboração para seus agentes.</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-primary hover:bg-ai text-white px-8 py-3 rounded-2xl text-xs font-black transition-all shadow-lg shadow-primary/20 flex items-center gap-3 group"
                >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform" /> ADICIONAR AGENTE
                </button>
            </div>

            {/* Performance summary */}
            {perf && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Total',    value: perf.total_agents,  color: 'text-white' },
                        { label: 'Ativos',   value: perf.active_agents, color: 'text-success' },
                        { label: 'Pausados', value: perf.paused_agents, color: 'text-warning' },
                        { label: 'Idle',     value: perf.idle_agents,   color: 'text-text-3' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="bg-bg-0 border border-stroke rounded-2xl p-4">
                            <span className="text-[9px] font-black text-text-3 uppercase tracking-widest block mb-1">{label}</span>
                            <span className={`text-2xl font-black ${color}`}>{value}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Agent grid */}
            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <Loader2 size={24} className="animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {agents.map((agent) => {
                        const isActive   = agent.status === 'acting' || agent.status === 'thinking';
                        const statusInfo = STATUS_STYLE[agent.status] ?? STATUS_STYLE.idle;
                        const toggling   = togglingId === agent.id;
                        return (
                            <div
                                key={agent.id}
                                className={`bg-bg-0 border-2 rounded-[2rem] p-8 flex flex-col gap-6 transition-all group ${
                                    isActive ? 'border-primary/20 hover:shadow-2xl hover:shadow-primary/5' : 'border-stroke opacity-80 hover:opacity-100'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-16 h-16 rounded-full p-0.5 shadow-xl ${isActive ? 'bg-gradient-to-br from-primary to-ai' : 'bg-surface-2'}`}>
                                            <div className="w-full h-full rounded-full bg-bg-0 flex items-center justify-center">
                                                <Bot size={28} className={isActive ? 'text-primary' : 'text-text-3'} />
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-xl font-bold text-white tracking-tight block">{agent.name}</span>
                                            <span className="text-[10px] font-black text-text-3 uppercase tracking-widest bg-surface-2 px-2 py-0.5 rounded border border-stroke">{agent.role}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleToggle(agent.id)}
                                        disabled={toggling}
                                        title={isActive ? 'Pausar' : 'Ativar'}
                                        className="text-text-3 hover:text-white transition-colors disabled:opacity-50"
                                    >
                                        {toggling
                                            ? <Loader2 size={18} className="animate-spin" />
                                            : isActive ? <Pause size={18} /> : <Play size={18} />}
                                    </button>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">Habilidades</span>
                                    <div className="flex flex-wrap gap-2">
                                        {(agent.skills_json ?? []).slice(0, 4).map((skill) => {
                                            const s = SKILL_LABELS[skill] ?? { label: skill, icon: Zap, color: 'text-text-3' };
                                            return (
                                                <div key={skill} className="flex items-center gap-2 px-3 py-1.5 bg-surface-1 border border-stroke rounded-xl group-hover:border-primary/30 transition-all">
                                                    <s.icon size={12} className={s.color} />
                                                    <span className="text-[10px] font-bold text-text-2">{s.label}</span>
                                                </div>
                                            );
                                        })}
                                        {(agent.skills_json ?? []).length === 0 && (
                                            <span className="text-[10px] text-text-3">Sem habilidades definidas</span>
                                        )}
                                        {(agent.skills_json ?? []).length > 4 && (
                                            <div className="px-3 py-1.5 bg-surface-1 border border-stroke rounded-xl">
                                                <span className="text-[10px] font-bold text-text-3">+{agent.skills_json.length - 4}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-auto pt-6 border-t border-stroke flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Sparkles size={14} />
                                        <span className="text-[10px] font-black uppercase">Nível: {INTEL_LABEL[agent.intelligence_level] ?? agent.intelligence_level}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
                                        <span className="text-[10px] font-bold text-text-3 uppercase">{statusInfo.label}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Add placeholder */}
                    <div
                        onClick={() => setShowForm(true)}
                        className="bg-bg-0 border border-stroke border-dashed rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 opacity-60 hover:opacity-100 hover:border-primary/40 transition-all cursor-pointer py-12"
                    >
                        <div className="w-16 h-16 rounded-full bg-surface-1 border-2 border-dashed border-stroke flex items-center justify-center text-text-3">
                            <Bot size={28} />
                        </div>
                        <span className="text-xs font-bold text-text-3 uppercase tracking-widest">Novo Especialista</span>
                    </div>
                </div>
            )}

            {/* Shared memory */}
            <div className="p-8 bg-ai/5 border border-ai/20 rounded-[2rem] flex items-center gap-6 flex-wrap">
                <div className="w-12 h-12 rounded-xl bg-ai/20 flex items-center justify-center text-ai flex-shrink-0">
                    <MessageSquareShare size={24} />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white uppercase tracking-tight">Memória Compartilhada do Time</h4>
                    <p className="text-[10px] text-text-3">Todos os agentes da squad podem acessar os mesmos contextos históricos, garantindo handoffs perfeitos sem repetição para o cliente.</p>
                </div>
                {perf && (
                    <div className="flex gap-6 text-center flex-shrink-0">
                        <div>
                            <p className="text-xs font-black text-white">{perf.handoffs_today}</p>
                            <p className="text-[9px] text-text-3 uppercase">Handoffs hoje</p>
                        </div>
                        <div>
                            <p className="text-xs font-black text-success">{perf.resolution_rate_ai}</p>
                            <p className="text-[9px] text-text-3 uppercase">Taxa IA</p>
                        </div>
                        <div>
                            <p className="text-xs font-black text-ai">{perf.avg_collaboration_time}</p>
                            <p className="text-[9px] text-text-3 uppercase">Avg collab</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Agent Modal */}
            {showForm && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-bg-0/60 backdrop-blur-sm"
                    onClick={() => setShowForm(false)}
                >
                    <div
                        className="bg-bg-1 border border-stroke rounded-2xl p-8 w-full max-w-md shadow-2xl flex flex-col gap-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Novo Agente IA</h3>
                            <button onClick={() => setShowForm(false)} className="text-text-3 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest block mb-1.5">Nome</label>
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="Ex: Pulse Support"
                                    className="w-full bg-surface-2 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest block mb-1.5">Papel</label>
                                <input
                                    value={form.role}
                                    onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
                                    placeholder="Ex: Customer Success"
                                    className="w-full bg-surface-2 border border-stroke rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest block mb-1.5">Departamento</label>
                                    <select
                                        value={form.department}
                                        onChange={(e) => setForm(f => ({ ...f, department: e.target.value }))}
                                        className="w-full bg-surface-2 border border-stroke rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                                    >
                                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-text-3 uppercase tracking-widest block mb-1.5">Inteligência</label>
                                    <select
                                        value={form.intelligence_level}
                                        onChange={(e) => setForm(f => ({ ...f, intelligence_level: e.target.value }))}
                                        className="w-full bg-surface-2 border border-stroke rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                                    >
                                        {INTEL_LEVELS.map(l => <option key={l} value={l}>{INTEL_LABEL[l] ?? l}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleCreate}
                            disabled={creating || !form.name.trim() || !form.role.trim()}
                            className="w-full jarvis-gradient py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {creating
                                ? <><Loader2 size={14} className="animate-spin" /> A criar...</>
                                : <><Plus size={14} /> Criar Agente</>}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
