import React from 'react';
import { Activity, ShieldAlert, Zap, Server, Database, Globe, RefreshCcw, AlertTriangle } from 'lucide-react';

export default function DisasterRecoveryDash() {
    const regions = [
        { name: 'São Paulo (SA-East-1)', role: 'Primary', latency: '12ms', health: 100, status: 'Active' },
        { name: 'N. Virginia (US-East-1)', role: 'Standby', latency: '115ms', health: 100, status: 'Synced' },
        { name: 'Ireland (EU-West-1)', role: 'Secondary', latency: '240ms', health: 92, status: 'Degraded' },
    ];

    return (
        <div className="bg-bg-1 border border-stroke rounded-[3rem] p-10 flex flex-col gap-10 shadow-2xl relative overflow-hidden group">

            {/* Background Grid Decoration */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

            <div className="flex items-center justify-between relative z-10">
                <div className="flex flex-col gap-1">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <ShieldAlert size={24} className="text-error" /> Disaster Recovery
                    </h3>
                    <p className="text-xs text-text-3 font-medium">Monitoramento de resiliência e failover global.</p>
                </div>
                <div className="flex bg-bg-0 border border-white/5 p-1 rounded-2xl">
                    <button className="px-6 py-2 bg-white/5 rounded-xl text-[9px] font-black text-white uppercase tracking-widest">Global Status</button>
                    <button className="px-6 py-2 text-[9px] font-black text-text-3 uppercase tracking-widest">Logs</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                {regions.map((region, i) => (
                    <div key={i} className={`p-8 rounded-[2.5rem] border flex flex-col gap-6 transition-all ${region.role === 'Primary' ? 'bg-primary/5 border-primary/20' : 'bg-bg-0 border-stroke'
                        }`}>
                        <div className="flex items-center justify-between">
                            <div className="p-3 bg-white/5 rounded-2xl text-white">
                                <Server size={20} />
                            </div>
                            <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${region.status === 'Active' ? 'bg-success/20 text-success' :
                                    region.status === 'Synced' ? 'bg-secondary/20 text-secondary' :
                                        'bg-error/20 text-error'
                                }`}>
                                {region.status}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-black text-white uppercase tracking-widest">{region.name}</span>
                            <span className="text-[10px] font-bold text-text-3 uppercase">{region.role} Region</span>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-text-3 uppercase tracking-widest">Latency</span>
                                <span className="text-sm font-black text-white">{region.latency}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-bold text-text-3 uppercase tracking-widest">Health</span>
                                <span className="text-sm font-black text-success">{region.health}%</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-8 bg-error/5 border border-error/20 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-error/10 text-error flex items-center justify-center animate-pulse">
                        <AlertTriangle size={32} />
                    </div>
                    <div className="flex flex-col gap-1 text-center md:text-left">
                        <span className="text-xs font-black text-white uppercase tracking-[0.2em] italic">Critical Control</span>
                        <p className="text-[11px] text-text-2 max-w-sm leading-relaxed">
                            Ao acionar o failover, o tráfego global será redirecionado para a região de standby.
                            **RTO Estimado: 45 segundos.**
                        </p>
                    </div>
                </div>
                <button className="px-10 py-5 bg-error text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl shadow-error/20 hover:scale-105 transition-all">
                    INITIATE REGION FAILOVER
                </button>
            </div>

        </div>
    );
}
