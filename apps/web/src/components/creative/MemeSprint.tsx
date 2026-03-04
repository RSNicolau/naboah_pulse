"use client";

import React from 'react';
import { TrendingUp, Zap, Sparkles, Share2, MessageCircle, BarChart, Smile } from 'lucide-react';

export default function MemeSprint() {
    const trends = [
        { id: '1', title: 'Quiet Luxury', reach: '2.4M', velocity: '92%', sentiment: 'Positive' },
        { id: '2', title: 'Cyberpunk Redux', reach: '800k', velocity: '45%', sentiment: 'Neutral' },
        { id: '3', title: 'Minimalist Office', reach: '1.1M', velocity: '78%', sentiment: 'Positive' },
    ];

    return (
        <div className="bg-bg-1 border border-stroke rounded-[3rem] p-12 flex flex-col gap-10 shadow-2xl relative overflow-hidden group">

            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <TrendingUp size={24} className="text-success" /> Viral Meme Sprint
                    </h3>
                    <p className="text-[10px] text-text-3 font-bold uppercase tracking-[0.2em]">Pulse Trend Detection v4</p>
                </div>
                <div className="px-4 py-1.5 bg-success/10 border border-success/20 rounded-full flex items-center gap-2">
                    <Zap size={10} className="text-success" />
                    <span className="text-[8px] font-black text-success uppercase">Live Feed</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {trends.map((t, i) => (
                    <div key={i} className="p-8 bg-bg-0 border border-white/5 rounded-[2.5rem] flex items-center justify-between hover:border-success/30 transition-all cursor-pointer group/item">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-success/10 text-success flex items-center justify-center">
                                <Smile size={28} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h4 className="text-lg font-black text-white uppercase tracking-tighter italic">#{t.title}</h4>
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest">{t.reach} Reach</span>
                                    <span className="text-[10px] font-bold text-success uppercase tracking-widest">{t.velocity} Velocity</span>
                                </div>
                            </div>
                        </div>

                        <button className="px-6 py-3 bg-white text-black rounded-2xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all opacity-0 group-hover/item:opacity-100 shadow-xl">
                            GENERATE MEME
                        </button>
                    </div>
                ))}
            </div>

            <div className="p-10 bg-gradient-to-br from-success/10 to-bg-0 border border-success/20 rounded-[3rem] flex flex-col gap-6">
                <div className="flex items-center gap-3">
                    <BarChart size={16} className="text-success" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Trend Synergy Score</span>
                </div>
                <p className="text-[11px] text-text-3 font-medium italic leading-relaxed">
                    "Sua marca tem 88% de afinidade com a tendência '#QuietLuxury'. Recomendo gerar uma sequência de Reels minimalistas para a próxima terça-feira."
                </p>
            </div>

        </div>
    );
}
