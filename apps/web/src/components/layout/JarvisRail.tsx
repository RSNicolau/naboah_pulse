"use client";

import React, { useEffect, useState } from 'react';
import { Sparkles, Zap, ShieldCheck, Brain, ArrowUpRight, Ticket, Activity } from 'lucide-react';
import { apiGet, apiPatch } from '@/lib/api';
import { toast } from '@/lib/toast';
import Link from 'next/link';

type Agent = {
    id: string;
    name: string;
    role: string;
    status: string;
    intelligence_level: string;
    playbook_id: string;
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

type SlaAlert = {
    id: string;
    subject: string;
    priority: string;
    overdue: boolean;
    due_in_hours: number;
};

const STATUS_DOT: Record<string, string> = {
    acting:   'bg-success animate-pulse',
    thinking: 'bg-primary animate-pulse',
    idle:     'bg-text-3',
    paused:   'bg-warning',
};

const DEPT_LABEL: Record<string, string> = {
    pb_support:  'Support',
    pb_sales:    'Sales',
    pb_security: 'Security',
    pb_growth:   'Marketing',
};

function parseRate(rate: string): number {
    return parseInt(rate.replace('%', ''), 10) || 0;
}

export default function JarvisRail() {
    const [perf, setPerf] = useState<Performance | null>(null);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [slaAlerts, setSlaAlerts] = useState<SlaAlert[]>([]);
    const [activating, setActivating] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([
            apiGet<Performance>('/agents/team/performance'),
            apiGet<Agent[]>('/agents/team/squad'),
            apiGet<{ sla_alerts: SlaAlert[] }>('/analytics/dashboard'),
        ]).then(([p, a, dash]) => {
            setPerf(p);
            setAgents(a);
            setSlaAlerts(dash.sla_alerts ?? []);
        }).catch(() => toast.error('Erro ao carregar Jarvis'));
    }, []);

    async function toggleAgent(agent: Agent) {
        setActivating(agent.id);
        const next = ['acting', 'thinking'].includes(agent.status) ? 'paused' : 'acting';
        setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: next } : a));
        try {
            await apiPatch(`/agents/team/${agent.id}/status`, {});
            const updated = await apiGet<Performance>('/agents/team/performance');
            setPerf(updated);
        } catch {
            const fresh = await apiGet<Agent[]>('/agents/team/squad');
            setAgents(fresh);
        } finally {
            setActivating(null);
        }
    }

    const pulseScore = perf ? parseRate(perf.resolution_rate_ai) : null;
    const systemOk = perf ? perf.active_agents > 0 : true;

    return (
        <aside className="w-80 h-screen bg-bg-1 border-l border-stroke fixed right-0 top-0 z-20 flex flex-col overflow-hidden">

            {/* Header — Jarvis avatar + status */}
            <div className="p-6 flex flex-col items-center gap-4 border-b border-stroke flex-shrink-0">
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 jarvis-gradient opacity-20 blur-xl rounded-full animate-pulse" />
                    <div className="relative w-16 h-16 rounded-full border-2 border-ai/30 flex items-center justify-center shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                        <Zap className="w-8 h-8 text-ai animate-pulse" />
                    </div>
                </div>

                <div className="text-center">
                    <h2 className="text-lg font-bold text-white">Jarvis Pulse</h2>
                    <p className={`text-xs font-medium flex items-center justify-center gap-1 ${systemOk ? 'text-ai' : 'text-warning'}`}>
                        <ShieldCheck className="w-3 h-3" />
                        {perf == null ? 'Connecting...' : systemOk ? `${perf.active_agents} agents online` : 'No active agents'}
                    </p>
                </div>

                {/* Quick stats */}
                {perf && (
                    <div className="flex gap-3 w-full">
                        <div className="flex-1 bg-surface-1 border border-stroke rounded-xl p-2.5 text-center">
                            <div className="text-base font-black text-white">{perf.handoffs_today}</div>
                            <div className="text-[9px] font-bold text-text-3 uppercase tracking-widest">Handoffs</div>
                        </div>
                        <div className="flex-1 bg-surface-1 border border-stroke rounded-xl p-2.5 text-center">
                            <div className="text-base font-black text-success">{perf.resolution_rate_ai}</div>
                            <div className="text-[9px] font-bold text-text-3 uppercase tracking-widest">AI Resolve</div>
                        </div>
                        <div className="flex-1 bg-surface-1 border border-stroke rounded-xl p-2.5 text-center">
                            <div className="text-base font-black text-ai">{perf.avg_collaboration_time}</div>
                            <div className="text-[9px] font-bold text-text-3 uppercase tracking-widest">Avg Collab</div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-5">

                {/* SLA Alerts → Next Actions */}
                <div>
                    <h3 className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-3 px-1">
                        {slaAlerts.length > 0 ? `⚠ SLA Alerts (${slaAlerts.length})` : 'Next Actions'}
                    </h3>
                    <div className="flex flex-col gap-2">
                        {slaAlerts.length > 0 ? (
                            slaAlerts.slice(0, 3).map((alert) => (
                                <Link
                                    key={alert.id}
                                    href="/support"
                                    className="surface-glass p-3 rounded-xl border border-stroke/50 group cursor-pointer hover:border-critical/30 transition-all block"
                                >
                                    <div className="flex items-start justify-between mb-1.5">
                                        <span className="text-xs font-bold text-text-1 group-hover:text-white transition-colors line-clamp-1 flex-1">
                                            {alert.subject}
                                        </span>
                                        <ArrowUpRight className="w-3 h-3 text-text-3 group-hover:text-critical flex-shrink-0 ml-1" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border ${
                                            alert.overdue
                                                ? 'bg-critical/10 text-critical border-critical/20'
                                                : 'bg-warning/10 text-warning border-warning/20'
                                        }`}>
                                            {alert.overdue ? 'EXPIRADO' : `${alert.due_in_hours}h`}
                                        </span>
                                        <span className="text-[9px] text-text-3 px-1.5 py-0.5 bg-surface-2 rounded capitalize">{alert.priority}</span>
                                        <Ticket size={9} className="text-text-3 ml-auto" />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="surface-glass p-3 rounded-xl border border-stroke/50 text-center">
                                <p className="text-xs text-success font-bold">✓ Sem alertas SLA</p>
                                <p className="text-[10px] text-text-3 mt-0.5">Todos os tickets dentro do prazo</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Active Agents */}
                <div>
                    <h3 className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-3 px-1 flex items-center justify-between">
                        <span>Agentes Activos</span>
                        <Link href="/agents" className="text-primary hover:text-ai transition-colors">
                            <ArrowUpRight size={12} />
                        </Link>
                    </h3>
                    <div className="flex flex-col gap-2">
                        {agents.length === 0 ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-12 bg-surface-1 rounded-xl animate-pulse" />
                            ))
                        ) : (
                            agents.map((agent) => {
                                const isActive = ['acting', 'thinking'].includes(agent.status);
                                const isToggling = activating === agent.id;
                                return (
                                    <div
                                        key={agent.id}
                                        className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-1 border border-stroke/50 hover:border-stroke transition-colors group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-bg-0 border border-stroke flex items-center justify-center flex-shrink-0">
                                            <Brain size={14} className={isActive ? 'text-primary' : 'text-text-3'} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-white truncate">{agent.name}</p>
                                            <p className="text-[9px] text-text-3 truncate">{DEPT_LABEL[agent.playbook_id] ?? 'General'}</p>
                                        </div>
                                        <button
                                            onClick={() => toggleAgent(agent)}
                                            disabled={isToggling}
                                            className="flex items-center gap-1 flex-shrink-0"
                                            title={isActive ? 'Pausar' : 'Ativar'}
                                        >
                                            {isToggling ? (
                                                <div className="w-2 h-2 rounded-full bg-text-3 animate-pulse" />
                                            ) : (
                                                <div className={`w-2 h-2 rounded-full ${STATUS_DOT[agent.status] ?? 'bg-text-3'}`} />
                                            )}
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Pulse Score */}
                <div>
                    <h3 className="text-[10px] font-bold text-text-3 uppercase tracking-widest mb-3 px-1 flex items-center gap-1.5">
                        <Activity size={10} /> Pulse Score
                    </h3>
                    <div className="surface-glass p-4 rounded-2xl border border-stroke/50 flex flex-col items-center gap-2">
                        {pulseScore == null ? (
                            <div className="h-8 w-16 bg-surface-2 rounded animate-pulse" />
                        ) : (
                            <>
                                <span className="text-3xl font-bold text-white tracking-tighter">{pulseScore}</span>
                                <div className="w-full h-1 bg-surface-2 rounded-full overflow-hidden">
                                    <div className="h-full jarvis-gradient rounded-full transition-all duration-700" style={{ width: `${pulseScore}%` }} />
                                </div>
                                <p className="text-[10px] text-text-3 text-center mt-0.5">
                                    {perf?.total_agents} agentes · {perf?.active_agents} activos · {perf?.handoffs_today} handoffs hoje
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer CTA */}
            <div className="p-4 border-t border-stroke flex-shrink-0">
                <Link
                    href="/agents"
                    className="w-full py-2.5 rounded-xl jarvis-gradient text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
                >
                    <Sparkles className="w-4 h-4" /> Gerir AI Squad
                </Link>
            </div>
        </aside>
    );
}
