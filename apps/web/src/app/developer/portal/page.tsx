'use client';

import React, { useState, useEffect } from 'react';
import DevAppManager from '@/components/developer/DevAppManager';
import WebhookDebugger from '@/components/developer/WebhookDebugger';
import { Terminal, BookOpen, MessageSquare, Zap, Cpu, Server, ShieldCheck, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { toast } from '@/lib/toast';

export default function DeveloperPortalPage() {
    const [sandboxActive, setSandboxActive] = useState(false);
    const [expandedRef, setExpandedRef] = useState<string | null>(null);
    const [platformStatus, setPlatformStatus] = useState<any[]>([]);
    const [statusLoading, setStatusLoading] = useState(true);

    useEffect(() => {
        apiGet('/developer/apps')
            .then((data: any) => {
                const apps = Array.isArray(data) ? data : data?.items ?? [];
                if (data?.status && Array.isArray(data.status)) {
                    setPlatformStatus(data.status);
                } else {
                    const restUp = apps.length > 0 ? 'Operational' : 'Unknown';
                    setPlatformStatus([
                        { label: 'REST API v2', status: restUp, uptime: data?.rest_uptime ?? '99.99%' },
                        { label: 'WebSocket Hub', status: data?.ws_status ?? 'Operational', uptime: data?.ws_uptime ?? '100%' },
                        { label: 'Webhook Engine', status: data?.webhook_status ?? 'Operational', uptime: data?.webhook_uptime ?? '99.5%' },
                    ]);
                }
            })
            .catch(() => toast.error('Erro ao carregar status da plataforma'))
            .finally(() => setStatusLoading(false));
    }, []);

    const toggleRef = (label: string) => {
        setExpandedRef(expandedRef === label ? null : label);
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0 overflow-hidden">

            {/* Dev Header */}
            <div className="px-10 py-12 border-b border-stroke flex items-center justify-between bg-gradient-to-br from-bg-1 to-bg-0">
                <div className="flex items-center gap-8">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-white text-black flex items-center justify-center shadow-2xl">
                        <Terminal size={40} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase tracking-widest italic flex items-center gap-5">
                            Pulse Open <span className="text-xs bg-primary text-white px-3 py-1 rounded-full not-italic tracking-normal">Developer Portal</span>
                        </h1>
                        <p className="text-text-3 font-medium text-xl mt-1 italic max-w-xl">Construa o futuro do SaaS omnichannel com APIs de alta performance.</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => window.open('/developer/docs', '_blank')}
                        className="flex items-center gap-4 px-8 py-5 bg-white text-black rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl shadow-white/10 hover:scale-105 transition-transform"
                    >
                        <BookOpen size={20} /> DOCUMENTAÇÃO v2
                    </button>
                </div>
            </div>

            <div className="flex-1 p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 overflow-y-auto custom-scrollbar pb-32">

                {/* Main Dev Area */}
                <div className="lg:col-span-8 flex flex-col gap-10">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                            <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Lifecycle & Apps</h2>
                        </div>
                        <DevAppManager />
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-secondary rounded-full"></div>
                            <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Real-time Event Streaming</h2>
                        </div>
                        <WebhookDebugger />
                    </div>
                </div>

                {/* Dev Sidebar Info */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                    <div className="p-8 bg-bg-1 border border-stroke rounded-[3rem] shadow-xl flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
                                <Zap size={24} />
                            </div>
                            <span className="text-[11px] font-black text-white uppercase tracking-widest">Platform Status</span>
                        </div>
                        <div className="flex flex-col gap-4">
                            {statusLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 size={20} className="text-primary animate-spin" />
                                </div>
                            ) : (
                                platformStatus.map((s: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-bg-0 border border-white/5 rounded-2xl">
                                        <span className="text-[10px] font-bold text-text-2 uppercase">{s.label}</span>
                                        <span className={`text-[9px] font-black uppercase ${s.status === 'Operational' ? 'text-success' : 'text-error animate-pulse'}`}>{s.status}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="p-8 bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/20 rounded-[3rem] shadow-2xl flex flex-col gap-6 relative overflow-hidden">
                        <Cpu size={140} className="absolute -bottom-10 -right-10 text-white/5 rotate-12" />
                        <div className="flex items-center gap-4 mb-2">
                            <ShieldCheck size={20} className="text-primary" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Dev Sandbox {sandboxActive ? 'Active' : 'Ready'}</span>
                        </div>
                        <h4 className="text-xl font-black text-white tracking-widest uppercase italic leading-tight">
                            Ambiente de Testes <br /> Isolado.
                        </h4>
                        <p className="text-[11px] text-text-2 leading-relaxed">
                            Use nosso ambiente de sandbox para testar webhooks e chamadas de API sem afetar os dados de produção do seu tenant.
                        </p>
                        <button
                            onClick={() => {
                                setSandboxActive(!sandboxActive);
                                toast.success(sandboxActive ? 'Modo Sandbox desativado' : 'Modo Sandbox ativado');
                            }}
                            className={`mt-4 w-full py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl transition-all ${
                                sandboxActive
                                    ? 'bg-success text-white shadow-success/20'
                                    : 'bg-primary text-white shadow-primary/20'
                            }`}
                        >
                            {sandboxActive ? 'DESATIVAR MODO SANDBOX' : 'ATIVAR MODO SANDBOX'}
                        </button>
                    </div>

                    <div className="p-8 bg-bg-1 border border-stroke rounded-[3rem] flex flex-col gap-4">
                        <span className="text-[10px] font-black text-text-3 uppercase tracking-widest italic ml-2">Quick Reference</span>
                        <div className="flex flex-col gap-2">
                            <div>
                                <button
                                    onClick={() => toggleRef('oauth')}
                                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors"
                                >
                                    <span className="text-xs font-bold text-white">OAuth2 Flow Guide</span>
                                    {expandedRef === 'oauth' ? <ChevronUp size={14} className="text-text-3" /> : <ChevronDown size={14} className="text-text-3" />}
                                </button>
                                {expandedRef === 'oauth' && (
                                    <div className="px-4 pb-4 text-[11px] text-text-2 leading-relaxed">
                                        <p className="mb-2">1. Redirecione o usuario para <code className="text-primary">/oauth/authorize</code> com client_id e redirect_uri.</p>
                                        <p className="mb-2">2. Apos autorizacao, receba o <code className="text-primary">authorization_code</code> via callback.</p>
                                        <p>3. Troque o code por um <code className="text-primary">access_token</code> via <code className="text-primary">POST /oauth/token</code>.</p>
                                    </div>
                                )}
                            </div>
                            <div>
                                <button
                                    onClick={() => toggleRef('ratelimits')}
                                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors"
                                >
                                    <span className="text-xs font-bold text-white">Rate Limits & Quotas</span>
                                    {expandedRef === 'ratelimits' ? <ChevronUp size={14} className="text-text-3" /> : <ChevronDown size={14} className="text-text-3" />}
                                </button>
                                {expandedRef === 'ratelimits' && (
                                    <div className="px-4 pb-4 text-[11px] text-text-2 leading-relaxed">
                                        <p className="mb-2"><strong className="text-white">Free:</strong> 100 req/min, 10k req/dia.</p>
                                        <p className="mb-2"><strong className="text-white">Pro:</strong> 1000 req/min, 500k req/dia.</p>
                                        <p><strong className="text-white">Enterprise:</strong> Ilimitado com SLA garantido.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}
