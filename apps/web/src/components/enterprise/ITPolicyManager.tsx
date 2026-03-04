import React from 'react';
import { ShieldCheck, Key, LogOut, Network, Share2, ArrowUpRight, Lock, BellRing } from 'lucide-react';

export default function ITPolicyManager() {
    const policies = [
        { title: 'Bring Your Own Key (BYOK)', desc: 'Gerencie suas próprias chaves de criptografia KMS.', active: true, icon: Key },
        { title: 'Session Pinning', desc: 'Invalida sessões se o IP ou User-Agent mudar drasticamente.', active: true, icon: Lock },
        { title: 'Audit SIEM Streaming', desc: 'Envie eventos em tempo real para splunk/syslog.', active: false, icon: Share2 },
        { title: 'Network Restricted Access', desc: 'Permitir acesso apenas via listas de IPs corporativos.', active: true, icon: Network },
    ];

    return (
        <div className="flex flex-col gap-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {policies.map((p, i) => (
                    <div key={i} className="bg-bg-1 border border-stroke rounded-[2.5rem] p-8 flex flex-col gap-6 group hover:border-primary/30 transition-all shadow-xl">
                        <div className="flex items-center justify-between">
                            <div className="p-4 bg-bg-0 border border-white/5 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                                <p.icon size={22} />
                            </div>
                            <div className={`w-12 h-6 rounded-full relative transition-colors ${p.active ? 'bg-success' : 'bg-surface-2'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${p.active ? 'left-7' : 'left-1'}`}></div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <h4 className="text-sm font-black text-white uppercase tracking-widest italic">{p.title}</h4>
                            <p className="text-[10px] text-text-3 font-medium leading-relaxed">{p.desc}</p>
                        </div>
                        <button className="flex items-center gap-2 text-[9px] font-black text-text-3 uppercase tracking-widest hover:text-white transition-colors">
                            CONFIGURE POLICY <ArrowUpRight size={12} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="bg-gradient-to-r from-bg-1 to-bg-0 border border-stroke rounded-[3rem] p-10 flex flex-col gap-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                    <BellRing size={80} className="text-white/[0.03] -rotate-12" />
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
                        <ShieldCheck size={24} />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">Security Baseline Status</h3>
                        <span className="text-[10px] font-bold text-success uppercase tracking-widest">Nível: Enterprise Hardened</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Anomalous Logins', value: '0 detectados', color: 'success' },
                        { label: 'Key Rotations', value: '14 dias atrás', color: 'text-3' },
                        { label: 'Auth Token Duration', value: '4 Horas', color: 'primary' },
                    ].map((stat, i) => (
                        <div key={i} className="p-6 bg-bg-0 border border-white/5 rounded-2xl flex flex-col gap-1">
                            <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">{stat.label}</span>
                            <span className={`text-sm font-black text-white italic`}>{stat.value}</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
