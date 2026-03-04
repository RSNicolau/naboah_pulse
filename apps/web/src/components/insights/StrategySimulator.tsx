"use client";
import React, { useState } from 'react';
import { Target, Zap, TrendingDown, ArrowRight, BarChart3, Sliders, RefreshCw, Calculator } from 'lucide-react';

export default function StrategySimulator() {
    const [priceAdj, setPriceAdj] = useState(10);
    const [churnRed, setChurnRed] = useState(5);

    const currentRevenue = 450000;
    const projectedRevenue = currentRevenue * (1 + (priceAdj / 100)) * (1 + (churnRed / 300));

    return (
        <div className="bg-bg-1 border border-stroke rounded-[3rem] p-10 flex flex-col gap-10 shadow-2xl overflow-hidden relative group">

            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <Calculator size={24} className="text-secondary" /> Simulador de Impacto
                    </h3>
                    <p className="text-xs text-text-3 font-medium">Projete o futuro ajustando variáveis críticas.</p>
                </div>
                <button className="p-4 bg-bg-0 border border-white/5 rounded-2xl text-text-3 hover:text-white transition-all">
                    <RefreshCw size={20} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                {/* Controls */}
                <div className="flex flex-col gap-10">
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Ajuste de Preço Global</span>
                            <span className="text-sm font-black text-primary">+{priceAdj}%</span>
                        </div>
                        <input
                            type="range" min="-20" max="50" value={priceAdj}
                            onChange={(e) => setPriceAdj(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-bg-0 rounded-full appearance-none accent-primary cursor-pointer"
                        />
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Redução Planejada de Churn</span>
                            <span className="text-sm font-black text-secondary">-{churnRed}%</span>
                        </div>
                        <input
                            type="range" min="0" max="15" value={churnRed}
                            onChange={(e) => setChurnRed(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-bg-0 rounded-full appearance-none accent-secondary cursor-pointer"
                        />
                    </div>

                    <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                            <Zap size={24} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">Recomendação Pulse AI</span>
                            <p className="text-[11px] text-white font-medium italic">"Aumentar 10% no plano Pro reduz o ROI em 2% no primeiro mês, mas estabiliza MRR em 90 dias."</p>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="flex flex-col gap-8 justify-center">
                    <div className="p-8 bg-bg-0 border border-white/5 rounded-[2.5rem] flex flex-col gap-8 shadow-inner">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-black text-text-3 uppercase tracking-widest">Receita Mensal Projetada</span>
                            <div className="flex items-end gap-3 leading-none">
                                <span className="text-5xl font-black text-white tracking-tighter italic">R$ {projectedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
                                <span className="text-success text-sm font-black mb-1 flex items-center gap-1">
                                    <TrendingDown size={14} className="rotate-180" /> +{((projectedRevenue / currentRevenue - 1) * 100).toFixed(1)}%
                                </span>
                            </div>
                        </div>

                        <div className="h-px w-full bg-white/5"></div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black text-text-3 uppercase tracking-widest text-secondary">Novo LTV (Proj)</span>
                                <span className="text-xl font-black text-white italic">R$ 14,200</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black text-text-3 uppercase tracking-widest text-primary">Confiança</span>
                                <span className="text-xl font-black text-white italic">84%</span>
                            </div>
                        </div>
                    </div>

                    <button className="w-full py-5 bg-primary/10 border border-primary/30 text-primary rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-primary/20 transition-all flex items-center justify-center gap-3">
                        APLICAR ESTRATÉGIA NO AGENTE <ArrowRight size={16} />
                    </button>
                </div>

            </div>

        </div>
    );
}
