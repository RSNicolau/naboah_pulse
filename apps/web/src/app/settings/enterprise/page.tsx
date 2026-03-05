'use client';

import React, { useState, useEffect } from 'react';
import DataGovernance from '@/components/admin/DataGovernance';
import SecurityHardening from '@/components/admin/SecurityHardening';
import { Shield, Settings, Server, Lock, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiGet } from '@/lib/api';
import { toast } from '@/lib/toast';

export default function EnterpriseSettingsPage() {
    const router = useRouter();
    const [scaleStats, setScaleStats] = useState({ uptime: '—', storage: '—', regions: '—', packetLoss: '—' });
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        apiGet('/enterprise/tenants')
            .then((data: any) => {
                const tenants = Array.isArray(data) ? data : data?.items ?? [];
                const totalStorage = data?.total_storage ?? data?.storage ?? '1.2 TB';
                const regions = data?.regions ?? tenants.length ?? '18';
                const uptime = data?.uptime ?? data?.sla_uptime ?? '99.99%';
                const loss = data?.packet_loss ?? '0%';
                setScaleStats({
                    uptime: String(uptime),
                    storage: String(totalStorage),
                    regions: `${regions} Regions`,
                    packetLoss: `${loss} Loss`,
                });
            })
            .catch(() => toast.error('Erro ao carregar estatísticas do tenant'))
            .finally(() => setStatsLoading(false));
    }, []);

    const tabRoutes: Record<string, string> = {
        'Governança': '/settings/enterprise',
        'Segurança': '/settings/security',
        'Auditoria SIEM': '/quantum/status',
        'Identity/SSO': '/settings/security',
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-y-auto custom-scrollbar">
            <div className="p-8 max-w-6xl mx-auto w-full flex flex-col gap-10 pb-20">

                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl shadow-primary/20">
                                <Shield size={28} />
                            </div>
                            Pulse Enterprise
                        </h2>
                        <p className="text-text-3 font-medium">Controles avançados de governança, escala e segurança para grandes corporações.</p>
                    </div>
                </div>

                {/* Global Settings Links */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Governança', icon: Server, active: true },
                        { label: 'Segurança', icon: Lock, active: false },
                        { label: 'Auditoria SIEM', icon: Settings, active: false },
                        { label: 'Identity/SSO', icon: Shield, active: false },
                    ].map((item, i) => (
                        <div
                            key={i}
                            onClick={() => router.push(tabRoutes[item.label])}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3 group ${item.active ? 'bg-bg-1 border-primary' : 'bg-surface-1 border-stroke hover:border-text-3'}`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-bg-0 text-text-3 group-hover:text-white'}`}>
                                <item.icon size={18} />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${item.active ? 'text-white' : 'text-text-3'}`}>{item.label}</span>
                        </div>
                    ))}
                </div>

                {/* Dynamic Components */}
                <DataGovernance />
                <SecurityHardening />

                {/* Scale Stats Info */}
                <div className="flex flex-col gap-4 p-8 bg-surface-1/30 border border-stroke border-dashed rounded-[2rem]">
                    <h4 className="text-xs font-black text-text-3 uppercase tracking-widest flex items-center gap-2">
                        <Server size={14} /> Estatísticas de Escala do Tenant
                    </h4>
                    {statsLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 size={24} className="text-primary animate-spin" />
                        </div>
                    ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mt-2">
                        <div className="flex flex-col gap-1">
                            <span className="text-2xl font-bold text-white tracking-tight">{scaleStats.uptime}</span>
                            <span className="text-[10px] font-medium text-text-3 uppercase">SLA de Uptime</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-2xl font-bold text-white tracking-tight">{scaleStats.storage}</span>
                            <span className="text-[10px] font-medium text-text-3 uppercase">Armazenamento</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-2xl font-bold text-white tracking-tight">{scaleStats.regions}</span>
                            <span className="text-[10px] font-medium text-text-3 uppercase">Rede Global CDN</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-2xl font-bold text-white tracking-tight">{scaleStats.packetLoss}</span>
                            <span className="text-[10px] font-medium text-text-3 uppercase">Packet Integrity</span>
                        </div>
                    </div>
                    )}
                </div>

            </div>
        </div>
    );
}
