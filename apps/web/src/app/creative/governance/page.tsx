import React from 'react';
import CostObservability from '@/components/creative/CostObservability';
import AssetAuditTrail from '@/components/creative/AssetAuditTrail';
import { ShieldAlert, Database, History, HardDrive, Sparkles, Filter, LayoutGrid, Zap, Lock } from 'lucide-react';

export default function GovernancePage() {
    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-hidden text-white">

            {/* Header */}
            <div className="px-10 py-12 border-b border-stroke flex items-center justify-between bg-gradient-to-r from-bg-1 to-bg-0">
                <div className="flex items-center gap-8">
                    <div className="w-18 h-18 rounded-[2rem] bg-secondary text-white flex items-center justify-center shadow-2xl rotate-3">
                        <Lock size={36} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-black tracking-tighter uppercase tracking-widest italic flex items-center gap-4">
                            Creative Governance <span className="text-[10px] bg-secondary/20 text-secondary border border-secondary/30 px-3 py-1 rounded-full not-italic tracking-normal">AUDIT & COMPLIANCE</span>
                        </h1>
                        <p className="text-text-3 font-medium text-base mt-1 italic">Monitore custos de IA, versões de ativos e resiliência de dados.</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                        EXPORT AUDIT REPORT
                    </button>
                </div>
            </div>

            <div className="flex-1 p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 overflow-y-auto custom-scrollbar pb-32">

                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-10 mb-4">
                    <div className="p-10 bg-bg-1 border border-stroke rounded-[3rem] flex flex-col gap-6 shadow-xl relative overflow-hidden group">
                        <Database size={24} className="text-primary" />
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-white italic tracking-tighter uppercase">1.2 TB</span>
                            <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Asset Storage Used</span>
                        </div>
                        <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:scale-110 transition-all">
                            <HardDrive size={120} />
                        </div>
                    </div>
                    <div className="p-10 bg-bg-1 border border-stroke rounded-[3rem] flex flex-col gap-6 shadow-xl relative overflow-hidden group">
                        <ShieldAlert size={24} className="text-secondary" />
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-white italic tracking-tighter uppercase">Healthy</span>
                            <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Disaster Recovery Status</span>
                        </div>
                        <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:scale-110 transition-all">
                            <ShieldAlert size={120} />
                        </div>
                    </div>
                    <div className="p-10 bg-bg-1 border border-stroke rounded-[3rem] flex flex-col gap-6 shadow-xl relative overflow-hidden group">
                        <History size={24} className="text-success" />
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-white italic tracking-tighter uppercase">100%</span>
                            <span className="text-[10px] font-bold text-text-3 uppercase tracking-widest">Versioning Uptime</span>
                        </div>
                        <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:scale-110 transition-all">
                            <History size={120} />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-6">
                    <CostObservability />
                </div>

                <div className="lg:col-span-6">
                    <AssetAuditTrail />
                </div>

                <div className="lg:col-span-12 p-12 bg-bg-1 border border-stroke rounded-[4rem] flex flex-col gap-8 shadow-2xl mt-4">
                    <div className="flex items-center gap-4">
                        <Sparkles size={24} className="text-primary" />
                        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Automated Asset Replication Config</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            { label: 'Primary Region', value: 'US-East-1 (N. Virginia)' },
                            { label: 'Secondary Region', value: 'EU-West-1 (Ireland)' },
                            { label: 'Backup Frequency', value: 'Every 2 Hours' },
                            { label: 'Retention Policy', value: '365 Days (Compliant)' }
                        ].map(cfg => (
                            <div key={cfg.label} className="p-6 bg-bg-0 border border-white/5 rounded-2xl flex flex-col gap-1">
                                <span className="text-[8px] font-black text-text-3 uppercase tracking-widest">{cfg.label}</span>
                                <span className="text-[11px] font-black text-white uppercase italic">{cfg.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </div>
    );
}
