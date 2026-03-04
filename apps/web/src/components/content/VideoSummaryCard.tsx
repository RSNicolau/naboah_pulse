import React from 'react';
import { PlayCircle, FileText, Zap, List, Clock, Sparkles } from 'lucide-react';

interface VideoSummaryProps {
    summary: string;
    events: { timestamp: string; event: string }[];
}

export default function VideoSummaryCard({ summary, events }: VideoSummaryProps) {
    return (
        <div className="bg-bg-1 border border-stroke rounded-[2rem] p-8 flex flex-col gap-8 shadow-2xl relative overflow-hidden group">
            {/* Dynamic Background */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xl shadow-primary/10">
                        <Zap size={24} className="fill-primary/20" />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-sm font-bold text-white tracking-tight uppercase tracking-widest">Video Content Intelligence</h3>
                        <span className="text-[9px] text-text-3 font-black uppercase tracking-tighter">Análise Multimodal Pulse Perception</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6 relative z-10">
                {/* TL;DR Section */}
                <div className="p-5 bg-bg-0/50 border border-stroke rounded-2xl flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-ai-accent">
                        <Sparkles size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Resumo Executivo (TL;DR)</span>
                    </div>
                    <p className="text-xs text-text-2 leading-relaxed italic border-l-2 border-ai-accent/30 pl-4">
                        {summary}
                    </p>
                </div>

                {/* Events Timeline */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-text-3">
                        <List size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Eventos de Interesse Detectados</span>
                    </div>
                    <div className="flex flex-col gap-3">
                        {events.map((ev, i) => (
                            <div key={i} className="flex items-center gap-4 group/event cursor-pointer">
                                <span className="w-12 text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded-md text-center group-hover/event:bg-primary group-hover/event:text-white transition-all">
                                    {ev.timestamp}
                                </span>
                                <div className="flex-1 p-3 bg-surface-1 border border-stroke rounded-xl group-hover/event:border-primary/50 transition-all">
                                    <span className="text-[11px] font-bold text-white">{ev.event}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <button className="w-full mt-2 py-4 bg-primary hover:bg-ai-accent text-white rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3">
                <PlayCircle size={16} /> ASSISTIR TRECHOS RELEVANTES
            </button>

        </div>
    );
}
