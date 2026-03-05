"use client";

import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Target, Zap, BarChart2, Loader2 } from 'lucide-react';
import { apiGet } from '@/lib/api';

type PerformanceMetric = {
    id: string;
    platform: string;
    spend: number;
    roas: number;
    impressions: number;
    clicks: number;
    conversions: number;
};

export default function BudgetHQ() {
    const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet<PerformanceMetric[]>('/ads/performance')
            .then(setMetrics)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-bg-1 border border-stroke rounded-[3rem] p-12 flex flex-col gap-10 shadow-2xl relative overflow-hidden">

            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <DollarSign size={24} className="text-success" /> Budget HQ
                    </h3>
                    <p className="text-[10px] text-text-3 font-bold uppercase tracking-[0.2em]">Real-time ROI Monitoring</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-success/20 text-success border border-success/30 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all">
                        <Zap size={14} /> OPTIMIZE BUDGET
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 size={28} className="text-success animate-spin" />
                </div>
            ) : metrics.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <DollarSign size={28} className="text-text-3" />
                    <p className="text-sm text-text-3">Nenhum dado de performance disponível.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {metrics.slice(0, 3).map((platform) => {
                        const trendPositive = platform.roas >= 3;
                        const colorClass = platform.roas >= 4 ? 'text-primary' : platform.roas >= 3 ? 'text-secondary' : 'text-warning';
                        return (
                            <div key={platform.id} className="bg-bg-0 border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-6 group hover:border-success/30 transition-all">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest italic">{platform.platform}</span>
                                    <div className={`flex items-center gap-1 ${trendPositive ? 'text-success' : 'text-error'}`}>
                                        {trendPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                        <span className="text-[9px] font-black">{platform.roas.toFixed(1)}x</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <span className="text-3xl font-black text-white tracking-tighter italic">${platform.spend.toLocaleString()}</span>
                                    <span className="text-[9px] font-bold text-text-3 uppercase tracking-widest italic">AD SPEND</span>
                                </div>

                                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[8px] font-black text-text-3 uppercase tracking-widest">CURRENT ROAS</span>
                                        <span className={`text-sm font-black italic ${colorClass}`}>{platform.roas.toFixed(1)}x</span>
                                    </div>
                                    <BarChart2 size={16} className="text-text-3 opacity-20 group-hover:opacity-100 transition-all" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="p-10 bg-bg-0 border border-white/5 rounded-[3.5rem] relative overflow-hidden group">
                <div className="flex flex-col gap-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <Target size={20} className="text-primary" />
                        <h4 className="text-sm font-black text-white uppercase tracking-widest italic">Pulse AI Scaling Recommendation</h4>
                    </div>
                    <p className="text-xs text-text-3 font-medium leading-relaxed max-w-xl">
                        {metrics.length > 0
                            ? `Performance data loaded for ${metrics.length} platform(s). Total spend: $${metrics.reduce((a, m) => a + m.spend, 0).toLocaleString()}. Avg ROAS: ${(metrics.reduce((a, m) => a + m.roas, 0) / metrics.length).toFixed(1)}x.`
                            : 'Connect ad accounts to receive AI-powered budget optimization recommendations.'}
                    </p>
                </div>
                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-all duration-700">
                    <TrendingUp size={120} className="text-white" />
                </div>
            </div>

        </div>
    );
}
