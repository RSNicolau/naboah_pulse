import React from 'react';
import CampaignOrchestrator from '@/components/creative/CampaignOrchestrator';
import ChannelManager from '@/components/creative/ChannelManager';
import AssetLibrary from '@/components/creative/AssetLibrary';
import { Rocket, Send, Sparkles, Filter, LayoutGrid, Zap, Timer } from 'lucide-react';

export default function CampaignPage() {
    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-hidden text-white">

            {/* Header */}
            <div className="px-10 py-12 border-b border-stroke flex items-center justify-between bg-gradient-to-r from-bg-1 to-bg-0">
                <div className="flex items-center gap-8">
                    <div className="w-18 h-18 rounded-[2rem] bg-warning text-black flex items-center justify-center shadow-2xl">
                        <Rocket size={36} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-black tracking-tighter uppercase tracking-widest italic flex items-center gap-4">
                            Campaign Orchestrator <span className="text-[10px] bg-warning/20 text-warning border border-warning/30 px-3 py-1 rounded-full not-italic tracking-normal">ACTIVATION HUB</span>
                        </h1>
                        <p className="text-text-3 font-medium text-base mt-1 italic">Ative as squads criativas via canais e agende o impacto.</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button className="px-8 py-4 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-2xl">
                        <Send size={16} /> BLITZ LAUNCH
                    </button>
                </div>
            </div>

            <div className="flex-1 p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 overflow-y-auto custom-scrollbar pb-32">

                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="p-10 bg-bg-1 border border-stroke rounded-[3rem] flex flex-col gap-4 shadow-xl">
                        <Zap size={24} className="text-primary" />
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-white italic tracking-tighter uppercase">124</span>
                            <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Active Triggers</span>
                        </div>
                    </div>
                    <div className="p-10 bg-bg-1 border border-stroke rounded-[3rem] flex flex-col gap-4 shadow-xl">
                        <Timer size={24} className="text-secondary" />
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-white italic tracking-tighter uppercase">08</span>
                            <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Posts Today</span>
                        </div>
                    </div>
                    <div className="p-10 bg-bg-1 border border-stroke rounded-[3rem] flex flex-col gap-4 shadow-xl">
                        <Sparkles size={24} className="text-warning" />
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-white italic tracking-tighter uppercase">98%</span>
                            <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Brand Safety Avg</span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <CampaignOrchestrator />
                </div>

                <div className="lg:col-span-4">
                    <ChannelManager />
                </div>

                <div className="lg:col-span-12 mt-10">
                    <div className="flex items-center gap-3 mb-8">
                        <Sparkles size={20} className="text-primary" />
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Campaign Asset Pipeline</h2>
                    </div>
                    <AssetLibrary />
                </div>

            </div>

        </div>
    );
}
