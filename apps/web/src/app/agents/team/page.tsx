"use client";

import React, { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import AITeamBuilder from '@/components/agents/AITeamBuilder';
import AgentHandoffMonitor from '@/components/agents/AgentHandoffMonitor';
import { Users, Activity } from 'lucide-react';

type Perf = {
    total_agents: number;
    active_agents: number;
    idle_agents: number;
    paused_agents: number;
    handoffs_today: number;
    resolution_rate_ai: string;
    avg_collaboration_time: string;
};

export default function AITeamPage() {
    const [perf, setPerf] = useState<Perf | null>(null);

    useEffect(() => {
        apiGet<Perf>('/agents/team/performance').then(setPerf).catch(console.error);
    }, []);

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-y-auto custom-scrollbar">
            <div className="p-8 max-w-7xl mx-auto w-full flex flex-col gap-10 pb-20">

                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
                            <div className="w-14 h-14 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl shadow-primary/20">
                                <Users size={32} />
                            </div>
                            AI Squad Control
                        </h1>
                        <p className="text-text-3 font-medium">Orquestração avançada de múltiplos agentes inteligentes e departamentos digitais.</p>
                    </div>

                    <div className="flex gap-3">
                        <div className="bg-bg-1 border border-success/20 px-5 py-3 rounded-2xl flex flex-col gap-0.5">
                            <span className="text-[10px] font-black text-text-3 uppercase tracking-widest">Agentes Ativos</span>
                            {perf
                                ? <span className="text-xl font-black text-success">{String(perf.active_agents).padStart(2, '0')}</span>
                                : <div className="h-6 w-8 bg-surface-2 rounded animate-pulse mt-0.5" />}
                        </div>
                        <div className="bg-bg-1 border border-primary/20 px-5 py-3 rounded-2xl flex flex-col gap-0.5">
                            <span className="text-[10px] font-black text-text-3 uppercase tracking-widest">Total Agents</span>
                            {perf
                                ? <span className="text-xl font-black text-white">{String(perf.total_agents).padStart(2, '0')}</span>
                                : <div className="h-6 w-8 bg-surface-2 rounded animate-pulse mt-0.5" />}
                        </div>
                        <div className="bg-bg-1 border border-ai/20 px-5 py-3 rounded-2xl flex flex-col gap-0.5">
                            <span className="text-[10px] font-black text-text-3 uppercase tracking-widest">Handoffs (24h)</span>
                            {perf
                                ? <span className="text-xl font-black text-ai">{perf.handoffs_today}</span>
                                : <div className="h-6 w-8 bg-surface-2 rounded animate-pulse mt-0.5" />}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2">
                        <AITeamBuilder />
                    </div>
                    <div className="flex flex-col gap-8">
                        <AgentHandoffMonitor />

                        <div className="bg-gradient-to-br from-bg-1 to-surface-1 border border-stroke rounded-[2rem] p-8 flex flex-col gap-6">
                            <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Activity size={16} className="text-success" /> Saúde da Squad
                            </h4>
                            <div className="space-y-4">
                                {[
                                    { label: 'Resolution Rate AI', value: perf?.resolution_rate_ai ?? '—', bar: 82, color: 'bg-success' },
                                    { label: 'Avg Collab Time', value: perf?.avg_collaboration_time ?? '—', bar: 15, color: 'bg-ai' },
                                ].map(stat => (
                                    <div key={stat.label} className="flex flex-col gap-2">
                                        <div className="flex justify-between text-[10px] font-bold text-text-3 uppercase">
                                            <span>{stat.label}</span>
                                            <span className="text-white">{stat.value}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-bg-0 rounded-full overflow-hidden">
                                            <div className={`h-full ${stat.color} rounded-full`} style={{ width: `${stat.bar}%` }} />
                                        </div>
                                    </div>
                                ))}

                                {perf && (
                                    <div className="pt-2 border-t border-stroke grid grid-cols-3 gap-2">
                                        {[
                                            { label: 'Active', value: perf.active_agents, color: 'text-success' },
                                            { label: 'Idle', value: perf.idle_agents, color: 'text-text-3' },
                                            { label: 'Paused', value: perf.paused_agents, color: 'text-warning' },
                                        ].map(s => (
                                            <div key={s.label} className="flex flex-col items-center gap-0.5">
                                                <span className={`text-lg font-black ${s.color}`}>{s.value}</span>
                                                <span className="text-[9px] font-bold text-text-3 uppercase">{s.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
