"use client";

import React, { useEffect, useState } from 'react';
import { History, ShieldCheck, User, RotateCcw, ArrowRight, Database, FileCheck, Loader2 } from 'lucide-react';
import { apiGet } from '@/lib/api';

type HealthData = {
    status: string;
    storage_used: string;
    disaster_recovery: string;
    versioning_uptime: string;
    audit_logs: { id: string; action: string; user: string; time: string; version: string }[];
};

export default function AssetAuditTrail() {
    const [health, setHealth] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet<HealthData>('/creative/observability/health')
            .then(setHealth)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const logs = health?.audit_logs ?? [];

    return (
        <div className="bg-bg-1 border border-stroke rounded-[3rem] p-12 flex flex-col gap-10 shadow-2xl relative overflow-hidden">

            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <History size={24} className="text-secondary" /> Asset Audit Trail
                    </h3>
                    <p className="text-[10px] text-text-3 font-bold uppercase tracking-[0.2em]">Provenance & Compliance Logs</p>
                </div>
                <button className="px-6 py-3 bg-secondary/10 text-secondary border border-secondary/20 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-secondary/20 transition-all">
                    <RotateCcw size={14} /> ROLLBACK MANAGER
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 size={28} className="text-secondary animate-spin" />
                </div>
            ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <History size={28} className="text-text-3" />
                    <p className="text-sm text-text-3">Nenhum log de auditoria disponível.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {logs.slice().reverse().map((log, idx) => (
                        <div key={log.id} className="flex gap-6 group">
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${idx === 0 ? 'bg-secondary/20 border-secondary text-secondary' : 'bg-bg-0 border-white/5 text-text-3'}`}>
                                    {idx === 0 ? <ShieldCheck size={18} /> : <Database size={16} />}
                                </div>
                                {idx !== logs.length - 1 && <div className="w-0.5 h-full bg-white/5 my-2"></div>}
                            </div>
                            <div className="flex-1 pb-8">
                                <div className="p-8 bg-bg-0 border border-white/5 rounded-[2.5rem] flex items-center justify-between group-hover:border-secondary/30 transition-all">
                                    <div className="flex flex-col gap-2">
                                        <h4 className="text-sm font-black text-white uppercase tracking-widest italic">{log.action}</h4>
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1.5 text-[9px] font-bold text-text-3 uppercase">
                                                <User size={10} /> {log.user}
                                            </span>
                                            <span className="text-[8px] text-text-3 opacity-50 uppercase font-black">-</span>
                                            <span className="text-[9px] font-bold text-text-3 uppercase">{log.time}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black text-text-3 uppercase italic tracking-widest">{log.version}</span>
                                        <button className="text-text-3 hover:text-white transition-all">
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="p-8 bg-secondary/5 border border-secondary/10 rounded-[2.5rem] flex items-center gap-6">
                <FileCheck size={24} className="text-secondary" />
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">DRM & Licensing Status</span>
                    <span className="text-xs font-black text-white italic">
                        {health?.status === 'healthy' ? 'Full Commercial Usage Rights (Sourced via Pulse Neural)' : health?.status ?? 'Loading...'}
                    </span>
                </div>
            </div>

        </div>
    );
}
