"use client";

import React, { useState } from 'react';
import { Sparkles, Wand2, Terminal, Copy, Save, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

export default function PromptFactory() {
    const [prompt, setPrompt] = useState("[STYLIZED] Act as Luxury Persona. Tone: Sophisticated. User context: Black Friday luxury watch sale. Background: Neon studio, sharp focus, 8k.");

    return (
        <div className="bg-bg-1 border border-stroke rounded-[3rem] p-12 flex flex-col gap-10 shadow-2xl relative overflow-hidden">

            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <Sparkles size={24} className="text-primary" /> Prompt Factory Pro
                    </h3>
                    <p className="text-xs text-text-3 font-medium uppercase tracking-widest">Synthesizing Creative Directives</p>
                </div>
                <div className="flex gap-4">
                    <button className="p-3 bg-bg-0 border border-white/5 rounded-2xl text-text-3 hover:text-white">
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between px-6 py-3 bg-bg-0 border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <Terminal size={14} className="text-primary" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Resolved Chain: Persona + Knowledge + Brand</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-success" />
                        <span className="text-[9px] font-bold text-success uppercase">SAFE</span>
                    </div>
                </div>

                <div className="relative group">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full h-48 bg-bg-0 border border-white/5 rounded-[2.5rem] p-10 text-sm text-text-2 font-medium italic italic leading-relaxed focus:outline-none focus:border-primary/50 transition-all custom-scrollbar outline-none resize-none"
                        placeholder="Synthesis output..."
                    ></textarea>
                    <div className="absolute top-8 right-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-all">
                        <button className="p-3 bg-white/5 rounded-xl text-text-3 hover:text-white"><Copy size={16} /></button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-bg-0 border border-white/5 rounded-[2.5rem] flex flex-col gap-4">
                    <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">Negative Prompt</span>
                    <p className="text-[11px] text-text-2 italic font-medium">unclear, blurry, generic, off-brand font, messy shadows, low resolution</p>
                </div>
                <div className="p-8 bg-bg-0 border border-white/5 rounded-[2.5rem] flex flex-col gap-4">
                    <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">Parameters</span>
                    <div className="flex gap-3">
                        <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-white">MJ-V6.1</span>
                        <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-white">AR 4:5</span>
                        <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-white">CHAOS 20</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                <button className="flex-1 py-5 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3">
                    <Wand2 size={16} /> GENERATE ASSETS
                </button>
                <button className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10">
                    SAVE AS TEMPLATE
                </button>
            </div>

        </div>
    );
}
