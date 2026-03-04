import React from 'react';
import { Activity, ShieldCheck, Zap, Globe, Server, Database, TrendingUp, ArrowUpRight } from 'lucide-react';

export default function QuantumHealthPage() {
    const metrics = [
        { label: 'API Latency (Global)', value: '84ms', status: 'Optimal', color: 'success' },
        { label: 'Uptime (30d)', value: '99.998%', status: 'Stable', color: 'secondary' },
        { label: 'Active Edge nodes', value: '42', status: 'Peering', color: 'primary' },
        { label: 'Security Score', value: 'A+', status: 'Hardened', color: 'success' },
    ];

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-hidden text-white">

            {/* Quantum Header */}
            <div className="px-10 py-12 border-b border-stroke flex items-center justify-between bg-gradient-to-br from-bg-1 to-bg-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 blur-[100px] translate-x-1/2"></div>
                <div className="flex items-center gap-8 relative z-10">
                    <div className="w-18 h-18 rounded-[2rem] bg-white text-black flex items-center justify-center shadow-2xl animate-pulse">
                        <Zap size={36} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-black tracking-tighter uppercase tracking-widest italic flex items-center gap-4">
                            Pulse Quantum <span className="text-[10px] bg-white/20 text-white border border-white/30 px-3 py-1 rounded-full not-italic tracking-normal">INFRA STATUS</span>
                        </h1>
                        <p className="text-text-3 font-medium text-base mt-1 italic">Monitoramento de performance extrema e integridade global.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 px-6 py-4 bg-success/5 border border-success/10 rounded-2xl relative z-10">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                    <span className="text-[10px] font-black text-success uppercase tracking-widest">Quantum Engine: Synchronized</span>
                </div>
            </div>

            <div className="flex-1 p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 overflow-y-auto custom-scrollbar pb-32">

                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-8">
                    {metrics.map((m, i) => (
                        <div key={i} className="p-10 bg-bg-1 border border-stroke rounded-[3rem] flex flex-col gap-6 shadow-xl group hover:border-white/20 transition-all">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-text-3 uppercase tracking-widest">{m.label}</span>
                                <div className={`w-2 h-2 rounded-full bg-${m.color}`}></div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-4xl font-black italic tracking-tighter">{m.value}</span>
                                <span className={`text-[10px] font-bold text-${m.color} uppercase tracking-widest`}>{m.status}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-8 p-10 bg-bg-1 border border-stroke rounded-[4rem] flex flex-col gap-10 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between relative z-10">
                        <h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3">
                            <Globe size={18} className="text-primary" /> Traffic Performance Map
                        </h3>
                        <span className="text-[10px] text-text-3 font-bold uppercase italic italic font-medium">REAL-TIME DATA PROCESSING</span>
                    </div>

                    {/* Simulação de Gráfico de Latência de Onda */}
                    <div className="h-64 w-full flex items-end gap-1 relative z-10">
                        {[...Array(60)].map((_, i) => (
                            <div key={i} className="flex-1 bg-white/5 hover:bg-primary transition-all rounded-t-sm" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-8 relative z-10 border-t border-white/5 pt-10">
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">Avg Request Time</span>
                            <span className="text-xl font-black">12ms</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">CDN Cache Hit Rate</span>
                            <span className="text-xl font-black">94.2%</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">TLS Handshake</span>
                            <span className="text-xl font-black">2.1ms</span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-8">
                    <div className="p-10 bg-gradient-to-br from-success/20 to-bg-1 border border-success/20 rounded-[4rem] shadow-2xl flex flex-col gap-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-success text-white flex items-center justify-center">
                                <ShieldCheck size={24} />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest italic">Security Audit Pass</span>
                        </div>
                        <p className="text-[11px] text-text-2 leading-relaxed">
                            Todos os módulos (Shield, Quantum, Enterprise) estão operando em conformidade com o Baseline de Segurança 2024-Q1.
                        </p>
                        <button className="w-full py-5 bg-white text-black rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                            VIEW FULL SECURITY LOGS
                        </button>
                    </div>

                    <div className="p-10 bg-bg-1 border border-stroke rounded-[4rem] flex flex-col gap-6 shadow-xl">
                        <div className="flex items-center gap-3">
                            <Database size={20} className="text-secondary" />
                            <span className="text-[11px] font-black uppercase tracking-widest">Data Persistence</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-bold uppercase">DB Clusters (Read/Write)</span>
                                <span className="text-[10px] font-black text-success">Active</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-success w-[99%]"></div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}
