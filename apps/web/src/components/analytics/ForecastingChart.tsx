'use client';
import React, { useEffect, useState } from 'react';
import { TrendingUp, Zap, Info, ArrowUpRight, Loader2 } from 'lucide-react';
import { apiGet } from '@/lib/api';

type DataPoint = { period: string; predicted_value: number; actual_value: number | null };
type RevenueForecast = {
    data_points: DataPoint[];
    growth_rate: number;
    total_predicted: number;
};

export default function ForecastingChart() {
    const [forecast, setForecast] = useState<RevenueForecast | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet<RevenueForecast>('/insights/revenue-forecast')
            .then(setForecast)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const maxVal = forecast
        ? Math.max(...forecast.data_points.map(d => Math.max(d.predicted_value, d.actual_value ?? 0)), 1)
        : 1;

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
                        <p className="text-text-3 text-sm font-medium">Projeções de receita via Pulse Predictive Intelligence.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="px-5 py-2.5 bg-bg-0 border border-stroke rounded-xl text-[10px] font-black text-text-3 hover:text-white transition-all uppercase tracking-widest">30 DIAS</button>
                    <button className="px-5 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">90 DIAS</button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="text-primary animate-spin" />
                </div>
            ) : !forecast || forecast.data_points.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <TrendingUp size={32} className="text-text-3" />
                    <p className="text-sm text-text-3">Nenhum dado de forecast disponível.</p>
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="p-6 bg-bg-0 border border-stroke rounded-2xl flex flex-col gap-2">
                            <span className="text-[10px] font-black text-text-3 uppercase tracking-widest">Receita Projetada</span>
                            <div className="flex items-end gap-3">
                                <span className="text-2xl font-black text-white tracking-tighter">R$ {forecast.total_predicted.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                                <div className="flex items-center gap-1 text-success text-[10px] font-bold pb-1">
                                    <ArrowUpRight size={12} /> +{(forecast.growth_rate * 100).toFixed(1)}%
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
                            <span className="text-[10px] font-black text-text-3 uppercase tracking-widest">Data Points</span>
                            <div className="flex items-end gap-3">
                                <span className="text-2xl font-black text-warning tracking-tighter">{forecast.data_points.length}</span>
                                <span className="text-[10px] font-bold text-text-3 pb-1 uppercase">Períodos</span>
                            </div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="h-[300px] w-full bg-bg-0 border border-stroke rounded-3xl relative flex items-end p-8 gap-4 overflow-hidden shadow-inner">
                        {/* Grid Lines */}
                        <div className="absolute inset-x-8 top-8 bottom-8 flex flex-col justify-between opacity-5">
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-full h-px bg-white"></div>)}
                        </div>

                        {/* Chart Bars from API */}
                        {forecast.data_points.map((dp, i) => {
                            const val = dp.actual_value ?? dp.predicted_value;
                            const h = Math.max((val / maxVal) * 100, 2);
                            const isForecast = dp.actual_value === null;
                            return (
                                <div key={i} className="flex-1 flex flex-col justify-end gap-2 group/bar">
                                    <div
                                        className={`w-full rounded-t-lg transition-all duration-700 ${isForecast ? 'bg-primary/20 border-t-2 border-primary border-dashed' : 'bg-primary/40'}`}
                                        style={{ height: `${h}%` }}
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-bg-1 border border-stroke px-2 py-1 rounded text-[8px] font-black text-white opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20">
                                            R$ {val.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                                        </div>
                                    </div>
                                    <span className="text-[8px] font-bold text-text-3 text-center uppercase truncate">{dp.period}</span>
                                </div>
                            );
                        })}

                        {/* Forecast Indicator */}
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/40 rounded-full">
                                <Zap size={12} className="text-primary fill-primary" />
                                <span className="text-[9px] font-black text-primary uppercase tracking-widest">Predição Pulse AI</span>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className="flex items-center gap-3 p-6 bg-surface-1 border border-stroke rounded-2xl">
                <Info size={16} className="text-primary" />
                <p className="text-[11px] text-text-2 font-medium">
                    <span className="font-bold text-white uppercase tracking-tighter">Insight do Pulse AI:</span> O forecasting indica um pico de demanda na próxima quinzena. Sugerimos reforçar a "AI Squad" de Vendas VIP para capturar o aumento de leads projetado.
                </p>
            </div>

        </div>
    );
}
