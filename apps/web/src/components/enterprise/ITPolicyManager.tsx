'use client';
import React, { useEffect, useState } from 'react';
import { ShieldCheck, Key, LogOut, Network, Share2, ArrowUpRight, Lock, BellRing, Loader2 } from 'lucide-react';
import { apiGet } from '@/lib/api';

type ITPolicy = {
    title: string;
    desc: string;
    active: boolean;
    icon_name: string;
};

type SecurityBaseline = {
    anomalous_logins: string;
    key_rotations: string;
    auth_token_duration: string;
};

type TenantPolicies = {
    policies: ITPolicy[];
    security_baseline: SecurityBaseline;
};

const ICON_MAP: Record<string, React.ComponentType<any>> = {
    Key, Lock, Share2, Network,
};

export default function ITPolicyManager() {
    const [data, setData] = useState<TenantPolicies | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet<TenantPolicies>('/enterprise/tenants')
            .then(setData)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const policies = (data?.policies ?? []).map(p => ({
        ...p,
        icon: ICON_MAP[p.icon_name] ?? Key,
    }));
    const baseline = data?.security_baseline ?? { anomalous_logins: '---', key_rotations: '---', auth_token_duration: '---' };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="text-primary animate-spin" />
            </div>
        );
    }

    if (policies.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3 bg-bg-1 border border-dashed border-stroke rounded-3xl">
                <Key size={32} className="text-text-3" />
                <p className="text-sm text-text-3">Nenhuma política de TI configurada.</p>
            </div>
        );
    }

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
                        <span className="text-[10px] font-bold text-success uppercase tracking-widest">Nivel: Enterprise Hardened</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Anomalous Logins', value: baseline.anomalous_logins },
                        { label: 'Key Rotations', value: baseline.key_rotations },
                        { label: 'Auth Token Duration', value: baseline.auth_token_duration },
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
