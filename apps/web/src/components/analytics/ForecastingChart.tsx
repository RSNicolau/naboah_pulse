import React from 'react';
import { TrendingUp, Zap, Info, ArrowUpRight } from 'lucide-react';

export default function ForecastingChart() {
    return (
        <div className="bg-bg-1 border border-stroke rounded-[2.5rem] p-10 flex flex-col gap-10 shadow-2xl relative overflow-hidden group">

            {/* Glow Effect */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xl shadow-primary/10">
                        <TrendingUp size={30} />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase tracking-wider">Forecasting Pro</h2>
                        <p className="text-text-3 text-sm font-medium">Projeções de receita via Jarvis Predictive Intelligence.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="px-5 py-2.5 bg-bg-0 border border-stroke rounded-xl text-[10px] font-black text-text-3 hover:text-white transition-all uppercase tracking-widest">30 DIAS</button>
                    <button className="px-5 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">90 DIAS</button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 bg-bg-0 border border-stroke rounded-2xl flex flex-col gap-2">
                    <span className="text-[10px] font-black text-text-3 uppercase tracking-widest">Receita Projetada</span>
                    <div className="flex items-end gap-3">
                        <span className="text-2xl font-black text-white tracking-tighter">R$ 142.500</span>
                        <div className="flex items-center gap-1 text-success text-[10px] font-bold pb-1">
                            <ArrowUpRight size={12} /> +12.4%
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-bg-0 border border-stroke rounded-2xl flex flex-col gap-2">
                    <span className="text-[10px] font-black text-text-3 uppercase tracking-widest">Confiança da IA</span>
                    <div className="flex items-end gap-3">
                        <span className="text-2xl font-black text-primary tracking-tighter">94.8%</span>
                        <span className="text-[10px] font-bold text-text-3 pb-1 uppercase">Padrão Ouro</span>
                    </div>
                </div>
                <div className="p-6 bg-bg-0 border border-stroke rounded-2xl flex flex-col gap-2">
                    <span className="text-[10px] font-black text-text-3 uppercase tracking-widest">Sazonalidade Detectada</span>
                    <div className="flex items-end gap-3">
                        <span className="text-2xl font-black text-warning tracking-tighter">Alta</span>
                        <span className="text-[10px] font-bold text-text-3 pb-1 uppercase">Páscoa/Abril</span>
                    </div>
                </div>
            </div>

            {/* Chart Mockup (Visual Only) */}
            <div className="h-[300px] w-full bg-bg-0 border border-stroke rounded-3xl relative flex items-end p-8 gap-4 overflow-hidden shadow-inner">
                {/* Grid Lines */}
                <div className="absolute inset-x-8 top-8 bottom-8 flex flex-col justify-between opacity-5">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-full h-px bg-white"></div>)}
                </div>

                {/* Abstract Chart Bars */}
                {[40, 45, 38, 52, 60, 58, 70, 75, 82, 90, 88, 95].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end gap-2 group/bar">
                        <div
                            className={`w-full rounded-t-lg transition-all duration-700 ${i > 8 ? 'bg-primary/20 border-t-2 border-primary border-dashed' : 'bg-primary/40'}`}
                            style={{ height: `${h}%` }}
                        >
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-bg-1 border border-stroke px-2 py-1 rounded text-[8px] font-black text-white opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20">
                                R$ {(h * 1500).toLocaleString()}
                            </div>
                        </div>
                        <span className="text-[8px] font-bold text-text-3 text-center uppercase">SET {i + 1}</span>
                    </div>
                ))}

                {/* Forecast Indicator */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/40 rounded-full">
                        <Zap size={12} className="text-primary fill-primary" />
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest">Predição Jarvis</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 p-6 bg-surface-1 border border-stroke rounded-2xl">
                <Info size={16} className="text-primary" />
                <p className="text-[11px] text-text-2 font-medium">
                    <span className="font-bold text-white uppercase tracking-tighter">Insight do Jarvis:</span> O forecasting indica um pico de demanda na próxima quinzena. Sugerimos reforçar a "AI Squad" de Vendas VIP para capturar o aumento de leads projetado.
                </p>
            </div>

        </div>
    );
}
