"use client";
import React, { useState } from 'react';
import { LayoutGrid, Puzzle, ExternalLink, Download, ShieldCheck, Box, Search, Filter, Star, Info, CheckCircle2 } from 'lucide-react';

const categories = ['Todos', 'AI & Pulse', 'Messaging', 'CRM', 'Support', 'Developer'];

const apps = [
    { id: 'app_1', name: 'WhatsApp Business Pro', developer: 'Meta', category: 'Messaging', installs: '1.2k', rating: 4.8, description: 'Integração oficial com API de nuvem da Meta.', isOfficial: true, icon: 'WA' },
    { id: 'app_2', name: 'Slack Connect', developer: 'Slack', category: 'Collaboration', installs: '850', rating: 4.5, description: 'Transfira tickets do Suporte direto para canais do Slack.', isOfficial: false, icon: 'SL' },
    { id: 'app_3', name: 'Pulse Turbo Writer', developer: 'Pulse Corp', category: 'AI & Pulse', installs: '3.4k', rating: 4.9, description: 'Geração de conteúdo em massa com a nova API Pulse AI.', isOfficial: true, icon: 'PT' },
    { id: 'app_4', name: 'Stripe Billing Connect', developer: 'Stripe', category: 'Payments', installs: '2.1k', rating: 4.7, description: 'Sincronize assinaturas e faturas com o Pulse Billing.', isOfficial: true, icon: 'ST' },
    { id: 'app_5', name: 'Google Sheets Export', developer: 'DevCommunity', category: 'Developer', installs: '500', rating: 4.2, description: 'Exportação programada de dados para planilhas.', isOfficial: false, icon: 'GS' },
    { id: 'app_6', name: 'Zendesk Bridge', developer: 'HelpDesk Inc', category: 'Support', installs: '150', rating: 4.0, description: 'Migração bidirecional de dados entre plataformas.', isOfficial: false, icon: 'ZD' },
];

export default function MarketplaceDirectory() {
    const [selectedCategory, setSelectedCategory] = useState('Todos');

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-0">
            <div className="p-8 max-w-7xl mx-auto w-full flex flex-col gap-10">

                {/* Hero Section */}
                <div className="flex flex-col gap-4 relative overflow-hidden p-10 rounded-[2rem] bg-gradient-to-br from-primary/10 via-bg-1 to-ai-accent/10 border border-stroke">
                    <div className="relative z-10">
                        <span className="text-primary font-bold text-[10px] uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Pulse Ecosystem</span>
                        <h2 className="text-4xl font-bold text-white mt-4 mb-2 tracking-tight">Potencialize seu Negócio com <span className="text-ai-accent">Apps Pulse</span>.</h2>
                        <p className="text-text-3 max-w-xl text-lg">Descubra extensões poderosas criadas pela comunidade e pelos nossos parceiros oficiais para turbinar seu fluxo de trabalho.</p>
                    </div>
                    <div className="absolute right-0 top-0 w-1/3 h-full opacity-20 pointer-events-none grayscale opacity-50">
                        <Puzzle className="w-64 h-64 -rotate-12 translate-x-1/2 -translate-y-10 text-primary" />
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${selectedCategory === cat
                                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                        : 'bg-bg-1 border-stroke text-text-3 hover:border-text-3'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3" size={14} />
                            <input type="text" placeholder="Buscar apps e integrações..." className="bg-bg-1 border border-stroke rounded-xl pl-10 pr-4 py-2 text-xs text-white w-64 focus:border-primary focus:outline-none transition-all" />
                        </div>
                    </div>
                </div>

                {/* Apps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {apps.map((app) => (
                        <div key={app.id} className="bg-bg-1 border border-stroke rounded-[1.5rem] p-6 hover:border-primary/50 transition-all group flex flex-col gap-4 relative shadow-xl hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-stroke flex items-center justify-center text-xl font-bold text-white shadow-inner group-hover:scale-105 transition-transform">
                                    {app.icon}
                                </div>
                                {app.isOfficial && (
                                    <div className="flex items-center gap-1.5 bg-success/10 px-2 py-1 rounded-lg border border-success/20">
                                        <ShieldCheck size={12} className="text-success" />
                                        <span className="text-[9px] font-black text-success uppercase">Oficial</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-1">
                                <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{app.name}</h3>
                                <span className="text-[10px] text-text-3">Desenvolvido por <span className="text-primary font-bold">{app.developer}</span></span>
                            </div>

                            <p className="text-xs text-text-3 leading-relaxed h-10 line-clamp-2">{app.description}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-stroke mt-2">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                        <Star size={12} className="text-warning fill-warning" />
                                        <span className="text-[10px] font-bold text-white">{app.rating}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Download size={12} className="text-text-3" />
                                        <span className="text-[10px] font-bold text-text-3">{app.installs}</span>
                                    </div>
                                </div>
                                <button className="bg-surface-2 hover:bg-primary px-3 py-1.5 rounded-lg text-white text-[10px] font-black transition-all border border-stroke hover:border-primary uppercase tracking-tighter">
                                    Ver no Marketplace
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Banner */}
                <div className="bg-surface-1/30 border border-stroke border-dashed p-8 rounded-[1.5rem] flex items-center justify-between mt-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[1.25rem] bg-bg-0 flex items-center justify-center border border-stroke border-dashed group hover:border-primary transition-all">
                            <Plus size={32} className="text-text-3 group-hover:text-primary" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h4 className="text-lg font-bold text-white">Desenvolvedor? Construa no Pulse.</h4>
                            <p className="text-sm text-text-3 tracking-tight">Crie aplicativos personalizados e publique-os para todos os usuários do Pulse.</p>
                        </div>
                    </div>
                    <button className="px-6 py-3 border border-stroke rounded-xl text-xs font-bold text-white hover:bg-white hover:text-bg-0 transition-all uppercase tracking-widest">
                        Acessar Portal Dev
                    </button>
                </div>
            </div>
        </div>
    );
}

function Plus(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    );
}
