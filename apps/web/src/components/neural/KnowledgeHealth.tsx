import React from 'react';
import { Activity, Brain, AlertTriangle, CheckCircle2, TrendingUp, Search, Info, Shield } from 'lucide-react';

export default function KnowledgeHealth() {
    const gaps = [
        "Informações sobre 'Plano Enterprise' estão inconsistentes",
        "Falta documentação sobre integração com Shopify v2",
        "Conversas recentes sobre 'Devoluções' indicam baixa confiança da IA"
    ];

    return (
        <div className="flex flex-col gap-8">

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Cérebro Vetorial', value: '42.5 MB', sub: '12,400 chunks', icon: Brain, color: 'text-primary' },
                    { label: 'Score de Saúde', value: '88/100', sub: 'Muito Alto', icon: Activity, color: 'text-success' },
                    { label: 'Hallucination Risk', value: '0.2%', sub: 'Mínimo', icon: Shield, color: 'text-secondary' },
                    { label: 'Top-k Precision', value: '94%', sub: 'Busca Semântica', icon: TrendingUp, color: 'text-ai-accent' },
                ].map((m, i) => (
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

                {/* Identification Gaps */}
                <div className="bg-bg-1 border border-stroke rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-error/5 blur-3xl"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                            <AlertTriangle size={18} className="text-error" /> Lacunas de Conhecimento
                        </h3>
                        <span className="text-[9px] font-black text-text-3 uppercase">Detection Engine v2</span>
                    </div>

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
                </div>

                {/* Knowledge Coverage Heatmap (Mocked) */}
                <div className="bg-bg-1 border border-stroke rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-2xl relative">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                            <Search size={18} className="text-primary" /> Cobertura por Tópico
                        </h3>
                        <Info size={14} className="text-text-3" />
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-4 pt-4">
                        {[
                            { t: 'Preços', c: 'bg-success/40', s: '100%' },
                            { t: 'Logística', c: 'bg-success/20', s: '85%' },
                            { t: 'Devolução', c: 'bg-warning/20', s: '40%' },
                            { t: 'Suporte Técnico', c: 'bg-success/30', s: '92%' },
                            { t: 'Integrações', c: 'bg-error/20', s: '15%' },
                            { t: 'Marketing', c: 'bg-success/10', s: '70%' },
                        ].map((item, i) => (
                            <div key={i} className={`rounded-2xl p-4 flex flex-col gap-3 justify-between border border-white/5 ${item.c}`}>
                                <span className="text-[9px] font-black text-white uppercase tracking-tighter truncate">{item.t}</span>
                                <span className="text-lg font-black text-white">{item.s}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </div>
    );
}
