import React from 'react';
import ExecutiveReport from '@/components/insights/ExecutiveReport';
import StrategySimulator from '@/components/insights/StrategySimulator';
import { Target, TrendingUp, Lightbulb, Users, Globe, ArrowUpRight, Zap, ListChecks } from 'lucide-react';

export default function StrategyDashboardPage() {
    const recommendations = [
        { title: 'Otimização de Retenção', desc: 'Implementar fluxo de nutrição para clientes com "Health Score" abaixo de 60.', impact: 'Alto', type: 'Churn' },
        { title: 'Promoção Cross-border', desc: 'Ativar campanhas de Natal na Europa aproveitando o VAT Engine v35.', impact: 'Médio', type: 'Growth' },
        { title: 'Upgrade Automatizado', desc: 'Sugerir plano Enterprise para tenants que atingiram 90% da cota de usuários.', impact: 'Alto', type: 'Sales' },
    ];

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
                            <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Consultoria Jarvis</h2>
                        </div>

                        <div className="flex flex-col gap-4">
                            {recommendations.map((rec, i) => (
                                <div key={i} className="p-8 bg-bg-1 border border-stroke rounded-[2.5rem] flex flex-col gap-4 group hover:border-primary/30 transition-all cursor-pointer shadow-xl">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] italic">{rec.type}</span>
                                        <div className="px-2 py-0.5 rounded-md bg-white/5 text-[8px] font-black text-text-3 uppercase">Impacto {rec.impact}</div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h4 className="text-sm font-black text-white uppercase tracking-widest">{rec.title}</h4>
                                        <p className="text-[10px] text-text-3 font-medium leading-relaxed italic">{rec.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-10 bg-gradient-to-br from-primary/20 to-bg-1 border border-primary/20 rounded-[3rem] shadow-2xl flex flex-col gap-8 relative overflow-hidden">
                        <Globe size={140} className="absolute -bottom-10 -right-10 text-white/[0.03] rotate-12" />
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-text-3 uppercase tracking-widest italic">Saúde da Carteira (LTV)</span>
                                <span className="text-3xl font-black text-white tracking-tighter italic">R$ 1.8M</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-text-3 uppercase tracking-widest italic">Custo de Aquisição (CAC)</span>
                                <span className="text-3xl font-black text-text-3 tracking-tighter italic">R$ 420.00</span>
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
