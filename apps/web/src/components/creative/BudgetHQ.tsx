"use client";

import React from 'react';
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Target, Zap, BarChart2 } from 'lucide-react';

export default function BudgetHQ() {
    const platforms = [
        { name: 'Meta Ads', spend: '$6,420', roas: '4.8x', trend: '+12%', color: 'text-primary' },
        { name: 'Google Ads', spend: '$4,100', roas: '3.2x', trend: '-2%', color: 'text-secondary' },
        { name: 'TikTok Ads', spend: '$2,800', roas: '4.1x', trend: '+25%', color: 'text-warning' },
    ];

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {platforms.map((platform) => (
                    <div key={platform.name} className="bg-bg-0 border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-6 group hover:border-success/30 transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest italic">{platform.name}</span>
                            <div className={`flex items-center gap-1 ${platform.trend.startsWith('+') ? 'text-success' : 'text-error'}`}>
                                {platform.trend.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                <span className="text-[9px] font-black">{platform.trend}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-3xl font-black text-white tracking-tighter italic">{platform.spend}</span>
                            <span className="text-[9px] font-bold text-text-3 uppercase tracking-widest italic">AD SPEND YTD</span>
                        </div>

                        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[8px] font-black text-text-3 uppercase tracking-widest">CURRENT ROAS</span>
                                <span className={`text-sm font-black italic ${platform.color}`}>{platform.roas}</span>
                            </div>
                            <BarChart2 size={16} className="text-text-3 opacity-20 group-hover:opacity-100 transition-all" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-10 bg-bg-0 border border-white/5 rounded-[3.5rem] relative overflow-hidden group">
                <div className="flex flex-col gap-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <Target size={20} className="text-primary" />
                        <h4 className="text-sm font-black text-white uppercase tracking-widest italic">Jarvis Scaling Recommendation</h4>
                    </div>
                    <p className="text-xs text-text-3 font-medium leading-relaxed max-w-xl">
                        "Meta creatives are currently generating 20% higher CTR in the core demographic. Recommendation: <span className="text-white font-bold">Shift $2,500 from Google Search to Meta Reel Ads</span> to capture high-intent visual audience. Expected ROAS increase: <span className="text-success font-black">+0.42</span>."
                    </p>
                </div>
                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-all duration-700">
                    <TrendingUp size={120} className="text-white" />
                </div>
            </div>

        </div>
    );
}
