'use client';
import React, { useEffect, useState } from 'react';
import DisasterRecoveryDash from '@/components/enterprise/DisasterRecoveryDash';
import ITPolicyManager from '@/components/enterprise/ITPolicyManager';
import { Building2, ShieldCheck, Activity, Terminal, Database, Send, Users, ChevronRight, Loader2 } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { toast } from '@/lib/toast';

type DataRegion = {
    region: string;
    usage: string;
    status: string;
};

type AuditConfig = {
    siem_url: string;
    filters: string[];
};

type TenantResidency = {
    data_regions: DataRegion[];
    audit: AuditConfig;
};

export default function EnterpriseAdminPage() {
    const [residency, setResidency] = useState<TenantResidency | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGet<TenantResidency>('/enterprise/tenants')
            .then(setResidency)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const regions = residency?.data_regions ?? [];
    const audit = residency?.audit ?? { siem_url: '---', filters: [] };

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-hidden">

            {/* Enterprise Header */}
            <div className="px-10 py-12 border-b border-stroke flex items-center justify-between bg-gradient-to-r from-bg-1 to-bg-0">
                <div className="flex items-center gap-8">
                    <div className="w-18 h-18 rounded-[2rem] bg-secondary text-white flex items-center justify-center shadow-2xl">
                        <Building2 size={36} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase tracking-widest italic flex items-center gap-4">
                            Pulse Enterprise <span className="text-[10px] bg-secondary/20 text-secondary border border-secondary/30 px-3 py-1 rounded-full not-italic tracking-normal">TI GOVERNANCE</span>
                        </h1>
                        <p className="text-text-3 font-medium text-base mt-1 italic">Controles de alta disponibilidade e conformidade em escala global.</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex items-center gap-3 px-6 py-4 bg-success/5 border border-success/10 rounded-2xl">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                        <span className="text-[10px] font-black text-success uppercase tracking-widest">Global Clusters: Optimal</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 overflow-y-auto custom-scrollbar pb-32">

                {/* Left Column: Infrastructure Health */}
                <div className="lg:col-span-12 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-secondary rounded-full"></div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Infrastructure Resilience & Disaster Recovery</h2>
                    </div>
                    <DisasterRecoveryDash />
                </div>

                {/* Bottom Left: Policy Management */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Global IT Access Policies</h2>
                    </div>
                    <ITPolicyManager />
                </div>

                {/* Bottom Right: Audit & Data Residency */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-white rounded-full"></div>
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Audit & Data Residency</h2>
                    </div>

                    <div className="bg-bg-1 border border-stroke rounded-[3rem] p-10 flex flex-col gap-8 shadow-xl relative overflow-hidden">
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-text-3 uppercase tracking-widest italic">Active Data Regions</span>
                                    <h4 className="text-lg font-black text-white uppercase italic">Residencia de Dados</h4>
                                </div>
                                <Database size={24} className="text-text-3" />
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 size={24} className="text-primary animate-spin" />
                                </div>
                            ) : regions.length === 0 ? (
                                <p className="text-sm text-text-3 text-center py-6">Nenhuma regiao de dados configurada.</p>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {regions.map((reg, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-bg-0 border border-white/5 rounded-2xl">
                                            <span className="text-[11px] font-bold text-white">{reg.region}</span>
                                            <div className="flex items-center gap-4">
                                                <span className="text-[9px] font-black text-text-3 uppercase tracking-widest">{reg.usage}</span>
                                                <div className={`w-2 h-2 rounded-full ${reg.status === 'Compliant' ? 'bg-success' : 'bg-primary'}`}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-6 pt-8 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-text-3 uppercase tracking-widest italic">Audit Streaming</span>
                                    <h4 className="text-lg font-black text-white uppercase italic">Conformidade SIEM</h4>
                                </div>
                                <Send size={24} className="text-text-3" />
                            </div>
                            <p className="text-[10px] text-text-2 leading-relaxed">
                                Transmissao ativa para: **{audit.siem_url}**.
                                Filtros ativos: {audit.filters.length > 0 ? audit.filters.join(', ') : 'Nenhum'}.
                            </p>
                            <button onClick={async () => {
                                try {
                                    await apiPost('/enterprise/audit-stream/config', { siem_url: audit.siem_url, filters: audit.filters });
                                    toast.success('Stream config atualizado com sucesso!');
                                } catch {
                                    toast.error('Erro ao atualizar stream config.');
                                }
                            }} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all">
                                UPDATE STREAM CONFIG
                            </button>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-secondary/20 to-bg-1 border border-secondary/20 rounded-[3rem] p-8 flex items-center justify-between group cursor-pointer shadow-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-secondary text-white flex items-center justify-center">
                                <Users size={24} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Access Control</span>
                                <h4 className="text-sm font-black text-white uppercase">RBAC Avancado</h4>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-white group-hover:translate-x-2 transition-transform" />
                    </div>
                </div>

            </div>

        </div>
    );
}
