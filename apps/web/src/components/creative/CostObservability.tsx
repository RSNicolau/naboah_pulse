"use client";

import React from 'react';
import { BarChart3, TrendingDown, DollarSign, Cpu, Layers, Zap, Info } from 'lucide-react';

export default function CostObservability() {
    const metrics = [
        { label: 'AI Burn Rate (Daily)', value: '$142.50', trend: '-8%', status: 'Normal' },
        { label: 'Token Efficiency', value: '94%', trend: '+2%', status: 'Optimized' },
        { label: 'Pixels Rendered', value: '1.2B', trend: '+15%', status: 'High' },
    ];

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
                    <span className="text-[10px] font-black text-white uppercase italic">Projected Month: $4,280</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {metrics.map((m) => (
                    <div key={m.label} className="p-8 bg-bg-0 border border-white/5 rounded-[2.5rem] flex flex-col gap-4">
                        <span className="text-[9px] font-black text-text-3 uppercase tracking-[0.2em]">{m.label}</span>
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-black text-white italic tracking-tighter uppercase">{m.value}</span>
                            <span className={`text-[10px] font-bold ${m.trend.startsWith('-') ? 'text-success' : 'text-primary'}`}>{m.trend}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${m.status === 'Optimized' ? 'bg-success' : 'bg-primary'}`}></div>
                            <span className="text-[8px] font-black text-text-3 uppercase tracking-widest">{m.status}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Breakdown by Engine</span>
                    <Info size={14} className="text-text-3" />
                </div>

                <div className="space-y-4">
                    {[
                        { name: 'OpenAI (GPT-4o)', pct: 45, cost: '$1,240' },
                        { name: 'Midjourney (V6)', pct: 30, cost: '$820' },
                        { name: 'ElevenLabs (Voice)', pct: 15, cost: '$410' },
                        { name: 'Stable Diffusion XL', pct: 10, cost: '$270' }
                    ].map(engine => (
                        <div key={engine.name} className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-[9px] font-black uppercase italic">
                                <span className="text-white">{engine.name}</span>
                                <span className="text-text-3">{engine.cost}</span>
                            </div>
                            <div className="h-1.5 w-full bg-bg-0 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${engine.pct}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
