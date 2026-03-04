import React from 'react';
import DevAppManager from '@/components/developer/DevAppManager';
import WebhookDebugger from '@/components/developer/WebhookDebugger';
import { Terminal, Code2, BookOpen, MessageSquare, Zap, Cpu, Server, ShieldCheck } from 'lucide-react';

export default function DeveloperPortalPage() {
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
                    <button className="flex items-center gap-4 px-8 py-5 bg-white text-black rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl shadow-white/10 hover:scale-105 transition-transform">
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
                            {[
                                { label: 'REST API v2', status: 'Operational', uptime: '99.99%' },
                                { icon: MessageSquare, label: 'WebSocket Hub', status: 'Operational', uptime: '100%' },
                                { icon: Server, label: 'Webhook Engine', status: 'Warning', uptime: '94.2%' },
                            ].map((s, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-bg-0 border border-white/5 rounded-2xl">
                                    <span className="text-[10px] font-bold text-text-2 uppercase">{s.label}</span>
                                    <span className={`text-[9px] font-black uppercase ${s.status === 'Operational' ? 'text-success' : 'text-error animate-pulse'}`}>{s.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/20 rounded-[3rem] shadow-2xl flex flex-col gap-6 relative overflow-hidden">
                        <Cpu size={140} className="absolute -bottom-10 -right-10 text-white/5 rotate-12" />
                        <div className="flex items-center gap-4 mb-2">
                            <ShieldCheck size={20} className="text-primary" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Dev Sandbox Ready</span>
                        </div>
                        <h4 className="text-xl font-black text-white tracking-widest uppercase italic leading-tight">
                            Ambiente de Testes <br /> Isolado.
                        </h4>
                        <p className="text-[11px] text-text-2 leading-relaxed">
                            Use nosso ambiente de sandbox para testar webhooks e chamadas de API sem afetar os dados de produ\u00e7\u00e3o do seu tenant.
                        </p>
                        <button className="mt-4 w-full py-4 bg-primary text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                            ATIVAR MODO SANDBOX
                        </button>
                    </div>

                    <div className="p-8 bg-bg-1 border border-stroke rounded-[3rem] flex flex-col gap-4">
                        <span className="text-[10px] font-black text-text-3 uppercase tracking-widest italic ml-2">Quick Reference</span>
                        <div className="flex flex-col gap-2">
                            <button className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors">
                                <span className="text-xs font-bold text-white">OAuth2 Flow Guide</span>
                                <Code2 size={14} className="text-text-3" />
                            </button>
                            <button className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors">
                                <span className="text-xs font-bold text-white">Rate Limits & Quotas</span>
                                <Code2 size={14} className="text-text-3" />
                            </button>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}
