import React from 'react';
import BudgetHQ from '@/components/creative/BudgetHQ';
import AdsDeployer from '@/components/creative/AdsDeployer';
import AssetLibrary from '@/components/creative/AssetLibrary';
import { DollarSign, Rocket, PieChart, Activity, Sparkles, Filter, LayoutGrid, Zap, TrendingUp } from 'lucide-react';

export default function PaidMediaPage() {
    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-hidden text-white">

            {/* Header */}
            <div className="px-10 py-12 border-b border-stroke flex items-center justify-between bg-gradient-to-r from-bg-1 to-bg-0">
                <div className="flex items-center gap-8">
                    <div className="w-18 h-18 rounded-[2rem] bg-success text-white flex items-center justify-center shadow-2xl -rotate-2">
                        <DollarSign size={36} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-black tracking-tighter uppercase tracking-widest italic flex items-center gap-4">
                            Paid Media & Budget <span className="text-[10px] bg-success/20 text-success border border-success/30 px-3 py-1 rounded-full not-italic tracking-normal">PERFORMANCE LAB</span>
                        </h1>
                        <p className="text-text-3 font-medium text-base mt-1 italic">Conecte criativos com tráfego pago e otimize seu ROAS.</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                        <Activity size={16} className="text-success animate-pulse" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Global ROAS: 4.2x</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 overflow-y-auto custom-scrollbar pb-32">

                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-8 mb-4">
                    <div className="p-8 bg-bg-1 border border-stroke rounded-[2.5rem] flex flex-col gap-2">
                        <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">Total Spend</span>
                        <span className="text-2xl font-black text-white italic uppercase tracking-tighter">$13,420</span>
                    </div>
                    <div className="p-8 bg-bg-1 border border-stroke rounded-[2.5rem] flex flex-col gap-2">
                        <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">Total ROAS</span>
                        <span className="text-2xl font-black text-success italic uppercase tracking-tighter">4.25x</span>
                    </div>
                    <div className="p-8 bg-bg-1 border border-stroke rounded-[2.5rem] flex flex-col gap-2">
                        <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">Conversions</span>
                        <span className="text-2xl font-black text-white italic uppercase tracking-tighter">1,248</span>
                    </div>
                    <div className="p-8 bg-bg-1 border border-stroke rounded-[2.5rem] flex flex-col gap-2">
                        <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">Campaigns Active</span>
                        <span className="text-2xl font-black text-primary italic uppercase tracking-tighter">12</span>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <BudgetHQ />
                </div>

                <div className="lg:col-span-4">
                    <AdsDeployer />
                </div>

                <div className="lg:col-span-12 mt-10">
                    <div className="flex items-center gap-3 mb-8">
                        <TrendingUp size={20} className="text-primary" />
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Performance of Generative Assets</h2>
                    </div>
                    <AssetLibrary />
                </div>

            </div>

        </div>
    );
}
