import React from 'react';
import SynergyCanvas from '@/components/synergy/SynergyCanvas';
import { Share2, Settings2, Download, Maximize2, Users, MessageSquare } from 'lucide-react';

export default function SynergyPage() {
    return (
        <div className="flex-1 flex flex-col h-full bg-[#050505]">

            {/* Synergy Top Bar */}
            <div className="h-20 px-10 border-b border-white/5 flex items-center justify-between bg-bg-1/20 backdrop-blur-xl shrink-0">
                <div className="flex items-center gap-8">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] italic">Multiplayer Mode</span>
                        <h1 className="text-xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
                            QG Digital: Brainstorm Q1-2026 <span className="text-xs text-text-3 font-medium not-italic">#strategy-04</span>
                        </h1>
                    </div>
                    <div className="h-8 w-px bg-white/5"></div>
                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                        <Users size={14} className="text-text-3" />
                        <span className="text-[10px] font-bold text-white uppercase">6 Ativos</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-text-3 hover:text-white transition-all">
                        <Download size={20} />
                    </button>
                    <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-text-3 hover:text-white transition-all">
                        <Settings2 size={20} />
                    </button>
                    <button className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-2xl text-[10px] font-black text-white uppercase tracking-widest shadow-xl shadow-primary/20">
                        <Share2 size={16} /> CONVIDAR TIME
                    </button>
                </div>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 relative">
                <SynergyCanvas />

                {/* Synergy Floating Chat Preview */}
                <div className="absolute left-10 bottom-10 w-96 bg-bg-1/50 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-6 shadow-2xl">
                    <div className="flex items-center gap-4 mb-6">
                        <MessageSquare size={18} className="text-primary" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Synergy Chat</span>
                    </div>
                    <div className="flex flex-col gap-4">
                        {[
                            { user: 'Rodrigo', msg: 'Acho que esse fluxo de checkout pode ser simplificado.', time: 'agora' },
                            { user: 'Sasha (Jarvis)', msg: 'Sugestão Neural: Adicionar confirmação em dois fatores no nó 4.', time: '1m' },
                        ].map((c, i) => (
                            <div key={i} className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-text-3 uppercase">{c.user}</span>
                                    <span className="text-[8px] text-text-3 font-medium">{c.time}</span>
                                </div>
                                <p className="text-[11px] text-text-2 leading-relaxed">{c.msg}</p>
                            </div>
                        ))}
                        <input
                            type="text"
                            placeholder="Digite sua ideia aqui..."
                            className="mt-2 w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-[10px] font-medium text-white placeholder:text-text-3 outline-none focus:border-primary/50 transition-all"
                        />
                    </div>
                </div>
            </div>

        </div>
    );
}
