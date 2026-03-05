'use client';
import React, { useEffect, useState } from 'react';
import ExecutiveReport from '@/components/insights/ExecutiveReport';
import StrategySimulator from '@/components/insights/StrategySimulator';
import { Target, Lightbulb, Globe, ArrowUpRight, Zap, Loader2 } from 'lucide-react';
import { apiGet } from '@/lib/api';

type Recommendation = {
    id: string;
    name: string;
    priority: string;
    projected_revenue: number;
    confidence_score: number;
    parameters_json: string;
};

export default function StrategyDashboardPage() {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet<Recommendation[]>('/insights/v3/strategy/recommendations')
            .then(setRecommendations)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const totalRevenue = recommendations.reduce((acc, r) => acc + r.projected_revenue, 0);
    const avgConfidence = recommendations.length > 0
        ? recommendations.reduce((acc, r) => acc + r.confidence_score, 0) / recommendations.length
        : 0;

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-hidden text-white">

            {/* C-Level Header */}
            <div className="px-10 py-12 border-b border-stroke flex items-center justify-between bg-gradient-to-r from-bg-1 to-bg-0">
                <div className="flex items-center gap-8">
                    <div className="w-18 h-18 rounded-[2rem] bg-primary text-white flex items-center justify-center shadow-2xl">
                        <Target size={36} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-black tracking-tighter uppercase tracking-widest italic flex items-center gap-4">
                            AI Strategy Engine <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full not-italic tracking-normal">VERSION 3.0</span>
                        </h1>
                        <p className="text-text-3 font-medium text-base mt-1 italic">Inteligência narrativa para decisões de alto impacto.</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="px-6 py-4 bg-secondary/5 border border-secondary/10 rounded-2xl flex items-center gap-3">
                        <Zap size={16} className="text-secondary" />
                        <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Modo Estratégico Ativo</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 overflow-y-auto custom-scrollbar pb-32">

                {/* Left Column: Narrative & Simulation */}
                <div className="lg:col-span-8 flex flex-col gap-10">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                            <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Storytelling de Negócios</h2>
                        </div>
                        <ExecutiveReport />
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-secondary rounded-full"></div>
                            <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Laboratório de Simulação de ROI</h2>
                        </div>
                        <StrategySimulator />
                    </div>
                </div>

                {/* Right Column: Recommendations & KPIs */}
                <div className="lg:col-span-4 flex flex-col gap-10">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-white rounded-full"></div>
                            <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Consultoria Pulse AI</h2>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 size={28} className="text-primary animate-spin" />
                            </div>
                        ) : recommendations.length === 0 ? (
                            <div className="p-8 bg-bg-1 border border-dashed border-stroke rounded-[2.5rem] flex flex-col items-center gap-3">
                                <Lightbulb size={28} className="text-text-3" />
                                <p className="text-sm text-text-3 text-center">Nenhuma recomendação estratégica disponível.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {recommendations.map((rec) => (
                                    <div key={rec.id} className="p-8 bg-bg-1 border border-stroke rounded-[2.5rem] flex flex-col gap-4 group hover:border-primary/30 transition-all cursor-pointer shadow-xl">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] italic">{rec.priority}</span>
                                            <div className="px-2 py-0.5 rounded-md bg-white/5 text-[8px] font-black text-text-3 uppercase">Confiança {(rec.confidence_score * 100).toFixed(0)}%</div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <h4 className="text-sm font-black text-white uppercase tracking-widest">{rec.name}</h4>
                                            <p className="text-[10px] text-text-3 font-medium leading-relaxed italic">
                                                Receita projetada: R$ {rec.projected_revenue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-10 bg-gradient-to-br from-primary/20 to-bg-1 border border-primary/20 rounded-[3rem] shadow-2xl flex flex-col gap-8 relative overflow-hidden">
                        <Globe size={140} className="absolute -bottom-10 -right-10 text-white/[0.03] rotate-12" />
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-text-3 uppercase tracking-widest italic">Receita Projetada Total</span>
                                <span className="text-3xl font-black text-white tracking-tighter italic">
                                    R$ {totalRevenue > 0 ? (totalRevenue / 1000).toFixed(0) + 'k' : '---'}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-text-3 uppercase tracking-widest italic">Confiança Média IA</span>
                                <span className="text-3xl font-black text-text-3 tracking-tighter italic">
                                    {avgConfidence > 0 ? (avgConfidence * 100).toFixed(1) + '%' : '---'}
                                </span>
                            </div>
                        </div>
                        <button className="flex items-center justify-center gap-3 py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                            ABRIR ESTRATÉGIA COMPLETA <ArrowUpRight size={14} />
                        </button>
                    </div>
                </div>

            </div>

        </div>
    );
}
