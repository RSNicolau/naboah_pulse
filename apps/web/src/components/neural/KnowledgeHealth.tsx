'use client';
import React, { useEffect, useState } from 'react';
import { Activity, Brain, AlertTriangle, Search, Info, Shield, TrendingUp, Loader2 } from 'lucide-react';
import { apiGet } from '@/lib/api';

type HealthMetrics = {
    vector_size: string;
    chunks: number;
    health_score: number;
    hallucination_risk: number;
    top_k_precision: number;
    gaps: string[];
    coverage: { topic: string; percentage: number }[];
};

export default function KnowledgeHealth() {
    const [health, setHealth] = useState<HealthMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet<HealthMetrics>('/neural/knowledge/health')
            .then(setHealth)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="text-primary animate-spin" />
            </div>
        );
    }

    if (!health) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3 bg-bg-1 border border-dashed border-stroke rounded-3xl">
                <Brain size={32} className="text-text-3" />
                <p className="text-sm text-text-3">Nenhum dado de saúde do conhecimento disponível.</p>
            </div>
        );
    }

    const metrics = [
        { label: 'Cérebro Vetorial', value: health.vector_size, sub: `${health.chunks.toLocaleString()} chunks`, icon: Brain, color: 'text-primary' },
        { label: 'Score de Saúde', value: `${health.health_score}/100`, sub: health.health_score >= 80 ? 'Muito Alto' : 'Moderado', icon: Activity, color: 'text-success' },
        { label: 'Hallucination Risk', value: `${(health.hallucination_risk * 100).toFixed(1)}%`, sub: health.hallucination_risk < 0.01 ? 'Mínimo' : 'Atenção', icon: Shield, color: 'text-secondary' },
        { label: 'Top-k Precision', value: `${(health.top_k_precision * 100).toFixed(0)}%`, sub: 'Busca Semântica', icon: TrendingUp, color: 'text-ai-accent' },
    ];

    const gaps = health.gaps ?? [];
    const coverage = health.coverage ?? [];

    return (
        <div className="flex flex-col gap-8">

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {metrics.map((m, i) => (
                    <div key={i} className="bg-bg-1 border border-stroke p-6 rounded-3xl flex flex-col gap-3 shadow-xl hover:border-white/10 transition-colors group">
                        <div className="flex items-center justify-between">
                            <m.icon size={18} className={`${m.color} opacity-70`} />
                            <span className="text-[10px] font-black text-text-3 uppercase tracking-widest">{m.label}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-white">{m.value}</span>
                            <span className="text-[10px] font-bold text-text-3 italic">{m.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Knowledge Gaps */}
                <div className="bg-bg-1 border border-stroke rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-error/5 blur-3xl"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                            <AlertTriangle size={18} className="text-error" /> Lacunas de Conhecimento
                        </h3>
                        <span className="text-[9px] font-black text-text-3 uppercase">Detection Engine v2</span>
                    </div>

                    {gaps.length === 0 ? (
                        <p className="text-sm text-text-3 text-center py-6">Nenhuma lacuna detectada.</p>
                    ) : (
                        <div className="flex flex-col gap-3 relative z-10">
                            {gaps.map((gap, i) => (
                                <div key={i} className="p-5 bg-bg-0 border border-stroke rounded-2xl flex items-center justify-between group cursor-help hover:border-error/30 transition-all">
                                    <p className="text-[11px] font-medium text-text-2 group-hover:text-white transition-colors">{gap}</p>
                                    <button className="flex items-center gap-2 px-3 py-1.5 bg-error/10 text-error rounded-lg text-[8px] font-black uppercase tracking-tighter hover:bg-error hover:text-white transition-all">
                                        RESOLVER
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Knowledge Coverage */}
                <div className="bg-bg-1 border border-stroke rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-2xl relative">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                            <Search size={18} className="text-primary" /> Cobertura por Tópico
                        </h3>
                        <Info size={14} className="text-text-3" />
                    </div>

                    {coverage.length === 0 ? (
                        <p className="text-sm text-text-3 text-center py-6">Nenhum dado de cobertura disponível.</p>
                    ) : (
                        <div className="flex-1 grid grid-cols-3 gap-4 pt-4">
                            {coverage.map((item, i) => {
                                const pct = item.percentage;
                                const bgColor = pct >= 80 ? 'bg-success/40' : pct >= 50 ? 'bg-success/20' : pct >= 30 ? 'bg-warning/20' : 'bg-error/20';
                                return (
                                    <div key={i} className={`rounded-2xl p-4 flex flex-col gap-3 justify-between border border-white/5 ${bgColor}`}>
                                        <span className="text-[9px] font-black text-white uppercase tracking-tighter truncate">{item.topic}</span>
                                        <span className="text-lg font-black text-white">{pct}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
}
