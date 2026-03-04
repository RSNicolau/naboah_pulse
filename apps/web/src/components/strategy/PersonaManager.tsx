import React from 'react';
import { UserCircle2, MessageSquareQuote, CheckCircle2, Sliders, Globe, Languages } from 'lucide-react';

export default function PersonaManager() {
    const personas = [
        { id: '1', name: 'Brand Default', tone: 'Professional & Helpful', status: 'active', default: true },
        { id: '2', name: 'Luxury Persona', tone: 'Sophisticated & Minimalist', status: 'active', default: false },
        { id: '3', name: 'Z-Gen Trendy', tone: 'Vibrant & Informal', status: 'active', default: false },
    ];

    return (
        <div className="bg-bg-1 border border-stroke rounded-[3rem] p-12 flex flex-col gap-10 shadow-2xl relative overflow-hidden group">

            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <UserCircle2 size={24} className="text-primary" /> Persona Profiles
                    </h3>
                    <p className="text-xs text-text-3 font-medium uppercase tracking-widest">Brand Voice & Identity</p>
                </div>
                <button className="px-6 py-3 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                    NEW PERSONA
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {personas.map((p, i) => (
                    <div key={i} className="p-8 bg-bg-0 border border-white/5 rounded-[2.5rem] flex items-center justify-between hover:border-primary/30 transition-all cursor-pointer group/item">
                        <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${p.default ? 'bg-primary text-white' : 'bg-white/5 text-text-3'}`}>
                                <MessageSquareQuote size={24} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-black text-white uppercase tracking-tighter italic">{p.name}</span>
                                    {p.default && <span className="text-[8px] bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-black uppercase">DEFAULT</span>}
                                </div>
                                <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest">{p.tone}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex gap-2">
                                <Globe size={14} className="text-text-3" />
                                <Languages size={14} className="text-text-3" />
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl opacity-0 group-hover/item:opacity-100 transition-all">
                                <Sliders size={16} className="text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-8 bg-primary/5 border border-primary/20 rounded-[2.5rem] flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-primary" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Context Resolver Active</span>
                </div>
                <p className="text-[11px] text-text-3 font-medium italic">
                    "Sua persona padrão está sendo aplicada a 85% dos jobs criativos gerados via Intake."
                </p>
            </div>

        </div>
    );
}
