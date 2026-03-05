"use client";

import React, { useEffect, useState } from 'react';
import { Rocket, Globe, Shield, CheckCircle2, CloudLightning, Filter, Search, Plus, Loader2 } from 'lucide-react';
import { apiGet } from '@/lib/api';

type AdAccount = {
    id: string;
    name: string;
    platform: string;
    status: string;
    currency: string;
    timezone: string;
};

export default function AdsDeployer() {
    const [accounts, setAccounts] = useState<AdAccount[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet<AdAccount[]>('/ads/accounts')
            .then(setAccounts)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-bg-1 border border-stroke rounded-[3rem] p-12 flex flex-col gap-10 shadow-2xl relative overflow-hidden">

            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <Rocket size={24} className="text-primary" /> Ads Deployer
                    </h3>
                    <p className="text-[10px] text-text-3 font-bold uppercase tracking-[0.2em]">Creative-to-Adset Bridge</p>
                </div>
                <button className="px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all">
                    <Plus size={16} /> CONNECT ACCOUNT
                </button>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                    <div className="flex-1 px-6 py-3 bg-bg-0 border border-white/5 rounded-xl flex items-center gap-3">
                        <Search size={14} className="text-text-3" />
                        <input type="text" placeholder="SEARCH AD ACCOUNTS..." className="bg-transparent border-none outline-none text-[10px] font-black text-white placeholder:text-text-3 w-full uppercase" />
                    </div>
                    <button className="p-3 bg-bg-0 border border-white/5 rounded-xl text-text-3">
                        <Filter size={18} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 size={28} className="text-primary animate-spin" />
                    </div>
                ) : accounts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Rocket size={28} className="text-text-3" />
                        <p className="text-sm text-text-3">Nenhuma conta de anúncio conectada.</p>
                    </div>
                ) : (
                    accounts.map((account) => (
                        <div key={account.id} className="p-8 bg-bg-0 border border-white/5 rounded-[2.5rem] flex items-center justify-between group hover:border-primary/30 transition-all">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-20 bg-bg-1 rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden">
                                    <CloudLightning size={20} className="text-white/10" />
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h4 className="text-sm font-black text-white uppercase tracking-widest italic">{account.name}</h4>
                                    <span className="text-[8px] font-bold text-text-3 uppercase tracking-[0.2em]">{account.platform} | {account.currency}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${account.status === 'active' ? 'text-success' : 'text-warning'}`}>
                                        {account.status}
                                    </span>
                                    <div className="flex gap-1">
                                        <CheckCircle2 size={12} className={account.status === 'active' ? 'text-success' : 'text-text-3'} />
                                    </div>
                                </div>
                                <button className="px-6 py-3 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                                    DEPLOY ADS
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="grid grid-cols-2 gap-6 mt-4">
                <div className="p-8 bg-bg-0 border border-white/5 border-l-4 border-l-primary rounded-2xl flex items-center gap-6">
                    <Globe size={24} className="text-primary" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">ACCOUNTS CONNECTED</span>
                        <span className="text-xs font-black text-white italic">{accounts.filter(a => a.status === 'active').length} Active</span>
                    </div>
                </div>
                <div className="p-8 bg-bg-0 border border-white/5 border-l-4 border-l-success rounded-2xl flex items-center gap-6">
                    <Shield size={24} className="text-success" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">SAFE MODE</span>
                        <span className="text-xs font-black text-white italic">Auto-pause on low ROAS</span>
                    </div>
                </div>
            </div>

        </div>
    );
}
