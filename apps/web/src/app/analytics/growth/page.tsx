import React from 'react';
import ForecastingChart from '@/components/analytics/ForecastingChart';
import ChurnRiskAlert from '@/components/analytics/ChurnRiskAlert';
import { LineChart, Zap, TrendingUp, Target, BarChart2, PieChart } from 'lucide-react';

export default function GrowthPage() {
    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-y-auto custom-scrollbar">
            <div className="p-8 max-w-7xl mx-auto w-full flex flex-col gap-10 pb-20">

                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
                            <div className="w-14 h-14 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl shadow-primary/20">
                                <Target size={32} />
                            </div>
                            Growth Intelligence
                        </h1>
                        <p className="text-text-3 font-medium">B.I. Preditivo: O Jarvis antecipa o comportamento do seu mercado.</p>
                    </div>

                    <button className="bg-bg-1 border border-stroke px-8 py-3 rounded-2xl text-[10px] font-black text-white hover:border-primary transition-all uppercase tracking-widest flex items-center gap-3">
                        <Zap size={16} className="text-primary fill-primary" /> RECALCULAR MODELOS
                    </button>
                </div>

                {/* Global Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Market Velocity', value: '4.8x', sub: '+0.2 vs last week', icon: TrendingUp, color: 'text-primary' },
                        { label: 'Avg LTV Preditivo', value: 'R$ 12.4k', sub: 'Calculado via IA', icon: BarChart2, color: 'text-success' },
                        { label: 'Churn Rate (Forecast)', value: '1.2%', sub: 'Target: < 1.0%', icon: PieChart, color: 'text-error' },
                        { label: 'Growth Score', value: '88/100', sub: 'Excelente Saúde', icon: Zap, color: 'text-warning' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-bg-1 border border-stroke rounded-[1.5rem] p-6 flex flex-col gap-2 hover:border-primary/30 transition-all group">
                            <div className="flex items-center justify-between">
                                <div className={`w-10 h-10 rounded-xl bg-bg-0 border border-stroke flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <stat.icon size={20} />
                                </div>
                            </div>
                            <div className="mt-4 flex flex-col">
                                <span className="text-[10px] font-black text-text-3 uppercase tracking-widest">{stat.label}</span>
                                <span className="text-2xl font-black text-white tracking-tighter">{stat.value}</span>
                                <span className="text-[9px] font-bold text-text-3 uppercase mt-1">{stat.sub}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Dynamic Analytics Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2">
                        <ForecastingChart />
                    </div>
                    <div className="flex flex-col gap-10">
                        <ChurnRiskAlert />

                        {/* Strategy Card */}
                        <div className="bg-gradient-to-br from-primary to-ai-accent rounded-[2.5rem] p-8 flex flex-col gap-6 text-white shadow-2xl shadow-primary/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[50px] rounded-full"></div>
                            <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <Zap size={18} fill="white" /> Growth Strategy
                            </h4>
                            <p className="text-xs font-bold leading-relaxed opacity-90">
                                O Jarvis detectou uma oportunidade de expansão no segmento Enterprise. Sugerimos realocar 15% do budget de marketing para retargeting preditivo.
                            </p>
                            <button className="w-full py-4 bg-white text-primary font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-opacity-90 transition-all">
                                APLICAR ESTRATÉGIA AGORA
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
