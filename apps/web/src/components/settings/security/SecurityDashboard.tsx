import React from 'react';
import { ShieldAlert, ShieldCheck, Activity, Eye, Lock, Globe, AlertTriangle, Shield, Terminal, ArrowRight } from 'lucide-react';

const alerts = [
    { id: '1', type: 'Anomalous Access', severity: 'High', source: 'IP: 95.161.220.12 (Moscow, RU)', time: '2 mins ago', status: 'Blocked' },
    { id: '2', type: 'DLP Trigger', severity: 'Medium', source: 'WhatsApp / Customer Support', time: '15 mins ago', status: 'Masked' },
    { id: '3', type: 'Brute Force Attempt', severity: 'Critical', source: 'Multiple IPs / /api/auth', time: '1 hour ago', status: 'Mitigating' },
];

export default function SecurityDashboard() {
    return (
        <div className="bg-bg-1 border border-stroke rounded-[2.5rem] p-10 flex flex-col gap-10 shadow-2xl relative overflow-hidden group">

            {/* Security Matrix Background */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-error/5 blur-[150px] rounded-full pointer-events-none opacity-50"></div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-3xl bg-error/10 border border-error/20 flex items-center justify-center text-error shadow-2xl shadow-error/20">
                        <ShieldAlert size={36} />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase tracking-widest flex items-center gap-3">
                            Pulse Shield <span className="text-[10px] bg-error/20 text-error px-2 py-0.5 rounded-md border border-error/30">Enterprise Active</span>
                        </h2>
                        <p className="text-text-3 text-sm font-medium">Monitoramento de integridade e sentinela de IA em tempo real.</p>
                    </div>
                </div>
                <div className="flex bg-bg-0 border border-stroke rounded-2xl p-1 shrink-0">
                    <button className="px-6 py-2.5 bg-error text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-error/20 transition-all">PANIC DISCONNECT</button>
                </div>
            </div>

            {/* Global Security Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Ameaças Bloqueadas', value: '1.242', trend: '+12% last 24h', icon: ShieldCheck, color: 'text-success' },
                    { label: 'Status de Criptografia', value: 'AES-256', trend: 'TLS 1.3 Active', icon: Lock, color: 'text-primary' },
                    { label: 'Anomalias Ativas', value: '3', trend: 'Severity: High', icon: AlertTriangle, color: 'text-error' },
                    { label: 'Integridade dos Dados', value: '100%', trend: 'No corrupt files', icon: Activity, color: 'text-warning' },
                ].map((stat, i) => (
                    <div key={i} className="p-6 bg-bg-0 border border-stroke rounded-2xl flex flex-col gap-1 group/stat hover:border-error/30 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <stat.icon className={`${stat.color} w-5 h-5 group-hover/stat:scale-110 transition-transform`} />
                        </div>
                        <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">{stat.label}</span>
                        <span className="text-2xl font-black text-white tracking-tighter">{stat.value}</span>
                        <span className="text-[9px] font-bold text-text-3 opacity-60 mt-1 uppercase">{stat.trend}</span>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-6">
                <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                    <Terminal size={14} className="text-error" /> Logs de Segurança Críticos
                </h4>

                <div className="flex flex-col gap-3">
                    {alerts.map((alert) => (
                        <div key={alert.id} className="p-5 bg-bg-1 border border-stroke rounded-2xl flex items-center justify-between group/alert hover:bg-error/5 hover:border-error/20 transition-all">
                            <div className="flex items-center gap-5">
                                <div className={`w-2 h-10 rounded-full ${alert.severity === 'Critical' ? 'bg-error' : alert.severity === 'High' ? 'bg-warning' : 'bg-primary'}`}></div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-black text-white uppercase tracking-tight">{alert.type}</span>
                                    <span className="text-[10px] text-text-3 font-medium">{alert.source}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-10">
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-black text-text-3 uppercase tracking-tighter">{alert.time}</span>
                                    <span className={`text-[10px] font-black uppercase ${alert.status === 'Blocked' ? 'text-success' : 'text-warning'}`}>{alert.status}</span>
                                </div>
                                <button className="p-2.5 bg-bg-0 border border-stroke rounded-xl text-text-3 hover:text-white hover:border-error transition-all">
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-8 bg-error/5 border border-error/10 rounded-3xl flex items-center gap-8">
                <div className="w-12 h-12 rounded-2xl bg-error/10 border border-error/20 flex items-center justify-center text-error">
                    <Globe size={24} />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                    <span className="text-[10px] font-black text-error uppercase tracking-widest">Global IP Blacklist</span>
                    <p className="text-xs font-bold text-white">42 novos endereços IP foram bloqueados pelo Jarvis nas últimas 6h por tentativas de injeção SQL.</p>
                </div>
                <button className="px-6 py-2.5 bg-bg-0 border border-stroke rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:border-error transition-all">Monitor de Rede</button>
            </div>

        </div>
    );
}
