'use client';
import React, { useEffect, useState } from 'react';
import BudgetHQ from '@/components/creative/BudgetHQ';
import AdsDeployer from '@/components/creative/AdsDeployer';
import AssetLibrary from '@/components/creative/AssetLibrary';
import { DollarSign, Activity, TrendingUp } from 'lucide-react';
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

export default function PaidMediaPage() {
    const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet<PerformanceMetric[]>('/ads/performance')
            .then(setMetrics)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const totalSpend = metrics.reduce((a, m) => a + m.spend, 0);
    const avgRoas = metrics.length > 0 ? metrics.reduce((a, m) => a + m.roas, 0) / metrics.length : 0;
    const totalConversions = metrics.reduce((a, m) => a + m.conversions, 0);
    const activeCampaigns = metrics.length;

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-hidden text-white">

            {/* Header */}
            <div className="px-10 py-12 border-b border-stroke flex items-center justify-between bg-gradient-to-r from-bg-1 to-bg-0">
                <div className="flex items-center gap-8">
                    <div className="w-18 h-18 rounded-[2rem] bg-success text-white flex items-center justify-center shadow-2xl -rotate-2">
                        <DollarSign size={36} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-black tracking-tighter uppercase tracking-widest italic flex items-center gap-4">
                            Paid Media & Budget <span className="text-[10px] bg-success/20 text-success border border-success/30 px-3 py-1 rounded-full not-italic tracking-normal">PERFORMANCE LAB</span>
                        </h1>
                        <p className="text-text-3 font-medium text-base mt-1 italic">Conecte criativos com tráfego pago e otimize seu ROAS.</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                        <Activity size={16} className="text-success animate-pulse" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest italic">
                            Global ROAS: {avgRoas > 0 ? `${avgRoas.toFixed(1)}x` : '---'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 overflow-y-auto custom-scrollbar pb-32">

                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-8 mb-4">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="p-8 bg-bg-1 border border-stroke rounded-[2.5rem] animate-pulse">
                                <div className="h-3 w-20 bg-surface-2 rounded mb-2" />
                                <div className="h-7 w-16 bg-surface-2 rounded" />
                            </div>
                        ))
                    ) : (
                        <>
                            <div className="p-8 bg-bg-1 border border-stroke rounded-[2.5rem] flex flex-col gap-2">
                                <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">Total Spend</span>
                                <span className="text-2xl font-black text-white italic uppercase tracking-tighter">${totalSpend.toLocaleString()}</span>
                            </div>
                            <div className="p-8 bg-bg-1 border border-stroke rounded-[2.5rem] flex flex-col gap-2">
                                <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">Total ROAS</span>
                                <span className="text-2xl font-black text-success italic uppercase tracking-tighter">{avgRoas > 0 ? `${avgRoas.toFixed(2)}x` : '---'}</span>
                            </div>
                            <div className="p-8 bg-bg-1 border border-stroke rounded-[2.5rem] flex flex-col gap-2">
                                <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">Conversions</span>
                                <span className="text-2xl font-black text-white italic uppercase tracking-tighter">{totalConversions.toLocaleString()}</span>
                            </div>
                            <div className="p-8 bg-bg-1 border border-stroke rounded-[2.5rem] flex flex-col gap-2">
                                <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">Platforms Active</span>
                                <span className="text-2xl font-black text-primary italic uppercase tracking-tighter">{activeCampaigns}</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="lg:col-span-8">
                    <BudgetHQ />
                </div>

                <div className="lg:col-span-4">
                    <AdsDeployer />
                </div>

                <div className="lg:col-span-12 mt-10">
                    <div className="flex items-center gap-3 mb-8">
                        <TrendingUp size={20} className="text-primary" />
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Performance of Generative Assets</h2>
                    </div>
                    <AssetLibrary />
                </div>

            </div>

        </div>
    );
}
