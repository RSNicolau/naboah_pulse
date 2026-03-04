"use client";

import React, { useEffect, useState } from 'react';
import { Sparkles, Zap, Brain, ArrowUpRight, Activity } from 'lucide-react';
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
    idle:     'bg-text-3/40',
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
        <aside className="w-80 h-screen bg-bg-1 border-l border-white/[0.05] fixed right-0 top-0 z-20 flex flex-col overflow-hidden">

            {/* Header — slimmer, inline stats */}
            <div className="h-12 px-4 flex items-center justify-between border-b border-white/[0.05] flex-shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className={`relative w-7 h-7 rounded-lg flex items-center justify-center ${systemOk ? 'jarvis-gradient' : 'bg-surface-2'}`}>
                        <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                        {systemOk && (
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-success border border-bg-1" />
                        )}
                    </div>
                    <div>
                        <p className="text-[13px] font-semibold text-text-1 leading-tight">Jarvis</p>
                        <p className={`text-[9px] leading-tight ${systemOk ? 'text-success' : 'text-text-3'}`}>
                            {perf == null ? 'Connecting...' : systemOk ? `${perf.active_agents} agents online` : 'No active agents'}
                        </p>
                    </div>
                </div>

                {perf && (
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-[11px] font-bold text-text-1 tabular-nums">{perf.handoffs_today}</div>
                            <div className="text-[8px] text-text-3/60 uppercase tracking-wider">Handoffs</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[11px] font-bold text-success tabular-nums">{perf.resolution_rate_ai}</div>
                            <div className="text-[8px] text-text-3/60 uppercase tracking-wider">AI Rate</div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-4">

                {/* SLA Alerts */}
                <div>
                    <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-[9px] font-semibold text-text-3/50 uppercase tracking-[0.1em]">
                            {slaAlerts.length > 0 ? `SLA Alerts · ${slaAlerts.length}` : 'Next Actions'}
                        </span>
                    </div>
                    <div className="flex flex-col gap-1">
                        {slaAlerts.length > 0 ? (
                            slaAlerts.slice(0, 3).map((alert) => (
                                <Link
                                    key={alert.id}
                                    href="/support"
                                    className="flex items-start justify-between gap-2 px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.04] group transition-all"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-medium text-text-2 group-hover:text-text-1 truncate transition-colors">
                                            {alert.subject}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                                                alert.overdue
                                                    ? 'bg-critical/10 text-critical'
                                                    : 'bg-warning/10 text-warning'
                                            }`}>
                                                {alert.overdue ? 'Expirado' : `${alert.due_in_hours}h`}
                                            </span>
                                            <span className="text-[9px] text-text-3/60 capitalize">{alert.priority}</span>
                                        </div>
                                    </div>
                                    <ArrowUpRight size={12} className="text-text-3/40 group-hover:text-text-3 mt-0.5 flex-shrink-0 transition-colors" />
                                </Link>
                            ))
                        ) : (
                            <div className="px-3 py-2.5 rounded-lg bg-success/5 border border-success/10 text-center">
                                <p className="text-[11px] text-success/80 font-medium">Sem alertas SLA</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="h-px bg-white/[0.04]" />

                {/* Agents */}
                <div>
                    <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-[9px] font-semibold text-text-3/50 uppercase tracking-[0.1em]">Agentes</span>
                        <Link href="/agents" className="text-[9px] text-text-3/50 hover:text-primary transition-colors flex items-center gap-0.5">
                            Ver todos <ArrowUpRight size={9} />
                        </Link>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        {agents.length === 0 ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-9 rounded-lg bg-white/[0.03] animate-pulse" />
                            ))
                        ) : (
                            agents.map((agent) => {
                                const isActive = ['acting', 'thinking'].includes(agent.status);
                                const isToggling = activating === agent.id;
                                return (
                                    <div
                                        key={agent.id}
                                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.03] transition-colors group"
                                    >
                                        <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-primary/10' : 'bg-white/[0.03]'}`}>
                                            <Brain size={12} className={isActive ? 'text-primary' : 'text-text-3/50'} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[12px] font-medium text-text-2 truncate leading-tight">{agent.name}</p>
                                            <p className="text-[9px] text-text-3/50 truncate leading-tight">{DEPT_LABEL[agent.playbook_id] ?? 'General'}</p>
                                        </div>
                                        <button
                                            onClick={() => toggleAgent(agent)}
                                            disabled={isToggling}
                                            className="flex-shrink-0 p-1"
                                            title={isActive ? 'Pausar' : 'Ativar'}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full transition-all ${isToggling ? 'bg-text-3/30 animate-pulse' : STATUS_DOT[agent.status] ?? 'bg-text-3/40'}`} />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="h-px bg-white/[0.04]" />

                {/* Pulse Score */}
                <div className="px-1">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-semibold text-text-3/50 uppercase tracking-[0.1em] flex items-center gap-1">
                            <Activity size={9} /> Pulse Score
                        </span>
                        {perf && (
                            <span className="text-[9px] text-text-3/40 tabular-nums">
                                {perf.total_agents} agentes
                            </span>
                        )}
                    </div>
                    {pulseScore == null ? (
                        <div className="h-8 rounded bg-white/[0.03] animate-pulse" />
                    ) : (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-end gap-1.5">
                                <span className="text-2xl font-bold text-text-1 tabular-nums leading-none">{pulseScore}</span>
                                <span className="text-xs text-text-3/50 mb-0.5">/ 100</span>
                            </div>
                            <div className="w-full h-0.5 bg-white/[0.06] rounded-full overflow-hidden">
                                <div
                                    className="h-full jarvis-gradient rounded-full transition-all duration-700"
                                    style={{ width: `${pulseScore}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="px-3 py-2.5 border-t border-white/[0.05] flex-shrink-0">
                <Link
                    href="/agents"
                    className="w-full py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.05] text-text-2 hover:text-text-1 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
                >
                    <Sparkles size={12} className="text-primary" />
                    Gerir AI Squad
                </Link>
            </div>
        </aside>
    );
}
