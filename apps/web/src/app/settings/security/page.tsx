import React from 'react';
import SecurityDashboard from '@/components/settings/security/SecurityDashboard';
import DLPSettings from '@/components/settings/security/DLPSettings';
import { Shield, Lock, Fingerprint, History, Globe, HardDrive } from 'lucide-react';

export default function SecurityPage() {
    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-y-auto custom-scrollbar">
            <div className="p-8 max-w-7xl mx-auto w-full flex flex-col gap-10 pb-20">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
                            <div className="w-14 h-14 rounded-3xl bg-error/10 border border-error/20 flex items-center justify-center text-error shadow-2xl shadow-error/20">
                                <Shield size={32} />
                            </div>
                            Security Command Center
                        </h1>
                        <p className="text-text-3 font-medium">Pulse Shield: Proteção avançada e conformidade regulatória para dados críticos.</p>
                    </div>

                    <div className="flex gap-3">
                        <button className="px-6 py-3 bg-bg-1 border border-stroke rounded-2xl text-[10px] font-black text-white hover:border-error transition-all uppercase tracking-widest flex items-center gap-2">
                            <Lock size={14} /> RE-SCAN SYSTEMS
                        </button>
                    </div>
                </div>

                {/* Info Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: 'Identity Protection', desc: 'MFA e Biometria ativos para todos os administradores.', icon: Fingerprint, status: 'Secured' },
                        { title: 'Global Auditing', desc: 'Logs de auditoria imutáveis gravados em múltiplas regiões.', icon: History, status: 'Enabled' },
                        { title: 'Network Armor', status: 'Active', desc: 'Proteção contra DDoS e Injeção SQL na camada de borda.', icon: Globe },
                    ].map((card, i) => (
                        <div key={i} className="bg-bg-1 border border-stroke rounded-[2rem] p-8 flex items-center gap-6 group hover:border-primary/30 transition-all">
                            <div className="w-14 h-14 rounded-2xl bg-bg-0 border border-stroke flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <card.icon size={26} />
                            </div>
                            <div className="flex flex-col flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-text-3 uppercase tracking-widest">{card.title}</span>
                                    <span className="text-[8px] bg-success/10 text-success px-1.5 py-0.5 rounded font-black uppercase">{card.status}</span>
                                </div>
                                <p className="text-xs font-bold text-white mt-1 leading-snug">{card.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2">
                        <SecurityDashboard />
                    </div>
                    <div className="flex flex-col gap-10">
                        <DLPSettings />

                        {/* Compliance Certificate Card */}
                        <div className="bg-bg-1 border border-stroke rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-xl relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-success/5 blur-[50px] rounded-full"></div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center text-success">
                                    <Shield size={20} />
                                </div>
                                <span className="text-sm font-black text-white uppercase tracking-widest">Compliance Status</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between py-2 border-b border-stroke/50">
                                    <span className="text-[10px] font-bold text-text-3">LGPD BR</span>
                                    <span className="text-[10px] font-black text-success">Compliant</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-stroke/50">
                                    <span className="text-[10px] font-bold text-text-3">GDPR EU</span>
                                    <span className="text-[10px] font-black text-success">Compliant</span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-[10px] font-bold text-text-3">SOC2 Type II</span>
                                    <span className="text-[10px] font-black text-warning">In Progress</span>
                                </div>
                            </div>
                            <button className="w-full py-4 bg-bg-0 border border-stroke text-text-3 hover:text-white hover:border-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                DOWNLOAD SECURITY REPORT
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
