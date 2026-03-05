"use client";

import React, { useEffect, useState } from 'react';
import { DollarSign, Cpu, Info, Loader2 } from 'lucide-react';
import { apiGet } from '@/lib/api';

type CostData = {
    daily_burn_rate: number;
    token_efficiency: number;
    pixels_rendered: number;
    projected_monthly: number;
    engines: { name: string; percentage: number; cost: number }[];
};

export default function CostObservability() {
    const [data, setData] = useState<CostData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet<CostData>('/creative/observability/costs')
            .then(setData)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-bg-1 border border-stroke rounded-[3rem] p-12 flex flex-col gap-10 shadow-2xl relative overflow-hidden">

            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <Cpu size={24} className="text-primary" /> AI Cost Observability
                    </h3>
                    <p className="text-[10px] text-text-3 font-bold uppercase tracking-[0.2em]">Real-time API Billing & Usage</p>
                </div>
                <div className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                    <DollarSign size={14} className="text-success" />
                    <span className="text-[10px] font-black text-white uppercase italic">
                        Projected Month: {data ? `$${data.projected_monthly.toLocaleString()}` : '---'}
                    </span>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 size={28} className="text-primary animate-spin" />
                </div>
            ) : !data ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Cpu size={28} className="text-text-3" />
                    <p className="text-sm text-text-3">Nenhum dado de custo disponível.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { label: 'AI Burn Rate (Daily)', value: `$${data.daily_burn_rate.toFixed(2)}`, status: 'Normal' },
                            { label: 'Token Efficiency', value: `${data.token_efficiency}%`, status: 'Optimized' },
                            { label: 'Pixels Rendered', value: data.pixels_rendered >= 1e9 ? `${(data.pixels_rendered / 1e9).toFixed(1)}B` : `${(data.pixels_rendered / 1e6).toFixed(0)}M`, status: 'High' },
                        ].map((m) => (
                            <div key={m.label} className="p-8 bg-bg-0 border border-white/5 rounded-[2.5rem] flex flex-col gap-4">
                                <span className="text-[9px] font-black text-text-3 uppercase tracking-[0.2em]">{m.label}</span>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-3xl font-black text-white italic tracking-tighter uppercase">{m.value}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${m.status === 'Optimized' ? 'bg-success' : 'bg-primary'}`}></div>
                                    <span className="text-[8px] font-black text-text-3 uppercase tracking-widest">{m.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {data.engines && data.engines.length > 0 && (
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Breakdown by Engine</span>
                                <Info size={14} className="text-text-3" />
                            </div>

                            <div className="space-y-4">
                                {data.engines.map(engine => (
                                    <div key={engine.name} className="flex flex-col gap-2">
                                        <div className="flex justify-between items-center text-[9px] font-black uppercase italic">
                                            <span className="text-white">{engine.name}</span>
                                            <span className="text-text-3">${engine.cost.toLocaleString()}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-bg-0 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${engine.percentage}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

        </div>
    );
}
