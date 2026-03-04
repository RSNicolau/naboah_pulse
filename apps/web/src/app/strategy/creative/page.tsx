import React from 'react';
import PersonaManager from '@/components/strategy/PersonaManager';
import KnowledgePackManager from '@/components/strategy/KnowledgePackManager';
import { Target, Sparkles, Globe, Palette, ChevronRight, Share2, Layers } from 'lucide-react';

export default function StrategyCreativePage() {
    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-hidden text-white">

            {/* Strategy Header */}
            <div className="px-10 py-12 border-b border-stroke flex items-center justify-between bg-gradient-to-r from-bg-1 to-bg-0">
                <div className="flex items-center gap-8">
                    <div className="w-18 h-18 rounded-[2rem] bg-primary text-white flex items-center justify-center shadow-2xl">
                        <Target size={36} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-black tracking-tighter uppercase tracking-widest italic flex items-center gap-4">
                            Creative Strategy <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full not-italic tracking-normal">BRAND ENGINE</span>
                        </h1>
                        <p className="text-text-3 font-medium text-base mt-1 italic">Configure a identidade e o conhecimento base da sua agência.</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                        <Share2 size={16} className="text-text-3" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Export Config</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 overflow-y-auto custom-scrollbar pb-32">

                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                    {[
                        { label: 'Active Personas', value: '4', icon: Target, color: 'primary' },
                        { label: 'Knowledge Base Size', value: '1.2GB', icon: Layers, color: 'secondary' },
                        { label: 'Style Consistency', value: '96%', icon: Palette, color: 'success' },
                    ].map((stat, i) => (
                        <div key={i} className="p-10 bg-bg-1 border border-stroke rounded-[3rem] shadow-xl flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <stat.icon size={18} className={`text-${stat.color}`} />
                                <span className="text-[10px] font-black text-text-3 uppercase tracking-widest">{stat.label}</span>
                            </div>
                            <span className="text-3xl font-black italic tracking-tighter">{stat.value}</span>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-6">
                    <PersonaManager />
                </div>

                <div className="lg:col-span-6">
                    <KnowledgePackManager />
                </div>

            </div>

        </div>
    );
}
